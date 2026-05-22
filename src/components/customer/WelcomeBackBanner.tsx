import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useReturnCustomer } from "@/hooks/useReturnCustomer";
import { cn } from "@/lib/utils";

interface WelcomeBackBannerProps {
  className?: string;
}

/**
 * A subtle, non-intrusive banner that greets returning customers.
 * Appears below the header and auto-dismisses or can be manually closed.
 */
const WelcomeBackBanner = ({ className }: WelcomeBackBannerProps) => {
  const { 
    greetingMessage, 
    sizeReminderMessage, 
    dismissGreeting, 
    hasSeenGreeting,
    isReturningCustomer 
  } = useReturnCustomer();

  // Don't show if no message or already seen
  if (!greetingMessage || hasSeenGreeting) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "w-full bg-primary/5 border-b border-primary/10",
          className
        )}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-light text-foreground">
              {greetingMessage}
              {sizeReminderMessage && isReturningCustomer && (
                <span className="text-muted-foreground ml-2">
                  {sizeReminderMessage}
                </span>
              )}
            </p>
          </div>
          
          <button
            onClick={dismissGreeting}
            className="p-1 hover:bg-primary/10 rounded-sm transition-colors"
            aria-label="Dismiss greeting"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeBackBanner;
