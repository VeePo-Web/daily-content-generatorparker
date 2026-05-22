import { useState, useCallback } from "react";
import { useCart } from "./useCart";
import { useBundleDiscounts } from "./useBundleDiscounts";
import { supabase } from "@/integrations/supabase/client";

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface BundleDiscountClaim {
  bundleRuleId: string;
  lookId: string;
  itemProductIds: string[];
  claimedSavings: number;
}

interface CheckoutData {
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  shippingMethod: "standard" | "express" | "overnight";
  discountCodeId?: string;
  abandonedCartId?: string;
  bundleDiscounts?: BundleDiscountClaim[];
}

interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  orderId?: string;
  sessionId?: string;
  configured?: boolean;
  message?: string;
  error?: string;
}

export const useStripeCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items } = useCart();
  const { bundleDataForCheckout } = useBundleDiscounts();

  const initiateCheckout = useCallback(
    async (data: CheckoutData): Promise<CheckoutResult> => {
      setIsLoading(true);
      setError(null);

      try {
        // Transform cart items to checkout format
        const checkoutItems = items.map((item) => ({
          productId: item.productId || item.id?.toString() || "",
          variantId: undefined,
          name: item.name,
          image: item.image.startsWith("http") 
            ? item.image 
            : `${window.location.origin}${item.image}`,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }));

        // Get auth token if available
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              items: checkoutItems,
              ...data,
              // Include bundle discounts for server-side validation
              bundleDiscounts: bundleDataForCheckout,
            }),
          }
        );

        const result: CheckoutResult = await response.json();

        if (!response.ok || !result.success) {
          // Handle Stripe not configured
          if (result.configured === false) {
            setError(result.message || "Payment processing is not configured");
            return result;
          }
          
          const errorMessage = result.error || "Checkout failed";
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }

        // Redirect to Stripe Checkout
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [items, bundleDataForCheckout]
  );

  const checkStripeConfigured = useCallback(async (): Promise<boolean> => {
    try {
      // We can't check directly, but we can try a minimal request
      // For now, assume it's configured and handle errors gracefully
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    initiateCheckout,
    checkStripeConfigured,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
