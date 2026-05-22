import { Minus, Plus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CartQuantityBadgeProps {
  productId: string;
  productName: string;
  size?: string | null;
  color?: string | null;
  className?: string;
  variant?: 'badge' | 'controls';
}

/**
 * Shows cart quantity for a product on product cards.
 * - 'badge' variant: Shows a small quantity indicator
 * - 'controls' variant: Shows +/- controls for quick quantity adjustment
 */
const CartQuantityBadge = ({
  productId,
  productName,
  size,
  color,
  className,
  variant = 'badge',
}: CartQuantityBadgeProps) => {
  const { items, updateQuantity, removeItem } = useCart();
  const prefersReducedMotion = useReducedMotion();

  // Find matching items in cart (match by product ID and optionally size/color)
  const matchingItems = items.filter(item => {
    // Simple ID matching - productIdToCartId creates numeric IDs from UUIDs
    // We need to check if any cart item matches this product
    const productHex = productId.replace(/-/g, '').slice(0, 8);
    const cartItemId = parseInt(productHex, 16);
    
    const idMatches = item.id === cartItemId;
    
    // If size/color specified, match those too
    if (size && color) {
      return idMatches && item.size === size && item.color === color;
    }
    if (size) {
      return idMatches && item.size === size;
    }
    
    return idMatches;
  });

  // Total quantity across all matching variants
  const totalQuantity = matchingItems.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity === 0) {
    return null;
  }

  // Badge variant - simple indicator
  if (variant === 'badge') {
    return (
      <AnimatePresence>
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
          className={cn(
            "absolute top-3 left-3 z-10",
            "flex items-center gap-1 px-2 py-1",
            "bg-foreground text-background text-[10px] font-medium",
            "shadow-sm",
            className
          )}
        >
          <ShoppingBag className="h-3 w-3" />
          <span>{totalQuantity} in bag</span>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Controls variant - with +/- buttons
  const firstItem = matchingItems[0];
  if (!firstItem) return null;

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (firstItem.quantity <= 1) {
      removeItem(firstItem.id);
    } else {
      updateQuantity(firstItem.id, firstItem.quantity - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(firstItem.id, firstItem.quantity + 1);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        className={cn(
          "absolute bottom-3 left-3 right-3 z-10",
          "flex items-center justify-between",
          "bg-foreground/95 backdrop-blur-sm",
          "p-1.5 md:p-1",
          className
        )}
        onClick={(e) => e.preventDefault()}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDecrement}
          className="h-9 w-9 md:h-7 md:w-7 p-0 text-background hover:bg-background/20"
        >
          <Minus className="h-4 w-4 md:h-3 md:w-3" />
        </Button>
        
        <span className="text-background text-xs font-medium">
          {totalQuantity} in bag
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleIncrement}
          className="h-9 w-9 md:h-7 md:w-7 p-0 text-background hover:bg-background/20"
        >
          <Plus className="h-4 w-4 md:h-3 md:w-3" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default CartQuantityBadge;
