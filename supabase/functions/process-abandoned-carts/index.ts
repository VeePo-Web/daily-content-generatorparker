import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email timing configuration
const EMAIL_1_DELAY_HOURS = 1; // 1 hour after abandonment
const EMAIL_2_DELAY_HOURS = 24; // 24 hours after abandonment
const EMAIL_3_DELAY_HOURS = 72; // 72 hours after abandonment (with discount)

interface CartItem {
  id: number;
  name: string;
  price: number;
  priceFormatted: string;
  image: string;
  quantity: number;
  category: string;
  size?: string;
  color?: string;
}

interface AbandonedCart {
  id: string;
  email: string;
  cart_items: CartItem[];
  cart_total: number;
  recovery_token: string;
  status: string;
  discount_code: string | null;
  created_at: string;
  email_1_sent_at: string | null;
  email_2_sent_at: string | null;
  email_3_sent_at: string | null;
}

// Generate a unique discount code
function generateDiscountCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'LOJ15-';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Email sending function (stubbed - requires RESEND_API_KEY)
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  resendApiKey?: string
): Promise<boolean> {
  if (!resendApiKey) {
    console.log(`[STUB] Would send email to ${to}: ${subject}`);
    console.log(`[STUB] Email content preview: ${html.substring(0, 200)}...`);
    return true; // Pretend success for testing
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Line of Judah <noreply@lineofjudah.com>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Shared email footer component
function getEmailFooter(siteUrl: string): string {
  return `
    <!-- Dark Footer -->
    <tr>
      <td style="background:#1C1917;padding:32px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center">
              <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;color:#A8A29E;">Questions? We've got your back.</p>
              <a href="mailto:hello@lineofjudah.com" style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;color:#FFFFFF;text-decoration:none;">hello@lineofjudah.com</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;color:#FFFFFF;text-transform:uppercase;">LINE OF JUDAH</p>
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:13px;color:#78716C;">For those who walk different.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;">
              <a href="https://instagram.com" style="display:inline-block;margin:0 8px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:13px;color:#A8A29E;text-decoration:none;">Instagram</a>
              <span style="color:#57534E;">•</span>
              <a href="https://tiktok.com" style="display:inline-block;margin:0 8px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:13px;color:#A8A29E;text-decoration:none;">TikTok</a>
              <span style="color:#57534E;">•</span>
              <a href="https://youtube.com" style="display:inline-block;margin:0 8px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:13px;color:#A8A29E;text-decoration:none;">YouTube</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#57534E;">© 2026 Line of Judah. All rights reserved.</p>
              <p style="margin:8px 0 0;">
                <a href="${siteUrl}/privacy-policy" style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#57534E;text-decoration:none;">Privacy</a>
                <span style="color:#44403C;margin:0 8px;">•</span>
                <a href="${siteUrl}/terms-of-service" style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#57534E;text-decoration:none;">Terms</a>
                <span style="color:#44403C;margin:0 8px;">•</span>
                <a href="#" style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#57534E;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

// Email templates using premium editorial tone - Line of Judah brand voice
function getEmail1Html(cart: AbandonedCart, recoveryUrl: string, siteUrl: string): string {
  const itemsHtml = cart.cart_items.map(item => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #E7E5E4;">
        <img src="${item.image}" alt="${item.name}" width="80" height="100" style="display:block;width:80px;height:100px;object-fit:cover;border-radius:4px;" />
      </td>
      <td style="padding:16px;border-bottom:1px solid #E7E5E4;vertical-align:top;">
        <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;font-weight:500;color:#1C1917;">${item.name}</p>
        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#78716C;">Size: ${item.size || 'One Size'}${item.color ? ` · ${item.color}` : ''}</p>
      </td>
      <td style="padding:16px 0;border-bottom:1px solid #E7E5E4;text-align:right;vertical-align:top;">
        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;font-weight:500;color:#1C1917;">${item.priceFormatted}</p>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <title>Your armor is waiting | Line of Judah</title>
    </head>
    <body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAFAF9;">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #E7E5E4;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:2px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p>
                  <div style="width:40px;height:2px;background:#F59E0B;margin:0 auto;"></div>
                </td>
              </tr>
              
              <!-- Hero -->
              <tr>
                <td style="padding:48px 40px 32px;text-align:center;">
                  <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;letter-spacing:0.02em;color:#1C1917;">
                    YOUR ARMOR IS WAITING
                  </h1>
                  <p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">
                    You started something. Your selection is on standby—<br/>armor ready, mission waiting.
                  </p>
                </td>
              </tr>
              
              <!-- Items -->
              <tr>
                <td style="padding:0 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>
              
              <!-- Total -->
              <tr>
                <td style="padding:24px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="border-top:2px solid #1C1917;padding-top:16px;text-align:right;">
                        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:16px;color:#1C1917;">
                          Total: <strong style="font-weight:600;">$${cart.cart_total.toLocaleString()}</strong>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- CTA -->
              <tr>
                <td style="padding:16px 40px 48px;text-align:center;">
                  <a href="${recoveryUrl}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:16px 48px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;border-radius:4px;">
                    CONTINUE WHERE YOU LEFT OFF
                  </a>
                </td>
              </tr>
              
              <!-- Brand Quote -->
              <tr>
                <td style="padding:32px 40px;background:#FAFAF9;border-top:1px solid #E7E5E4;">
                  <p style="margin:0;font-size:14px;font-style:italic;color:#78716C;text-align:center;line-height:1.6;">
                    "Every outfit is an open door."
                  </p>
                </td>
              </tr>
              
              ${getEmailFooter(siteUrl)}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function getEmail2Html(cart: AbandonedCart, recoveryUrl: string, siteUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <title>The mission continues | Line of Judah</title>
    </head>
    <body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAFAF9;">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #E7E5E4;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:2px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p>
                  <div style="width:40px;height:2px;background:#F59E0B;margin:0 auto;"></div>
                </td>
              </tr>
              
              <!-- Hero -->
              <tr>
                <td style="padding:48px 40px 24px;text-align:center;">
                  <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;letter-spacing:0.02em;color:#1C1917;">
                    THE MISSION CONTINUES
                  </h1>
                  <p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">
                    You came close. Your armor is still waiting—but not forever.<br/>Every piece is a declaration. Don't leave it behind.
                  </p>
                </td>
              </tr>
              
              <!-- Summary Card -->
              <tr>
                <td style="padding:24px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #E7E5E4;border-radius:8px;">
                    <tr>
                      <td style="padding:32px;text-align:center;">
                        <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.15em;color:#78716C;text-transform:uppercase;">
                          YOUR CART
                        </p>
                        <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:32px;font-weight:300;color:#1C1917;">
                          $${cart.cart_total.toLocaleString()}
                        </p>
                        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:13px;color:#78716C;">
                          ${cart.cart_items.length} item${cart.cart_items.length > 1 ? 's' : ''} waiting
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- CTA -->
              <tr>
                <td style="padding:16px 40px 48px;text-align:center;">
                  <a href="${recoveryUrl}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:16px 48px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;border-radius:4px;">
                    GEAR UP NOW
                  </a>
                </td>
              </tr>
              
              <!-- Brand Quote -->
              <tr>
                <td style="padding:32px 40px;background:#FAFAF9;border-top:1px solid #E7E5E4;">
                  <p style="margin:0;font-size:14px;font-style:italic;color:#78716C;text-align:center;line-height:1.6;">
                    "You don't preach—you spark curiosity. They ask. You answer."
                  </p>
                </td>
              </tr>
              
              ${getEmailFooter(siteUrl)}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function getEmail3Html(cart: AbandonedCart, recoveryUrl: string, discountCode: string, siteUrl: string): string {
  const discountedTotal = (cart.cart_total * 0.85).toFixed(2);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <title>15% reinforcement—your final call | Line of Judah</title>
    </head>
    <body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAFAF9;">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #E7E5E4;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:2px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p>
                  <div style="width:40px;height:2px;background:#F59E0B;margin:0 auto;"></div>
                </td>
              </tr>
              
              <!-- Hero -->
              <tr>
                <td style="padding:48px 40px 24px;text-align:center;">
                  <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.2em;color:#F59E0B;text-transform:uppercase;">
                    FINAL CALL
                  </p>
                  <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;letter-spacing:0.02em;color:#1C1917;">
                    REINFORCEMENT INCOMING
                  </h1>
                  <p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">
                    This is it. We're giving you 15% off to finish<br/>what you started. After this, the next move is yours.
                  </p>
                </td>
              </tr>
              
              <!-- Discount Code Card -->
              <tr>
                <td style="padding:24px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:2px solid #1C1917;border-radius:8px;overflow:hidden;">
                    <tr>
                      <td style="padding:32px;text-align:center;background:#FAFAF9;">
                        <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.15em;color:#78716C;text-transform:uppercase;">
                          — EXCLUSIVE OFFER —
                        </p>
                        <p style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:28px;font-weight:600;letter-spacing:0.1em;color:#1C1917;">
                          ${discountCode}
                        </p>
                        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:13px;color:#78716C;">
                          15% off · Expires in 24 hours
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Price Comparison -->
              <tr>
                <td style="padding:16px 40px;text-align:center;">
                  <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;color:#A8A29E;text-decoration:line-through;">
                    $${cart.cart_total.toLocaleString()}
                  </p>
                  <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:32px;font-weight:300;color:#1C1917;">
                    $${discountedTotal}
                  </p>
                </td>
              </tr>
              
              <!-- CTA -->
              <tr>
                <td style="padding:24px 40px 48px;text-align:center;">
                  <a href="${recoveryUrl}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:16px 48px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;border-radius:4px;">
                    CLAIM YOUR REINFORCEMENT
                  </a>
                  <p style="margin:16px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#A8A29E;">
                    Offer expires in 24 hours
                  </p>
                </td>
              </tr>
              
              <!-- Brand Quote -->
              <tr>
                <td style="padding:32px 40px;background:#FAFAF9;border-top:1px solid #E7E5E4;">
                  <p style="margin:0;font-size:14px;font-style:italic;color:#78716C;text-align:center;line-height:1.6;">
                    "This isn't just clothing. It's armor."
                  </p>
                </td>
              </tr>
              
              ${getEmailFooter(siteUrl)}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY'); // Optional - emails are stubbed without it
    const siteUrl = Deno.env.get('SITE_URL') || 'https://lineofjudah.com';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const results = {
      email1Sent: 0,
      email2Sent: 0,
      email3Sent: 0,
      errors: 0,
    };

    // Fetch carts eligible for Email 1 (1 hour after creation, no email sent yet)
    const email1Threshold = new Date(now.getTime() - EMAIL_1_DELAY_HOURS * 60 * 60 * 1000);
    const { data: email1Carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'pending')
      .is('email_1_sent_at', null)
      .lt('created_at', email1Threshold.toISOString());

    for (const cart of email1Carts || []) {
      const recoveryUrl = `${siteUrl}/recover-cart?token=${cart.recovery_token}`;
      const html = getEmail1Html(cart as AbandonedCart, recoveryUrl, siteUrl);
      
      const sent = await sendEmail(
        cart.email,
        "Your armor is waiting | Line of Judah",
        html,
        resendApiKey
      );

      if (sent) {
        await supabase
          .from('abandoned_carts')
          .update({ 
            email_1_sent_at: now.toISOString(),
            status: 'email_1_sent'
          })
          .eq('id', cart.id);
        results.email1Sent++;
      } else {
        results.errors++;
      }
    }

    // Fetch carts eligible for Email 2 (24 hours after creation, email 1 sent)
    const email2Threshold = new Date(now.getTime() - EMAIL_2_DELAY_HOURS * 60 * 60 * 1000);
    const { data: email2Carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'email_1_sent')
      .is('email_2_sent_at', null)
      .lt('created_at', email2Threshold.toISOString());

    for (const cart of email2Carts || []) {
      const recoveryUrl = `${siteUrl}/recover-cart?token=${cart.recovery_token}`;
      const html = getEmail2Html(cart as AbandonedCart, recoveryUrl, siteUrl);
      
      const sent = await sendEmail(
        cart.email,
        "The mission continues | Line of Judah",
        html,
        resendApiKey
      );

      if (sent) {
        await supabase
          .from('abandoned_carts')
          .update({ 
            email_2_sent_at: now.toISOString(),
            status: 'email_2_sent'
          })
          .eq('id', cart.id);
        results.email2Sent++;
      } else {
        results.errors++;
      }
    }

    // Fetch carts eligible for Email 3 (72 hours after creation, email 2 sent)
    const email3Threshold = new Date(now.getTime() - EMAIL_3_DELAY_HOURS * 60 * 60 * 1000);
    const { data: email3Carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'email_2_sent')
      .is('email_3_sent_at', null)
      .lt('created_at', email3Threshold.toISOString());

    for (const cart of email3Carts || []) {
      // Generate discount code for this cart
      const discountCode = generateDiscountCode();
      
      const recoveryUrl = `${siteUrl}/recover-cart?token=${cart.recovery_token}`;
      const html = getEmail3Html(cart as AbandonedCart, recoveryUrl, discountCode, siteUrl);
      
      const sent = await sendEmail(
        cart.email,
        "15% reinforcement—your final call | Line of Judah",
        html,
        resendApiKey
      );

      if (sent) {
        await supabase
          .from('abandoned_carts')
          .update({ 
            email_3_sent_at: now.toISOString(),
            status: 'email_3_sent',
            discount_code: discountCode
          })
          .eq('id', cart.id);
        results.email3Sent++;
      } else {
        results.errors++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Abandoned cart processing complete',
        results,
        note: resendApiKey ? 'Emails sent via Resend' : 'Emails stubbed (RESEND_API_KEY not configured)'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error processing abandoned carts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
