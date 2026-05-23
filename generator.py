"""
Veepo Social Content Generator

Generates daily post options for Parker, emails them via Resend, and saves
history for the private Veepo Content Studio admin app.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
from datetime import date, datetime
from pathlib import Path
from typing import Any

import anthropic
import resend
from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).parent
DATA_FILE = ROOT / "data" / "posts.json"
PUBLIC_DATA_FILE = ROOT / "public" / "data" / "posts.json"
MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
TARGET_POSTS = 3
CANDIDATES_PER_PILLAR = 2

GENERIC_PHRASES = [
    "game-changer",
    "elevate your brand",
    "unlock your potential",
    "take your business to the next level",
    "stand out from the crowd",
    "seamless experience",
    "cutting-edge",
    "innovative",
    "passionate",
    "transform your business",
    "digital solution",
]

PERSONA_MARKERS = [
    "instagram",
    "linktree",
    "squarespace",
    "wix",
    "google drive",
    "pixieset",
    "gallery",
    "galleries",
    "wedding",
    "destination",
    "brand campaign",
    "available worldwide",
    "inquiry",
    "dm",
    "client",
    "photographer",
    "portfolio",
]

SALES_MARKERS = ["$799", "14 days", "$69", "DM me WEBSITE", "Link in first comment", "Reply WEBSITE"]


class GenerationError(RuntimeError):
    """Raised when a generated post cannot be validated after repair."""


def load_brand(brand_id: str = "veepo") -> dict[str, Any]:
    path = ROOT / "brands" / f"{brand_id}.json"
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def get_claude_client() -> anthropic.Anthropic:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is missing. Add it to .env or use --dry-run.")
    return anthropic.Anthropic(api_key=api_key)


def configure_resend() -> None:
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        raise RuntimeError("RESEND_API_KEY is missing. Add it to .env or use --dry-run.")
    resend.api_key = api_key


def get_todays_pillars(brand: dict[str, Any]) -> list[dict[str, Any]]:
    campaign = next(c for c in brand["campaigns"] if c["active"])
    pillars = campaign["pillars"]
    day = date.today().timetuple().tm_yday
    indices = [day % len(pillars), (day + 1) % len(pillars), (day + 2) % len(pillars)]
    return [pillars[i] for i in indices]


def line_join(items: list[str]) -> str:
    return "\n".join(f"- {item}" for item in items)


def build_system_prompt(brand: dict[str, Any]) -> str:
    voice = brand["brand_voice"]
    product = brand["product"]
    audience = brand["target_audience"]
    persona = brand.get("persona", {})
    angles = brand.get("copy_angles", {})
    conversion = brand.get("conversion_layers", [])
    visuals = brand.get("visual_strategy", {})

    return f"""You write as Parker, founder of {brand['name']}. You are not a brand voice committee. You are one founder writing directly to photographers.

PRIMARY OFFER:
- {product['name']}
- ${product['launch_price']} launch
- ${product['monthly_price']}/month managed
- Live in {product['delivery_days']} days
- URL: {brand['templates_url']}
- Core promise: {product['core_promise']}

TARGET BUYER:
The Portfolio-to-Passport Photographer. They are talented enough to charge more, but their online presence makes them look earlier-stage than their work.

DEFINING MOMENT:
{persona.get('the_moment')}

CORE TRIGGER:
{audience.get('buying_trigger')}

IDENTITY TENSION:
{audience.get('identity_tension')}

BEFORE STATE:
{line_join(persona.get('before_state', []))}

AFTER STATE:
{line_join(persona.get('after_state', []))}

DREAM INBOX:
{line_join(audience.get('dream_inbox', []))}

OBJECTIONS:
{line_join(persona.get('objections', []))}

PROOF YOU CAN USE, WITHOUT INVENTING RESULTS:
{line_join(brand.get('proof_points', []))}

