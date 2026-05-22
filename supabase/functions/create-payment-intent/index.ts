import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

interface PaymentIntentRequest {
  items: CartItem[];
  customerEmail: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone?: string;
  shippingAddress?: ShippingAddress;
  shippingMethod?: "standard" | "express" | "overnight";
  discountCodeId?: string;
  bundleDiscounts?: BundleDiscountClaim[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

    // Check if Stripe is configured
    if (!STRIPE_SECRET_KEY) {
      console.log("STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({
          success: false,
          configured: false,
          message: "Stripe is not configured. Add STRIPE_SECRET_KEY to enable payments.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: PaymentIntentRequest = await req.json();
    const {
      items,
      customerEmail,
      customerFirstName,
      customerLastName,
      customerPhone,
      shippingAddress,
      shippingMethod = "standard",
      discountCodeId,
      bundleDiscounts,
    } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No items provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!customerEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "Customer email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate order totals
    const subtotalCents = items.reduce(
      (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
      0
    );

    // Validate and calculate discount
    let discountCents = 0;
    let validatedDiscountCode: string | null = null;

    if (discountCodeId) {
      const { data: discountData } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("id", discountCodeId)
        .eq("is_active", true)
        .maybeSingle();

      if (discountData) {
        const now = new Date();
        const startsAt = discountData.starts_at ? new Date(discountData.starts_at) : null;
        const expiresAt = discountData.expires_at ? new Date(discountData.expires_at) : null;

        if ((!startsAt || now >= startsAt) && (!expiresAt || now <= expiresAt)) {
          if (!discountData.minimum_order_cents || subtotalCents >= discountData.minimum_order_cents) {
            if (discountData.discount_type === "percentage") {
              discountCents = Math.round(subtotalCents * (discountData.discount_value / 100));
            } else {
              discountCents = Math.round(discountData.discount_value * 100);
            }

            if (discountData.maximum_discount_cents) {
              discountCents = Math.min(discountCents, discountData.maximum_discount_cents);
            }

            validatedDiscountCode = discountData.code;
          }
        }
      }
    }

    // Calculate bundle discounts
    let bundleDiscountCents = 0;
    if (bundleDiscounts && bundleDiscounts.length > 0) {
      bundleDiscountCents = bundleDiscounts.reduce(
        (sum, bundle) => sum + Math.round(bundle.claimedSavings * 100),
        0
      );
    }

    // Calculate shipping
    let shippingCents = 0;
    const FREE_SHIPPING_THRESHOLD = 9900; // $99 CAD

    if (subtotalCents < FREE_SHIPPING_THRESHOLD || shippingMethod !== "standard") {
      switch (shippingMethod) {
        case "express":
          shippingCents = 1500;
          break;
        case "overnight":
          shippingCents = 3500;
          break;
        default:
          shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD ? 0 : 1000;
      }
    }

    // Calculate final total
    const totalDiscountCents = discountCents + bundleDiscountCents;
    const totalCents = Math.max(subtotalCents - totalDiscountCents + shippingCents, 50);

    // Get user ID if authenticated
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
        customer_email: customerEmail,
        customer_first_name: customerFirstName || null,
        customer_last_name: customerLastName || null,
        customer_phone: customerPhone || null,
        shipping_address: shippingAddress || {},
        shipping_method: shippingMethod,
        subtotal_cents: subtotalCents,
        discount_cents: totalDiscountCents,
        discount_code: validatedDiscountCode,
        discount_id: discountCodeId || null,
        shipping_cents: shippingCents,
        total_cents: totalCents,
        status: "pending",
        payment_status: "unpaid",
        fulfillment_status: "unfulfilled",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create order" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId || null,
      variant_id: item.variantId || null,
      product_name: item.name,
      product_image_url: item.image,
      variant_size: item.size || null,
      variant_color: item.color || null,
      unit_price_cents: Math.round(item.price * 100),
      quantity: item.quantity,
      total_cents: Math.round(item.price * 100) * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
    }

    // Create Stripe PaymentIntent
    const stripe = await import("https://esm.sh/stripe@14.14.0?target=deno");
    const stripeClient = new stripe.default(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    // Create or retrieve Stripe customer
    const customers = await stripeClient.customers.list({
      email: customerEmail,
      limit: 1,
    });

    let stripeCustomerId: string;
    if (customers.data.length > 0) {
      stripeCustomerId = customers.data[0].id;
    } else {
      const customer = await stripeClient.customers.create({
        email: customerEmail,
        name: customerFirstName && customerLastName
          ? `${customerFirstName} ${customerLastName}`
          : undefined,
        phone: customerPhone || undefined,
      });
      stripeCustomerId = customer.id;
    }

    // Update order with Stripe customer ID
    await supabase
      .from("orders")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", order.id);

    // Create PaymentIntent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: totalCents,
      currency: "cad",
      customer: stripeCustomerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_id: order.id,
        customer_email: customerEmail,
      },
      description: `Order ${order.id}`,
    });

    // Update order with payment intent ID
    await supabase
      .from("orders")
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq("id", order.id);

    console.log("PaymentIntent created:", paymentIntent.id, "for order:", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        configured: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: order.id,
        total: totalCents,
        currency: "cad",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Payment intent error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
