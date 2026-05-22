import { useState, useEffect, useCallback } from "react";
import { useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import type { PaymentRequest, Stripe, PaymentRequestPaymentMethodEvent } from "@stripe/stripe-js";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpressPayButtonProps {
  total: number; // in cents
  currency?: string;
  onPaymentMethod: (event: PaymentRequestPaymentMethodEvent) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

/**
 * ExpressPayButton renders Apple Pay / Google Pay button
 * 
 * Uses Stripe's PaymentRequestButtonElement which automatically shows
 * the appropriate button based on browser/device support.
 */
export const ExpressPayButton = ({
  total,
  currency = "eur",
  onPaymentMethod,
  onCancel,
  className,
}: ExpressPayButtonProps) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canMakePayment, setCanMakePayment] = useState<boolean | null>(null);

  // Create payment request
  useEffect(() => {
    if (!stripe || !elements) return;

    const pr = stripe.paymentRequest({
      country: "US", // Merchant country
      currency,
      total: {
        label: "Total",
        amount: Math.max(total, 50), // Minimum 50 cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: false,
      requestShipping: false,
    });

    // Check if Apple Pay / Google Pay is available
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      } else {
        setCanMakePayment(false);
      }
    });

    // Handle payment method event
    pr.on("paymentmethod", async (event) => {
      try {
        await onPaymentMethod(event);
      } catch (error) {
        event.complete("fail");
      }
    });

    // Handle cancel
    pr.on("cancel", () => {
      onCancel?.();
    });

    return () => {
      // Cleanup
      setPaymentRequest(null);
    };
  }, [stripe, elements, total, currency, onPaymentMethod, onCancel]);

  // Update payment request amount when total changes
  useEffect(() => {
    if (paymentRequest) {
      paymentRequest.update({
        total: {
          label: "Total",
          amount: Math.max(total, 50),
        },
      });
    }
  }, [paymentRequest, total]);

  // Still checking availability
  if (canMakePayment === null) {
    return (
      <div className={className}>
        <Skeleton className="h-12 w-full rounded-none" />
      </div>
    );
  }

  // Not available on this device/browser
  if (!canMakePayment || !paymentRequest) {
    return null;
  }

  return (
    <div className={className}>
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: "default",
              theme: "dark",
              height: "48px",
            },
          },
        }}
      />
    </div>
  );
};

export default ExpressPayButton;
