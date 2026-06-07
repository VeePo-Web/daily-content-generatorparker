# Post Performance Tracker + Learning Loop

Closes the loop between published posts → real-world performance → AI generator bias, so each day's drafts skew toward patterns that actually win.

## How it works

```text
Generated post  ──►  You publish on LinkedIn/X  ──►  Paste profile URLs once
                                                              │
                                                              ▼
                                              Daily cron (T+1, T+3, T+7)
                                                Firecrawl scrape profile
                                                Fuzzy-match copy → post
                                                Store impressions/likes/
                                                comments/reposts
                                                              │
                                ┌─────────────────────────────┼─────────────────────────┐
                                ▼                             ▼                         ▼
                       Trend research scan           Score top-quartile        Update generator bias
                       (Firecrawl + AI)              hooks/lengths/themes      (themes, hook patterns,
                                                                                length, structure)
```

## What gets built

### 1. Profile registration (one-time)
- New `social_accounts` table holding your LinkedIn + X profile URLs.
- Tiny admin form at `/ops-portal/social-accounts` to paste and edit them.

### 2. Performance tracking
- New table `post_performance` linked to `generated_posts` — stores impressions, likes, comments, reposts/retweets, plus the live `post_url` once matched.
- Edge function `track-post-performance` (runs daily via pg_cron):
  - Scrapes your LinkedIn + X profile pages with Firecrawl.
  - For every generated post in the last 14 days, fuzzy-matches first ~80 chars of copy against scraped posts to find the live URL.
  - Re-scrapes that post URL to pull current metric counts.
  - Writes snapshots at T+1d, T+3d, T+7d so growth is visible (not just final number).

### 3. Trend scanner
- Edge function `scan-social-trends` (runs weekly):
  - Uses Firecrawl search + scrape on top-performing LinkedIn/X posts in your niche (web design, photographers, owner-operator service businesses).
  - Lovable AI extracts hook patterns, structures, and topical angles into a `social_trends` table with weekly snapshots.
  - Feeds into the generator prompt as "what's working right now in your niche."

### 4. Learning loop (auto-bias)
- Extend `post_themes` with rolling `avg_impressions`, `avg_engagement_rate`, `last_performance_at`.
- Extend `generate-daily-posts`:
  - After scoring, pull top-quartile historical posts by engagement rate.
  - Extract their hook pattern, length bucket, theme — bias new generation toward them (same mechanism as the existing `pillar_bias`).
  - Inject "Trending hook patterns this week" block into the system prompt from `social_trends`.
  - Inject "Your top 3 performing posts of all time (don't copy, learn the pattern)" examples.

### 5. Dashboard view
- New page `/ops-portal/performance`:
  - Table of all generated posts with live metrics, growth trend, matched/unmatched status.
  - "Top performers" panel — what's working.
  - "Weekly trends" panel — what the scanner found.
  - Manual "force-match URL" button for any post that auto-match missed.

## Technical details

**New tables**
- `social_accounts` (platform, profile_url, handle)
- `post_performance` (generated_post_id, post_url, captured_at, impressions, likes, comments, shares, day_offset)
- `social_trends` (week_of, niche, hook_pattern, example_copy, source_url, est_engagement)

**Existing tables touched**
- `generated_posts` — add `live_post_url`, `matched_at`, `engagement_rate` (latest)
- `post_themes` — add `avg_engagement_rate`, `performance_sample_size`

**Edge functions**
- `track-post-performance` — daily, scrapes profiles + post URLs
- `scan-social-trends` — weekly, niche research
- `match-post-url` — manual override endpoint for dashboard

**Cron**
- pg_cron + pg_net invoking the edge functions on schedule.

**Firecrawl usage**
- Profile scrape: ~2 pages/day (LinkedIn + X) — cheap.
- Individual post re-scrape: capped at 30 posts × 3 snapshots = max 90/day.
- Weekly trends: ~20 search + scrape calls.

**Fuzzy match**
- Normalize whitespace + lowercase, compare first 80 chars with Levenshtein distance ≤ 6 — already proven for the existing email-typo detector.

## Limits to flag now

- LinkedIn often hides impression counts on other people's posts; we'll always get likes/comments/reposts, but impressions only show on **your own** posts when scraped while logged in. Workaround: Firecrawl can't log in as you. We'll show impressions as "manual" — you can paste them weekly from your LinkedIn analytics tab if you want full data. Likes/comments/reposts are fully automated.
- X (Twitter) without a paid API only exposes public reactions reliably; impressions are visible on your own posts if the scraper can reach them, otherwise same manual fallback.
- The trend scanner finds public top posts — it can't access X's "For You" personalization.

I'll surface unmatched posts clearly in the dashboard so nothing silently drops.
