import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatPrice } from '@/lib/cartUtils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SwipeProgressProps {
  addedCount: number;
  totalValue: number;
  currentIndex: number;
  totalProducts: number;
  freeShippingThreshold?: number;
  bundleDiscountPercent?: number;
  onViewBag: () => void;
  onClose: () => void;
}

export default function SwipeProgress({
  addedCount,
  totalValue,
  currentIndex,
  totalProducts,
  freeShippingThreshold = 150,
  bundleDiscountPercent = 0,
  onViewBag,
  onClose,
}: SwipeProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const shippingProgress = Math.min(100, (totalValue / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - totalValue);
  const hasUnlockedFreeShipping = totalValue >= freeShippingThreshold;
  
  // Card progress through the deck
  const cardProgress = totalProducts > 0 ? (currentIndex / totalProducts) * 100 : 0;
  
  return (
    <div className="bg-stone-900/95 backdrop-blur-md border-t border-white/10 px-4 py-3 safe-area-pb">
      {/* Card Progress Dots */}
      <div className="flex justify-center gap-1.5 mb-3">
        {Array.from({ length: totalProducts }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 md:w-2 md:h-2 rounded-full transition-colors ${
              i < currentIndex
                ? 'bg-champagne-500'
                : i === currentIndex
                ? 'bg-white'
                : 'bg-white/20'
            }`}
            animate={i === currentIndex ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      
      {/* Stats Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Item Count */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={addedCount}
              initial={prefersReducedMotion ? {} : { scale: 1.3, y: -5 }}
              animate={{ scale: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-champagne-500" />
              <span className="text-white font-medium text-sm md:text-base">
                {addedCount} {addedCount === 1 ? 'item' : 'items'}
              </span>
            </motion.div>
          </AnimatePresence>
          
          <span className="text-white/30">•</span>
          
          {/* Total Value */}
          <AnimatePresence mode="popLayout">
            <motion.span
              key={totalValue}
              initial={prefersReducedMotion ? {} : { scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-white font-medium text-sm md:text-base"
            >
              {formatPrice(totalValue)}
            </motion.span>
          </AnimatePresence>
          
          {/* Bundle Discount Badge */}
          {bundleDiscountPercent > 0 && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-[10px] bg-champagne-500/20 text-champagne-300 px-2 py-0.5"
            >
              <Sparkles className="w-3 h-3" />
              {bundleDiscountPercent}% off
            </motion.span>
          )}
        </div>
        
        {/* View Bag CTA */}
        {addedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewBag}
              className="text-champagne-500 hover:text-champagne-300 hover:bg-champagne-500/10 h-9 md:h-8 px-4 md:px-3 min-w-[44px]"
            >
              View Bag
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}
      </div>
      
      {/* Free Shipping Progress */}
      <div className="space-y-1.5">
        <div className="relative">
          <Progress 
            value={shippingProgress} 
            className="h-1.5 bg-stone-700"
          />
          {/* Milestone dots */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-champagne-500/50 border border-champagne-500"
            style={{ left: '50%' }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500/50 border border-green-500"
            style={{ left: '100%', transform: 'translate(-100%, -50%)' }}
          />
        </div>
        
        <AnimatePresence mode="wait">
          {hasUnlockedFreeShipping ? (
            <motion.p
              key="unlocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-green-400 font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Free shipping unlocked!
            </motion.p>
          ) : (
            <motion.p
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs md:text-[11px] text-white/50"
            >
              {formatPrice(amountToFreeShipping)} away from free shipping
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
