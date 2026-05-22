import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import TextReveal from "@/components/motion/TextReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatPrice } from "@/lib/currency";

const FeaturedDrop = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative w-full featured-drop-height max-h-[90dvh] md:max-h-none bg-background overflow-hidden">
      {/* Full-bleed Background Image */}
      <motion.div
        className="absolute inset-0"
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 1.1 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <img 
          src="/products/heavenly-crewneck/lifestyle.png"
          alt="Heavenly Crewneck"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
      </motion.div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full featured-drop-height flex items-center safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 xs:px-6 md:px-12 w-full">
          <div className="max-w-xl">
            {/* Drop Badge */}
            <ScrollReveal variant="fadeUp" delay={0.1}>
              <div className="inline-flex items-center gap-2 mb-6 md:mb-8">
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold tracking-wider uppercase px-3 py-1">
                  Drop 002
                </span>
                <span className="text-caption text-foreground/60 uppercase">
                  For the set apart
                </span>
              </div>
            </ScrollReveal>

            {/* Product Name - Editorial oversized */}
            <h2 className="text-display-sm text-foreground mb-4 md:mb-6">
              <TextReveal text="HEAVENLY" delay={0.2} />
              <br />
              <TextReveal text="CREWNECK" delay={0.4} />
            </h2>

            {/* Description */}
            <ScrollReveal variant="fadeUp" delay={0.5}>
              <p className="text-sm xs:text-base md:text-lg font-light text-foreground/70 mb-6 md:mb-8 max-w-md leading-relaxed">
                You'll get asked about this.<br />
                What you say next is up to you.
              </p>
            </ScrollReveal>

            {/* Price & CTA */}
            <ScrollReveal variant="fadeUp" delay={0.6}>
              <div className="flex items-center gap-6 md:gap-8">
                <span className="text-xl md:text-2xl font-light text-foreground">{formatPrice(65)}</span>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Link 
                    to="/product/heavenly-crewneck"
                    className="inline-flex items-center gap-3 text-foreground text-sm font-medium tracking-wide hover:text-accent transition-colors group touch-target py-3"
                  >
                    Carry the Message
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                  </Link>
                </motion.div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Product Index - 032c style - scaled for mobile */}
      <ScrollReveal variant="fadeIn" delay={0.8}>
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 text-foreground/30 text-[80px] md:text-[120px] lg:text-[200px] font-light leading-none select-none pointer-events-none">
          01
        </div>
      </ScrollReveal>
    </section>
  );
};

export default memo(FeaturedDrop);