import { useState, useEffect, useMemo } from "react";
import { Flame, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FlashSaleTimerProps {
  /** End date/time of the flash sale */
  endsAt: Date | string;
  /** Visual variant */
  variant?: 'default' | 'compact' | 'badge';
  /** Additional className */
  className?: string;
  /** Callback when timer expires */
  onExpire?: () => void;
}

const FlashSaleTimer = ({
  endsAt,
  variant = 'default',
  className,
  onExpire,
}: FlashSaleTimerProps) => {
  const prefersReducedMotion = useReducedMotion();
  const endDate = useMemo(() => new Date(endsAt), [endsAt]);
  
  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = endDate.getTime() - now.getTime();
    
    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
    
    return {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.isExpired) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  if (timeLeft.isExpired) {
    return null;
  }

  const isUrgent = timeLeft.hours < 1;
  const isVeryUrgent = timeLeft.hours === 0 && timeLeft.minutes < 15;

  const formatUnit = (value: number) => String(value).padStart(2, '0');

  // Badge variant - minimal for product cards
  if (variant === 'badge') {
    return (
      <div 
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium tracking-wider",
          isVeryUrgent 
            ? "bg-red-500 text-white" 
            : isUrgent 
              ? "bg-amber-500 text-white" 
              : "bg-amber-400 text-amber-900",
          
          className
        )}
      >
        <Flame className="h-3 w-3" />
        <span>
          {formatUnit(timeLeft.hours)}:{formatUnit(timeLeft.minutes)}:{formatUnit(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  // Compact variant - for cart line items
  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          "inline-flex items-center gap-1.5 text-xs",
          isVeryUrgent 
            ? "text-red-600 dark:text-red-400" 
            : isUrgent 
              ? "text-amber-600 dark:text-amber-400" 
              : "text-amber-600 dark:text-amber-500",
          className
        )}
      >
        <Clock className="h-3 w-3" />
        <span className="font-mono font-medium">
          {formatUnit(timeLeft.hours)}:{formatUnit(timeLeft.minutes)}:{formatUnit(timeLeft.seconds)}
        </span>
        <span className="font-light">left</span>
      </div>
    );
  }

  // Default variant - prominent for PDP
  return (
    <motion.div 
      className={cn(
        "flex items-center gap-3 p-3 border",
        isVeryUrgent 
          ? "bg-red-500/10 border-red-500/30 dark:bg-red-950/30" 
          : isUrgent 
            ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/30" 
            : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
        className
      )}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full",
        isVeryUrgent 
          ? "bg-red-500 text-white" 
          : isUrgent 
            ? "bg-amber-500 text-white" 
            : "bg-amber-400 text-amber-900"
      )}>
        <Flame className={cn(
          "h-4 w-4"
        )} />
      </div>
      
      <div className="flex-1">
        <p className={cn(
          "text-xs font-medium uppercase tracking-wider",
          isVeryUrgent 
            ? "text-red-600 dark:text-red-400" 
            : "text-amber-700 dark:text-amber-400"
        )}>
          Flash Sale Ends In
        </p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <AnimatePresence mode="popLayout">
            {timeLeft.hours > 0 && (
              <>
                <TimeBlock 
                  value={timeLeft.hours} 
                  isUrgent={isUrgent} 
                  isVeryUrgent={isVeryUrgent}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <span className="text-lg font-light text-muted-foreground">:</span>
              </>
            )}
            <TimeBlock 
              value={timeLeft.minutes} 
              isUrgent={isUrgent} 
              isVeryUrgent={isVeryUrgent}
              prefersReducedMotion={prefersReducedMotion}
            />
            <span className="text-lg font-light text-muted-foreground">:</span>
            <TimeBlock 
              value={timeLeft.seconds} 
              isUrgent={isUrgent} 
              isVeryUrgent={isVeryUrgent}
              prefersReducedMotion={prefersReducedMotion}
            />
          </AnimatePresence>
        </div>
      </div>
      
    </motion.div>
  );
};

interface TimeBlockProps {
  value: number;
  isUrgent: boolean;
  isVeryUrgent: boolean;
  prefersReducedMotion: boolean;
}

const TimeBlock = ({ value, isUrgent, isVeryUrgent, prefersReducedMotion }: TimeBlockProps) => {
  const formatted = String(value).padStart(2, '0');
  
  return (
    <motion.span
      key={value}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, y: 5 }}
      className={cn(
        "text-xl font-mono font-semibold tabular-nums",
        isVeryUrgent 
          ? "text-red-600 dark:text-red-400" 
          : isUrgent 
            ? "text-amber-600 dark:text-amber-400" 
            : "text-foreground"
      )}
    >
      {formatted}
    </motion.span>
  );
};

export default FlashSaleTimer;
