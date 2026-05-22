import { useState, useEffect, useCallback, useMemo } from "react";
import { useCart } from "./useCart";
import { useBundleDiscounts } from "./useBundleDiscounts";
import { supabase } from "@/integrations/supabase/client";

interface PaymentIntentResult {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  orderId?: string;
  total?: number;
  configured?: boolean;
  message?: string;
  error?: string;
}

interface UseExpressPayReturn {
  // State
  isStripeConfigured: boolean;
  canMakePayment: boolean | null;
  isLoading: boolean;
  error: string | null;
  
  // Computed
  expressPayAvailable: boolean;
  total: number; // in cents
  
  // Actions
  createPaymentIntent: (customerEmail: string) => Promise<PaymentIntentResult | null>;
  handlePaymentSuccess: (paymentIntentId: string) => Promise<void>;
  clearError: () => void;
}

// Check if Stripe publishable key is configured
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const useExpressPay = (): UseExpressPayReturn => {
  const { items, subtotal, clearCart, hasFreeShipping } = useCart();
  const { bundleDataForCheckout, totalBundleSavings } = useBundleDiscounts();
  
  const [canMakePayment, setCanMakePayment] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethodsChecked, setPaymentMethodsChecked] = useState(false);

  // Check if Stripe is configured on frontend
  const isStripeConfigured = Boolean(STRIPE_PUBLISHABLE_KEY);

  // Calculate total in cents
  const shippingCents = hasFreeShipping ? 0 : 1000;
  const bundleSavingsCents = Math.round(totalBundleSavings * 100);
  const subtotalCents = Math.round(subtotal * 100);
  const total = Math.max(subtotalCents - bundleSavingsCents + shippingCents, 50);

  // Check if device supports Apple Pay / Google Pay
  useEffect(() => {
    if (!isStripeConfigured || paymentMethodsChecked) return;
    
    const checkPaymentMethods = async () => {
      try {
        // Dynamic import to avoid loading Stripe if not configured
        const { loadStripe } = await import("@stripe/stripe-js");
        const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
        
        if (!stripe) {
          setCanMakePayment(false);
          setPaymentMethodsChecked(true);
          return;
        }

        // Create a payment request to check availability
        const paymentRequest = stripe.paymentRequest({
          country: "CA",
          currency: "cad",
          total: {
            label: "Total",
            amount: 100, // Dummy amount for check
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        const result = await paymentRequest.canMakePayment();
        setCanMakePayment(result !== null);
        setPaymentMethodsChecked(true);
      } catch (err) {
        console.error("Error checking payment methods:", err);
        setCanMakePayment(false);
        setPaymentMethodsChecked(true);
      }
    };

    checkPaymentMethods();
  }, [isStripeConfigured, paymentMethodsChecked]);

  // Express pay is available if Stripe is configured and device supports it
  const expressPayAvailable = useMemo(() => {
    return isStripeConfigured && canMakePayment === true && items.length > 0;
  }, [isStripeConfigured, canMakePayment, items.length]);

  // Create payment intent via edge function
  const createPaymentIntent = useCallback(
    async (customerEmail: string): Promise<PaymentIntentResult | null> => {
      if (!isStripeConfigured || items.length === 0) {
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Transform cart items
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
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              items: checkoutItems,
              customerEmail,
              bundleDiscounts: bundleDataForCheckout,
            }),
          }
        );

        const result: PaymentIntentResult = await response.json();

        if (!response.ok || !result.success) {
          if (result.configured === false) {
            setError(result.message || "Payment processing is not configured");
          } else {
            setError(result.error || "Failed to create payment intent");
          }
          return result;
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [items, bundleDataForCheckout, isStripeConfigured]
  );

  // Handle successful payment
  const handlePaymentSuccess = useCallback(
    async (paymentIntentId: string) => {
      try {
        // Clear cart and redirect to success page
        clearCart();
        window.location.href = `/checkout/success?payment_intent=${paymentIntentId}`;
      } catch (err) {
        console.error("Error handling payment success:", err);
      }
    },
    [clearCart]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isStripeConfigured,
    canMakePayment,
    isLoading,
    error,
    expressPayAvailable,
    total,
    createPaymentIntent,
    handlePaymentSuccess,
    clearError,
  };
};
