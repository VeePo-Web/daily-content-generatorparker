import { useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import ShopTheLook from "./ShopTheLook";
import SwipeableLookCard from "./SwipeableLookCard";
import SwipeLookbook from "./SwipeLookbook";
import TextReveal from "@/components/motion/TextReveal";
import { easing, timing } from "@/lib/animations";
import { useCart } from "@/hooks/useCart";

interface LookProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  position: string | null;
  product_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

interface Look {
  id: string;
  name: string;
  headline: string;
  scripture_reference: string | null;
  description: string | null;
  image_url: string;
  video_url: string | null;
  gender: string;
  products: LookProduct[];
}

interface LookSectionProps {
  look: Look;
  index: number;
}

type LayoutVariant = 'full-bleed-left' | 'split-reverse' | 'full-bleed-right' | 'split-standard' | 'bottom-bar';

const getLayoutVariant = (index: number): LayoutVariant => {
  const variants: LayoutVariant[] = ['full-bleed-left', 'split-reverse', 'full-bleed-right', 'split-standard', 'bottom-bar'];
  return variants[index % 5];
};

const LookSection = ({ look, index }: LookSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();
  const { openCart } = useCart();
  const [bottomBarSwipeOpen, setBottomBarSwipeOpen] = useState(false);

  const layout = getLayoutVariant(index);
  const lookIndex = String(index + 1).padStart(2, '0');
  const genderLabel = look.gender === 'male' ? "MEN'S" : look.gender === 'female' ? "WOMEN'S" : "UNISEX";

  const isFullBleed = layout === 'full-bleed-left' || layout === 'full-bleed-right';
  const isReversed = layout === 'split-reverse';
  const isBottomBar = layout === 'bottom-bar';

  // Content position classes for full-bleed layouts
  const contentPosition = layout === 'full-bleed-left' 
    ? 'left-0 bottom-0' 
    : layout === 'full-bleed-right' 
    ? 'right-0 bottom-0' 
    : '';

  const contentAlign = layout === 'full-bleed-right' ? 'text-right items-end' : 'text-left items-start';

  return (
    <section
      ref={sectionRef}
      data-look-index={index}
      className="lookbook-section-height w-full snap-start relative overflow-hidden"
    >
      {/* Oversized Look Index - Background Element */}
      <motion.div
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 pointer-events-none z-0 hidden md:block"
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 0.03, scale: 1 } : {}}
        transition={{ duration: timing.cinematic, ease: easing.editorial, delay: 0.2 }}
      >
        <span 
          className="text-[20rem] font-extralight text-white leading-none select-none"
          style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '-0.05em' }}
        >
          {lookIndex}
        </span>
      </motion.div>

      {/* ===== FULL-BLEED LAYOUTS ===== */}
      {isFullBleed && (
        <div className="flex flex-col lg:block w-full h-full">
          {/* Image - Full bleed on desktop, 70% on mobile */}
          <SwipeableLookCard
            lookId={look.id}
            lookName={look.name}
            products={look.products}
            onViewBag={openCart}
          >
            <div className="w-full lookbook-image-height lg:h-full lg:absolute lg:inset-0 relative overflow-hidden">
              <motion.div
                className="w-full h-full"
                initial={prefersReducedMotion ? {} : { scale: 1.1 }}
                animate={isInView ? { scale: 1.02 } : {}}
                transition={{ duration: timing.cinematic * 1.5, ease: easing.editorial }}
              >
                <img
                  src={look.image_url}
                  alt={look.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              {/* Heavy gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
              <div className={`absolute inset-0 ${layout === 'full-bleed-right' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-stone-950/60 to-transparent hidden lg:block`} />

              {/* Look Index Badge - Mobile */}
              <motion.div
                className="absolute top-4 left-4 lg:hidden pointer-events-none"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.3 }}
              >
                <span className="text-5xl font-extralight text-white/20">
                  {lookIndex}
                </span>
              </motion.div>
            </div>
          </SwipeableLookCard>

          {/* Content - Overlaid on desktop, below on mobile */}
          <div className={`
            w-full lookbook-content-height lg:h-auto lg:absolute lg:bottom-0 ${contentPosition}
            lg:w-2/5 lg:max-w-lg flex items-center
            bg-stone-900 lg:bg-transparent px-6 md:px-8 lg:px-12 py-6 lg:py-16 pb-safe
            z-10
          `}>
            <div className={`w-full ${contentAlign}`}>
              <LookContent 
                look={look} 
                lookIndex={lookIndex} 
                genderLabel={genderLabel} 
                isInView={isInView} 
                prefersReducedMotion={prefersReducedMotion}
                align={layout === 'full-bleed-right' ? 'right' : 'left'}
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== SPLIT LAYOUTS ===== */}
      {(layout === 'split-standard' || layout === 'split-reverse') && (
        <div className="flex flex-col lg:flex-row w-full h-full">
          {/* Image Side */}
          <SwipeableLookCard
            lookId={look.id}
            lookName={look.name}
            products={look.products}
            onViewBag={openCart}
          >
            <div className={`w-full lg:w-3/5 lookbook-image-height lg:h-full relative overflow-hidden ${isReversed ? 'lg:order-2' : ''}`}>
              <motion.div
                className="w-full h-full"
                initial={prefersReducedMotion ? {} : { clipPath: isReversed ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" }}
                animate={isInView ? { clipPath: "inset(0% 0% 0% 0%)" } : {}}
                transition={{ duration: timing.cinematic, ease: easing.editorial }}
              >
                <motion.img
                  src={look.image_url}
                  alt={look.name}
                  className="w-full h-full object-cover"
                  initial={prefersReducedMotion ? {} : { scale: 1.15 }}
                  animate={isInView ? { scale: 1.02 } : {}}
                  transition={{ duration: timing.cinematic * 1.5, ease: easing.editorial }}
                  style={{ transformOrigin: isReversed ? 'right center' : 'left center' }}
                />
              </motion.div>
              
              {/* Gradient overlay */}
              <div className={`absolute inset-0 pointer-events-none ${
                isReversed 
                  ? 'bg-gradient-to-l from-stone-900/80 via-stone-900/20 to-transparent' 
                  : 'bg-gradient-to-r from-transparent via-stone-900/20 to-stone-900/80'
              }`} />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent lg:hidden pointer-events-none" />

              {/* Look Index Badge - Mobile */}
              <motion.div
                className="absolute top-4 left-4 lg:hidden pointer-events-none"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.3 }}
              >
                <span className="text-5xl font-extralight text-white/20">
                  {lookIndex}
                </span>
              </motion.div>
            </div>
          </SwipeableLookCard>

          {/* Content Side */}
          <div className={`w-full lg:w-2/5 lookbook-content-height lg:h-full flex items-center justify-center bg-stone-900 px-4 md:px-6 lg:px-12 py-6 pb-safe relative z-10 ${isReversed ? 'lg:order-1' : ''}`}>
            <div className="max-w-md w-full">
              <LookContent 
                look={look} 
                lookIndex={lookIndex} 
                genderLabel={genderLabel} 
                isInView={isInView} 
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== BOTTOM BAR LAYOUT ===== */}
      {isBottomBar && (
        <div className="flex flex-col w-full h-full">
          {/* Image - Takes majority of space */}
          <SwipeableLookCard
            lookId={look.id}
            lookName={look.name}
            products={look.products}
            onViewBag={openCart}
          >
            <div className="w-full lookbook-image-height lg:flex-[7] relative overflow-hidden">
              <motion.div
                className="w-full h-full"
                initial={prefersReducedMotion ? {} : { scale: 1.1 }}
                animate={isInView ? { scale: 1.02 } : {}}
                transition={{ duration: timing.cinematic * 1.5, ease: easing.editorial }}
              >
                <img
                  src={look.image_url}
                  alt={look.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />

              {/* Look Index Badge - Mobile */}
              <motion.div
                className="absolute top-4 left-4 pointer-events-none"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.3 }}
              >
                <span className="text-5xl lg:text-6xl font-extralight text-white/20">
                  {lookIndex}
                </span>
              </motion.div>
            </div>
          </SwipeableLookCard>

          {/* Content Bar - Bottom strip */}
          <div className="w-full lookbook-content-height lg:flex-[3] bg-stone-900 flex items-center px-4 md:px-8 lg:px-12 py-4 pb-safe">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full gap-4 lg:gap-8">
              {/* Left: Text info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-light border border-white/10 px-3 py-1">
                    {genderLabel}
                  </span>
                  {look.scripture_reference && (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-champagne-500 font-light">
                      {look.scripture_reference}
                    </span>
                  )}
                </div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-extralight italic text-white leading-tight truncate">
                  "{look.headline}"
                </h2>
                <p className="text-sm text-white/60 font-light mt-1 hidden md:block">{look.name}</p>
              </div>

              {/* Right: Shop the look */}
              <div className="flex-shrink-0 lg:w-[400px] hidden lg:block">
                <ShopTheLook products={look.products} lookName={look.name} lookId={look.id} />
              </div>
              {/* Mobile CTA for bottom-bar layout */}
              <div className="lg:hidden flex-shrink-0">
                <button
                  onClick={(e) => {
                    (e.currentTarget as HTMLElement).blur();
                    setBottomBarSwipeOpen(true);
                  }}
                  className="w-full h-11 bg-champagne-600 text-white text-sm font-medium uppercase tracking-widest hover:bg-champagne-700 transition-colors px-6"
                >
                  Shop This Look
                </button>
              </div>
            </div>
          </div>
          <SwipeLookbook
            isOpen={bottomBarSwipeOpen}
            onClose={() => setBottomBarSwipeOpen(false)}
            onViewBag={openCart}
            lookId={look.id}
            lookName={look.name}
            products={look.products}
          />
        </div>
      )}
    </section>
  );
};

