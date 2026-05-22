import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, ShoppingBag, Check, Sparkles } from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useQuickAdd, ProductForQuickAdd } from "@/hooks/useQuickAdd";
import { useIsMobile } from "@/hooks/use-mobile";
import StaggerContainer from "@/components/motion/StaggerContainer";
import InlineQuickSizePicker from "@/components/ui/InlineQuickSizePicker";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";
import { productIdToCartId } from "@/lib/cartUtils";
import SwipeLookbook from "./SwipeLookbook";

interface LookProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  position: string | null;
  product_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

interface ShopTheLookProps {
  products: LookProduct[];
  lookName: string;
  lookId?: string;
}

// Individual product card with integrated quick add
function LookProductCard({ 
  product, 
  productsInCart 
}: { 
  product: LookProduct; 
  productsInCart: Set<number>;
}) {
  const prefersReducedMotion = useReducedMotion();
  
  const quickAddProduct: ProductForQuickAdd = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    sale_price: product.sale_price,
    is_on_sale: product.is_on_sale,
    position: product.position,
    product_images: product.product_images,
    product_variants: [], // Lookbook products use default sizes
  };

  const quickAdd = useQuickAdd(quickAddProduct, { 
    categoryOverride: product.position || undefined,
  });

  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
  const positionLabel = getPositionLabel(product.position);
  const cartId = productIdToCartId(product.id);
  const isInCart = productsInCart.has(cartId);

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };

  return (
    <motion.div 
      className="group relative"
      whileHover={prefersReducedMotion ? {} : { y: -4 }}
      transition={springConfig}
    >
      <Link to={`/product/${product.slug}`}>
        <motion.div 
          className="aspect-[3/4] bg-stone-800 overflow-hidden relative"
          whileHover={prefersReducedMotion ? {} : { 
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)" 
          }}
          transition={springConfig}
        >
          {primaryImage && (
            <motion.img
              src={primaryImage.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          )}
          
          {/* Position Tag */}
          {positionLabel && (
            <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider bg-black/70 text-white/90 px-2 py-1 font-light">
              {positionLabel}
            </span>
          )}

          {/* Success Overlay */}
          <AnimatePresence>
            {quickAdd.isAdded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
               className="absolute inset-0 bg-foreground/90 
                           flex flex-col items-center justify-center gap-2"
              >
                <DrawCheckIcon size="lg" color="white" animate delay={0.1} />
                <span className="text-white text-xs font-medium">
                  Size {quickAdd.addedSize}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* In Cart Badge */}
          {isInCart && !quickAdd.isAdded && (
            <div className="absolute top-2 right-2 bg-foreground p-1">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}

          {/* Quick Add Button - Always visible on mobile */}
          {!isInCart && !quickAdd.isAdded && (
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                quickAdd.handleQuickAdd(e as any);
              }}
              disabled={quickAdd.isAdding}
              className={`
                absolute bottom-2 right-2 w-10 h-10 md:w-9 md:h-9 
                flex items-center justify-center transition-colors
                opacity-90 md:opacity-100
                ${quickAdd.canOneTap 
                  ? 'bg-champagne-500 hover:bg-champagne-400' 
                  : 'bg-white/95 hover:bg-white'
                }
              `}
              style={{ boxShadow: '0 4px 20px -5px rgba(0,0,0,0.3)' }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              aria-label={quickAdd.canOneTap 
                ? `Quick add ${product.name} in size ${quickAdd.rememberedSize}` 
                : `Add ${product.name} - select size`
              }
              transition={springConfig}
            >
              {quickAdd.isAdding ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className={`w-4 h-4 ${quickAdd.canOneTap ? 'text-white' : 'text-stone-900'}`} />
              )}
            </motion.button>
          )}

          {/* Inline Size Picker */}
          <AnimatePresence>
            {quickAdd.isPickerOpen && (
              <InlineQuickSizePicker
                sizes={quickAdd.availableSizes}
                rememberedSize={quickAdd.rememberedSize}
                onSelect={quickAdd.handleSizeSelect}
                onClose={quickAdd.hideSizePicker}
                getStockForSize={(size) => quickAdd.getStockForVariant(size)}
                variant="dark"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </Link>

      {/* Product Info */}
      <div className="mt-2.5">
        <p className="text-xs text-white/90 font-light truncate">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-sm md:text-xs text-white/50 font-light">
            {product.is_on_sale && product.sale_price ? (
              <>
                <span className="text-champagne-500">${product.sale_price}</span>
                <span className="line-through ml-1.5 text-white/30">${product.price}</span>
              </>
            ) : (
              `$${product.price}`
            )}
          </p>
          {/* Show remembered size hint */}
          {quickAdd.rememberedSize && !isInCart && (
            <span className="text-[10px] md:text-[9px] uppercase tracking-wide text-champagne-500/70">
              {quickAdd.rememberedSize}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function getPositionLabel(position: string | null) {
  if (!position) return null;
  const labels: Record<string, string> = {
    hat: "HAT",
    top: "TOP",
    bottom: "BOTTOM",
    shoes: "SHOES",
    accessories: "ACC",
  };
  return labels[position.toLowerCase()] || position.toUpperCase();
}

const ShopTheLook = ({ products, lookName, lookId }: ShopTheLookProps) => {
  const { toast } = useToast();
  const { addItem, items, openCart } = useCart();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  
  // Swipe mode state
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  
  // Track recently added products for the "complete look" logic
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  // Check which products are already in cart
  const productsInCart = useMemo(() => 
    new Set(items.map(item => item.id)),
    [items]
  );

  const totalPrice = products.reduce((sum, product) => {
    return sum + (product.is_on_sale && product.sale_price ? product.sale_price : product.price);
  }, 0);

  // Calculate bundle discount preview (10% for complete look)
  const bundleDiscountPercent = products.length >= 4 ? 15 : products.length >= 2 ? 10 : 0;
  const bundleDiscount = totalPrice * (bundleDiscountPercent / 100);
  const discountedTotal = totalPrice - bundleDiscount;

  const addedCount = products.filter(p => {
    const cartId = productIdToCartId(p.id);
    return addedProducts.has(p.id) || productsInCart.has(cartId);
  }).length;

  // Handle add all with size memory and bundle tracking
  const handleAddAll = () => {
    let addedAny = false;
    
    products.forEach(product => {
      const cartId = productIdToCartId(product.id);
      if (productsInCart.has(cartId)) return;
      
      const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
      const price = product.is_on_sale && product.sale_price ? product.sale_price : product.price;
      
      // Add with lookId and lookName for bundle tracking
      addItem({
        id: cartId,
        name: product.name,
        price: price,
        priceFormatted: `$${price}`,
        image: primaryImage?.image_url || '',
        category: product.position || 'Lookbook',
        size: 'M',
        // Bundle tracking
        lookId: lookId,
        lookName: lookName,
        productId: product.id,
      });

      setAddedProducts(prev => new Set(prev).add(product.id));
      addedAny = true;
    });

    if (addedAny) {
      toast({
        title: "Complete look added",
        description: `"${lookName}" added to your bag${bundleDiscountPercent > 0 ? ` — ${bundleDiscountPercent}% bundle discount applied!` : ''}`,
      });
    }
  };

  if (products.length === 0) {
    return null;
  }

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };

  return (
    <div className="space-y-6">
      {/* Section Label with Progress */}
      <div className="flex items-center justify-between">
        <p className="text-xs md:text-[10px] uppercase tracking-[0.25em] text-white/40 font-light">
          Shop the Look
        </p>
        {addedCount > 0 && (
          <motion.p 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs md:text-[10px] uppercase tracking-wide text-champagne-500 font-medium"
          >
            {addedCount} of {products.length} in bag
          </motion.p>
        )}
      </div>

      {/* Mobile swipe CTA removed — mobile users access swipe via LookSection's compact CTA */}

      {/* Products Grid - Show 2 on mobile, 4 on desktop */}
      <StaggerContainer className="grid grid-cols-2 gap-3" staggerDelay={0.1} delayChildren={0}>
        {products.slice(0, isMobile ? 2 : 4).map((product) => (
          <LookProductCard
            key={product.id}
            product={product}
            productsInCart={productsInCart}
          />
        ))}
      </StaggerContainer>

      {/* Add Complete Look CTA */}
      <motion.div
        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        transition={springConfig}
      >
        <Button
          onClick={handleAddAll}
          disabled={addedCount === products.length}
          className={`
            w-full font-light tracking-wide h-12 rounded-none transition-colors
            ${addedCount === products.length 
              ? 'bg-foreground hover:bg-foreground text-background' 
              : 'bg-champagne-600 hover:bg-champagne-500 text-white'
            }
          `}
        >
          {addedCount === products.length ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Complete Look in Bag
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span>Add Complete Look</span>
              {bundleDiscountPercent > 0 && (
                <span className="ml-2 flex items-center gap-1.5">
                  <span className="line-through text-white/50 text-sm">${totalPrice.toFixed(0)}</span>
                  <span className="text-white font-medium">${discountedTotal.toFixed(0)}</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5">
                    -{bundleDiscountPercent}%
                  </span>
                </span>
              )}
            </>
          )}
        </Button>
      </motion.div>

      {/* Size memory hint */}
      {products.length > 0 && (
        <p className="text-xs md:text-[10px] text-center text-white/30 font-light">
          Tap + to instantly add in your size
        </p>
      )}

      {/* Swipe Lookbook Drawer */}
      <SwipeLookbook
        isOpen={isSwipeOpen}
        onClose={() => setIsSwipeOpen(false)}
        onViewBag={openCart}
        lookId={lookId || ''}
        lookName={lookName}
        products={products}
      />
    </div>
  );
};

export default ShopTheLook;
