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
  // — END COMING SOON —

  /* Full impact map — restore by removing the coming soon block above
  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-stone-950 overflow-hidden"
    >
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Index watermark */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.02 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-8 left-8 text-[20vw] font-light text-white leading-none select-none pointer-events-none z-0"
      >
        06
      </motion.span>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-champagne-500 mb-4">
            Our Reach
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-tight">
            The Mission<br />
            <span className="text-white/40">Spreads</span>
          </h2>
        </motion.div>

        {/* Stats Grid - Massive Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 mb-24">
          <AnimatedCounter value={10} suffix="K+" label="Believers" delay={0} isInView={isInView} />
          <AnimatedCounter value={45} suffix="+" label="Cities" delay={200} isInView={isInView} />
          <AnimatedCounter value={20} suffix="+" label="Campuses" delay={400} isInView={isInView} />
          <AnimatedCounter value={5} suffix="" label="Countries" delay={600} isInView={isInView} />
        </div>

        {/* Map Visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative h-48 md:h-72 lg:h-80 mb-12"
        >
          {/* Minimal world silhouette - just North America outline */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              viewBox="0 0 400 200" 
              className="w-full h-full opacity-10"
              fill="currentColor"
            >
              <path 
                d="M50 60 Q80 40 120 50 Q140 35 180 45 Q220 40 260 55 Q300 50 340 70 Q350 90 340 120 Q320 140 280 150 Q240 155 200 145 Q160 150 120 140 Q80 145 50 130 Q30 110 50 60" 
                className="text-white"
              />
            </svg>
          </div>

          {/* Pulsing city dots */}
          <div className="absolute inset-0">
            {cityPositions.map((pos, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                className="absolute"
                style={{ top: pos.top, left: pos.left }}
              >
                  <div className="relative">
                    <div className="w-2 h-2 bg-champagne-500 rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* City Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="overflow-hidden"
        >
          <div className="flex gap-8 animate-[marquee_30s_linear_infinite]">
            {[...cities, ...cities].map((city, i) => (
              <span 
                key={i} 
                className="text-sm text-white/30 uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-8"
              >
                {city}
                <span className="w-1 h-1 bg-champagne-500/50 rounded-full" />
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Add keyframe animation for marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
  */
};

export default ImpactMap;
