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
Write ONE post for X (Twitter). Engineered to stop the scroll and earn the click.

STRUCTURE (in order, no labels in output):
1. Pattern-interrupt opener — one declarative sentence that contradicts a common belief about websites, design, or marketing. Distill the master tip into it.
2. One short line that names the client (use their real name) as the living proof.
3. Blank line.
4. The client website URL on its own line. The URL is the only call to action.

HARD CONSTRAINTS:
- 220–280 characters total including the URL (hard cap).
- No hashtags. No emojis. No exclamation marks. No questions. No "I" voice.
- No numbers, percentages, dollar amounts, "X+ clients", or any statistic.
- Maximum ONE em-dash in the entire post.
- No call-to-action verbs like "check out", "see for yourself", "click here". The URL stands alone.
- Voice: David Ogilvy. Direct. Adult. Quiet authority.
`.trim();

const LI_RULES = `
Write ONE post for LinkedIn. Engineered for conversion using Hook → Story → Offer.

STRUCTURE (in order, no labels in output, blank line between sections):

1. HOOK — one contrarian or unusually specific sentence. The master tip, sharpened. No preamble ("Here's a thought", "The truth is", "Let's dive in").

2. STAKES — one short paragraph (2–3 sentences) naming what the reader is quietly losing right now by not having understood this principle. Concrete, not theoretical.

3. VIGNETTE — one short paragraph that names the client and describes the specific design decision Veepo made on their site that put the principle into practice. No metrics. No numbers. No vague praise. Show the choice.

4. PROOF — if a verbatim client quote is provided in context, drop it on its own line inside quotation marks with attribution exactly as given. Do not paraphrase. If no quote is provided, restate the principle as one short line of conviction instead.

5. OFFER — exactly this line, no variations:
See it live: {WEBSITE_URL}

HARD CONSTRAINTS:
- 700–1300 characters total.
- No hashtags. No emojis. No bullet lists or numbered lists in the output.
- No "DM me", "drop a comment", "let me know below", "thoughts?".
- No numbers, percentages, dollar amounts, ranking claims, "X+ clients", "doubled", "boosted", "ROI", "leads", "conversions".
- Maximum ONE em-dash in the entire post.
- Forbidden phrases: "amazing", "incredible", "game-changer", "crushing it", "thought leader", "in today's market", "the truth is", "here's the thing", "let's dive in", "world-class", "next-level".
- Voice: David Ogilvy directness with Veepo gravity. Adult. Unhurried. No hype.

