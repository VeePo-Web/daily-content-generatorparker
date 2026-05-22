import { toast } from 'sonner';
import AddedToCartToast from '@/components/cart/AddedToCartToast';

interface ShowAddedToastOptions {
  productName: string;
  productImage: string;
  size?: string;
  color?: string;
  duration?: number;
  onViewCart?: () => void;
}

/**
 * Shows a premium "Just Added" toast with product thumbnail.
 * Uses Sonner's custom toast API for full control over the layout.
 */
export function showAddedToast({
  productName,
  productImage,
  size,
  color,
  duration = 2500,
  onViewCart,
}: ShowAddedToastOptions): string | number {
  return toast.custom(
    (t) => (
      <AddedToCartToast
        productName={productName}
        productImage={productImage}
        size={size}
        color={color}
        toastId={t}
        onViewCart={onViewCart}
      />
    ),
    {
      duration,
      position: 'bottom-center',
    }
  );
}
