import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, useInView } from "framer-motion";
import { Instagram, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing } from "@/lib/animations";

interface StyledByTribeProps {
  productId?: string;
}

const StyledByTribe = ({ productId }: StyledByTribeProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();

  const { data: ugcImages = [], isLoading } = useQuery({
    queryKey: ["product-ugc", productId],
    queryFn: async () => {
      const query = supabase
        .from("product_ugc")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (productId) {
        query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  if (!isLoading && ugcImages.length === 0) {
    return (
      <section className="w-full py-12 lg:py-16">
        <div className="px-6 mb-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em] mb-2">
              Styled By The Tribe
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground font-light tracking-wide">
            Coming soon...
          </p>
        </div>
      </section>
    );
  }

  const displayImages = ugcImages;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easing.editorial,
      }
    }
  };

  if (prefersReducedMotion) {
    return (
      <section className="w-full py-12 lg:py-16">
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div>
              <h2 className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em] mb-2">
                Styled By The Tribe
              </h2>
              <p className="text-sm font-light text-muted-foreground">
                Tag us <span className="text-foreground">@lineofjudahwear</span> for a chance to be featured
              </p>
            </div>
            <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 h-9 text-xs font-light border-border hover:bg-muted/50">
              <Camera className="w-3.5 h-3.5" />
              Submit Your Photo
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-6 pb-4" style={{ width: "max-content" }}>
            {displayImages.map((item) => (
              <div key={item.id} className="relative w-[200px] md:w-[240px] aspect-square bg-muted group cursor-pointer overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={`${item.customer_name}'s style`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <span className="text-4xl opacity-20">✝</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-background p-4">
                  <p className="text-sm font-light text-center mb-1">{item.customer_name}</p>
                  {item.instagram_handle && (
                    <div className="flex items-center gap-1 text-xs font-light opacity-80">
                      <Instagram className="w-3 h-3" />
                      {item.instagram_handle}
                    </div>
                  )}
                  {item.caption && <p className="text-xs font-light text-center mt-3 opacity-80 italic">"{item.caption}"</p>}
                </div>
              </div>
            ))}
            <div className="w-[200px] md:w-[240px] aspect-square border border-dashed border-border flex flex-col items-center justify-center gap-3 flex-shrink-0 hover:border-foreground transition-colors cursor-pointer">
              <Camera className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
              <div className="text-center">
                <p className="text-sm font-light text-foreground">Share Your Style</p>
                <p className="text-xs font-light text-muted-foreground mt-1">Tag @lineofjudahwear</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 mt-4 md:hidden">
          <Button variant="outline" className="w-full h-10 text-xs font-light border-border hover:bg-muted/50">
            <Camera className="w-3.5 h-3.5 mr-2" />
            Submit Your Photo
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="w-full py-12 lg:py-16">
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <ScrollReveal variant="fadeUp">
            <div>
              <h2 className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em] mb-2">
                Styled By The Tribe
              </h2>
              <p className="text-sm font-light text-muted-foreground">
                Tag us <span className="text-foreground">@lineofjudahwear</span> for a chance to be featured
              </p>
            </div>
          </ScrollReveal>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2 h-9 text-xs font-light border-border hover:bg-muted/50"
            >
              <Camera className="w-3.5 h-3.5" />
              Submit Your Photo
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Horizontal Scrolling Gallery */}
      <div className="overflow-x-auto scrollbar-hide">
        <motion.div 
          className="flex gap-4 px-6 pb-4" 
          style={{ width: "max-content" }}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {displayImages.map((item, index) => (
            <motion.div
              key={item.id}
              className="relative w-[200px] md:w-[240px] aspect-square bg-muted group cursor-pointer overflow-hidden flex-shrink-0"
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
            >
              {item.image_url ? (
                <motion.img
                  src={item.image_url}
                  alt={`${item.customer_name}'s style`}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5, ease: easing.editorial }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <span className="text-4xl opacity-20">✝</span>
                </div>
              )}

              {/* Overlay slides up on hover */}
              <motion.div 
                className="absolute inset-0 bg-foreground/60 flex flex-col items-center justify-center text-background p-4"
                initial={{ y: "100%" }}
                whileHover={{ y: 0 }}
                transition={{ duration: 0.3, ease: easing.editorial }}
              >
                <p className="text-sm font-light text-center mb-1">
                  {item.customer_name}
                </p>
                {item.instagram_handle && (
                  <motion.div 
                    className="flex items-center gap-1 text-xs font-light opacity-80"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Instagram className="w-3 h-3" />
                    {item.instagram_handle}
                  </motion.div>
                )}
                {item.caption && (
                  <p className="text-xs font-light text-center mt-3 opacity-80 italic">
                    "{item.caption}"
                  </p>
                )}
              </motion.div>
            </motion.div>
          ))}

          {/* CTA Card */}
          <motion.div 
            className="w-[200px] md:w-[240px] aspect-square border border-dashed border-border flex flex-col items-center justify-center gap-3 flex-shrink-0 cursor-pointer"
            variants={cardVariants}
            whileHover={{ 
              borderColor: "hsl(var(--foreground))",
              scale: 1.02,
            }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Camera className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-light text-foreground">Share Your Style</p>
              <p className="text-xs font-light text-muted-foreground mt-1">
                Tag @lineofjudahwear
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile Submit Button */}
      <motion.div 
        className="px-6 mt-4 md:hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <Button
          variant="outline"
          className="w-full h-10 text-xs font-light border-border hover:bg-muted/50"
        >
          <Camera className="w-3.5 h-3.5 mr-2" />
          Submit Your Photo
        </Button>
      </motion.div>
    </section>
  );
};

export default StyledByTribe;
