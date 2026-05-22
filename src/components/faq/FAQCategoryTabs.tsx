import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  label: string;
}

interface FAQCategoryTabsProps {
  categories: readonly Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const FAQCategoryTabs = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: FAQCategoryTabsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll active category into view
  useEffect(() => {
    if (activeButtonRef.current && containerRef.current) {
      activeButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onCategoryChange(categoryId);
  };

  return (
    <div className="relative mb-10">
      {/* Scroll fade indicator */}
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 md:hidden" />
      
      <div 
        ref={containerRef}
        role="tablist"
        aria-label="FAQ categories"
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0 scroll-snap-x"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              ref={isActive ? activeButtonRef : null}
              role="tab"
              aria-selected={isActive}
              aria-controls={`faq-panel-${category.id}`}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "px-4 py-3 md:py-2 text-[10px] xs:text-xs font-medium tracking-widest whitespace-nowrap uppercase transition-all border scroll-snap-start",
                "active:scale-[0.98] touch-manipulation",
                isActive
                  ? "bg-white text-stone-950 border-white"
                  : "bg-transparent text-muted-foreground border-stone-600 hover:border-white hover:text-foreground"
              )}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FAQCategoryTabs;
