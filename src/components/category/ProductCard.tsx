import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import InlineQuickSizePicker from "@/components/ui/InlineQuickSizePicker";
import CartQuantityBadge from "@/components/category/CartQuantityBadge";
import { useQuickAdd, ProductForQuickAdd } from "@/hooks/useQuickAdd";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/currency";

interface ProductImage {
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface ProductVariant {
  size: string | null;
  color: string | null;
  stock_quantity: number;
}

interface ProductCategory {
  name: string;
  slug: string;
}

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  created_at: string;
  categories?: ProductCategory;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
}

interface ProductCardProps {
  product: ProductCardData;
  onQuickView?: (product: ProductCardData) => void;
  index?: number;
  onAuthRequired?: () => void;
}

const ProductCard = ({ product, onQuickView, index = 0, onAuthRequired }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { items } = useCart();

  // Check if product is in cart
  const productHex = product.id.replace(/-/g, '').slice(0, 8);
  const cartItemId = parseInt(productHex, 16);
  const isInCart = items.some(item => item.id === cartItemId);

  // Map product to QuickAdd format
  const quickAddProduct: ProductForQuickAdd = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    sale_price: product.sale_price,
    is_on_sale: product.is_on_sale,
    category_slug: product.categories?.slug,
    product_images: product.product_images?.map(img => ({
      image_url: img.image_url,
      is_primary: img.is_primary,
    })),
    product_variants: product.product_variants,
  };

  const quickAdd = useQuickAdd(quickAddProduct);

  // Get primary and secondary images
  const sortedImages = [...(product.product_images || [])].sort(
    (a, b) => a.display_order - b.display_order
  );
  const primaryImage = sortedImages.find((img) => img.is_primary) || sortedImages[0];
  const secondaryImage = sortedImages.find((img) => !img.is_primary && img !== primaryImage);

  // Check if product is new (created within last 14 days)
  const isNew = new Date(product.created_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // Get unique colors
  const uniqueColors = [
    ...new Set(
      (product.product_variants || [])
        .map((v) => v.color)
        .filter(Boolean) as string[]
    ),
  ];

  // Determine badges
  const badges: { label: string; className: string }[] = [];
  if (isNew) {
    badges.push({ label: "NEW", className: "bg-foreground text-background" });
  }
  if (product.is_on_sale && product.sale_price) {
    badges.push({ label: "SALE", className: "bg-champagne-500 text-white" });
  }
  if (quickAdd.hasLowStock) {
    badges.push({ label: "LOW STOCK", className: "bg-orange-500 text-white" });
  } else if (quickAdd.totalStock > 0 && quickAdd.totalStock < 5) {
    badges.push({ label: "ALMOST GONE", className: "bg-red-500 text-white" });
  }

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };
  
  // Show actions on mobile always, on desktop only on hover
  const showActions = isMobile || (isHovered && !quickAdd.isPickerOpen && !quickAdd.isAdded);

  return (
    <Card
      className="border-none shadow-none bg-transparent group cursor-pointer animate-fade-in active:scale-[0.98] transition-transform duration-75"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (quickAdd.isPickerOpen) quickAdd.hideSizePicker();
      }}
    >
      <CardContent className="p-0">
        <Link to={`/product/${product.slug}`}>
          <div className="aspect-[3/4] mb-3 overflow-hidden bg-muted/10 relative">
            {/* Primary Image */}
            {primaryImage && (
              <img
                src={primaryImage.image_url}
                alt={product.name}
                loading={index < 4 ? "eager" : "lazy"}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isHovered && secondaryImage ? "opacity-0" : "opacity-100"
                }`}
              />
            )}

            {/* Secondary Image (hover) */}
            {secondaryImage && (
              <img
                src={secondaryImage.image_url}
                alt={`${product.name} lifestyle`}
                loading="lazy"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              />
            )}

            {/* Fallback if no images */}
            {!primaryImage && (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No image</span>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/[0.02]" />

            {/* Cart Quantity Badge - shows when item is in cart */}
            {isInCart && !isHovered && (
              <CartQuantityBadge 
                productId={product.id} 
                productName={product.name}
                variant="badge"
              />
            )}

            {/* Badges - positioned to not overlap with cart badge */}
            {badges.length > 0 && !isInCart && (
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {badges.map((badge, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 text-[10px] font-medium tracking-wider ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}
            {/* Badges when item is in cart - show on right side */}
            {badges.length > 0 && isInCart && !isHovered && (
              <div className="absolute top-3 right-12 flex flex-col gap-1.5">
                {badges.map((badge, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 text-[10px] font-medium tracking-wider ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}

            {/* Favorite Button - Always visible on mobile */}
            <div className={`absolute top-3 right-3 transition-opacity duration-200 ${
              isMobile ? "opacity-100" : isHovered ? "opacity-100" : "opacity-0"
            } md:group-hover:opacity-100`}>
              <FavoriteButton
                productId={product.id}
                size="sm"
                onAuthRequired={onAuthRequired}
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
              />
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
              {quickAdd.isAdded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-foreground/90 flex flex-col items-center justify-center gap-2 z-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <span className="text-white text-xs font-medium">
                    Size {quickAdd.addedSize}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Actions - Always visible on mobile, hover on desktop */}
            <div
              className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ${
                showActions ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 bg-white/95 hover:bg-white text-foreground text-xs h-10 md:h-9"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView?.(product);
                }}
              >
                <Eye className="w-4 h-4 md:w-3.5 md:h-3.5 mr-1.5" />
                Quick View
              </Button>
              {quickAdd.totalStock > 0 && (
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  transition={springConfig}
                >
                  <Button
                    variant="default"
                    size="sm"
                    className={`text-xs h-10 md:h-9 px-4 md:px-3 ${
                      quickAdd.canOneTap 
                        ? 'bg-champagne-500 hover:bg-champagne-400 text-white' 
                        : 'bg-foreground/95 hover:bg-foreground text-background'
                    }`}
                    onClick={quickAdd.handleQuickAdd}
                    disabled={quickAdd.isAdding}
                  >
                    {quickAdd.isAdding ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <Plus className="w-4 h-4 md:w-3.5 md:h-3.5" />
                    )}
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Inline Size Picker */}
            <AnimatePresence>
              {quickAdd.isPickerOpen && (
                <InlineQuickSizePicker
                  sizes={quickAdd.availableSizes}
                  rememberedSize={quickAdd.rememberedSize}
                  onSelect={quickAdd.handleSizeSelect}
                  onClose={quickAdd.hideSizePicker}
                  getStockForSize={(size) => quickAdd.getStockForVariant(size)}
                  variant="light"
                />
              )}
            </AnimatePresence>
          </div>
        </Link>

        {/* Product Info */}
        <div className="space-y-1.5">
          {/* Category */}
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-light">
            {product.categories?.name || "Uncategorized"}
          </p>

          {/* Name & Price Row */}
          <div className="flex justify-between items-start gap-2">
            <Link to={`/product/${product.slug}`}>
              <h3 className="text-sm font-medium text-foreground hover:underline leading-tight line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <div className="text-right shrink-0">
              {product.is_on_sale && product.sale_price ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-light text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm font-medium text-champagne-500">
                    {formatPrice(product.sale_price)}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-light text-foreground">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Color Swatches + Size Memory Hint */}
          <div className="flex items-center justify-between pt-1">
            {uniqueColors.length > 1 && (
              <div className="flex items-center gap-1.5">
                {uniqueColors.slice(0, 4).map((color) => (
                  <span
                    key={color}
                    className="w-4 h-4 md:w-3.5 md:h-3.5 rounded-full border border-border"
                    style={{
                      backgroundColor:
                        color.toLowerCase() === "black"
                          ? "#1a1a1a"
                          : color.toLowerCase() === "white"
                          ? "#ffffff"
                          : color.toLowerCase() === "navy"
                          ? "#1e3a5f"
                          : color.toLowerCase() === "gray" || color.toLowerCase() === "grey"
                          ? "#6b7280"
                          : color.toLowerCase() === "natural"
                          ? "#f5f0e6"
                          : color.toLowerCase() === "gold"
                          ? "#d4af37"
                          : color,
                    }}
                    title={color}
                  />
                ))}
                {uniqueColors.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{uniqueColors.length - 4}
                  </span>
                )}
              </div>
            )}
            {/* Size memory indicator */}
            {quickAdd.rememberedSize && quickAdd.stockForRemembered > 0 && (
              <span className="text-[10px] uppercase tracking-wide text-champagne-600 font-medium">
                {quickAdd.rememberedSize}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
