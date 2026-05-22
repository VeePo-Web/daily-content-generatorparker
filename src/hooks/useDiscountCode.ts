import { useState, useCallback } from "react";

export interface AppliedDiscount {
  codeId: string;
  code: string;
  name: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  discountAmountCents: number;
}

export type DiscountErrorCode =
  | "CODE_NOT_FOUND"
  | "CODE_EXPIRED"
  | "CODE_INACTIVE"
  | "CODE_NOT_YET_VALID"
  | "MINIMUM_NOT_MET"
  | "USAGE_LIMIT_REACHED"
  | "PER_USER_LIMIT_REACHED";

interface ValidationResult {
  valid: boolean;
  discountCode?: AppliedDiscount;
  error?: DiscountErrorCode;
  message?: string;
}

interface UseDiscountCodeReturn {
  validateCode: (
    code: string,
    subtotalCents: number,
    customerEmail: string
  ) => Promise<ValidationResult>;
  appliedDiscount: AppliedDiscount | null;
  clearDiscount: () => void;
  isValidating: boolean;
  error: string | null;
  errorCode: DiscountErrorCode | null;
}

export const useDiscountCode = (): UseDiscountCodeReturn => {
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<DiscountErrorCode | null>(null);

  const validateCode = useCallback(
    async (
      code: string,
      subtotalCents: number,
      customerEmail: string
    ): Promise<ValidationResult> => {
      if (!code.trim()) {
        const result = { valid: false, error: "CODE_NOT_FOUND" as DiscountErrorCode, message: "Please enter a discount code" };
        setError(result.message);
        setErrorCode(result.error);
        return result;
      }

      if (!customerEmail.trim()) {
        const result = { valid: false, error: "CODE_NOT_FOUND" as DiscountErrorCode, message: "Email is required to validate discount code" };
        setError(result.message);
        setErrorCode(result.error);
        return result;
      }

      setIsValidating(true);
      setError(null);
      setErrorCode(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-discount-code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({
              code: code.trim(),
              subtotalCents,
              customerEmail: customerEmail.trim(),
            }),
          }
        );

        const result = await response.json();

        if (result.valid && result.discountCode) {
          const discount: AppliedDiscount = {
            codeId: result.discountCode.id,
            code: result.discountCode.code,
            name: result.discountCode.name,
            discountType: result.discountCode.discountType,
            discountValue: result.discountCode.discountValue,
            discountAmountCents: result.discountCode.discountAmountCents,
          };
          setAppliedDiscount(discount);
          setError(null);
          setErrorCode(null);
          return { valid: true, discountCode: discount };
        } else {
          setAppliedDiscount(null);
          setError(result.message || "Invalid discount code");
          setErrorCode(result.error || "CODE_NOT_FOUND");
          return {
            valid: false,
            error: result.error || "CODE_NOT_FOUND",
            message: result.message || "Invalid discount code",
          };
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to validate code";
        setError(message);
        setErrorCode("CODE_NOT_FOUND");
        setAppliedDiscount(null);
        return { valid: false, error: "CODE_NOT_FOUND", message };
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  const clearDiscount = useCallback(() => {
    setAppliedDiscount(null);
    setError(null);
    setErrorCode(null);
  }, []);

  return {
    validateCode,
    appliedDiscount,
    clearDiscount,
    isValidating,
    error,
    errorCode,
  };
};
