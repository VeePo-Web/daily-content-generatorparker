import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SecondaryCTAStrip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('ctaStripDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      // Show after scrolling past hero (approximately 600px)
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('ctaStripDismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-40 bg-champagne-500 transition-all duration-500 hidden md:block ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-full opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
        <div className="flex-1" />
        
        {/* Center Content */}
        <div className="flex items-center gap-4">
          <span className="text-black text-sm font-medium">
            New Arrivals Just Dropped — Shop the Latest
          </span>
          <Button 
            asChild
            variant="ghost"
            size="sm"
            className="text-black hover:bg-black/10 font-medium px-4 h-8 rounded-none group"
          >
            <Link to="/category/new-in">
              Shop Now
              <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        
        {/* Dismiss Button */}
        <div className="flex-1 flex justify-end">
          <button
            onClick={handleDismiss}
            className="p-1 text-black/60 hover:text-black transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondaryCTAStrip;
