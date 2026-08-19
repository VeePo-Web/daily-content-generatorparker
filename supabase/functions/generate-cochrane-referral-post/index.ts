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

const MIN_CHARS = 500;
const MAX_CHARS = 1000;

const BRAND_CONTEXT = `
BUSINESS: Local Cochrane Web Design (operated by VeePo Web Services, run by Parker).
WEBSITE: ${SITE_URL}
CONTACT: parker@veepo.ca — a written proposal within one business day, no obligation.

POSITIONING (use their own language, never invent new claims):
- Conversion-first, mobile-first websites for Cochrane-area businesses. Building for Cochrane since 2013.
- Anti-hype: "We can't promise a ranking, and anyone who does is selling you something."
- Ownership in writing: your domain, your content, your site. No hostage clauses, no rebuild ransom.

THE REFERRAL OFFER (this is the whole campaign — state it plainly, never dress it up):
- Refer someone to Local Cochrane Web Design.
- When that person buys a website over $2,500, the person who referred them gets $300, sent by e-transfer.
- Paid on purchase, not on enquiry. No form, no tracking code, no selling required.
- The referred person owes nothing and commits to nothing: a written proposal within one business day.
- The referral ask is just a name and an email, or forwarding the link.

WHO TO POINT AT: trades and contractors, realtors, salons and studios, renovation companies,
coaches and consultants, churches and nonprofits, new shops in Cochrane, Bearspaw, Springbank,
Sunset Ridge, Heritage Hills, Riversong, Gleneagles, Fireside, Glenbow, Heartland, Rocky View,
Calgary NW, Canmore and the Bow Valley.
`.trim();

const RULES = `
Write ONE Facebook post for a local Cochrane, Alberta audience.

The reader is NOT the buyer. The reader is somebody who KNOWS a business owner who needs a website.
Your job is to make it easy, safe and slightly rewarding for them to make one introduction.

STRUCTURE (in order, no labels in the output, one blank line between each part):
1. HOOK — one plain, specific, declarative line. It must NEVER open with money or the dollar figure.
2. THE SCENE — two to four short lines of a real Cochrane situation where somebody got asked
   "do you know a good website person?" — a job site, a coffee shop on a Tuesday, a chamber
   event, a text message from a friend who just opened a shop.
3. PROOF — the supplied Google review, quoted EXACTLY inside quotation marks, with the reviewer's
   name attached. Do not paraphrase it, do not shorten it, do not change a word.
4. THE OFFER — plainly: refer someone, and when they buy a website over $2,500 the person who
   referred them gets $300 by e-transfer. Add the risk reversal: the friend gets a written
   proposal within a business day and owes nothing.
5. THE ASK — a specific, scoped "who do you know" question (not a vague "know anybody?"),
   then the URL on its own final line.

HARD CONSTRAINTS:
- 500 to 1000 characters total.
- Short paragraphs. Blank line between each. No bullet lists, no numbered lists.
- The ONLY numbers allowed anywhere: $300, $2,500, and any digits inside the verbatim review.
  No percentages, no counts, no years, no "X+ clients", no rankings, no "doubled", "boosted",
  "ROI", "leads", "conversions".
- No hashtags. No emojis. No exclamation marks outside the verbatim quote.
- No "DM me", "drop a comment below", "tag a friend", "link in bio", "let me know your thoughts".
- Maximum ONE em-dash in the entire post.
- Forbidden phrases: "amazing", "incredible", "game-changer", "crushing it", "thought leader",
  "in today's market", "the truth is", "here's the thing", "let's dive in", "world-class",
  "next-level", "unlock", "elevate", "leverage", "win-win", "no-brainer", "passive income".
- Never promise a ranking. Never invent a client, a quote or an outcome.
- Voice: David Ogilvy directness with small-town Alberta plainness. Adult. Unhurried. No hype.
  The money is the thank you, never the hook.

The post must end with the URL on its own line: ${SITE_URL}

SELF-CHECK before returning (silent):
- Does line one avoid money entirely? If not, rewrite it.
- Is the review quoted word for word with the reviewer's name? If not, fix it.
- Are there digits anywhere other than $300, $2,500 and the quote? If yes, remove them.
- Is it between 500 and 1000 characters? If not, fix it.
`.trim();

