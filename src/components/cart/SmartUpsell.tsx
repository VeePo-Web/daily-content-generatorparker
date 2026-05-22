import { useThresholdUpsells } from "@/hooks/useThresholdUpsells";
import ThresholdUpsellCard from "@/components/cart/ThresholdUpsellCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Smart Threshold Upsell Component
 * 
 * Displays product suggestions that help users reach the free shipping threshold.
 * Shows a primary recommendation + horizontal-scrolling alternatives.
 * All products integrate with one-tap add using size memory.
 */
const SmartUpsell = () => {
  const { 
    primaryProduct, 
    alternatives, 
    isLoading, 
    shouldShow,
    amountToFreeShipping 
  } = useThresholdUpsells();

  // Don't render if conditions aren't met
  if (!shouldShow && !isLoading) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="px-6 py-4 border-t border-border bg-muted/20">
        <Skeleton className="h-4 w-40 mb-3" />
        <div className="flex gap-3 items-center">
          <Skeleton className="w-16 h-16" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    );
  }

  // No products available
  if (!primaryProduct && alternatives.length === 0) return null;

  return (
    <div className="border-t border-border bg-muted/20">
      {/* Header */}
      <div className="px-6 pt-4 pb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {amountToFreeShipping <= 30 
            ? "Unlock free shipping with one tap" 
            : "Complete the Look"}
        </p>
      </div>

      {/* Primary product - best match for threshold gap */}
      {primaryProduct && (
        <div className="px-6 pb-3">
          <ThresholdUpsellCard 
            product={primaryProduct}
            variant="primary"
            willUnlockShipping={primaryProduct.willUnlockShipping}
          />
        </div>
      )}

      {/* Alternative products - horizontal scroll */}
      {alternatives.length > 0 && (
        <div className="pb-4">
          <p className="px-6 text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
            Or try these:
          </p>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 px-6">
              {alternatives.map(product => (
                <ThresholdUpsellCard
                  key={product.id}
                  product={product}
                  variant="compact"
                  willUnlockShipping={product.willUnlockShipping}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default SmartUpsell;
