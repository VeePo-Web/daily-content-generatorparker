import { Lock, Shield, RefreshCw } from "lucide-react";

const CheckoutTrustBadges = () => {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5" />
        <span className="text-xs">256-bit SSL</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Shield className="h-3.5 w-3.5" />
        <span className="text-xs hidden sm:inline">Protected</span>
      </div>
      <div className="flex items-center gap-1.5">
        <RefreshCw className="h-3.5 w-3.5" />
        <span className="text-xs">30-day returns</span>
      </div>
      
    </div>
  );
};

export default CheckoutTrustBadges;
