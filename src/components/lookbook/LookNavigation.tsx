import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface Look {
  id: string;
  name: string;
}

interface LookNavigationProps {
  looks: Look[];
  onNavigate?: (index: number) => void;
}

const LookNavigation = ({ looks, onNavigate }: LookNavigationProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-look-index]');
      let currentIndex = -1;

      sections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          currentIndex = idx;
        }
      });

      setActiveIndex(currentIndex);
    };

    // Use the scroll container instead of window
    const container = document.querySelector('.lookbook-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [looks.length]);

  const scrollToSection = (index: number) => {
    const section = document.querySelector(`[data-look-index="${index}"]`);
    section?.scrollIntoView({ behavior: 'smooth' });
    onNavigate?.(index);
  };

  const scrollToHero = () => {
    const container = document.querySelector('.lookbook-scroll-container');
    container?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToFitGuide = () => {
    const section = document.querySelector('[data-section="fit-guide"]');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  if (looks.length === 0) return null;

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };

  return (
    <motion.nav 
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-4"
      initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1.5 }}
      aria-label="Look navigation"
    >
      {/* Progress line */}
      <div className="absolute right-[5px] top-0 bottom-0 w-px bg-white/10" />

      {/* Hero dot */}
      <motion.button
        onClick={scrollToHero}
        onMouseEnter={() => setHoveredIndex(-2)}
        onMouseLeave={() => setHoveredIndex(null)}
        className="flex items-center gap-3 group relative"
        aria-label="Scroll to top"
        whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        transition={springConfig}
      >
        {/* Label */}
        <AnimatePresence>
          {(hoveredIndex === -2 || activeIndex === -1) && (
            <motion.span 
              className="text-[10px] uppercase tracking-[0.2em] text-white/70 whitespace-nowrap"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              Top
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Dot */}
        <motion.span 
          className={`w-2.5 h-2.5 rounded-full border relative z-10 ${
            activeIndex === -1 
              ? 'bg-champagne-500 border-champagne-500'
              : 'border-white/30 bg-stone-900'
          }`}
          animate={activeIndex === -1 ? { scale: 1.3 } : { scale: 1 }}
          transition={springConfig}
        />
      </motion.button>

      {/* Look dots */}
      {looks.map((look, index) => (
        <motion.button
          key={look.id}
          onClick={() => scrollToSection(index)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className="flex items-center gap-3 group relative"
          aria-label={`Scroll to ${look.name}`}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          transition={springConfig}
        >
          {/* Label */}
          <AnimatePresence>
            {(hoveredIndex === index || activeIndex === index) && (
              <motion.span 
                className="text-[10px] uppercase tracking-[0.2em] text-white/70 whitespace-nowrap"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {look.name}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Dot */}
          <motion.span 
            className={`w-2.5 h-2.5 rounded-full border relative z-10 ${
              activeIndex === index 
                ? 'bg-champagne-500 border-champagne-500' 
                : 'border-white/30 bg-stone-900'
            }`}
            animate={activeIndex === index ? { scale: 1.3 } : { scale: 1 }}
            transition={springConfig}
          />
        </motion.button>
      ))}

      {/* Divider */}
      <div className="w-4 h-px bg-white/10 mr-[3px]" />

      {/* Fit Guide dot */}
      <motion.button
        onClick={scrollToFitGuide}
        onMouseEnter={() => setHoveredIndex(-3)}
        onMouseLeave={() => setHoveredIndex(null)}
        className="flex items-center gap-3 group relative"
        aria-label="Scroll to fit guide"
        whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        transition={springConfig}
      >
        {/* Label */}
        <AnimatePresence>
          {hoveredIndex === -3 && (
            <motion.span 
              className="text-[10px] uppercase tracking-[0.2em] text-white/70 whitespace-nowrap"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              Fit Guide
            </motion.span>
          )}
        </AnimatePresence>

        {/* Dot */}
        <motion.span 
          className="w-2.5 h-2.5 rounded-full border border-white/30 bg-stone-900 relative z-10"
          whileHover={{ borderColor: 'rgba(255,255,255,0.6)' }}
          transition={springConfig}
        />
      </motion.button>
    </motion.nav>
  );
};

export default LookNavigation;