const WEAK_HOOKS = [
  /^in today'?s\b/i, /^let'?s (talk|dive)/i, /^here'?s why\b/i,
  /^ever wonder/i, /^did you know\b/i, /^imagine if\b/i, /^as a business owner\b/i,
  /^\$?\d/, /^want to (make|earn)/i, /^earn \$/i, /^make \$/i,
];

function hasWeakHook(s: string): boolean {
  const first = s.trim().split(/\n/)[0] || "";
  return WEAK_HOOKS.some((rx) => rx.test(first));
}

// Only $300 / $2,500 and quoted digits are permitted.
function hasBadNumbers(s: string, quote: string): boolean {
  const cleaned = s
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\b[\w-]+\.(com|ca|info|clothing|co|io|net|org|xyz)\b/gi, "")
    .replace(/"[^"]*"/g, "")
    .split(quote).join("")
    .replace(/\$\s?2,?500/g, "")
    .replace(/\$\s?300/g, "");
  if (/\d/.test(cleaned)) return true;
  if (/\b(increased|boosted|grew|doubled|tripled|roi|conversions|leads)\b/i.test(cleaned)) return true;
  return false;
}

function scrub(s: string): string {
  return s
    .replace(/#[A-Za-z0-9_]+/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function enforceParagraphs(txt: string): string {
  const normalized = txt.replace(/\n(?!\n)/g, "\n\n").trim();
  const blocks = normalized.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length >= 4) return blocks.join("\n\n");

  const sentences = normalized.replace(/\n+/g, " ").split(/(?<=[.!?])\s+(?=[A-Z"])/).filter(Boolean);
  if (sentences.length < 5) return normalized;
  const out: string[] = [sentences[0]];
  const rest = sentences.slice(1);
  const size = Math.ceil(rest.length / 3);
  for (let i = 0; i < rest.length; i += size) out.push(rest.slice(i, i + size).join(" "));
  return out.map((p) => p.trim()).filter(Boolean).join("\n\n");
}

function enforceUrl(txt: string): string {
  let t = txt.replace(/[\s.,;:!?]+$/g, "").trim();
  const parts = t.split(SITE_URL);
  if (parts.length === 1) return `${t}\n\n${SITE_URL}`;
  t = parts.join(" ").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").replace(/[\s.,;:!?]+$/g, "").trim();
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
  if (!resp.ok) throw new Error(`AI gateway ${resp.status}: ${await resp.text()}`);
  const j = await resp.json();
  return (j.choices?.[0]?.message?.content || "").trim();
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function emailHtml(copy: string, angle: string, category: string, reviewer: string): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f6f4;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e4e4e0;padding:28px;">
    <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a8a84;">Local Cochrane Web Design · Referral · Facebook</div>
    <h1 style="font-size:19px;margin:10px 0 4px;font-weight:600;">${esc(angle)}</h1>
    <div style="font-size:12px;color:#8a8a84;margin-bottom:20px;">${esc(category)} · review: ${esc(reviewer)} · ${copy.length} characters</div>
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
      const { data } = await sb.from("cochrane_referral_angles").select("*").eq("id", forcedId).maybeSingle();
      angle = data;
    } else {
      const { data } = await sb.from("cochrane_referral_angles").select("*")
        .eq("enabled", true)
        .order("last_used_at", { ascending: true, nullsFirst: true })
        .limit(1);
      angle = data?.[0];
    }
    if (!angle) throw new Error("No enabled referral angle available. Add one on the Cochrane page.");

    const { data: reviews } = await sb.from("cochrane_reviews").select("*")
      .eq("enabled", true)
      .order("last_used_at", { ascending: true, nullsFirst: true })
      .limit(1);
    const review = reviews?.[0];
    if (!review) throw new Error("No enabled review available.");

    const { data: recent } = await sb.from("generated_posts")
      .select("copy")
      .eq("platform", "facebook")
      .order("created_at", { ascending: false })
      .limit(5);

    const recentBlock = recent?.length
      ? `\n\nRECENT POSTS (do not repeat these openings, scenes or phrasing):\n${recent.map((r: any, i: number) => `${i + 1}. ${String(r.copy).slice(0, 200)}`).join("\n")}`
      : "";

    const system = `${BRAND_CONTEXT}

TODAY'S ANGLE (the spine of the post — express it in your own words, keep the meaning):
"${angle.angle}" (category: ${angle.category})

TODAY'S REVIEW (quote this EXACTLY, word for word, inside quotation marks, and attribute it):
${review.reviewer_name}: "${review.quote}"${recentBlock}

${RULES}`;

    const userPrompt = "Write the Facebook referral post now. Output only the post text, nothing else.";

    let out = await callAI(system, userPrompt);

    if (hasBadNumbers(out, review.quote)) {
      out = await callAI(system, `${userPrompt}\n\nIMPORTANT: your previous draft contained numbers that are not allowed. The ONLY numbers permitted are $300, $2,500 and digits inside the verbatim review. Rewrite.`);
    }
    if (hasWeakHook(out)) {
      out = await callAI(system, `${userPrompt}\n\nIMPORTANT: your previous hook was a cliché or led with money. Rewrite the first line as a plain, specific, declarative sentence with no dollar figure in it.`);
    }
    if (!out.includes(review.quote.slice(0, 40))) {
      out = await callAI(system, `${userPrompt}\n\nIMPORTANT: your previous draft did not include the review word for word. Include it exactly as given, in quotation marks, attributed to ${review.reviewer_name}.`);
    }
    const paragraphs = (t: string) => t.split(/\n\s*\n/).filter((x) => x.trim()).length;
    if (paragraphs(out) < 4) {
      out = await callAI(system, `${userPrompt}\n\nIMPORTANT: your previous draft was one block of text. Rewrite as five short paragraphs separated by blank lines: hook, scene, the review on its own paragraph, the offer, then the ask with the URL on its own final line.`);
    }

    const provisional = scrub(out);
    if (provisional.length < MIN_CHARS || provisional.length > MAX_CHARS) {
      out = await callAI(system, `${userPrompt}\n\nIMPORTANT: your previous draft was ${provisional.length} characters. It must land between ${MIN_CHARS} and ${MAX_CHARS}. ${provisional.length > MAX_CHARS ? "Cut adjectives and the weakest paragraph first, but keep the review intact." : "Add one more concrete line to the scene."}`);
    }

    const copy = enforceUrl(enforceParagraphs(scrub(out)));

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
        source: "cochrane-referral",
        angle: angle.angle,
        category: angle.category,
        angle_id: angle.id,
        reviewer: review.reviewer_name,
        review_id: review.id,
        chars: copy.length,
        within_range: copy.length >= MIN_CHARS && copy.length <= MAX_CHARS + 150,
      },
    }).select("id").single();
    if (insErr) throw insErr;

    await sb.from("cochrane_referral_angles").update({
      use_count: (angle.use_count || 0) + 1,
      last_used_at: new Date().toISOString(),
    }).eq("id", angle.id);

    await sb.from("cochrane_reviews").update({
      use_count: (review.use_count || 0) + 1,
      last_used_at: new Date().toISOString(),
    }).eq("id", review.id);

    let email: any = null;
    if (alsoSend) {
      const subject = `Facebook · Referral · ${angle.category}`;
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
          html: emailHtml(copy, angle.angle, angle.category, review.reviewer_name),
        }),
      });
      const resendJson = await resendResp.json().catch(() => ({}));
      if (!resendResp.ok) console.error(`Resend ${resendResp.status}:`, JSON.stringify(resendJson));
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
      review: review.reviewer_name,
      chars: copy.length,
      copy,
      email,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-cochrane-referral-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
