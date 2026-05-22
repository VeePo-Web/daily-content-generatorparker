import { Truck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing } from "@/lib/animations";
import { formatPrice } from "@/lib/currency";

type MilestoneType = 'halfway' | 'almost' | 'unlocked';

const FreeShippingBar = () => {
  const { 
    shippingProgress, 
    progressTier, 
    amountToFreeShipping, 
    hasFreeShipping 
  } = useCart();
  
  const prefersReducedMotion = useReducedMotion();
  
  // Milestone tracking state
  const [celebratedMilestones, setCelebratedMilestones] = useState<Set<MilestoneType>>(new Set());
  const [activeCelebration, setActiveCelebration] = useState<MilestoneType | null>(null);
  const prevProgressRef = useRef(shippingProgress);

  // Detect milestone crossings (only when progress increases)
  useEffect(() => {
    const prevProgress = prevProgressRef.current;
    
    // Only celebrate if crossing UP (not when removing items)
    if (progressTier === 'halfway' && !celebratedMilestones.has('halfway') && prevProgress < 50 && shippingProgress >= 50) {
      celebrateMilestone('halfway');
    } else if (progressTier === 'almost' && !celebratedMilestones.has('almost') && prevProgress < 90 && shippingProgress >= 90) {
      celebrateMilestone('almost');
    } else if (progressTier === 'unlocked' && !celebratedMilestones.has('unlocked') && prevProgress < 100) {
      celebrateMilestone('unlocked');
    }
    
    prevProgressRef.current = shippingProgress;
  }, [shippingProgress, progressTier, celebratedMilestones]);

  const celebrateMilestone = (tier: MilestoneType) => {
    setActiveCelebration(tier);
    setCelebratedMilestones(prev => new Set([...prev, tier]));
    
    // Tiered haptic feedback for milestone celebrations (mobile)
    // Skip haptics if user prefers reduced motion
    if (!prefersReducedMotion && 'vibrate' in navigator) {
      if (tier === 'halfway') {
        navigator.vibrate(30); // Lighter celebration pulse
      } else if (tier === 'unlocked') {
        navigator.vibrate(50); // Stronger achievement pulse
      }
      // No haptic for 'almost' — urgency messaging is sufficient
    }
    
    // Clear celebration after animation completes
    const duration = tier === 'unlocked' ? 2000 : 1500;
    setTimeout(() => setActiveCelebration(null), duration);
  };

  // Determine progress bar gradient based on tier
  const getProgressGradient = () => {
    if (hasFreeShipping) {
      return 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)))';
    }
    if (shippingProgress >= 90) {
      return 'linear-gradient(90deg, hsl(152, 25%, 55%), hsl(152, 35%, 30%))';
    }
    return 'linear-gradient(90deg, hsl(152, 30%, 18%), hsl(152, 35%, 30%))';
  };

  // Message key for AnimatePresence - changes when tier or celebration changes
  const getMessageKey = () => {
    if (activeCelebration === 'halfway') return 'halfway-celebration';
    return progressTier;
  };

  return (
    <div className="px-6 py-3 border-b border-border bg-muted/30">
      {/* Progress bar container with milestone markers */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
        {/* Milestone markers at 50% and 90% */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 left-[50%] w-1 h-1 rounded-full bg-border/60 z-10" 
          style={{ transform: 'translate(-50%, -50%)' }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 left-[90%] w-1 h-1 rounded-full bg-border/60 z-10" 
          style={{ transform: 'translate(-50%, -50%)' }}
        />
        
        {/* Animated fill with color temperature transition */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: getProgressGradient() }}
          initial={false}
          animate={{ width: `${shippingProgress}%` }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 0.6, 
            ease: easing.editorial 
          }}
        />
        
        {/* Celebration glow overlay */}
        <AnimatePresence>
          {activeCelebration && !prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                background: activeCelebration === 'unlocked' 
                  ? 'hsl(var(--primary) / 0.3)' 
                  : 'hsl(152, 35%, 30%, 0.2)',
                filter: 'blur(4px)',
                width: `${shippingProgress}%`,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Text messaging with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={getMessageKey()}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 0.25,
            ease: easing.smooth
          }}
          className="flex items-center justify-center gap-2 text-sm"
        >
          {hasFreeShipping ? (
            <div className="flex items-center gap-2">
              <DrawCheckIcon size="sm" className="text-primary" delay={0} />
              <span className="font-medium text-primary">Free shipping unlocked</span>
            </div>
          ) : shippingProgress >= 90 ? (
            <>
              <Truck className="h-4 w-4 text-forest-400" />
              <span className="text-muted-foreground">
                Almost there—<span className="font-medium text-forest-500">{formatPrice(amountToFreeShipping)}</span> more
              </span>
            </>
          ) : activeCelebration === 'halfway' ? (
            <span className="font-medium text-foreground">
              Halfway there
            </span>
          ) : (
            <>
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                You're <span className="font-medium text-foreground">{formatPrice(amountToFreeShipping)}</span> away from FREE shipping
              </span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FreeShippingBar;
