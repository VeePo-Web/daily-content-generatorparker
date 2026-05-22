import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number; // Parallax intensity (0.1 = subtle, 0.5 = dramatic)
  direction?: "up" | "down";
}

const ParallaxImage = ({
  src,
  alt,
  className = "",
  speed = 0.2,
  direction = "up",
}: ParallaxImageProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const multiplier = direction === "up" ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed * multiplier, -100 * speed * multiplier]);

  if (prefersReducedMotion) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover will-change-transform"
        style={{ y, scale: 1.1 }}
      />
    </div>
  );
};

export default ParallaxImage;
