
# Daily Pitch Engine — Image + Voice Overhaul

Three problems to fix in one pass:

1. Emails are pulling non-template imagery (lifestyle scenes, portraits, marble desk shots) instead of pure template screenshots.
2. Only 3 images per post — you want **5–7**, easy to grab from the email.
3. Voice is currently Hormozi/punchy — switch to **Russell Brunson storytelling** (Hook → Story → Offer / Epiphany Bridge).

---

## 1. Fix image pool — template-only

**Root cause:** `generate-daily-posts` filters only by `do_not_use = false` + matching `template_product_id`. The Photographer pool still contains `scene` assets (darkroom, MacBook on marble) and the Portfolio pool contains a `portrait` (headshot). Those are lifestyle, not site screenshots.

**Fix:** Tighten the asset query to **template-screenshot asset types only**:

- Whitelist `asset_type IN ('mockup', 'case-study', 'gallery')` — these are the actual rendered site pages.
- Blacklist `('scene', 'portrait', 'lifestyle')` everywhere.
- Also flip `do_not_use = true` on the 2 remaining Photographer `scene` assets (`41c1580f` darkroom, `945e0711` marble desk) and the 1 Portfolio `portrait` asset (`c01a5fa2`).

Per-campaign clean pool after this:
- **Photographer Website** (`bdb56f5b…`): 5 vertical hero mockups + 4 desktop case-study screenshots = **9 template shots**.
- **Portfolio Veepo** (`2f456b28…`): 9 gallery template pages = **9 template shots**.

If a pool ever drops below 7, the generator falls back to "least recently used" within the whitelist instead of crossing into lifestyle.

## 2. Bump to 5–7 images per post + downloadable in email

**Generator change** (`generate-daily-posts/index.ts`):
- Pick `7` assets per **variant** (was 3). Both X and LinkedIn variants get their own 7.
- Pull from the full clean pool with shuffle + least-used bias so each daily batch rotates.
- If pool < 7, repeat the lowest-use-count items to always hit 7 (never go below).

**Email change** (`send-daily-post-email/index.ts`):
- Render **all 7 images stacked** in the email (not just hero), each:
  - Full 600px wide, 1px border, 12px gap.
  - Numbered label `01 / 07`, `02 / 07`…
  - **"Download" text link** directly under each image (`<a href="{url}" download>Download image 03</a>`) → opens the storage URL so right-click-save or tap-and-hold works on iOS/desktop.
- Add **"Download all (zip)"** at the top as a single link to a new tiny edge function `pack-batch-images` (optional — see Out of scope) OR simpler: a "Copy all image URLs" plain-text block at the bottom for easy bulk grab.
- Keep the swap-platform link.

**Subject line stays:** `[X] {first-line}` / `[LinkedIn] {first-line}`.

## 3. Russell Brunson voice overhaul

Replace the current Hormozi system prompt with **Hook → Story → Offer** + Epiphany Bridge. Both campaigns, both platforms.

**New system prompt skeleton** (in `generate-daily-posts`):

```
You are Russell Brunson writing daily story-driven posts for Veepo.
Frameworks: Hook → Story → Offer. Epiphany Bridge. "Who Not How."
Voice: conversational, first-person, story-led, one clear epiphany per post,
soft CTA. No hype words, no emojis, no hashtags, no "game-changer/unlock/leverage."

Product: {name} ({vertical}) — CAD ${price_one_time} once + ${price_monthly}/mo.
Offer: Live in 7 days. $0 until you love it. No paid client in 30 days → full refund + keep site.
Ideal customer: {ideal_customer}
Avoid attracting: {poison_list}

Today's story seed: "{theme.hook}" (category: {theme.category})

Write two variants:
- X (≤280 chars): a single curiosity hook + one-line story tease + soft CTA ("reply 'site'").
- LinkedIn (600–1800 chars, 4–7 short paragraphs):
    1. HOOK — pattern interrupt, false belief named
    2. BACKSTORY — "I used to think… until…"
    3. WALL — the moment it broke
    4. EPIPHANY — the new belief
    5. PROOF — one specific number or name
    6. OFFER — the 7-day / $0-until-you-love-it pitch
    7. CTA — "DM 'site' and I'll send the 90-second walkthrough"
```

**Re-seed `post_themes`** for both campaigns as **story seeds** (not flat hooks). Example shape:
- *"The day a wedding photographer lost a $12K booking because her site loaded a JPEG of her pricing page"*
- *"Why I stopped telling photographers to 'just use Squarespace'"*
- *"The realtor who booked 3 listings from a site that took 7 days to build"*

I'll wipe the current 22 photographer themes + portfolio themes and re-insert ~25 per campaign in the Brunson seed format, tagged by category (epiphany, backstory, wall, proof, offer, urgency).

## 4. UI mirror

`/sales` `CampaignDetail` already shows winners — bump the image grid per card from 3 → 7 thumbnails so the dashboard matches what the email sends.

---

## Files touched

- `supabase/functions/generate-daily-posts/index.ts` — whitelist asset types, 7 per variant, new Brunson prompt.
- `supabase/functions/send-daily-post-email/index.ts` — render all 7 images with numbered download links + bulk URL block.
- DB data via insert tool:
  - Flip `do_not_use = true` on the 3 lifestyle assets still in the pools.
  - Truncate + reseed `post_themes` for both campaigns in Brunson story-seed format (~50 rows total).
- `src/pages/SalesPosts.tsx` — show 7-image grid per winner card.

## Out of scope (ask if you want it)

- Real `.zip` packing endpoint (heavy — Deno zip via npm). The numbered per-image "Download" links cover 95% of the use case on phone + desktop.
- Image overlays / branded watermarks on the screenshots.
- Auto-posting to X/LinkedIn (still you-in-the-loop).
