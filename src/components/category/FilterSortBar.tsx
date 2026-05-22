import { useState, useMemo } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FilterState {
  sizes: string[];
  colors: string[];
  fits: string[];
  messageTypes: string[];
  priceRanges: string[];
  categories: string[];
}

export type SortOption = "featured" | "newest" | "price-low" | "price-high" | "best-selling";

interface FilterSortBarProps {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  itemCount: number;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  isSticky?: boolean;
}

// Apparel-focused filter options
const filterOptions = {
  sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
  colors: ["Black", "White", "Navy", "Gray", "Natural", "Gold"],
  fits: ["Regular", "Relaxed", "Slim", "Oversized"],
  messageTypes: ["Scripture", "Inspirational", "Symbolic", "Bold Statement"],
  priceRanges: ["Under $30", "$30 - $50", "$50 - $75", "$75 - $100", "Over $100"],
  categories: ["T-Shirts", "Hoodies", "Sweatshirts", "Accessories", "Hats"],
};

const FilterSortBar = ({
  filtersOpen,
  setFiltersOpen,
  itemCount,
  filters,
  onFilterChange,
  sortBy,
  onSortChange,
  isSticky = false,
}: FilterSortBarProps) => {
  // Count active filters
  const activeFilterCount = useMemo(() => {
    return (
      filters.sizes.length +
      filters.colors.length +
      filters.fits.length +
      filters.messageTypes.length +
      filters.priceRanges.length +
      filters.categories.length
    );
  }, [filters]);

  // Get all active filter labels for chips
  const activeFilterLabels = useMemo(() => {
    const labels: { key: keyof FilterState; value: string }[] = [];
    (Object.keys(filters) as (keyof FilterState)[]).forEach((key) => {
      filters[key].forEach((value) => {
        labels.push({ key, value });
      });
    });
    return labels;
  }, [filters]);

  const toggleFilter = (key: keyof FilterState, value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  const removeFilter = (key: keyof FilterState, value: string) => {
    const updated = filters[key].filter((v) => v !== value);
    onFilterChange({ ...filters, [key]: updated });
  };

  const clearAllFilters = () => {
    onFilterChange({
      sizes: [],
      colors: [],
      fits: [],
      messageTypes: [],
      priceRanges: [],
      categories: [],
    });
  };

  const FilterSection = ({
    title,
    options,
    filterKey,
  }: {
    title: string;
    options: string[];
    filterKey: keyof FilterState;
  }) => (
    <div>
      <h3 className="text-sm font-light mb-4 text-foreground">{title}</h3>
      <div className="space-y-4 md:space-y-3">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-3">
            <Checkbox
              id={`${filterKey}-${option}`}
              checked={filters[filterKey].includes(option)}
              onCheckedChange={() => toggleFilter(filterKey, option)}
              className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground h-5 w-5 md:h-4 md:w-4"
            />
            <Label
              htmlFor={`${filterKey}-${option}`}
              className="text-sm font-light text-foreground cursor-pointer py-1"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Active Filter Chips */}
      {activeFilterLabels.length > 0 && (
        <section className="w-full px-4 md:px-6 mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            {activeFilterLabels.map(({ key, value }) => (
              <Badge
                key={`${key}-${value}`}
                variant="secondary"
                className="px-3 py-2 md:py-1.5 text-xs font-normal bg-muted hover:bg-muted cursor-pointer group min-h-[36px] md:min-h-0 flex items-center"
                onClick={() => removeFilter(key, value)}
              >
                {value}
                <X className="w-3.5 h-3.5 md:w-3 md:h-3 ml-1.5 opacity-50 group-hover:opacity-100" />
              </Badge>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline px-2 py-2 -mx-2 min-h-[44px] inline-flex items-center"
            >
              Clear all
            </button>
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <section 
        className={cn(
          "w-full px-4 md:px-6 mb-6 md:mb-8 border-b border-border pb-4 transition-all duration-200",
          isSticky && "sticky top-[var(--header-height)] z-30 bg-background/95 backdrop-blur-sm shadow-sm pt-4 -mt-4"
        )}
      >
        {/* Accessibility announcement */}
        <div aria-live="polite" className="sr-only">
          {`Showing ${itemCount} products${activeFilterCount > 0 ? ` with ${activeFilterCount} filters applied` : ''}`}
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm font-light text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>

          <div className="flex items-center gap-2 md:gap-4">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-light hover:bg-transparent gap-2 min-h-[44px] px-3 md:px-2"
                >
                  <SlidersHorizontal className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="hidden xs:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-foreground text-background rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 bg-background border-l border-border overflow-y-auto pb-safe"
              >
                <SheetHeader className="mb-6 border-b border-border pb-4">
                  <SheetTitle className="text-lg font-light flex items-center justify-between">
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="text-sm text-muted-foreground font-normal">
                        ({activeFilterCount} active)
                      </span>
                    )}
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-8">
                  <FilterSection
                    title="Category"
                    options={filterOptions.categories}
                    filterKey="categories"
                  />

                  <Separator className="border-border" />

                  <FilterSection
                    title="Size"
                    options={filterOptions.sizes}
                    filterKey="sizes"
                  />

                  <Separator className="border-border" />

                  <FilterSection
                    title="Color"
                    options={filterOptions.colors}
                    filterKey="colors"
                  />

                  <Separator className="border-border" />

                  <FilterSection
                    title="Fit"
                    options={filterOptions.fits}
                    filterKey="fits"
                  />

                  <Separator className="border-border" />

                  <FilterSection
                    title="Message Type"
                    options={filterOptions.messageTypes}
                    filterKey="messageTypes"
                  />

                  <Separator className="border-border" />

                  <FilterSection
                    title="Price"
                    options={filterOptions.priceRanges}
                    filterKey="priceRanges"
                  />

                  <Separator className="border-border" />

                  <div className="flex flex-col gap-2 pt-4 pb-8">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full min-h-[48px] md:min-h-0"
                      onClick={() => setFiltersOpen(false)}
                    >
                      Apply Filters
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full hover:bg-transparent hover:underline font-light min-h-[48px] md:min-h-0"
                      onClick={clearAllFilters}
                      disabled={activeFilterCount === 0}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
              <SelectTrigger className="w-auto border-none bg-transparent text-sm font-light shadow-none rounded-none pr-2 min-h-[44px] py-3 md:py-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="shadow-sm border border-border rounded-sm bg-background">
                <SelectItem
                  value="featured"
                  className="hover:bg-muted data-[state=checked]:bg-muted pl-3 min-h-[44px] md:min-h-0"
                >
                  Featured
                </SelectItem>
                <SelectItem
                  value="newest"
                  className="hover:bg-muted data-[state=checked]:bg-muted pl-3 min-h-[44px] md:min-h-0"
                >
                  New Arrivals
                </SelectItem>
                <SelectItem
                  value="best-selling"
                  className="hover:bg-muted data-[state=checked]:bg-muted pl-3 min-h-[44px] md:min-h-0"
                >
                  Best Selling
                </SelectItem>
                <SelectItem
                  value="price-low"
                  className="hover:bg-muted data-[state=checked]:bg-muted pl-3 min-h-[44px] md:min-h-0"
                >
                  Price: Low to High
                </SelectItem>
                <SelectItem
                  value="price-high"
                  className="hover:bg-muted data-[state=checked]:bg-muted pl-3 min-h-[44px] md:min-h-0"
                >
                  Price: High to Low
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
    </>
  );
};

export default FilterSortBar;
