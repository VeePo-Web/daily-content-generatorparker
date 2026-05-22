import { useMemo } from "react";

interface CollectionHeroProps {
  category: string;
  productCount?: number;
}

interface CollectionContent {
  title: string;
  tagline: string;
  bgClass: string;
}

const collectionData: Record<string, CollectionContent> = {
  // Parent Categories - Polarizing conviction language
  "bottoms": {
    title: "Bottoms",
    tagline: "Run your race. Look good doing it.",
    bgClass: "bg-gradient-to-br from-stone-800 to-neutral-900",
  },
  "tees": {
    title: "Tees",
    tagline: "You'll start conversations. Be ready.",
    bgClass: "bg-gradient-to-br from-stone-800 to-stone-900",
  },
  "hoodies": {
    title: "Hoodies",
    tagline: "For the ones who don't apologize for their faith.",
    bgClass: "bg-gradient-to-br from-zinc-800 to-zinc-900",
  },
  "hats": {
    title: "Hats",
    tagline: "Cover your head. Declare your King.",
    bgClass: "bg-gradient-to-br from-slate-800 to-slate-900",
  },
  "accessories": {
    title: "Accessories",
    tagline: "Finishing touches for the set apart.",
    bgClass: "bg-gradient-to-br from-stone-800/80 to-stone-900",
  },

  // Bottoms Subcategories
  "shorts": {
    title: "Shorts",
    tagline: "Light armor. Same conviction.",
    bgClass: "bg-gradient-to-br from-stone-700/60 to-stone-900",
  },
  "joggers": {
    title: "Joggers",
    tagline: "Run your race. No looking back.",
    bgClass: "bg-gradient-to-br from-stone-700 to-neutral-900",
  },
  "sweatpants": {
    title: "Sweatpants",
    tagline: "Rest days. Faith stays.",
    bgClass: "bg-gradient-to-br from-neutral-700 to-stone-900",
  },

  // Tees Subcategories
  "short-sleeve": {
    title: "Short Sleeve",
    tagline: "The conversation starter.",
    bgClass: "bg-gradient-to-br from-stone-700 to-stone-900",
  },
  "long-sleeve": {
    title: "Long Sleeve",
    tagline: "All season. No season off.",
    bgClass: "bg-gradient-to-br from-zinc-700 to-stone-900",
  },
  "cropped": {
    title: "Cropped",
    tagline: "Bold moves only.",
    bgClass: "bg-gradient-to-br from-stone-600/60 to-neutral-900",
  },

  // Hoodies Subcategories
  "pullover-hoodies": {
    title: "Pullover Hoodies",
    tagline: "No compromise. No apologies.",
    bgClass: "bg-gradient-to-br from-zinc-700 to-zinc-900",
  },
  "zip-up-hoodies": {
    title: "Zip-Up Hoodies",
    tagline: "Layer up. Stand out.",
    bgClass: "bg-gradient-to-br from-neutral-700 to-zinc-900",
  },
  "crewnecks": {
    title: "Crewnecks",
    tagline: "Clean lines. Clear message.",
    bgClass: "bg-gradient-to-br from-stone-600 to-zinc-900",
  },
  "quarter-zips": {
    title: "Quarter Zips",
    tagline: "Refined. Relentless.",
    bgClass: "bg-gradient-to-br from-slate-700 to-stone-900",
  },
  "lightweight-hoodies": {
    title: "Lightweight Hoodies",
    tagline: "Travel light. Carry weight.",
    bgClass: "bg-gradient-to-br from-zinc-600 to-neutral-900",
  },

  // Hats Subcategories
  "snapbacks": {
    title: "Snapbacks",
    tagline: "Streets know. You know.",
    bgClass: "bg-gradient-to-br from-stone-700 to-slate-900",
  },
  "dad-hats": {
    title: "Dad Hats",
    tagline: "Relaxed fit. Unrelaxed faith.",
    bgClass: "bg-gradient-to-br from-neutral-700 to-slate-900",
  },
  "beanies": {
    title: "Beanies",
    tagline: "Cold world. Warm conviction.",
    bgClass: "bg-gradient-to-br from-zinc-700 to-slate-900",
  },

  // Accessories Subcategories
  "bags": {
    title: "Bags",
    tagline: "Carry the message wherever you go.",
    bgClass: "bg-gradient-to-br from-stone-700/70 to-stone-900",
  },
  "socks": {
    title: "Socks",
    tagline: "Grounded. Every step.",
    bgClass: "bg-gradient-to-br from-stone-700 to-stone-900/50",
  },
  "stickers": {
    title: "Stickers",
    tagline: "Mark your territory.",
    bgClass: "bg-gradient-to-br from-stone-600/50 to-neutral-900",
  },

  // Special Collections
  "t-shirts": {
    title: "T-Shirts",
    tagline: "You'll start conversations. Be ready.",
    bgClass: "bg-gradient-to-br from-stone-800 to-stone-900",
  },
  "sweatshirts": {
    title: "Sweatshirts",
    tagline: "Warm body. Warmer purpose.",
    bgClass: "bg-gradient-to-br from-neutral-800 to-neutral-900",
  },
  "new-arrivals": {
    title: "New Arrivals",
    tagline: "New fire. Same conviction.",
    bgClass: "bg-gradient-to-br from-stone-700 to-zinc-900",
  },
  "best-sellers": {
    title: "Best Sellers",
    tagline: "Tribe approved. Field tested.",
    bgClass: "bg-gradient-to-br from-stone-700/60 to-stone-900",
  },
  "sale": {
    title: "Sale",
    tagline: "Same message. Better price.",
    bgClass: "bg-gradient-to-br from-red-900/40 to-stone-900",
  },
  "shop": {
    title: "The Full Collection",
    tagline: "Every piece. One catalog.",
    bgClass: "bg-gradient-to-br from-stone-800 to-stone-950",
  },
};

const defaultContent: CollectionContent = {
  title: "Shop All",
  tagline: "For those who walk different.",
  bgClass: "bg-gradient-to-br from-stone-700 to-stone-900",
};

const CollectionHero = ({ category, productCount }: CollectionHeroProps) => {
  const content = useMemo(() => {
    const slug = category.toLowerCase().replace(/\s+/g, "-");
    return collectionData[slug] || {
      ...defaultContent,
      title: category.charAt(0).toUpperCase() + category.slice(1),
    };
  }, [category]);

  return (
    <section className={`collection-hero relative w-full h-[35dvh] md:h-[50vh] lg:h-[60vh] ${content.bgClass} overflow-hidden`}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 md:px-6">
        <p className="text-white/70 text-sm md:text-sm uppercase tracking-[0.3em] mb-3 md:mb-4 animate-fade-in">
          {content.tagline}
        </p>
        <h1 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-wide animate-fade-in">
          {content.title}
        </h1>
        {productCount !== undefined && productCount > 0 && (
          <p className="text-white/60 text-sm md:text-base font-light mt-4 md:mt-6 animate-fade-in">
            {productCount} {productCount === 1 ? "product" : "products"}
          </p>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default CollectionHero;
