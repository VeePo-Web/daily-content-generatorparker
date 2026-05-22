import { useState, useRef } from "react";
import { motion, useInView, Variants, Transition } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/use-mobile";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";
import { useEmailTypoDetection } from "@/hooks/useEmailTypoDetection";
import EmailTypoSuggestion from "@/components/ui/EmailTypoSuggestion";
import { Button } from "@/components/ui/button";

const emailSchema = z.string().email("Please enter a valid email address");

interface EmailOptInProps {
  variant?: "default" | "compact";
}

const EmailOptIn = ({ variant = "default" }: EmailOptInProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { toast } = useToast();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  
  // Email typo detection
  const emailTypo = useEmailTypoDetection({
    initialEmail: email,
    onSuggestionAccepted: (correctedEmail) => setEmail(correctedEmail),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    try {
      const { error: supabaseError } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email, source: "front_line_main" }]);

      if (supabaseError) {
        if (supabaseError.code === "23505") {
          setError("You're already enlisted.");
        } else {
          throw supabaseError;
        }
      } else {
        setIsSuccess(true);
        toast({
          title: "Welcome to the front line.",
          description: "Your first deployment awaits. Check your inbox.",
        });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Easing as tuple for Framer Motion type safety
  const editorialEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  // Character animation for headline
  const headlineWords = ["JOIN THE", "FRONT", "LINE."];
  
  const getCharacterTransition = (delay: number): Transition => ({
    type: "spring" as const,
    stiffness: 100,
    damping: 12,
    delay: prefersReducedMotion ? 0 : delay,
  });

  const lineVariants: Variants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 0.8, ease: editorialEase, delay: 1.0 },
    },
  };

  const getFadeUpTransition = (delay: number): Transition => ({
    duration: 0.6,
    ease: editorialEase,
    delay,
  });

  return (
    <section
      ref={ref}
      className="relative bg-background text-foreground py-16 md:py-24 lg:py-32 xl:py-40 overflow-hidden"
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle crosshair background element */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.04 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none hidden md:block"
      >
        <div className="relative w-[60vw] h-[60vw] max-w-[600px] max-h-[600px]">
          {/* Horizontal line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-foreground" />
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground" />
          {/* Circle */}
          <div className="absolute inset-[15%] border border-foreground rounded-full" />
        </div>
      </motion.div>

      <div className="container mx-auto px-4 xs:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 lg:gap-16 items-end">
          {/* Typography Zone - 60% */}
          <div className="lg:col-span-3">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={getFadeUpTransition(0.2)}
              className="text-[10px] uppercase tracking-[0.4em] text-foreground/50 mb-6 md:mb-8"
            >
              Intelligence Briefings • Drop Alerts • First Deployment
            </motion.p>

            {/* Massive headline with character animation - Responsive scaling */}
            <div className="space-y-0">
              {headlineWords.map((word, wordIndex) => (
                <div
                  key={word}
                  className="overflow-hidden"
                >
                  <motion.h2
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className={`text-[12vw] xs:text-[11vw] sm:text-[10vw] md:text-[9vw] lg:text-[7vw] font-extralight leading-[0.85] tracking-[-0.04em] ${
                      word === "FRONT" ? "text-white" : "text-foreground"
                    }`}
                  >
                    {prefersReducedMotion ? (
                      word
                    ) : (
                      word.split("").map((char, charIndex) => (
                        <motion.span
                          key={charIndex}
                          initial={{ opacity: 0, y: 20, rotateX: -15 }}
                          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 20, rotateX: -15 }}
                          transition={getCharacterTransition(wordIndex * 0.15 + charIndex * 0.02 + 0.3)}
                          style={{
                            display: "inline-block",
                            whiteSpace: char === " " ? "pre" : "normal",
                          }}
                        >
                          {char}
                        </motion.span>
                      ))
                    )}
                  </motion.h2>
                </div>
              ))}
            </div>
          </div>

          {/* Form Zone - 40% */}
          <div className="lg:col-span-2">
            {/* Divider line */}
            <motion.div
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={lineVariants}
              className="w-full h-px bg-foreground/20 mb-6 md:mb-8 origin-left"
            />

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                    className="w-8 h-8 rounded-full bg-champagne-400 flex items-center justify-center"
                  >
                    <DrawCheckIcon size="sm" className="text-background" delay={200} />
                  </motion.div>
                  <span className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight">
                    ENLISTED.
                  </span>
                </div>
                <p className="text-sm text-foreground/60 uppercase tracking-[0.15em]">
                  Your briefing is on the way. Welcome to the front line.
                </p>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="space-y-4 md:space-y-6"
              >
                {/* Floating label input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={getFadeUpTransition(1.2)}
                  className="relative"
                >
                  <label
                    htmlFor="newsletter-email"
                    className={`absolute left-0 transition-all duration-300 text-foreground/50 uppercase tracking-[0.2em] ${
                      isFocused || email
                        ? "text-[10px] -top-5"
                        : "text-xs top-2"
                    }`}
                  >
                    Your Email
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      emailTypo.setEmail(e.target.value);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                      setIsFocused(false);
                      emailTypo.checkForTypos(email);
                    }}
                    className={`w-full bg-transparent border-0 border-b-2 py-2 text-base md:text-lg text-foreground placeholder-transparent focus:outline-none transition-colors duration-300 ${
                      isFocused ? "border-champagne-400" : "border-foreground/30"
                    }`}
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                  <EmailTypoSuggestion
                    suggestion={emailTypo.suggestion || ''}
                    show={emailTypo.showSuggestion}
                    onAccept={emailTypo.acceptSuggestion}
                    onDismiss={emailTypo.dismissSuggestion}
                    variant="compact"
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-6 left-0 text-xs text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}
                </motion.div>

                {/* Mobile: Full-width button | Desktop: Text link CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={getFadeUpTransition(1.4)}
                  className="pt-4 md:pt-0"
                >
                  {isMobile ? (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-forest-500 hover:bg-forest-400 text-white font-medium rounded-none"
                    >
                      {isLoading ? "ENLISTING..." : "ENLIST NOW"}
                    </Button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative text-xs uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground transition-colors duration-300 flex items-center gap-2 mt-8 touch-target py-3"
                    >
                      <span>{isLoading ? "ENLISTING..." : "ENLIST NOW"}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      {/* Animated underline */}
                      <span className="absolute -bottom-1 left-0 h-px bg-foreground origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100 w-full" />
                    </button>
                  )}
                </motion.div>

                {/* Subtext */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={getFadeUpTransition(1.6)}
                  className="text-xs text-foreground/40 uppercase tracking-[0.15em] pt-2 md:pt-4"
                >
                  First access to drops. Field reports. 15% off first deployment.
                </motion.p>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailOptIn;