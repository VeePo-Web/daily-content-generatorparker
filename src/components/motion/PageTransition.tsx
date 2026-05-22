import { motion } from "framer-motion";
import { ReactNode } from "react";
import { pageTransition } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
