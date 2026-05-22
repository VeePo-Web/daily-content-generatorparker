import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard, { ProductCardData } from "./ProductCard";
import QuickViewModal from "./QuickViewModal";
import PLPTestimonialStrip from "./PLPTestimonialStrip";
import Pagination from "./Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { FilterState, SortOption } from "./FilterSortBar";

interface ProductGridProps {
  categorySlug?: string;
  filters: FilterState;
  sortBy: SortOption;
  page: number;
  pageSize?: number;
  onTotalCountChange?: (count: number) => void;
  onClearFilters?: () => void;
}

const ProductGrid = ({
  categorySlug,
  filters,
  sortBy,
  page,
  pageSize = 12,
  onTotalCountChange,
  onClearFilters,
}: ProductGridProps) => {
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", categorySlug, filters, sortBy, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          price,
          sale_price,
          is_on_sale,
          is_featured,
          status,
          material,
          created_at,
          categories:category_id(name, slug),
          product_images(image_url, is_primary, display_order),
          product_variants(size, color, stock_quantity)
        `,
          { count: "exact" }
        )
        .eq("status", "active");

      // Filter by category (including subcategories for parent categories)
      if (categorySlug && categorySlug !== "all" && categorySlug !== "shop") {
        // Get category by slug
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id, parent_id")
          .eq("slug", categorySlug)
          .maybeSingle();

        if (categoryData) {
          // Check if this is a parent category (has no parent_id)
          if (!categoryData.parent_id) {
            // Get all subcategories of this parent
            const { data: subcategories } = await supabase
              .from("categories")
              .select("id")
              .eq("parent_id", categoryData.id);

            if (subcategories && subcategories.length > 0) {
              // Filter by parent category OR any of its subcategories
              const allCategoryIds = [categoryData.id, ...subcategories.map(s => s.id)];
              query = query.in("category_id", allCategoryIds);
            } else {
              // No subcategories, just filter by the parent
              query = query.eq("category_id", categoryData.id);
            }
          } else {
            // This is a subcategory, filter directly
            query = query.eq("category_id", categoryData.id);
          }
        }
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "price-low":
          query = query.order("price", { ascending: true });
          break;
        case "price-high":
          query = query.order("price", { ascending: false });
          break;
        case "best-selling":
          query = query.order("is_featured", { ascending: false });
          break;
        case "featured":
        default:
          query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
          break;
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: products, error, count } = await query;

      if (error) throw error;

      // Report total count
      if (onTotalCountChange && count !== null) {
        onTotalCountChange(count);
      }

      // Client-side filtering for variants (sizes, colors)
      // This is a simplification - in production, you'd filter on the server
      let filteredProducts = products || [];

      if (filters.sizes.length > 0) {
        filteredProducts = filteredProducts.filter((p) =>
          p.product_variants?.some((v: { size: string | null }) =>
            filters.sizes.includes(v.size || "")
          )
        );
      }

      if (filters.colors.length > 0) {
        filteredProducts = filteredProducts.filter((p) =>
          p.product_variants?.some((v: { color: string | null }) =>
            filters.colors.includes(v.color || "")
          )
        );
      }

      // Price range filtering
      if (filters.priceRanges.length > 0) {
        filteredProducts = filteredProducts.filter((p) => {
          const price = p.sale_price || p.price;
          return filters.priceRanges.some((range) => {
            if (range === "Under $30") return price < 30;
            if (range === "$30 - $50") return price >= 30 && price < 50;
            if (range === "$50 - $75") return price >= 50 && price < 75;
            if (range === "$75 - $100") return price >= 75 && price < 100;
            if (range === "Over $100") return price >= 100;
            return true;
          });
        });
      }

      return {
        products: filteredProducts as ProductCardData[],
        totalCount: count || 0,
      };
    },
  });

  const products = data?.products || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Skeleton count based on device
  const skeletonCount = isMobile ? 4 : 8;

  if (error) {
    return (
      <section className="w-full px-4 md:px-6 mb-16">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load products</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full px-4 md:px-6 mb-6 md:mb-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(skeletonCount)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 md:py-16 flex flex-col items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base md:text-lg text-muted-foreground mb-1 md:mb-2">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or browse all products
              </p>
            </div>
            {onClearFilters && (
              <Button 
                variant="outline" 
                size="sm"
                className="min-h-[44px] mt-2"
                onClick={onClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onQuickView={setQuickViewProduct}
                onAuthRequired={() => setIsAuthModalOpen(true)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Testimonial Strip */}
      {products.length > 0 && <PLPTestimonialStrip />}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={() => {}}
        />
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAuthRequired={() => setIsAuthModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default ProductGrid;
