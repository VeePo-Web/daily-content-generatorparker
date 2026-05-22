import { useState, useEffect, useRef } from "react";
import { Gift, ChevronDown, ChevronUp, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BundleMatch } from "@/hooks/useBundleDiscounts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import MissingProductCard from "./MissingProductCard";

interface BundleProgressProps {
  bundle: BundleMatch;
  variant?: "drawer" | "checkout";
}

/**
 * Contextual messages based on completion percentage
 */
const getContextualMessage = (bundle: BundleMatch): { headline: string; subtext: string } => {
  const { completionPercent, missingProducts, potentialSavings, savingsAmount, isComplete, discountPercent, nextTierDiscountPercent } = bundle;
  const missingCount = missingProducts.length;
  
  if (isComplete) {
    return {
      headline: `Look Complete! Saving $${savingsAmount.toFixed(2)}`,
      subtext: `You're getting ${discountPercent}% off this bundle`,
    };
  }
  
  if (completionPercent >= 75 || missingCount === 1) {
    return {
      headline: `Almost Complete! Just ${missingCount} item${missingCount > 1 ? 's' : ''} away`,
      subtext: `Add to save $${potentialSavings.toFixed(2)} (${nextTierDiscountPercent || discountPercent}% off)`,
    };
  }
  
  if (completionPercent >= 50) {
    return {
      headline: `Halfway There! Add ${missingCount} more`,
      subtext: `Unlock ${nextTierDiscountPercent || discountPercent}% bundle discount`,
    };
  }
  
  return {
    headline: savingsAmount > 0 
      ? `Bundle Discount Applied — Save $${savingsAmount.toFixed(2)}`
      : `Complete Look & Save ${nextTierDiscountPercent || discountPercent}%`,
    subtext: `"${bundle.lookName}" — ${bundle.itemsInCart.length} of ${bundle.totalItemsInLook} items`,
  };
};

const BundleProgress = ({ bundle, variant = "drawer" }: BundleProgressProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const prevSavingsRef = useRef(bundle.savingsAmount);
  const [showTierCelebration, setShowTierCelebration] = useState(false);
  
  const progress = (bundle.itemsInCart.length / bundle.totalItemsInLook) * 100;
  const hasDiscount = bundle.savingsAmount > 0;
  const { isCloseToCompletion, missingProducts, completionPercent, isComplete } = bundle;
  
  // Contextual messaging
  const { headline, subtext } = getContextualMessage(bundle);

  // Tier celebration when savings increase
  useEffect(() => {
    if (bundle.savingsAmount > prevSavingsRef.current && bundle.savingsAmount > 0) {
      setShowTierCelebration(true);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
      
      setTimeout(() => setShowTierCelebration(false), 1500);
    }
    prevSavingsRef.current = bundle.savingsAmount;
  }, [bundle.savingsAmount]);

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative border rounded-none overflow-hidden",
        isComplete
          ? "border-champagne-600/40 bg-champagne-50/50 dark:bg-champagne-950/20"
          : hasDiscount 
            ? "border-champagne-500/30 bg-champagne-50/50 dark:bg-champagne-950/20" 
            : "border-champagne-500/30 bg-champagne-50/50 dark:bg-champagne-950/20"
      )}
    >
      {/* Close-to-completion pulse effect */}
      {isCloseToCompletion && !isComplete && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-none pointer-events-none"
          animate={{ 
            boxShadow: [
              '0 0 0 1px rgba(231, 213, 183, 0.15)',
              '0 0 0 4px rgba(231, 213, 183, 0.08)',
              '0 0 0 1px rgba(231, 213, 183, 0.15)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Tier celebration flash */}
      <AnimatePresence>
        {showTierCelebration && !prefersReducedMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-champagne-400 rounded-none pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={isComplete ? { 
              scale: [1, 1.15, 1],
              rotate: [0, -5, 5, 0]
            } : showTierCelebration ? {
              scale: [1, 1.2, 1],
            } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {isComplete ? (
              <Sparkles className="w-4 h-4 text-champagne-600" />
            ) : (
              <Gift className={cn(
                "w-4 h-4",
                hasDiscount ? "text-champagne-600" : "text-champagne-600"
              )} />
            )}
          </motion.div>
          
          <div className="text-left">
            <p className={cn(
              "text-xs font-medium",
              isComplete
                ? "text-champagne-700 dark:text-champagne-400"
                : hasDiscount 
                  ? "text-champagne-700 dark:text-champagne-400" 
                  : "text-champagne-700 dark:text-champagne-400"
            )}>
              {headline}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {subtext}
            </p>
          </div>
        </div>
        
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      
      {/* Progress Bar */}
      <div className="px-4 pb-3">
        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              isComplete
                ? "bg-gradient-to-r from-champagne-600 to-champagne-500"
                : hasDiscount 
                  ? "bg-gradient-to-r from-champagne-600 to-champagne-500" 
                  : "bg-gradient-to-r from-champagne-500 to-champagne-400"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Milestone dots */}
          {!isComplete && (
            <div className="absolute inset-y-0 right-0 flex items-center">
              {[50, 75].map((milestone) => (
                completionPercent < milestone && (
                  <div
                    key={milestone}
                    className="absolute w-1 h-1 rounded-full bg-muted-foreground/20"
                    style={{ left: `${milestone}%`, transform: 'translateX(-50%)' }}
                  />
                )
              ))}
            </div>
          )}
        </div>
        
        {/* Close to completion badge */}
        {isCloseToCompletion && !isComplete && (
          <motion.p 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-champagne-600 dark:text-champagne-400 mt-2 font-medium flex items-center gap-1"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-champagne-500" />
            Just 1 item away from {bundle.nextTierDiscountPercent || bundle.discountPercent}% off!
          </motion.p>
        )}
      </div>
      
      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
              {/* Items in cart */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                  In Your Bag
                </p>
                {bundle.itemsInCart.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <Check className="w-3 h-3 text-champagne-600 flex-shrink-0" />
                    <span className="text-foreground/80 truncate flex-1">{item.name}</span>
                    <span className="text-muted-foreground flex-shrink-0">Size {item.size}</span>
                  </div>
                ))}
              </div>
              
              {/* Missing items with quick-add */}
              {missingProducts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                    Add to Complete ({missingProducts.length})
                  </p>
                  
                  {/* Show up to 3 missing products with inline quick-add */}
                  <div className="space-y-2">
                    {missingProducts.slice(0, 3).map((product) => (
                      <MissingProductCard
                        key={product.id}
                        product={product}
                        lookId={bundle.lookId}
                        lookName={bundle.lookName}
                      />
                    ))}
                  </div>
                  
                  {/* Show "and X more" if there are more than 3 */}
                  {missingProducts.length > 3 && (
                    <p className="text-[10px] text-muted-foreground text-center">
                      +{missingProducts.length - 3} more item{missingProducts.length - 3 > 1 ? 's' : ''} in this look
                    </p>
                  )}
                </div>
              )}
              
              {/* Savings breakdown */}
              {hasDiscount && (
                <div className="pt-2 border-t border-border/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Bundle items subtotal</span>
                    <span className="text-foreground">
                      ${bundle.itemsInCart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-champagne-700 dark:text-champagne-400 font-medium">{bundle.discountPercent}% bundle discount</span>
                    <span className="text-champagne-700 dark:text-champagne-400 font-medium">-${bundle.savingsAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BundleProgress;
