import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/motion/ScrollReveal";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatPrice } from "@/lib/currency";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category_name?: string;
  primary_image?: string;
  is_on_sale: boolean;
  sale_price: number | null;
}

const DropGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            is_on_sale,
            sale_price,
            created_at,
            categories!products_category_id_fkey(name),
            product_images(image_url, is_primary)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;

        const formattedProducts = (data || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          is_on_sale: product.is_on_sale,
          sale_price: product.sale_price,
          category_name: product.categories?.name || 'Apparel',
          primary_image: product.product_images?.find((img: any) => img.is_primary)?.image_url || 
                        product.product_images?.[0]?.image_url
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  if (products.length === 0) {
    return (
      <section className="w-full py-12 md:py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 xs:px-6">
          <div className="flex justify-between items-end mb-6 md:mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold tracking-wider uppercase px-2 py-0.5">
                  Just Dropped
                </span>
              </div>
              <h2 className="text-section text-foreground">New Arrivals</h2>
            </div>
          </div>
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground font-light tracking-wide">
              Coming soon...
            </p>
          </div>
        </div>
      </section>
    );
  }

  const displayProducts = products;

  return (
    <section className="w-full py-12 md:py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 xs:px-6">
        {/* Section Header - Hypebeast style */}
        <ScrollReveal variant="slideInLeft">
          <div className="flex justify-between items-end mb-6 md:mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold tracking-wider uppercase px-2 py-0.5">
                  Just Dropped
                </span>
                <span className="text-caption text-muted-foreground hidden xs:inline">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-section text-foreground">New Arrivals</h2>
            </div>
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link 
                to="/category/new-in"
                className="text-foreground text-sm font-light flex items-center gap-2 hover:text-accent transition-colors group touch-target py-2"
              >
                View All
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </ScrollReveal>

        {/* Product Grid - Editorial with index numbers */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 md:gap-4" staggerDelay={0.1}>
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              whileHover={prefersReducedMotion ? {} : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                to={`/product/${product.slug}`}
                className="group block tap-feedback active:scale-[0.98] transition-transform duration-150"
              >
                {/* Product Image */}
                <div className="aspect-[3/4] bg-muted mb-3 md:mb-4 overflow-hidden relative">
                  {product.primary_image ? (
                    <motion.img 
                      src={product.primary_image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                      transition={{ duration: 0.5 }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
                      <span className="text-muted-foreground text-caption uppercase">
                        {product.category_name}
                      </span>
                    </div>
                  )}

                  {/* Index Number - 032c style - responsive sizing */}
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 text-[10px] font-medium text-foreground bg-background px-2 py-1 min-h-[24px] flex items-center">
                    #{String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Sale Badge */}
                  {product.is_on_sale && (
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-destructive text-destructive-foreground text-[10px] font-bold tracking-wider uppercase px-2 py-1">
                      Sale
                    </div>
                  )}
                </div>

                {/* Product Info - Minimal */}
                <div>
                  <p className="text-caption text-muted-foreground uppercase mb-1">
                    {product.category_name}
                  </p>
                  <h3 className="text-xs xs:text-sm font-light text-foreground mb-1 group-hover:text-accent transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {product.is_on_sale && product.sale_price ? (
                      <>
                        <span className="text-xs xs:text-sm font-light text-foreground">
                          {formatPrice(product.sale_price)}
                        </span>
                        <span className="text-xs xs:text-sm font-light text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs xs:text-sm font-light text-foreground">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default DropGrid;