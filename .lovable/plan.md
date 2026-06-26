## Goal

Lock in the 9-client case-study rotation, guarantee every X post fits the free 280-char limit, and tighten the generator so posts are engineered to convert.

## 1. Data audit (case_studies table)

The 9 URLs you listed were already seeded last turn. I'll re-verify before touching anything:

- Confirm all 9 rows exist, `enabled = true`, URLs match exactly:
  karlsalingua.com, flexservices.info, streetsmartdetailing.com, mitfordworship.com, lineofjudah.clothing, fly4me.ca, lashesbyhalle.com, hickoryandrose.com, christophergawryletz.com
- Confirm the 3 real quotes are stored verbatim (Street Smart — Parker G., Fly4Media — Joe, Lashes by Halle — Juliette Brown) and no fabricated quotes exist on the other 6.
- Reset `last_used_at` to NULL so the rotation starts fresh across all 9 clients.

## 2. X character limit — hard enforcement

Right now the prompt asks for "220–280 chars" but nothing rejects an over-limit draft. New behavior:

- Treat X's free-tier cap as **280 characters of the final string** (URL counted as raw text, which is how X bills it for non-t.co posts in free).
- After generation, measure `final.length`. If `> 270` (10-char safety buffer for the URL + newline), retry once with: "Your draft was N characters. Hard cap is 270. Rewrite tighter — cut adjectives first, keep the contrarian hook and the URL."
- If the retry still fails, deterministically trim: drop trailing sentences (never the URL line) until ≤ 270, then re-append the URL.
- Reject empty / URL-only output.
- Log `x_chars` and a `x_within_limit: true/false` flag on the row's `score_breakdown` so the dashboard surfaces any miss.

## 3. Conversion tightening (both platforms)

Keep the David Ogilvy / Russell Brunson voice already in place, add three guards:

- **No-stats guard** stays as-is (already retries on digits).
- **Hook quality guard**: reject openers that start with "In today's", "Let's talk", "Here's why", "Ever wondered" — retry once.
- **Offer guard (LinkedIn)**: post must end with the exact line `See it live: {url}`. If missing, append it.
- **Offer guard (X)**: URL must be the final token, on its own line, with no trailing punctuation. Enforced post-generation.

## 4. Manual verification pass

After deploy, trigger one full batch per client (9 × 2 = 18 posts) into a dry-run mode that writes to DB but does NOT email. Then:

- Query `generated_posts` for today and assert: every X row ≤ 280 chars, every LinkedIn row 700–1300 chars, every post contains its client URL exactly once, zero digits outside URLs/quotes.
- Print a one-line PASS/FAIL summary per client.
- If all pass: delete the dry-run rows so tomorrow's 9am MST cron produces the real daily post cleanly.

## 5. No schedule changes

The 9am MST cron (`daily-case-study-post`) stays as-is — one client per day, rotating by `last_used_at`. The 8 old crons remain unscheduled.

## Technical notes

- File touched: `supabase/functions/generate-case-study-post/index.ts` — add `enforceXLimit()`, `enforceOffer()`, `enforceHookQuality()` helpers; wire into the existing `generate()` flow.
- DB writes: one SQL block to reset `last_used_at` and verify the 9 rows.
- No new tables, no schema changes, no UI changes.
