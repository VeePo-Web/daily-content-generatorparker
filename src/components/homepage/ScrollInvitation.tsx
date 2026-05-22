import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ScrollInvitationProps {
  delay?: number;
}

const ScrollInvitation = ({ delay = 2.2 }: ScrollInvitationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY < 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ delay, duration: 0.6 }}
      className="flex flex-col items-center gap-3 pointer-events-none"
    >
      {/* Text */}
      <span className="text-[10px] font-light tracking-[0.3em] uppercase text-background/60">
        Scroll to explore
      </span>

      {/* Animated Line */}
      <div className="relative h-8 md:h-12 w-px">
        <div className="absolute inset-0 bg-background/20" />
        {!prefersReducedMotion && (
          <motion.div
            className="absolute top-0 left-0 w-full bg-background/60"
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{
              delay: delay + 0.3,
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        )}
      </div>

      {/* Arrow */}
      <motion.svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        className="text-background/60"
        animate={prefersReducedMotion ? {} : { y: [0, 4, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <path
          d="M1 3L5 7L9 3"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
};

export default ScrollInvitation;