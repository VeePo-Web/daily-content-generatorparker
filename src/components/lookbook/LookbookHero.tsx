import { motion, useReducedMotion } from "framer-motion";
import { easing, timing } from "@/lib/animations";

const LookbookHero = () => {
  const prefersReducedMotion = useReducedMotion();
  
  const scrollToNext = () => {
    const nextSection = document.querySelector('[data-look-index="0"]');
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      className="lookbook-section-height w-full flex items-end relative bg-stone-950 snap-start overflow-hidden"
    >
      {/* Background Image with heavy overlay */}
      <div className="absolute inset-0">
        <img 
          src="/nav-hero-hoodie.png" 
          alt="" 
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/60 to-transparent" />
      </div>

      {/* Noise grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Season Tag - Top Right */}
      <motion.div
        className="absolute top-8 right-6 md:right-12 z-10"
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.8 }}
      >
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-light">
          SS25
        </span>
      </motion.div>

      {/* Eyebrow - Brand - Top Left */}
      <motion.div
        className="absolute top-8 left-6 md:left-12 z-10"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.2 }}
      >
        <p className="text-[10px] uppercase tracking-[0.4em] text-white font-light">
          Line of Judah
        </p>
      </motion.div>

      {/* Content - Bottom Left aligned (032c cover style) */}
      <div className="relative z-10 px-6 md:px-12 pb-16 md:pb-20 w-full max-w-7xl">
        {/* Main Title - Massive editorial type */}
        <div className="mb-6">
          <div className="overflow-hidden">
            <motion.span
              className="block text-[15vw] md:text-[12vw] lg:text-[10rem] font-extralight text-white/90 leading-[0.85] tracking-[-0.02em]"
              initial={prefersReducedMotion ? {} : { y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: timing.cinematic, ease: easing.editorial, delay: 0.4 }}
            >
              THE
            </motion.span>
          </div>
          <div className="overflow-hidden">
            <motion.span
              className="block text-[15vw] md:text-[12vw] lg:text-[10rem] font-extralight italic text-white leading-[0.85] tracking-[-0.02em]"
              initial={prefersReducedMotion ? {} : { y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: timing.cinematic, ease: easing.editorial, delay: 0.55 }}
            >
              LOOKBOOK
            </motion.span>
          </div>
        </div>

        {/* Horizontal Rule */}
        <motion.div
          className="w-16 h-px bg-white/20 mb-6"
          initial={prefersReducedMotion ? {} : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.75 }}
          style={{ transformOrigin: 'left' }}
        />

        {/* Subtitle */}
        <motion.p
          className="text-sm md:text-base font-light text-white/45 max-w-sm leading-relaxed"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.9 }}
        >
          Curated fits for the anointed.<br />
          Shop by design, not just category.
        </motion.p>

        {/* Scroll Indicator */}
        <motion.button 
          onClick={scrollToNext}
          className="mt-12 flex items-center gap-4 text-white/30 hover:text-white/60 transition-colors cursor-pointer group min-h-[48px]"
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: timing.slow, ease: easing.editorial, delay: 1.2 }}
          aria-label="Scroll to explore looks"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-light">
            Scroll
          </span>
          <motion.div
            className="w-12 h-px bg-gradient-to-r from-white/30 to-transparent"
            animate={prefersReducedMotion ? {} : { scaleX: [1, 0.5, 1] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: "left" }}
          />
        </motion.button>
      </div>

      {/* Look count indicator - Right side */}
      <motion.div
        className="hidden md:block absolute right-6 md:right-12 bottom-16 md:bottom-20 text-right"
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: timing.slow, ease: easing.editorial, delay: 1.3 }}
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-light mb-1">
          Looks
        </p>
        <p className="text-2xl font-extralight text-white/40">
          05
        </p>
      </motion.div>
    </section>
  );
};

export default LookbookHero;
