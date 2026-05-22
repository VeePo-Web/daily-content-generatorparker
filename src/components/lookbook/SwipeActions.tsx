import { motion } from 'framer-motion';
import { X, ShoppingBag, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SwipeActionsProps {
  onSkip: () => void;
  onAdd: () => void;
  onUndo: () => void;
  canUndo: boolean;
  canOneTap: boolean;
  rememberedSize?: string | null;
  disabled?: boolean;
}

export default function SwipeActions({
  onSkip,
  onAdd,
  onUndo,
  canUndo,
  canOneTap,
  rememberedSize,
  disabled = false,
}: SwipeActionsProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };
  
  return (
    <div className="flex items-center justify-center gap-4 xs:gap-6 py-3 md:py-4 pb-safe">
      {/* Undo Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: canUndo ? 1 : 0.3, scale: 1 }}
        transition={springConfig}
        className="flex flex-col items-center gap-1"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo || disabled}
          className="w-12 h-12 rounded-full bg-stone-800/80 hover:bg-stone-700 text-white/70 hover:text-white border border-white/10"
          aria-label="Undo last swipe"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Undo</span>
      </motion.div>
      
      {/* Skip Button */}
      <motion.div
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        transition={springConfig}
        className="flex flex-col items-center gap-1"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onSkip}
          disabled={disabled}
          className="w-16 h-16 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 border-2 border-red-500/50 hover:border-red-400"
          aria-label="Skip this product"
        >
          <X className="w-7 h-7" />
        </Button>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Skip</span>
      </motion.div>
      
      {/* Add Button */}
      <motion.div
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        transition={springConfig}
        className="flex flex-col items-center gap-1"
      >
        <Button
          onClick={onAdd}
          disabled={disabled}
          className={`
            w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center gap-0.5
            ${canOneTap 
              ? 'bg-champagne-500 hover:bg-champagne-400 border-champagne-400 text-white' 
              : 'bg-green-500/20 hover:bg-green-500/40 border-green-500/50 hover:border-green-400 text-green-400 hover:text-green-300'
            }
          `}
          aria-label={canOneTap 
            ? `Add in size ${rememberedSize}` 
            : 'Add - select size'
          }
        >
          <ShoppingBag className="w-6 h-6" />
          {canOneTap && rememberedSize && (
            <span className="text-[10px] md:text-[9px] font-medium uppercase">{rememberedSize}</span>
          )}
        </Button>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Add</span>
      </motion.div>
    </div>
  );
}
