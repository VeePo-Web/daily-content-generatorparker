import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Minus, Plus, Truck, RotateCcw } from "lucide-react";
import SizeSelector from "./SizeSelector";
import ColorSwatchSelector from "./ColorSwatchSelector";
import TestimonialSnippet from "./TestimonialSnippet";
import ProductFAQ from "./ProductFAQ";
import ShippingReturnsAccordion from "./ShippingReturnsAccordion";
import TryItOnButton from "./TryItOnButton";
import TextReveal from "@/components/motion/TextReveal";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing } from "@/lib/animations";

interface ProductVariant {
  id: string;
  size: string | null;
  color: string | null;
  stock_quantity: number;
  price_adjustment: number | null;
}

interface Category {
  name: string;
  slug: string;
}

interface ProductInfoProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price?: number | null;
    is_on_sale: boolean;
    description?: string | null;
    material?: string | null;
    fit_type?: string | null;
    fabric_composition?: string | null;
    care_instructions?: string | null;
    common_questions?: { question: string; answer: string }[] | null;
    categories?: Category;
  };
  variants?: ProductVariant[];
  onColorChange?: (color: string) => void;
  onAuthRequired?: () => void;
  onAddToBag?: (details: { size: string | null; color: string | null; quantity: number }) => void;
}

// Color code mapping
const colorCodes: Record<string, string> = {
  black: "#1a1a1a",
  white: "#ffffff",
  navy: "#1e3a5f",
  gray: "#6b7280",
  natural: "#f5f5dc",
  gold: "#d4af37",
  charcoal: "#36454f",
  burgundy: "#800020",
  forest: "#228b22",
  cream: "#fffdd0",
};

