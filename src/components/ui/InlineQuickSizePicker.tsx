import { motion, useReducedMotion } from "framer-motion";

interface InlineQuickSizePickerProps {
  sizes: string[];
  rememberedSize: string | null;
  onSelect: (size: string) => void;
  onClose?: () => void;
  getStockForSize?: (size: string) => number;
  variant?: 'dark' | 'light';
  className?: string;
}

/**
 * Reusable inline size picker for quick-add flows.
 * Shows available sizes with stock awareness and remembered size highlighting.
 * 
 * @example
 * ```tsx
 * <InlineQuickSizePicker
 *   sizes={['S', 'M', 'L', 'XL']}
 *   rememberedSize="M"
 *   onSelect={(size) => addToCart(size)}
 *   getStockForSize={(size) => getStock(size)}
 * />
 * ```
 */
const InlineQuickSizePicker = ({ 
  sizes, 
  rememberedSize,
  onSelect,
  onClose,
  getStockForSize,
  variant = 'dark',
  className = '',
}: InlineQuickSizePickerProps) => {
  const prefersReducedMotion = useReducedMotion();

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };

  const isDark = variant === 'dark';

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose?.();
  };

  const handleSizeClick = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(size);
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleBackdropClick}
      className={`
        absolute bottom-0 left-0 right-0 
        ${isDark 
          ? 'bg-stone-900/95 border-t border-white/10' 
          : 'bg-background/95 border-t border-border'
        }
        backdrop-blur-sm p-3 md:p-2.5 rounded-b-lg
        ${className}
      `}
    >
      <p className={`text-[10px] md:text-[9px] uppercase tracking-wider mb-2 text-center ${
        isDark ? 'text-white/50' : 'text-muted-foreground'
      }`}>
        Select Size
      </p>
      <div 
        className="flex flex-wrap gap-1.5 justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {sizes.map(size => {
          const stock = getStockForSize ? getStockForSize(size) : 999;
          const isOutOfStock = stock === 0;
          const isRemembered = size === rememberedSize;
          const isLowStock = stock > 0 && stock <= 3;
          
          return (
            <motion.button
              key={size}
              onClick={(e) => !isOutOfStock && handleSizeClick(size, e)}
              disabled={isOutOfStock}
              className={`
                relative min-w-[40px] md:min-w-[36px] h-10 md:h-9 px-2.5 md:px-2 text-xs rounded transition-colors
                ${isOutOfStock 
                  ? isDark
                    ? 'bg-white/5 text-white/30 cursor-not-allowed line-through' 
                    : 'bg-muted/50 text-muted-foreground/30 cursor-not-allowed line-through'
                  : isRemembered
                    ? 'bg-champagne-500 text-white font-medium'
                    : isDark
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                }
              `}
              whileTap={isOutOfStock || prefersReducedMotion ? {} : { scale: 0.9 }}
              transition={springConfig}
              aria-label={`Size ${size}${isOutOfStock ? ' - Out of stock' : ''}${isRemembered ? ' - Your size' : ''}`}
            >
              {size}
              {isRemembered && !isOutOfStock && (
                <span className={`absolute -top-1.5 left-1/2 -translate-x-1/2 
                                  text-[8px] md:text-[7px] uppercase tracking-wide 
                                  px-1 rounded whitespace-nowrap
                                  ${isDark 
                                     ? 'text-champagne-500 bg-stone-900' 
                                     : 'text-champagne-600 bg-background'
                                  }`}>
                  yours
                </span>
              )}
              {isLowStock && !isRemembered && (
                <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 
                                  w-1.5 h-1.5 md:w-1 md:h-1 rounded-full bg-champagne-500`} />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default InlineQuickSizePicker;
