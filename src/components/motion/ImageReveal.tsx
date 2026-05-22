import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { easing, timing } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  once?: boolean;
}

const ImageReveal = ({
  src,
  alt,
  className = "",
  direction = "up",
  delay = 0,
  once = true,
}: ImageRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();

  const clipPaths = {
    up: {
      hidden: "inset(100% 0% 0% 0%)",
      visible: "inset(0% 0% 0% 0%)",
    },
    down: {
      hidden: "inset(0% 0% 100% 0%)",
      visible: "inset(0% 0% 0% 0%)",
    },
    left: {
      hidden: "inset(0% 100% 0% 0%)",
      visible: "inset(0% 0% 0% 0%)",
    },
    right: {
      hidden: "inset(0% 0% 0% 100%)",
      visible: "inset(0% 0% 0% 0%)",
    },
  };

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={`overflow-hidden ${className}`}
      initial={{ clipPath: clipPaths[direction].hidden }}
      animate={{ 
        clipPath: isInView ? clipPaths[direction].visible : clipPaths[direction].hidden 
      }}
      transition={{
        duration: timing.cinematic,
        ease: easing.editorial,
        delay,
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        initial={{ scale: 1.2 }}
        animate={{ scale: isInView ? 1 : 1.2 }}
        transition={{
          duration: timing.cinematic * 1.2,
          ease: easing.editorial,
          delay,
        }}
      />
    </motion.div>
  );
};

export default ImageReveal;
