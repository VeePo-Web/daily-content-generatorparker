import { ChevronDown, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useSavedForLater } from "@/hooks/useSavedForLater";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import SavedItem from "./SavedItem";
import { cn } from "@/lib/utils";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";

interface SavedForLaterShelfProps {
  defaultOpen?: boolean;
}

const SavedForLaterShelf = ({ defaultOpen = false }: SavedForLaterShelfProps) => {
  const { savedItems, savedCount, totalSavedValue, waitingMessage, moveToCart, removeFromSaved, moveAllToCart, isLoading } = useSavedForLater();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const prefersReducedMotion = useReducedMotion();
  
  // Button state machine: 'idle' | 'adding' | 'success'
  const [buttonState, setButtonState] = useState<'idle' | 'adding' | 'success'>('idle');

  const handleMoveAllToCart = () => {
    if (buttonState !== 'idle' || savedCount === 0) return;
    
    setButtonState('adding');
    
    // Execute the move
    moveAllToCart();
    
    // Transition to success after brief loading
    setTimeout(() => {
      setButtonState('success');
      
      // Haptic feedback for success (3-pulse pattern)
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10, 50, 10]);
      }
      
      // Reset after success display (shelf will collapse anyway)
      setTimeout(() => {
        setButtonState('idle');
      }, 1500);
    }, prefersReducedMotion ? 0 : 300);
  };

  // Don't render if no saved items
  if (savedCount === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="border-t border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors group"
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-foreground">
                Saved for Later
              </span>
              {savedCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({savedCount})
                </span>
              )}
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-6 pb-4"
          >
            {/* Waiting message */}
            {waitingMessage && (
              <p className="text-xs text-muted-foreground mb-3 italic">
                {waitingMessage}
              </p>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
              </div>
            )}

            {/* Saved items list */}
            {!isLoading && (
              <AnimatePresence mode="popLayout">
                <div className="divide-y divide-border/50">
                  {savedItems.map((item) => (
                    <SavedItem
                      key={item.id}
                      item={item}
                      onMoveToCart={() => moveToCart(item)}
                      onRemove={() => removeFromSaved(item.productId)}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}

            {/* Add all to bag button - shows for 1+ items */}
            {!isLoading && savedCount >= 1 && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full rounded-none text-xs uppercase tracking-[0.15em] transition-all duration-200",
                    buttonState === 'success'
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-foreground hover:bg-foreground hover:text-background"
                  )}
                  onClick={handleMoveAllToCart}
                  disabled={buttonState !== 'idle'}
                >
                  <AnimatePresence mode="wait">
                    {buttonState === 'adding' ? (
                      <motion.span
                        key="adding"
                        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </motion.span>
                    ) : buttonState === 'success' ? (
                      <motion.span
                        key="success"
                        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <DrawCheckIcon size="xs" delay={0} duration={300} />
                        Added!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="default"
                        initial={prefersReducedMotion ? {} : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={prefersReducedMotion ? {} : { opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {savedCount === 1 ? 'Add to Bag' : 'Add All to Bag'} • ${totalSavedValue.toFixed(2)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SavedForLaterShelf;
