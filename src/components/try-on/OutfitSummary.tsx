import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTryOnState } from '@/hooks/useTryOnState';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { AnimatedPrice } from './AnimatedPrice';
import { ShoppingBag, CreditCard, Bookmark, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { SaveLookModal } from './SaveLookModal';
import { motion, AnimatePresence } from 'framer-motion';

export const OutfitSummary = () => {
  const navigate = useNavigate();
  const { equippedItems, getTotalPrice, getEquippedCount, clearAllItems } = useTryOnState();
  const { addItem, openCart } = useCart();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  
  const totalPrice = Number(getTotalPrice());
  const itemCount = getEquippedCount();
  const items = Object.entries(equippedItems).filter(([_, item]) => item !== null);

  const addAllItemsToCart = () => {
    items.forEach(([slot, item]) => {
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
  };

  const handleBuyThisLook = () => {
    addAllItemsToCart();
    toast.success('Proceeding to checkout...');
    navigate('/checkout');
  };

  if (itemCount === 0) {
    return (
      <div className="p-4 border border-dashed border-border text-center">
        <div className="text-muted-foreground text-sm font-light">
          Select items to build your outfit
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border border-border">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Your Outfit ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </div>
          <button 
            onClick={clearAllItems}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear all
          </button>
        </div>

        {/* Items List */}
        <div className="divide-y divide-border">
          <AnimatePresence mode="popLayout">
            {items.map(([slot, item]) => (
              <motion.div 
                key={slot}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="p-3 flex items-center gap-3"
              >
                {item?.imageUrl && (
                  <div className="w-12 h-12 bg-muted overflow-hidden flex-shrink-0">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-light truncate">{item?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Size {item?.size}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  ${item?.price.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Total + CTAs */}
        <div className="p-4 bg-muted/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-light">Total</span>
            <AnimatedPrice value={totalPrice} className="text-lg font-medium" />
          </div>
          
          {/* Primary CTAs */}
          <div className="space-y-2">
            <Button
              onClick={handleBuyThisLook}
              className="w-full gap-2"
              size="lg"
            >
              <CreditCard className="w-4 h-4" />
              Buy This Look
            </Button>
            
            <Button
              onClick={handleAddAllToCart}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <ShoppingBag className="w-4 h-4" />
              Add All to Bag
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setSaveModalOpen(true)}
              variant="ghost"
              size="sm"
              className="flex-1 gap-2 text-xs"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Look
            </Button>
            <Button
              onClick={() => setSaveModalOpen(true)}
              variant="ghost"
              size="sm"
              className="flex-1 gap-2 text-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
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
