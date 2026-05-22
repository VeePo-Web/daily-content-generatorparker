import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UrgencyTimerProps {
  initialMinutes?: number;
  type?: "cart" | "freeShipping";
}

const UrgencyTimer = ({ initialMinutes = 15, type = "cart" }: UrgencyTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 300; // 5 minutes or less

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <AlertCircle className="h-3 w-3" />
        <span>Prices may have changed. Please review your cart.</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs p-2 transition-colors",
        isLowTime
          ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
          : "text-muted-foreground bg-muted/30"
      )}
    >
      <Clock className="h-3 w-3" />
      <span>
        {type === "cart" ? "Cart reserved for " : "Free shipping expires in "}
        <span className={cn("font-mono font-medium", isLowTime && "text-amber-600 dark:text-amber-400")}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </span>
    </div>
  );
};

export default UrgencyTimer;
