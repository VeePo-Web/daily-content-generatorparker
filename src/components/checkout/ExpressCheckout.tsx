import { useState, useCallback } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import type { PaymentRequestPaymentMethodEvent } from "@stripe/stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useExpressPay } from "@/hooks/useExpressPay";
import { useCart } from "@/hooks/useCart";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useStripeAvailable } from "./StripeProvider";
import ExpressPayButton from "./ExpressPayButton";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpressCheckoutProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  variant?: "cart" | "checkout";
  className?: string;
}

/**
 * ExpressCheckout component renders Apple Pay / Google Pay buttons
 * with graceful degradation when Stripe is not configured.
 * 
 * Variants:
 * - cart: Compact layout for cart drawer
 * - checkout: Prominent layout for checkout page
 */
export const ExpressCheckout = ({
  onSuccess,
  onError,
  variant = "cart",
  className = "",
}: ExpressCheckoutProps) => {
  // CRITICAL: Check Stripe availability BEFORE calling any Stripe hooks
  const isStripeAvailable = useStripeAvailable();
  
  // Early return if Stripe is not configured - MUST be before useStripe/useElements
  if (!isStripeAvailable) {
    // Show subtle dev message only in development
    if (import.meta.env.DEV) {
      return (
        <div className={`text-center py-2 ${className}`}>
          <p className="text-xs text-muted-foreground/50">
            [DEV] Add VITE_STRIPE_PUBLISHABLE_KEY to enable Express Checkout
          </p>
        </div>
      );
    }
    return null;
  }
  
  // Now safe to render the inner component that uses Stripe hooks
  return (
    <ExpressCheckoutInner
      onSuccess={onSuccess}
      onError={onError}
      variant={variant}
      className={className}
    />
  );
};

/**
 * Inner component that uses Stripe hooks - only rendered when Stripe is available
 */
const ExpressCheckoutInner = ({
  onSuccess,
  onError,
  variant = "cart",
  className = "",
}: ExpressCheckoutProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const prefersReducedMotion = useReducedMotion();
  
  const {
    isStripeConfigured,
    expressPayAvailable,
    isLoading,
    error,
    total,
    createPaymentIntent,
    handlePaymentSuccess,
    clearError,
  } = useExpressPay();
  
  const { items, subtotal } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Handle payment method from Express Pay
  const handlePaymentMethod = useCallback(
    async (event: PaymentRequestPaymentMethodEvent) => {
      if (!stripe || !elements) {
        event.complete("fail");
        return;
      }

      setIsProcessing(true);
      setPaymentError(null);

      try {
        // Get email from payment method
        const email = event.payerEmail || "customer@express.pay";
        
        // Create payment intent
        const result = await createPaymentIntent(email);
        
        if (!result?.success || !result.clientSecret) {
          event.complete("fail");
          setPaymentError(result?.error || "Failed to create payment");
          onError?.(result?.error || "Failed to create payment");
          return;
        }

        // Confirm payment with the payment method from Express Pay
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          result.clientSecret,
          {
            payment_method: event.paymentMethod.id,
          },
          {
            handleActions: false,
          }
        );

        if (confirmError) {
          event.complete("fail");
          setPaymentError(confirmError.message || "Payment failed");
          onError?.(confirmError.message || "Payment failed");
          return;
        }

        // Payment succeeded
        event.complete("success");
        
        if (paymentIntent?.id) {
          await handlePaymentSuccess(paymentIntent.id);
          onSuccess?.();
        }
      } catch (err) {
        event.complete("fail");
        const errorMessage = err instanceof Error ? err.message : "Payment failed";
        setPaymentError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [stripe, elements, createPaymentIntent, handlePaymentSuccess, onSuccess, onError]
  );

  // Still loading Stripe
  if (!stripe || !elements) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Skeleton className="h-12 w-full rounded-none" />
        {variant === "checkout" && (
          <Skeleton className="h-12 w-full rounded-none" />
        )}
      </div>
    );
  }

  // No items in cart
  if (items.length === 0) {
    return null;
  }

  const containerClass = variant === "checkout" 
    ? "bg-muted/20 p-6 space-y-4" 
    : "py-4 space-y-3";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={`${containerClass} ${className}`}
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header for checkout variant */}
        {variant === "checkout" && (
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-foreground">
              Express Checkout
            </h3>
            <p className="text-xs text-muted-foreground">
              Pay in 2 taps with your saved cards
            </p>
          </div>
        )}

        {/* Express Pay Button */}
        <ExpressPayButton
          total={total}
          onPaymentMethod={handlePaymentMethod}
          onCancel={() => setPaymentError(null)}
          className="w-full"
        />

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Processing...</span>
          </div>
        )}

        {/* Error message */}
        {(paymentError || error) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{paymentError || error}</span>
          </motion.div>
        )}

        {/* Divider for cart variant */}
        {variant === "cart" && (
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 border-t border-border" />
          </div>
        )}

        {/* Divider for checkout variant */}
        {variant === "checkout" && (
          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1 border-t border-muted-foreground/20" />
            <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
              or pay with card
            </span>
            <div className="flex-1 border-t border-muted-foreground/20" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ExpressCheckout;
