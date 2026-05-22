import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import TextReveal from "@/components/motion/TextReveal";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/use-mobile";
import { staggerItem } from "@/lib/animations";

interface Category {
  name: string;
  slug: string;
  subtitle: string;
  image: string;
  index: string;
  layout: "hero" | "standard" | "wide";
}

const CategoryTiles = () => {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const categories: Category[] = [
    {
      name: "Hoodies",
      slug: "hoodies",
      subtitle: "PREMIUM WEIGHT. BOLD STATEMENTS.",
      image: "/products/stay-holy-hoodie/flat-front.png",
      index: "01",
      layout: "hero"
    },
    {
      name: "Tops",
      slug: "tops",
      subtitle: "ELEVATED ESSENTIALS.",
      image: "/products/heavenly-crewneck/flat-front.png",
      index: "02",
      layout: "standard"
    },
    {
      name: "Tees",
      slug: "tees",
      subtitle: "START CONVERSATIONS.",
      image: "/products/heavenly-crewneck/flat-back.png",
      index: "03",
      layout: "standard"
    },
    {
      name: "Accessories",
      slug: "accessories",
      subtitle: "FINISHING TOUCHES.",
      image: "/products/stay-holy-hoodie/flat-back.png",
      index: "04",
      layout: "wide"
    }
  ];

  const heroCategory = categories.find(c => c.layout === "hero")!;
  const standardCategories = categories.filter(c => c.layout === "standard");
  const wideCategory = categories.find(c => c.layout === "wide")!;

  return (
    <section className="w-full py-16 md:py-24 lg:py-40 bg-background relative overflow-hidden">
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 xs:px-6 relative z-10">
        {/* Editorial Section Header - 032c Style */}
        <div className="mb-12 md:mb-16 lg:mb-24">
          <motion.span
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            The
          </motion.span>
          <div className="overflow-hidden">
            <TextReveal 
              text="COLLECTION" 
              as="h2"
              className="text-[10vw] sm:text-[8vw] md:text-[6vw] lg:text-[5vw] font-extralight tracking-[-0.04em] text-foreground leading-[0.85]"
            />
          </div>
          {/* Editorial Divider */}
          <motion.div 
            className="w-16 md:w-24 h-px bg-foreground mt-6 md:mt-8"
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        {/* Asymmetric Bento Grid - Desktop */}
        <StaggerContainer 
          className="hidden md:grid grid-cols-2 gap-2 md:gap-3" 
          staggerDelay={0.15}
        >
          {/* Hero Tile - Hoodies (spans 2 rows) */}
          <motion.div
            variants={staggerItem}
            className="row-span-2"
          >
            <CategoryTile category={heroCategory} prefersReducedMotion={prefersReducedMotion} isMobile={false} />
          </motion.div>

          {/* Standard Tiles - Tops & Tees */}
          {standardCategories.map((category) => (
            <motion.div
              key={category.slug}
              variants={staggerItem}
            >
              <CategoryTile category={category} prefersReducedMotion={prefersReducedMotion} isMobile={false} />
            </motion.div>
          ))}
        </StaggerContainer>

        {/* Wide Tile - Accessories (full width) */}
        <motion.div
          className="hidden md:block mt-2 md:mt-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <CategoryTile category={wideCategory} prefersReducedMotion={prefersReducedMotion} isWide isMobile={false} />
        </motion.div>

        {/* Mobile Stacked Layout - Using aspect ratios instead of vh */}
        <StaggerContainer 
          className="md:hidden flex flex-col gap-2" 
          staggerDelay={0.1}
        >
          {categories.map((category) => (
            <motion.div
              key={category.slug}
              variants={staggerItem}
            >
              <CategoryTile 
                category={category} 
                prefersReducedMotion={prefersReducedMotion} 
                isMobile={true}
              />
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

interface CategoryTileProps {
  category: Category;
  prefersReducedMotion: boolean;
  isWide?: boolean;
  isMobile?: boolean;
}

const CategoryTile = ({ category, prefersReducedMotion, isWide = false, isMobile = false }: CategoryTileProps) => {
  // Mobile: use consistent aspect ratios instead of vh units
  const getMobileAspect = () => {
    if (category.layout === "hero") return "aspect-[3/4]";
    if (category.layout === "wide") return "aspect-[16/9]";
    return "aspect-[4/5]";
  };

  const aspectClass = isMobile 
    ? getMobileAspect()
    : isWide 
      ? "aspect-[21/9]" 
      : category.layout === "hero" 
        ? "h-full min-h-[600px]" 
        : "aspect-[4/5]";

  const titleSize = isMobile
    ? "text-[14vw] xs:text-[12vw]"
    : isWide 
      ? "text-[10vw] md:text-[4vw]" 
      : category.layout === "hero" 
        ? "text-[18vw] md:text-[8vw]" 
        : "text-[15vw] md:text-[5vw]";

  const indexSize = isMobile
    ? "text-[40px] xs:text-[50px]"
    : isWide
      ? "text-[40px] md:text-[80px]"
      : category.layout === "hero"
        ? "text-[60px] md:text-[120px]"
        : "text-[50px] md:text-[100px]";

  return (
    <Link
      to={`/category/${category.slug}`}
      className={`group block relative ${aspectClass} overflow-hidden bg-muted tap-feedback active:scale-[0.99] transition-transform duration-150`}
    >
      {/* Image with Grayscale → Color Transition */}
      <motion.div
        className="absolute inset-0"
        whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <img 
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover md:grayscale md:contrast-110 md:group-hover:grayscale-0 md:group-hover:contrast-100 group-active:grayscale-0 group-active:contrast-100 transition-all duration-700"
          loading="lazy"
        />
      </motion.div>
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/20 to-transparent group-hover:from-background/40 group-hover:via-background/10 transition-all duration-500" />

      {/* Hover Border Frame */}
      <div className="absolute inset-2 md:inset-3 border border-foreground/0 group-hover:border-foreground/30 transition-all duration-500 pointer-events-none" />
      
      {/* Index Number - 032c Style */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 flex flex-col items-end">
        <span className={`${indexSize} font-extralight text-foreground/15 group-hover:text-foreground/25 transition-all duration-500 leading-none`}>
          {category.index}
        </span>
        <motion.div 
          className="w-4 md:w-6 lg:w-8 h-px bg-foreground/20 group-hover:bg-foreground/40 mt-2 transition-all duration-500"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.4 }}
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 xs:p-6 md:p-10">
        {/* Category Name - Massive Typography */}
        <h3 className={`${titleSize} font-extralight text-foreground uppercase tracking-[-0.04em] leading-[0.85] group-hover:tracking-[-0.02em] transition-all duration-500`}>
          {category.name}
        </h3>
        
        {/* Subtitle - Visible by default on mobile, appears on hover for desktop */}
        <div className={`overflow-hidden mt-2 ${isMobile ? 'h-6' : 'h-0 group-hover:h-6'} transition-all duration-500`}>
          <p className={`text-[10px] md:text-xs uppercase tracking-[0.2em] text-foreground/70 ${isMobile ? '' : 'transform translate-y-full group-hover:translate-y-0'} transition-transform duration-500 delay-100`}>
            {category.subtitle}
          </p>
        </div>

        {/* CTA - Editorial Underline Style - Always visible on mobile */}
        <div className={`mt-3 md:mt-4 lg:mt-6 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-500 delay-200`}>
          <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-foreground inline-flex items-center gap-2 touch-target-sm">
            Shop {category.name}
            <motion.span
              className="inline-block"
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
            >
              →
            </motion.span>
          </span>
          <motion.div 
            className="h-px bg-foreground/60 mt-1 origin-left"
            initial={{ scaleX: isMobile ? 1 : 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </Link>
  );
};

export default memo(CategoryTiles);