const ProductInfo = ({ product, variants = [], onColorChange, onAuthRequired, onAddToBag }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Extract unique sizes with stock
  const sizes = useMemo(() => {
    const sizeMap = new Map<string, number>();
    variants.forEach((v) => {
      if (v.size) {
        const currentStock = sizeMap.get(v.size) || 0;
        // If color is selected, only count stock for that color
        if (selectedColor) {
          if (v.color?.toLowerCase() === selectedColor.toLowerCase()) {
            sizeMap.set(v.size, currentStock + v.stock_quantity);
          }
        } else {
          sizeMap.set(v.size, currentStock + v.stock_quantity);
        }
      }
    });
    
    const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
    return Array.from(sizeMap.entries())
      .map(([size, stock]) => ({ size, stock }))
      .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size));
  }, [variants, selectedColor]);

  // Extract unique colors with availability
  const colors = useMemo(() => {
    const colorSet = new Set<string>();
    variants.forEach((v) => {
      if (v.color) colorSet.add(v.color.toLowerCase());
    });
    
    return Array.from(colorSet).map((color) => {
      const hasStock = variants.some(
        (v) => v.color?.toLowerCase() === color && v.stock_quantity > 0
      );
      return {
        color,
        colorCode: colorCodes[color] || "#cccccc",
        available: hasStock,
      };
    });
  }, [variants]);

  // Auto-select color when only one option exists
  useEffect(() => {
    if (colors.length === 1 && !selectedColor) {
      setSelectedColor(colors[0].color);
      onColorChange?.(colors[0].color);
    }
  }, [colors]);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null); // Reset size when color changes
    onColorChange?.(color);
  };

  // Calculate price
  const displayPrice = product?.is_on_sale && product?.sale_price 
    ? product.sale_price 
    : product?.price || 0;
  const totalPrice = displayPrice * quantity;

  // Check if can add to bag
  const canAddToBag = variants.length === 0 || (
    (colors.length === 0 || selectedColor) && 
    (sizes.length === 0 || selectedSize)
  );

  // Fallback data for display
  const productName = product?.name || "Product";
  const categoryName = product?.categories?.name || "Collection";
  const categorySlug = product?.categories?.slug || "all";

  // Animation variants
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: easing.editorial,
      }
    })
  };

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.3,
      }
    }
  };

  const editorialEase = [0.25, 0.46, 0.45, 0.94] as const;
  const staggerItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "tween" as const,
        duration: 0.3,
        ease: editorialEase,
      }
    }
  };

  const trustSignals = [
    { icon: Truck, label: "Free shipping $99+" },
    { icon: RotateCcw, label: "Easy 30-day returns" },
  ];

  if (prefersReducedMotion) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb - Show only on desktop */}
        <div className="hidden lg:block">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-xs font-light">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/category/${categorySlug}`} className="text-xs font-light">
                    {categoryName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs font-light">{productName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Static content for reduced motion */}
        <div className="space-y-3">
          <p className="text-xs font-light text-muted-foreground uppercase tracking-[0.15em]">
            {categoryName}
          </p>
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl lg:text-3xl font-light text-foreground leading-tight">
              {productName}
            </h1>
            <div className="text-right flex-shrink-0">
              {product?.is_on_sale && product?.sale_price ? (
                <div className="space-y-0.5">
                  <p className="text-xl font-light text-foreground">${product.sale_price.toFixed(2)}</p>
                  <p className="text-sm font-light text-muted-foreground line-through">${product.price.toFixed(2)}</p>
                </div>
              ) : (
                <p className="text-xl font-light text-foreground">${(product?.price || 0).toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>

        <TestimonialSnippet productId={product?.id} />
        {colors.length > 0 && <ColorSwatchSelector colors={colors} selectedColor={selectedColor} onColorChange={handleColorChange} />}
        {sizes.length > 0 && <SizeSelector sizes={sizes} selectedSize={selectedSize} onSizeChange={setSelectedSize} />}

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-light text-foreground">Quantity</span>
            <div className="flex items-center border border-border">
              <Button variant="ghost" size="sm" onClick={decrementQuantity} className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none" aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border">{quantity}</span>
              <Button variant="ghost" size="sm" onClick={incrementQuantity} className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none" aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button id="main-add-to-bag" disabled={!canAddToBag} onClick={() => onAddToBag?.({ size: selectedSize, color: selectedColor, quantity })} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none disabled:opacity-50 disabled:cursor-not-allowed">
            Add to Bag — ${totalPrice.toFixed(2)}
          </Button>

          <FavoriteButton
            productId={product?.id || ""}
            variant="icon-with-text"
            onAuthRequired={onAuthRequired}
            className="w-full justify-center"
          />

          {/* TryItOnButton hidden until try-on room is ready */}

          <div className="flex items-center justify-center gap-6 py-3 text-xs font-light text-muted-foreground">
            {trustSignals.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <ProductFAQ commonQuestions={product?.common_questions} fitType={product?.fit_type} fabricComposition={product?.fabric_composition} careInstructions={product?.care_instructions} />
        <ShippingReturnsAccordion />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb - Show only on desktop */}
      <motion.div 
        className="hidden lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-xs font-light">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/category/${categorySlug}`} className="text-xs font-light">
                  {categoryName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs font-light">{productName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Category Badge + Title + Price */}
      <div className="space-y-3">
        <motion.p 
          className="text-xs font-light text-muted-foreground uppercase tracking-[0.15em]"
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {categoryName}
        </motion.p>
        <div className="flex justify-between items-start gap-4">
          <TextReveal 
            text={productName}
            as="h1"
            className="text-2xl lg:text-3xl font-light text-foreground leading-tight"
            delay={0.1}
          />
          <motion.div 
            className="text-right flex-shrink-0"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={0.3}
          >
            {product?.is_on_sale && product?.sale_price ? (
              <div className="space-y-0.5">
                <p className="text-xl font-light text-foreground">
                  ${product.sale_price.toFixed(2)}
                </p>
                <p className="text-sm font-light text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            ) : (
              <p className="text-xl font-light text-foreground">
                ${(product?.price || 0).toFixed(2)}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Testimonial Snippet */}
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        custom={0.4}
      >
        <TestimonialSnippet productId={product?.id} />
      </motion.div>

      {/* Color Selector with stagger animation */}
      <AnimatePresence>
        {colors.length > 0 && (
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <ColorSwatchSelector
              colors={colors}
              selectedColor={selectedColor}
              onColorChange={handleColorChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Selector with stagger animation */}
      <AnimatePresence>
        {sizes.length > 0 && (
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <SizeSelector
              sizes={sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quantity and Add to Cart */}
      <motion.div 
        className="space-y-4 pt-4"
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        custom={0.5}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-light text-foreground">Quantity</span>
          <div className="flex items-center border border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <motion.span 
              key={quantity}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border"
            >
              {quantity}
            </motion.span>
            <Button
              variant="ghost"
              size="sm"
              onClick={incrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: canAddToBag ? 1.01 : 1 }}
          whileTap={{ scale: canAddToBag ? 0.99 : 1 }}
          transition={{ delay: 0.6, duration: 0.4, ease: easing.editorial }}
        >
          <Button 
            id="main-add-to-bag"
            disabled={!canAddToBag}
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            onClick={() => onAddToBag?.({ size: selectedSize, color: selectedColor, quantity })}
          >
            Add to Bag — ${totalPrice.toFixed(2)}
          </Button>
        </motion.div>

        {/* Save to Favorites Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
        >
          <FavoriteButton
            productId={product?.id || ""}
            variant="icon-with-text"
            onAuthRequired={onAuthRequired}
            className="w-full justify-center"
          />
        </motion.div>

        {/* Try It On Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          {/* TryItOnButton hidden until try-on room is ready */}
        </motion.div>

        {/* Trust Row with stagger */}
        <motion.div 
          className="flex items-center justify-center gap-6 py-3 text-xs font-light text-muted-foreground"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {trustSignals.map(({ icon: Icon, label }, index) => (
            <motion.div 
              key={label} 
              className="flex items-center gap-1.5"
              variants={staggerItemVariants}
              custom={index}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Common Questions FAQ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <ProductFAQ 
          commonQuestions={product?.common_questions}
          fitType={product?.fit_type}
          fabricComposition={product?.fabric_composition}
          careInstructions={product?.care_instructions}
        />
      </motion.div>

      {/* Shipping & Returns */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <ShippingReturnsAccordion />
      </motion.div>
    </div>
  );
};

export default ProductInfo;
