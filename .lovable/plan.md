# Pre-fill VeePo Profiles + World-Class Audit

## Part 1 — Seed the profile URLs

Insert two rows into `social_accounts` so the Performance page loads with them already saved (no need to type/paste):

- **X**: `https://x.com/Veepo_web` (handle: `Veepo_web`)
- **LinkedIn**: `https://www.linkedin.com/in/parker-gawryletz/recent-activity/all/` (handle: `parker-gawryletz`)
  - The `/recent-activity/all/` suffix is critical — without it Firecrawl scrapes the static profile header instead of the post feed.

If rows already exist for those platforms, update them in place (idempotent upsert by `platform`).

## Part 2 — World-class audit (no code changes unless audit finds a bug)

A six-pass review of the closed loop end-to-end. Each pass produces a pass/fail with a one-line fix recommendation if it fails.

### Pass 1 — Database integrity
- Confirm `social_accounts`, `post_performance`, `social_trends` tables exist with expected columns.
- Confirm `generated_posts` has `live_post_url`, `matched_at`, `latest_*`, `last_tracked_at` columns.
- Confirm `post_themes` has `avg_engagement_rate`, `performance_sample_size`.
- Confirm RLS policies + GRANTs let the edge functions (service role) read/write.
- Confirm pg_cron jobs are scheduled (daily 09:00 UTC tracker, Mondays 08:00 UTC trends).

### Pass 2 — Secrets & connectors
- `FIRECRAWL_API_KEY` present (already confirmed).
- `LOVABLE_API_KEY` present for the Gemini calls in `scan-social-trends`.
- Verify Firecrawl credentials with the gateway verify endpoint.

### Pass 3 — Live edge function smoke test
- Deploy `track-post-performance`, `scan-social-trends`, `match-post-url` (ensure latest code is live).
- `curl` invoke `track-post-performance` once. Expect JSON with `scraped[]` showing both platforms returned >0 posts, plus `matched` and `snapshots` counts.
- Inspect logs for any silent Firecrawl/parse errors.
- `curl` invoke `scan-social-trends` once. Expect `inserted > 0` and rows in `social_trends`.

### Pass 4 — Match-quality spot check
- Read 3 random rows from `post_performance` and confirm `raw.snippet` actually resembles the matched `generated_posts.copy` (catches the Levenshtein threshold being too loose).
- If match distance is consistently >15, recommend tightening the threshold or expanding the compared prefix.

### Pass 5 — Learning-loop wiring
- Re-read `generate-daily-posts/index.ts` and confirm:
  - It pulls top-N posts by `latest_engagement_rate`.
  - It pulls current-week rows from `social_trends`.
  - Both are injected into the system prompt (not silently dropped).
- Confirm `post_themes.avg_engagement_rate` is consumed by the existing pillar/theme bias logic.

### Pass 6 — UI sanity
- Load `/ops-portal/performance`, confirm the two profile URLs render pre-filled.
- Confirm the "Run tracker now" and "Scan weekly trends" buttons return non-error toasts.
- Confirm the "All posts" table renders without empty/undefined cells.

## Deliverable

A single audit report posted back in chat:

```text
✅/❌  Pass 1 Database integrity      — <details>
✅/❌  Pass 2 Secrets & connectors    — <details>
✅/❌  Pass 3 Edge function smoke     — <matched=N, snapshots=N, trends=N>
✅/❌  Pass 4 Match quality           — <avg distance, sample>
✅/❌  Pass 5 Learning loop wiring    — <confirmed injections>
✅/❌  Pass 6 UI sanity               — <screenshots/notes>

Fixes applied: <list, or "none — system is green">
```

If any pass fails, I apply the smallest possible fix (edge function tweak, threshold change, missing GRANT, missing cron job) in the same build pass and re-run that pass until green.

## Out of scope
- No new tables, no new edge functions, no schema changes (unless audit uncovers a missing column/grant).
- LinkedIn impressions remain manual — the audit will not try to scrape logged-in impression data.
