import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

type Variant = { platform: "x" | "linkedin"; copy: string };

function scoreVariant(v: Variant): { score: number; breakdown: Record<string, number> } {
  const c = v.copy;
  const firstWords = c.split(/\s+/).slice(0, 10).join(" ");
  const hasNumber = /\d/.test(firstWords) ? 25 : 0;
  const hasPain = /(lose|losing|cost|stuck|broken|slow|old|wasting|missing)/i.test(firstWords) ? 20 : 0;
  const hasCTA = /(dm|comment|reply|link|book|click|message)/i.test(c) ? 15 : 0;
  const lengthFit =
    v.platform === "x" ? (c.length <= 280 ? 25 : Math.max(0, 25 - (c.length - 280) / 4))
    : (c.length >= 600 && c.length <= 1800 ? 25 : 10);
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

    // Learning signals: top-performing past posts and current weekly trends
    const { data: topPosts } = await sb
      .from("generated_posts")
      .select("platform, copy, latest_engagement_rate")
      .not("latest_engagement_rate", "is", null)
      .order("latest_engagement_rate", { ascending: false })
      .limit(5);

    const weekMonday = new Date();
    weekMonday.setUTCDate(weekMonday.getUTCDate() - ((weekMonday.getUTCDay() + 6) % 7));
    const { data: trends } = await sb
      .from("social_trends")
      .select("platform, hook_pattern, example_copy")
      .gte("week_of", weekMonday.toISOString().slice(0, 10))
      .limit(8);

    const learningBlock = [
      topPosts?.length
        ? `YOUR TOP PERFORMERS (learn the pattern, do NOT copy):\n${topPosts.map((p: any, i: number) => `${i + 1}. [${p.platform} · ${p.latest_engagement_rate} engagements] ${String(p.copy).slice(0, 240)}`).join("\n")}`
        : "",
      trends?.length
        ? `TRENDING HOOK PATTERNS THIS WEEK (use a similar shape):\n${trends.map((t: any, i: number) => `${i + 1}. (${t.platform}) ${t.hook_pattern}${t.example_copy ? ` — e.g. "${String(t.example_copy).slice(0, 160)}"` : ""}`).join("\n")}`
        : "",
    ].filter(Boolean).join("\n\n");

    // Pick template-screenshot assets ONLY (no lifestyle/scene/portrait).
    // 7 per variant × 2 variants = 14 picks. Pool is small so we shuffle then
    // top up by repeating least-used items to always hit 14.
    const PER_VARIANT = 7;
    const NEEDED = PER_VARIANT * 2;
    const TEMPLATE_TYPES = ["mockup", "case-study", "gallery"];
    const { data: assets } = await sb.from("template_assets").select("*")
      .eq("do_not_use", false)
      .eq("template_product_id", product.id)
      .in("asset_type", TEMPLATE_TYPES)
      .order("use_count", { ascending: true })
      .limit(50);
    const pool = (assets || []);
    if (!pool.length) throw new Error(`No template assets for product ${product.name}`);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const pickedAssets: any[] = [];
    while (pickedAssets.length < NEEDED) {
      pickedAssets.push(shuffled[pickedAssets.length % shuffled.length]);
    }

    // Russell Brunson voice — Hook → Story → Offer, Epiphany Bridge.
    const systemPrompt = `You are Russell Brunson writing daily story-driven social posts for Veepo.
Frameworks: Hook → Story → Offer. Epiphany Bridge. "Who Not How."
Voice: conversational, first-person, story-led, one clear epiphany per post, soft CTA.
Banned: emojis, hashtags, "game-changer", "unlock", "leverage", "elevate", "in today's world", em-dashes used as drama.

Product: ${product.name} (${product.vertical}) — CAD $${product.price_one_time} once + $${product.price_monthly}/mo.
Offer: Live in 7 days. $0 until you love it. No paid client booked in 30 days → full refund + you keep the site.
Ideal customer: ${product.ideal_customer || "owner-operators $80K–$400K/yr"}.
Avoid attracting: ${product.poison_list || "agencies, MLM, cheapness shoppers"}.

Today's story seed: "${theme.hook}" (category: ${theme.category})

${learningBlock ? learningBlock + "\n\n" : ""}
Write 2 variants:

X (≤280 chars): single curiosity hook + one-line story tease + soft CTA ("reply 'site'" or "DM 'site'"). One idea. No thread.

LinkedIn (600–1800 chars, 4–7 short paragraphs, blank line between each):
  1. HOOK — pattern interrupt that names a false belief the reader holds.
  2. BACKSTORY — "I used to think… until…" personal frame.
  3. WALL — the specific moment it broke (one scene, one detail).
  4. EPIPHANY — the new belief, said plainly.
  5. PROOF — one concrete number, name, or before/after.
  6. OFFER — the 7-day / $0-until-you-love-it pitch in plain English.
  7. CTA — "DM 'site' and I'll send the 90-second walkthrough."`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Write 2 variants (X + LinkedIn) of a post about: ${theme.hook}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_posts",
            description: "Emit the 2 platform variants",
            parameters: {
              type: "object",
              properties: {
                x: { type: "string", description: "Single tweet, ≤280 chars, punchy hook" },
                linkedin: { type: "string", description: "LinkedIn story post, 600-1800 chars, 3-5 short paragraphs" },
              },
              required: ["x", "linkedin"],
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
      { platform: "linkedin", copy: args.linkedin },
    ];

    // Score both (both are winners — one email per platform)
    const scored = variants.map((v) => ({ v, ...scoreVariant(v) }));

    // Assign 3 assets per variant
    const rows = scored.map((s, i) => {
      const slice = pickedAssets.slice(i * 3, i * 3 + 3);
      return {
        batch_id: batchId,
        template_product_id: product.id,
        theme_id: theme.id,
        platform: s.v.platform,
        copy: s.v.copy,
        image_urls: slice.map((a) => a.public_url),
        image_asset_ids: slice.map((a) => a.id),
        is_winner: true,
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

    return new Response(JSON.stringify({ batch_id: batchId, product: product.name, theme: theme.hook, platforms: variants.map(v => v.platform) }), {
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