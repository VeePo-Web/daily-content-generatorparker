import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Megaphone, Crown, Flame } from 'lucide-react';

const pillars = [
  {
    icon: Megaphone,
    number: '01',
    title: 'EVANGELISM',
    subtitle: 'Every outfit is an open door.',
    description: "You don't preach — you spark curiosity. They ask. You answer. That's how it works.",
    alignment: 'left' as const,
  },
  {
    icon: Crown,
    number: '02',
    title: 'IDENTITY',
    subtitle: "You're not confused about who you are.",
    description: "Chosen. Called. Commissioned. Your clothes should reflect that. Not hide it.",
    alignment: 'right' as const,
  },
  {
    icon: Flame,
    number: '03',
    title: 'CONVICTION',
    subtitle: 'No apologies. No compromise.',
    description: "You believe what you believe. Now dress like it. If that offends someone — good.",
    alignment: 'center' as const,
  },
];

interface PillarSectionProps {
  pillar: typeof pillars[0];
  index: number;
}

const PillarSection = ({ pillar, index }: PillarSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const Icon = pillar.icon;

  const getAlignmentClasses = () => {
    switch (pillar.alignment) {
      case 'left':
        return 'md:flex-row text-left';
      case 'right':
        return 'md:flex-row-reverse text-left md:text-right';
      case 'center':
        return 'flex-col text-center items-center';
      default:
        return '';
    }
  };

  const isEven = index % 2 === 1;
  const bgClass = isEven ? 'bg-stone-950 text-white' : 'bg-background text-foreground';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      className={`relative py-20 md:py-28 lg:py-32 ${bgClass} overflow-hidden`}
    >
      {/* Number watermark */}
      <motion.span
        initial={{ opacity: 0, x: pillar.alignment === 'right' ? -50 : 50 }}
        animate={isInView ? { opacity: 0.03, x: 0 } : { opacity: 0, x: pillar.alignment === 'right' ? -50 : 50 }}
        transition={{ duration: 1, delay: 0.2 }}
        className={`absolute top-1/2 -translate-y-1/2 text-[40vw] md:text-[30vw] font-light leading-none select-none pointer-events-none ${
          pillar.alignment === 'right' ? 'left-8' : 'right-8'
        } ${isEven ? 'text-white' : 'text-foreground'}`}
      >
        {pillar.number}
      </motion.span>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className={`flex flex-col gap-8 md:gap-12 ${getAlignmentClasses()}`}>
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`flex-shrink-0 ${pillar.alignment === 'center' ? '' : 'md:w-1/3'}`}
          >
            <Icon 
              className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-champagne-500 ${
                pillar.alignment === 'center' ? 'mx-auto' : ''
              }`} 
              strokeWidth={1}
            />
          </motion.div>

          {/* Content */}
          <div className={`${pillar.alignment === 'center' ? 'max-w-2xl' : 'md:w-2/3'}`}>
            {/* Title */}
            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight mb-4 md:mb-6"
            >
              {pillar.title}
            </motion.h3>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className={`text-xl md:text-2xl font-light italic mb-6 ${
                isEven ? 'text-champagne-500' : 'text-champagne-600'
              }`}
            >
              {pillar.subtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className={`text-lg md:text-xl font-light leading-relaxed max-w-xl ${
                isEven ? 'text-white/70' : 'text-muted-foreground'
              } ${pillar.alignment === 'center' ? 'mx-auto' : ''}`}
            >
              {pillar.description}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ValuesPillars = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.5 });

  return (
    <section className="relative">
      {/* Header Section */}
      <div 
        ref={headerRef}
        className="bg-background py-16 md:py-24"
      >
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-6"
          >
            We don't stand for: Hiding. Blending in. Playing it safe.
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground tracking-tight"
          >
            What We <span className="text-champagne-500">Do</span> Stand For
          </motion.h2>
        </div>
      </div>

      {/* Individual Pillar Sections */}
      {pillars.map((pillar, index) => (
        <PillarSection key={pillar.title} pillar={pillar} index={index} />
      ))}
    </section>
  );
};

export default ValuesPillars;
