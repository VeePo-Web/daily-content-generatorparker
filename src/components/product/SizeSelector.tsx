import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ruler } from "lucide-react";
import { useSizeMemory } from "@/hooks/useSizeMemory";
import { useToast } from "@/hooks/use-toast";

interface SizeOption {
  size: string;
  stock: number;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedSize: string | null;
  onSizeChange: (size: string) => void;
  categorySlug?: string;
  autoSelectRemembered?: boolean;
}

const SizeSelector = ({ 
  sizes, 
  selectedSize, 
  onSizeChange,
  categorySlug,
  autoSelectRemembered = true
}: SizeSelectorProps) => {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const { getRememberedSize, rememberSize, getSizeConfidence } = useSizeMemory();
  const { toast } = useToast();
  
  // Get confidence for category
  const confidenceForCategory = categorySlug ? getSizeConfidence(categorySlug) : null;

  const rememberedSize = categorySlug ? getRememberedSize(categorySlug) : null;

  // Auto-select remembered size on mount
  useEffect(() => {
    if (!autoSelectRemembered || !categorySlug || hasAutoSelected) return;
    
    if (rememberedSize && !selectedSize) {
      const matchingSize = sizes.find(s => s.size === rememberedSize && s.stock > 0);
      if (matchingSize) {
        onSizeChange(rememberedSize);
        setHasAutoSelected(true);
      }
    }
  }, [categorySlug, sizes, autoSelectRemembered, rememberedSize, selectedSize, onSizeChange, hasAutoSelected]);

  const getSizeState = (stock: number) => {
    if (stock === 0) return "oos";
    if (stock <= 3) return "low";
    return "available";
  };

  const handleSizeChange = (size: string) => {
    onSizeChange(size);
    
    // Remember this size for the category
    if (categorySlug) {
      const isFirstTimeForCategory = !rememberedSize;
      rememberSize(categorySlug, size);
      
      // Show confirmation toast only on first save
      if (isFirstTimeForCategory) {
        toast({
          title: "Size remembered",
          description: `We'll remember ${size} for this category`,
        });
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-light text-foreground">Size</span>
        <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
          <DialogTrigger asChild>
            <button className="text-xs font-light text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              Size Guide
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-light">Size Guide</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <p className="text-sm font-light text-muted-foreground">
                Measurements are in inches. For the best fit, measure your chest at the fullest point.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-light">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 text-left font-light">Size</th>
                      <th className="py-2 text-center font-light">Chest</th>
                      <th className="py-2 text-center font-light">Length</th>
                      <th className="py-2 text-center font-light">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2">XS</td>
                      <td className="py-2 text-center">34-36</td>
                      <td className="py-2 text-center">27</td>
                      <td className="py-2 text-center">8</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">S</td>
                      <td className="py-2 text-center">36-38</td>
                      <td className="py-2 text-center">28</td>
                      <td className="py-2 text-center">8.25</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">M</td>
                      <td className="py-2 text-center">38-40</td>
                      <td className="py-2 text-center">29</td>
                      <td className="py-2 text-center">8.5</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">L</td>
                      <td className="py-2 text-center">40-42</td>
                      <td className="py-2 text-center">30</td>
                      <td className="py-2 text-center">8.75</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">XL</td>
                      <td className="py-2 text-center">42-44</td>
                      <td className="py-2 text-center">31</td>
                      <td className="py-2 text-center">9</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">2XL</td>
                      <td className="py-2 text-center">44-46</td>
                      <td className="py-2 text-center">32</td>
                      <td className="py-2 text-center">9.25</td>
                    </tr>
                    <tr>
                      <td className="py-2">3XL</td>
                      <td className="py-2 text-center">46-48</td>
                      <td className="py-2 text-center">33</td>
                      <td className="py-2 text-center">9.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs font-light text-muted-foreground">
                Need help? Contact us for personalized sizing advice.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3 md:gap-2">
        {sizes.map(({ size, stock }) => {
          const state = getSizeState(stock);
          const isSelected = selectedSize === size;
          const isDisabled = state === "oos";
          const isRemembered = rememberedSize === size && !isSelected;

          return (
            <button
              key={size}
              onClick={() => !isDisabled && handleSizeChange(size)}
              disabled={isDisabled}
              className={`
                relative min-w-[44px] h-11 px-3 text-sm font-light border transition-all duration-200
                ${isSelected 
                  ? "bg-foreground text-background border-foreground" 
                  : isDisabled
                    ? "bg-muted/30 text-muted-foreground/40 border-border/50 cursor-not-allowed line-through"
                    : isRemembered
                      ? "bg-champagne-500/10 text-foreground border-champagne-500/50 hover:border-champagne-500"
                      : "bg-background text-foreground border-border hover:border-foreground"
                }
              `}
              aria-label={`Size ${size}${isDisabled ? " - Out of stock" : state === "low" ? ` - Only ${stock} left` : ""}${isRemembered ? " - Your usual size" : ""}`}
            >
              {size}
              
              {/* "Your size" badge for remembered size */}
              {isRemembered && stock > 0 && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <span className="text-[8px] uppercase tracking-wider bg-champagne-500 text-white px-1.5 py-0.5 
                                   rounded-full whitespace-nowrap font-medium">
                    Your size
                  </span>
                  {/* Confidence indicator */}
                  {confidenceForCategory && confidenceForCategory >= 50 && (
                    <span className="text-[7px] text-muted-foreground mt-0.5 whitespace-nowrap">
                      {Math.round(confidenceForCategory)}% fit
                    </span>
                  )}
                </div>
              )}
              
              {/* Low stock indicator */}
              {state === "low" && !isSelected && !isRemembered && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-champagne-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {selectedSize && sizes.find(s => s.size === selectedSize)?.stock! <= 3 && sizes.find(s => s.size === selectedSize)?.stock! > 0 && (
        <p className="text-xs font-light text-champagne-600">
          Only {sizes.find(s => s.size === selectedSize)?.stock} left in this size
        </p>
      )}
    </div>
  );
};

export default SizeSelector;
