import { Gift, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBundleDiscounts } from "@/hooks/useBundleDiscounts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";

interface BundleSavingsRowProps {
  variant?: "drawer" | "checkout";
}

const BundleSavingsRow = ({ variant = "drawer" }: BundleSavingsRowProps) => {
  const { totalBundleSavings, hasActiveBundles, activeBundles } = useBundleDiscounts();
  const prefersReducedMotion = useReducedMotion();

  if (!hasActiveBundles) return null;

  const bundleCount = activeBundles.length;
  const bundleLabel = bundleCount === 1 
    ? "Complete Look Discount" 
    : `${bundleCount} Bundle Discounts`;

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex items-center justify-between py-2",
          variant === "checkout" && "border-t border-border/50 mt-2 pt-3"
        )}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={prefersReducedMotion ? {} : { 
              scale: [1, 1.15, 1],
            }}
            transition={{ 
              duration: 0.5, 
              repeat: 2, 
              repeatDelay: 3 
            }}
          >
            <Gift className="w-4 h-4 text-champagne-600" />
          </motion.div>
          <span className="text-sm text-champagne-700 dark:text-champagne-400 font-medium">
            {bundleLabel}
          </span>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles className="w-3 h-3 text-champagne-500" />
          </motion.div>
        </div>
        
        <motion.span
          className="text-sm font-medium text-champagne-700 dark:text-champagne-400"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          -{formatPrice(totalBundleSavings)}
        </motion.span>
      </motion.div>
    </AnimatePresence>
  );
};

export default BundleSavingsRow;
