import { motion, Variants, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";
import { fadeUp, slideInLeft, slideInRight, scaleReveal, maskReveal, fadeIn } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type AnimationVariant = "fadeUp" | "fadeIn" | "slideInLeft" | "slideInRight" | "scaleReveal" | "maskReveal";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  threshold?: number;
}

const variantMap: Record<AnimationVariant, Variants> = {
  fadeUp,
  fadeIn,
  slideInLeft,
  slideInRight,
  scaleReveal,
  maskReveal,
};

const ScrollReveal = ({
  children,
  variant = "fadeUp",
  delay = 0,
  duration,
  once = true,
  className = "",
  threshold = 0.2,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const selectedVariant = variantMap[variant];
  
  // Create custom variants with delay and optional duration override
  const customVariants: Variants = {
    hidden: selectedVariant.hidden,
    visible: {
      ...selectedVariant.visible,
      transition: {
        ...(typeof selectedVariant.visible === 'object' && 'transition' in selectedVariant.visible 
          ? selectedVariant.visible.transition 
          : {}),
        delay,
        ...(duration ? { duration } : {}),
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={customVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