SELF-CHECK before returning (silent — do not write it in output):
- Does the hook contradict a common belief or land an unusually specific truth? If not, rewrite.
- Would a busy founder keep reading after line one? If not, rewrite.
- Are there ANY digits in the body (URL excluded)? If yes, remove them.
- Does the post end with "See it live: {URL}" on its own line? If not, fix.
`.trim();

function stripStats(s: string): string {
  // Heuristic guard: redact obvious statistics. Models almost always comply, this is a safety net.
  return s
    .replace(/\b\d{1,3}\s?%/g, "")
    .replace(/\b\d+x\b/gi, "")
    .replace(/\$\d[\d,.]*/g, "")
    .replace(/  +/g, " ");
}

// Detects statistic-shaped phrasing the prompt forbids. URLs are stripped before checking
// so a domain like "fly4me.ca" doesn't trigger a false positive.
function hasStats(s: string): boolean {
  const cleaned = s.replace(/https?:\/\/\S+/g, "").replace(/\b[\w-]+\.(com|ca|info|clothing|co|io|net|org|xyz)\b/gi, "");
  if (/\b\d{2,}\b/.test(cleaned)) return true; // any 2+ digit number
  if (/\b\d+\s?(%|percent|x)\b/i.test(cleaned)) return true;
  if (/\$\s?\d/.test(cleaned)) return true;
  if (/\b(increased|boosted|grew|doubled|tripled|\d+\+\s*clients|roi|conversions|leads)\b/i.test(cleaned)) return true;
  return false;
}

const X_HARD_CAP = 280;
const X_TARGET = 270; // 10-char safety buffer
const WEAK_HOOKS = [
  /^in today'?s\b/i,
  /^let'?s (talk|dive)/i,
  /^here'?s why\b/i,
  /^ever wonder/i,
  /^did you know\b/i,
  /^imagine if\b/i,
];

function hasWeakHook(s: string): boolean {
  const first = s.trim().split(/\n/)[0] || "";
  return WEAK_HOOKS.some((rx) => rx.test(first));
}

// Deterministic trim: drop trailing sentences in the body, keep the final URL line intact.
function trimXToLimit(txt: string, url: string): string {
  const ensure = (s: string) => (s.includes(url) ? s : `${s.trim()}\n\n${url}`);
  let out = ensure(txt).trim();
  if (out.length <= X_HARD_CAP) return out;

  const urlIdx = out.lastIndexOf(url);
  const head = out.slice(0, urlIdx).trim();
  const tail = out.slice(urlIdx); // url + anything after

  // Split head into sentences and drop from the end until under cap.
  const sentences = head.split(/(?<=[.!?])\s+/);
  while (sentences.length > 1) {
    sentences.pop();
    const candidate = `${sentences.join(" ").trim()}\n\n${tail.trim()}`;
    if (candidate.length <= X_HARD_CAP) return candidate;
  }
  // Fallback: hard slice the head.
  const room = X_HARD_CAP - (tail.length + 2);
  const sliced = room > 20 ? head.slice(0, room).replace(/\s+\S*$/, "") : "";
  return `${sliced}\n\n${tail.trim()}`.trim();
}

// Ensure LinkedIn ends with "See it live: {url}" exactly once.
function enforceLinkedInOffer(txt: string, url: string): string {
  const offer = `See it live: ${url}`;
  const cleaned = txt.replace(new RegExp(`See it live:\\s*${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`), "").trim();
  return `${cleaned}\n\n${offer}`;
}

// Ensure X ends with the URL on its own line, no trailing punctuation.
function enforceXOffer(txt: string, url: string): string {
  let t = txt.replace(/[\s.,;:!?]+$/g, "").trim();
  // Remove any in-body occurrences of the URL except the last.
  const parts = t.split(url);
  if (parts.length > 2) {
    t = parts.slice(0, -1).join("").replace(/\s+$/g, "") + url;
  } else if (parts.length === 1) {
    t = `${t}\n\n${url}`;
  } else {
    // exactly one occurrence — make sure it's at the end
    const before = parts[0].trim();
    const after = parts[1].trim();
    t = after ? `${before} ${after}\n\n${url}` : `${before}\n\n${url}`;
  }
  return t.trim();
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
Voice: David Ogilvy directness + quiet authority. Russell Brunson structural rigor (Hook → Story → Offer). Adult. No marketing fluff.

You are not writing for likes. You are writing for one click — from a founder, marketer, or operator who lands on the client's site and quietly realizes Veepo is the studio they should hire.

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

    const generate = async (rules: string, label: string): Promise<string> => {
      const userPrompt = `Write the ${label} post now. Output only the post text, nothing else.`;
      let out = await callAI(sharedContext + "\n\n" + rules, userPrompt);

      // Retry on stats
      if (hasStats(out)) {
        out = await callAI(
          sharedContext + "\n\n" + rules,
          userPrompt + "\n\nIMPORTANT: Your previous draft contained numbers/statistics. Rewrite with ZERO digits, ZERO percentages, ZERO dollar amounts, ZERO metric claims. Principles and a name only.",
        );
      }
      // Retry on weak hooks
      if (hasWeakHook(out)) {
        out = await callAI(
          sharedContext + "\n\n" + rules,
          userPrompt + `\n\nIMPORTANT: Your previous hook opened with a weak cliché ("In today's", "Let's talk", "Here's why", "Ever wonder", "Did you know", "Imagine if"). Rewrite the first line as a contrarian declarative sentence. No preamble.`,
        );
      }
      // X-specific length retry
      if (label === "X" && out.length > X_TARGET) {
        out = await callAI(
          sharedContext + "\n\n" + rules,
          userPrompt + `\n\nIMPORTANT: Your previous draft was ${out.length} characters. The hard cap is ${X_TARGET}. Rewrite tighter — cut adjectives first, keep the contrarian hook, keep the URL on its own line.`,
        );
      }
      return out;
    };

    const [xCopyRaw, liCopyRaw] = await Promise.all([
      generate(X_RULES, "X"),
      generate(LI_RULES, "LinkedIn"),
    ]);

    // Post-process: strip stats, enforce offer placement, hard-cap X length
    let xCopy = enforceXOffer(stripStats(xCopyRaw), cs.website_url);
    if (xCopy.length > X_HARD_CAP) xCopy = trimXToLimit(xCopy, cs.website_url);
    const liCopy = enforceLinkedInOffer(stripStats(liCopyRaw), cs.website_url);

    const xWithinLimit = xCopy.length <= X_HARD_CAP;

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
        copy: xCopy,
        image_urls: [],
        image_asset_ids: [],
        is_winner: true,
        swap_token: crypto.randomUUID(),
        score: 0,
        score_breakdown: { master_tip: tip, source: "case-study", x_chars: xCopy.length, x_within_limit: xWithinLimit },
      },
      {
        batch_id: batchId,
        batch_date: today,
        template_product_id: null,
        case_study_id: cs.id,
        theme_id: null,
        platform: "linkedin",
        copy: liCopy,
        image_urls: [],
        image_asset_ids: [],
        is_winner: true,
        swap_token: crypto.randomUUID(),
        score: 0,
        score_breakdown: { master_tip: tip, source: "case-study", linkedin_chars: liCopy.length },
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