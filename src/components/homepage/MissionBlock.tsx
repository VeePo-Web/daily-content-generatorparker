import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import ParallaxImage from "@/components/motion/ParallaxImage";
import TextReveal from "@/components/motion/TextReveal";
import { hoverScale, tapScale } from "@/lib/animations";
import { useIsMobile } from "@/hooks/use-mobile";

const MissionBlock = () => {
  const isMobile = useIsMobile();

  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[70vh] overflow-hidden">
      {/* Full-bleed Background with Parallax - Disabled on mobile for performance */}
      <ParallaxImage 
        src="/products/stay-holy-hoodie/flat-front.png"
        alt="Line of Judah"
        className="absolute inset-0"
        speed={isMobile ? 0 : 0.2}
      />
      
      <motion.div 
        className="absolute inset-0 bg-background/40"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Content Overlay - Magazine ad style */}
      <div className="relative z-10 min-h-[60vh] md:min-h-[70vh] flex items-center justify-center px-4 xs:px-6">
        <ScrollReveal variant="fadeUp" delay={0.2}>
          <motion.div 
            className="bg-white/95 backdrop-blur-sm p-6 xs:p-8 md:p-12 lg:p-16 max-w-[90vw] md:max-w-2xl text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Eyebrow */}
            <motion.p 
              className="text-eyebrow text-accent mb-4 md:mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              The line in the sand
            </motion.p>

            {/* Headline - Responsive scaling */}
            <div className="mb-4 md:mb-6">
              <TextReveal 
                text="NOT FOR EVERYONE." 
                className="text-3xl xs:text-4xl md:text-5xl lg:text-hero text-stone-950 font-light tracking-tight"
                as="h2"
                delay={0.4}
              />
            </div>

            {/* Quote */}
            <motion.p 
              className="text-sm xs:text-base md:text-editorial text-stone-600 mb-6 md:mb-8 max-w-md mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              We make clothes for those who answer a higher call. The ones who start conversations, not confrontations. If that's you — welcome. If not — that's okay too.
            </motion.p>

            {/* CTA - Enhanced touch target */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={hoverScale}
              whileTap={tapScale}
            >
              <Link 
                to="/about/our-story"
                className="inline-flex items-center gap-2 text-stone-950 text-sm font-medium tracking-wide hover:text-accent transition-colors group touch-target py-3"
              >
                Our Story
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default memo(MissionBlock);