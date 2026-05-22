"""
Veepo Social Content Generator
- Generates 3 post options daily and emails them to the brand owner
- Saves every run to data/posts.json (powers the future Lovable admin app)
- Multi-brand ready: reads config from brands/{brand_id}.json
"""

import anthropic
import resend
import os
import json
from datetime import datetime, date
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent
DATA_FILE = ROOT / "data" / "posts.json"

# ── API clients ───────────────────────────────────────────────────────────────
claude = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
resend.api_key = os.environ["RESEND_API_KEY"]


# ── Brand loader ──────────────────────────────────────────────────────────────
def load_brand(brand_id: str = "veepo") -> dict:
    path = ROOT / "brands" / f"{brand_id}.json"
    with open(path) as f:
        return json.load(f)


# ── Pillar rotation (day-of-year based so it always cycles forward) ───────────
def get_todays_pillars(brand: dict) -> list[dict]:
    campaign = next(c for c in brand["campaigns"] if c["active"])
    pillars = campaign["pillars"]
    day = date.today().timetuple().tm_yday
    indices = [day % len(pillars), (day + 1) % len(pillars), (day + 2) % len(pillars)]
    return [pillars[i] for i in indices]


# ── System prompt (cached — saves ~70% on Claude API cost) ───────────────────
def build_system_prompt(brand: dict) -> str:
    b = brand
    v = brand["brand_voice"]
    p = brand["product"]
    a = brand["target_audience"]
    persona = brand.get("persona", {})
    angles = brand.get("copy_angles", {})

    proof = "\n".join(f"- {pt}" for pt in brand.get("proof_points", []))
    before = "\n".join(f"- {line}" for line in persona.get("before_state", []))
    after = "\n".join(f"- {line}" for line in persona.get("after_state", []))
    objections = "\n".join(f"- {obj}" for obj in persona.get("objections", []))
    hooks = "\n".join(f"- {h}" for h in angles.get("hooks", []))
    pain_angles = "\n".join(f"- {pa}" for pa in angles.get("pain", []))
    desire_angles = "\n".join(f"- {da}" for da in angles.get("desire", []))
    identity_angles = "\n".join(f"- {ia}" for ia in angles.get("identity", []))
    dream_inbox = "\n".join(f"- \"{msg}\"" for msg in a.get("dream_inbox", []))

    return f"""You are writing as Parker — the founder of {b['name']}. You are NOT a brand. You are a person.

=======================================
WHO YOU ARE WRITING TO
=======================================
The "Portfolio-to-Passport Photographer."

They are {persona.get('age_range', '22-38')}, {persona.get('career_stage', '2-8 years in')}.
They make {persona.get('income', '$20k-$150k/year')}.
Their current presence: {persona.get('current_presence', 'Instagram-heavy, outdated or no website')}.

THE MOMENT THAT DEFINES THEM:
{persona.get('the_moment', 'A client asks for their website and they pause — because they have nothing to send.')}

THEIR IDENTITY TENSION:
{a.get('identity_tension', 'They see themselves as an artist, but they know they need to look like a business.')}

THEIR BUYING TRIGGER:
{a.get('buying_trigger', '"I\'m good enough to charge more, but I don\'t look like it online."')}

THEIR BEFORE STATE (what they feel right now):
{before}

THEIR AFTER STATE (what they want):
{after}

THEIR DREAM INBOX (what they imagine waking up to):
{dream_inbox}

THEIR OBJECTIONS (what stops them from buying):
{objections}

THEIR EMOTIONAL TRANSFORMATION:
{persona.get('emotional_transformation', '"I finally look like the photographer I know I\'m becoming."')}

=======================================
WHAT YOU SELL
=======================================
{p['name']}. ${p['launch_price']} launch fee. ${p['monthly_price']}/month managed. Live in {p['delivery_days']} days guaranteed.
Core promise: "{p['core_promise']}"
URL: {b['templates_url']}

You are NOT selling a template. You are selling:
"A premium online presence that helps photographers look established, raise perceived value, and turn attention into serious inquiries."

The photographer already has photos. They need presentation.
They already have talent. They need trust.
They already have ambition. They need a brand container big enough for that ambition.

PROOF POINTS — use these naturally, never list them robotically:
{proof}

=======================================
COPY ANGLES (rotate — don't repeat the same angle)
=======================================
PAIN ANGLES:
{pain_angles}

DESIRE ANGLES:
{desire_angles}

IDENTITY ANGLES:
{identity_angles}

PROVEN HOOKS (use as starting points, make them your own):
{hooks}

=======================================
WRITING STYLE
=======================================
Apply BOTH simultaneously:

1. ALEX HORMOZI: Blunt. Direct. No fluff. Lead with the outcome. Use specific numbers ($799, 14 days, one missed booking). Say the quiet part loud. Make the cost of NOT buying obvious. Make the value so clear that hesitating feels irrational.

2. RUSSELL BRUNSON: Story-first. Hook → Backstory → Discovery → Offer. The reader sees themselves in the story. They feel deeply understood before they feel sold to. The story is always about THEM, not about you.

COMBINED METHOD: Open with Brunson's hook — a specific moment, a scene, a feeling they've had. Build with Hormozi's directness — the exact dollar cost of a missed opportunity, the specific gap between their talent and their presentation, the precise outcome waiting on the other side. End with a CTA that is the only logical conclusion to the story.

=======================================
VOICE RULES — NON-NEGOTIABLE
=======================================
- Write as Parker. First person singular. "I built", "I see", "I noticed". Never "we" or "our".
- Never say: {", ".join(v['never_say'])}
- Always: {", ".join(v['always_do'])}
- NEVER put the URL in the post body. Always "Link in first comment" or "DM me WEBSITE"
- Vocabulary of their world: bookings, inquiries, clients, galleries, portfolios, shoots, sessions, album delivery, destination work, couples, brands, agencies

=======================================
FORMAT RULES
=======================================
LINKEDIN:
- 500-900 words. Shorter posts die in the algorithm.
- 1-2 sentences per paragraph MAX. White space is the design.
- First sentence = the hook. Bold claim, uncomfortable truth, or specific scenario that makes them stop.
- Structure: Hook → Story/Scene → Insight → CTA
- 3 hashtags at the very end only
- Final line: "DM me WEBSITE" or "Link in first comment"

X (TWITTER) — 5-TWEET THREAD (default format):
- Tweet 1/5: The hook. Bold claim or uncomfortable truth. Under 240 chars. Creates a pattern interrupt that makes them need to read 2/5.
- Tweet 2/5: The story. A specific person, a specific moment, the before state.
- Tweet 3/5: The turn. What changed. The discovery. Specific numbers.
- Tweet 4/5: The mechanism or proof. Why this works. What it actually delivers.
- Tweet 5/5: The CTA. One clear action. "DM me WEBSITE" or "Link in first reply."
- Each tweet under 280 chars

OUTPUT: Return valid JSON only. No markdown fences. No explanation."""