CONVERSION LAYERS EVERY POST MUST USE:
{line_join(conversion)}

COPY ANGLES:
Pain:
{line_join(angles.get('pain', []))}

Desire:
{line_join(angles.get('desire', []))}

Identity:
{line_join(angles.get('identity', []))}

Hooks:
{line_join(angles.get('hooks', []))}

VISUAL STRATEGY:
{line_join(visuals.get('ideas', []))}

STYLE:
1. Hormozi directness: specific numbers, blunt value, clear cost of inaction, direct CTA.
2. Brunson storytelling: exact moment, before/after bridge, identity shift, one natural next step.
3. Ethical direct response: no fake proof, no fabricated testimonials, no guaranteed leads.

VOICE RULES:
- Write as Parker in first person singular.
- Never say: {", ".join(voice['never_say'])}
- Always: {", ".join(voice['always_do'])}
- Never put a URL in the post body.
- Do not talk about Veepo too early. Create identification, pain, and desire first.
- Avoid generic marketing phrases. Be concrete enough that only a photographer would feel fully addressed.

LINKEDIN RULES:
- 500-900 words.
- First line must work alone as a scroll-stopping hook.
- 1-2 sentence paragraphs.
- Founder voice, story-driven, direct.
- 3 hashtags max.
- End with exactly one clear CTA.

X RULES:
- Default to a 5-tweet thread.
- Every tweet under 280 characters.
- Tweet 1 is the hook.
- Tweet 5 is the CTA.
- No hashtags unless genuinely useful.
- No external link in tweet 1.

VISUAL RULES:
- Every post must include one visual idea.
- Prefer real screenshots from veepo.ca/templates when possible.
- Good concepts: Instagram vs premium website, Google Drive folder vs clean portfolio, mobile website screenshot, gallery screenshot, contact form screenshot, business card website template.
- Nano Banana prompts create marketing mockups/comparison graphics only. No fake client results.

OUTPUT:
Return valid JSON only. No markdown fences. No explanation."""


def expected_shape(pillar: str, niche: str) -> str:
    return f"""{{
  "pillar": "{pillar}",
  "niche": "{niche}",
  "hook": "scroll-stopping first line",
  "linkedin": {{
    "post": "500-900 word LinkedIn post with \n line breaks",
    "hashtags": ["photographybusiness", "portfoliowebsite", "creativebusiness"],
    "cta": "DM me WEBSITE"
  }},
  "x": {{
    "format": "thread",
    "post": ["1st tweet under 280 chars", "2nd tweet", "3rd tweet", "4th tweet", "5th tweet"]
  }},
  "visual": {{
    "type": "screenshot",
    "concept": "simple visual concept",
    "asset_needed": "specific screenshot or asset Parker should use",
    "nano_banana_prompt": "detailed prompt for a clean marketing visual/mockup",
    "overlay_text": "short overlay text",
    "recommended_format": "LinkedIn image"
  }},
  "buffer_tip": "one useful posting tip"
}}"""


def build_candidate_prompt(pillar: dict[str, Any], post_number: int, candidate_number: int, niche: str) -> str:
    return f"""Generate one candidate post.

POST OPTION: {post_number}
CANDIDATE: {candidate_number}
PILLAR: {pillar['name']}
NICHE: {niche}

Make this candidate meaningfully different from the obvious generic version. Use one specific photographer moment, one clear business cost, one mechanism, and one direct CTA.

Return this exact JSON shape:
{expected_shape(pillar['name'], niche)}"""


def call_claude(client: anthropic.Anthropic, system_prompt: str, user_prompt: str, max_tokens: int = 4200) -> str:
    response = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=[{"type": "text", "text": system_prompt, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": user_prompt}],
    )
    return response.content[0].text.strip()


def extract_json(raw: str) -> dict[str, Any]:
    text = raw.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.strip().startswith("json"):
            text = text.strip()[4:]
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    return json.loads(text)


def repair_json(client: anthropic.Anthropic, raw: str, shape: str) -> dict[str, Any]:
    prompt = f"""Repair this into valid JSON only. Preserve the content. Match this shape:
{shape}

