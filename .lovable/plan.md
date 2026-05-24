## Goal
4 emails every morning at 7am MST:
- Photographer Website → 1 X post + 1 LinkedIn post
- Portfolio Website Template → 1 X post + 1 LinkedIn post

Each email is platform-specific (length, voice, format), same editorial style as today's emails.

## Changes

### 1. `generate-daily-posts` edge function
Currently emits 3 variants (X, IG, LinkedIn) and tags one as `is_winner`. Change to:
- Emit only **X** + **LinkedIn** variants (drop Instagram).
- Mark **both** as `is_winner = true` so each can be sent independently.
- Keep the AI tool-call schema, just remove the `instagram` property. Tighten prompts:
  - **X**: ≤280 chars, one punchy line, hook front-loaded, no hashtags, no emojis.
  - **LinkedIn**: 600–1800 chars, story format (3–5 short paragraphs), specific numbers, single CTA at end.
- 3 assets per variant (was 2).

### 2. `send-daily-post-email` edge function
Currently sends one email per batch (the winner). Change to:
- Accept optional `platform: "x" | "linkedin"` in the body.
- If `platform` provided → send only that variant.
- If omitted → send **two** separate emails, one per platform (X first, LinkedIn second).
- Subject line stays `[X] …` / `[LinkedIn] …`.
- `post_send_log` gets one row per (batch × platform) — add a tiny dedupe check on `(batch_id, platform)` so re-runs don't double-send. Schema change: add `platform text` column to `post_send_log`, backfill existing rows.

### 3. Cron schedule (replace existing 2 jobs with 4)
Unschedule the current 2 jobs. Schedule 4 new jobs at **14:00 UTC (7am MST)** — generate + send in sequence per campaign:

```text
14:00 UTC  daily-photographer-x          → generate(photographer) then send(photographer, x)
14:01 UTC  daily-photographer-linkedin   → send(photographer, linkedin)        [same batch]
14:00 UTC  daily-portfolio-x             → generate(portfolio) then send(portfolio, x)
14:01 UTC  daily-portfolio-linkedin      → send(portfolio, linkedin)           [same batch]
```

Simpler: one cron per campaign does `generate` then immediately POSTs `send` twice (no `platform` body → loops both). That's 2 cron jobs total, 4 emails out.

### 4. `/sales` UI (CampaignDetail)
Today the history view treats only one post per batch as winner. Update the badge logic: each batch now has 2 winners (X + LinkedIn), both bordered green. No structural change to the page — just the visual marker.

## Out of scope
- Instagram variant is removed from generation entirely (not just hidden). If you want it back later, one-line revert.
- Email design unchanged — same green left-bar, hero image, swap links.
- 7am MST timing unchanged.

## Files touched
- `supabase/functions/generate-daily-posts/index.ts` — drop IG, mark both as winner.
- `supabase/functions/send-daily-post-email/index.ts` — accept `platform`, dedupe per (batch, platform).
- `supabase/migrations/<new>.sql` — add `platform` column to `post_send_log`.
- DB data (via insert tool, not migration): unschedule old crons, schedule new ones.
- `src/pages/SalesPosts.tsx` — minor: render 2 winners per batch.