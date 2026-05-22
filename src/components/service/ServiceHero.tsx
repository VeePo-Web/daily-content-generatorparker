import { useState, useRef } from "react";
import { Search, LucideIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ServiceHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  lastUpdated?: string;
  alignment?: 'left' | 'center';
  valueProps?: Array<{
    icon: LucideIcon;
    text: string;
  }>;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
}

const ServiceHero = ({
  title,
  subtitle,
  eyebrow,
  lastUpdated,
  alignment = 'left',
  valueProps,
  showSearch,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = "Search for answers..."
}: ServiceHeroProps) => {
  const prefersReducedMotion = useReducedMotion();
  const isCenter = alignment === 'center';
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };

  const handleSearchFocus = () => {
    setIsFocused(true);
    // Scroll search into view on mobile when keyboard appears
    setTimeout(() => {
      searchRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 300);
  };

  const handleClearSearch = () => {
    onSearchChange?.('');
    searchRef.current?.focus();
  };
  
  return (
    <section className="bg-stone-900 text-white pt-[calc(var(--header-height)+2rem)] pb-12 md:pb-16 px-6">
      <motion.div 
        className={cn(
          "max-w-7xl mx-auto",
          isCenter && "text-center"
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={cn(isCenter ? "max-w-3xl mx-auto" : "max-w-3xl")}>
          {/* Eyebrow or Last Updated */}
          {(eyebrow || lastUpdated) && (
            <motion.span 
              variants={itemVariants}
              className="inline-block text-xs font-medium tracking-widest text-champagne-500 mb-4"
            >
              {lastUpdated ? `LAST UPDATED: ${lastUpdated.toUpperCase()}` : eyebrow?.toUpperCase()}
            </motion.span>
          )}
          
          {/* Title - Refined mobile typography */}
          <motion.h1 
            variants={itemVariants}
            className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight uppercase mb-4"
          >
            {title}
          </motion.h1>
          
          {/* Subtitle */}
          {subtitle && (
            <motion.p 
              variants={itemVariants}
              className={cn(
                "text-base md:text-lg text-white/70 font-light leading-relaxed",
                isCenter && "max-w-xl mx-auto"
              )}
            >
              {subtitle}
            </motion.p>
          )}
          
          {/* Value Props */}
          {valueProps && valueProps.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className={cn(
                "flex flex-wrap items-center gap-4 md:gap-6 mt-6 md:mt-8 text-sm text-white/80",
                isCenter && "justify-center"
              )}
            >
              {valueProps.map((prop, index) => (
                <span key={index} className="flex items-center gap-2">
                  <prop.icon className="w-4 h-4 text-champagne-500" />
                  {prop.text}
                </span>
              ))}
            </motion.div>
          )}
        </div>
        
        {/* Search Bar with clear button and mobile optimization */}
        {showSearch && onSearchChange && (
          <motion.div 
            variants={itemVariants}
            className={cn(
              "relative max-w-xl mx-auto mt-8 md:mt-10 transition-transform",
              isFocused && "scale-[1.02]"
            )}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
            <Input
              ref={searchRef}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={() => setIsFocused(false)}
              className="w-full h-14 pl-12 pr-12 bg-white text-stone-900 border-0 placeholder:text-stone-400 text-base focus-visible:ring-champagne-500 rounded-none"
            />
            {/* Clear search button */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors touch-target"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default ServiceHero;
