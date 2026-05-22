import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Plus, Check } from "lucide-react";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useQuickAdd, ProductForQuickAdd } from "@/hooks/useQuickAdd";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/currency";

interface MiniProductCardProps {
  product: ProductForQuickAdd & { image_url: string };
  onAdd?: () => void;
}

const MiniProductCard = ({ product, onAdd }: MiniProductCardProps) => {
  const { closeCart } = useCart();
  const quickAdd = useQuickAdd(product, {
    onSuccess: () => onAdd?.(),
  });
  
  const displayPrice = product.is_on_sale && product.sale_price 
    ? product.sale_price 
    : product.price;

  return (
    <motion.div
      className="flex gap-3 py-3 border-b border-border/50 last:border-b-0"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.15 }}
    >
      <Link 
        to={`/product/${product.slug}`} 
        className="flex-shrink-0"
        onClick={closeCart}
      >
        <div className="w-14 h-14 bg-muted overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <Link 
          to={`/product/${product.slug}`}
          className="text-xs font-light text-foreground truncate hover:underline"
          onClick={closeCart}
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-medium text-foreground">
            {formatPrice(displayPrice)}
          </span>
          {quickAdd.canOneTap && (
            <span className="text-[10px] text-champagne-600 font-medium">
              {quickAdd.rememberedSize}
            </span>
          )}
        </div>
      </div>
      
      <button
        onClick={(e) => quickAdd.handleQuickAdd(e)}
        disabled={quickAdd.isAdding || quickAdd.isAdded}
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-none flex items-center justify-center transition-all",
          "border border-border hover:border-foreground hover:bg-foreground hover:text-background",
          quickAdd.isAdded && "bg-foreground border-foreground text-background"
        )}
        aria-label={quickAdd.canOneTap ? `Quick add in ${quickAdd.rememberedSize}` : "Add to bag"}
      >
        {quickAdd.isAdded ? (
          <Check className="w-3.5 h-3.5" />
        ) : quickAdd.isAdding ? (
          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
      </button>
    </motion.div>
  );
};

interface ContinueShoppingProps {
  maxItems?: number;
}

const ContinueShopping = ({ maxItems = 4 }: ContinueShoppingProps) => {
  const { recentProducts } = useRecentlyViewed();
  const { items } = useCart();
  
  // Get cart product IDs to exclude
  const cartProductIds = items.map(item => String(item.id).replace('product-', ''));
  
  // Filter out products already in cart and limit
  const productIds = recentProducts
    .filter(p => !cartProductIds.includes(p.id))
    .slice(0, maxItems)
    .map(p => p.id);

  // Fetch full product data
  const { data: fullProducts } = useQuery({
    queryKey: ['continue-shopping-products', productIds],
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
    staleTime: 5 * 60 * 1000,
  });

  // Map to display format
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
    <div className="px-6 py-4 border-t border-border">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-[0.15em]">
          Continue Shopping
        </h3>
      </div>
      
      <div className="space-y-0">
        {productsForDisplay.map(product => (
          <MiniProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ContinueShopping;
