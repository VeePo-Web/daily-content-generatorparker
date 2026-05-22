import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import TextReveal from "@/components/motion/TextReveal";
import LookbookProductCard from "./LookbookProductCard";
import WearWithSection from "./WearWithSection";
import { easing } from "@/lib/animations";

interface LookbookLookSectionProps {
  currentProductId: string;
  fallbackCategoryId?: string | null;
}

interface LookProduct {
  position: string | null;
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    is_on_sale: boolean;
    categories: { slug: string } | null;
    product_images: { image_url: string; is_primary: boolean }[];
    product_variants: { size: string | null; stock_quantity: number }[];
  };
}

interface LookData {
  look: {
    id: string;
    name: string;
    headline: string;
    scripture_reference: string | null;
    image_url: string;
  };
  products: LookProduct[];
}

const LookbookLookSection = ({ currentProductId, fallbackCategoryId }: LookbookLookSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();

  const { data: lookData, isLoading } = useQuery<LookData | null>({
    queryKey: ["product-lookbook-look", currentProductId],
    queryFn: async () => {
      // Step 1: Find looks containing this product
      const { data: lookProducts, error: lookError } = await supabase
        .from("lookbook_look_products")
        .select(`
          look_id,
          lookbook_looks!inner (
            id, name, headline, scripture_reference, image_url, is_active
          )
        `)
        .eq("product_id", currentProductId);

      if (lookError || !lookProducts?.length) return null;

      // Find active looks only
      const activeLook = lookProducts.find(
        (lp: any) => lp.lookbook_looks?.is_active
      );
      
      if (!activeLook) return null;

      const look = (activeLook as any).lookbook_looks;

      // Step 2: Fetch all other products from this look
      const { data: siblingProducts, error: siblingError } = await supabase
        .from("lookbook_look_products")
        .select(`
          position,
          product_id
        `)
        .eq("look_id", look.id)
        .neq("product_id", currentProductId)
        .order("display_order", { ascending: true });

      if (siblingError || !siblingProducts?.length) return null;

      // Fetch full product details for each sibling
      const productIds = siblingProducts.map(sp => sp.product_id);
      
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(`
          id, name, slug, price, sale_price, is_on_sale,
          categories:category_id (slug),
          product_images (image_url, is_primary),
          product_variants (size, stock_quantity)
        `)
        .in("id", productIds)
        .eq("status", "active");

      if (productsError) return null;

      // Map products back to their positions
      const productsWithPosition = siblingProducts
        .map(sp => {
          const product = products?.find(p => p.id === sp.product_id);
          if (!product) return null;
          return {
            position: sp.position,
            products: {
              ...product,
              categories: product.categories as { slug: string } | null,
              product_images: product.product_images || [],
              product_variants: product.product_variants || []
            }
          };
        })
        .filter((item): item is LookProduct => item !== null);

      if (productsWithPosition.length === 0) return null;

      return {
        look: {
          id: look.id,
          name: look.name,
          headline: look.headline,
          scripture_reference: look.scripture_reference,
          image_url: look.image_url
        },
        products: productsWithPosition
      };
    },
    enabled: !!currentProductId,
  });

  // If no lookbook data, fall back to WearWithSection
  if (!isLoading && !lookData) {
    return (
      <WearWithSection 
        currentProductId={currentProductId}
        categoryId={fallbackCategoryId}
      />
    );
  }

  if (isLoading) {
    return (
      <section className="w-full py-12 lg:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-4 bg-muted rounded w-48 mb-2 animate-pulse" />
          <div className="h-5 bg-muted rounded w-64 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!lookData) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  // Static rendering for reduced motion
  if (prefersReducedMotion) {
    return (
      <section className="w-full py-12 lg:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Editorial Header */}
          <div className="mb-8">
            <p className="text-[10px] font-light text-muted-foreground uppercase tracking-[0.25em] mb-1">
              From The {lookData.look.name}
            </p>
            <p className="text-base font-light italic text-foreground mb-1">
              "{lookData.look.headline}"
            </p>
            {lookData.look.scripture_reference && (
              <p className="text-[11px] text-champagne-600/80 font-light">
                {lookData.look.scripture_reference}
              </p>
            )}
          </div>

          {/* Products Grid - Horizontal Scroll on Mobile */}
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible scrollbar-hide snap-x snap-mandatory">
            {lookData.products.map((item) => (
              <LookbookProductCard
                key={item.products.id}
                product={item.products}
                position={item.position}
              />
            ))}
          </div>

          {/* View Full Look Link */}
          <div className="mt-6 text-center md:text-left">
            <Link 
              to={`/lookbook#look-${lookData.look.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-light text-muted-foreground 
                       hover:text-foreground transition-colors group"
            >
              View Full Look
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="w-full py-12 lg:py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Editorial Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, ease: easing.editorial }}
        >
          <TextReveal 
            text={`From The ${lookData.look.name}`}
            className="text-[10px] font-light text-muted-foreground uppercase tracking-[0.25em] mb-1"
          />
          <motion.p 
            className="text-base font-light italic text-foreground mb-1"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            "{lookData.look.headline}"
          </motion.p>
          {lookData.look.scripture_reference && (
            <motion.p 
              className="text-[11px] text-champagne-600/80 font-light"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {lookData.look.scripture_reference}
            </motion.p>
          )}
        </motion.div>

        {/* Products Grid - Horizontal Scroll on Mobile */}
        <motion.div 
          className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible scrollbar-hide snap-x snap-mandatory"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {lookData.products.map((item) => (
            <LookbookProductCard
              key={item.products.id}
              product={item.products}
              position={item.position}
            />
          ))}
        </motion.div>

        {/* View Full Look Link */}
        <motion.div 
          className="mt-6 text-center md:text-left"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Link 
            to={`/lookbook#look-${lookData.look.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-light text-muted-foreground 
                     hover:text-foreground transition-colors group"
          >
            View Full Look
            <motion.span
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default LookbookLookSection;
