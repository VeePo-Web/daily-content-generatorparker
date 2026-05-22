import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedPriceProps {
  value: number;
  className?: string;
  prefix?: string;
}

/**
 * Animated price counter for outfit total
 * Smoothly animates between price values with a satisfying counter effect
 */
export const AnimatedPrice = ({ value, className = '', prefix = '$' }: AnimatedPriceProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const duration = 300; // ms
    const startTime = performance.now();

    if (startValue === endValue) return;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * eased;
      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  return (
    <AnimatePresence mode="wait">
      <motion.span 
        key={displayValue}
        initial={{ opacity: 0.8, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={className}
      >
        {prefix}{displayValue.toLocaleString()}
      </motion.span>
    </AnimatePresence>
  );
};
