import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing } from "@/lib/animations";

type SizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface DrawCheckIconProps {
  /** Size of the icon - predefined token or custom pixel value */
  size?: SizeToken | number;
  /** Whether to animate the icon */
  animate?: boolean;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
  /** Custom stroke width (auto-scaled by default) */
  strokeWidth?: number;
  /** Stroke color */
  color?: string;
  /** Icon variant */
  variant?: 'check' | 'circle-check' | 'square-check' | 'rounded-square-check';
  /** Render container with solid fill instead of stroke */
  filled?: boolean;
  /** Background color for filled variant checkmark */
  backgroundColor?: string;
  /** When animation should play */
  trigger?: 'mount' | 'manual';
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

const sizeMap: Record<SizeToken, number> = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 40,
  xl: 56,
  '2xl': 72,
};

const getPixelSize = (size: SizeToken | number): number => {
  if (typeof size === 'number') return size;
  return sizeMap[size];
};

const getProportionalStrokeWidth = (
  size: SizeToken | number,
  customStrokeWidth?: number
): number => {
  if (customStrokeWidth) return customStrokeWidth;
  
  const pixelSize = getPixelSize(size);
  if (pixelSize <= 20) return 1.5;   // xs, sm
  if (pixelSize <= 28) return 1.5;   // md
  if (pixelSize <= 40) return 2;     // lg
  if (pixelSize <= 56) return 2.5;   // xl
  return 3;                           // 2xl+
};

const getCornerRadius = (size: SizeToken | number): number => {
  const pixelSize = getPixelSize(size);
  if (pixelSize <= 20) return 2;
  if (pixelSize <= 28) return 2.5;
  if (pixelSize <= 40) return 3;
  if (pixelSize <= 56) return 4;
  return 5;
};

const createPathVariants = (
  duration: number,
  delay: number,
  reduced: boolean
): Variants => ({
  hidden: { 
    pathLength: reduced ? 1 : 0,
    opacity: reduced ? 1 : 0,
  },
  visible: { 
    pathLength: 1,
    opacity: 1,
    transition: reduced ? { duration: 0 } : {
      pathLength: {
        duration: duration / 1000,
        ease: easing.editorial,
        delay: delay / 1000,
      },
      opacity: {
        duration: 0.01,
        delay: delay / 1000,
      },
    },
  },
});

const createContainerVariants = (
  duration: number,
  delay: number,
  reduced: boolean
): Variants => ({
  hidden: { 
    pathLength: reduced ? 1 : 0,
    opacity: reduced ? 1 : 0,
  },
  visible: { 
    pathLength: 1,
    opacity: 1,
    transition: reduced ? { duration: 0 } : {
      pathLength: {
        duration: duration / 1000,
        ease: easing.editorial,
        delay: delay / 1000,
      },
      opacity: {
        duration: 0.01,
        delay: delay / 1000,
      },
    },
  },
});

const createFilledContainerVariants = (
  duration: number,
  delay: number,
  reduced: boolean
): Variants => ({
  hidden: { 
    scale: reduced ? 1 : 0.9,
    opacity: reduced ? 1 : 0,
  },
  visible: { 
    scale: 1,
    opacity: 1,
    transition: reduced ? { duration: 0 } : {
      scale: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: delay / 1000,
      },
      opacity: {
        duration: 0.15,
        delay: delay / 1000,
      },
    },
  },
});

export const DrawCheckIcon = ({
  size = 'md',
  animate = true,
  delay = 200,
  duration = 500,
  className,
  strokeWidth,
  color = 'currentColor',
  variant = 'check',
  filled = false,
  backgroundColor = 'white',
  trigger = 'mount',
  onAnimationComplete,
}: DrawCheckIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion || !animate;
  
  const pixelSize = getPixelSize(size);
  const computedStrokeWidth = getProportionalStrokeWidth(size, strokeWidth);
  const cornerRadius = getCornerRadius(size);
  
  // Animation timing - container draws first, check follows
  const containerDuration = duration * 0.45;
  const checkDuration = duration * 0.65;
  const checkDelay = variant !== 'check' ? delay + (duration * 0.35) : delay;
  
  const hasContainer = variant !== 'check';
  
  const containerVariants = filled 
    ? createFilledContainerVariants(containerDuration, delay, reduced)
    : createContainerVariants(containerDuration, delay, reduced);
    
  const checkVariants = createPathVariants(checkDuration, checkDelay, reduced);
  
  const commonPathProps = {
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  
  const shouldAnimate = trigger === 'mount' ? true : animate;

  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      style={{ width: pixelSize, height: pixelSize }}
      initial={shouldAnimate ? "hidden" : "visible"}
      animate="visible"
      aria-hidden="true"
    >
      {/* Circle container */}
      {variant === 'circle-check' && (
        filled ? (
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            fill={color}
            variants={containerVariants}
          />
        ) : (
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            stroke={color}
            strokeWidth={computedStrokeWidth}
            {...commonPathProps}
            variants={containerVariants}
          />
        )
      )}
      
      {/* Square container */}
      {variant === 'square-check' && (
        filled ? (
          <motion.rect
            x="3"
            y="3"
            width="18"
            height="18"
            fill={color}
            variants={containerVariants}
          />
        ) : (
          <motion.rect
            x="3"
            y="3"
            width="18"
            height="18"
            stroke={color}
            strokeWidth={computedStrokeWidth}
            {...commonPathProps}
            variants={containerVariants}
          />
        )
      )}
      
      {/* Rounded square container */}
      {variant === 'rounded-square-check' && (
        filled ? (
          <motion.rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx={cornerRadius}
            ry={cornerRadius}
            fill={color}
            variants={containerVariants}
          />
        ) : (
          <motion.rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx={cornerRadius}
            ry={cornerRadius}
            stroke={color}
            strokeWidth={computedStrokeWidth}
            {...commonPathProps}
            variants={containerVariants}
          />
        )
      )}
      
      {/* Checkmark path - optimized geometry for perfect centering */}
      <motion.path
        d="M6 12l4 4 8-8"
        stroke={filled && hasContainer ? backgroundColor : color}
        strokeWidth={computedStrokeWidth}
        {...commonPathProps}
        variants={checkVariants}
        onAnimationComplete={() => {
          if (!reduced && onAnimationComplete) {
            onAnimationComplete();
          }
        }}
      />
    </motion.svg>
  );
};

export default DrawCheckIcon;
