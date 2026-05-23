import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const RECIPIENT = "parker@veepo.ca";
const FROM = "Veepo Pitch <pitch@veepo.ca>";

function buildEmail(opts: {
  product: string;
  theme: string;
  winner: any;
  others: any[];
  swapBase: string;
}) {
  const { product, theme, winner, others, swapBase } = opts;
  const platformLabel: Record<string, string> = { x: "X / Twitter", instagram: "Instagram", linkedin: "LinkedIn" };
  const heroImg = winner.image_urls?.[0] || "";
  const escaped = winner.copy.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");

  const swapLinks = others.map((o) =>
    `<a href="${swapBase}?token=${o.swap_token}" style="color:#4CAF50;text-decoration:underline;">Swap to ${platformLabel[o.platform]} (score ${o.score})</a>`
  ).join(" &nbsp;·&nbsp; ");

  return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
<p style="font-size:13px;color:#666;margin:0 0 4px;">${product} · Theme: <em>${theme}</em></p>
<h2 style="font-size:20px;margin:0 0 16px;">Today's winner: ${platformLabel[winner.platform]} (score ${winner.score})</h2>
${heroImg ? `<img src="${heroImg}" alt="" style="width:100%;max-width:600px;border:1px solid #eee;margin-bottom:16px;">` : ""}
<div style="background:#f7f7f5;border-left:3px solid #4CAF50;padding:16px;font-size:15px;line-height:1.5;white-space:pre-wrap;">${escaped}</div>
<p style="margin-top:20px;font-size:13px;color:#555;">${swapLinks}</p>
<hr style="border:0;border-top:1px solid #eee;margin:24px 0;">
<p style="font-size:11px;color:#999;">Veepo · daily pitch engine</p>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    let batchId: string | undefined = body?.batch_id;

    if (!batchId) {
      const { data: latest } = await sb.from("generated_posts")
        .select("batch_id, batch_date, created_at")
        .order("created_at", { ascending: false }).limit(1);
      if (!latest?.length) throw new Error("No batches found");
      batchId = latest[0].batch_id;
    }

    // Skip if already sent
    const { data: already } = await sb.from("post_send_log").select("id").eq("batch_id", batchId).limit(1);
    if (already?.length) {
      return new Response(JSON.stringify({ skipped: true, batch_id: batchId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: posts } = await sb.from("generated_posts").select("*").eq("batch_id", batchId);
    if (!posts?.length) throw new Error(`No posts for batch ${batchId}`);
    const winner = posts.find((p: any) => p.is_winner) || posts[0];
    const others = posts.filter((p: any) => p.id !== winner.id);

    // Load product + theme labels
    const { data: product } = await sb.from("template_products").select("name").eq("id", winner.template_product_id).maybeSingle();
    const { data: theme } = await sb.from("post_themes").select("hook").eq("id", winner.theme_id).maybeSingle();

    const swapBase = `${SUPABASE_URL}/functions/v1/swap-post-winner`;
    const html = buildEmail({
      product: product?.name || "Template",
      theme: theme?.hook || "—",
      winner, others, swapBase,
    });

    const platformLabel: Record<string, string> = { x: "X", instagram: "IG", linkedin: "LinkedIn" };
    const subject = `[${platformLabel[winner.platform]}] ${winner.copy.split("\n")[0].slice(0, 70)}`;

    const resendResp = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [RECIPIENT], subject, html }),
    });
    const resendJson = await resendResp.json();
    if (!resendResp.ok) throw new Error(`Resend ${resendResp.status}: ${JSON.stringify(resendJson)}`);

    await sb.from("post_send_log").insert({
      batch_id: batchId,
      winner_post_id: winner.id,
      recipient_email: RECIPIENT,
      resend_id: resendJson.id,
      status: "sent",
    });

    return new Response(JSON.stringify({ sent: true, batch_id: batchId, resend_id: resendJson.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-daily-post-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});