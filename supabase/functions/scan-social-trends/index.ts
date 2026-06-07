import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

async function firecrawlSearch(query: string, limit = 10) {
  const r = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit, tbs: "qdr:w", scrapeOptions: { formats: ["markdown"] } }),
  });
  if (!r.ok) throw new Error(`search ${r.status}: ${await r.text()}`);
  return await r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const { data: products } = await sb.from("template_products").select("vertical, ideal_customer").eq("enabled", true);
    const verticals = Array.from(new Set((products || []).map((p: any) => p.vertical).filter(Boolean)));
    if (!verticals.length) verticals.push("web design for owner operators");

    const queries = [
      ...verticals.flatMap((v) => [
        `top viral LinkedIn posts ${v} this week`,
        `best performing X tweets ${v}`,
      ]),
    ].slice(0, 6);

    const corpus: { text: string; url: string }[] = [];
    for (const q of queries) {
      try {
        const res = await firecrawlSearch(q, 5);
        const items = res?.data?.web || res?.web || res?.data || [];
        for (const it of items) {
          const text = it.markdown || it.description || it.title || "";
          if (text && text.length > 80) corpus.push({ text: text.slice(0, 1200), url: it.url || "" });
        }
      } catch (e) {
        console.error("search err", q, e);
      }
    }

    if (!corpus.length) {
      return new Response(JSON.stringify({ message: "No trend data found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ask AI to extract hook patterns
    const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You analyze social media content. Extract 6-10 distinct, currently-trending hook patterns that drove high engagement on LinkedIn or X for service-business / web-design / photographer niches. Each pattern is a reusable template, not a copy. Include a concrete example line." },
          { role: "user", content: corpus.map((c, i) => `[${i}] ${c.text}`).join("\n\n---\n\n") },
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_trends",
            parameters: {
              type: "object",
              properties: {
                trends: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      platform: { type: "string", enum: ["linkedin", "x", "both"] },
                      niche: { type: "string" },
                      hook_pattern: { type: "string", description: "Reusable template, e.g. 'I used to believe X. Then [moment]. Now I believe Y.'" },
                      example_copy: { type: "string" },
                      notes: { type: "string" },
                    },
                    required: ["platform", "hook_pattern", "example_copy"],
                  },
                },
              },
              required: ["trends"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "emit_trends" } },
      }),
    });
    if (!ai.ok) throw new Error(`ai ${ai.status}: ${await ai.text()}`);
    const aiJson = await ai.json();
    const args = JSON.parse(aiJson.choices[0].message.tool_calls[0].function.arguments);

    const today = new Date().toISOString().slice(0, 10);
    const monday = new Date();
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    const week = monday.toISOString().slice(0, 10);

    const rows = (args.trends || []).map((t: any) => ({
      week_of: week,
      platform: t.platform,
      niche: t.niche || verticals[0],
      hook_pattern: t.hook_pattern,
      example_copy: t.example_copy,
      notes: t.notes || null,
    }));
    if (rows.length) await sb.from("social_trends").insert(rows);

    return new Response(JSON.stringify({ week, inserted: rows.length, today }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("scan-social-trends error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});