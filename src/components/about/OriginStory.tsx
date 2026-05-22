import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const OriginStory = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen bg-stone-950 text-white overflow-hidden py-24 md:py-32"
    >
      {/* JUDAH watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.03 } : { opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        style={{ y: parallaxY }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      >
        <span className="text-[30vw] md:text-[25vw] font-light text-white tracking-tighter whitespace-nowrap">
          JUDAH
        </span>
      </motion.div>

      {/* Index watermark */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.03 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-8 left-8 text-[20vw] font-light text-white leading-none select-none pointer-events-none z-0"
      >
        03
      </motion.span>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Lion imagery */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative order-2 lg:order-1"
          >
            <div className="aspect-square relative overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-champagne-900/30 via-stone-900 to-stone-950" />
              
              {/* Refined lion head silhouette */}
              <svg 
                viewBox="0 0 400 400" 
                className="absolute inset-0 w-full h-full p-8 md:p-12"
                fill="none"
              >
                {/* Mane outer ring */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 2.5, delay: 0.5, ease: "easeOut" }}
                  d="M200 40 C170 38 145 48 125 60 C105 72 88 90 78 105 C65 125 55 148 52 170 C48 195 50 218 55 240 C42 255 35 272 32 290 C28 310 32 328 42 342 C52 356 68 365 88 370 C105 374 125 375 145 374 L255 374 C275 375 295 374 312 370 C332 365 348 356 358 342 C368 328 372 310 368 290 C365 272 358 255 345 240 C350 218 352 195 348 170 C345 148 335 125 322 105 C312 90 295 72 275 60 C255 48 230 38 200 40"
                  stroke="url(#lionGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_20px_rgba(231,213,183,0.3)]"
                />
                {/* Inner face contour */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
                  d="M200 80 C175 82 155 95 142 112 C130 128 122 150 120 172 C118 195 122 215 130 232 C120 245 115 260 112 275 C110 288 115 300 125 308 C135 316 150 320 168 322 L232 322 C250 320 265 316 275 308 C285 300 290 288 288 275 C285 260 280 245 270 232 C278 215 282 195 280 172 C278 150 270 128 258 112 C245 95 225 82 200 80"
                  stroke="url(#lionGradientInner)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
                {/* Left ear */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
                  d="M148 110 C138 95 125 88 118 92 C112 96 112 108 118 122 C124 135 135 142 148 138"
                  stroke="url(#lionGradient)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                {/* Right ear */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 1, delay: 1.3, ease: "easeOut" }}
                  d="M252 110 C262 95 275 88 282 92 C288 96 288 108 282 122 C276 135 265 142 252 138"
                  stroke="url(#lionGradient)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                {/* Eyes */}
                <motion.ellipse
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 2 }}
                  cx="168" cy="175" rx="12" ry="8"
                  className="fill-champagne-500/50"
                />
                <motion.ellipse
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 2.1 }}
                  cx="232" cy="175" rx="12" ry="8"
                  className="fill-champagne-500/50"
                />
                {/* Eye inner glow */}
                <motion.circle
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.3, delay: 2.3 }}
                  cx="172" cy="174" r="3"
                  className="fill-champagne-400/80"
                />
                <motion.circle
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.3, delay: 2.4 }}
                  cx="236" cy="174" r="3"
                  className="fill-champagne-400/80"
                />
                {/* Nose */}
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 2.2 }}
                  d="M200 210 L188 228 C192 234 196 238 200 240 C204 238 208 234 212 228 Z"
                  className="fill-champagne-500/35"
                />
                {/* Mouth lines */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 0.4 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.8, delay: 2.5, ease: "easeOut" }}
                  d="M200 240 L200 255 M188 248 C192 258 196 262 200 264 C204 262 208 258 212 248"
                  stroke="#dccfa4"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
                {/* Whisker dots */}
                <motion.circle initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.3 } : {}} transition={{ delay: 2.6 }} cx="160" cy="235" r="2" fill="#dccfa4" />
                <motion.circle initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.3 } : {}} transition={{ delay: 2.65 }} cx="152" cy="228" r="1.5" fill="#dccfa4" />
                <motion.circle initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.3 } : {}} transition={{ delay: 2.7 }} cx="240" cy="235" r="2" fill="#dccfa4" />
                <motion.circle initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.3 } : {}} transition={{ delay: 2.75 }} cx="248" cy="228" r="1.5" fill="#dccfa4" />
                
                <defs>
                  <linearGradient id="lionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dccfa4" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#dccfa4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#dccfa4" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="lionGradientInner" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dccfa4" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#dccfa4" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-champagne-500/10 via-transparent to-transparent opacity-50" />
            </div>

            {/* Corner accents */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-l-2 border-t-2 border-champagne-500/30" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-champagne-500/30" />
          </motion.div>

          {/* Right: Story content */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[10px] uppercase tracking-[0.4em] text-white"
            >
              The Name
            </motion.p>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight"
            >
              Line of
              <span className="block text-white">Judah</span>
            </motion.h2>

            {/* Body */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-6 text-white/70 font-light leading-relaxed text-lg"
            >
              <p>
                <span className="text-white font-medium">Judah</span> means "praise." 
                The lion is the symbol of the tribe of Judah — from which the Messiah descended. 
                Genesis 49:9 declares:
              </p>
              <p className="text-xl text-white/90 italic">
                "Judah is a lion's cub... like a lion he crouches and lies down."
              </p>
              <p>
                Line of Judah is a declaration of identity. When you wear it, you're 
                not just wearing a brand — you're wearing your lineage as a child of
                the King.
              </p>
            </motion.div>

            {/* Scripture pull-quote */}
            <motion.blockquote
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="relative pl-8 border-l-4 border-white/40"
            >
              <p className="text-2xl md:text-3xl font-light text-white italic leading-relaxed">
                "The Lion of the tribe of Judah has triumphed."
              </p>
              <cite className="text-sm text-white/50 not-italic mt-4 block uppercase tracking-[0.2em]">
                — Revelation 5:5
              </cite>
            </motion.blockquote>

            {/* Bottom line */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="text-white font-light text-xl"
            >
              You carry the roar of the Lion within you.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Gradient bridge to white section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white z-20 pointer-events-none" />
    </section>
  );
};

export default OriginStory;