BROKEN OUTPUT:
{raw}"""
    repaired = client.messages.create(
        model=MODEL,
        max_tokens=2600,
        messages=[{"role": "user", "content": prompt}],
    )
    return extract_json(repaired.content[0].text)


def word_count(text: str) -> int:
    return len(re.findall(r"\b[\w'$-]+\b", text))


def trim_tweet(tweet: str) -> str:
    text = " ".join(tweet.split())
    return text if len(text) <= 280 else text[:276].rstrip() + "..."


def normalize_post(post: dict[str, Any]) -> dict[str, Any]:
    hashtags = post.get("linkedin", {}).get("hashtags", [])
    post["linkedin"]["hashtags"] = [str(h).lstrip("#") for h in hashtags][:3]
    post["x"]["format"] = "thread" if post.get("x", {}).get("format") != "single" else "single"
    if post["x"]["format"] == "thread":
        tweets = post["x"].get("post", [])
        if not isinstance(tweets, list):
            tweets = [str(tweets)]
        tweets = tweets[:5]
        while len(tweets) < 5:
            tweets.append("DM me WEBSITE and I will show you what yours could look like.")
        post["x"]["post"] = [trim_tweet(str(tweet)) for tweet in tweets]
    elif isinstance(post["x"].get("post"), list):
        post["x"]["post"] = trim_tweet(" ".join(str(t) for t in post["x"]["post"]))
    else:
        post["x"]["post"] = trim_tweet(str(post["x"].get("post", "")))
    return post


def validate_post(post: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    required = ["pillar", "niche", "hook", "linkedin", "x", "visual", "buffer_tip"]
    for key in required:
        if key not in post:
            errors.append(f"missing {key}")

    if errors:
        return errors

    linkedin = post["linkedin"]
    x_data = post["x"]
    visual = post["visual"]
    for key in ["post", "hashtags", "cta"]:
        if key not in linkedin:
            errors.append(f"missing linkedin.{key}")
    for key in ["format", "post"]:
        if key not in x_data:
            errors.append(f"missing x.{key}")
    for key in ["type", "concept", "asset_needed", "nano_banana_prompt", "overlay_text", "recommended_format"]:
        if key not in visual:
            errors.append(f"missing visual.{key}")

    if errors:
        return errors

    wc = word_count(str(linkedin["post"]))
    if wc < 400:
        errors.append(f"LinkedIn post too short ({wc} words)")
    if wc > 1000:
        errors.append(f"LinkedIn post too long ({wc} words)")
    if len(linkedin["hashtags"]) > 3:
        errors.append("too many LinkedIn hashtags")

    if x_data["format"] == "thread":
        if not isinstance(x_data["post"], list):
            errors.append("x.post must be an array for threads")
        else:
            if len(x_data["post"]) != 5:
                errors.append("X thread must have exactly 5 tweets")
            for i, tweet in enumerate(x_data["post"], 1):
                if len(tweet) > 280:
                    errors.append(f"tweet {i} over 280 chars")
    elif len(str(x_data["post"])) > 280:
        errors.append("single X post over 280 chars")

    return errors


def score_post(post: dict[str, Any]) -> dict[str, Any]:
    linkedin_text = str(post["linkedin"]["post"])
    x_text = " ".join(post["x"]["post"]) if isinstance(post["x"]["post"], list) else str(post["x"]["post"])
    all_text = f"{post['hook']} {linkedin_text} {x_text}"
    lower = all_text.lower()

    hook_strength = min(10, 3 + (len(post["hook"]) <= 120) + (len(post["hook"]) >= 25) + sum(
        marker in lower for marker in ["website", "instagram", "client", "portfolio", "price", "$", "looks"]
    ))
    persona_specificity = min(10, 2 + sum(marker in lower for marker in PERSONA_MARKERS))
    sales_clarity = min(10, 2 + sum(marker.lower() in lower for marker in SALES_MARKERS))
    emotional_pull = min(10, 3 + sum(marker in lower for marker in [
        "embarrassed", "proud", "trust", "premium", "ready", "serious", "behind", "local", "destination"
    ]))
    platform_fit = 8
    if word_count(linkedin_text) < 500 or word_count(linkedin_text) > 900:
        platform_fit -= 2
    if post["x"]["format"] == "thread" and isinstance(post["x"]["post"], list) and len(post["x"]["post"]) == 5:
        platform_fit += 1
    generic_hits = sum(phrase in lower for phrase in GENERIC_PHRASES)
    anti_generic = max(1, 10 - generic_hits * 2)
    cta_text = f"{post['linkedin'].get('cta', '')} {x_text}".lower()
    cta_strength = 9 if "dm me website" in cta_text or "reply website" in cta_text else 6
    believability = 10
    if any(phrase in lower for phrase in ["guaranteed leads", "proven to 10x", "client made", "testimonial"]):
        believability -= 4
    if "hypothetical" in lower or "imagine" in lower:
        believability += 0

    rubric = {
        "hook_strength": max(1, min(10, hook_strength)),
        "persona_specificity": max(1, min(10, persona_specificity)),
        "sales_clarity": max(1, min(10, sales_clarity)),
        "emotional_pull": max(1, min(10, emotional_pull)),
        "platform_fit": max(1, min(10, platform_fit)),
        "anti_generic_score": max(1, min(10, anti_generic)),
        "cta_strength": max(1, min(10, cta_strength)),
        "believability_trust": max(1, min(10, believability)),
    }
    score = round(sum(rubric.values()) / len(rubric), 1)
    strongest = max(rubric, key=rubric.get).replace("_", " ")
    weakest = min(rubric, key=rubric.get).replace("_", " ")
    post["quality_score"] = score
    post["quality_rubric"] = rubric
    post["quality_notes"] = f"Strongest: {strongest}. Watch: {weakest}."
    post["why_this_might_win"] = build_win_reason(post, rubric)
    return post


def build_win_reason(post: dict[str, Any], rubric: dict[str, int]) -> str:
    if rubric["persona_specificity"] >= 8 and rubric["emotional_pull"] >= 8:
        return "It feels painfully specific to photographers who know their work is better than their website."
    if rubric["sales_clarity"] >= 8:
        return "The offer math is easy to understand: one better booking can cover the build."
    if rubric["hook_strength"] >= 8:
        return "The first line creates enough tension to stop a photographer mid-scroll."
    return "It gives Parker a clear angle, a believable pain point, and a direct next step."


def generate_candidate(
    client: anthropic.Anthropic,
    pillar: dict[str, Any],
    post_number: int,
    candidate_number: int,
    brand: dict[str, Any],
    system_prompt: str,
) -> dict[str, Any]:
    niches = brand.get("persona", {}).get("niches", ["photographer"])
    day_offset = date.today().timetuple().tm_yday + post_number + candidate_number
    niche = niches[day_offset % len(niches)]
    prompt = build_candidate_prompt(pillar, post_number, candidate_number, niche)
    shape = expected_shape(pillar["name"], niche)
    raw = call_claude(client, system_prompt, prompt)
    try:
        post = extract_json(raw)
    except json.JSONDecodeError:
        post = repair_json(client, raw, shape)
    post = normalize_post(post)
    errors = validate_post(post)
    if errors:
        repair_prompt = f"""Revise this post so it passes validation.

