import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollProgressProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const ScrollProgress = ({ containerRef }: ScrollProgressProps) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div className="hidden lg:block fixed left-6 top-1/3 h-1/3 w-[2px] bg-stone-500/10 z-50">
      <motion.div
        className="w-full bg-champagne-500/60 origin-top"
        style={{ 
          scaleY: scrollYProgress, 
          opacity,
          height: '100%',
          transformOrigin: 'top'
        }}
      />
    </div>
  );
};

export default ScrollProgress;
