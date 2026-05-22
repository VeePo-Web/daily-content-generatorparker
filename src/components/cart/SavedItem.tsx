import { X, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SavedItem as SavedItemType } from "@/hooks/useSavedForLater";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SavedItemProps {
  item: SavedItemType;
  onMoveToCart: () => void;
  onRemove: () => void;
}

const SavedItem = ({ item, onMoveToCart, onRemove }: SavedItemProps) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(), prefersReducedMotion ? 0 : 200);
  };

  const handleMoveToCart = () => {
    setIsMoving(true);
    setTimeout(() => onMoveToCart(), prefersReducedMotion ? 0 : 150);
  };

  const displayPrice = item.product.sale_price ?? item.product.price;

  return (
    <motion.div 
      className={cn(
        "flex gap-3 py-3 transition-all duration-200",
        isRemoving && "opacity-0 -translate-x-4",
        isMoving && "opacity-0 translate-x-4 scale-95"
      )}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20, scale: 0.95 }}
      layout
    >
      {/* Thumbnail - links to PDP */}
      <Link 
        to={`/product/${item.product.slug}`}
        className="relative w-14 h-18 bg-muted/20 overflow-hidden flex-shrink-0 group"
      >
        <img
          src={item.product.image_url}
          alt={item.product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link 
            to={`/product/${item.product.slug}`}
            className="text-xs font-medium text-foreground hover:underline line-clamp-1"
          >
            {item.product.name}
          </Link>
          
          {/* Saved variant info */}
          {(item.savedSize || item.savedColor) && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {item.savedSize && <span>Size {item.savedSize}</span>}
              {item.savedSize && item.savedColor && <span> · </span>}
              {item.savedColor && <span>{item.savedColor}</span>}
              {item.savedQuantity > 1 && <span> · Qty {item.savedQuantity}</span>}
            </p>
          )}
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-medium text-foreground">
            ${displayPrice.toFixed(2)}
          </span>
          
          <div className="flex items-center gap-1">
            {/* Move to cart button */}
            <motion.button
              onClick={handleMoveToCart}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              aria-label={`Add ${item.product.name} to cart`}
            >
              <RotateCcw className="w-3 h-3" />
              Add
            </motion.button>
            
            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Remove ${item.product.name} from saved items`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SavedItem;
