import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WearTheMissionCTA = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[80vh] md:min-h-screen overflow-hidden"
    >
      {/* Index watermark */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.03 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-8 right-8 text-[20vw] font-light text-white leading-none select-none pointer-events-none z-0"
      >
        07
      </motion.span>

      <div className="grid lg:grid-cols-5 min-h-[80vh] md:min-h-screen">
        {/* Left: Lifestyle Image (60%) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative lg:col-span-3 h-[40vh] lg:h-auto overflow-hidden"
        >
          <img
            src="/founders.png"
            alt="Line of Judah community"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-forest-500 opacity-20 lg:opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent lg:hidden" />
        </motion.div>

        {/* Right: CTA Block (40%) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="lg:col-span-2 bg-forest-500 flex items-center justify-center p-8 md:p-12 lg:p-16 relative"
        >
          {/* Amber accent border */}
          <div className="absolute top-0 left-0 w-full h-2 bg-stone-950" />
          
          <div className="max-w-md text-center lg:text-left">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-[10px] uppercase tracking-[0.4em] text-white/60 mb-6"
            >
              Join the Movement
            </motion.p>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight mb-6"
            >
              Ready to Wear<br />
              the Mission?
            </motion.h2>

            {/* Tribe counter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center justify-center lg:justify-start gap-3 mb-8"
            >
              <Users className="h-5 w-5 text-white/70" />
              <span className="text-lg font-light text-white/80">
                Join <span className="font-medium text-white">10K+ believers</span> wearing their faith
              </span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                asChild
                size="lg"
                className="bg-white text-forest-500 hover:bg-white/90 rounded-none px-8 py-6 text-base font-light tracking-wide group"
              >
                <Link to="/category/all">
                  Shop the Collection
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-forest-500 rounded-none px-8 py-6 text-base font-light tracking-wide bg-transparent"
              >
                <Link to="/ambassador">
                  Become an Ambassador
                </Link>
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-10 pt-8 border-t border-white/20"
            >
              <p className="text-sm text-white/60 font-light">
                Free shipping on orders over $99 • Easy returns • Made with conviction
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WearTheMissionCTA;
