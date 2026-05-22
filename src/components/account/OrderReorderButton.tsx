import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { productIdToCartId, triggerHapticFeedback, formatPrice } from '@/lib/cartUtils';
import { showAddedToast } from '@/lib/toastUtils';
import { DrawCheckIcon } from '@/components/ui/draw-check-icon';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  product_id?: string | null;
  product_name: string;
  product_image_url?: string | null;
  variant_size?: string | null;
  variant_color?: string | null;
  unit_price_cents: number;
  quantity: number;
}

interface OrderReorderButtonProps {
  /** Single item to reorder */
  item?: OrderItem;
  /** Array of items (for "Reorder All") */
  items?: OrderItem[];
  /** Button variant */
  variant?: 'item' | 'order';
  /** Size of the button */
  size?: 'sm' | 'default';
  /** Optional class name */
  className?: string;
}

type ButtonState = 'idle' | 'adding' | 'success';

export default function OrderReorderButton({
  item,
  items,
  variant = 'item',
  size = 'sm',
  className = '',
}: OrderReorderButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const { addItem, openCart } = useCart();
  const prefersReducedMotion = useReducedMotion();

  const handleReorderItem = useCallback((orderItem: OrderItem) => {
    if (!orderItem.product_id) return false;

    addItem({
      id: productIdToCartId(orderItem.product_id),
      name: orderItem.product_name,
      price: orderItem.unit_price_cents / 100,
      priceFormatted: formatPrice(orderItem.unit_price_cents / 100),
      image: orderItem.product_image_url || '/placeholder.svg',
      category: 'tops', // Default category
      size: orderItem.variant_size || undefined,
      color: orderItem.variant_color || undefined,
      quantity: orderItem.quantity,
      productId: orderItem.product_id,
    });

    return true;
  }, [addItem]);

  const handleClick = useCallback(async () => {
    if (state !== 'idle') return;

    setState('adding');
    triggerHapticFeedback();

    // Small delay for perceived processing
    await new Promise(resolve => setTimeout(resolve, 150));

    if (variant === 'item' && item) {
      const success = handleReorderItem(item);
      
      if (success) {
        setState('success');
        
        showAddedToast({
          productName: item.product_name,
          productImage: item.product_image_url || '/placeholder.svg',
          size: item.variant_size || undefined,
          color: item.variant_color || undefined,
          onViewCart: openCart,
        });

        setTimeout(() => {
          setState('idle');
        }, 2000);

        openCart();
      } else {
        setState('idle');
        toast.error('This item is no longer available');
      }
    } else if (variant === 'order' && items) {
      const validItems = items.filter(i => i.product_id);
      
      if (validItems.length === 0) {
        setState('idle');
        toast.error('No items available to reorder');
        return;
      }

      validItems.forEach(orderItem => {
        handleReorderItem(orderItem);
      });

      setState('success');
      
      const skippedCount = items.length - validItems.length;
      if (skippedCount > 0) {
        toast.success(`${validItems.length} items added to bag (${skippedCount} unavailable)`);
      } else {
        toast.success(`${validItems.length} items added to bag!`);
      }

      triggerHapticFeedback();

      setTimeout(() => {
        setState('idle');
      }, 2000);

      openCart();
    }
  }, [state, variant, item, items, handleReorderItem, openCart]);

  // Determine button content
  const getButtonContent = () => {
    if (state === 'adding') {
      return (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5"
        >
          <Loader2 size={14} className="animate-spin" />
          <span>Adding...</span>
        </motion.span>
      );
    }

    if (state === 'success') {
      return (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5"
        >
          <DrawCheckIcon 
            size="xs" 
            animate={!prefersReducedMotion}
            color="currentColor"
          />
          <span>Added!</span>
        </motion.span>
      );
    }

    if (variant === 'item' && item) {
      const sizeLabel = item.variant_size ? ` (${item.variant_size})` : '';
      return (
        <span className="flex items-center gap-1.5">
          <RotateCcw size={14} />
          <span>Buy Again{sizeLabel}</span>
        </span>
      );
    }

    if (variant === 'order' && items) {
      return (
        <span className="flex items-center gap-1.5">
          <RotateCcw size={14} />
          <span>Reorder All ({items.length})</span>
        </span>
      );
    }

    return 'Buy Again';
  };

  const isDisabled = state !== 'idle' || 
    (variant === 'item' && !item?.product_id) ||
    (variant === 'order' && (!items || items.length === 0));

  return (
    <Button
      variant={state === 'success' ? 'default' : 'outline'}
      size={size}
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        min-h-[36px] transition-all duration-200
        ${state === 'success' ? 'bg-green-600 hover:bg-green-600 border-green-600 text-white' : ''}
        ${className}
      `}
      aria-label={
        variant === 'item' && item
          ? `Buy ${item.product_name} again${item.variant_size ? ` in size ${item.variant_size}` : ''}`
          : `Reorder all ${items?.length || 0} items`
      }
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {getButtonContent()}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
