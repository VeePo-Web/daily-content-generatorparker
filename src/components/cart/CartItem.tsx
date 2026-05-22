import { Minus, Plus, X, Bookmark } from "lucide-react";
import { useCart, CartItem as CartItemType } from "@/hooks/useCart";
import { useSavedForLater } from "@/hooks/useSavedForLater";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CartItemProps {
  item: CartItemType;
}

const LOW_STOCK_THRESHOLD = 5;
const CONFIRMATION_TIMEOUT = 4000; // Auto-collapse after 4 seconds

const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem, lastAddedItem } = useCart();
  const { saveForLater } = useSavedForLater();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const isJustAdded = lastAddedItem?.id === item.id;
  const isLowStock = item.stock !== undefined && item.stock <= LOW_STOCK_THRESHOLD && item.stock > 0;

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Auto-collapse confirmation after timeout
  useEffect(() => {
    if (showConfirmation) {
      timeoutRef.current = setTimeout(() => {
        setShowConfirmation(false);
      }, CONFIRMATION_TIMEOUT);
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [showConfirmation]);

  const handleRemoveClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmRemove = () => {
    setIsRemoving(true);
    setShowConfirmation(false);
    setTimeout(() => removeItem(item.id), prefersReducedMotion ? 0 : 200);
  };

  const handleSaveForLater = async () => {
    setIsSaving(true);
    setShowConfirmation(false);
    
    await saveForLater(item);
    
    // Remove from cart after saving
    setIsRemoving(true);
    setTimeout(() => removeItem(item.id), prefersReducedMotion ? 0 : 200);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleDecrease = () => {
    if (item.quantity === 1) {
      handleRemoveClick();
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div 
      className={cn(
        "relative flex gap-4 py-4 transition-all duration-200",
        isRemoving && "opacity-0 -translate-x-4",
        isJustAdded && "border-l-2 border-foreground/30"
      )}
    >
      {/* Main content */}
      <div className={cn(
        "flex gap-4 flex-1 transition-opacity duration-200",
        showConfirmation && "opacity-30 pointer-events-none"
      )}>
        {/* Thumbnail */}
        <div className="relative w-20 h-24 bg-muted/20 overflow-hidden flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Color swatch overlay if color exists */}
          {item.color && (
            <div 
              className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: item.color }}
            />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.category}</p>
              <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
              
              {/* Variant info */}
              {(item.size || item.color) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.size && item.color && <span> / </span>}
                  {item.color && <span>Color: {item.color}</span>}
                </p>
              )}
              
              {/* Low stock badge */}
              {isLowStock && (
                <p className="text-xs text-champagne-600 font-medium mt-1">
                  Only {item.stock} left
                </p>
              )}
            </div>

            {/* Remove button - triggers confirmation */}
            <button
              onClick={handleRemoveClick}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Remove item"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quantity + Price row */}
          <div className="flex items-center justify-between mt-3">
            {/* Quantity controls */}
            <div className="flex items-center border border-border">
              <button
                onClick={handleDecrease}
                className="p-2 hover:bg-muted/50 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="px-3 py-1.5 text-sm font-medium min-w-[32px] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="p-2 hover:bg-muted/50 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Price */}
            <span className="text-sm font-medium text-foreground">
              {item.priceFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation overlay */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-10"
          >
            <div className="flex flex-col items-center gap-3 p-4">
              <p className="text-xs text-muted-foreground text-center">
                Remove from cart?
              </p>
              <div className="flex gap-2">
                {/* Save for later - Primary action */}
                <motion.button
                  onClick={handleSaveForLater}
                  disabled={isSaving}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-xs font-medium uppercase tracking-wider",
                    "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                    "disabled:opacity-50"
                  )}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {isSaving ? "Saving..." : "Save for Later"}
                </motion.button>

                {/* Remove - Secondary action */}
                <motion.button
                  onClick={handleConfirmRemove}
                  className={cn(
                    "px-3 py-2 text-xs font-medium uppercase tracking-wider",
                    "border border-muted-foreground/30 text-muted-foreground",
                    "hover:border-foreground hover:text-foreground transition-colors"
                  )}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  Remove
                </motion.button>
              </div>

              {/* Cancel */}
              <button
                onClick={handleCancelConfirmation}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartItem;
