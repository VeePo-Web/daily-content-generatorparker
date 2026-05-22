import { useState, useMemo, useCallback, useRef } from 'react';
import { useCart } from '@/hooks/useCart';
import { useSizeMemory } from '@/hooks/useSizeMemory';
import { useSizeQuizContextSafe } from '@/contexts/SizeQuizContext';
import { showAddedToast } from '@/lib/toastUtils';
import { toast } from 'sonner';
import { 
  productIdToCartId, 
  triggerHapticFeedback, 
  findNearestSize,
  formatPrice 
} from '@/lib/cartUtils';

/**
 * Product data structure required for quick add functionality
 */
export interface ProductForQuickAdd {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  category_slug?: string;
  position?: string | null;
  product_images?: Array<{ image_url: string; is_primary: boolean; display_order?: number }>;
  product_variants?: Array<{ 
    size: string | null; 
    color: string | null;
    stock_quantity: number;
  }>;
}

interface UseQuickAddOptions {
  /** Override the category slug for size memory lookup */
  categoryOverride?: string;
  /** Called after successful add */
  onSuccess?: (size: string, color?: string) => void;
  /** Whether to show toast notifications (default: true) */
  showToast?: boolean;
}

interface QuickAddState {
  /** Whether one-tap add is possible (has remembered size in stock) */
  canOneTap: boolean;
  /** The user's remembered size for this category */
  rememberedSize: string | null;
  /** The user's remembered color (future use) */
  rememberedColor: string | null;
  /** List of sizes that are in stock */
  availableSizes: string[];
  /** List of colors that are in stock */
  availableColors: string[];
  /** Stock quantity for the remembered size/color */
  stockForRemembered: number;
  /** Total stock across all variants */
  totalStock: number;
  /** Whether completely out of stock */
  isOutOfStock: boolean;
  /** Whether stock is low (≤3) */
  hasLowStock: boolean;
  /** Suggested fallback size if remembered is OOS */
  suggestedFallback: string | null;
  /** The display price (sale price if applicable) */
  displayPrice: number;
}

interface QuickAddActions {
  /** Add to cart - uses remembered size if available, else uses provided size */
  addToCart: (options?: { size?: string; color?: string; quantity?: number }) => void;
  /** Quick add handler - one-tap if remembered size, else opens picker */
  handleQuickAdd: (e: React.MouseEvent) => void;
  /** Handle size selection from inline picker */
  handleSizeSelect: (size: string, e?: React.MouseEvent) => void;
  /** Show the size picker */
  showSizePicker: () => void;
  /** Hide the size picker */
  hideSizePicker: () => void;
  /** Get stock for a specific size/color combination */
  getStockForVariant: (size?: string, color?: string) => number;
}

interface QuickAddFeedback {
  /** Currently adding to cart */
  isAdding: boolean;
  /** Successfully added (for animation) */
  isAdded: boolean;
  /** The size that was just added */
  addedSize: string | null;
  /** The color that was just added */
  addedColor: string | null;
  /** Whether the size picker is visible */
  isPickerOpen: boolean;
  /** Confidence percentage for remembered size */
  confidenceForRemembered: number | null;
  /** Human-readable confidence message */
  confidenceMessage: string | null;
}

export type UseQuickAddReturn = QuickAddState & QuickAddActions & QuickAddFeedback;

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];
const SUCCESS_ANIMATION_DURATION = 2000;
const ADDING_DELAY = 150;

/**
 * Universal hook for one-tap add-to-cart with size memory and stock awareness.
 * Centralizes all quick-add logic for consistent behavior across surfaces.
 * 
 * @example
 * ```tsx
 * const quickAdd = useQuickAdd(product);
 * 
 * // One-tap add button
 * <button onClick={quickAdd.handleQuickAdd}>
 *   {quickAdd.canOneTap ? `Add in ${quickAdd.rememberedSize}` : 'Add'}
 * </button>
 * 
 * // Show size picker
 * {quickAdd.isPickerOpen && (
 *   <SizePicker 
 *     sizes={quickAdd.availableSizes}
 *     onSelect={quickAdd.handleSizeSelect}
 *   />
 * )}
 * ```
 */
