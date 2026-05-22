import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import CharacterReveal from '@/components/motion/CharacterReveal';

const BrandFilmHero = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();
  
  // Counter animation
  const [counts, setCounts] = useState({ believers: 0, cities: 0, countries: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      const targets = { believers: 10, cities: 45, countries: 5 };
      const duration = 2000;
      const steps = 60;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        setCounts({
          believers: Math.min(Math.floor(targets.believers * progress), targets.believers),
          cities: Math.min(Math.floor(targets.cities * progress), targets.cities),
          countries: Math.min(Math.floor(targets.countries * progress), targets.countries),
        });
        if (step >= steps) clearInterval(timer);
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, hasAnimated]);

  const scrollToContent = () => {
    const nextSection = sectionRef.current?.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const manifestoLines = [
    "If you pray before you post...",
    "If you wear your faith like armor...",
    "You belong here."
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-stone-950"
    >
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Index watermark */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.03 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-8 left-8 text-[20vw] font-light text-white leading-none select-none pointer-events-none z-0"
      >
        01
      </motion.span>

      {/* Main content grid */}
      <div className="relative z-20 min-h-screen flex flex-col lg:grid lg:grid-cols-12 gap-8 px-6 md:px-12 lg:px-16 py-16">
        {/* Left: Typography & Manifesto */}
        <div className="lg:col-span-7 flex flex-col justify-center pt-16 lg:pt-0">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[10px] uppercase tracking-[0.4em] text-white mb-8"
          >
            Born From The Lion
          </motion.p>

          {/* Massive headline */}
          <div className="space-y-2 md:space-y-0">
            <CharacterReveal 
              text="WE DON'T MAKE"
              className="block text-[12vw] md:text-[10vw] lg:text-[8vw] font-light text-white leading-[0.85] tracking-tight"
              as="h1"
              delay={0.3}
              staggerDelay={0.02}
            />
            <CharacterReveal 
              text="CLOTHES."
              className="block text-[12vw] md:text-[10vw] lg:text-[8vw] font-light text-white leading-[0.85] tracking-tight"
              as="span"
              delay={0.6}
              staggerDelay={0.02}
            />
          </div>

          <div className="mt-4 md:mt-2 space-y-2 md:space-y-0">
            <CharacterReveal 
              text="WE MAKE"
              className="block text-[12vw] md:text-[10vw] lg:text-[8vw] font-light text-white leading-[0.85] tracking-tight"
              as="span"
              delay={0.9}
              staggerDelay={0.02}
            />
            <CharacterReveal 
              text="STATEMENTS."
              className="block text-[12vw] md:text-[10vw] lg:text-[8vw] font-light text-white leading-[0.85] tracking-tight"
              as="span"
              delay={1.2}
              staggerDelay={0.02}
            />
          </div>

          {/* Manifesto lines */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15, delayChildren: 1.8 } }
            }}
            className="mt-12 space-y-3"
          >
            {manifestoLines.map((line, index) => (
              <motion.p
                key={index}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                }}
                className="text-lg md:text-xl font-light text-white/70 italic"
              >
                {line}
              </motion.p>
            ))}
          </motion.div>
        </div>

        {/* Right: Asymmetric Image Collage */}
        <div className="lg:col-span-5 flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 1.05, y: 40 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 1.05, y: 40 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            {/* Main image */}
            <div className="relative w-[280px] md:w-[340px] lg:w-[380px] aspect-[3/4] overflow-hidden">
              <img
                src="/founders.png"
                alt="Line of Judah founders"
                className="w-full h-full object-cover md:grayscale md:hover:grayscale-0 transition-all duration-700"
              />
              {/* Amber accent border */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-champagne-500/30 -z-10" />
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="absolute -bottom-8 -left-8 bg-champagne-500 text-stone-950 px-4 py-2"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] font-medium">Est. 2024</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom: Counter stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: 2.2 }}
        className="absolute bottom-24 left-6 md:left-12 lg:left-16 z-20"
      >
        <div className="flex items-center gap-6 md:gap-8 text-white/60">
          <span className="text-sm font-light">
            <span className="text-white font-medium">{counts.believers}K+</span> believers
          </span>
          <span className="w-px h-4 bg-white/20" />
          <span className="text-sm font-light">
            <span className="text-white font-medium">{counts.cities}</span> cities
          </span>
          <span className="w-px h-4 bg-white/20" />
          <span className="text-sm font-light">
            <span className="text-white font-medium">{counts.countries}</span> countries
          </span>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToContent}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white transition-colors z-20"
        aria-label="Scroll to content"
      >
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-8 w-8" />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default BrandFilmHero;
