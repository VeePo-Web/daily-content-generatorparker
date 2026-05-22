import { ShoppingBag, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MobileStickyCheckoutProps {
  total: number;
  onPayNow: () => void;
  isProcessing?: boolean;
}

const MobileStickyCheckout = ({ total, onPayNow, isProcessing }: MobileStickyCheckoutProps) => {
  const { items, itemCount } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t border-border shadow-lg">
      {/* Expanded summary */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 bg-muted/30",
          isExpanded ? "max-h-64" : "max-h-0"
        )}
      >
        <div className="p-4 space-y-2 max-h-52 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 bg-muted overflow-hidden flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <span className="text-foreground font-medium">{item.priceFormatted}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main sticky bar */}
      <div className="p-4 flex items-center justify-between gap-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="text-muted-foreground">{itemCount} items</span>
          <ChevronUp
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </button>

        <div className="flex items-center gap-4">
          <span className="font-medium text-foreground">${total.toLocaleString()}</span>
          <Button
            onClick={onPayNow}
            disabled={isProcessing}
            className="rounded-none h-10 px-6"
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyCheckout;
