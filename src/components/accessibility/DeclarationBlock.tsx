import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeIn } from "@/lib/animations";

interface DeclarationBlockProps {
  quote: string;
  attribution: string;
}

const DeclarationBlock = ({ quote, attribution }: DeclarationBlockProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeIn}
      className="relative mb-16 py-12 md:py-16 border-y border-foreground/10"
    >
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-champagne-500/[0.02] to-transparent" />
      
      <div className="relative max-w-4xl mx-auto text-center px-4">
        {/* Quote marks */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-6xl md:text-8xl text-champagne-500/10 font-serif leading-none select-none" aria-hidden="true">
          "
        </div>
        
        {/* Quote text */}
        <blockquote className="relative z-10">
          <p className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed tracking-tight text-foreground">
            {quote}
          </p>
        </blockquote>
        
        {/* Attribution */}
        <footer className="mt-6 md:mt-8">
          <cite className="text-xs md:text-sm tracking-[0.2em] text-muted-foreground font-medium not-italic">
            {attribution}
          </cite>
        </footer>
      </div>
    </motion.div>
  );
};

export default DeclarationBlock;
