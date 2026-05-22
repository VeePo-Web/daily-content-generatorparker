import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const StoryCallingSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      className="relative bg-stone-950 text-white py-32 md:py-48 overflow-hidden"
    >
      {/* Index watermark */}
      <motion.span 
        className="absolute top-10 right-10 lg:top-12 lg:right-12 text-[10px] tracking-[0.4em] text-white/10 font-light"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        02
      </motion.span>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 xl:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left: Giant quote */}
          <div className="relative">
            {/* Giant quotation mark */}
            <motion.span
              className="absolute -top-12 lg:-top-16 -left-2 lg:-left-4 text-[200px] lg:text-[240px] xl:text-[280px] font-serif text-champagne-500/10 leading-none select-none pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              "
            </motion.span>

            <motion.blockquote
              className="relative z-10 text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-light leading-tight tracking-tight"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Every thread is a declaration. Every stitch is a stand. In the war between light and darkness, your wardrobe is your armor<span className="text-champagne-500">.</span>
            </motion.blockquote>

            {/* Rotated vertical text */}
            <motion.span
              className="hidden lg:block absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] tracking-[0.4em] text-white/20 whitespace-nowrap origin-center"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              THE CALLING
            </motion.span>
          </div>

          {/* Right: Story text */}
          <div className="space-y-8">
            <motion.p
              className="text-[10px] tracking-[0.4em] text-champagne-500"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              OUR STORY
            </motion.p>

            <motion.p
              className="text-lg md:text-xl font-light text-white/70 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Line of Judah was born from a calling — not to make clothes, but to equip warriors. 
              We believe there's a great war raging. Not for territory. For souls. And in that war, 
              what you wear matters. It marks you. It declares you. It positions you.
            </motion.p>

            <motion.p
              className="text-lg md:text-xl font-light text-white/50 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              This isn't a clothing company. It's an armory for the spiritually bold. 
              For the believers who refuse to blend in while the world burns. 
              For those who understand neutrality isn't an option.
            </motion.p>

            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="w-16 h-px bg-champagne-500" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryCallingSection;
