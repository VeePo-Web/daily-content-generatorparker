import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Plus, Check } from "lucide-react";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useQuickAdd, ProductForQuickAdd } from "@/hooks/useQuickAdd";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecentProductCardProps {
  product: ProductForQuickAdd & { image_url: string };
}

const RecentProductCard = ({ product }: RecentProductCardProps) => {
  const quickAdd = useQuickAdd(product);
  
  const displayPrice = product.is_on_sale && product.sale_price 
    ? product.sale_price 
    : product.price;

  return (
    <motion.div
      className="group relative flex-shrink-0 w-[160px] xs:w-[170px] md:w-[180px] scroll-snap-start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/product/${product.slug}`} className="block tap-feedback">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-3">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Quick Add Button - 48px touch target */}
          <motion.button
            onClick={(e) => quickAdd.handleQuickAdd(e)}
            disabled={quickAdd.isAdding || quickAdd.isAdded}
            className={cn(
              "absolute bottom-2 right-2 w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-200",
              "bg-white/90 backdrop-blur-sm border border-white/20 shadow-md",
              "hover:bg-white hover:text-stone-950 active:bg-white active:text-stone-950",
              quickAdd.isAdded && "bg-foreground border-foreground text-background"
            )}
            whileTap={{ scale: 0.9 }}
            aria-label={quickAdd.canOneTap ? `Quick add ${product.name} in ${quickAdd.rememberedSize}` : `Add ${product.name}`}
          >
            {quickAdd.isAdded ? (
              <Check className="w-4 h-4" />
            ) : quickAdd.isAdding ? (
              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </motion.button>
          
          {/* Size badge if remembered */}
          {quickAdd.canOneTap && !quickAdd.isAdded && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm border border-white/20 text-[10px] font-medium text-stone-950">
              {quickAdd.rememberedSize}
            </span>
          )}
        </div>
        
        <h3 className="text-xs font-light text-foreground truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-medium text-foreground">
            ${displayPrice.toLocaleString()}
          </span>
          {product.is_on_sale && product.sale_price && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.price.toLocaleString()}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

interface RecentlyViewedProps {
  excludeProductId?: string;
  maxItems?: number;
  title?: string;
  className?: string;
}

const RecentlyViewed = ({ 
  excludeProductId, 
  maxItems = 8,
  title = "Recently Viewed",
  className 
}: RecentlyViewedProps) => {
  const { recentProducts } = useRecentlyViewed();
  
  // Filter out current product and limit
  const productIds = recentProducts
    .filter(p => p.id !== excludeProductId)
    .slice(0, maxItems)
    .map(p => p.id);

  // Fetch full product data with variants for quick-add
  const { data: fullProducts } = useQuery({
    queryKey: ['recently-viewed-products', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, slug, price, sale_price, is_on_sale,
          categories:category_id(slug),
          product_images(image_url, is_primary, display_order),
          product_variants(size, color, stock_quantity)
        `)
        .in('id', productIds)
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    },
    enabled: productIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Map to QuickAdd format while preserving order
  const productsForDisplay = productIds
    .map(id => {
      const full = fullProducts?.find(p => p.id === id);
      const recent = recentProducts.find(p => p.id === id);
      if (!full || !recent) return null;
      
      const primaryImage = full.product_images?.find(img => img.is_primary) 
        || full.product_images?.[0];
      
      return {
        id: full.id,
        name: full.name,
        slug: full.slug,
        price: full.price,
        sale_price: full.sale_price,
        is_on_sale: full.is_on_sale,
        category_slug: full.categories?.slug,
        product_images: full.product_images,
        product_variants: full.product_variants,
        image_url: primaryImage?.image_url || recent.image_url,
      };
    })
    .filter(Boolean) as (ProductForQuickAdd & { image_url: string })[];

  if (productsForDisplay.length === 0) {
    return null;
  }

  return (
    <section className={cn("w-full", className)}>
      <div className="flex items-center gap-2 mb-4 px-4 xs:px-6">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em]">
          {title}
        </h2>
      </div>
      
      {/* Horizontal scroll with snap points and fade indicator */}
      <div className="relative scroll-fade-right">
        <div className="overflow-x-auto scrollbar-hide scroll-snap-x-proximity">
          <div className="flex gap-3 xs:gap-4 px-4 xs:px-6 pb-4">
            {productsForDisplay.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RecentProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;