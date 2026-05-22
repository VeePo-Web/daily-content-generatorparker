import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { ProductCardData } from "./ProductCard";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { useQuickAdd, ProductForQuickAdd } from "@/hooks/useQuickAdd";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatPrice } from "@/lib/cartUtils";

interface QuickViewModalProps {
  product: ProductCardData | null;
  open: boolean;
  onClose: () => void;
  onAuthRequired?: () => void;
}

const QuickViewModal = ({ product, open, onClose, onAuthRequired }: QuickViewModalProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Map product to QuickAdd format
  const quickAddProduct: ProductForQuickAdd | null = product ? {
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
  } : null;

  const quickAdd = useQuickAdd(quickAddProduct, { 
    showToast: true,
    onSuccess: () => {
      onClose();
    }
  });

  // Reset state and auto-select remembered size when product changes
  useEffect(() => {
    if (product?.id) {
      setQuantity(1);
      setCurrentImageIndex(0);
      
      // Auto-select remembered size if in stock
      if (quickAdd.rememberedSize && quickAdd.stockForRemembered > 0) {
        setSelectedSize(quickAdd.rememberedSize);
      } else if (quickAdd.suggestedFallback) {
        setSelectedSize(quickAdd.suggestedFallback);
      } else {
        setSelectedSize(null);
      }
      
      // Auto-select color if only one available
      if (quickAdd.availableColors.length === 1) {
        setSelectedColor(quickAdd.availableColors[0]);
      } else {
        setSelectedColor(null);
      }
    }
  }, [product?.id, quickAdd.rememberedSize, quickAdd.stockForRemembered, quickAdd.suggestedFallback, quickAdd.availableColors]);

  if (!product) return null;

  const sortedImages = [...(product.product_images || [])].sort(
    (a, b) => a.display_order - b.display_order
  );

  // Get unique sizes and colors
  const uniqueSizes = [
    ...new Set(
      (product.product_variants || [])
        .map((v) => v.size)
        .filter(Boolean) as string[]
    ),
  ];

  const uniqueColors = [
    ...new Set(
      (product.product_variants || [])
        .map((v) => v.color)
        .filter(Boolean) as string[]
    ),
  ];

  const currentStock = quickAdd.getStockForVariant(
    selectedSize || undefined,
    selectedColor || undefined
  );

  const displayPrice = product.is_on_sale && product.sale_price
    ? product.sale_price
    : product.price;

  const canAddToCart =
    currentStock > 0 &&
    (uniqueSizes.length === 0 || selectedSize) &&
    (uniqueColors.length === 0 || selectedColor);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === sortedImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? sortedImages.length - 1 : prev - 1
    );
  };

  const handleAddToCart = () => {
    quickAdd.addToCart({ 
      size: selectedSize || undefined, 
      color: selectedColor || undefined,
      quantity 
    });
  };

  // Shared content component
  const QuickViewContent = () => (
    <>
      {/* Image Gallery */}
      <div className="relative aspect-square md:aspect-auto md:h-[500px] max-h-[40vh] md:max-h-none bg-muted/10">
        {sortedImages.length > 0 ? (
          <>
            <img
              src={sortedImages[currentImageIndex]?.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {/* Success Overlay */}
            <AnimatePresence>
              {quickAdd.isAdded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-foreground/90 flex flex-col items-center justify-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Check className="w-12 h-12 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <span className="text-white text-sm font-medium">
                    Added in size {quickAdd.addedSize}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation arrows */}
            {sortedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-10 w-10 md:h-8 md:w-8"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5 md:h-4 md:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-10 w-10 md:h-8 md:w-8"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5 md:h-4 md:w-4" />
                </Button>
              </>
            )}

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {sortedImages.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 md:w-2 md:h-2 rounded-full transition-colors ${
                      index === currentImageIndex
                        ? "bg-foreground"
                        : "bg-foreground/30 hover:bg-foreground/50"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 md:p-6 lg:p-8 flex flex-col overflow-y-auto pb-safe">
        {/* Category */}
        <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
          {product.categories?.name}
        </p>

        {/* Name */}
        <h2 className="text-xl md:text-2xl font-light text-foreground mb-3">
          {product.name}
        </h2>

        {/* Price */}
        <div className="mb-5 md:mb-6">
          {product.is_on_sale && product.sale_price ? (
            <div className="flex items-center gap-3">
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-xl font-medium text-champagne-600">
                {formatPrice(product.sale_price)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-light">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Size Selector */}
        {uniqueSizes.length > 0 && (
          <div className="mb-4 md:mb-5">
            <label className="text-sm font-light text-foreground mb-3 block">
              Size
            </label>
            <div className="flex flex-wrap gap-2">
              {uniqueSizes.map((size) => {
                const stockForSize = quickAdd.getStockForVariant(size, selectedColor || undefined);
                const isAvailable = stockForSize > 0;
                const isRemembered = size === quickAdd.rememberedSize;

                return (
                  <button
                    key={size}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(size)}
                    className={`relative px-4 py-3 md:py-2 text-sm border transition-colors min-h-[44px] md:min-h-0 ${
                      selectedSize === size
                        ? "border-foreground bg-foreground text-background"
                        : isAvailable
                        ? "border-border hover:border-foreground"
                        : "border-border/50 text-muted-foreground/50 line-through cursor-not-allowed"
                    }`}
                  >
                    {size}
                    {/* "Your size" badge */}
                    {isRemembered && isAvailable && selectedSize !== size && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1 text-[8px] uppercase tracking-wide text-champagne-600 bg-background whitespace-nowrap">
                        yours
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Color Selector */}
        {uniqueColors.length > 0 && (
          <div className="mb-5 md:mb-6">
            <label className="text-sm font-light text-foreground mb-3 block">
              Color{selectedColor ? `: ${selectedColor}` : ""}
            </label>
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map((color) => {
                const stockForColor = quickAdd.getStockForVariant(selectedSize || undefined, color);
                const isAvailable = stockForColor > 0;

                return (
                  <button
                    key={color}
                    disabled={!isAvailable}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 md:w-8 md:h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-foreground"
                        : isAvailable
                        ? "hover:ring-1 hover:ring-offset-1 hover:ring-foreground/50"
                        : "opacity-30 cursor-not-allowed"
                    }`}
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
                      borderColor:
                        color.toLowerCase() === "white" ? "#e5e5e5" : "transparent",
                    }}
                    title={color}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="mb-5 md:mb-6">
          <label className="text-sm font-light text-foreground mb-3 block">
            Quantity
          </label>
          <div className="flex items-center border border-border w-fit">
            <button
              className="p-3 md:p-2 hover:bg-muted/50 transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              className="p-3 md:p-2 hover:bg-muted/50 transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
              onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
              disabled={quantity >= currentStock}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stock status */}
        {currentStock > 0 && currentStock < 5 && (
          <p className="text-sm text-champagne-600 mb-4">
            Only {currentStock} left in stock
          </p>
        )}

        {currentStock === 0 && (
          <p className="text-sm text-red-500 mb-4">Out of stock</p>
        )}

        {/* Add to Cart */}
        <div className="mt-auto space-y-3">
          <Button
            className="w-full h-12 text-sm font-normal"
            disabled={!canAddToCart || quickAdd.isAdding}
            onClick={handleAddToCart}
          >
            {quickAdd.isAdding ? (
              <span className="animate-pulse">Adding...</span>
            ) : canAddToCart ? (
              `Add to Bag — ${formatPrice(displayPrice * quantity)}`
            ) : currentStock === 0 ? (
              "Out of Stock"
            ) : (
              "Select Options"
            )}
          </Button>

          <div className="flex items-center justify-between">
            <Link
              to={`/product/${product.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors inline-flex items-center min-h-[44px] py-2"
              onClick={onClose}
            >
              View Full Details
            </Link>
            <FavoriteButton
              productId={product.id}
              variant="icon-with-text"
              onAuthRequired={onAuthRequired}
            />
          </div>
        </div>
      </div>
    </>
  );

  // Use Drawer on mobile, Dialog on desktop
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>{product.name} - Quick View</DialogTitle>
          </VisuallyHidden>
          <div className="flex flex-col max-h-[90vh] overflow-y-auto">
            <QuickViewContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 bg-background border-none overflow-hidden max-h-[90vh]">
        <VisuallyHidden>
          <DialogTitle>{product.name} - Quick View</DialogTitle>
        </VisuallyHidden>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 md:right-4 md:top-4 z-50 bg-white/80 hover:bg-white rounded-full w-10 h-10 md:w-auto md:h-auto"
          onClick={onClose}
        >
          <X className="h-5 w-5 md:h-4 md:w-4" />
        </Button>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-0 overflow-y-auto">
          <QuickViewContent />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
