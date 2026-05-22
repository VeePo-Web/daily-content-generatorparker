import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const AmbassadorHero = () => {
  const headlineWords = ["WE", "DON'T", "WANT", "FOLLOWERS."];
  const sublineWords = ["WE", "WANT", "SOLDIERS."];

  return (
    <section className="relative min-h-screen bg-background text-foreground overflow-hidden flex flex-col justify-center hero-noise">
      {/* Background index number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[50vw] md:text-[35vw] font-extralight tracking-[-0.02em] leading-none opacity-[0.03] text-foreground">
          01
        </span>
      </div>

      <div className="relative z-10 px-6 md:px-12 lg:px-24 py-32 md:py-40">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 md:mb-12"
        >
          <span className="text-eyebrow text-foreground/50">
            Ambassador Program — Application Open
          </span>
        </motion.div>

        {/* Main headline */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-wrap gap-x-[0.25em]">
            {headlineWords.map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.4 + index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="text-hero-massive-mobile md:text-hero-massive text-foreground"
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Subline */}
        <div className="mb-12 md:mb-16">
          <div className="flex flex-wrap gap-x-[0.25em]">
            {sublineWords.map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.8 + index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="text-hero-massive-mobile md:text-hero-massive text-accent"
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Manifesto text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="max-w-2xl"
        >
          <p className="text-editorial text-foreground/70 mb-6">
            We're not looking for influencers. We're looking for believers who
            happen to have influence. The ones who don't just wear the message —
            they <em>live</em> it.
          </p>
          <p className="text-editorial text-foreground/70">
            If you're here for free clothes, keep scrolling.
            <br />
            If you're here to represent something bigger than yourself — welcome.
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-eyebrow text-foreground/40">Scroll to apply</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-foreground/40" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AmbassadorHero;
