import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { wordReveal, wordItem } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TextRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  once?: boolean;
}

const TextReveal = ({
  text,
  className = "",
  as: Tag = "span",
  delay = 0,
  once = true,
}: TextRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  const words = text.split(" ");

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      <motion.span
        ref={ref}
        variants={wordReveal}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={{ display: "inline-block" }}
        transition={{ delayChildren: delay }}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={wordItem}
            style={{ 
              display: "inline-block", 
              marginRight: "0.25em",
              perspective: "1000px",
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
};

export default TextReveal;
