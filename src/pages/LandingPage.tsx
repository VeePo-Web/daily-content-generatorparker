import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useState, useCallback, useRef, useEffect } from "react";

const editorialEase = [0.25, 0.46, 0.45, 0.94] as const;
const exitEase = [0.4, 0, 0.2, 1] as const;

const LandingPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  // --- PARALLAX REFS ---
  const bgRef = useRef<HTMLDivElement>(null);
  const glitchRef = useRef<HTMLDivElement>(null);
  const smokeRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
  const rafId = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const mx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const my = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    mouse.current.x = mx;
    mouse.current.y = my;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isExiting) return;
    let active = true;
    const tick = () => {
      if (!active) return;
      const m = mouse.current;
      m.cx += (m.x - m.cx) * 0.08;
      m.cy += (m.y - m.cy) * 0.08;
      const x = m.cx;
      const y = m.cy;
      if (bgRef.current) bgRef.current.style.transform = `translate3d(${x * 10}px, ${y * 8}px, 0)`;
      if (glitchRef.current) glitchRef.current.style.transform = `translate3d(${x * 12}px, ${y * 10}px, 0)`;
      if (smokeRef.current) smokeRef.current.style.transform = `translate3d(${x * -18}px, ${y * -15}px, 0)`;
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${x * 5}px, ${y * 4}px, 0)`;
      if (contentRef.current) contentRef.current.style.transform = `translate3d(${x * -2}px, ${y * -2}px, 0)`;
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => { active = false; cancelAnimationFrame(rafId.current); };
  }, [prefersReducedMotion, isExiting]);

  const handleEnter = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    cancelAnimationFrame(rafId.current);
    const delay = prefersReducedMotion ? 300 : 1000;
    setTimeout(() => navigate('/catalogue'), delay);
  }, [isExiting, navigate, prefersReducedMotion]);

  // --- ENTRANCE VARIANTS ---
  const simpleVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
  };

  const backgroundVariants = {
    initial: { opacity: 0, scale: 1 },
    animate: {
      opacity: 0.15,
      scale: 1,
      transition: { duration: 1.4, delay: 0.5, ease: editorialEase },
    },
  };
  const glowVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 1, delay: 1, ease: editorialEase } },
  };
  const brandVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 1.8, delay: 1.4, ease: editorialEase } },
  };
  const verseVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 1.2, delay: 2.4, ease: editorialEase } },
  };
  const verseRefVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8, delay: 2.8, ease: editorialEase } },
  };
  const ctaVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6, delay: 3.2, ease: editorialEase } },
  };

  const v = prefersReducedMotion
    ? {
        background: { ...simpleVariants, animate: { ...simpleVariants.animate, opacity: 0.18 } },
        glow: simpleVariants,
        brand: simpleVariants,
        verse: simpleVariants,
        verseRef: simpleVariants,
        cta: simpleVariants,
      }
    : {
        background: backgroundVariants,
        glow: glowVariants,
        brand: brandVariants,
        verse: verseVariants,
        verseRef: verseRefVariants,
        cta: ctaVariants,
      };

  // --- EXIT ANIMATIONS (driven by isExiting) ---
  const exitSimple = { opacity: 0, transition: { duration: 0.3 } };

  const getExitAnimate = (layer: string) => {
    if (!isExiting) return undefined;
    if (prefersReducedMotion) return exitSimple;

    switch (layer) {
      case 'background':
        return { opacity: 0.25, scale: 1.3, filter: 'blur(3px)', transition: { duration: 0.9, ease: exitEase } };
      case 'glow':
        return { opacity: 0.9, scale: 2.5, transition: { duration: 1, ease: exitEase } };
      case 'brand':
        return { opacity: 0, y: -30, filter: 'blur(8px)', transition: { duration: 0.6, delay: 0.1, ease: exitEase } };
      case 'underline':
        return { scaleX: 0, opacity: 0, transition: { duration: 0.4, delay: 0.05, ease: exitEase } };
      case 'verse':
        return { opacity: 0, y: -15, transition: { duration: 0.5, delay: 0.2, ease: exitEase } };
      case 'verseRef':
        return { opacity: 0, transition: { duration: 0.4, delay: 0.25, ease: exitEase } };
      case 'cta':
        return { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: exitEase } };
      case 'grain':
        return { opacity: 0, transition: { duration: 0.4, delay: 0.3, ease: 'linear' as const } };
      case 'scanlines':
        return { opacity: 0, transition: { duration: 0.3, delay: 0.3, ease: 'linear' as const } };
      case 'smoke':
        return { opacity: 0, transition: { duration: 0.5, delay: 0.2, ease: exitEase } };
      case 'vignette':
        return { opacity: 0.95, transition: { duration: 0.8, delay: 0.2, ease: exitEase } };
      case 'glitch':
        return { opacity: 0, transition: { duration: 0.2, ease: 'linear' as const } };
      default:
        return exitSimple;
    }
  };

  return (
    <>
      <Helmet>
        <title>Line of Judah | Premium Faith-Based Streetwear</title>
        <meta
          name="description"
          content="Premium streetwear for those set apart. Holy garments for glory and for beauty. Enter the world of Line of Judah."
        />
      </Helmet>

      <main className="fixed inset-0 h-[100dvh] overflow-hidden landing-abyss cursor-pointer" onClick={handleEnter} onMouseMove={!prefersReducedMotion ? handleMouseMove : undefined}>
        {/* Layer 0: Ken Burns Background */}
        <motion.div
          ref={bgRef}
          className="absolute inset-0 ken-burns-slow overflow-hidden will-change-transform"
          variants={v.background}
          initial="initial"
          animate={isExiting ? getExitAnimate('background') : "animate"}
        >
          <img
            src="/nav-hero-hoodie.png"
            alt=""
            className="w-full h-full object-cover ken-burns-sepia"
            style={{ objectPosition: "center 40%" }}
          />
        </motion.div>

        {/* Layer 1: Glitch Split Layer */}
        {!prefersReducedMotion && (
          <motion.div
            ref={glitchRef}
            className="glitch-layer will-change-transform"
            animate={isExiting ? getExitAnimate('glitch') : undefined}
          >
            <img
              src="/nav-hero-hoodie.png"
              alt=""
              className="w-full h-full object-cover ken-burns-sepia"
              style={{ objectPosition: "center 40%" }}
            />
          </motion.div>
        )}

        {/* Layer 2: Smoke/Mist */}
        {!prefersReducedMotion && (
          <motion.div
            ref={smokeRef}
            className="smoke-layer will-change-transform"
            animate={isExiting ? getExitAnimate('smoke') : undefined}
          />
        )}

        {/* Layer 3: Extreme Vignette */}
        <motion.div
          className="absolute inset-0 landing-extreme-vignette"
          animate={isExiting ? getExitAnimate('vignette') : undefined}
        />

        {/* Layer 4: Center Glow */}
        <motion.div
          ref={glowRef}
          className="absolute inset-0 landing-glow will-change-transform"
          variants={v.glow}
          initial="initial"
          animate={isExiting ? getExitAnimate('glow') : "animate"}
        />

        {/* Layer 5: Animated Film Grain */}
        <motion.div
          className="absolute inset-0 hero-noise-animated"
          animate={isExiting ? getExitAnimate('grain') : undefined}
        />

        {/* Layer 6: Scan Lines */}
        <motion.div
          className="absolute inset-0 scan-lines"
          animate={isExiting ? getExitAnimate('scanlines') : undefined}
        />

        {/* Content Layer */}
        <div ref={contentRef} className="relative z-10 h-full flex flex-col items-center justify-center will-change-transform">
          <div
            className="shrink-0"
            style={{ height: "max(env(safe-area-inset-top), 24px)" }}
          />

          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {/* Brand Statement */}
            <motion.div
              className="text-center"
              variants={v.brand}
              initial="initial"
              animate={isExiting ? getExitAnimate('brand') : "animate"}
            >
              <h1 className="text-brand-statement text-chrome animate-breathe select-none">
                LINE OF JUDAH
              </h1>
              <motion.div
                className="chrome-underline"
                aria-hidden="true"
                animate={isExiting ? getExitAnimate('underline') : undefined}
              />
            </motion.div>

            {/* Verse Block */}
            <motion.div
              className="verse-unified-block mt-20 md:mt-32"
              variants={v.verse}
              initial="initial"
              animate={isExiting ? getExitAnimate('verse') : "animate"}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="verse-prepend" aria-hidden="true">
                <p className="verse-archival verse-prepend-text">
                  "And thou shalt make holy garments<br />
                  for Aaron thy brother,
                </p>
              </div>
              <p className="verse-archival verse-core text-[0.8rem] md:text-[0.9rem]">
                for{' '}
                <span className="glory-word">glory</span>
                {' '}and for{' '}
                <span className="beauty-word">beauty</span>
                ."
              </p>
              <span className="verse-asv-attribution">— ASV</span>
              <motion.span
                className="verse-reference-archival verse-ref-fixed mt-3"
                variants={v.verseRef}
                initial="initial"
                animate={isExiting ? getExitAnimate('verseRef') : "animate"}
                
              >
                Exodus 28:2
              </motion.span>
            </motion.div>

            {/* Enter Portal */}
            <motion.div
              className="mt-20 md:mt-24"
              variants={v.cta}
              initial="initial"
              animate={isExiting ? getExitAnimate('cta') : "animate"}
            >
              <button
onClick={(e) => { e.stopPropagation(); handleEnter(); }}
                disabled={isExiting}
                aria-label="Enter the Line of Judah store"
                className="enter-portal-chrome block text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/55 hover:text-white/85 focus-visible:outline-none active:scale-[0.97] transition-transform duration-100 cursor-pointer disabled:cursor-default"
              >
                Enter
              </button>
            </motion.div>
          </div>

          <div
            className="shrink-0"
            style={{ height: "max(env(safe-area-inset-bottom), 24px)" }}
          />
        </div>
      </main>
    </>
  );
};

export default LandingPage;
