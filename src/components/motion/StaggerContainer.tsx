import { motion, useInView, Variants } from "framer-motion";
import { ReactNode, useRef, Children, cloneElement, isValidElement } from "react";
import { staggerItem } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  once?: boolean;
  threshold?: number;
}

const StaggerContainer = ({
  children,
  className = "",
  staggerDelay = 0.08,
  delayChildren = 0.1,
  once = true,
  threshold = 0.1,
}: StaggerContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren,
      },
    },
  };

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return (
            <motion.div variants={staggerItem}>
              {child}
            </motion.div>
          );
        }
        return child;
      })}
    </motion.div>
  );
};

export default StaggerContainer;
