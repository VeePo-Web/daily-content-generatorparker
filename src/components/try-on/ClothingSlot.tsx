import { useTryOnState, EquippedItem } from '@/hooks/useTryOnState';
import { cn } from '@/lib/utils';
import { Plus, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClothingSlotProps {
  slot: 'head' | 'top' | 'outerwear' | 'bottom' | 'footwear';
  label: string;
  icon: React.ReactNode;
  onOpenDrawer: () => void;
}

export const ClothingSlot = ({ slot, label, icon, onOpenDrawer }: ClothingSlotProps) => {
  const { equippedItems, unequipItem, activeSlot, setActiveSlot } = useTryOnState();
  const equippedItem = equippedItems[slot];
  const isActive = activeSlot === slot;

  const handleClick = () => {
    setActiveSlot(slot);
    onOpenDrawer();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    unequipItem(slot);
  };

  return (
    <motion.div
      layout
      onClick={handleClick}
      className={cn(
        "group relative flex items-center gap-3 p-3 border cursor-pointer transition-all duration-200",
        isActive
          ? "border-foreground bg-muted"
          : "border-border hover:border-foreground hover:bg-muted/50",
        equippedItem && "bg-muted/30"
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Icon */}
      <motion.div 
        className={cn(
          "flex-shrink-0 w-10 h-10 flex items-center justify-center border transition-colors duration-200",
          equippedItem ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"
        )}
        animate={equippedItem ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
          {label}
        </div>
        <AnimatePresence mode="wait">
          {equippedItem ? (
            <motion.div 
              key="equipped"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center justify-between"
            >
              <div className="truncate text-sm font-light">{equippedItem.name}</div>
              <div className="text-sm font-medium ml-2">${equippedItem.price.toLocaleString()}</div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground font-light flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add item
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Remove button or chevron */}
      <AnimatePresence mode="wait">
        {equippedItem ? (
          <motion.button
            key="remove"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleRemove}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remove item"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.div
            key="chevron"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ChevronRight className="flex-shrink-0 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
