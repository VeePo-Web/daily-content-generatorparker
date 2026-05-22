import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ResponseCommitment = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-foreground/5 border border-foreground/10 px-6 py-4 flex items-center justify-center gap-3"
    >
      <CheckCircle2 className="w-5 h-5 text-foreground" strokeWidth={1.5} />
      <p className="text-sm font-medium tracking-wide text-foreground/80">
        92% OF MESSAGES ANSWERED WITHIN 12 HOURS
      </p>
    </motion.div>
  );
};

export default ResponseCommitment;