VALIDATION ERRORS:
{line_join(errors)}

Return valid JSON only, matching this shape:
{shape}

POST:
{json.dumps(post, indent=2)}"""
        revised = call_claude(client, system_prompt, repair_prompt)
        post = normalize_post(extract_json(revised))
        errors = validate_post(post)
        if errors:
            raise GenerationError("; ".join(errors))
    return score_post(post)


def generate_posts(brand: dict[str, Any], dry_run: bool = False) -> list[dict[str, Any]]:
    if dry_run:
        return build_dry_run_posts(brand)

    client = get_claude_client()
    system_prompt = build_system_prompt(brand)
    pillars = get_todays_pillars(brand)
    candidates: list[dict[str, Any]] = []

    for i, pillar in enumerate(pillars, 1):
        for candidate_number in range(1, CANDIDATES_PER_PILLAR + 1):
            print(f"  Candidate {len(candidates) + 1}/{len(pillars) * CANDIDATES_PER_PILLAR} - {pillar['name']}...")
            candidate = generate_candidate(client, pillar, i, candidate_number, brand, system_prompt)
            candidates.append(candidate)
            print(f"    score {candidate['quality_score']}: {candidate['hook'][:70]}...")

    candidates.sort(key=lambda p: p["quality_score"], reverse=True)
    return candidates[:TARGET_POSTS]


def build_dry_run_posts(brand: dict[str, Any]) -> list[dict[str, Any]]:
    sample_posts = [
        {
            "pillar": "PAIN",
            "niche": "destination photographer",
            "hook": "Your photos look bookable worldwide. Your website still makes you look local.",
            "linkedin": {
                "post": dry_run_linkedin("destination photographer"),
                "hashtags": ["destinationphotography", "photographybusiness", "portfoliowebsite"],
                "cta": "DM me WEBSITE",
            },
            "x": {
                "format": "thread",
                "post": [
                    "Your photos look bookable worldwide. Your website still makes you look local.",
                    "That mismatch matters when a couple in Italy, a hotel in Tulum, or a brand in New York looks you up.",
                    "They are not just judging your photos. They are judging whether your presentation feels safe enough for a serious budget.",
                    "$799, 14 days, $69/month managed. You send the work and details. I build the portfolio that makes the price feel natural.",
                    "DM me WEBSITE and I will show you what yours could look like.",
                ],
            },
            "visual": dry_run_visual("comparison"),
            "buffer_tip": "Use this with a side-by-side Instagram profile vs mobile portfolio screenshot.",
        },
        {
            "pillar": "OFFER",
            "niche": "wedding photographer",
            "hook": "One wedding booking can pay for the website for years.",
            "linkedin": {
                "post": dry_run_linkedin("wedding photographer"),
                "hashtags": ["weddingphotography", "photographerbusiness", "creativebusiness"],
                "cta": "Reply WEBSITE and I will show you what yours could look like",
            },
            "x": {
                "format": "thread",
                "post": [
                    "One wedding booking can pay for the website for years.",
                    "The question is not whether $799 is expensive. The question is whether one missed premium inquiry is more expensive.",
                    "When a couple asks for your website and you send Instagram, you make them work too hard to trust you.",
                    "Veepo gives you the clean link: gallery, story, contact path, mobile polish, live in 14 days.",
                    "Reply WEBSITE and I will show you what yours could look like.",
                ],
            },
            "visual": dry_run_visual("screenshot"),
            "buffer_tip": "Post when photographers are between editing blocks: late morning or early afternoon.",
        },
        {
            "pillar": "EDUCATION",
            "niche": "brand photographer",
            "hook": "Instagram gets you discovered. Your website gets you trusted.",
            "linkedin": {
                "post": dry_run_linkedin("brand photographer"),
                "hashtags": ["brandphotography", "portfoliowebsite", "creativebusiness"],
                "cta": "Link in first comment",
            },
            "x": {
                "format": "thread",
                "post": [
                    "Instagram gets you discovered. Your website gets you trusted.",
                    "A creative director can like your grid and still hesitate if there is no professional place to evaluate you.",
                    "A portfolio controls the sequence: best work, positioning, credibility, contact. That is the mechanism.",
                    "The goal is not prettier pixels. The goal is making a serious buyer feel safe enough to inquire.",
                    "Link in first reply if you want to see the template I build for photographers.",
                ],
            },
            "visual": dry_run_visual("nano_banana_prompt"),
            "buffer_tip": "Pair with a contact form screenshot to make the mechanism obvious.",
        },
    ]
    return [score_post(normalize_post(post)) for post in sample_posts]


def dry_run_linkedin(niche: str) -> str:
    paragraphs = [
        "A client asks for your website and you pause.",
        f"That pause is the whole problem for a {niche}. Not because your work is weak. Because the place you send people does not match the level of the work.",
        "Maybe you send Instagram. Maybe you send a Linktree. Maybe you send a Google Drive folder and try to explain the story in the email because the link itself does not do the job.",
        "The client feels the mismatch. They may not say it out loud, but they feel it. Your photos say premium. Your presentation says still figuring it out.",
        "That gap changes the way people interpret your price. It makes higher numbers feel less natural. It makes serious buyers hesitate. It makes low-budget inquiries more common because your online presence is anchoring you too low.",
        "This is why two photographers with similar work can get completely different inquiries. One looks like a talented person with a camera. The other looks like a professional creative who belongs in a bigger room. The difference is not always talent. Often it is the frame around the talent.",
        "Instagram is useful for attention, but it is messy for trust. A serious buyer has to scroll, guess, tap through highlights, read old captions, and piece together what you actually offer. A website does the opposite. It controls the first impression and removes the work from the buyer.",
        "A good portfolio website fixes the first impression. It gives your best work a controlled frame. It explains who you shoot for. It gives serious clients a clean contact path. It makes your business feel as established as your images already look.",
        "That matters before the first call. If someone already trusts your presentation, your price has less explaining to do. If they land on something scattered, your first conversation starts with friction you should never have had to overcome.",
        "The website does not make weak work strong. That is not the promise. The promise is simpler: if the work is already strong, the presentation should stop making it feel smaller than it is. Your site should make the right client think, this photographer is serious, before they ever send the inquiry.",
        "That is what I build through Veepo. $799 to launch. Live in 14 days. $69/month managed after that. You send the photos and details. I handle the design, build, copy structure, mobile polish, and inquiry path.",
        "You are not buying a template. You are buying the moment where someone opens your link and immediately understands that you are ready for better projects.",
        "Your photos already look expensive. Your website should too.",
        "DM me WEBSITE",
    ]
    return "\n\n".join(paragraphs)


def dry_run_visual(kind: str) -> dict[str, str]:
    return {
        "type": kind,
        "concept": "A split-screen comparison showing a scattered Instagram profile beside a polished Veepo photographer portfolio on mobile.",
        "asset_needed": "Screenshot of veepo.ca/templates photography template mobile hero plus a generic/non-identifying Instagram-style mockup.",
        "nano_banana_prompt": "Create a premium dark-slate marketing graphic for a photography website offer. Left side: messy social profile mockup labeled 'Scattered attention'. Right side: elegant mobile portfolio website mockup labeled 'Premium trust'. Use no fake metrics, no fake testimonials, no client logos. Add subtle blue accent, clean spacing, editorial photography mood.",
        "overlay_text": "Your photos already look expensive. Your website should too.",
        "recommended_format": "LinkedIn image",
    }


def save_to_history(posts: list[dict[str, Any]], brand_id: str) -> str:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    existing = json.loads(DATA_FILE.read_text(encoding="utf-8")) if DATA_FILE.exists() else []
    record = {
        "id": f"{brand_id}-{date.today().isoformat()}",
        "brand_id": brand_id,
        "date": date.today().isoformat(),
        "generated_at": datetime.now().isoformat(),
        "status": "emailed",
        "selected_option": None,
        "posts": posts,
    }
    existing = [r for r in existing if r.get("id") != record["id"]]
    existing.insert(0, record)
    DATA_FILE.write_text(json.dumps(existing, indent=2), encoding="utf-8")
    PUBLIC_DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_DATA_FILE.write_text(json.dumps(existing, indent=2), encoding="utf-8")
    return record["id"]


def format_x_post(x_data: dict[str, Any]) -> str:
    if x_data["format"] == "thread":
        tweets = x_data["post"] if isinstance(x_data["post"], list) else [x_data["post"]]
        return "<br><br>".join(
            f'<span style="font-size:11px;font-weight:700;color:#666;">TWEET {i + 1}/{len(tweets)}</span><br>{html.escape(str(tweet))}'
            for i, tweet in enumerate(tweets)
        )
    return html.escape(str(x_data["post"]))


def build_email(posts: list[dict[str, Any]], brand: dict[str, Any], record_id: str) -> str:
    today = datetime.now().strftime("%A, %B %d, %Y")
    options_html = ""

    for i, post in enumerate(posts, 1):
        hashtags = " ".join(f"#{h.lstrip('#')}" for h in post["linkedin"]["hashtags"])
        x_html = format_x_post(post["x"])
        visual = post.get("visual", {})
        color, bg = pillar_colors(post["pillar"])
        linkedin_post = html.escape(post["linkedin"]["post"]).replace("\n", "<br>")

        options_html += f"""
        <div style="margin-bottom:32px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <div style="background:#0f172a;padding:14px 20px;">
            <span style="color:#fff;font-weight:700;font-size:16px;">Option {i}</span>
            <span style="margin-left:10px;background:{bg};color:{color};font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">{html.escape(post['pillar'])}</span>
            <span style="margin-left:6px;color:#94a3b8;font-size:12px;">{html.escape(post['niche'])}</span>
            <span style="float:right;color:#f8fafc;font-size:12px;font-weight:700;">Score {post.get('quality_score', 'N/A')}/10</span>
          </div>
          <div style="background:#f8fafc;padding:12px 20px;border-bottom:1px solid #e5e7eb;">
            <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">HOOK</div>
            <div style="font-style:italic;color:#1e293b;font-size:14px;">"{html.escape(post['hook'])}"</div>
          </div>
          <div style="padding:20px;">
            <div style="background:#ecfdf5;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin-bottom:16px;">
              <div style="font-size:11px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Why this might win</div>
              <div style="font-size:13px;color:#14532d;">{html.escape(post.get('why_this_might_win', 'Strong angle.'))}</div>
              <div style="font-size:12px;color:#166534;margin-top:6px;">{html.escape(post.get('quality_notes', ''))}</div>
            </div>

            <p style="font-size:11px;font-weight:700;color:#0077b5;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">LINKEDIN</p>
            <div style="background:#f8fafc;border-left:3px solid #0077b5;padding:14px;border-radius:0 8px 8px 0;font-size:14px;line-height:1.7;color:#1e293b;margin-bottom:6px;">{linkedin_post}</div>
            <div style="font-size:13px;color:#0077b5;margin-bottom:6px;">{html.escape(hashtags)}</div>
            <div style="background:#eff6ff;padding:8px 12px;border-radius:6px;font-size:13px;color:#1d4ed8;font-weight:600;margin-bottom:4px;">{html.escape(post['linkedin']['cta'])}</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:20px;">Put veepo.ca/templates in the first comment, not the post body.</div>

            <p style="font-size:11px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">X - {html.escape(post['x']['format'].upper())}</p>
            <div style="background:#f8fafc;border-left:3px solid #000;padding:14px;border-radius:0 8px 8px 0;font-size:14px;line-height:1.7;color:#1e293b;margin-bottom:14px;">{x_html}</div>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:14px;">
              <div style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Visual idea</div>
              <div style="font-size:13px;color:#0f172a;margin-bottom:4px;"><strong>Concept:</strong> {html.escape(str(visual.get('concept', '')))}</div>
              <div style="font-size:13px;color:#0f172a;margin-bottom:4px;"><strong>Asset:</strong> {html.escape(str(visual.get('asset_needed', '')))}</div>
              <div style="font-size:13px;color:#0f172a;"><strong>Overlay:</strong> {html.escape(str(visual.get('overlay_text', '')))}</div>
            </div>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:8px 12px;border-radius:6px;font-size:13px;color:#166534;">{html.escape(post['buffer_tip'])}</div>
          </div>
        </div>"""

    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:680px;margin:0 auto;padding:28px 16px;">
  <div style="background:#0f172a;border-radius:12px 12px 0 0;padding:28px;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">{html.escape(brand['name'])} - Daily Content</p>
    <h1 style="color:#fff;font-size:22px;margin:0 0 4px;">Your Best 3 Posts for Today</h1>
    <p style="color:#64748b;font-size:13px;margin:0;">{today}</p>
  </div>
  <div style="background:#1e293b;padding:12px 28px;margin-bottom:20px;border-radius:0 0 8px 8px;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">Generated, scored, and ranked. Pick one, paste into Buffer, then use the visual idea if you want extra reach.</p>
  </div>
  {options_html}
  <div style="text-align:center;padding:20px;color:#94a3b8;font-size:11px;">
    <p style="margin:0;">Record ID: {html.escape(record_id)} - <a href="{brand['templates_url']}" style="color:#60a5fa;">{brand['templates_url']}</a></p>
  </div>
</div></body></html>"""


