import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useEmailTypoDetection } from "@/hooks/useEmailTypoDetection";
import EmailTypoSuggestion from "@/components/ui/EmailTypoSuggestion";

const emailSchema = z.string().email("Please enter a valid email");

const FooterEmailCapture = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  
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
        .insert([{ email, source: "footer_capture" }]);

      if (supabaseError) {
        if (supabaseError.code === "23505") {
          setError("Already enlisted.");
        } else {
          throw supabaseError;
        }
      } else {
        setIsSuccess(true);
        toast({
          title: "Welcome to the front line.",
          description: "Your briefing is on the way.",
        });
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-b border-white/10 pb-8 mb-8">
      {/* Eyebrow */}
      <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-4">
        Join the Front Line
      </p>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-6 h-6 rounded-full bg-champagne-500 flex items-center justify-center"
            >
              <DrawCheckIcon size="xs" className="text-stone-900" delay={150} />
            </motion.div>
            <span className="text-sm font-light text-white/80 uppercase tracking-[0.15em]">
              Enlisted
            </span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="flex items-center gap-4"
          >
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  emailTypo.setEmail(e.target.value);
                }}
                onBlur={() => emailTypo.checkForTypos(email)}
                placeholder="Your email — enlist now"
                className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-champagne-500 transition-colors duration-300"
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
                <p className="absolute -bottom-5 left-0 text-[10px] text-red-400">
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="group w-10 h-10 flex items-center justify-center border border-white/20 hover:border-champagne-500 hover:bg-champagne-500 transition-all duration-300"
            >
              <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-stone-900 transition-colors duration-300" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Subtext */}
      {!isSuccess && (
        <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] mt-4">
          First drops. Field reports. 15% off first order.
        </p>
      )}
    </div>
  );
};

export default FooterEmailCapture;