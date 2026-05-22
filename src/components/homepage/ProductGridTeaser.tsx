import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const ProductGridTeaser = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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

  // Placeholder products
  const placeholderProducts: Product[] = [
    { id: '1', name: 'Grace Oversized Tee', slug: 'grace-oversized-tee', price: 48, category_name: 'T-Shirts', is_on_sale: false, sale_price: null },
    { id: '2', name: 'Covenant Joggers', slug: 'covenant-joggers', price: 75, category_name: 'Pants', is_on_sale: false, sale_price: null },
    { id: '3', name: 'Psalms Beanie', slug: 'psalms-beanie', price: 28, category_name: 'Accessories', is_on_sale: true, sale_price: 22 },
    { id: '4', name: 'Glory Bomber Jacket', slug: 'glory-bomber-jacket', price: 120, category_name: 'Jackets', is_on_sale: false, sale_price: null },
  ];

  const displayProducts = products.length > 0 ? products : placeholderProducts;

  return (
    <section 
      ref={sectionRef}
      className="w-full py-16 md:py-24 px-6 bg-background"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div 
          className={`flex justify-between items-end mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div>
            <p className="text-champagne-600 text-xs tracking-[0.2em] uppercase mb-2">
              Just For You
            </p>
            <h2 className="text-foreground text-3xl md:text-4xl font-light">
              You Might Also Love
            </h2>
          </div>
          <Link 
            to="/category/new-in"
            className="text-foreground text-sm font-light flex items-center gap-2 hover:text-champagne-600 transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Grid - Horizontal Scroll on Mobile */}
        <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
          {displayProducts.map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className={`group block flex-shrink-0 w-[70vw] md:w-auto transition-all duration-700 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Product Image */}
              <div className="aspect-[3/4] bg-stone-100 mb-4 overflow-hidden relative">
                {product.primary_image ? (
                  <img 
                    src={product.primary_image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300">
                    <span className="text-stone-400 text-xs uppercase tracking-wider">
                      {product.category_name}
                    </span>
                  </div>
                )}

                {/* New Badge */}
                <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-medium tracking-wider uppercase px-2 py-1">
                  New
                </div>

                {/* Sale Badge */}
                {product.is_on_sale && (
                  <div className="absolute top-3 right-3 bg-champagne-500 text-black text-[10px] font-medium tracking-wider uppercase px-2 py-1">
                    Sale
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                  {product.category_name}
                </p>
                <h3 className="text-foreground text-sm font-light mb-1 group-hover:text-champagne-600 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  {product.is_on_sale && product.sale_price ? (
                    <>
                      <span className="text-foreground text-sm font-light">
                        ${product.sale_price}
                      </span>
                      <span className="text-muted-foreground text-sm font-light line-through">
                        ${product.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-foreground text-sm font-light">
                      ${product.price}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGridTeaser;
