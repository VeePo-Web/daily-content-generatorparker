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
  clientName?: string | null;
  websiteUrl?: string | null;
  winner: any;
  others: any[];
  swapBase: string;
}) {
  const { product, theme, clientName, websiteUrl, winner, others, swapBase } = opts;
  const platformLabel: Record<string, string> = { x: "X / Twitter", instagram: "Instagram", linkedin: "LinkedIn" };
  const escaped = (winner.copy || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");
  const imgs: string[] = winner.image_urls || [];
  const total = imgs.length;
  const hasImgs = total > 0;

  const imgBlocks = imgs.map((url, i) => {
    const n = String(i + 1).padStart(2, "0");
    const t = String(total).padStart(2, "0");
    return `<div style="margin-bottom:20px;">
      <div style="font-size:11px;color:#888;letter-spacing:1px;margin-bottom:6px;font-family:monospace;">${n} / ${t}</div>
      <img src="${url}" alt="" style="width:100%;max-width:600px;display:block;border:1px solid #eee;">
      <div style="margin-top:6px;">
        <a href="${url}" download style="color:#4CAF50;font-size:12px;text-decoration:underline;">Download image ${n}</a>
      </div>
    </div>`;
  }).join("");

  const allUrls = imgs.map((u, i) => `${String(i + 1).padStart(2, "0")}. ${u}`).join("\n");

  const swapLinks = others.map((o) =>
    `<a href="${swapBase}?token=${o.swap_token}" style="color:#4CAF50;text-decoration:underline;">Swap to ${platformLabel[o.platform]} (score ${o.score})</a>`
  ).join(" &nbsp;·&nbsp; ");

  const isCaseStudy = !!clientName;
  const headerLine = isCaseStudy
    ? `Case study · <strong>${clientName}</strong>${websiteUrl ? ` · <a href="${websiteUrl}" style="color:#4CAF50;">${websiteUrl.replace(/^https?:\/\//,'')}</a>` : ""}`
    : `${product} · Theme: <em>${theme}</em>`;
  const titleLine = isCaseStudy
    ? `Today's post · ${platformLabel[winner.platform]}`
    : `Today's post · ${platformLabel[winner.platform]} (score ${winner.score})`;

  return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
<p style="font-size:13px;color:#666;margin:0 0 4px;">${headerLine}</p>
<h2 style="font-size:20px;margin:0 0 16px;">${titleLine}</h2>

<div style="background:#f7f7f5;border-left:3px solid #4CAF50;padding:16px;font-size:15px;line-height:1.55;white-space:pre-wrap;margin-bottom:24px;">${escaped}</div>

${hasImgs ? `<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#444;margin:0 0 12px;">${total} template screenshots — tap & hold (mobile) or right-click to save</h3>
${imgBlocks}
<hr style="border:0;border-top:1px solid #eee;margin:24px 0;">
<p style="font-size:12px;color:#666;margin:0 0 6px;"><strong>All image URLs:</strong></p>
<pre style="font-size:11px;color:#555;background:#fafaf8;padding:10px;border:1px solid #eee;white-space:pre-wrap;word-break:break-all;">${allUrls}</pre>` : ""}

${swapLinks ? `<p style="margin-top:20px;font-size:13px;color:#555;">${swapLinks}</p>` : ""}
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
    const productId: string | undefined = body?.template_product_id;
    const onlyPlatform: string | undefined = body?.platform; // "x" | "linkedin"

    if (!batchId) {
      let q = sb.from("generated_posts")
        .select("batch_id, batch_date, created_at, template_product_id")
        .order("created_at", { ascending: false }).limit(1);
      if (productId) q = q.eq("template_product_id", productId);
      const { data: latest } = await q;
      if (!latest?.length) throw new Error("No batches found");
      batchId = latest[0].batch_id;
    }

    const { data: posts } = await sb.from("generated_posts").select("*").eq("batch_id", batchId);
    if (!posts?.length) throw new Error(`No posts for batch ${batchId}`);

    // Load product + theme + case study (whichever applies)
    const firstPost = posts[0];
    const { data: product } = firstPost.template_product_id
      ? await sb.from("template_products").select("name").eq("id", firstPost.template_product_id).maybeSingle()
      : { data: null } as any;
    const { data: theme } = firstPost.theme_id
      ? await sb.from("post_themes").select("hook").eq("id", firstPost.theme_id).maybeSingle()
      : { data: null } as any;
    const { data: caseStudy } = firstPost.case_study_id
      ? await sb.from("case_studies").select("client_name, website_url").eq("id", firstPost.case_study_id).maybeSingle()
      : { data: null } as any;
    const swapBase = `${SUPABASE_URL}/functions/v1/swap-post-winner`;
    const platformLabel: Record<string, string> = { x: "X", instagram: "IG", linkedin: "LinkedIn" };

    const targets = onlyPlatform
      ? posts.filter((p: any) => p.platform === onlyPlatform)
      : ["x", "linkedin"].flatMap((pl) => posts.filter((p: any) => p.platform === pl));

    if (!targets.length) throw new Error(`No posts to send for batch ${batchId}${onlyPlatform ? ` platform ${onlyPlatform}` : ""}`);

    // Dedupe: skip platforms already sent for this batch
    const { data: alreadyRows } = await sb.from("post_send_log")
      .select("platform").eq("batch_id", batchId);
    const alreadyPlatforms = new Set((alreadyRows || []).map((r: any) => r.platform));

    const results: any[] = [];
    for (const winner of targets) {
      if (alreadyPlatforms.has(winner.platform)) {
        results.push({ platform: winner.platform, skipped: true });
        continue;
      }
      const others = posts.filter((p: any) => p.id !== winner.id);
      const html = buildEmail({
        product: product?.name || "Template",
        theme: theme?.hook || "—",
        clientName: caseStudy?.client_name || null,
        websiteUrl: caseStudy?.website_url || null,
        winner, others, swapBase,
      });
      const firstLine = (winner.copy || "").split("\n")[0].trim();
      const subjectClient = caseStudy?.client_name ? ` | ${caseStudy.client_name}` : "";
      const subject = `[${platformLabel[winner.platform]}${subjectClient}] ${firstLine.slice(0, 80)}`;

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
      if (!resendResp.ok) {
        await sb.from("post_send_log").insert({
          batch_id: batchId,
          winner_post_id: winner.id,
          platform: winner.platform,
          recipient_email: RECIPIENT,
          status: "error",
          error: `Resend ${resendResp.status}: ${JSON.stringify(resendJson)}`,
        });
        results.push({ platform: winner.platform, error: resendJson });
        continue;
      }
      await sb.from("post_send_log").insert({
        batch_id: batchId,
        winner_post_id: winner.id,
        platform: winner.platform,
        recipient_email: RECIPIENT,
        resend_id: resendJson.id,
        status: "sent",
      });
      results.push({ platform: winner.platform, sent: true, resend_id: resendJson.id });
    }

    return new Response(JSON.stringify({ batch_id: batchId, results }), {
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