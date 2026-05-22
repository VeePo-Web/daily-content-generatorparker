import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Shield, Users, RotateCcw } from "lucide-react";

interface USP {
  text: string;
  icon: React.ReactNode;
}

const StatusBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const usps: USP[] = [
    { text: "Free shipping over $99", icon: <Truck size={14} strokeWidth={1.5} /> },
    { text: "365 days warranty", icon: <Shield size={14} strokeWidth={1.5} /> },
    { text: "+100,000 happy customers", icon: <Users size={14} strokeWidth={1.5} /> },
    { text: "Free returns within 30 days", icon: <RotateCcw size={14} strokeWidth={1.5} /> },
  ];

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % usps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [usps.length, isPaused]);

  return (
    <div 
      className="bg-status-bar text-status-bar-foreground h-[var(--status-bar-height)] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="flex items-center gap-2 text-[13px] font-light"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.span 
              className="opacity-80"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {usps[currentIndex].icon}
            </motion.span>
            <span>{usps[currentIndex].text}</span>
          </motion.div>
        </AnimatePresence>
        
        {/* Progress dots - Hidden on mobile (too small for touch), visible on desktop */}
        <div 
          className="absolute right-4 hidden md:flex gap-1.5" 
          role="tablist" 
          aria-label="Value propositions"
        >
          {usps.map((usp, index) => (
            <motion.button
              key={index}
              className="w-6 h-6 flex items-center justify-center p-0 border-0"
              initial={false}
              animate={{
                opacity: index === currentIndex ? 1 : 0.5,
              }}
              transition={{ duration: 0.2 }}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={usp.text}
              onClick={() => setCurrentIndex(index)}
              tabIndex={index === currentIndex ? 0 : -1}
            >
              <span 
                className={`w-1.5 h-1.5 rounded-full bg-status-bar-foreground transition-transform ${
                  index === currentIndex ? 'scale-125' : 'scale-100'
                }`}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