// Extracted content component for reuse across layouts
function LookContent({ 
  look, 
  lookIndex, 
  genderLabel, 
  isInView, 
  prefersReducedMotion,
  align = 'left'
}: { 
  look: Look; 
  lookIndex: string; 
  genderLabel: string; 
  isInView: boolean; 
  prefersReducedMotion: boolean | null;
  align?: 'left' | 'right';
}) {
  const [swipeOpen, setSwipeOpen] = useState(false);
  const { openCart } = useCart();

  return (
    <>
      {/* Gender Badge */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.4 }}
        className="mb-2 md:mb-4"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-light border border-white/10 px-3 py-1">
          {genderLabel}
        </span>
      </motion.div>

      {/* Scripture Reference */}
      {look.scripture_reference && (
        <motion.p 
          className="text-xs uppercase tracking-[0.25em] text-champagne-500 mb-2 md:mb-4 font-light"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.5 }}
        >
          {look.scripture_reference}
        </motion.p>
      )}

      {/* Headline */}
      <div className="mb-2 md:mb-3">
        <TextReveal 
          text={`"${look.headline}"`}
          as="h2"
          className="text-lg md:text-2xl lg:text-4xl font-extralight italic text-white leading-tight"
          delay={0.6}
        />
      </div>

      {/* Look Name - hidden on mobile, headline is enough */}
      <motion.h3 
        className="hidden md:block text-xl font-light text-white/80 mb-4"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.8 }}
      >
        {look.name}
      </motion.h3>

      {/* Description - hidden on mobile, shown on tablet+ with max-width */}
      {look.description && (
        <motion.p 
          className="hidden md:block text-sm text-white/60 font-light leading-relaxed mb-6 md:mb-8 max-w-sm"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.9 }}
        >
          {look.description}
        </motion.p>
      )}

      {/* Shop the Look - desktop only */}
      <motion.div
        className="hidden lg:block"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: timing.slow, ease: easing.editorial, delay: 1.0 }}
      >
        <ShopTheLook products={look.products} lookName={look.name} lookId={look.id} />
      </motion.div>

      {/* Mobile CTA - compact button that opens SwipeLookbook drawer */}
      <motion.div
        className="lg:hidden mt-3"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.9 }}
      >
        <button
          onClick={(e) => {
            (e.currentTarget as HTMLElement).blur();
            setSwipeOpen(true);
          }}
          className="w-full h-11 bg-champagne-600 text-white text-sm font-medium uppercase tracking-widest hover:bg-champagne-700 transition-colors"
        >
          Shop This Look
        </button>
      </motion.div>

      {/* SwipeLookbook Drawer for mobile */}
      <SwipeLookbook
        isOpen={swipeOpen}
        onClose={() => setSwipeOpen(false)}
        onViewBag={openCart}
        lookId={look.id}
        lookName={look.name}
        products={look.products}
      />
    </>
  );
}

export default LookSection;
