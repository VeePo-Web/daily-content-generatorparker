import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { productIdToCartId } from "@/lib/cartUtils";
import type { ProductForQuickAdd } from "@/hooks/useQuickAdd";

export interface ThresholdProduct extends ProductForQuickAdd {
  willUnlockShipping: boolean;
  gapMatch: 'exact' | 'close' | 'over';
  gapDelta: number;
}

interface UseThresholdUpsellsReturn {
  primaryProduct: ThresholdProduct | null;
  alternatives: ThresholdProduct[];
  isLoading: boolean;
  amountToFreeShipping: number;
  hasFreeShipping: boolean;
  shouldShow: boolean;
}

/**
 * Fetches and scores products that help users reach the free shipping threshold.
 * Prioritizes products that exactly match the gap, then close matches, then accessories.
 */
export function useThresholdUpsells(): UseThresholdUpsellsReturn {
  const { items, amountToFreeShipping, hasFreeShipping, shippingProgress } = useCart();

  // Determine if we should show threshold upsells
  // Show when: cart has items, not at free shipping, and within reasonable reach
  const shouldShow = items.length > 0 && 
                     !hasFreeShipping && 
                     (shippingProgress >= 50 || amountToFreeShipping <= 75);

  // Query products suitable for threshold upsells
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['threshold-upsells', amountToFreeShipping],
    queryFn: async () => {
      // First try to get curated threshold products
      const { data: curatedProducts } = await supabase
        .from('threshold_upsell_products')
        .select(`
          product_id,
          priority,
          min_threshold_gap,
          max_threshold_gap,
          products!inner (
            id,
            name,
            slug,
            price,
            sale_price,
            is_on_sale,
            categories!inner (slug)
          )
        `)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      // Also fetch all low-priced products as fallback
      const { data: allProducts } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          sale_price,
          is_on_sale,
          categories!inner (slug),
          product_images (image_url, is_primary),
          product_variants (size, color, stock_quantity)
        `)
        .eq('status', 'active')
        .gte('price', Math.max(5, amountToFreeShipping * 0.3))
        .lte('price', amountToFreeShipping + 60)
        .order('price', { ascending: true })
        .limit(20);

      return allProducts || [];
    },
    enabled: shouldShow,
    staleTime: 60000, // Cache for 1 minute
  });

  // Get cart item IDs to exclude
  const cartIds = new Set(items.map(item => item.id));

  // Score and filter products
  const scoredProducts: ThresholdProduct[] = products
    .filter(product => {
      // Exclude products already in cart
      const cartId = productIdToCartId(product.id);
      if (cartIds.has(cartId)) return false;

      // Must have stock
      const hasStock = product.product_variants?.some(v => v.stock_quantity > 0);
      if (!hasStock) return false;

      return true;
    })
    .map(product => {
      const effectivePrice = product.is_on_sale && product.sale_price 
        ? product.sale_price 
        : product.price;
      
      const willUnlockShipping = effectivePrice >= amountToFreeShipping;
      const gapDelta = Math.abs(effectivePrice - amountToFreeShipping);
      
      // Determine match quality
      let gapMatch: 'exact' | 'close' | 'over' = 'over';
      if (gapDelta <= 5) {
        gapMatch = 'exact';
      } else if (gapDelta <= 20) {
        gapMatch = 'close';
      }

      const categorySlug = (product.categories as { slug: string })?.slug || '';
      
      // Build ProductForQuickAdd compatible structure
      const thresholdProduct: ThresholdProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        sale_price: product.sale_price,
        is_on_sale: product.is_on_sale,
        category_slug: categorySlug,
        product_images: product.product_images || [],
        product_variants: product.product_variants || [],
        willUnlockShipping,
        gapMatch,
        gapDelta,
      };

      return thresholdProduct;
    })
    .sort((a, b) => {
      // 1. Prefer products that unlock shipping
      if (a.willUnlockShipping && !b.willUnlockShipping) return -1;
      if (!a.willUnlockShipping && b.willUnlockShipping) return 1;

      // 2. Prefer closer gap matches
      const gapOrder = { exact: 0, close: 1, over: 2 };
      if (gapOrder[a.gapMatch] !== gapOrder[b.gapMatch]) {
        return gapOrder[a.gapMatch] - gapOrder[b.gapMatch];
      }

      // 3. Prefer smaller price delta
      if (a.gapDelta !== b.gapDelta) {
        return a.gapDelta - b.gapDelta;
      }

      // 4. Prefer accessory categories (impulse buys)
      const accessoryCategories = ['hats', 'accessories', 'socks', 'stickers'];
      const aIsAccessory = accessoryCategories.includes(a.category_slug);
      const bIsAccessory = accessoryCategories.includes(b.category_slug);
      if (aIsAccessory && !bIsAccessory) return -1;
      if (!aIsAccessory && bIsAccessory) return 1;

      return 0;
    });

  // Split into primary and alternatives
  const [primaryProduct = null, ...alternatives] = scoredProducts.slice(0, 4);

  return {
    primaryProduct,
    alternatives,
    isLoading,
    amountToFreeShipping,
    hasFreeShipping,
    shouldShow: shouldShow && (primaryProduct !== null || alternatives.length > 0),
  };
}
