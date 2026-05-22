import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, Clock, TrendingUp, Plus, Check, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQuickAdd, ProductForQuickAdd } from "@/hooks/useQuickAdd";
import { cn } from "@/lib/utils";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "tween" as const, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const popularSearches = [
  "Stay Holy",
  "Heavenly Crewneck",
  "Black Hoodies",
  "Premium Tees",
];

// Shared product type for display
type DisplayProduct = ProductForQuickAdd & { image_url: string; category_name: string };

// Individual product row with quick-add
const ProductRow = ({ product, onClose }: { product: DisplayProduct; onClose: () => void }) => {
  const quickAdd = useQuickAdd(product);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 group"
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex items-center gap-4 flex-1"
        onClick={onClose}
      >
        <div className="w-16 h-16 bg-muted overflow-hidden">
          <motion.img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div>
          <p className="text-sm font-normal text-foreground group-hover:underline">
            {product.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {product.category_name}
            </span>
            {quickAdd.canOneTap && (
              <span className="text-[10px] text-champagne-600 font-medium px-1.5 py-0.5 bg-champagne-500/10 rounded-sm">
                {quickAdd.rememberedSize}
              </span>
            )}
          </div>
        </div>
      </Link>
      
      <motion.button
        onClick={(e) => quickAdd.handleQuickAdd(e)}
        disabled={quickAdd.isAdding || quickAdd.isAdded}
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all",
          "border border-border hover:border-foreground hover:bg-foreground hover:text-background",
          quickAdd.isAdded && "bg-foreground border-foreground text-background"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={quickAdd.canOneTap ? `Quick add in ${quickAdd.rememberedSize}` : "Add to bag"}
      >
        {quickAdd.isAdded ? (
          <Check className="w-4 h-4" />
        ) : quickAdd.isAdding ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </motion.button>
    </motion.div>
  );
};

// Loading skeletons
const SearchSkeletons = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="w-16 h-16" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="w-9 h-9 rounded-full" />
      </div>
    ))}
  </div>
);

// No results state
const NoResults = ({ query, onClose }: { query: string; onClose: () => void }) => (
  <motion.div variants={itemVariants} className="text-center py-8">
    <p className="text-muted-foreground text-sm mb-3">
      No products found for "<span className="text-foreground font-medium">{query}</span>"
    </p>
    <Link
      to="/category/shop"
      onClick={onClose}
      className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
    >
      Browse All Products
    </Link>
  </motion.div>
);

// Helper to map DB product to display format
function mapProduct(product: any): DisplayProduct {
  const primaryImage = product.product_images?.find((img: any) => img.is_primary) 
    || product.product_images?.[0];
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    sale_price: product.sale_price,
    is_on_sale: product.is_on_sale,
    category_slug: product.categories?.slug,
    product_images: product.product_images,
    product_variants: product.product_variants,
    image_url: primaryImage?.image_url || '/placeholder.svg',
    category_name: product.categories?.name || 'Apparel',
  };
}

