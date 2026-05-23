
# Remaining Build — Daily Sales Post Engine

Schema, storage, assets, and themes are seeded. This plan covers the last three pieces.

## 1. Edge Functions (3)

**`generate-daily-posts`** (callable + cron)
- Picks 1 of 2 `template_products` (alternating, weighted by `weight`)
- Picks 1 theme from `post_themes` where `enabled=true`, ordered by `last_used_at NULLS FIRST` (rotates fairly)
- Picks 3 matching `template_assets` (tag overlap with product vertical, `do_not_use=false`)
- Calls Lovable AI (`google/gemini-3-flash-preview`) once with tool-calling to return structured JSON: `{ x: {...}, instagram: {...}, linkedin: {...} }`
- Pre-scores each variant: hook strength (first 8 words contain pain/number/proof), CTA presence, length fit per platform → marks `is_winner=true` on top score
- Inserts 3 rows in `generated_posts` sharing `batch_id`; bumps `post_themes.use_count` + `last_used_at`, `template_assets.use_count`

**`send-daily-post-email`** (callable + cron, 5 min after generate)
- Loads latest batch where no `post_send_log` row exists
- Sends to `parker@veepo.ca` via Resend connector (from `pitch@veepo.ca`)
- Plaintext-feeling HTML: winner copy + hero image + platform pill + "Copy to clipboard" link + two magic links (`?token=<swap_token>`) to swap to other variants
- Logs to `post_send_log`

**`swap-post-winner`** (public, no JWT)
- GET with `?token=<uuid>` → flips winner in batch, returns simple confirmation HTML page

## 2. Cron Jobs (pg_cron + pg_net)

```
6:55am MST (13:55 UTC) → generate-daily-posts
7:00am MST (14:00 UTC) → send-daily-post-email
```

Scheduled via `supabase--insert` (not migration) since URL + anon key are project-specific.

## 3. Admin UI — `/ops-portal/posts`

Single page added to existing ops portal routes:
- **History list** — last 30 batches, winner variant shown with platform pill, image thumb, score, swap to view siblings
- **"Generate now" button** — invokes `generate-daily-posts` for testing (bypasses cron)
- **"Send now" button** — invokes `send-daily-post-email`
- **Theme manager (inline)** — list `post_themes`, toggle enabled, add new hook with category dropdown

## 4. Test Flow

1. Click "Generate now" → verify 3 rows in `generated_posts`, 1 marked winner
2. Click "Send now" → confirm Resend delivery to parker@veepo.ca
3. Click magic link in email → verify winner swap

## Technical

- All functions: `verify_jwt = false` except admin endpoints rely on RLS via service-role
- `swap-post-winner` uses service-role to bypass RLS (token is the auth)
- Email HTML inline-styled, no external CSS
- Cost: ~$0.03/day Gemini Flash + free Resend tier

## Files

- `supabase/functions/generate-daily-posts/index.ts`
- `supabase/functions/send-daily-post-email/index.ts`
- `supabase/functions/swap-post-winner/index.ts`
- `supabase/config.toml` (add 3 function blocks)
- `src/pages/ops-portal/Posts.tsx` (new)
- `src/App.tsx` (add route)
- Cron jobs via `supabase--insert`

Ready to build on approval.
