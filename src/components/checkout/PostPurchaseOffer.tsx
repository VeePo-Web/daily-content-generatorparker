import { useState, useEffect } from "react";
import { Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PostPurchaseOfferProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToOrder: () => void;
}

const PostPurchaseOffer = ({ isOpen, onClose, onAddToOrder }: PostPurchaseOfferProps) => {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const originalPrice = 85;
  const discountedPrice = 68;
  const discountPercent = 20;

  const handleAddToOrder = async () => {
    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onAddToOrder();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Timer header */}
        <div className="bg-champagne-500 text-white px-4 py-2 flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">
            EXCLUSIVE OFFER • Expires in{" "}
            <span className="font-mono">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </span>
        </div>

        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-champagne-500" />
            <DialogTitle className="text-lg font-light">One-Time Offer Just For You</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Product display */}
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-muted overflow-hidden flex-shrink-0">
              <img
                src="/products/stay-holy-hoodie/flat-front.png"
                alt="Stay Holy Hoodie"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Stay Holy Hoodie</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Premium heavyweight cotton blend
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-lg font-medium text-foreground">
                  ${discountedPrice}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${originalPrice}
                </span>
                <span className="text-xs bg-champagne-100 dark:bg-champagne-900 text-champagne-700 dark:text-champagne-300 px-2 py-0.5">
                  -{discountPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 space-y-1">
             <p>— Add to your order with one click</p>
            <p>— No re-entering payment details</p>
            <p>— Ships together with your order</p>
          </div>

          {/* CTA */}
          <Button
            onClick={handleAddToOrder}
            disabled={isAdding}
            className="w-full h-12 text-base rounded-none"
          >
            {isAdding ? "Adding to Order..." : `Add to Order — $${discountedPrice}`}
          </Button>

          {/* Dismiss */}
          <button
            onClick={onClose}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            No thanks
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostPurchaseOffer;
