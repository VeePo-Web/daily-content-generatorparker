import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import TextReveal from "@/components/motion/TextReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing } from "@/lib/animations";

interface WearWithSectionProps {
  currentProductId?: string;
  categoryId?: string | null;
}

const WearWithSection = ({ currentProductId, categoryId }: WearWithSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["wear-with", currentProductId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          price,
          sale_price,
          is_on_sale,
          product_images(image_url, is_primary)
        `)
        .eq("status", "active")
        .limit(6);

      // Exclude current product
      if (currentProductId) {
        query = query.neq("id", currentProductId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const displayProducts = products.slice(0, 4);

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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easing.editorial,
      }
    }
  };

  if (isLoading) {
    return (
      <section className="w-full py-12 lg:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-4 bg-muted rounded w-40 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayProducts.length === 0) return null;

  if (prefersReducedMotion) {
    return (
      <section className="w-full py-12 lg:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em] mb-8">
            Complete The Look
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {displayProducts.map((product) => {
              const primaryImage = product.product_images?.find((img: any) => img.is_primary);
              const imageUrl = primaryImage?.image_url || product.product_images?.[0]?.image_url;
              return (
                <Link key={product.id} to={`/product/${product.slug}`} className="group">
                  <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-3">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <span className="text-4xl opacity-20">✝</span>
                      </div>
                    )}
                    <button className="absolute bottom-3 left-3 right-3 h-9 bg-background/90 backdrop-blur-sm text-foreground text-xs font-light flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Quick Add
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-light text-foreground line-clamp-1">{product.name}</p>
                    <div className="flex items-center gap-2">
                      {product.is_on_sale && product.sale_price ? (
                        <>
                          <span className="text-sm font-light text-foreground">${product.sale_price.toFixed(2)}</span>
                          <span className="text-xs font-light text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-sm font-light text-muted-foreground">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="w-full py-12 lg:py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <TextReveal 
            text="Complete The Look"
            className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em]"
          />
        </div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {displayProducts.map((product, index) => {
            const primaryImage = product.product_images?.find((img: any) => img.is_primary);
            const imageUrl = primaryImage?.image_url || product.product_images?.[0]?.image_url;

            return (
              <motion.div
                key={product.id}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
              >
                <Link
                  to={`/product/${product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-3">
                    {imageUrl ? (
                      <motion.img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5, ease: easing.editorial }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <span className="text-4xl opacity-20">✝</span>
                      </div>
                    )}

                    {/* Quick Add Button - slides up from bottom */}
                    <motion.button
                      className="absolute bottom-0 left-3 right-3 h-9 bg-background/90 backdrop-blur-sm text-foreground text-xs font-light flex items-center justify-center gap-2 hover:bg-background"
                      initial={{ y: 50, opacity: 0 }}
                      whileHover={{ y: -12 }}
                      animate={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 50, opacity: 0 }}
                      onClick={(e) => {
                        e.preventDefault();
                        // Quick add logic would go here
                      }}
                      style={{ 
                        opacity: 0,
                        transform: "translateY(50px)"
                      }}
                      transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Quick Add
                    </motion.button>
                    
                    {/* CSS fallback for hover */}
                    <button
                      className="absolute bottom-3 left-3 right-3 h-9 bg-background/90 backdrop-blur-sm text-foreground text-xs font-light flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-background"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Quick Add
                    </button>
                  </div>

                  <motion.div 
                    className="space-y-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                  >
                    <p className="text-sm font-light text-foreground group-hover:text-muted-foreground transition-colors line-clamp-1">
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
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default WearWithSection;
