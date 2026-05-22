import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "./useCart";

const ABANDONED_CART_EMAIL_KEY = 'loj-abandoned-cart-email';
const ABANDONED_CART_ID_KEY = 'loj-abandoned-cart-id';

interface AbandonedCartState {
  email: string | null;
  cartId: string | null;
  isSyncing: boolean;
  isSynced: boolean;
  error: string | null;
}

export const useAbandonedCart = () => {
  const [state, setState] = useState<AbandonedCartState>({
    email: null,
    cartId: null,
    isSyncing: false,
    isSynced: false,
    error: null,
  });

  // Load email and cart ID from localStorage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem(ABANDONED_CART_EMAIL_KEY);
    const storedCartId = localStorage.getItem(ABANDONED_CART_ID_KEY);
    if (storedEmail || storedCartId) {
      setState(prev => ({
        ...prev,
        email: storedEmail,
        cartId: storedCartId,
      }));
    }
  }, []);

  // Sync cart to database
  const syncCart = useCallback(async (
    email: string,
    items: CartItem[],
    total: number
  ): Promise<{ success: boolean; cartId?: string; error?: string }> => {
    if (!email || items.length === 0) {
      return { success: false, error: "Email and items required" };
    }

    setState(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-abandoned-cart`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            email,
            cartItems: items.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              priceFormatted: item.priceFormatted,
              image: item.image,
              quantity: item.quantity,
              category: item.category,
              size: item.size,
              color: item.color,
            })),
            cartTotal: total,
            existingCartId: state.cartId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync cart');
      }

      // Store email and cart ID in localStorage
      localStorage.setItem(ABANDONED_CART_EMAIL_KEY, email);
      localStorage.setItem(ABANDONED_CART_ID_KEY, data.cartId);

      setState(prev => ({
        ...prev,
        email,
        cartId: data.cartId,
        isSyncing: false,
        isSynced: true,
      }));

      return { success: true, cartId: data.cartId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [state.cartId]);

  // Mark cart as converted (order completed)
  const markConverted = useCallback(async (): Promise<boolean> => {
    if (!state.cartId) return false;

    try {
      const { error } = await supabase
        .from('abandoned_carts')
        .update({
          status: 'converted',
          converted_at: new Date().toISOString(),
        })
        .eq('id', state.cartId);

      if (error) throw error;

      // Clear localStorage
      localStorage.removeItem(ABANDONED_CART_EMAIL_KEY);
      localStorage.removeItem(ABANDONED_CART_ID_KEY);

      setState(prev => ({
        ...prev,
        email: null,
        cartId: null,
        isSynced: false,
      }));

      return true;
    } catch (error) {
      console.error('Failed to mark cart as converted:', error);
      return false;
    }
  }, [state.cartId]);

  // Clear abandoned cart data
  const clearAbandonedCart = useCallback(() => {
    localStorage.removeItem(ABANDONED_CART_EMAIL_KEY);
    localStorage.removeItem(ABANDONED_CART_ID_KEY);
    setState({
      email: null,
      cartId: null,
      isSyncing: false,
      isSynced: false,
      error: null,
    });
  }, []);

  return {
    email: state.email,
    cartId: state.cartId,
    isSyncing: state.isSyncing,
    isSynced: state.isSynced,
    error: state.error,
    syncCart,
    markConverted,
    clearAbandonedCart,
  };
};