export function useQuickAdd(
  product: ProductForQuickAdd | null,
  options: UseQuickAddOptions = {}
): UseQuickAddReturn {
  const { categoryOverride, onSuccess, showToast = true } = options;
  
  const { addItem, items, openCart } = useCart();
  const { getRememberedSize, rememberSize, getSizeConfidence, getSizeConfidenceMessage } = useSizeMemory();
  
  // Size quiz integration for first-time users
  // Always call the hook unconditionally (React rules of hooks).
  // useSizeQuizContext throws if provider is missing, so we use the safe version.
  const sizeQuizContext = useSizeQuizContextSafe();
  
  // Track if we've already prompted for quiz this session
  const hasPromptedQuizRef = useRef(false);

  // UI state
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [addedSize, setAddedSize] = useState<string | null>(null);
  const [addedColor, setAddedColor] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Derived data from product variants
  const { availableSizes, availableColors, stockMap, totalStock } = useMemo(() => {
    if (!product?.product_variants?.length) {
      return {
        availableSizes: DEFAULT_SIZES,
        availableColors: [] as string[],
        stockMap: new Map<string, number>(),
        totalStock: 999, // Assume available if no variant data
      };
    }

    const sizesWithStock = new Set<string>();
    const colorsWithStock = new Set<string>();
    const map = new Map<string, number>();
    let total = 0;

    for (const variant of product.product_variants) {
      if (variant.stock_quantity > 0) {
        if (variant.size) sizesWithStock.add(variant.size);
        if (variant.color) colorsWithStock.add(variant.color);
        
        // Store stock by size-color key
        const key = `${variant.size || ''}-${variant.color || ''}`;
        map.set(key, (map.get(key) || 0) + variant.stock_quantity);
        total += variant.stock_quantity;
      }
    }

    return {
      availableSizes: sizesWithStock.size > 0 ? Array.from(sizesWithStock) : DEFAULT_SIZES,
      availableColors: Array.from(colorsWithStock),
      stockMap: map,
      totalStock: total,
    };
  }, [product?.product_variants]);

  // Determine category for size memory
  const categorySlug = useMemo(() => {
    if (categoryOverride) return categoryOverride;
    if (product?.category_slug) return product.category_slug;
    if (product?.position) {
      // Map position to category type
      const pos = product.position.toLowerCase();
      if (['top', 'tops'].includes(pos)) return 'tops';
      if (['bottom', 'bottoms'].includes(pos)) return 'bottoms';
      if (['hat', 'hats', 'headwear'].includes(pos)) return 'hats';
    }
    return 'tops'; // Default fallback
  }, [categoryOverride, product?.category_slug, product?.position]);

  // Size memory
  const rememberedSize = useMemo(() => {
    return getRememberedSize(categorySlug);
  }, [getRememberedSize, categorySlug]);

  // Get stock for a specific variant
  const getStockForVariant = useCallback((size?: string, color?: string): number => {
    if (stockMap.size === 0) return 999; // Assume available if no data
    
    const key = `${size || ''}-${color || ''}`;
    
    // Exact match
    if (stockMap.has(key)) return stockMap.get(key) || 0;
    
    // Size only match
    if (size && !color) {
      let total = 0;
      for (const [k, v] of stockMap) {
        if (k.startsWith(`${size}-`)) total += v;
      }
      return total;
    }
    
    // Color only match
    if (!size && color) {
      let total = 0;
      for (const [k, v] of stockMap) {
        if (k.endsWith(`-${color}`)) total += v;
      }
      return total;
    }
    
    return 0;
  }, [stockMap]);

  // Stock for remembered size
  const stockForRemembered = useMemo(() => {
    if (!rememberedSize) return 0;
    return getStockForVariant(rememberedSize);
  }, [rememberedSize, getStockForVariant]);

  // Can one-tap add
  const canOneTap = useMemo(() => {
    return !!rememberedSize && stockForRemembered > 0;
  }, [rememberedSize, stockForRemembered]);

  // Suggested fallback if remembered is OOS
  const suggestedFallback = useMemo(() => {
    if (!rememberedSize || stockForRemembered > 0) return null;
    return findNearestSize(rememberedSize, availableSizes);
  }, [rememberedSize, stockForRemembered, availableSizes]);

  // Display price
  const displayPrice = useMemo(() => {
    if (!product) return 0;
    return product.is_on_sale && product.sale_price 
      ? product.sale_price 
      : product.price;
  }, [product]);

  // Check if already in cart
  const isInCart = useMemo(() => {
    if (!product) return false;
    const cartId = productIdToCartId(product.id);
    return items.some(item => item.id === cartId);
  }, [product, items]);

  // Core add to cart function
  const addToCart = useCallback(({ 
    size, 
    color, 
    quantity = 1 
  }: { size?: string; color?: string; quantity?: number } = {}) => {
    if (!product) return;

    const sizeToUse = size || rememberedSize;
    if (!sizeToUse) {
      setIsPickerOpen(true);
      return;
    }

    setIsAdding(true);

    // Small delay for animation
    setTimeout(() => {
      const primaryImage = product.product_images?.find(img => img.is_primary) 
        || product.product_images?.[0];

      addItem({
        id: productIdToCartId(product.id),
        name: product.name,
        price: displayPrice,
        priceFormatted: formatPrice(displayPrice),
        image: primaryImage?.image_url || '/placeholder.svg',
        category: categorySlug,
        size: sizeToUse,
        color: color,
        quantity,
      });

      // Remember size for future
      rememberSize(categorySlug, sizeToUse);

      // Haptic feedback
      triggerHapticFeedback();

      setIsAdding(false);
      setIsAdded(true);
      setAddedSize(sizeToUse);
      setAddedColor(color || null);
      setIsPickerOpen(false);

      // Toast notification with product thumbnail
      if (showToast) {
        showAddedToast({
          productName: product.name,
          productImage: primaryImage?.image_url || '/placeholder.svg',
          size: sizeToUse,
          color: color,
          onViewCart: openCart,
        });
      }

      // Callback
      onSuccess?.(sizeToUse, color);

      // Clear success state after animation
      setTimeout(() => {
        setIsAdded(false);
        setAddedSize(null);
        setAddedColor(null);
      }, SUCCESS_ANIMATION_DURATION);

    }, ADDING_DELAY);
  }, [product, rememberedSize, displayPrice, categorySlug, addItem, rememberSize, showToast, onSuccess]);

  // Quick add handler - one-tap if possible, else opens picker or quiz
  const handleQuickAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product || isAdding || isAdded || isInCart) return;

    // Check if we should trigger size quiz for first-time users
    if (sizeQuizContext && !hasPromptedQuizRef.current && sizeQuizContext.shouldTriggerQuiz()) {
      hasPromptedQuizRef.current = true;
      sizeQuizContext.openQuizWithPending({
        productId: product.id,
        categorySlug: categorySlug, // Pass category for correct size resolution
        callback: (size: string, color?: string) => {
          addToCart({ size, color });
        },
      });
      return;
    }

    if (canOneTap && rememberedSize) {
      // One-tap add
      addToCart({ size: rememberedSize });
    } else if (suggestedFallback) {
      // Use fallback if remembered is OOS
      addToCart({ size: suggestedFallback });
      if (showToast) {
        toast.info(`Your size ${rememberedSize} sold out — added ${suggestedFallback} instead`);
      }
    } else if (availableSizes.length === 1) {
      // Only one size available, auto-select
      addToCart({ size: availableSizes[0] });
    } else {
      // Show size picker
      setIsPickerOpen(true);
    }
  }, [product, isAdding, isAdded, isInCart, canOneTap, rememberedSize, suggestedFallback, availableSizes, addToCart, showToast, sizeQuizContext]);

  // Handle size selection from picker
  const handleSizeSelect = useCallback((size: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addToCart({ size });
  }, [addToCart]);

  // Picker controls
  const showSizePicker = useCallback(() => setIsPickerOpen(true), []);
  const hideSizePicker = useCallback(() => setIsPickerOpen(false), []);

  // Confidence for remembered size
  const confidenceForRemembered = useMemo(() => {
    if (!rememberedSize) return null;
    return getSizeConfidence(categorySlug);
  }, [rememberedSize, getSizeConfidence, categorySlug]);

  const confidenceMessage = useMemo(() => {
    return getSizeConfidenceMessage(categorySlug);
  }, [getSizeConfidenceMessage, categorySlug]);

  return {
    // State
    canOneTap,
    rememberedSize,
    rememberedColor: null, // Future: implement color memory
    availableSizes,
    availableColors,
    stockForRemembered,
    totalStock,
    isOutOfStock: totalStock === 0,
    hasLowStock: totalStock > 0 && totalStock <= 3,
    suggestedFallback,
    displayPrice,

    // Actions
    addToCart,
    handleQuickAdd,
    handleSizeSelect,
    showSizePicker,
    hideSizePicker,
    getStockForVariant,

    // Feedback
    isAdding,
    isAdded,
    addedSize,
    addedColor,
    isPickerOpen,
    
    // Confidence
    confidenceForRemembered,
    confidenceMessage,
  };
}

export default useQuickAdd;
