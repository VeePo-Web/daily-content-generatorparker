import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { useQuickAdd, ProductForQuickAdd } from "@/hooks/useQuickAdd";
import { cn } from "@/lib/utils";

interface SearchQuickAddProps {
  product: ProductForQuickAdd & { image_url: string };
  onNavigate: () => void;
}

const SearchQuickAdd = ({ product, onNavigate }: SearchQuickAddProps) => {
  const quickAdd = useQuickAdd(product);
  
  const displayPrice = product.is_on_sale && product.sale_price 
    ? product.sale_price 
    : product.price;

  return (
    <motion.div
      className="flex items-center gap-4 group"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.15 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex items-center gap-4 flex-1"
        onClick={onNavigate}
      >
        <div className="w-16 h-16 bg-muted overflow-hidden">
          <motion.img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div>
          <p className="text-sm font-normal text-foreground group-hover:underline">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              ${displayPrice.toLocaleString()}
            </span>
            {quickAdd.canOneTap && (
              <span className="text-[10px] text-champagne-600 font-medium px-1.5 py-0.5 bg-champagne-500/10 rounded-sm">
                Your size: {quickAdd.rememberedSize}
              </span>
            )}
          </div>
        </div>
      </Link>
      
      {/* Quick Add Button */}
      <motion.button
        onClick={(e) => quickAdd.handleQuickAdd(e)}
        disabled={quickAdd.isAdding || quickAdd.isAdded}
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all",
          "border border-border hover:border-foreground hover:bg-foreground hover:text-background",
          quickAdd.isAdded && "bg-foreground border-foreground text-background"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={quickAdd.canOneTap ? `Quick add in ${quickAdd.rememberedSize}` : "Add to bag"}
      >
        {quickAdd.isAdded ? (
          <Check className="w-4 h-4" />
        ) : quickAdd.isAdding ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </motion.button>
    </motion.div>
  );
};

export default SearchQuickAdd;
