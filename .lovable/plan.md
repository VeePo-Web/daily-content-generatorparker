## Goal
Add the 9 client websites to the case study library so the daily generator rotates through them. Pull any real customer quotes that appear on the sites, and keep the strict "no statistics" rule.

## Sites
1. karlsalingua.com (already seeded — refresh)
2. flexservices.info
3. streetsmartdetailing.com
4. mitfordworship.com
5. lineofjudah.clothing
6. fly4me.ca
7. lashesbyhalle.com
8. hickoryandrose.com
9. christophergawryletz.com

## Steps

1. **Scrape each site** with Firecrawl (markdown only) to pull:
   - Business name
   - One-line description of what they do
   - Any **real** testimonial / review / quote + attribution (only if it literally appears on the site)
   - Skip every number, %, "X clients", "Y years" stat

2. **Seed `case_studies` table** with one row per site:
   - `client_name`, `website_url`, `industry`, `description`
   - `quote` + `quote_attribution` only when a real one was found; otherwise null
   - `is_active = true`

3. **Reinforce the no-stats rule** in `generate-case-study-post`:
   - Strengthen the system prompt: forbid any digit, %, "increased", "boosted", "X+ clients", revenue figures, ranking claims
   - Add a post-generation regex guard that retries once if the draft contains digits in a stat-like context
   - Only quote a customer when `case_studies.quote` is non-null — never invent one

4. **Manual trigger** once seeded: run `generate-case-study-post` for one client end-to-end to confirm the X + LinkedIn emails look right with the new pool, then let the 9am MST cron rotate through them daily.

## Out of scope
- No UI changes to `/case-studies` (admin page already supports add/edit)
- No change to cron schedule or recipient
- No change to the photographer/portfolio campaigns (still paused)

## Technical notes
- Scraping is one-time at seed; case studies persist in DB after
- Rotation strategy in the generator: pick the active case study with the oldest `last_used_at` (or random if tied)