# ── Generate one post set ─────────────────────────────────────────────────────
def generate_post(pillar: dict, post_number: int, brand: dict, system_prompt: str) -> dict:
    niches = brand.get("persona", {}).get("niches", [
        "wedding photographer", "destination photographer", "brand photographer",
        "lifestyle photographer", "travel photographer", "portrait photographer",
        "videographer", "creative freelancer"
    ])
    day_offset = date.today().timetuple().tm_yday + post_number
    niche = niches[day_offset % len(niches)]

    user_prompt = f"""Generate post option #{post_number}.

PILLAR: {pillar['name']}
NICHE THIS POST TARGETS: {niche}

Return this exact JSON:
{{
  "pillar": "{pillar['name']}",
  "niche": "{niche}",
  "hook": "the opening scroll-stopping line",
  "linkedin": {{
    "post": "full post text with \\n for line breaks",
    "hashtags": ["tag1", "tag2", "tag3"],
    "cta": "the exact CTA line at the end"
  }},
  "x": {{
    "format": "single or thread",
    "post": "if single: the tweet. if thread: array of 5 strings each under 280 chars"
  }},
  "buffer_tip": "one sentence on timing or placement"
}}"""

    response = claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        system=[{"type": "text", "text": system_prompt, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": user_prompt}],
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


# ── Save to post history (feeds the future Lovable admin app) ─────────────────
def save_to_history(posts: list[dict], brand_id: str):
    existing = json.loads(DATA_FILE.read_text()) if DATA_FILE.exists() else []
    record = {
        "id": f"{brand_id}-{date.today().isoformat()}",
        "brand_id": brand_id,
        "date": date.today().isoformat(),
        "generated_at": datetime.now().isoformat(),
        "status": "emailed",
        "posts": posts,
    }
    existing.insert(0, record)  # newest first
    DATA_FILE.write_text(json.dumps(existing, indent=2))
    return record["id"]


# ── Email builder ─────────────────────────────────────────────────────────────
def format_x_post(x_data: dict) -> str:
    if x_data["format"] == "thread":
        tweets = x_data["post"] if isinstance(x_data["post"], list) else [x_data["post"]]
        return "<br><br>".join(
            f'<span style="font-size:11px;font-weight:700;color:#666;">TWEET {i+1}/{len(tweets)}</span><br>{t}'
            for i, t in enumerate(tweets)
        )
    return x_data["post"]


def build_email(posts: list[dict], brand: dict, record_id: str) -> str:
    today = datetime.now().strftime("%A, %B %d, %Y")
    options_html = ""

    for i, post in enumerate(posts, 1):
        hashtags = " ".join(f"#{h.lstrip('#')}" for h in post["linkedin"]["hashtags"])
        x_html = format_x_post(post["x"])

        pillar_colors = {
            "PROOF": "#166534", "PAIN": "#991b1b", "EDUCATION": "#1e40af",
            "PROCESS": "#6b21a8", "OFFER": "#92400e"
        }
        pillar_bg = {
            "PROOF": "#dcfce7", "PAIN": "#fee2e2", "EDUCATION": "#dbeafe",
            "PROCESS": "#f3e8ff", "OFFER": "#fef3c7"
        }
        color = pillar_colors.get(post["pillar"], "#374151")
        bg = pillar_bg.get(post["pillar"], "#f3f4f6")

        options_html += f"""
        <div style="margin-bottom:32px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <div style="background:#0f172a;padding:14px 20px;">
            <span style="color:#fff;font-weight:700;font-size:16px;">Option {i}</span>
            <span style="margin-left:10px;background:{bg};color:{color};font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">{post['pillar']}</span>
            <span style="margin-left:6px;color:#64748b;font-size:12px;">{post['niche']}</span>
          </div>
          <div style="background:#f8fafc;padding:10px 20px;border-bottom:1px solid #e5e7eb;">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">HOOK → </span>
            <span style="font-style:italic;color:#1e293b;font-size:14px;">"{post['hook']}"</span>
          </div>
          <div style="padding:20px;">
            <p style="font-size:11px;font-weight:700;color:#0077b5;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">LINKEDIN</p>
            <div style="background:#f8fafc;border-left:3px solid #0077b5;padding:14px;border-radius:0 8px 8px 0;white-space:pre-wrap;font-size:14px;line-height:1.7;color:#1e293b;margin-bottom:6px;">{post['linkedin']['post'].replace(chr(10), '<br>')}</div>
            <div style="font-size:13px;color:#0077b5;margin-bottom:6px;">{hashtags}</div>
            <div style="background:#eff6ff;padding:8px 12px;border-radius:6px;font-size:13px;color:#1d4ed8;font-weight:600;margin-bottom:4px;">📌 {post['linkedin']['cta']}</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:20px;">Put veepo.ca/templates link in the FIRST COMMENT, not the post body</div>

            <p style="font-size:11px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">X (TWITTER) · {post['x']['format'].upper()}</p>
            <div style="background:#f8fafc;border-left:3px solid #000;padding:14px;border-radius:0 8px 8px 0;font-size:14px;line-height:1.7;color:#1e293b;margin-bottom:4px;">{x_html}</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:14px;">Put link in the FIRST REPLY to your own post</div>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:8px 12px;border-radius:6px;font-size:13px;color:#166534;">💡 {post['buffer_tip']}</div>
          </div>
        </div>"""

    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:660px;margin:0 auto;padding:28px 16px;">
  <div style="background:#0f172a;border-radius:12px 12px 0 0;padding:28px;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">{brand['name']} · Daily Content</p>
    <h1 style="color:#fff;font-size:22px;margin:0 0 4px;">Your 3 Posts for Today</h1>
    <p style="color:#64748b;font-size:13px;margin:0;">{today}</p>
  </div>
  <div style="background:#1e293b;padding:12px 28px;margin-bottom:20px;border-radius:0 0 8px 8px;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">Pick one → paste into <strong style="color:#fff;">Buffer</strong> → posts to LinkedIn + X simultaneously &nbsp;·&nbsp; <a href="https://buffer.com" style="color:#60a5fa;">Open Buffer →</a></p>
  </div>
  {options_html}
  <div style="text-align:center;padding:20px;color:#94a3b8;font-size:11px;">
    <p style="margin:0;">Record ID: {record_id} · <a href="{brand['templates_url']}" style="color:#60a5fa;">{brand['templates_url']}</a></p>
  </div>
</div></body></html>"""


# ── Main ──────────────────────────────────────────────────────────────────────
def main(brand_id: str = "veepo"):
    brand = load_brand(brand_id)
    today_str = date.today().strftime("%A %b %d")
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Generating for {brand['name']} — {today_str}")

    system_prompt = build_system_prompt(brand)
    pillars = get_todays_pillars(brand)
    posts = []

    for i, pillar in enumerate(pillars, 1):
        print(f"  Option {i}/3 — {pillar['name']}...")
        post = generate_post(pillar, i, brand, system_prompt)
        posts.append(post)
        print(f"  ✓ Hook: \"{post['hook'][:55]}...\"")

    record_id = save_to_history(posts, brand_id)
    print(f"  ✓ Saved to history (ID: {record_id})")

    html = build_email(posts, brand, record_id)
    result = resend.Emails.send({
        "from": f"{brand['name']} Social <social@veepo.ca>",
        "to": [brand["owner_email"]],
        "subject": f"📱 {today_str} posts — pick one, paste into Buffer",
        "html": html,
    })
    print(f"  ✓ Email sent (ID: {result['id']})")
    print("Done.")


if __name__ == "__main__":
    import sys
    brand_id = sys.argv[1] if len(sys.argv) > 1 else "veepo"
    main(brand_id)
