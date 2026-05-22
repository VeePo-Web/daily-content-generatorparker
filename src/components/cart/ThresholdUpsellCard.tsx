import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuickAdd, type ProductForQuickAdd } from "@/hooks/useQuickAdd";
import { AnimatePresence, motion } from "framer-motion";
import type { ThresholdProduct } from "@/hooks/useThresholdUpsells";
import { formatPrice } from "@/lib/currency";

interface ThresholdUpsellCardProps {
  product: ThresholdProduct;
  variant: 'primary' | 'compact';
  willUnlockShipping: boolean;
}

/**
 * Compact product card for threshold upsell suggestions.
 * Integrates with useQuickAdd for one-tap add-to-cart with size memory.
 */
const ThresholdUpsellCard = ({ 
  product, 
  variant, 
  willUnlockShipping 
}: ThresholdUpsellCardProps) => {
  const quickAdd = useQuickAdd(product as ProductForQuickAdd, { showToast: true });
  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
  const effectivePrice = product.is_on_sale && product.sale_price 
    ? product.sale_price 
    : product.price;

  if (variant === 'compact') {
    return (
      <div className="flex-shrink-0 w-24 flex flex-col items-center">
        {/* Compact image */}
        <div className="w-20 h-20 bg-muted/30 overflow-hidden relative mb-2">
          <img
            src={primaryImage?.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Success overlay */}
          <AnimatePresence>
            {quickAdd.isAdded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-foreground/90 flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price + name */}
        <p className="text-xs text-muted-foreground truncate w-full text-center mb-1">
          {product.name}
        </p>
        <p className="text-xs font-medium text-foreground mb-2">
          {formatPrice(effectivePrice)}
        </p>

        {/* Inline size picker */}
        <AnimatePresence>
          {quickAdd.isPickerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full overflow-hidden"
            >
              <div className="bg-muted/50 p-1.5 rounded-none text-center">
                <div className="flex flex-wrap gap-1 justify-center">
                  {quickAdd.availableSizes.map(size => {
                    const stock = quickAdd.getStockForVariant(size);
                    const isOOS = stock === 0;
                    
                    return (
                      <button
                        key={size}
                        onClick={(e) => !isOOS && quickAdd.handleSizeSelect(size, e)}
                        disabled={isOOS}
                        className={cn(
                          "min-w-[24px] h-6 px-1 text-[10px] rounded transition-colors",
                          isOOS 
                            ? "bg-muted/30 text-muted-foreground/30 cursor-not-allowed line-through"
                            : "bg-background hover:bg-muted text-foreground border border-border"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={quickAdd.hideSizePicker}
                  className="mt-1 text-[9px] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick add button */}
        {!quickAdd.isPickerOpen && (
          <Button
            size="sm"
            variant="outline"
            onClick={quickAdd.handleQuickAdd}
            disabled={quickAdd.isAdding || quickAdd.isAdded}
            className={cn(
              "rounded-none h-7 px-2 text-xs w-full transition-all",
              quickAdd.isAdded && "bg-foreground text-background border-foreground",
              quickAdd.canOneTap && !quickAdd.isAdded && "bg-champagne-500 text-white border-champagne-500 hover:bg-champagne-400"
            )}
          >
            {quickAdd.isAdding ? (
              <span className="animate-pulse">...</span>
            ) : quickAdd.isAdded ? (
              <Check className="h-3 w-3" />
            ) : (
              <>
                <Plus className="h-3 w-3 mr-0.5" />
                {quickAdd.canOneTap ? quickAdd.rememberedSize : 'Add'}
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  // Primary variant - larger card with more details
  return (
    <div className="flex gap-3 items-center">
      {/* Product image */}
      <div className="w-16 h-16 bg-muted/30 overflow-hidden flex-shrink-0 relative">
        <img
          src={primaryImage?.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Success overlay */}
        <AnimatePresence>
          {quickAdd.isAdded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-foreground/90 flex items-center justify-center"
            >
              <Check className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product details */}
      <div className="flex-1 min-w-0 relative">
        <h4 className="text-sm font-medium text-foreground truncate">{product.name}</h4>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{formatPrice(effectivePrice)}</p>
          {/* Size memory indicator */}
          {quickAdd.rememberedSize && quickAdd.stockForRemembered > 0 && (
            <span className="text-[10px] uppercase tracking-wide text-champagne-600 font-medium">
              {quickAdd.rememberedSize}
            </span>
          )}
        </div>
        
        {willUnlockShipping && (
          <p className="text-xs text-champagne-600 mt-0.5 font-medium">
            + Unlocks free shipping!
          </p>
        )}

        {/* Inline size picker */}
        <AnimatePresence>
          {quickAdd.isPickerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <div className="bg-muted/50 p-2 rounded">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-1">
                  {quickAdd.availableSizes.map(size => {
                    const stock = quickAdd.getStockForVariant(size);
                    const isOOS = stock === 0;
                    const isRemembered = size === quickAdd.rememberedSize;
                    
                    return (
                      <button
                        key={size}
                        onClick={(e) => !isOOS && quickAdd.handleSizeSelect(size, e)}
                        disabled={isOOS}
                        className={cn(
                          "min-w-[28px] h-7 px-1.5 text-xs rounded transition-colors",
                          isOOS 
                            ? "bg-muted/30 text-muted-foreground/30 cursor-not-allowed line-through"
                            : isRemembered
                              ? "bg-champagne-500 text-white font-medium"
                              : "bg-background hover:bg-muted text-foreground border border-border"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={quickAdd.hideSizePicker}
                  className="mt-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick add button */}
      {!quickAdd.isPickerOpen && (
        <Button
          size="sm"
          variant="outline"
          onClick={quickAdd.handleQuickAdd}
          disabled={quickAdd.isAdding || quickAdd.isAdded}
          className={cn(
            "rounded-none h-9 px-3 transition-all",
            quickAdd.isAdded && "bg-foreground text-background border-foreground",
            quickAdd.canOneTap && !quickAdd.isAdded && "bg-champagne-500 text-white border-champagne-500 hover:bg-champagne-400"
          )}
        >
          {quickAdd.isAdding ? (
            <span className="animate-pulse">...</span>
          ) : quickAdd.isAdded ? (
            <Check className="h-4 w-4" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              {quickAdd.canOneTap ? quickAdd.rememberedSize : 'Add'}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ThresholdUpsellCard;
