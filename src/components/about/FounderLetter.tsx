import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const FounderLetter = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section 
      ref={sectionRef}
      className="relative bg-stone-100 overflow-hidden"
    >
      {/* Index watermark */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.03 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-8 right-8 text-[20vw] font-light text-stone-950 leading-none select-none pointer-events-none z-0"
      >
        04
      </motion.span>

      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute top-10 left-10 lg:top-12 lg:left-12 text-[10px] tracking-[0.4em] text-champagne-500 z-10"
      >
        THE LETTER
      </motion.p>

      {/* Centered typography-only layout */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 md:px-12 lg:px-16 py-32 md:py-48">
        <div className="max-w-3xl mx-auto text-center">
          {/* Giant quotation mark */}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="block text-[160px] md:text-[200px] lg:text-[240px] font-serif text-champagne-500/15 leading-none -mb-24 md:-mb-32 lg:-mb-40 select-none"
          >
            "
          </motion.span>

          {/* Quote */}
          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative z-10"
          >
            <p className="text-3xl md:text-4xl lg:text-5xl font-light text-stone-950 leading-relaxed tracking-tight">
              I got tired of hiding.
            </p>
            <p className="text-lg md:text-xl font-light text-stone-500 leading-relaxed mt-8 max-w-2xl mx-auto">
              Not my faith — I never hid that. But I was tired of my clothes 
              not matching my conviction. Everything in the market was either 
              corny Christian or watered-down safe.
            </p>
            <p className="text-xl md:text-2xl font-light text-stone-950 leading-relaxed mt-8 italic">
              So I built what I wanted to wear.
            </p>
          </motion.blockquote>

          {/* Signature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-16"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-px bg-champagne-500" />
              <p className="text-lg font-light text-stone-950 italic tracking-wide">
                Jordan Williams
              </p>
              <div className="w-16 h-px bg-champagne-500" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mt-3">
              Founder & Creative Director
            </p>
          </motion.div>

          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="text-stone-500 font-light leading-relaxed mt-14 max-w-xl mx-auto text-base"
          >
            For the believer who won't apologize. Who starts conversations. 
            Who knows that if you're not for us, you're against us.
            <br /><br />
            <span className="text-stone-950 font-medium">This is Line of Judah.</span> You're here because you're supposed to be.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default FounderLetter;
