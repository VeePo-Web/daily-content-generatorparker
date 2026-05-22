import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { useQuickAdd, ProductForQuickAdd } from "@/hooks/useQuickAdd";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import InlineQuickSizePicker from "@/components/ui/InlineQuickSizePicker";
import { easing } from "@/lib/animations";

interface ProductImage {
  image_url: string;
  is_primary: boolean;
}

interface ProductVariant {
  size: string | null;
  stock_quantity: number;
}

interface LookbookProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  categories?: { slug: string } | null;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
}

interface LookbookProductCardProps {
  product: LookbookProduct;
  position: string | null;
}

const LookbookProductCard = ({ product, position }: LookbookProductCardProps) => {
  const prefersReducedMotion = useReducedMotion();

  // Map to QuickAdd format
  const quickAddProduct: ProductForQuickAdd = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    sale_price: product.sale_price,
    is_on_sale: product.is_on_sale,
    category_slug: product.categories?.slug,
    position: position,
    product_images: product.product_images,
    product_variants: product.product_variants?.map(v => ({
      size: v.size,
      color: null,
      stock_quantity: v.stock_quantity,
    })),
  };

  const quickAdd = useQuickAdd(quickAddProduct);

  const primaryImage = product.product_images?.find(img => img.is_primary);
  const imageUrl = primaryImage?.image_url || product.product_images?.[0]?.image_url;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: easing.editorial }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex-shrink-0 w-[180px] md:w-auto"
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-3">
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
              transition={{ duration: 0.5, ease: easing.editorial }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-4xl opacity-20">✝</span>
            </div>
          )}

          {/* Position Badge */}
          {position && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[9px] uppercase tracking-wider font-light">
              {position}
            </span>
          )}

          {/* Success Overlay */}
          <AnimatePresence>
            {quickAdd.isAdded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-champagne-600/90 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Add Button */}
          <AnimatePresence>
            {!quickAdd.isPickerOpen && !quickAdd.isAdded && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={quickAdd.handleQuickAdd}
                disabled={quickAdd.isAdding}
                className="absolute bottom-2 left-2 right-2 h-9 bg-background/95 backdrop-blur-sm 
                         text-foreground text-xs font-light flex items-center justify-center gap-1.5
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300
                         hover:bg-foreground hover:text-background disabled:opacity-50"
              >
                {quickAdd.isAdding ? (
                  <span className="animate-pulse">Adding...</span>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    {quickAdd.canOneTap 
                      ? `Add in ${quickAdd.rememberedSize}` 
                      : 'Add'}
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>

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
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <p className="text-sm font-light text-foreground line-clamp-1 group-hover:text-muted-foreground transition-colors">
            {product.name}
          </p>
          <div className="flex items-center gap-2">
            {product.is_on_sale && product.sale_price ? (
              <>
                <span className="text-sm font-light text-foreground">
                  ${product.sale_price.toFixed(2)}
                </span>
                <span className="text-xs font-light text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-light text-muted-foreground">
                ${product.price.toFixed(2)}
              </span>
            )}
            {/* Size memory indicator */}
            {quickAdd.rememberedSize && quickAdd.stockForRemembered > 0 && (
              <span className="text-[9px] uppercase tracking-wide text-champagne-600 font-medium">
                {quickAdd.rememberedSize}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default LookbookProductCard;
