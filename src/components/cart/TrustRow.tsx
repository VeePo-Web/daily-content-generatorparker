import { Truck, RotateCcw, Lock } from "lucide-react";

const TrustRow = () => {
  return (
    <div className="flex items-center justify-center gap-6 py-2.5 border-t border-border">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Truck className="h-4 w-4" />
        <span className="text-xs">Free over $99</span>
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <RotateCcw className="h-4 w-4" />
        <span className="text-xs">30-day returns</span>
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span className="text-xs">Secure checkout</span>
      </div>
    </div>
  );
};

export default TrustRow;
