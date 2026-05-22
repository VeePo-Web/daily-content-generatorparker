import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import CharacterReveal from "@/components/motion/CharacterReveal";
import DropBadgeCluster from "./DropBadgeCluster";
import ScrollInvitation from "./ScrollInvitation";

const EditorialHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-dvh bg-background overflow-hidden hero-noise group"
    >
      {/* Index Number - 032c Editorial Watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 right-8 z-10 hero-index text-foreground/5 hidden lg:block"
      >
        01
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 min-h-dvh flex flex-col justify-between px-4 xs:px-6 md:px-12 lg:px-16 pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-12 lg:pb-16 safe-area-bottom">

        {/* Center Section - Massive Typography */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Mobile Typography */}
          <div className="block lg:hidden">
            <h1 className="text-hero-massive-mobile-refined text-foreground leading-[0.85]">
              <CharacterReveal
                text="WEAR"
                className="block"
                delay={0.7}
                staggerDelay={0.04}
              />
              <CharacterReveal
                text="YOUR"
                className="block"
                delay={0.9}
                staggerDelay={0.04}
              />
              <CharacterReveal
                text="FAITH."
                className="block text-accent"
                delay={1.1}
                staggerDelay={0.04}
              />
            </h1>
          </div>

          {/* Desktop Typography - Offset Layout */}
          <div className="hidden lg:block">
            <h1 className="text-hero-massive text-foreground leading-[0.85]">
              <CharacterReveal
                text="WEAR"
                className="block"
                delay={0.7}
                staggerDelay={0.025}
              />
              <CharacterReveal
                text="YOUR"
                className="block ml-[15vw]"
                delay={0.9}
                staggerDelay={0.025}
              />
              <CharacterReveal
                text="FAITH."
                className="block text-accent"
                delay={1.1}
                staggerDelay={0.025}
              />
            </h1>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-6 md:mt-8 lg:mt-12 max-w-md text-sm xs:text-base md:text-lg font-light leading-relaxed text-muted-foreground"
          >
            Some people wear crosses as accessories.<br />
            You wear yours as a declaration.<br />
            <span className="text-foreground">This is for you.</span>
          </motion.p>
        </div>

        {/* Bottom Section - CTA + Drop Badge */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-8 pb-4 md:pb-8">
          {/* Left - CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-4 md:gap-6"
          >
            <Link
              to="/catalogue"
              className="editorial-link text-foreground inline-flex items-center gap-3 group/cta touch-target py-2"
            >
              Shop Now
              <motion.span
                className="inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 6 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>

            <Link
              to="/about/our-story"
              className="text-[10px] font-light tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 touch-target-sm py-2"
            >
              Read Our Story
            </Link>
          </motion.div>

          {/* Right - Drop Badge Cluster */}
          <div className="md:text-right">
            <DropBadgeCluster
              dropNumber="001"
              collectionName="Stay Holy Collection"
              limitedPieces={250}
              isLive={true}
              delay={1.6}
            />
          </div>
        </div>
      </div>

      {/* Scroll Invitation */}
      <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-20">
        <ScrollInvitation delay={2.2} />
      </div>
    </section>
  );
};

export default memo(EditorialHero);
