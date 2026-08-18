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
const SITE_URL = "https://www.localcochranewebdesign.com";

// ── Brand knowledge, researched from the live site ──────────────────────────
const BRAND_CONTEXT = `
BUSINESS: Local Cochrane Web Design (operated by VeePo Web Services, run by Parker).
WEBSITE: ${SITE_URL}
CONTACT: parker@veepo.ca — a written proposal within one business day, no obligation.

POSITIONING (use their own language, do not invent new claims):
- Conversion-first, mobile-first websites built to rank locally and turn visitors into enquiries.
- Building for Cochrane since 2013.
- Honest, anti-hype posture: "We can't promise a ranking, and anyone who does is selling you something."
- Ownership in writing: your domain, your content, your site. No hostage clauses, no mystery logins, no rebuild ransom.
- Mobile load-time target under a second and a half.

SERVICES:
- Custom web design — designed from your real customers, offer and market.
- Website redesign — every URL mapped and redirected so earned rankings survive the move.
- Local SEO — Google Business Profile, reviews, citations, pages built around real local intent.
- AI search optimization — content ChatGPT, Perplexity and Google AI Overviews can find and cite.
- Landing pages & CRO — message-matched pages, frictionless forms, judged on qualified enquiries.
- Website care & hosting — hosting, monitoring, updates, backups, small improvements.

AREAS SERVED: Cochrane and its neighbourhoods (Sunset Ridge, Heritage Hills, Riversong,
Gleneagles, Fireside, Glenbow, Heartland, Cochrane Heights, West Terrace), plus Bearspaw,
Springbank, Elbow Valley, Rocky View County, Chestermere, Calgary NW/SW, Canmore, Banff,
the Bow Valley and Central Alberta. Foothills, the Bow River, the big valley, ranch country.

REAL CLIENT SITES (name only ones that genuinely fit the angle, never invent results):
- Royal Mechanical — trades & mechanical, Cochrane
- Cochrane Master Painters — painting & trades, Cochrane
- Flex Services — home services, Cochrane
- Street Smart Detailing — automotive detailing, Calgary
- Fly4MEdia — aerial cinematography, Calgary
- Lashes by Halle — beauty studio, Calgary NW
- Hickory & Rose — luxury wedding planning
- Karl Salingua Music — music & entertainment
- Haven Creek Renovations — home renovations

VERBATIM GOOGLE REVIEWS (quote EXACTLY or not at all — never paraphrase, never invent):
- Toby Rennick: "Veepo turned my vision of a website into a reality! Parker was personable, insightful and all around easy to work with."
- Calem Wood: "The website is smooth and sharp. All the essentials are met and more!"
- Rick Bergh: "Creative, efficient and affordable. You won't be disappointed with this innovative company. They over delivered."
- Caden Steinke: "VeePo did an awesome job creating my website."
`.trim();

const FB_RULES = `
Write ONE Facebook post for a local Cochrane, Alberta audience of business owners.
Facebook rewards posts that are readable on their own — the link is the last line, never the hook.

STRUCTURE (in order, no labels in the output, one blank line between each part):
1. HOOK — one plain, contrarian or unusually specific line about local business websites.
2. THE SCENE — two to four short lines grounding it in real Cochrane-area life: someone on
   their phone in a parking lot, a quote request that never arrived, a Sunset Ridge homeowner
   searching at nine at night, a contractor's truck on a gravel road with one bar of signal.
3. THE LESSON — the principle, said plainly and usefully enough that a reader could act on it
   themselves without hiring anybody.
4. PROOF — optional, only when it genuinely fits: name one real client site, or drop one
   verbatim Google review inside quotation marks with the reviewer's name. Otherwise skip it.
5. SOFT CTA — one low-pressure line, then the URL on its own final line.
   Example closing line: "If you want a second opinion on yours, a written proposal takes a business day."

HARD CONSTRAINTS:
- 400 to 900 characters total.
- Short paragraphs. Blank line between each. No bullet lists, no numbered lists.
- No hashtags. No emojis. No exclamation marks outside a verbatim quote.
- No "DM me", "drop a comment below", "let me know your thoughts", "tag a friend", "link in bio".
- No statistics, percentages, dollar amounts, rankings, "X+ clients", "doubled", "boosted",
  "ROI", "leads", "conversions". Digits only appear inside a verbatim quote or the URL.
- Maximum ONE em-dash in the entire post.
- Forbidden phrases: "amazing", "incredible", "game-changer", "crushing it", "thought leader",
  "in today's market", "the truth is", "here's the thing", "let's dive in", "world-class",
  "next-level", "unlock", "elevate", "leverage".
- Never promise a ranking. Never invent a client, a quote, or an outcome.
- Voice: David Ogilvy directness with small-town Alberta plainness. Adult. Unhurried. No hype.

The post must end with the URL on its own line: ${SITE_URL}

SELF-CHECK before returning (silent):
- Would a Cochrane contractor read past line one? If not, rewrite the hook.
- Are there ANY digits in the body outside a quote or the URL? If yes, remove them.
- Is it between 400 and 900 characters? If not, fix it.
`.trim();

