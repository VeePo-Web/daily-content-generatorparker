import { ReactNode, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

interface StripeProviderProps {
  children: ReactNode;
}

// Get publishable key from environment
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

/**
 * StripeProvider wraps children with Stripe Elements context
 * 
 * Graceful degradation:
 * - If VITE_STRIPE_PUBLISHABLE_KEY is not set, children render without Stripe context
 * - Components using Stripe hooks should check for availability
 */
export const StripeProvider = ({ children }: StripeProviderProps) => {
  // Memoize Stripe promise to prevent reloading
  const stripePromise = useMemo(() => {
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.info("Stripe publishable key not configured. Express checkout disabled.");
      return null;
    }
    return loadStripe(STRIPE_PUBLISHABLE_KEY);
  }, []);

  // If Stripe is not configured, render children without Elements wrapper
  if (!stripePromise) {
    return <>{children}</>;
  }

  // Stripe Elements options
  const options = {
    // We don't have a client secret yet, so use mode for deferred setup
    mode: "payment" as const,
    amount: 100, // Minimum amount, will be updated when creating PaymentIntent
    currency: "eur",
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#000000",
        colorBackground: "#ffffff",
        colorText: "#000000",
        colorDanger: "#ef4444",
        fontFamily: "'Inter', system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "0px",
      },
      rules: {
        ".Input": {
          border: "1px solid #e5e7eb",
          boxShadow: "none",
        },
        ".Input:focus": {
          border: "1px solid #000000",
          boxShadow: "none",
        },
        ".Label": {
          fontWeight: "400",
          fontSize: "14px",
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

/**
 * Hook to check if Stripe is available in the current context
 */
export const useStripeAvailable = (): boolean => {
  return Boolean(STRIPE_PUBLISHABLE_KEY);
};

export default StripeProvider;
