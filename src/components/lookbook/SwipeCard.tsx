import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { X, Heart, Check, ShoppingBag, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SwipeLookProduct } from '@/hooks/useSwipeSession';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { triggerHapticFeedback, formatPrice } from '@/lib/cartUtils';
import InlineQuickSizePicker from '@/components/ui/InlineQuickSizePicker';
import { DrawCheckIcon } from '@/components/ui/draw-check-icon';

interface SwipeCardProps {
  product: SwipeLookProduct;
  onSwipeRight: (size?: string) => void;
  onSwipeLeft: () => void;
  isTop: boolean;
  stackIndex: number;
  rememberedSize?: string | null;
  canOneTap: boolean;
  availableSizes: string[];
  getStockForSize: (size: string) => number;
  isFirstCard?: boolean;
}

// Cap threshold at 100px for consistent feel across devices
const SWIPE_THRESHOLD = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.25, 100) : 100;
const THROW_VELOCITY = 500;
const MAX_ROTATION = 15;

function getPositionLabel(position: string | null) {
  if (!position) return null;
  const labels: Record<string, string> = {
    hat: "HAT",
    top: "TOP",
    bottom: "BOTTOM",
    shoes: "SHOES",
    accessories: "ACC",
  };
  return labels[position.toLowerCase()] || position.toUpperCase();
}

