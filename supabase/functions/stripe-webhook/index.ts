import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Stripe signature verification
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const parts = signature.split(",");
    
    let timestamp = "";
    let signatures: string[] = [];
    
    for (const part of parts) {
      const [key, value] = part.split("=");
      if (key === "t") {
        timestamp = value;
      } else if (key === "v1") {
        signatures.push(value);
      }
    }
    
    if (!timestamp || signatures.length === 0) {
      return false;
    }
    
    // Check timestamp is within tolerance (5 minutes)
    const timestampNum = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestampNum) > 300) {
      console.error("Webhook timestamp outside tolerance");
      return false;
    }
    
    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );
    
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    
    // Compare signatures
    return signatures.some((sig) => sig === expectedSignature);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get raw body for signature verification
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature");

    // Verify signature if webhook secret is configured
    if (webhookSecret && signature) {
      const isValid = await verifyStripeSignature(payload, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (webhookSecret && !signature) {
      console.error("Missing stripe-signature header");
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const event = JSON.parse(payload);
    console.log(`Received Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;
        const abandonedCartId = session.metadata?.abandoned_cart_id;

        if (!orderId) {
          console.error("No order_id in session metadata");
          break;
        }

        console.log(`Processing completed checkout for order ${orderId}`);

        // Update order status
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            payment_status: "paid",
            stripe_payment_intent_id: session.payment_intent,
            stripe_customer_id: session.customer,
          })
          .eq("id", orderId);

        if (updateError) {
          console.error("Failed to update order:", updateError);
        }

        // Get order items to decrement stock
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("variant_id, quantity")
          .eq("order_id", orderId);

        // Decrement stock for each variant
        if (orderItems) {
          for (const item of orderItems) {
            if (item.variant_id) {
              const { error: stockError } = await supabase.rpc("decrement_stock", {
                p_variant_id: item.variant_id,
                p_quantity: item.quantity,
              });
              
              if (stockError) {
                console.error(`Failed to decrement stock for variant ${item.variant_id}:`, stockError);
              }
            }
          }
        }

        // Trigger order confirmation email
        try {
          const baseUrl = Deno.env.get("SUPABASE_URL");
          const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
          
          await fetch(`${baseUrl}/functions/v1/send-order-confirmation`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${anonKey}`,
            },
            body: JSON.stringify({ orderId }),
          });
          
          console.log(`Order confirmation email triggered for order ${orderId}`);
        } catch (emailError) {
          console.error("Failed to trigger order confirmation email:", emailError);
          // Don't fail the webhook - email is non-critical
        }

        // Mark abandoned cart as converted if applicable
        if (abandonedCartId) {
          await supabase
            .from("abandoned_carts")
            .update({
              status: "converted",
              converted_at: new Date().toISOString(),
            })
            .eq("id", abandonedCartId);
        }

        console.log(`Order ${orderId} marked as paid`);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          console.log(`Checkout session expired for order ${orderId}`);
          await supabase
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", orderId)
            .eq("status", "pending");
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log(`Payment failed for payment intent ${paymentIntent.id}`);
        // Order remains in pending status
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;

        if (paymentIntentId) {
          // Determine refund status
          const isFullRefund = charge.amount_refunded === charge.amount;
          const paymentStatus = isFullRefund ? "refunded" : "partially_refunded";
          const status = isFullRefund ? "refunded" : "paid";

          await supabase
            .from("orders")
            .update({ 
              payment_status: paymentStatus,
              status: status,
            })
            .eq("stripe_payment_intent_id", paymentIntentId);

          console.log(`Order with payment intent ${paymentIntentId} marked as ${paymentStatus}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Always return 200 to acknowledge receipt
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    // Still return 200 to prevent Stripe retries for parsing errors
    return new Response(
      JSON.stringify({ received: true, error: "Processing error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
