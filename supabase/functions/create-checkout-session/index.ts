import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface BundleDiscountClaim {
  bundleRuleId: string;
  lookId: string;
  itemProductIds: string[];
  claimedSavings: number;
}

interface CheckoutRequest {
  items: CartItem[];
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: "standard" | "express" | "overnight";
  discountCodeId?: string;
  abandonedCartId?: string;
  bundleDiscounts?: BundleDiscountClaim[];
}

// Shipping costs in cents (CAD)
const SHIPPING_COSTS = {
  standard: 1000, // $10 CAD
  express: 1500, // $15 CAD
  overnight: 3500, // $35 CAD
};

const FREE_SHIPPING_THRESHOLD = 9900; // $99 CAD in cents

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    // Graceful handling when Stripe is not configured
    if (!stripeSecretKey) {
      console.log("Stripe not configured - STRIPE_SECRET_KEY missing");
      return new Response(
        JSON.stringify({
          success: false,
          configured: false,
          message: "Payment processing is being set up. Please try again later or contact support.",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const siteUrl = Deno.env.get("SITE_URL") || "https://lineofjudah.com";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: CheckoutRequest = await req.json();
    const {
      items,
      customerEmail,
      customerFirstName,
      customerLastName,
      customerPhone,
      shippingAddress,
      billingAddress,
      shippingMethod,
      discountCodeId,
      abandonedCartId,
      bundleDiscounts,
    } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Cart is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!customerEmail || !shippingAddress) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required customer information" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate totals
    const subtotalCents = items.reduce((sum, item) => {
      return sum + Math.round(item.price * 100) * item.quantity;
    }, 0);

    // Calculate shipping
    let shippingCents = SHIPPING_COSTS[shippingMethod] || 0;
    if (subtotalCents >= FREE_SHIPPING_THRESHOLD) {
      shippingCents = 0;
    }

    // Validate discount code server-side if provided
    let discountCents = 0;
    let validatedDiscountCode: string | null = null;
    let discountCodeRecord: { id: string; code: string; name: string; discount_type: string; discount_value: number; usage_count: number } | null = null;

    if (discountCodeId) {
      const { data: codeData, error: codeError } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("id", discountCodeId)
        .eq("is_active", true)
        .single();

      if (codeError || !codeData) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid or expired discount code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate expiry
      const now = new Date();
      if (codeData.expires_at && new Date(codeData.expires_at) < now) {
        return new Response(
          JSON.stringify({ success: false, error: "This discount code has expired" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate usage limit
      if (codeData.usage_limit !== null && codeData.usage_count >= codeData.usage_limit) {
        return new Response(
          JSON.stringify({ success: false, error: "This discount code has reached its usage limit" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate minimum order
      if (subtotalCents < codeData.minimum_order_cents) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Minimum order of $${(codeData.minimum_order_cents / 100).toFixed(2)} CAD required for this code` 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check per-user limit
      const { count: userRedemptions } = await supabase
        .from("discount_code_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("discount_code_id", codeData.id)
        .ilike("customer_email", customerEmail);

      if (userRedemptions !== null && userRedemptions >= codeData.per_user_limit) {
        return new Response(
          JSON.stringify({ success: false, error: "You have already used this discount code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate discount amount
      if (codeData.discount_type === "percentage") {
        discountCents = Math.round((subtotalCents * codeData.discount_value) / 100);
        if (codeData.maximum_discount_cents && discountCents > codeData.maximum_discount_cents) {
          discountCents = codeData.maximum_discount_cents;
        }
      } else {
        discountCents = Math.round(codeData.discount_value);
        if (discountCents > subtotalCents) {
          discountCents = subtotalCents;
        }
      }

      validatedDiscountCode = codeData.code;
      discountCodeRecord = codeData;
    }

    // Validate and calculate bundle discounts server-side
    let bundleDiscountCents = 0;
    const validatedBundles: Array<{ lookId: string; discountPercent: number; savingsCents: number }> = [];

    if (bundleDiscounts && bundleDiscounts.length > 0) {
      for (const bundle of bundleDiscounts) {
        // Verify the items belong to the claimed look
        const { data: lookProducts } = await supabase
          .from("lookbook_look_products")
          .select("product_id")
          .eq("look_id", bundle.lookId);

        if (!lookProducts) continue;

        const validLookProductIds = new Set(lookProducts.map((lp: any) => lp.product_id));
        const validItems = bundle.itemProductIds.filter((id) => validLookProductIds.has(id));

        if (validItems.length < 2) continue; // Need at least 2 items for bundle

        // Find applicable bundle rule
        const { data: rules } = await supabase
          .from("bundle_discounts")
          .select("*")
          .eq("source_type", "lookbook")
          .eq("is_active", true)
          .lte("min_items", validItems.length)
          .order("min_items", { ascending: false })
          .limit(1);

        if (!rules || rules.length === 0) continue;

        const rule = rules[0];

        // Calculate bundle subtotal from matching items
        const bundleItemSubtotal = items
          .filter((item) => validItems.includes(item.productId))
          .reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);

        const bundleSavingsCents = Math.round(bundleItemSubtotal * rule.discount_value / 100);
        bundleDiscountCents += bundleSavingsCents;

        validatedBundles.push({
          lookId: bundle.lookId,
          discountPercent: rule.discount_value,
          savingsCents: bundleSavingsCents,
        });
      }
    }

    // Calculate total (now including bundle discounts)
    const totalCents = subtotalCents + shippingCents - discountCents - bundleDiscountCents;

    // Get user ID from auth header if available
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Create pending order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        payment_status: "unpaid",
        customer_email: customerEmail,
        customer_first_name: customerFirstName,
        customer_last_name: customerLastName,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        billing_address: billingAddress || shippingAddress,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        discount_cents: discountCents + bundleDiscountCents, // Include bundle discount
        total_cents: totalCents,
        currency: "cad",
        discount_code: validatedDiscountCode,
        shipping_method: shippingMethod,
        metadata: { 
          abandoned_cart_id: abandonedCartId,
          discount_code_id: discountCodeId,
          bundle_discounts: validatedBundles.length > 0 ? validatedBundles : undefined,
        },
      })
      .select()
      .single();

    if (orderError) {
      console.error("Failed to create order:", orderError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId || null,
      variant_id: item.variantId || null,
      product_name: item.name,
      product_image_url: item.image,
      variant_size: item.size,
      variant_color: item.color,
      unit_price_cents: Math.round(item.price * 100),
      quantity: item.quantity,
      total_cents: Math.round(item.price * 100) * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Failed to create order items:", itemsError);
      // Clean up the order
      await supabase.from("orders").delete().eq("id", order.id);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Stripe Checkout Session
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: {
            product_id: item.productId || "",
            variant_id: item.variantId || "",
            size: item.size || "",
            color: item.color || "",
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if not free
    if (shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: `${shippingMethod.charAt(0).toUpperCase() + shippingMethod.slice(1)} Shipping`,
            images: [] as string[],
            metadata: {
              product_id: "",
              variant_id: "",
              size: "",
              color: "",
            },
          },
          unit_amount: shippingCents,
        },
        quantity: 1,
      });
    }

    // Build Stripe request
    const stripeParams = new URLSearchParams({
      "payment_method_types[0]": "card",
      mode: "payment",
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?cancelled=true`,
      customer_email: customerEmail,
      "metadata[order_id]": order.id,
      "metadata[abandoned_cart_id]": abandonedCartId || "",
    });

    // Add line items
    lineItems.forEach((item, index) => {
      stripeParams.append(`line_items[${index}][price_data][currency]`, item.price_data.currency);
      stripeParams.append(`line_items[${index}][price_data][product_data][name]`, item.price_data.product_data.name);
      if (item.price_data.product_data.images.length > 0) {
        stripeParams.append(`line_items[${index}][price_data][product_data][images][0]`, item.price_data.product_data.images[0]);
      }
      stripeParams.append(`line_items[${index}][price_data][unit_amount]`, String(item.price_data.unit_amount));
      stripeParams.append(`line_items[${index}][quantity]`, String(item.quantity));
    });

    // Apply discount if provided (discount code)
    if (discountCents > 0 && discountCodeRecord) {
      // Create a coupon for the discount
      const couponResponse = await fetch("https://api.stripe.com/v1/coupons", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          amount_off: String(discountCents),
          currency: "cad",
          duration: "once",
          name: discountCodeRecord.name || discountCodeRecord.code || "Discount",
        }),
      });

      if (couponResponse.ok) {
        const coupon = await couponResponse.json();
        stripeParams.append("discounts[0][coupon]", coupon.id);
      }

      // Increment usage count and create redemption record
      await supabase
        .from("discount_codes")
        .update({ usage_count: discountCodeRecord.usage_count + 1 })
        .eq("id", discountCodeRecord.id);

      await supabase
        .from("discount_code_redemptions")
        .insert({
          discount_code_id: discountCodeRecord.id,
          order_id: order.id,
          customer_email: customerEmail,
          discount_applied_cents: discountCents,
        });
    }

    // Apply bundle discount if present (separate coupon)
    if (bundleDiscountCents > 0) {
      const bundleCouponResponse = await fetch("https://api.stripe.com/v1/coupons", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          amount_off: String(bundleDiscountCents),
          currency: "cad",
          duration: "once",
          name: "Complete Look Bundle Discount",
        }),
      });

      if (bundleCouponResponse.ok) {
        const bundleCoupon = await bundleCouponResponse.json();
        // If we already have a discount coupon, add this as a second one
        const discountIndex = discountCents > 0 ? 1 : 0;
        stripeParams.append(`discounts[${discountIndex}][coupon]`, bundleCoupon.id);
      }
    }

    // Create Stripe session
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: stripeParams,
    });

    if (!stripeResponse.ok) {
      const stripeError = await stripeResponse.text();
      console.error("Stripe error:", stripeError);
      // Clean up the order
      await supabase.from("orders").delete().eq("id", order.id);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create payment session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const session = await stripeResponse.json();

    // Update order with Stripe session ID
    await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: session.url,
        orderId: order.id,
        sessionId: session.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
