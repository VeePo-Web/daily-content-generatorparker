import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateRequest {
  code: string;
  subtotalCents: number;
  customerEmail: string;
}

interface DiscountCode {
  id: string;
  code: string;
  name: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  minimum_order_cents: number;
  maximum_discount_cents: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
}

type ErrorCode =
  | "CODE_NOT_FOUND"
  | "CODE_EXPIRED"
  | "CODE_INACTIVE"
  | "CODE_NOT_YET_VALID"
  | "MINIMUM_NOT_MET"
  | "USAGE_LIMIT_REACHED"
  | "PER_USER_LIMIT_REACHED";

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  CODE_NOT_FOUND: "This code doesn't exist. Please check the spelling.",
  CODE_EXPIRED: "This code has expired.",
  CODE_INACTIVE: "This code is no longer active.",
  CODE_NOT_YET_VALID: "This code isn't active yet.",
  MINIMUM_NOT_MET: "This code requires a minimum order of ${amount}.",
  USAGE_LIMIT_REACHED: "This code has reached its usage limit.",
  PER_USER_LIMIT_REACHED: "You've already used this code.",
};

function formatCentsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ValidateRequest = await req.json();
    const { code, subtotalCents, customerEmail } = body;

    // Validate input
    if (!code || typeof subtotalCents !== "number" || !customerEmail) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "CODE_NOT_FOUND",
          message: "Invalid request parameters",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Look up the code (case-insensitive)
    const { data: discountCode, error: lookupError } = await supabase
      .from("discount_codes")
      .select("*")
      .ilike("code", code.trim())
      .single();

    if (lookupError || !discountCode) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "CODE_NOT_FOUND" as ErrorCode,
          message: ERROR_MESSAGES.CODE_NOT_FOUND,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dc = discountCode as DiscountCode;
    const now = new Date();

    // Check if active
    if (!dc.is_active) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "CODE_INACTIVE" as ErrorCode,
          message: ERROR_MESSAGES.CODE_INACTIVE,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check start date
    if (new Date(dc.starts_at) > now) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "CODE_NOT_YET_VALID" as ErrorCode,
          message: ERROR_MESSAGES.CODE_NOT_YET_VALID,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (dc.expires_at && new Date(dc.expires_at) < now) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "CODE_EXPIRED" as ErrorCode,
          message: ERROR_MESSAGES.CODE_EXPIRED,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check global usage limit
    if (dc.usage_limit !== null && dc.usage_count >= dc.usage_limit) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "USAGE_LIMIT_REACHED" as ErrorCode,
          message: ERROR_MESSAGES.USAGE_LIMIT_REACHED,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check minimum order requirement
    if (subtotalCents < dc.minimum_order_cents) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "MINIMUM_NOT_MET" as ErrorCode,
          message: ERROR_MESSAGES.MINIMUM_NOT_MET.replace(
            "{amount}",
            formatCentsToDollars(dc.minimum_order_cents)
          ),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check per-user limit
    const { count: userRedemptions } = await supabase
      .from("discount_code_redemptions")
      .select("*", { count: "exact", head: true })
      .eq("discount_code_id", dc.id)
      .ilike("customer_email", customerEmail.trim());

    if (userRedemptions !== null && userRedemptions >= dc.per_user_limit) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "PER_USER_LIMIT_REACHED" as ErrorCode,
          message: ERROR_MESSAGES.PER_USER_LIMIT_REACHED,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate discount amount
    let discountAmountCents: number;

    if (dc.discount_type === "percentage") {
      discountAmountCents = Math.round((subtotalCents * dc.discount_value) / 100);
      // Apply maximum cap if set
      if (dc.maximum_discount_cents !== null && discountAmountCents > dc.maximum_discount_cents) {
        discountAmountCents = dc.maximum_discount_cents;
      }
    } else {
      // Fixed amount (stored in cents)
      discountAmountCents = Math.round(dc.discount_value);
      // Don't exceed the order total
      if (discountAmountCents > subtotalCents) {
        discountAmountCents = subtotalCents;
      }
    }

    // Success response
    return new Response(
      JSON.stringify({
        valid: true,
        discountCode: {
          id: dc.id,
          code: dc.code,
          name: dc.name,
          discountType: dc.discount_type,
          discountValue: dc.discount_value,
          discountAmountCents,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Validation error:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        error: "CODE_NOT_FOUND",
        message: "An error occurred while validating the code.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
