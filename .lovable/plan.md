## Audit findings (current state)

| Campaign | Scoped hooks | Global hooks bleeding in | Assets | Batches |
|---|---|---|---|---|
| Hotel & Boutique Stay Site (`bdb56f5b…`) | **0** | 27 (all hotel-flavored) | 10 hotel + 6 mixed | 3 |
| Portfolio Website Template (`2f456b28…`) | 16 (clean) | 27 (hotel-flavored — bleeding) | 10 portfolio + 6 mixed | 6 |

**Problems**
1. The "global" hook pool is not generic — it's the old hotel plan. It's polluting every Portfolio morning email with OTA / direct-booking / 12-rooms copy.
2. Hotel campaign has no identity of its own (0 scoped hooks, runs off pollution).
3. Hotel-themed scene assets (hotel lobby, hotel bed, Tulum, Bali pool) mix into both campaigns. You asked for **template screenshots only** — no on-location hotel/travel photos.
4. Campaign name + slug + vertical no longer match Parker's actual offer (he's selling the template to photographers, not hoteliers).

---

## The plan — data only, no code changes

### Step 1 — Rename the Hotel campaign in place
Update row `bdb56f5b-ee91-4b3b-977e-5a41feb58969`:
- `name`: "Hotel & Boutique Stay Site" → **"Photographer Website"**
- `slug`: `hotel-boutique-stay` → **`photographer-website`**
- `vertical`: `hotel` → **`photography`**
- `one_liner`: → **"The site that makes the camera look like the second-best thing about you."**
- `ideal_customer`: → **"Working photographers ($60K–$300K/yr) — wedding, brand, portrait, editorial — whose Instagram outperforms their website by 100×, and who lose enquiries every week to a Squarespace that doesn't sell the way their work does."**
- `poison_list`: → **"Hobbyists. People who think 'a contact form' is a strategy. Anyone shopping on price. Photographers who already get all the work they want."**
- `proof_points`: rewritten — 7-day delivery, custom domain, Stripe deposits, Cal.com booking, draft #1 free, $799 once / $69/mo, gallery-grade layout, fast on 3G.
- Pricing unchanged: **$799 / $69**.

### Step 2 — Delete all 27 hotel-flavored "global" hooks
Hard delete `post_themes` where `template_product_id IS NULL`. They reference OTAs, room counts, hotel operators, and Booking.com — none of it fits either current campaign. The Portfolio campaign already has 16 clean scoped hooks and will run cleanly off those alone.

### Step 3 — Write ~22 Photographer-scoped hooks
All scoped to `bdb56f5b…`. Voice: David Ogilvy + spiritual warfare, no soft marketing, no "comfort/soft", Summer 2026 dating. Categories + rough counts:
- **pain** (5): wedding couples Googling you at 11pm and finding a Wix; Squarespace gallery that takes 6s to load; "DM for pricing" graveyard; the gap between your $5K-a-shoot work and the site delivering it; you're sending paid traffic to a Linktree.
- **status** (4): photographers booked in *Vogue Weddings* don't have Wix sites; your portfolio is editorial — your site is a brochure; agencies want $12K, we ship Tuesday for $799; the print-magazine test.
- **myth-bust** (3): "SEO takes 6 months" (said by people charging you for 6 months of SEO); "I'll just use Pic-Time"; "my Instagram IS my portfolio".
- **proof** (3): client booked $14K wedding 4 days after launch; 0.9s load vs. 4.2s; "where's your pricing" → "what's your deposit" same prospect.
- **transformation** (3): from DM-to-book to Stripe-deposit-on-every-enquiry in 8 days; Squarespace → custom yourname.com in one week; cold portfolio reviews → inbound qualified leads.
- **offer** (2): $799 once + $69/mo, live in 7 days, refund + keep the site if it doesn't book; rebuild draft #1 free.
- **urgency** (2): 4 clients a month, 2 slots left for Summer 2026; price moves to $1,199 Aug 1.

### Step 4 — Clean the asset pool
- Reassign template mockups (`hero/vertical-*`, `case-*`) to **Photographer Website** so they're scoped, not global. These show the actual website templates Parker is selling.
- Mark `do_not_use = true` on **hotel-lobby** and **hotel-bed** scenes — these read as "we sell to hotels", which is wrong.
- Mark `do_not_use = true` on **Bali pool** and **Tulum beach** scenes — too digital-nomad-travel, not photographer.
- Keep **marble desk + Leica** and **darkroom** scenes assigned to Photographer Website.
- Portfolio Website Template assets stay as-is.

### Step 5 — Verify the bento grid auto-updates
`/sales` reads `name`, `vertical`, `one_liner`, hook counts, asset background straight from these tables. No UI code change needed — the tile will relabel itself to **Photographer Website** on next load, with its own dedicated hooks and template-screenshot background.

### Step 6 — Cron untouched
Both cron jobs already run at 14:00 UTC (7am MST) per campaign. Tomorrow morning's Photographer email will come from the new hook pool automatically.

---

## Technical notes

- All steps are `UPDATE`/`DELETE`/`INSERT` on `template_products`, `post_themes`, `template_assets` — no migration, no edge function code, no frontend code.
- `generated_posts` history for the old Hotel campaign is **retained** (still tied to id `bdb56f5b…`); the campaign card will show 3 historical batches under the new "Photographer Website" name. If you want those purged too, say so and I'll add a 7th step.
- Portfolio Website Template (`2f456b28…`) is left alone — it already has clean scoped hooks and was rebuilt last turn.