
# The Strategy (Hormozi Mode — I'm Deciding)

You gave me the keys. Here are the locked-in answers I'm building against:

**The ONE outcome**: *"Live in 7 days. Booked in 30. Or you don't pay."* — combines speed + outcome + zero-risk. Strongest hook for cold traffic in service sales.

**Guarantee**: **"Pay $0 until the site is live and you love it. If a paid client doesn't book through it in 30 days, full refund AND you keep the site."** — biggest-promise-in-the-category move. Filters tire-kickers (they assume scam). Magnetic to serious operators (they assume confidence).

**Target**: **Owner-operators doing $80K–$400K/year who still send leads to a Linktree or a Squarespace from 2019.** Specifically — wedding/event photographers in mid-tier metros, and 8–40 room boutique/lifestyle hotels & short-term rental portfolios. **Poison list**: agencies, MLM, anyone asking "what's the cheapest option," anyone wanting "just a logo refresh."

**Post format**: Server generates **3 platform-native variants per day** (X, IG carousel, LinkedIn) from the same hero theme. Email shows you the **WINNER only** + 1-click "swap to variant B / C" links.

---

# What Gets Built

## 1. Screenshot Asset Library (no more watermarks)

I have direct cross-project read access to both template projects. I will pull (one-time seed):

- **Photographer template** — 40 hero gallery shots + 8 portraits (already in `src/assets/`) + 6 captured section screenshots of the live UI (hero, portfolio grid, about, contact, series page, mobile view) using the in-sandbox preview navigator.
- **Hotel template** — 6 case-study desktop mockups + 19 vertical category heroes + 6 captured section screenshots (hero, property grid, listing detail, about, pitch deck section, mobile).

All uploaded to a new public Supabase Storage bucket `template-screenshots/` with structured keys:
```
template-screenshots/
  photographer/section-hero-desktop.png
  photographer/section-hero-mobile.png
  photographer/portfolio-grid.png
  photographer/series-detail.png
  ... (~25 clean screenshots)
  hotel/section-hero-desktop.png
  hotel/case-study-calem-wood.png
  ... (~25 clean screenshots)
  scenes/laptop-on-hotel-bed.jpg     ← AI-generated, no people
  scenes/phone-tulum-beach.jpg
  scenes/marble-desk-macbook.jpg
  ... (12 in-context scenes, generated once via Lovable AI gateway)
```

Total seed: **~60 screenshots + 12 AI scenes = 72 unique assets** the post-generator can mix.

## 2. Database Schema (new tables)

```sql
template_products          -- 2 rows: photographer ($799+$69), hotel ($799+$69)
template_assets            -- 72 rows, type=screenshot|scene, tags[], template_id
post_themes                -- 30 seeded hooks (Hormozi angles, rotated)
generated_posts            -- per-day batch: 3 variants (x, ig, linkedin), winner_id, swap_token
post_send_log              -- audit trail of daily emails
```

RLS: admin-only. Owner (parker@veepo.ca) read/write via existing `has_role(_, 'admin')`.

## 3. Edge Functions (3 new)

- **`generate-daily-posts`** — runs nightly at 6:55am MST via pg_cron
  - Picks 1 of 2 template products (alternating + boosted by past CTR)
  - Picks 1 theme from `post_themes` (not used in last 14 days)
  - Calls Lovable AI Gateway (gemini-3-flash-preview) with theme + 3 random matching assets per variant
  - Generates 3 platform variants: X (single image, punchy 280-char), IG (5-slide carousel copy + image picks), LinkedIn (story-format + before/after pair)
  - Server pre-scores each (length fit, hook strength, CTA presence) → picks winner
  - Stores all 3 in `generated_posts`, marks `is_winner=true` on best
- **`send-daily-post-email`** — runs 7:00am MST, sends winner-only digest to parker@veepo.ca via Resend
  - Email shows: hero image, winning copy, platform pill, "Post this" copy-to-clipboard button, "Swap → IG variant" / "Swap → LinkedIn variant" magic links
- **`swap-post-winner`** — public endpoint hit by email magic links; flips `is_winner` to chosen variant, returns confirmation page

## 4. Admin UI (`/ops-portal/posts`)

- List view: last 30 days of generated posts, winner highlighted, click-to-preview all 3 variants
- "Generate now" button (bypass cron for testing)
- Theme manager: add/edit/disable hooks
- Asset library viewer: see all 72 screenshots, tag/retag, mark "do not use"

## 5. The 30 Seed Hooks (Hormozi angles, rotated)

Categories — `pain` (8), `proof` (6), `status` (5), `urgency` (4), `myth-bust` (4), `transformation` (3):
- *"Your Squarespace site costs you 2 bookings a month. Math: 2 × $2,400 avg = $57,600/year. The new site is $799."*
- *"I built this for a Tulum hotel Tuesday. They booked $14K Friday. Screenshot below."*
- *"Your competitor's site loads in 0.9s. Yours in 4.2s. Google ranks 0.9s on page 1."*
- *"$799 once. $69/mo. Live in 7 days. Pay $0 until you love it. What's the catch? There isn't one."*
- *"Agencies quote you $12K and ship in 8 weeks. We ship Tuesday for $799. Same Stripe, same Cal.com, same DNS."*
- *(25 more)*

Each post pulls 1 hook + slots in product-specific proof (template type, vertical, price).

## 6. Resend Setup

Uses existing **Resend connector + veepo.ca domain** (no new infra). From: `pitch@veepo.ca`. The "WINNER ONLY" daily email is plaintext-feeling HTML (Hormozi rule: ugly emails outperform pretty ones in B2B sales).

---

# Technical Section

**Pre-flight checks:** confirm Resend connector linked (`standard_connectors--list_connections`); confirm `veepo.ca` verified in Resend (separate from Lovable Emails delegated subdomain — no conflict because we'll send from root `pitch@veepo.ca`, not the `notify.` subdomain).

**Build order:**
1. Migration: new tables + RLS + storage bucket `template-screenshots` (public read)
2. Cross-project asset copy via `cross_project--copy_project_asset` for all 48 existing images → upload to bucket via `supabase--storage_upload`
3. Browser-automation pass: navigate to each template project's preview URL, capture 6 section screenshots each at 1440px and 390px viewports → upload
4. Generate 12 AI scenes via Lovable AI gateway (gemini-3-flash-image-preview): "laptop on hotel bed, no people, golden hour", etc. → upload
5. Seed `template_products` (2 rows) + `template_assets` (72 rows with tags) + `post_themes` (30 rows)
6. Build 3 edge functions, deploy
7. pg_cron jobs at 6:55am + 7:00am MST (UTC: 13:55, 14:00)
8. Admin UI page at `/ops-portal/posts`
9. Test: trigger `generate-daily-posts` manually → verify 3 variants saved → trigger email → confirm receipt at parker@veepo.ca

**Stack:** Lovable AI Gateway (no API key needed) for copy + image scenes, Resend (existing connector) for delivery, pg_cron + pg_net for scheduling, existing admin auth/RLS.

**Cost per day:** ~$0.03 (3 Gemini Flash calls) + 1 Resend email (free tier). Negligible.

**Skipped on purpose:** no public sign-up, no marketing site for the templates themselves (that's a separate project), no Stripe (you invoice on close per the $0-upfront guarantee), no scraping the watermarked live URLs.

---

**What I need from you before I build:** nothing. I'll start the moment you hit Implement.
