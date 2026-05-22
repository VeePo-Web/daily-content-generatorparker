import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const values = [
  {
    index: "01",
    title: "ARMOR, NOT ACCESSORIES",
    description: "Every piece is designed for the battlefield. You're not decorating yourself — you're suiting up. When you put on Line of Judah, you're declaring which side you fight for in the war between light and darkness.",
  },
  {
    index: "02",
    title: "SILENT WITNESS, LOUD PRESENCE",
    description: "Before you speak, they see. Your clothing preaches before your mouth opens. In a world drowning in noise, what you wear screams your allegiance. We don't make neutral clothes for neutral people.",
  },
  {
    index: "03",
    title: "TRIBE OVER TREND",
    description: "We're not building a customer base. We're building an army. Fashion fades. Faith fights. When you wear the lion, you're not following culture — you're confronting it.",
  },
];

const StoryValuesGrid = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone-100 text-stone-950 py-32 md:py-48 overflow-hidden"
    >
      {/* Grid pattern background */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Index watermark */}
      <motion.span 
        className="absolute top-10 right-10 lg:top-12 lg:right-12 text-[10px] tracking-[0.4em] text-stone-950/10 font-light"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        05
      </motion.span>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 xl:px-20">
        {/* Section header */}
        <div className="mb-16 lg:mb-20 xl:mb-24">
          <motion.p
            className="text-[10px] tracking-[0.4em] text-champagne-500 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            THE DOCTRINE
          </motion.p>
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            What We Stand For<span className="text-champagne-500">.</span>
          </motion.h2>
        </div>

        {/* Values grid - pure typography, no icons */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 xl:gap-12">
          {values.map((value, index) => (
            <motion.div
              key={value.index}
              className="relative group"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + index * 0.15, duration: 0.8 }}
            >
              {/* Massive index number as visual anchor */}
              <span className="block text-[56px] md:text-[100px] lg:text-[120px] xl:text-[140px] font-light leading-none text-stone-200 mb-2 md:mb-4 transition-colors duration-500 group-hover:text-champagne-500/20">
                {value.index}
              </span>

              {/* Content */}
              <div className="relative -mt-6 lg:-mt-16 xl:-mt-20 pl-2">
                <h3 className="text-lg md:text-xl font-medium tracking-wide mb-4 text-stone-950">
                  {value.title}
                </h3>
                <p className="text-sm md:text-base text-stone-500 leading-relaxed font-light">
                  {value.description}
                </p>

                {/* Subtle accent line */}
                <motion.div
                  className="w-12 lg:w-16 h-px bg-champagne-500/30 mt-6"
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ delay: 0.6 + index * 0.15, duration: 0.6 }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gradient bridge to dark section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-stone-950 pointer-events-none z-20" />
    </section>
  );
};

export default StoryValuesGrid;
