import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTryOnState } from '@/hooks/useTryOnState';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AnimatedPrice } from './AnimatedPrice';
import { ShoppingBag, ChevronUp, Crown, Shirt, Footprints, CreditCard, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SaveLookModal } from './SaveLookModal';
import { motion, AnimatePresence } from 'framer-motion';

// Custom pants icon
const PantsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v4l-3 14h-4l-1-10-1 10H7L4 8V4z" />
  </svg>
);

const slots = [
  { id: 'head' as const, icon: <Crown className="w-5 h-5" /> },
  { id: 'top' as const, icon: <Shirt className="w-5 h-5" /> },
  { id: 'outerwear' as const, icon: <Shirt className="w-5 h-5" /> },
  { id: 'bottom' as const, icon: <PantsIcon /> },
  { id: 'footwear' as const, icon: <Footprints className="w-5 h-5" /> },
];

interface MobileTryOnBarProps {
  onOpenSlot: (slot: string) => void;
}

export const MobileTryOnBar = ({ onOpenSlot }: MobileTryOnBarProps) => {
  const navigate = useNavigate();
  const { equippedItems, getTotalPrice, getEquippedCount, clearAllItems } = useTryOnState();
  const { addItem, openCart } = useCart();
  const [showSummary, setShowSummary] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const totalPrice = Number(getTotalPrice());
  const itemCount = getEquippedCount();

  const addAllItemsToCart = () => {
    Object.entries(equippedItems).forEach(([slot, item]) => {
      if (item) {
        addItem({
          id: item.productId.charCodeAt(0) + Date.now() + Math.random(),
          name: item.name,
          price: Number(item.price),
          priceFormatted: `$${Number(item.price).toLocaleString()}`,
          image: item.imageUrl || '/placeholder.svg',
          category: slot,
          size: item.size,
          color: item.color,
        });
      }
    });
  };

  const handleAddAllToCart = () => {
    addAllItemsToCart();
    toast.success(`${itemCount} items added to bag!`);
    openCart();
    setShowSummary(false);
  };

  const handleBuyThisLook = () => {
    addAllItemsToCart();
    toast.success('Proceeding to checkout...');
    setShowSummary(false);
    navigate('/checkout');
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden pb-safe">
        {/* Slot Quick Access */}
        <div className="flex items-center justify-around py-3 px-4 border-b border-border">
          {slots.map(({ id, icon }) => {
            const isEquipped = !!equippedItems[id];
            return (
              <motion.button
                key={id}
                onClick={() => onOpenSlot(id)}
                className={cn(
                  "w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full border-2 transition-all",
                  isEquipped
                    ? "border-foreground bg-foreground text-background"
                    : "border-border border-dashed text-muted-foreground hover:border-foreground"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isEquipped ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.2 }}
                aria-label={`${id} slot${isEquipped ? ` - ${equippedItems[id]?.name}` : ' - empty'}`}
              >
                {icon}
              </motion.button>
            );
          })}
        </div>

        {/* Summary Bar */}
        <div className="flex items-center justify-between p-4 min-h-[64px]">
          <Sheet open={showSummary} onOpenChange={setShowSummary}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 text-sm min-h-[44px] px-2">
                <ShoppingBag className="w-4 h-4" />
                <span>{itemCount} items</span>
                <motion.div
                  animate={{ rotate: showSummary ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronUp className="w-4 h-4" />
                </motion.div>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh]">
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-light">Your Outfit</h3>
                  <button 
                    onClick={() => {
                      clearAllItems();
                      setShowSummary(false);
                    }}
                    className="text-xs text-muted-foreground"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-3 max-h-[30vh] overflow-y-auto">
                  {Object.entries(equippedItems).map(([slot, item]) => {
                    if (!item) return null;
                    return (
                      <div key={slot} className="flex items-center gap-3 p-3 bg-muted rounded">
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-12 h-12 object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-light">{item.name}</div>
                          <div className="text-xs text-muted-foreground">Size {item.size}</div>
                        </div>
                        <div className="text-sm font-medium">${item.price.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between py-3 border-t border-border">
                  <span className="text-sm font-light">Total</span>
                  <AnimatedPrice value={totalPrice} className="text-lg font-medium" />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    onClick={handleBuyThisLook}
                    disabled={itemCount === 0}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <CreditCard className="w-4 h-4" />
                    Buy This Look
                  </Button>
                  <Button 
                    onClick={handleAddAllToCart}
                    disabled={itemCount === 0}
                    variant="outline"
                    className="w-full gap-2"
                    size="lg"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add All to Bag
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSummary(false);
                      setSaveModalOpen(true);
                    }}
                    disabled={itemCount === 0}
                    variant="ghost"
                    className="w-full gap-2"
                    size="sm"
                  >
                    <Bookmark className="w-4 h-4" />
                    Save & Share Look
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-4">
            <AnimatedPrice value={totalPrice} className="text-lg font-medium" />
            <Button 
              onClick={handleBuyThisLook}
              disabled={itemCount === 0}
              size="default"
              className="gap-2 min-h-[44px] min-w-[100px]"
            >
              <CreditCard className="w-4 h-4" />
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      <SaveLookModal 
        open={saveModalOpen} 
        onOpenChange={setSaveModalOpen} 
      />
    </>
  );
};