const PRODUCT_SELECT = `
  id, name, slug, price, sale_price, is_on_sale,
  categories:category_id(name, slug),
  product_images(image_url, is_primary, display_order),
  product_variants(size, color, stock_quantity)
`;

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const isSearchActive = debouncedSearch.length >= 2;

  // Live search query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['product-search', debouncedSearch],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('status', 'active')
        .ilike('name', `%${debouncedSearch}%`)
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: isOpen && isSearchActive,
    staleTime: 30 * 1000,
  });

  // Trending products (shown when not searching)
  const { data: trendingProducts } = useQuery({
    queryKey: ['trending-products-search'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('status', 'active')
        .eq('is_featured', true)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const trendingDisplay = trendingProducts?.map(mapProduct) || [];
  const searchDisplay = searchResults?.map(mapProduct) || [];

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchValue("");
      setDebouncedSearch("");
    }
    return () => {
      unlockScroll();
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Shared content renderer
  const renderContent = () => {
    if (isSearchActive) {
      if (isSearching) return <SearchSkeletons />;
      if (searchDisplay.length === 0) return <NoResults query={debouncedSearch} onClose={onClose} />;
      return (
        <motion.div variants={itemVariants}>
          <h3 className="flex items-center gap-2 text-foreground text-xs uppercase tracking-[0.15em] font-medium mb-4">
            <Search size={14} />
            Results for "{debouncedSearch}"
          </h3>
          <div className="space-y-4">
            {searchDisplay.map((product) => (
              <ProductRow key={product.id} product={product} onClose={onClose} />
            ))}
          </div>
        </motion.div>
      );
    }

    // Default: Popular searches + trending
    return (
      <>
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className="flex items-center gap-2 text-foreground text-xs uppercase tracking-[0.15em] font-medium mb-4">
            <Clock size={14} />
            Popular Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <motion.button
                key={index}
                className="text-muted-foreground hover:text-foreground text-sm font-light py-2.5 px-4 border border-border hover:border-foreground transition-all duration-200"
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSearchValue(search)}
              >
                {search}
              </motion.button>
            ))}
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <h3 className="flex items-center gap-2 text-foreground text-xs uppercase tracking-[0.15em] font-medium mb-4">
            <TrendingUp size={14} />
            Trending Now
          </h3>
          <div className="space-y-4">
            {trendingDisplay.map((product) => (
              <ProductRow key={product.id} product={product} onClose={onClose} />
            ))}
          </div>
        </motion.div>
      </>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile: Full-screen overlay */}
          <motion.div
            className="fixed inset-0 h-[100dvh] bg-background z-50 md:hidden flex flex-col overscroll-contain"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="search"
                inputMode="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search for apparel..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg font-light"
              />
              <motion.button
                onClick={onClose}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors touch-target"
                whileTap={{ scale: 0.95 }}
                aria-label="Close search"
              >
                <X size={24} />
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {renderContent()}
            </div>
          </motion.div>

          {/* Desktop: Dropdown overlay */}
          <motion.div
            className="hidden md:block absolute top-full left-0 right-0 bg-background border-b border-border z-50 shadow-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="px-8 py-10">
              <div className="max-w-4xl mx-auto">
                <motion.div className="relative mb-10" variants={itemVariants}>
                  <div className="flex items-center border-b-2 border-border pb-3 group focus-within:border-foreground transition-colors">
                    <Search className="w-6 h-6 text-muted-foreground mr-4" />
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search for apparel..."
                      className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-2xl md:text-3xl font-light"
                    />
                    {searchValue && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setSearchValue("")}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={20} />
                      </motion.button>
                    )}
                    <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground ml-4">
                      <kbd className="px-2 py-1 bg-muted rounded text-[11px] font-mono">esc</kbd>
                      <span>to close</span>
                    </span>
                  </div>
                </motion.div>

                {isSearchActive ? (
                  /* Search results — full width */
                  renderContent()
                ) : (
                  /* Default — two column layout */
                  <div className="grid md:grid-cols-2 gap-10">
                    <motion.div variants={itemVariants}>
                      <h3 className="flex items-center gap-2 text-foreground text-xs uppercase tracking-[0.15em] font-medium mb-5">
                        <Clock size={14} />
                        Popular Searches
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((search, index) => (
                          <motion.button
                            key={index}
                            className="text-muted-foreground hover:text-foreground text-sm font-light py-2 px-4 border border-border hover:border-foreground transition-all duration-200"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSearchValue(search)}
                          >
                            {search}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <h3 className="flex items-center gap-2 text-foreground text-xs uppercase tracking-[0.15em] font-medium mb-5">
                        <TrendingUp size={14} />
                        Trending Now
                      </h3>
                      <div className="space-y-4">
                        {trendingDisplay.map((product) => (
                          <ProductRow key={product.id} product={product} onClose={onClose} />
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
