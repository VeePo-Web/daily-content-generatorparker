import { useState, useCallback, useRef, useMemo } from 'react';
import { useQuickAdd, ProductForQuickAdd } from './useQuickAdd';
import { useCart } from './useCart';
import { triggerHapticFeedback, productIdToCartId } from '@/lib/cartUtils';

export interface SwipeLookProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  position: string | null;
  product_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

export interface SwipeAction {
  type: 'add' | 'skip';
  product: SwipeLookProduct;
  size?: string;
  timestamp: number;
}

export interface SwipeSessionState {
  // Session context
  lookId: string;
  lookName: string;
  products: SwipeLookProduct[];
  
  // Current state
  currentIndex: number;
  currentProduct: SwipeLookProduct | null;
  
  // Tracking
  addedProducts: SwipeLookProduct[];
  skippedProducts: SwipeLookProduct[];
  history: SwipeAction[];
  
  // Progress
  totalValue: number;
  itemCount: number;
  isComplete: boolean;
  progress: number; // 0-100
  
  // Actions
  handleSwipeRight: (size?: string) => void;
  handleSwipeLeft: () => void;
  undoLastSwipe: () => boolean;
  reset: () => void;
  
  // Quick add integration for current product
  quickAdd: ReturnType<typeof useQuickAdd> | null;
}

export function useSwipeSession(
  lookId: string,
  lookName: string,
  products: SwipeLookProduct[]
): SwipeSessionState {
  const { addItem, items } = useCart();
  const sessionStartTime = useRef(Date.now());
  
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addedProducts, setAddedProducts] = useState<SwipeLookProduct[]>([]);
  const [skippedProducts, setSkippedProducts] = useState<SwipeLookProduct[]>([]);
  const [history, setHistory] = useState<SwipeAction[]>([]);
  
  // Current product
  const currentProduct = products[currentIndex] || null;
  
  // Convert to QuickAdd format for the current product
  const quickAddProduct: ProductForQuickAdd | null = currentProduct ? {
    id: currentProduct.id,
    name: currentProduct.name,
    slug: currentProduct.slug,
    price: currentProduct.price,
    sale_price: currentProduct.sale_price,
    is_on_sale: currentProduct.is_on_sale,
    position: currentProduct.position,
    product_images: currentProduct.product_images,
    product_variants: [],
  } : null;
  
  // Use quick add for size memory integration
  const quickAdd = useQuickAdd(quickAddProduct!, {
    categoryOverride: currentProduct?.position || undefined,
  });
  
  // Calculate totals
  const totalValue = useMemo(() => 
    addedProducts.reduce((sum, p) => 
      sum + (p.is_on_sale && p.sale_price ? p.sale_price : p.price), 0
    ),
    [addedProducts]
  );
  
  const isComplete = currentIndex >= products.length;
  const progress = products.length > 0 ? (currentIndex / products.length) * 100 : 0;
  
  // Swipe right = add to bag
  const handleSwipeRight = useCallback((size?: string) => {
    if (!currentProduct) return;
    
    const selectedSize = size || quickAdd.rememberedSize || 'M';
    const primaryImage = currentProduct.product_images?.find(img => img.is_primary) 
      || currentProduct.product_images?.[0];
    const price = currentProduct.is_on_sale && currentProduct.sale_price 
      ? currentProduct.sale_price 
      : currentProduct.price;
    
    // Add to cart
    addItem({
      id: productIdToCartId(currentProduct.id),
      name: currentProduct.name,
      price: price,
      priceFormatted: `$${price}`,
      image: primaryImage?.image_url || '',
      category: currentProduct.position || 'Lookbook',
      size: selectedSize,
      lookId: lookId,
      lookName: lookName,
      productId: currentProduct.id,
    });
    
    // Track action
    const action: SwipeAction = {
      type: 'add',
      product: currentProduct,
      size: selectedSize,
      timestamp: Date.now(),
    };
    
    setAddedProducts(prev => [...prev, currentProduct]);
    setHistory(prev => [...prev, action]);
    setCurrentIndex(prev => prev + 1);
    
    // Strong haptic on add
    triggerHapticFeedback();
  }, [currentProduct, quickAdd.rememberedSize, addItem, lookId, lookName]);
  
  // Swipe left = skip
  const handleSwipeLeft = useCallback(() => {
    if (!currentProduct) return;
    
    const action: SwipeAction = {
      type: 'skip',
      product: currentProduct,
      timestamp: Date.now(),
    };
    
    setSkippedProducts(prev => [...prev, currentProduct]);
    setHistory(prev => [...prev, action]);
    setCurrentIndex(prev => prev + 1);
    
    // No haptic on skip - intentionally silent
  }, [currentProduct]);
  
  // Undo last swipe
  const undoLastSwipe = useCallback(() => {
    if (history.length === 0) return false;
    
    const lastAction = history[history.length - 1];
    
    if (lastAction.type === 'add') {
      setAddedProducts(prev => prev.filter(p => p.id !== lastAction.product.id));
      // Note: We'd need to remove from cart too - handled by cart context
    } else {
      setSkippedProducts(prev => prev.filter(p => p.id !== lastAction.product.id));
    }
    
    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(prev => Math.max(0, prev - 1));
    
    // Double tap haptic for undo
    triggerHapticFeedback();
    setTimeout(() => triggerHapticFeedback(), 100);
    
    return true;
  }, [history]);
  
  // Reset session
  const reset = useCallback(() => {
    setCurrentIndex(0);
    setAddedProducts([]);
    setSkippedProducts([]);
    setHistory([]);
    sessionStartTime.current = Date.now();
  }, []);
  
  return {
    lookId,
    lookName,
    products,
    currentIndex,
    currentProduct,
    addedProducts,
    skippedProducts,
    history,
    totalValue,
    itemCount: addedProducts.length,
    isComplete,
    progress,
    handleSwipeRight,
    handleSwipeLeft,
    undoLastSwipe,
    reset,
    quickAdd: currentProduct ? quickAdd : null,
  };
}
