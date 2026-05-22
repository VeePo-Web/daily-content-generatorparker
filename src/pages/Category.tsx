import { useState, useCallback, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CollectionHero from "../components/category/CollectionHero";
import FilterSortBar, { FilterState, SortOption } from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";
import { cn } from "@/lib/utils";

const Category = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  // Initialize state from URL params
  const [filters, setFilters] = useState<FilterState>(() => ({
    sizes: searchParams.get("sizes")?.split(",").filter(Boolean) || [],
    colors: searchParams.get("colors")?.split(",").filter(Boolean) || [],
    fits: searchParams.get("fits")?.split(",").filter(Boolean) || [],
    messageTypes: searchParams.get("messageTypes")?.split(",").filter(Boolean) || [],
    priceRanges: searchParams.get("priceRanges")?.split(",").filter(Boolean) || [],
    categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
  }));

  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "featured"
  );

  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  // Sticky filter bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const hero = document.querySelector('.collection-hero');
      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom;
        setIsFilterSticky(heroBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update URL when filters change
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page

    const params = new URLSearchParams();
    if (newFilters.sizes.length) params.set("sizes", newFilters.sizes.join(","));
    if (newFilters.colors.length) params.set("colors", newFilters.colors.join(","));
    if (newFilters.fits.length) params.set("fits", newFilters.fits.join(","));
    if (newFilters.messageTypes.length) params.set("messageTypes", newFilters.messageTypes.join(","));
    if (newFilters.priceRanges.length) params.set("priceRanges", newFilters.priceRanges.join(","));
    if (newFilters.categories.length) params.set("categories", newFilters.categories.join(","));
    if (sortBy !== "featured") params.set("sort", sortBy);

    setSearchParams(params, { replace: true });
  }, [sortBy, setSearchParams]);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort);
    setPage(1);

    const params = new URLSearchParams(searchParams);
    if (newSort !== "featured") {
      params.set("sort", newSort);
    } else {
      params.delete("sort");
    }
    params.delete("page");

    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);

    const params = new URLSearchParams(searchParams);
    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }

    setSearchParams(params, { replace: true });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams, setSearchParams]);

  const handleClearFilters = useCallback(() => {
    const emptyFilters: FilterState = {
      sizes: [],
      colors: [],
      fits: [],
      messageTypes: [],
      priceRanges: [],
      categories: [],
    };
    handleFilterChange(emptyFilters);
  }, [handleFilterChange]);

  return (
    <Layout>
      <CollectionHero 
        category={category || "Shop"} 
        productCount={totalCount}
      />
      
      <div className="pt-6 md:pt-8 pb-safe bg-background">
        <FilterSortBar 
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          itemCount={totalCount}
          filters={filters}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          isSticky={isFilterSticky}
        />
        
        <ProductGrid 
          categorySlug={category}
          filters={filters}
          sortBy={sortBy}
          page={page}
          pageSize={12}
          onTotalCountChange={setTotalCount}
          onClearFilters={handleClearFilters}
        />
      </div>
    </Layout>
  );
};

export default Category;
