import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";

const StoryHero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const headline = "FOUNDED ON FAITH.";
  
  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen bg-stone-950 text-white overflow-hidden flex items-center"
    >
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Index watermark */}
      <motion.span 
        className="absolute top-10 right-10 lg:top-12 lg:right-12 text-[10px] tracking-[0.4em] text-white/20 font-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        01
      </motion.span>

      {/* Background image with parallax */}
      <motion.div 
        className="absolute right-0 top-0 w-full md:w-1/2 h-full"
        style={{ y }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent z-10" />
        <img 
          src="/founders.png" 
          alt="Line of Judah founders"
          className="w-full h-full object-cover grayscale opacity-60"
        />
      </motion.div>

      {/* Content */}
      <motion.div 
        className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 xl:px-20"
        style={{ opacity }}
      >
        {/* Eyebrow */}
        <motion.p
          className="text-[10px] tracking-[0.4em] text-white mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          THE GENESIS
        </motion.p>

        {/* Massive headline with character reveal */}
        <h1 className="text-[15vw] md:text-[12vw] lg:text-[8vw] xl:text-[7vw] 2xl:text-[120px] font-light leading-[0.85] tracking-[-0.02em] mb-12">
          {headline.split("").map((char, index) => (
            <motion.span
              key={index}
              className={char === "." ? "text-white" : ""}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5 + index * 0.03,
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        {/* Manifesto text - enhanced with warfare narrative */}
        <motion.div 
          className="max-w-lg lg:max-w-xl space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <p className="text-lg md:text-xl font-light text-white/80 leading-relaxed">
            We didn't start Line of Judah to make clothes. We started it to arm believers.
          </p>
          <p className="text-lg md:text-xl font-light text-white/60 leading-relaxed">
            For those who understand the war is real. Who refuse to stay neutral. 
            Who know their wardrobe is part of their witness.
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <span className="text-[10px] tracking-[0.3em] text-white/40">SCROLL</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default StoryHero;
