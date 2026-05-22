import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface StoryFiltersProps {
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedGender: string;
  setSelectedGender: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

const storyTypes = [
  { value: "all", label: "All" },
  { value: "product_review", label: "Reviews" },
  { value: "testimony", label: "Testimonies" },
  { value: "transformation", label: "Transformations" },
];

const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "featured", label: "Featured" },
];

export default function StoryFilters({
  selectedProduct,
  setSelectedProduct,
  selectedType,
  setSelectedType,
  selectedGender,
  setSelectedGender,
  sortBy,
  setSortBy,
}: StoryFiltersProps) {
  const { data: categories } = useQuery({
    queryKey: ["categories-for-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const hasActiveFilters =
    selectedProduct !== "all" ||
    selectedType !== "all" ||
    selectedGender !== "all";

  const clearFilters = () => {
    setSelectedProduct("all");
    setSelectedType("all");
    setSelectedGender("all");
    setSortBy("recent");
  };

  return (
    <div className="sticky top-[var(--header-height)] z-30 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Desktop: Magazine-style navigation */}
        <div className="hidden md:flex items-center justify-between py-3">
          {/* Story Type Tabs - Editorial text navigation */}
          <div className="flex items-center gap-8">
            {storyTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className="relative group"
              >
                <span 
                  className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors ${
                    selectedType === type.value 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type.label}
                </span>
                {/* Underline indicator */}
                {selectedType === type.value && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute -bottom-3 left-0 right-0 h-[2px] bg-champagne-500"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Right side: Product filter + Sort */}
          <div className="flex items-center gap-6">
            {/* Product Filter */}
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-[160px] bg-transparent border-0 shadow-none text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground focus:ring-0">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs uppercase tracking-wider">
                  All Products
                </SelectItem>
                {categories?.map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.slug}
                    className="text-xs uppercase tracking-wider"
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Divider */}
            <div className="w-px h-4 bg-border" />

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px] bg-transparent border-0 shadow-none text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground focus:ring-0">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-xs uppercase tracking-wider"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