export default function SwipeCard({
  product,
  onSwipeRight,
  onSwipeLeft,
  isTop,
  stackIndex,
  rememberedSize,
  canOneTap,
  availableSizes,
  getStockForSize,
  isFirstCard = false,
}: SwipeCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isExiting, setIsExiting] = useState<'left' | 'right' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasHapticFired, setHasHapticFired] = useState(false);
  const [showFirstCardHint, setShowFirstCardHint] = useState(true);
  
  // Auto-dismiss the first-card hint after 3 seconds
  useEffect(() => {
    if (isFirstCard && isTop) {
      const timer = setTimeout(() => setShowFirstCardHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isFirstCard, isTop]);
  
  // Motion values for drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-MAX_ROTATION, MAX_ROTATION]);
  const addOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);
  const hintOpacity = useTransform(x, [-30, 0, 30], [0, 1, 0]);
  
  // Card stack transforms based on position
  const stackScale = 1 - stackIndex * 0.08;
  const stackY = stackIndex * 20;
  const stackOpacity = 1 - stackIndex * 0.3;
  
  const primaryImage = product.product_images?.find(img => img.is_primary) 
    || product.product_images?.[0];
  const positionLabel = getPositionLabel(product.position);
  const price = product.is_on_sale && product.sale_price ? product.sale_price : product.price;
  
  // Handle drag during movement
  const handleDrag = (_: any, info: PanInfo) => {
    if (!isTop) return;
    
    // Haptic at 50% threshold (warning pulse)
    const threshold50 = SWIPE_THRESHOLD * 0.5;
    if (Math.abs(info.offset.x) > threshold50 && !hasHapticFired) {
      triggerHapticFeedback();
      setHasHapticFired(true);
    } else if (Math.abs(info.offset.x) < threshold50) {
      setHasHapticFired(false);
    }
  };
  
  // Handle drag end - commit or spring back
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (!isTop) return;
    
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Commit if past threshold OR thrown fast enough
    if (offset > SWIPE_THRESHOLD || velocity > THROW_VELOCITY) {
      handleAddToBag();
    } else if (offset < -SWIPE_THRESHOLD || velocity < -THROW_VELOCITY) {
      handleSkip();
    }
    // Otherwise springs back automatically
  };
  
  // Add to bag action
  const handleAddToBag = (size?: string) => {
    if (canOneTap || size) {
      setShowSuccess(true);
      setIsExiting('right');
      triggerHapticFeedback();
      
      setTimeout(() => {
        onSwipeRight(size || rememberedSize || undefined);
      }, 300);
    } else {
      // Show size picker
      setIsPickerOpen(true);
    }
  };
  
  // Skip action
  const handleSkip = () => {
    setIsExiting('left');
    setTimeout(() => {
      onSwipeLeft();
    }, 200);
  };
  
  // Size selection handler
  const handleSizeSelect = (size: string) => {
    setIsPickerOpen(false);
    handleAddToBag(size);
  };
  
  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isTop) return;
    
    if (e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      handleAddToBag();
    } else if (e.key === 'Escape' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handleSkip();
    }
  };
  
  // Exit animation variants
  const exitVariants = {
    exitLeft: { 
      x: -400, 
      rotate: -15, 
      opacity: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }
    },
    exitRight: { 
      x: 400, 
      rotate: 15, 
      opacity: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }
    },
  };
  
  return (
    <motion.div
      ref={cardRef}
      className={`absolute inset-0 ${isTop ? 'z-30' : stackIndex === 1 ? 'z-20' : 'z-10'}`}
      style={{
        scale: stackScale,
        y: stackY,
        opacity: stackOpacity,
      }}
      initial={false}
      animate={isExiting ? exitVariants[isExiting === 'left' ? 'exitLeft' : 'exitRight'] : {}}
    >
      <motion.div
        className="w-full h-full bg-stone-800 rounded-none overflow-hidden shadow-2xl touch-none will-change-transform"
        style={{ x, rotate: isTop && !prefersReducedMotion ? rotate : 0 }}
        drag={isTop && !prefersReducedMotion ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        role="button"
        tabIndex={isTop ? 0 : -1}
        onKeyDown={handleKeyDown}
        aria-label={`${product.name}, ${formatPrice(price)}. Swipe right or press Enter to add to bag. Swipe left or press Escape to skip.`}
      >
        {/* Product Image */}
        <div className="relative w-full h-full">
          {primaryImage && (
            <img
              src={primaryImage.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          )}
          
          {/* Gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          
          {/* Position Badge */}
          {positionLabel && (
            <span className="absolute top-4 left-4 text-xs md:text-[10px] uppercase tracking-wider bg-black/60 text-white/90 px-3 py-2 md:py-1.5 font-light backdrop-blur-sm">
              {positionLabel}
            </span>
          )}
          
          {/* Remembered Size Badge */}
          {rememberedSize && canOneTap && (
            <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider bg-champagne-500 text-white px-3 py-1.5 font-medium">
              Size {rememberedSize}
            </span>
          )}
          
          {/* Swipe Direction Indicators */}
          {isTop && !prefersReducedMotion && (
            <>
              {/* Skip indicator (left) */}
              <motion.div
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-red-500/90"
                style={{ opacity: skipOpacity }}
              >
                <X className="w-5 h-5 text-white" />
                <span className="text-white text-sm font-medium uppercase tracking-wide">Skip</span>
              </motion.div>
              
              {/* Add indicator (right) */}
              <motion.div
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-green-500/90"
                style={{ opacity: addOpacity }}
              >
                <span className="text-white text-sm font-medium uppercase tracking-wide">Add</span>
                <ShoppingBag className="w-5 h-5 text-white" />
              </motion.div>
            </>
          )}
          
          {/* Success Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center gap-3"
              >
                <DrawCheckIcon size="xl" color="white" animate delay={0} />
                <span className="text-white text-lg font-medium">Added to Bag</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Product Info - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5 pb-6">
            {/* Persistent "Swipe right to add" hint on first card */}
            <AnimatePresence>
              {isFirstCard && isTop && !isPickerOpen && !showSuccess && showFirstCardHint && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 mb-4"
                  style={{ opacity: hintOpacity }}
                >
                  <motion.div
                    className="flex items-center gap-1.5 text-white/70 bg-white/10 backdrop-blur-sm px-3 py-1.5"
                    animate={prefersReducedMotion ? {} : { x: [0, 8, 0] }}
                    transition={{ repeat: 1, duration: 1.5, ease: "easeInOut" }}
                  >
                    <span className="text-xs font-medium uppercase tracking-wide">Swipe right to add</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Link to={`/product/${product.slug}`} className="block" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-white text-lg md:text-xl font-light mb-1 truncate">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center gap-3">
              {product.is_on_sale && product.sale_price ? (
                <>
                  <span className="text-champagne-300 text-lg font-medium">{formatPrice(product.sale_price)}</span>
                  <span className="text-white/50 text-sm line-through">{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="text-white text-lg font-light">{formatPrice(product.price)}</span>
              )}
            </div>
          </div>
          
          {/* Inline Size Picker */}
          <AnimatePresence>
            {isPickerOpen && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 will-change-auto">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-xs"
                  style={{ willChange: 'opacity, transform' }}
                >
                  <p className="text-white text-center text-sm mb-4 font-light">
                    Select your size
                  </p>
                  <InlineQuickSizePicker
                    sizes={availableSizes}
                    rememberedSize={rememberedSize}
                    onSelect={handleSizeSelect}
                    onClose={() => setIsPickerOpen(false)}
                    getStockForSize={getStockForSize}
                    variant="dark"
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
