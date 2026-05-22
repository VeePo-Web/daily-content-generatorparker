import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Look {
  id: string;
  name: string;
}

interface LookNavigationMobileProps {
  looks: Look[];
}

const LookNavigationMobile = ({ looks }: LookNavigationMobileProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
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
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial check
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [looks.length]);

  const scrollToSection = (index: number) => {
    if (index === -1) {
      // Scroll to hero
      const container = document.querySelector('.lookbook-scroll-container');
      container?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const section = document.querySelector(`[data-look-index="${index}"]`);
      section?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (looks.length === 0) return null;

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };

  return (
    <motion.nav 
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 lg:hidden safe-area-bottom"
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.5 }}
      aria-label="Look navigation"
    >
      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-3 rounded-full border border-white/10">
        {/* Hero dot */}
        <button
          onClick={() => scrollToSection(-1)}
          className="touch-target-sm flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <motion.span 
            className={`w-2.5 h-2.5 md:w-2 md:h-2 rounded-full transition-colors ${
              activeIndex === -1 
                ? 'bg-champagne-500'
                : 'bg-white/40'
            }`}
            animate={activeIndex === -1 ? { scale: 1.3 } : { scale: 1 }}
            transition={springConfig}
          />
        </button>

        {/* Divider */}
        <div className="w-px h-3 bg-white/20" />

        {/* Look dots */}
        {looks.map((look, index) => (
          <button
            key={look.id}
            onClick={() => scrollToSection(index)}
            className="touch-target-sm flex items-center justify-center"
            aria-label={`Go to ${look.name}`}
          >
            <motion.span 
              className={`w-2.5 h-2.5 md:w-2 md:h-2 rounded-full transition-colors ${
                activeIndex === index 
                  ? 'bg-champagne-500' 
                  : 'bg-white/40'
              }`}
              animate={activeIndex === index ? { scale: 1.3 } : { scale: 1 }}
              transition={springConfig}
            />
          </button>
        ))}
      </div>
    </motion.nav>
  );
};

export default LookNavigationMobile;
