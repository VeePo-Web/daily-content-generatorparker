import { motion, useInView } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
  isInView: boolean;
}

const AnimatedCounter = ({ value, suffix = '', label, delay = 0, isInView }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      const timeout = setTimeout(() => {
        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= value) {
            setCount(value);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
        
        return () => clearInterval(timer);
      }, delay);
      
      return () => clearTimeout(timeout);
    }
  }, [value, delay, hasAnimated, isInView]);

  return (
    <div className="text-center">
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: delay / 1000 }}
        className="text-[80px] md:text-[100px] lg:text-[140px] font-light text-white leading-none tracking-tighter"
      >
        {count}
        <span className="text-champagne-500">{suffix}</span>
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.6, delay: delay / 1000 + 0.3 }}
        className="text-[10px] uppercase tracking-[0.3em] text-white/50 mt-2"
      >
        {label}
      </motion.p>
    </div>
  );
};

const ImpactMap = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const cities = [
    'Calgary', 'Toronto', 'Vancouver', 'Los Angeles', 'Dallas', 
    'Atlanta', 'Houston', 'Phoenix', 'Denver', 'Seattle',
    'Chicago', 'Miami', 'New York', 'Austin', 'Portland'
  ];

  // City positions for map dots
  const cityPositions = [
    { top: '25%', left: '18%' },   // Calgary
    { top: '35%', left: '78%' },   // Toronto
    { top: '22%', left: '12%' },   // Vancouver
    { top: '55%', left: '15%' },   // Los Angeles
    { top: '62%', left: '45%' },   // Dallas
    { top: '58%', left: '72%' },   // Atlanta
    { top: '68%', left: '42%' },   // Houston
    { top: '58%', left: '25%' },   // Phoenix
    { top: '42%', left: '32%' },   // Denver
    { top: '28%', left: '10%' },   // Seattle
    { top: '38%', left: '55%' },   // Chicago
    { top: '72%', left: '78%' },   // Miami
    { top: '40%', left: '85%' },   // New York
    { top: '65%', left: '38%' },   // Austin
    { top: '32%', left: '8%' },    // Portland
  ];

  // — COMING SOON — remove this block to restore the full map
  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 bg-stone-950 overflow-hidden flex items-center justify-center">
      <p className="text-white/40 font-light tracking-[0.3em] text-sm uppercase">
        Our Reach: Coming soon...
      </p>
    </section>
  );
};

export default ImpactMap;
