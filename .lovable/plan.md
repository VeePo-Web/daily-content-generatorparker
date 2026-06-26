## Goal
Audit the case-study daily post engine end-to-end and tune it so the X + LinkedIn posts are engineered to convert — not just to read well.

## Audit Passes

**Pass 1 — Data integrity**
- Confirm all 9 case studies are seeded, enabled, with correct URLs.
- Confirm only the 3 sites with real customer quotes have `quote` populated (Street Smart, Fly4Media, Lashes by Halle). The other 6 stay null so the model never invents one.
- Confirm `last_used_at` rotation will hit all 9 before repeating.

**Pass 2 — Cron + delivery**
- Verify the 9am MST (`15:00 UTC`) cron exists in `pg_cron`, points at the right function, and is the only active job (old 8 are unscheduled).
- Verify `send-daily-post-email` sends both platforms to parker@veepo.ca, with no image block when there are no assets.
- Verify dedup via `post_send_log` so a manual run + cron run on the same day doesn't double-send.

**Pass 3 — No-stats guarantee**
- Re-test the stats-regex guard against today's Karl batch and a forced run against Fly4Media (which has the most "salesy" headline).
- Add a final safety pass: if retry still returns digits, log a warning + auto-strip and continue (never block delivery).

**Pass 4 — Conversion engineering** *(the main upgrade)*

Rewrite the X and LinkedIn prompts around proven conversion mechanics, keeping the no-stats rule and Ogilvy voice:

- **X post (220–280 chars)** — Pattern: `[Sharp truth] → [Named client as proof] → [URL]`. Force a *pattern-interrupt* opener (a statement that contradicts a common belief), then collapse to the client, then drop the URL. No "I" voice. No questions. No CTAs — the URL is the CTA.

- **LinkedIn post (700–1300 chars)** — Russell Brunson "Hook → Story → Offer" tightened for B2B:
  1. **Hook line** (one sentence, contrarian or specific).
  2. **Stakes paragraph** (what the reader is currently losing by not knowing this).
  3. **Client vignette** (Veepo built X for Y, the specific design choice that did the work, no metrics).
  4. **Customer quote** if one exists, otherwise a one-line principle restated.
  5. **Soft offer**: "See it live: {url}". One line. Period.

- Add a **scoring rubric** the model self-checks against before returning: hook strength, specificity, no-stats, voice match, URL placement.
- Add a **forbidden-phrase list** beyond the current one: "let's dive in", "the truth is", "here's the thing", "in today's market", "thought leader", em-dash overuse.
- Lock the model to one em-dash max per post.
- Force the X post to end with the URL on its own line; force the LinkedIn post to end with `See it live: {url}` exactly.

**Pass 5 — Subject lines + email render**
- Audit `send-daily-post-email` subject line: switch from generic to `[X | Karl Salingua] {first 6 words}…` so the inbox preview itself sells the post.
- Confirm copy renders with line breaks preserved (`white-space: pre-wrap`), URL is clickable, and a one-click "Download as .txt" link is present.

**Pass 6 — Live verification**
- Manual trigger one batch per case study type:
  1. Case study **with** quote (Street Smart).
  2. Case study **without** quote (Mitford Worship).
- Read both emails back, confirm: no digits in body, URL present, voice on-brand, hook lands in under 5 seconds.
- Check `post_send_log` to confirm dedup.

## Out of scope
- No UI changes to `/case-studies` or `/sales` pages.
- No new tables, no schema changes.
- Photographer/Portfolio campaigns stay paused.
- Recipient stays parker@veepo.ca.

## Deliverable
A short audit report in chat with: pass/fail per pass, what was changed, the two test-batch emails confirmed in your inbox.
