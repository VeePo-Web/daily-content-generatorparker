import { Link } from "react-router-dom";
import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import TextReveal from "@/components/motion/TextReveal";
import ImageReveal from "@/components/motion/ImageReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing } from "@/lib/animations";

interface HowItMinistersProps {
  ministryStatement?: string | null;
  productName: string;
}

const HowItMinisters = ({ ministryStatement, productName }: HowItMinistersProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();
  
  // Parallax effect for image
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const defaultStatement = `The ${productName} is more than a garment—it's a daily declaration of your faith. Every time you put it on, you're choosing to walk boldly in purpose, carrying a message that speaks before you do.`;

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay,
        ease: easing.editorial,
      }
    })
  };

  if (prefersReducedMotion) {
    return (
      <section className="w-full py-16 lg:py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="aspect-[4/5] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden order-2 lg:order-1">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl opacity-10">✝</span>
              </div>
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-xs font-light text-muted-foreground uppercase tracking-widest">
                  Faith in Action
                </p>
              </div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <p className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em]">The Purpose</p>
              <h2 className="text-2xl lg:text-3xl font-light text-foreground leading-tight">
                More Than A Garment.<br />A Daily Declaration.
              </h2>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">{ministryStatement || defaultStatement}</p>
              <p className="text-sm font-light text-muted-foreground leading-relaxed italic">
                "And thou shalt make holy garments for Aaron thy brother, for glory and for beauty."
                <span className="not-italic block mt-1 text-xs">— Exodus 28:2 (ASV)</span>
              </p>
              <Link to="/about/our-story" className="inline-block text-sm font-light text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors">
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="w-full py-16 lg:py-24 px-6 bg-muted/30 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side with parallax */}
          <motion.div 
            className="aspect-[4/5] relative overflow-hidden order-2 lg:order-1"
            style={{ y: prefersReducedMotion ? 0 : imageY }}
          >
            <ImageReveal
              src=""
              alt="Faith in Action"
              className="w-full h-full"
              direction="left"
              delay={0.2}
            />
            {/* Overlay content for placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <motion.span 
                className="text-6xl opacity-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 0.1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: easing.editorial }}
              >
                ✝
              </motion.span>
            </div>
            <motion.div 
              className="absolute bottom-8 left-8 right-8"
              variants={fadeUpVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0.6}
            >
              <p className="text-xs font-light text-muted-foreground uppercase tracking-widest">
                Faith in Action
              </p>
            </motion.div>
          </motion.div>

          {/* Content Side with staggered reveal */}
          <div className="space-y-6 order-1 lg:order-2">
            <motion.p 
              className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em]"
              variants={fadeUpVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0}
            >
              The Purpose
            </motion.p>
            
            <div>
              <TextReveal 
                text="More Than A Garment."
                as="h2"
                className="text-2xl lg:text-3xl font-light text-foreground leading-tight"
                delay={0.1}
              />
              <TextReveal 
                text="A Daily Declaration."
                as="span"
                className="text-2xl lg:text-3xl font-light text-foreground leading-tight block"
                delay={0.3}
              />
            </div>
            
            <motion.p 
              className="text-sm font-light text-muted-foreground leading-relaxed"
              variants={fadeUpVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0.5}
            >
              {ministryStatement || defaultStatement}
            </motion.p>
            
            <motion.p 
              className="text-sm font-light text-champagne-600/80 leading-relaxed italic"
              variants={fadeUpVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0.6}
            >
              "And thou shalt make holy garments for Aaron thy brother, for glory and for beauty."
              <span className="not-italic block mt-1 text-xs text-muted-foreground">— Exodus 28:2 (ASV)</span>
            </motion.p>
            
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0.7}
            >
              <Link 
                to="/about/our-story"
                className="inline-block text-sm font-light text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors group"
              >
                <motion.span
                  className="inline-block"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  Read Our Story →
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItMinisters;
