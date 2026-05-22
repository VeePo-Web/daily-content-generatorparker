import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const pillars = [
  { label: "Calgary, AB", sublabel: "Where It Started" },
  { label: "2024", sublabel: "Year Founded" },
  { label: "Faith-Forward", sublabel: "The Standard" },
];


interface CountUpNumberProps {
  target: number;
  suffix: string;
  isInView: boolean;
}

const CountUpNumber = ({ target, suffix, isInView }: CountUpNumberProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, target]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(0);
    }
    return num.toString();
  };

  return (
    <span>
      {target >= 1000 ? formatNumber(count * 1000) : count}
      {suffix}
    </span>
  );
};

const StoryCommunityStats = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone-950 text-white py-32 md:py-48 overflow-hidden"
    >
      {/* Index watermark */}
      <motion.span
        className="absolute top-10 right-10 lg:top-12 lg:right-12 text-[10px] tracking-[0.4em] text-white/20 font-light"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        04
      </motion.span>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 xl:px-20">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20 xl:mb-24">
          <motion.p
            className="text-[10px] tracking-[0.4em] text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            THE FORCES
          </motion.p>
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            The Movement Grows<span className="text-white">.</span>
          </motion.h2>
        </div>

        {/* Pillars row */}
        <div className="grid grid-cols-3 gap-6 md:gap-12 lg:gap-16 mb-24 md:mb-32">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
            >
              <span className="block text-2xl md:text-4xl lg:text-5xl font-light tracking-tight mb-2">
                {pillar.label}
              </span>
              <span className="text-[10px] md:text-xs tracking-[0.15em] lg:tracking-[0.2em] text-white/40 uppercase">
                {pillar.sublabel}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-white/40 font-light tracking-wide">
            Coming soon...
          </p>
        </div>
      </div>
    </section>
  );
};

export default StoryCommunityStats;