const MIN_CHARS = 400;
const MAX_CHARS = 900;

const WEAK_HOOKS = [
  /^in today'?s\b/i, /^let'?s (talk|dive)/i, /^here'?s why\b/i,
  /^ever wonder/i, /^did you know\b/i, /^imagine if\b/i, /^as a business owner\b/i,
];

function hasWeakHook(s: string): boolean {
  const first = s.trim().split(/\n/)[0] || "";
  return WEAK_HOOKS.some((rx) => rx.test(first));
}

// Statistic-shaped phrasing check. URLs and quoted text are stripped first.
function hasStats(s: string): boolean {
  const cleaned = s
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\b[\w-]+\.(com|ca|info|clothing|co|io|net|org|xyz)\b/gi, "")
    .replace(/"[^"]*"/g, "");
  if (/\b\d{2,}\b/.test(cleaned)) return true;
  if (/\b\d+\s?(%|percent|x)\b/i.test(cleaned)) return true;
  if (/\$\s?\d/.test(cleaned)) return true;
  if (/\b(increased|boosted|grew|doubled|tripled|roi|conversions|leads)\b/i.test(cleaned)) return true;
  return false;
}

function scrub(s: string): string {
  return s
    .replace(/#[A-Za-z0-9_]+/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\b\d{1,3}\s?%/g, "")
    .replace(/\$\d[\d,.]*/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function enforceUrl(txt: string): string {
  let t = txt.replace(/[\s.,;:!?]+$/g, "").trim();
  const parts = t.split(SITE_URL);
  if (parts.length === 1) return `${t}\n\n${SITE_URL}`;
  t = parts.join(" ").replace(/\s{2,}/g, " ").replace(/[\s.,;:!?]+$/g, "").trim();
  return `${t}\n\n${SITE_URL}`;
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": LOVABLE_API_KEY },
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

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function emailHtml(copy: string, angle: string, category: string): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f6f4;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e4e4e0;padding:28px;">
    <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a8a84;">Local Cochrane Web Design · Facebook</div>
    <h1 style="font-size:19px;margin:10px 0 4px;font-weight:600;">${esc(angle)}</h1>
    <div style="font-size:12px;color:#8a8a84;margin-bottom:20px;">${esc(category)} · ${copy.length} characters</div>
    <pre style="white-space:pre-wrap;font-family:inherit;font-size:15px;line-height:1.6;margin:0;padding:18px;background:#fafaf8;border:1px solid #ececE8;">${esc(copy)}</pre>
    <p style="font-size:12px;color:#8a8a84;margin-top:22px;">Copy, paste, post. No image needed.</p>
  </div>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const forcedId: string | undefined = body?.angle_id;
    const alsoSend: boolean = body?.send !== false;

    let angle: any = null;
    if (forcedId) {
      const { data } = await sb.from("cochrane_angles").select("*").eq("id", forcedId).maybeSingle();
      angle = data;
    } else {
      const { data } = await sb.from("cochrane_angles").select("*")
        .eq("enabled", true)
        .order("last_used_at", { ascending: true, nullsFirst: true })
        .limit(1);
      angle = data?.[0];
    }
    if (!angle) throw new Error("No enabled angle available. Add one on the Cochrane page.");

    const { data: recent } = await sb.from("generated_posts")
      .select("copy")
      .eq("platform", "facebook")
      .order("created_at", { ascending: false })
      .limit(5);

    const recentBlock = recent?.length
      ? `\n\nRECENT POSTS (do not repeat these openings, scenes, or phrasing):\n${recent.map((r: any, i: number) => `${i + 1}. ${String(r.copy).slice(0, 200)}`).join("\n")}`
      : "";

    const system = `${BRAND_CONTEXT}

TODAY'S ANGLE (this is the spine of the post — express it in your own words, keep the meaning):
"${angle.angle}" (category: ${angle.category})${recentBlock}

${FB_RULES}`;

    const userPrompt = "Write the Facebook post now. Output only the post text, nothing else.";

    let out = await callAI(system, userPrompt);

    if (hasStats(out)) {
      out = await callAI(system, `${userPrompt}\n\nIMPORTANT: your previous draft contained numbers or statistics. Rewrite with ZERO digits outside a verbatim quote or the URL.`);
    }
    if (hasWeakHook(out)) {
      out = await callAI(system, `${userPrompt}\n\nIMPORTANT: your previous hook opened with a cliché. Rewrite the first line as a plain, contrarian, declarative sentence. No preamble.`);
    }
    const paragraphs = (t: string) => t.split(/\n\s*\n/).filter((x) => x.trim()).length;
    if (paragraphs(out) < 4) {
      out = await callAI(system, `${userPrompt}\n\nIMPORTANT: your previous draft was written as one block of text. Facebook needs air. Rewrite it as four or five short paragraphs separated by a blank line, following the structure exactly: hook, scene, lesson, optional proof on its own paragraph, then the soft close and the URL on its own final line.`);
    }

    const provisional = scrub(out);
    if (provisional.length < MIN_CHARS || provisional.length > MAX_CHARS) {
      out = await callAI(system, `${userPrompt}\n\nIMPORTANT: your previous draft was ${provisional.length} characters. It must land between ${MIN_CHARS} and ${MAX_CHARS}. ${provisional.length > MAX_CHARS ? "Cut adjectives and the weakest paragraph first." : "Add one more concrete line to the scene."}`);
    }

    const copy = enforceUrl(scrub(out));

    const batchId = crypto.randomUUID();
    const today = new Date().toISOString().slice(0, 10);

    const { data: inserted, error: insErr } = await sb.from("generated_posts").insert({
      batch_id: batchId,
      batch_date: today,
      template_product_id: null,
      case_study_id: null,
      theme_id: null,
      platform: "facebook",
      copy,
      image_urls: [],
      image_asset_ids: [],
      is_winner: true,
      swap_token: crypto.randomUUID(),
      score: 0,
      score_breakdown: {
        source: "cochrane-facebook",
        angle: angle.angle,
        category: angle.category,
        angle_id: angle.id,
        chars: copy.length,
        within_range: copy.length >= MIN_CHARS && copy.length <= MAX_CHARS + 120,
      },
    }).select("id").single();
    if (insErr) throw insErr;

    await sb.from("cochrane_angles").update({
      use_count: (angle.use_count || 0) + 1,
      last_used_at: new Date().toISOString(),
    }).eq("id", angle.id);

    let email: any = null;
    if (alsoSend) {
      const subject = `Facebook · Local Cochrane Web Design · ${angle.category}`;
      const resendResp = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: FROM,
          to: [RECIPIENT],
          subject,
          html: emailHtml(copy, angle.angle, angle.category),
        }),
      });
      const resendJson = await resendResp.json().catch(() => ({}));
      if (!resendResp.ok) {
        console.error(`Resend ${resendResp.status}:`, JSON.stringify(resendJson));
      }
      await sb.from("post_send_log").insert({
        batch_id: batchId,
        winner_post_id: inserted.id,
        recipient_email: RECIPIENT,
        platform: "facebook",
        status: resendResp.ok ? "sent" : "failed",
        error: resendResp.ok ? null : `Resend ${resendResp.status}: ${JSON.stringify(resendJson)}`,
        resend_id: resendResp.ok ? resendJson.id : null,
      });
      email = { sent: resendResp.ok, status: resendResp.status, id: resendJson?.id };
    }

    return new Response(JSON.stringify({
      batch_id: batchId,
      angle: { id: angle.id, angle: angle.angle, category: angle.category },
      chars: copy.length,
      copy,
      email,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-cochrane-facebook-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
