import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const MASTER_TIPS = [
  "To get a website to convert, you must first map your ideal customer's specific pain points and objections — then build the site as a journey that dispels each one, in order, before asking for the click.",
  "A homepage is not a brochure. It is a courtroom. Every section is evidence answering one silent question: 'Why should I trust you with my money?'",
  "Clarity beats cleverness. If a stranger cannot tell what you do, who it is for, and why it matters within five seconds of landing, no headline trick will save the conversion.",
  "The hero section is the only real estate that matters. Spend 80% of your design energy on the first 600 pixels — and write the headline last, once you know the offer cold.",
  "Speed is a feature. Every second of load time is a percentage of trust evaporating before a word has been read.",
  "Social proof works only when it is specific. 'Loved by clients' is noise. A real name, a real quote, and a real outcome is a verdict.",
  "A call-to-action should describe the outcome the visitor is buying, not the action they are performing. 'Get my custom plan' converts. 'Submit' does not.",
  "Friction is invisible to the builder and obvious to the buyer. Cut every form field, every extra click, every required account until what remains is the bare ask.",
  "Design is not decoration. Design is the silent argument that you are worth the price you are charging.",
  "Your website is your second impression. The first is what they heard about you. If the site contradicts the reputation, the reputation loses.",
  "Premium positioning is not a font choice. It is the discipline of removing — removing offerings, removing words, removing visual noise — until only the essential remains.",
  "The best testimonials are not the most flattering. They are the ones that answer the objection your prospect was about to raise.",
  "Mobile is not 'also'. Mobile is the room your customer reads you in. Design the phone first; let the desktop be the encore.",
  "Pricing transparency is a conversion lever. Hidden prices say 'we negotiate based on what you can pay.' That posture loses premium buyers faster than a high number ever could.",
  "Every link off the homepage is a vote against the conversion. Audit your navigation like a bouncer — if it does not earn its spot, it does not get in.",
  "The fastest way to raise prices is to raise the perceived stakes. Show what is at risk if they choose wrong, then position yourself as the safe choice.",
  "Stock photography signals that you are willing to fake the easy things. Imagine what that whispers about the hard things.",
  "Copy is salesmanship in print. If your homepage reads like a wikipedia entry, it is doing PR work, not sales work.",
  "A great case study has three acts: the problem the client could not solve, the specific bet they made on you, and the new reality on the other side. Skip act two and the story does not land.",
  "If your website needs explaining, the website has failed. The page itself must be the explanation.",
];

const X_RULES = `
Write ONE post for X (Twitter):
- 220–280 characters total (hard cap).
- Open with a sharp, declarative sentence (the master tip, distilled).
- One short line referencing the client (by name) as the living example.
- End with the client's website URL on its own line.
- No hashtags. No emojis. No exclamation marks. No numbers, percentages, or statistics.
- Voice: David Ogilvy. Direct. Adult. Unhurried.
`.trim();

const LI_RULES = `
Write ONE post for LinkedIn:
- 700–1300 characters.
- Open with the master tip as a one-line truth (no preamble like "Here's a thought").
- One short paragraph expanding the principle.
- One short paragraph naming the client and what kind of work the site does for them (no metrics, no stats, no numbers, no percentages).
- If a verbatim client quote is provided, weave it in inside quotation marks with attribution. Do not paraphrase.
- End with a single line: the client's website URL.
- No hashtags. No emojis. No bullet lists. No "DM me". No call-to-action begging.
- Voice: David Ogilvy directness, Veepo gravity. Adult. No hype words ("crushing", "incredible", "amazing", "game-changer").
`.trim();

