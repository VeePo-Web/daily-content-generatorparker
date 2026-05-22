import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  id: string;
  product_name: string;
  product_image_url: string | null;
  variant_size: string | null;
  variant_color: string | null;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
}

interface Order {
  id: string;
  customer_email: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  shipping_address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  shipping_method: string | null;
  discount_code: string | null;
  created_at: string;
  currency: string;
}

// Format cents to currency display
function formatCurrency(cents: number, currency: string = "cad"): string {
  const amount = cents / 100;
  const symbols: Record<string, string> = {
    eur: "€",
    usd: "$",
    gbp: "£",
    cad: "C$",
  };
  const symbol = symbols[currency.toLowerCase()] || "$";
  return `${symbol}${amount.toFixed(2)}`;
}

// Calculate estimated delivery window
function getDeliveryWindow(shippingMethod: string | null, orderDate: Date): { start: string; end: string } {
  const method = shippingMethod?.toLowerCase() || "standard";
  
  let minDays = 3;
  let maxDays = 5;
  
  if (method.includes("express")) {
    minDays = 1;
    maxDays = 2;
  } else if (method.includes("priority")) {
    minDays = 2;
    maxDays = 3;
  }
  
  const startDate = new Date(orderDate);
  startDate.setDate(startDate.getDate() + minDays);
  
  const endDate = new Date(orderDate);
  endDate.setDate(endDate.getDate() + maxDays);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

// Build the premium HTML email template
function buildOrderConfirmationHtml(order: Order, items: OrderItem[], siteUrl: string): string {
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const firstName = order.customer_first_name || "Friend";
  const orderDate = new Date(order.created_at);
  const delivery = getDeliveryWindow(order.shipping_method, orderDate);
  const isFreeShipping = order.shipping_cents === 0;
  
  // Build address string
  const addr = order.shipping_address;
  const addressLines = [
    `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim(),
    addr.line1,
    addr.line2,
    `${addr.city}${addr.state ? `, ${addr.state}` : ""} ${addr.postal_code || ""}`.trim(),
    addr.country,
  ].filter(Boolean);
  
  // Build items HTML
  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #E7E5E4;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="80" valign="top">
              ${item.product_image_url 
                ? `<img src="${item.product_image_url}" alt="${item.product_name}" width="80" height="100" style="display:block;object-fit:cover;border-radius:4px;background:#F5F5F4;" />`
                : `<div style="width:80px;height:100px;background:#F5F5F4;border-radius:4px;"></div>`
              }
            </td>
            <td style="padding-left:16px;vertical-align:top;">
              <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#1C1917;">${item.product_name}</p>
              <p style="margin:0 0 4px;font-size:14px;color:#78716C;">
                ${[item.variant_size ? `Size: ${item.variant_size}` : null, item.variant_color ? `Color: ${item.variant_color}` : null].filter(Boolean).join(" / ")}
              </p>
              <p style="margin:0;font-size:14px;color:#78716C;">Qty: ${item.quantity}</p>
            </td>
            <td width="100" align="right" valign="top">
              <p style="margin:0;font-size:16px;font-weight:600;color:#1C1917;">${formatCurrency(item.total_cents, order.currency)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Confirmation - Line of Judah</title>
</head>
<body style="margin:0;padding:0;background-color:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your armor is on the way. Order #${orderNumber} confirmed. Welcome to the tribe.
  </div>
  
  <!-- Email Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAF9;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <!-- Content Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;max-width:600px;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding:48px 40px 32px;">
              <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:3px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p>
              <div style="width:60px;height:2px;background:#F59E0B;margin:16px auto 0;"></div>
            </td>
          </tr>
          
          <!-- Hero Message -->
          <tr>
            <td align="center" style="padding:0 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#1C1917;letter-spacing:-0.5px;">YOUR ARMOR IS ON THE WAY</h1>
              <p style="margin:0;font-size:14px;color:#78716C;">Order #${orderNumber}</p>
            </td>
          </tr>
          
          <!-- Personal Greeting -->
          <tr>
            <td style="padding:0 40px 40px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1C1917;">Hey ${firstName},</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#44403C;">You didn't just place an order—you made a declaration. Every thread you wear is a statement. Every stitch is a stand.</p>
              <p style="margin:0;font-size:16px;line-height:1.6;color:#44403C;font-weight:600;">Welcome to the tribe.</p>
            </td>
          </tr>
          
          <!-- Order Items Section -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid #E7E5E4;padding-top:32px;">
                <p style="margin:0 0 20px;font-size:12px;font-weight:700;letter-spacing:2px;color:#78716C;text-transform:uppercase;">WHAT YOU'RE WEARING INTO BATTLE</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${itemsHtml}
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Order Summary -->
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#44403C;">Subtotal</td>
                  <td align="right" style="padding:8px 0;font-size:15px;color:#1C1917;">${formatCurrency(order.subtotal_cents, order.currency)}</td>
                </tr>
                ${order.discount_cents > 0 ? `
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#44403C;">Discount${order.discount_code ? ` (${order.discount_code})` : ""}</td>
                  <td align="right" style="padding:8px 0;font-size:15px;color:#059669;">-${formatCurrency(order.discount_cents, order.currency)}</td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#44403C;">Shipping</td>
                  <td align="right" style="padding:8px 0;font-size:15px;${isFreeShipping ? "color:#F59E0B;font-weight:600;" : "color:#1C1917;"}">${isFreeShipping ? "FREE" : formatCurrency(order.shipping_cents, order.currency)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:12px 0 0;">
                    <div style="border-top:2px solid #1C1917;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-size:18px;font-weight:700;color:#1C1917;">Total</td>
                  <td align="right" style="padding:12px 0 0;font-size:18px;font-weight:700;color:#1C1917;">${formatCurrency(order.total_cents, order.currency)}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Shipping Info -->
          <tr>
            <td style="padding:0 40px 40px;">
              <div style="background:#FAFAF9;border-radius:8px;padding:24px;">
                <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:2px;color:#78716C;text-transform:uppercase;">ETA TO THE FRONT LINE</p>
                <p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#1C1917;">📦 ${delivery.start} – ${delivery.end}</p>
                <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#78716C;text-transform:uppercase;">Shipping to:</p>
                ${addressLines.map((line) => `<p style="margin:0;font-size:15px;color:#44403C;line-height:1.5;">${line}</p>`).join("")}
              </div>
            </td>
          </tr>
          
          <!-- Track Order CTA -->
          <tr>
            <td align="center" style="padding:0 40px 40px;">
              <a href="${siteUrl}/account/orders" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:16px 32px;font-size:14px;font-weight:600;letter-spacing:0.5px;border-radius:0;">TRACK YOUR ORDER →</a>
            </td>
          </tr>
          
          <!-- Mission Quote -->
          <tr>
            <td style="padding:0 40px 48px;">
              <div style="border-top:1px solid #E7E5E4;padding-top:32px;text-align:center;">
                <p style="margin:0 0 16px;font-size:15px;font-style:italic;color:#78716C;line-height:1.6;">"Every outfit is an open door. You don't preach—you spark curiosity. They ask. You answer."</p>
                <p style="margin:0;font-size:16px;font-weight:700;color:#1C1917;">This isn't just clothing. It's armor.</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#1C1917;padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 4px;font-size:14px;color:#A8A29E;">Questions? We've got your back.</p>
                    <a href="mailto:hello@lineofjudah.com" style="font-size:14px;color:#FFFFFF;text-decoration:none;">hello@lineofjudah.com</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:24px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:2px;color:#FFFFFF;text-transform:uppercase;">LINE OF JUDAH</p>
                    <p style="margin:0;font-size:13px;color:#78716C;">For those who walk different.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:24px;">
                    <a href="https://instagram.com" style="display:inline-block;margin:0 8px;font-size:13px;color:#A8A29E;text-decoration:none;">Instagram</a>
                    <span style="color:#57534E;">•</span>
                    <a href="https://tiktok.com" style="display:inline-block;margin:0 8px;font-size:13px;color:#A8A29E;text-decoration:none;">TikTok</a>
                    <span style="color:#57534E;">•</span>
                    <a href="https://youtube.com" style="display:inline-block;margin:0 8px;font-size:13px;color:#A8A29E;text-decoration:none;">YouTube</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:24px;border-top:1px solid #292524;margin-top:24px;">
                    <p style="margin:16px 0 0;font-size:12px;color:#57534E;">© 2026 Line of Judah. All rights reserved.</p>
                    <p style="margin:8px 0 0;">
                      <a href="${siteUrl}/privacy" style="font-size:12px;color:#57534E;text-decoration:none;">Privacy</a>
                      <span style="color:#44403C;margin:0 8px;">•</span>
                      <a href="${siteUrl}/terms" style="font-size:12px;color:#57534E;text-decoration:none;">Terms</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const siteUrl = Deno.env.get("SITE_URL") || "https://lineofjudah.com";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { orderId } = await req.json();
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "orderId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Generating order confirmation email for order: ${orderId}`);
    
    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    
    if (orderError || !order) {
      console.error("Failed to fetch order:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    
    if (itemsError) {
      console.error("Failed to fetch order items:", itemsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Build the email HTML
    const emailHtml = buildOrderConfirmationHtml(order as Order, (items || []) as OrderItem[], siteUrl);
    const subject = `Your armor is on the way - Order #${orderId.slice(0, 8).toUpperCase()}`;
    
    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      // Stub mode - log email for testing
      console.log("=".repeat(60));
      console.log("RESEND_API_KEY not configured - Email logged for testing");
      console.log("=".repeat(60));
      console.log("To:", order.customer_email);
      console.log("Subject:", subject);
      console.log("=".repeat(60));
      console.log("HTML Preview (first 500 chars):", emailHtml.substring(0, 500));
      console.log("=".repeat(60));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          mode: "stub",
          message: "Email template generated (API key not configured)",
          to: order.customer_email,
          subject: subject,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Send email via Resend using fetch (no external dependency needed)
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Line of Judah <orders@lineofjudah.com>",
        to: [order.customer_email],
        subject: subject,
        html: emailHtml,
      }),
    });
    
    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Failed to send email:", emailResult);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailResult }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Order confirmation email sent:", emailResult);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        mode: "live",
        emailId: emailResult.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    console.error("Error in send-order-confirmation:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
