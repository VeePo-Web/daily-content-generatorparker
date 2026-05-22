import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";
import { useCart } from "@/hooks/useCart";
import { useSizeMemory } from "@/hooks/useSizeMemory";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { productIdToCartId, triggerHapticFeedback, formatPrice, findNearestSize } from "@/lib/cartUtils";
import { cn } from "@/lib/utils";

export interface MissingProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  imageUrl: string;
  position?: string | null;
  variants: Array<{ id: string; size: string | null; stock: number }>;
}

interface MissingProductCardProps {
  product: MissingProduct;
  lookId: string;
  lookName: string;
  onAdd?: () => void;
}

type CardState = 'idle' | 'selecting' | 'adding' | 'added';

/**
 * Compact card for displaying and quick-adding missing lookbook items
 * directly from the cart drawer. Integrates with size memory for one-tap adds.
 */
const MissingProductCard = ({ 
  product, 
  lookId, 
  lookName,
  onAdd 
}: MissingProductCardProps) => {
  const { addItem } = useCart();
  const { getRememberedSize, rememberSize } = useSizeMemory();
  const prefersReducedMotion = useReducedMotion();
  
  const [state, setState] = useState<CardState>('idle');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // Get in-stock variants
  const inStockVariants = useMemo(() => {
    return product.variants.filter(v => v.stock > 0 && v.size);
  }, [product.variants]);

  const availableSizes = useMemo(() => {
    return inStockVariants.map(v => v.size!).filter(Boolean);
  }, [inStockVariants]);

  // Determine the category for size memory based on position
  const categorySlug = useMemo(() => {
    if (product.position) {
      const pos = product.position.toLowerCase();
      if (['top', 'tops'].includes(pos)) return 'tops';
      if (['bottom', 'bottoms'].includes(pos)) return 'bottoms';
      if (['hat', 'hats', 'headwear'].includes(pos)) return 'hats';
    }
    return 'tops'; // Default fallback
  }, [product.position]);

  // Get remembered size for this category
  const rememberedSize = useMemo(() => {
    return getRememberedSize(categorySlug);
  }, [getRememberedSize, categorySlug]);

  // Check if remembered size is in stock
  const rememberedInStock = useMemo(() => {
    return rememberedSize && availableSizes.includes(rememberedSize);
  }, [rememberedSize, availableSizes]);

  // Find nearest available size if remembered is OOS
  const fallbackSize = useMemo(() => {
    if (!rememberedSize || rememberedInStock) return null;
    return findNearestSize(rememberedSize, availableSizes);
  }, [rememberedSize, rememberedInStock, availableSizes]);

  // Auto-select size based on memory or single option
  useEffect(() => {
    if (rememberedInStock && rememberedSize) {
      setSelectedSize(rememberedSize);
    } else if (availableSizes.length === 1) {
      setSelectedSize(availableSizes[0]);
    } else if (fallbackSize) {
      setSelectedSize(fallbackSize);
    }
  }, [rememberedSize, rememberedInStock, availableSizes, fallbackSize]);

  // Can we do one-tap add?
  const canOneTap = selectedSize !== null;

  // Get stock for a specific size
  const getStockForSize = useCallback((size: string): number => {
    const variant = inStockVariants.find(v => v.size === size);
    return variant?.stock ?? 0;
  }, [inStockVariants]);

  // Get display price
  const displayPrice = product.salePrice ?? product.price;

  // Handle adding to cart
  const handleAdd = useCallback(() => {
    if (!selectedSize || state === 'adding' || state === 'added') return;

    setState('adding');
    triggerHapticFeedback();

    // Slight delay for animation feedback
    setTimeout(() => {
      addItem({
        id: productIdToCartId(product.id),
        name: product.name,
        price: displayPrice,
        priceFormatted: formatPrice(displayPrice),
        image: product.imageUrl,
        category: 'Lookbook',
        size: selectedSize,
        lookId,
        lookName,
        productId: product.id,
      });

      // Remember the size for future
      rememberSize(categorySlug, selectedSize);

      setState('added');
      setShowPicker(false);
      onAdd?.();

      // Reset after animation
      setTimeout(() => {
        setState('idle');
      }, 2000);
    }, 150);
  }, [selectedSize, state, product, displayPrice, lookId, lookName, addItem, rememberSize, categorySlug, onAdd]);

  // Handle size selection from picker
  const handleSizeSelect = useCallback((size: string) => {
    setSelectedSize(size);
    setShowPicker(false);
    
    // Auto-add after selection
    setTimeout(() => {
      setState('adding');
      triggerHapticFeedback();

      setTimeout(() => {
        addItem({
          id: productIdToCartId(product.id),
          name: product.name,
          price: displayPrice,
          priceFormatted: formatPrice(displayPrice),
          image: product.imageUrl,
          category: 'Lookbook',
          size,
          lookId,
          lookName,
          productId: product.id,
        });

        rememberSize(categorySlug, size);
        setState('added');
        onAdd?.();

        setTimeout(() => {
          setState('idle');
        }, 2000);
      }, 150);
    }, 50);
  }, [product, displayPrice, lookId, lookName, addItem, rememberSize, categorySlug, onAdd]);

  // Check if item is low stock
  const isLowStock = useMemo(() => {
    if (!selectedSize) return false;
    const stock = getStockForSize(selectedSize);
    return stock > 0 && stock <= 3;
  }, [selectedSize, getStockForSize]);

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-2.5 p-2 bg-muted/30 rounded-none border border-border/50"
    >
      {/* Thumbnail */}
      <div className="relative w-10 h-10 flex-shrink-0 rounded-none overflow-hidden bg-muted">
        <img 
          src={product.imageUrl || '/placeholder.svg'} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {isLowStock && (
          <div className="absolute bottom-0 left-0 right-0 bg-champagne-500/90 text-[8px] text-white text-center py-0.5 font-medium">
            Low Stock
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate leading-tight">
          {product.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-muted-foreground">
            {formatPrice(displayPrice)}
          </span>
          {selectedSize && rememberedInStock && (
            <span className="text-[9px] text-champagne-600 dark:text-champagne-400">
              • Size {selectedSize}
            </span>
          )}
        </div>
      </div>
      
      {/* Action Button */}
      <div className="flex-shrink-0 relative">
        <AnimatePresence mode="wait">
          {state === 'added' ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-7 h-7 flex items-center justify-center"
            >
              <DrawCheckIcon 
                size="xs" 
                variant="circle-check"
                filled
                className="text-foreground" 
              />
            </motion.div>
          ) : state === 'adding' ? (
            <motion.div
              key="loading"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-7 h-7 flex items-center justify-center"
            >
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </motion.div>
          ) : canOneTap ? (
            <motion.div
              key="add-button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Button 
                size="icon" 
                variant="outline" 
                className="w-7 h-7 rounded-full hover:bg-foreground/5 hover:border-foreground/30 hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAdd();
                }}
                aria-label={`Add ${product.name} in size ${selectedSize}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="select-size"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 px-2 text-xs gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPicker(!showPicker);
                }}
                aria-label="Select size"
              >
                Size
                <ChevronDown className={cn(
                  "w-3 h-3 transition-transform",
                  showPicker && "rotate-180"
                )} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Size Picker Dropdown */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 z-50 bg-background border border-border rounded-none shadow-md p-2 min-w-[120px]"
            >
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground mb-1.5 px-1">
                Select Size
              </p>
              <div className="flex flex-wrap gap-1">
                {availableSizes.map(size => {
                  const stock = getStockForSize(size);
                  const isRemembered = size === rememberedSize;
                  const isLow = stock > 0 && stock <= 3;
                  
                  return (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSizeSelect(size);
                      }}
                      className={cn(
                        "relative min-w-[32px] h-7 px-2 text-[11px] rounded transition-colors",
                        isRemembered
                          ? "bg-champagne-500 text-white font-medium"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      )}
                      aria-label={`Size ${size}${isRemembered ? ' - Your size' : ''}`}
                    >
                      {size}
                      {isRemembered && (
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-wide text-champagne-600 bg-background px-0.5 rounded whitespace-nowrap">
                          yours
                        </span>
                      )}
                      {isLow && !isRemembered && (
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-champagne-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MissingProductCard;
