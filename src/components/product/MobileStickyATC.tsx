import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatPrice } from "@/lib/currency";

interface MobileStickyATCProps {
  price: number;
  salePrice?: number | null;
  quantity: number;
  onAddToBag: () => void;
  disabled?: boolean;
}

const MobileStickyATC = ({ price, salePrice, quantity, onAddToBag, disabled }: MobileStickyATCProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const displayPrice = salePrice ?? price;
  const totalPrice = displayPrice * quantity;

  useEffect(() => {
    const mainCTA = document.getElementById("main-add-to-bag");
    const footer = document.querySelector("footer");

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.target === mainCTA) {
          setIsVisible(!entry.isIntersecting);
        }
        if (entry.target === footer) {
          setIsFooterVisible(entry.isIntersecting);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0,
    });

    if (mainCTA) observer.observe(mainCTA);
    if (footer) observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  const shouldShow = isVisible && !isFooterVisible;

  if (prefersReducedMotion) {
    return (
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50 lg:hidden
          bg-background/95 backdrop-blur-sm border-t border-border
          px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 ease-out
          ${shouldShow ? "translate-y-0" : "translate-y-full"}
        `}
      >
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="flex flex-col">
            {salePrice && (
              <span className="text-xs font-light text-muted-foreground line-through">
                {formatPrice(price * quantity)}
              </span>
            )}
            <span className="text-lg font-light text-foreground">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <Button
            onClick={onAddToBag}
            disabled={disabled}
            className="flex-1 max-w-[200px] h-11 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none"
          >
            Add to Bag
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ 
            type: "tween" as const, 
            duration: 0.35,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div className="flex flex-col">
              {salePrice && (
                <motion.span 
                  className="text-xs font-light text-muted-foreground line-through"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {formatPrice(price * quantity)}
                </motion.span>
              )}
              <span className="text-lg font-light text-foreground">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
              className="flex-1 max-w-[200px]"
            >
              <Button
                onClick={onAddToBag}
                disabled={disabled}
                className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none"
              >
                Add to Bag
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileStickyATC;