function stripStats(s: string): string {
  // Heuristic guard: redact obvious statistics. Models almost always comply, this is a safety net.
  return s
    .replace(/\b\d{1,3}\s?%/g, "")
    .replace(/\b\d+x\b/gi, "")
    .replace(/\$\d[\d,.]*/g, "")
    .replace(/  +/g, " ");
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": LOVABLE_API_KEY,
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI gateway ${resp.status}: ${t}`);
  }
  const j = await resp.json();
  return (j.choices?.[0]?.message?.content || "").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const forcedId: string | undefined = body?.case_study_id;
    const alsoSend: boolean = body?.send !== false; // default true

    // Pick least-recently-used enabled case study (or forced one)
    let cs: any = null;
    if (forcedId) {
      const { data } = await sb.from("case_studies").select("*").eq("id", forcedId).maybeSingle();
      cs = data;
    } else {
      const { data } = await sb.from("case_studies")
        .select("*")
        .eq("enabled", true)
        .order("last_used_at", { ascending: true, nullsFirst: true })
        .limit(1);
      cs = data?.[0];
    }
    if (!cs) throw new Error("No enabled case study available. Add one in /ops-portal/case-studies.");

    // Pick a master tip not equal to last batch's tip (simple rotation by random)
    const tip = MASTER_TIPS[Math.floor(Math.random() * MASTER_TIPS.length)];

    const quoteLine = cs.quote
      ? `Verbatim client quote (use exactly as written, in quotation marks): "${cs.quote}"${cs.quote_attribution ? ` — ${cs.quote_attribution}` : ""}`
      : `No client quote available — do not invent one.`;

    const sharedContext = `
You are writing a post for Veepo, a premium web development studio (Cochrane, AB).
Voice: David Ogilvy directness + quiet authority. Adult. No marketing fluff.

The master sales/marketing tip (this is the spine of the post — express it in your own words but keep the meaning exact):
"${tip}"

The case study (this is the living example that makes the tip land):
- Client name: ${cs.client_name}
- Field / vertical: ${cs.vertical || "—"}
- Website: ${cs.website_url}
- ${quoteLine}
- ${cs.headline_outcome ? `Plain-English outcome (no numbers): ${cs.headline_outcome}` : "No specific outcome line provided."}

HARD RULES:
- NEVER include statistics, percentages, dollar amounts, or numeric metrics of any kind.
- ALWAYS include the client's website URL exactly: ${cs.website_url}
- Do not invent facts. If you do not know it, do not say it.
- Do not use the words: "amazing", "incredible", "game-changer", "crushed it", "ROI", "leads", "conversions".
`.trim();

    const [xCopyRaw, liCopyRaw] = await Promise.all([
      callAI(sharedContext + "\n\n" + X_RULES, "Write the X post now. Output only the post text, nothing else."),
      callAI(sharedContext + "\n\n" + LI_RULES, "Write the LinkedIn post now. Output only the post text, nothing else."),
    ]);

    const xCopy = stripStats(xCopyRaw);
    const liCopy = stripStats(liCopyRaw);

    // Ensure URL present
    const ensureUrl = (txt: string) =>
      txt.includes(cs.website_url) ? txt : `${txt.trim()}\n\n${cs.website_url}`;

    const batchId = crypto.randomUUID();
    const today = new Date().toISOString().slice(0, 10);

    const rows = [
      {
        batch_id: batchId,
        batch_date: today,
        template_product_id: null,
        case_study_id: cs.id,
        theme_id: null,
        platform: "x",
        copy: ensureUrl(xCopy),
        image_urls: [],
        image_asset_ids: [],
        is_winner: true,
        swap_token: crypto.randomUUID(),
        score: 0,
        score_breakdown: { master_tip: tip, source: "case-study" },
      },
      {
        batch_id: batchId,
        batch_date: today,
        template_product_id: null,
        case_study_id: cs.id,
        theme_id: null,
        platform: "linkedin",
        copy: ensureUrl(liCopy),
        image_urls: [],
        image_asset_ids: [],
        is_winner: true,
        swap_token: crypto.randomUUID(),
        score: 0,
        score_breakdown: { master_tip: tip, source: "case-study" },
      },
    ];

    const { error: insErr } = await sb.from("generated_posts").insert(rows);
    if (insErr) throw insErr;

    await sb.from("case_studies").update({
      use_count: (cs.use_count || 0) + 1,
      last_used_at: new Date().toISOString(),
    }).eq("id", cs.id);

    let emailResult: any = null;
    if (alsoSend) {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/send-daily-post-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ batch_id: batchId }),
      });
      emailResult = await r.json().catch(() => ({ status: r.status }));
    }

    return new Response(JSON.stringify({
      batch_id: batchId,
      case_study: { id: cs.id, client_name: cs.client_name },
      master_tip: tip,
      x_chars: rows[0].copy.length,
      linkedin_chars: rows[1].copy.length,
      email: emailResult,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-case-study-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});