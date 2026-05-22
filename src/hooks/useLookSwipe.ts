import { useState, useCallback, useMemo, useEffect } from 'react';
import { useCart } from './useCart';
import { useSizeMemory } from './useSizeMemory';
import { productIdToCartId, triggerHapticFeedback } from '@/lib/cartUtils';

const SWIPE_HINT_KEY = 'lookbook-swipe-hint-shown';

export interface LookSwipeProduct {
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

interface UseLookSwipeOptions {
  lookId: string;
  lookName: string;
  products: LookSwipeProduct[];
}

interface UseLookSwipeReturn {
  // State
  isAdding: boolean;
  showSuccess: boolean;
  showSizePicker: boolean;
  showHint: boolean;
  
  // Size memory
  rememberedSize: string | null;
  hasRememberedSize: boolean;
  
  // Actions
  handleSwipeComplete: (direction: 'left' | 'right') => void;
  handleSizeSelect: (size: string) => void;
  dismissSuccess: () => void;
  dismissHint: () => void;
  reset: () => void;
  
  // Cart info
  itemsAdded: number;
  totalValue: number;
  bundleDiscountPercent: number;
  alreadyInCart: boolean;
}

export function useLookSwipe({
  lookId,
  lookName,
  products,
}: UseLookSwipeOptions): UseLookSwipeReturn {
  const { addItem, items } = useCart();
  const { getRememberedSize, rememberSize } = useSizeMemory();
  
  // State
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [itemsAddedCount, setItemsAddedCount] = useState(0);
  
  // Get the remembered size for tops (most common in lookbook)
  const rememberedSize = useMemo(() => {
    // Check if any product has a position
    for (const product of products) {
      if (product.position) {
        const size = getRememberedSize(product.position);
        if (size) return size;
      }
    }
    // Fallback to tops
    return getRememberedSize('tops');
  }, [products, getRememberedSize]);
  
  const hasRememberedSize = !!rememberedSize;
  
  // Check if all products are already in cart
  const alreadyInCart = useMemo(() => {
    return products.every(product => {
      const cartId = productIdToCartId(product.id);
      return items.some(item => item.id === cartId);
    });
  }, [products, items]);
  
  // Calculate total value
  const totalValue = useMemo(() => {
    return products.reduce((sum, p) => 
      sum + (p.is_on_sale && p.sale_price ? p.sale_price : p.price), 0
    );
  }, [products]);
  
  // Calculate bundle discount (simple tier-based)
  const bundleDiscountPercent = useMemo(() => {
    return products.length >= 4 ? 15 : products.length >= 2 ? 10 : 0;
  }, [products.length]);
  
  // Check for swipe hint on mount
  useEffect(() => {
    try {
      const hintShown = localStorage.getItem(SWIPE_HINT_KEY);
      if (!hintShown) {
        setShowHint(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);
  
  // Add all products to cart
  const addLookToCart = useCallback((size: string) => {
    setIsAdding(true);
    let addedCount = 0;
    
    products.forEach(product => {
      const cartId = productIdToCartId(product.id);
      // Skip if already in cart
      if (items.some(item => item.id === cartId)) return;
      
      const primaryImage = product.product_images?.find(img => img.is_primary) 
        || product.product_images?.[0];
      const price = product.is_on_sale && product.sale_price 
        ? product.sale_price 
        : product.price;
      
      addItem({
        id: cartId,
        name: product.name,
        price: price,
        priceFormatted: `$${price}`,
        image: primaryImage?.image_url || '',
        category: product.position || 'Lookbook',
        size: size,
        lookId: lookId,
        lookName: lookName,
        productId: product.id,
      });
      
      addedCount++;
    });
    
    setItemsAddedCount(addedCount);
    setIsAdding(false);
    
    // Show success overlay
    setShowSuccess(true);
    
    // Strong haptic celebration
    triggerHapticFeedback();
    setTimeout(() => triggerHapticFeedback(), 100);
    
    // Auto-dismiss after 2s
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  }, [products, items, addItem, lookId, lookName]);
  
  // Handle swipe completion
  const handleSwipeComplete = useCallback((direction: 'left' | 'right') => {
    // Dismiss hint on any swipe
    if (showHint) {
      setShowHint(false);
      try {
        localStorage.setItem(SWIPE_HINT_KEY, 'true');
      } catch {
        // Ignore localStorage errors
      }
    }
    
    // Skip = no action (left swipe)
    if (direction === 'left') {
      // Light skip haptic
      if (navigator.vibrate) {
        navigator.vibrate(5);
      }
      return;
    }
    
    // If already in cart, just show confirmation
    if (alreadyInCart) {
      setShowSuccess(true);
      setItemsAddedCount(0);
      triggerHapticFeedback();
      setTimeout(() => setShowSuccess(false), 1500);
      return;
    }
    
    // If no remembered size, show size picker
    if (!hasRememberedSize) {
      setShowSizePicker(true);
      return;
    }
    
    // Add to cart with remembered size
    addLookToCart(rememberedSize!);
  }, [showHint, alreadyInCart, hasRememberedSize, rememberedSize, addLookToCart]);
  
  // Handle size selection from picker
  const handleSizeSelect = useCallback((size: string) => {
    // Save to size memory for tops (most common)
    rememberSize('tops', size);
    
    // Close picker and add to cart
    setShowSizePicker(false);
    addLookToCart(size);
  }, [rememberSize, addLookToCart]);
  
  // Dismiss success overlay
  const dismissSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);
  
  // Dismiss hint
  const dismissHint = useCallback(() => {
    setShowHint(false);
    try {
      localStorage.setItem(SWIPE_HINT_KEY, 'true');
    } catch {
      // Ignore localStorage errors
    }
  }, []);
  
  // Reset state
  const reset = useCallback(() => {
    setIsAdding(false);
    setShowSuccess(false);
    setShowSizePicker(false);
    setItemsAddedCount(0);
  }, []);
  
  return {
    isAdding,
    showSuccess,
    showSizePicker,
    showHint,
    rememberedSize,
    hasRememberedSize,
    handleSwipeComplete,
    handleSizeSelect,
    dismissSuccess,
    dismissHint,
    reset,
    itemsAdded: itemsAddedCount,
    totalValue,
    bundleDiscountPercent,
    alreadyInCart,
  };
}

export default useLookSwipe;
