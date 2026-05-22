import { Package, Mail, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState } from "react";

interface OrderConfirmationProps {
  orderNumber: string;
  email: string;
  onContinueShopping: () => void;
  onShowPostPurchaseOffer: () => void;
}

const OrderConfirmation = ({
  orderNumber,
  email,
  onContinueShopping,
  onShowPostPurchaseOffer
}: OrderConfirmationProps) => {
  const { items, subtotal, hasFreeShipping } = useCart();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true);
    
    // Show post-purchase offer after a delay
    const timer = setTimeout(() => {
      onShowPostPurchaseOffer();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onShowPostPurchaseOffer]);

  // Calculate estimated delivery date
  const getEstimatedDelivery = () => {
    const start = new Date();
    const end = new Date();
    start.setDate(start.getDate() + 3);
    end.setDate(end.getDate() + 5);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="text-center py-8 space-y-8 animate-fade-in">
      {/* Success icon with confetti effect */}
      <div className="relative mx-auto w-20 h-20">
        <div
          className={`absolute inset-0 bg-foreground rounded-full flex items-center justify-center transition-transform duration-500 ${
            showConfetti ? "scale-100" : "scale-0"
          }`}
        >
          <DrawCheckIcon size="lg" className="text-background" delay={500} />
        </div>
      </div>

      {/* Main confirmation text */}
      <div>
        <h2 className="text-2xl font-light text-foreground mb-2">Order Confirmed!</h2>
        <p className="text-muted-foreground">
          Order #{orderNumber} placed successfully
        </p>
      </div>

      {/* Order summary card */}
      <div className="bg-muted/20 p-6 text-left space-y-3 max-w-sm mx-auto">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items</span>
          <span className="text-foreground">{items.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="text-foreground font-medium">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-foreground">
            {hasFreeShipping ? "Free" : "Calculated"}
          </span>
        </div>
        <div className="flex justify-between text-sm pt-3 border-t border-muted-foreground/20">
          <span className="text-muted-foreground flex items-center gap-1">
            <Package className="h-3 w-3" />
            Estimated arrival
          </span>
          <span className="text-foreground">{getEstimatedDelivery()}</span>
        </div>
      </div>

      {/* Email confirmation */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Mail className="h-4 w-4" />
        <span>Confirmation sent to {email || "your email"}</span>
      </div>

      {/* Share buttons */}
      <div className="flex items-center justify-center gap-4">
        <span className="text-xs text-muted-foreground">Share your purchase</span>
        <button className="p-2 hover:bg-muted rounded-full transition-colors">
          <Instagram className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-full transition-colors">
          <Twitter className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
        <Button
          variant="outline"
          onClick={onContinueShopping}
          className="flex-1 rounded-none"
        >
          Continue Shopping
        </Button>
        <Button className="flex-1 rounded-none">Track Order</Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
