import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

type Variant = { platform: "x" | "instagram" | "linkedin"; copy: string };

function scoreVariant(v: Variant): { score: number; breakdown: Record<string, number> } {
  const c = v.copy;
  const firstWords = c.split(/\s+/).slice(0, 10).join(" ");
  const hasNumber = /\d/.test(firstWords) ? 25 : 0;
  const hasPain = /(lose|losing|cost|stuck|broken|slow|old|wasting|missing)/i.test(firstWords) ? 20 : 0;
  const hasCTA = /(dm|comment|reply|link|book|click|message)/i.test(c) ? 15 : 0;
  const lengthFit =
    v.platform === "x" ? (c.length <= 280 ? 25 : Math.max(0, 25 - (c.length - 280) / 4))
    : v.platform === "instagram" ? (c.length >= 200 && c.length <= 1500 ? 25 : 10)
    : (c.length >= 400 && c.length <= 2500 ? 25 : 10);
  const hookStrength = c.startsWith('"') || /^[A-Z][a-z]+ \w+/.test(c) ? 15 : 5;
  const score = hasNumber + hasPain + hasCTA + lengthFit + hookStrength;
  return { score, breakdown: { hasNumber, hasPain, hasCTA, lengthFit, hookStrength } };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const overrideId: string | undefined = body?.template_product_id;

    // Pick product (override, else random across enabled)
    const { data: products } = await sb.from("template_products").select("*").eq("enabled", true);
    if (!products?.length) throw new Error("No enabled template_products");
    const product = overrideId
      ? (products.find((p: any) => p.id === overrideId) || products[0])
      : products[Math.floor(Math.random() * products.length)];

    // Pick theme (least recently used, enabled, optionally matching product)
    const { data: themes } = await sb.from("post_themes").select("*")
      .eq("enabled", true)
      .or(`template_product_id.is.null,template_product_id.eq.${product.id}`)
      .order("last_used_at", { ascending: true, nullsFirst: true })
      .limit(1);
    if (!themes?.length) throw new Error("No enabled post_themes");
    const theme = themes[0];

    // Pick 6 assets (2 per variant)
    const { data: assets } = await sb.from("template_assets").select("*")
      .eq("do_not_use", false)
      .or(`template_product_id.is.null,template_product_id.eq.${product.id}`)
      .order("use_count", { ascending: true })
      .limit(20);
    const pickedAssets = (assets || []).sort(() => Math.random() - 0.5).slice(0, 6);

    // Call Lovable AI
    const systemPrompt = `You are Alex Hormozi writing high-converting B2B social posts for a web-design service called Veepo.
Product: ${product.name} (${product.vertical}) — CAD $${product.price_one_time} once + $${product.price_monthly}/mo.
Offer: Live in 7 days. Pay $0 until you love it. If no paid client books in 30 days, full refund + keep the site.
Target: ${product.ideal_customer || "owner-operators $80K-$400K/yr"}.
Avoid: ${product.poison_list || "agencies, MLM, cheapness shoppers"}.

Theme hook: "${theme.hook}" (category: ${theme.category})

Write 3 platform-native variants. NO emojis except sparingly in IG. Hard numbers. Specific. Punchy. No corporate fluff.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Write 3 variants of a post about: ${theme.hook}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_posts",
            description: "Emit the 3 platform variants",
            parameters: {
              type: "object",
              properties: {
                x: { type: "string", description: "Single tweet, ≤280 chars, punchy hook" },
                instagram: { type: "string", description: "IG caption, 200-1500 chars, hook + value + CTA" },
                linkedin: { type: "string", description: "LinkedIn story-format post, 400-2500 chars" },
              },
              required: ["x", "instagram", "linkedin"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "emit_posts" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      throw new Error(`AI gateway ${aiResp.status}: ${t}`);
    }
    const aiData = await aiResp.json();
    const args = JSON.parse(aiData.choices[0].message.tool_calls[0].function.arguments);

    const batchId = crypto.randomUUID();
    const variants: Variant[] = [
      { platform: "x", copy: args.x },
      { platform: "instagram", copy: args.instagram },
      { platform: "linkedin", copy: args.linkedin },
    ];

    // Score & pick winner
    const scored = variants.map((v) => ({ v, ...scoreVariant(v) }));
    const winnerIdx = scored.reduce((best, s, i, arr) => (s.score > arr[best].score ? i : best), 0);

    // Assign 2 assets per variant
    const rows = scored.map((s, i) => {
      const slice = pickedAssets.slice(i * 2, i * 2 + 2);
      return {
        batch_id: batchId,
        template_product_id: product.id,
        theme_id: theme.id,
        platform: s.v.platform,
        copy: s.v.copy,
        image_urls: slice.map((a) => a.public_url),
        image_asset_ids: slice.map((a) => a.id),
        is_winner: i === winnerIdx,
        score: s.score,
        score_breakdown: s.breakdown,
      };
    });

    const { error: insErr } = await sb.from("generated_posts").insert(rows);
    if (insErr) throw insErr;

    // Bump usage counters
    await sb.from("post_themes").update({
      use_count: (theme.use_count || 0) + 1,
      last_used_at: new Date().toISOString(),
    }).eq("id", theme.id);

    for (const a of pickedAssets) {
      await sb.from("template_assets").update({ use_count: (a.use_count || 0) + 1 }).eq("id", a.id);
    }

    return new Response(JSON.stringify({ batch_id: batchId, product: product.name, theme: theme.hook, winner: variants[winnerIdx].platform }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-daily-posts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});