def pillar_colors(pillar: str) -> tuple[str, str]:
    colors = {
        "PROOF": ("#166534", "#dcfce7"),
        "PAIN": ("#991b1b", "#fee2e2"),
        "EDUCATION": ("#1e40af", "#dbeafe"),
        "PROCESS": ("#6b21a8", "#f3e8ff"),
        "OFFER": ("#92400e", "#fef3c7"),
    }
    return colors.get(pillar, ("#374151", "#f3f4f6"))


def send_email(posts: list[dict[str, Any]], brand: dict[str, Any], record_id: str) -> None:
    configure_resend()
    today_str = date.today().strftime("%A %b %d")
    result = resend.Emails.send(
        {
            "from": f"{brand['name']} Social <social@veepo.ca>",
            "to": [brand["owner_email"]],
            "subject": f"{today_str} posts - scored and ready for Buffer",
            "html": build_email(posts, brand, record_id),
        }
    )
    print(f"  Email sent (ID: {result['id']})")


def main(brand_id: str = "veepo", dry_run: bool = False) -> None:
    brand = load_brand(brand_id)
    today_str = date.today().strftime("%A %b %d")
    mode = "DRY RUN" if dry_run else "LIVE"
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {mode} - Generating for {brand['name']} - {today_str}")

    posts = generate_posts(brand, dry_run=dry_run)
    for i, post in enumerate(posts, 1):
        errors = validate_post(post)
        if errors:
            raise GenerationError(f"Final post {i} failed validation: {'; '.join(errors)}")
        print(f"  Option {i}: score {post['quality_score']} - {post['pillar']} / {post['niche']}")

    if dry_run:
        print("  Dry-run complete. No file saved. No email sent.")
        print(json.dumps(posts, indent=2)[:2500])
        return

    record_id = save_to_history(posts, brand_id)
    print(f"  Saved to history (ID: {record_id})")
    send_email(posts, brand, record_id)
    print("Done.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Veepo daily content.")
    parser.add_argument("brand_id", nargs="?", default="veepo")
    parser.add_argument("--dry-run", action="store_true", help="Validate sample output without API calls, saving, or email.")
    args = parser.parse_args()
    main(args.brand_id, dry_run=args.dry_run)
