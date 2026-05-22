import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import CheckoutTrustBadges from "@/components/checkout/CheckoutTrustBadges";
import MissionStrip from "@/components/checkout/MissionStrip";

const CheckoutHeader = () => {
  return (
    <header className="w-full bg-background">
      {/* Main header bar */}
      <div className="border-b border-muted-foreground/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="relative flex items-center justify-between">
            {/* Left side - Continue Shopping */}
            <Link
              to="/"
              className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm font-light hidden sm:inline">Continue Shopping</span>
            </Link>

            {/* Center - Logo - Absolutely positioned to ensure perfect centering */}
            <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
              <span className="text-[0.7rem] sm:text-xs font-light tracking-[0.35em] text-foreground uppercase whitespace-nowrap">
                LINE OF JUDAH
              </span>
            </Link>

            {/* Right side - Trust badges */}
            <CheckoutTrustBadges />
          </div>
        </div>
      </div>

      {/* Mission strip */}
      <MissionStrip />
    </header>
  );
};

export default CheckoutHeader;
