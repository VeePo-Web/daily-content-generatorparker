import { ReactNode, useState, useCallback, useMemo } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import { ShoppingBag, X, Check, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import useLookSwipe, { LookSwipeProduct } from "@/hooks/useLookSwipe";
import { Button } from "@/components/ui/button";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";
import { formatPrice } from "@/lib/cartUtils";

// Physics constants
const MAX_ROTATION = 8;
const DRAG_ELASTIC = 0.7;

interface SwipeableLookCardProps {
  children: ReactNode;
  lookId: string;
  lookName: string;
  products: LookSwipeProduct[];
  onViewBag?: () => void;
}

// Size options for the picker
const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

export function SwipeableLookCard({
  children,
  lookId,
  lookName,
  products,
  onViewBag,
}: SwipeableLookCardProps) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  
  // Calculate threshold based on screen width
  const swipeThreshold = useMemo(() => 
    typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.3, 120) : 100,
    []
  );
  
  const {
    showSuccess,
    showSizePicker,
    showHint,
    rememberedSize,
    hasRememberedSize,
    handleSwipeComplete,
    handleSizeSelect,
    dismissSuccess,
    dismissHint,
    itemsAdded,
    totalValue,
    bundleDiscountPercent,
    alreadyInCart,
  } = useLookSwipe({ lookId, lookName, products });
  
  // Motion values for drag
  const x = useMotionValue(0);
  const rotate = useTransform(
    x, 
    [-200, 0, 200], 
    prefersReducedMotion ? [0, 0, 0] : [-MAX_ROTATION, 0, MAX_ROTATION]
  );
  
  // Opacity transforms for direction indicators
  const addOpacity = useTransform(x, [0, swipeThreshold * 0.5, swipeThreshold], [0, 0.5, 1]);
  const skipOpacity = useTransform(x, [-swipeThreshold, -swipeThreshold * 0.5, 0], [1, 0.5, 0]);
  
  // Track if we've triggered 50% haptic
  const [hasTriggeredMidHaptic, setHasTriggeredMidHaptic] = useState(false);
  
  // Handle drag updates
  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const progress = Math.abs(info.offset.x) / swipeThreshold;
    
    // Trigger haptic at 50% threshold
    if (progress >= 0.5 && !hasTriggeredMidHaptic) {
      setHasTriggeredMidHaptic(true);
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    } else if (progress < 0.5 && hasTriggeredMidHaptic) {
      setHasTriggeredMidHaptic(false);
    }
  }, [swipeThreshold, hasTriggeredMidHaptic]);
  
  // Handle drag end
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const shouldComplete = 
      Math.abs(info.offset.x) >= swipeThreshold || 
      Math.abs(info.velocity.x) >= 400;
    
    if (shouldComplete) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      handleSwipeComplete(direction);
    }
    
    // Reset haptic state
    setHasTriggeredMidHaptic(false);
  }, [swipeThreshold, handleSwipeComplete]);
  
  // If not mobile, just render children without swipe
  if (!isMobile) {
    return <>{children}</>;
  }
  
  return (
    <motion.div 
      className="relative w-full h-full touch-none will-change-transform"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={DRAG_ELASTIC}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileTap={prefersReducedMotion ? {} : { scale: 1.01 }}
    >
      {/* Original Image Content */}
      {children}
      
      {/* Add Look Direction Indicator (Right) */}
      <motion.div
        style={{ opacity: addOpacity }}
        className="absolute top-1/2 right-4 -translate-y-1/2 z-20 pointer-events-none"
      >
        <div className="bg-green-600/95 backdrop-blur-sm text-white px-4 py-3 flex items-center gap-2 shadow-lg">
          <ShoppingBag className="w-5 h-5" />
          <span className="font-medium text-sm uppercase tracking-wide">Add Look</span>
        </div>
      </motion.div>
      
      {/* Skip Direction Indicator (Left) */}
      <motion.div
        style={{ opacity: skipOpacity }}
        className="absolute top-1/2 left-4 -translate-y-1/2 z-20 pointer-events-none"
      >
        <div className="bg-stone-700/90 backdrop-blur-sm text-white/80 px-4 py-3 flex items-center gap-2">
          <X className="w-5 h-5" />
          <span className="font-medium text-sm uppercase tracking-wide">Skip</span>
        </div>
      </motion.div>
      
      {/* Hint removed — taught inside the SwipeLookbook drawer instead */}
      
      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSuccess}
            className="absolute inset-0 z-30 bg-green-600/95 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-6"
          >
            <DrawCheckIcon 
              size="xl" 
              color="white" 
              animate 
              delay={100} 
              variant="circle-check"
              filled
              backgroundColor="hsl(var(--green-600))"
            />
            
            <div className="text-center">
              <h3 className="text-xl font-medium text-white uppercase tracking-wide mb-1">
                {alreadyInCart ? 'Already in Bag' : 'Look Added'}
              </h3>
              <p className="text-white/80 text-sm">
                {itemsAdded > 0 ? (
                  <>{itemsAdded} items • {formatPrice(totalValue)}</>
                ) : alreadyInCart ? (
                  <>All items from this look are in your bag</>
                ) : (
                  <>Added to your bag</>
                )}
              </p>
            </div>
            
            {/* Bundle Discount Badge */}
            {bundleDiscountPercent > 0 && itemsAdded > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-champagne-500/20 border border-champagne-500/30 text-champagne-300 px-4 py-2 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">{bundleDiscountPercent}% Bundle Saved</span>
              </motion.div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-2 w-full max-w-xs">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissSuccess();
                }}
                variant="outline"
                className="flex-1 h-12 bg-transparent border-white/30 text-white hover:bg-white/10 rounded-none"
              >
                Keep Browsing
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissSuccess();
                  onViewBag?.();
                }}
                className="flex-1 h-12 bg-white text-green-700 hover:bg-white/90 rounded-none font-medium"
              >
                View Bag
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Size Picker Overlay */}
      <AnimatePresence>
        {showSizePicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-x-0 bottom-0 z-30 bg-stone-900/98 backdrop-blur-md p-6 pb-safe"
          >
            <h3 className="text-center text-white font-light text-sm mb-4">
              Select your size for all items
            </h3>
            
            <div className="grid grid-cols-6 gap-2 mb-4">
              {AVAILABLE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={`
                    h-12 rounded-none font-medium text-sm transition-all
                    ${rememberedSize === size 
                      ? 'bg-champagne-500 text-white ring-2 ring-champagne-400 ring-offset-2 ring-offset-stone-900' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                    }
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
            
            {rememberedSize && (
              <p className="text-center text-white/40 text-xs mb-4">
                * {rememberedSize} is your saved size
              </p>
            )}
            
            <Button
              onClick={() => handleSizeSelect('M')}
              className="w-full h-12 bg-champagne-600 hover:bg-champagne-500 text-white rounded-none font-light"
            >
              Apply to Look
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default SwipeableLookCard;
