import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileStickyBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 500);
          const footer = document.querySelector('footer');
          if (footer) {
            setIsFooterVisible(footer.getBoundingClientRect().top < window.innerHeight);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Haptic feedback on tap
  const handleTap = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const shouldShow = isVisible && !isFooterVisible;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-all duration-300 safe-area-bottom ${
        shouldShow 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0'
      }`}
    >
      {/* Main Bar */}
      <div className="bg-stone-900 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Shop Button - Full Width with touch target */}
          <Button 
            asChild
            size="lg"
            className="flex-1 bg-forest-500 hover:bg-forest-400 active:bg-forest-400 text-white font-medium h-12 rounded-none group touch-target"
            onClick={handleTap}
          >
            <Link to="/category/shop">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shop Bestsellers
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Promo Text */}
        <p className="text-white/50 text-[10px] text-center mt-2 uppercase tracking-wider">
          Free shipping on orders $99+ • Easy returns
        </p>
      </div>
    </div>
  );
};

export default MobileStickyBar;