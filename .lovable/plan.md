## Pivot the daily content engine

Move from "template-product Russell-Brunson posts + performance tracking" to **case-study-led sales-tips posts**, one X + one LinkedIn per day, randomly chosen from a `case_studies` table you populate by pasting in chat.

---

### 1. Pause the current automation (non-destructive)

- Unschedule the existing pg_cron jobs that call `generate-daily-posts`, `track-post-performance`, and `scan-social-trends`.
- Leave all tables, edge functions, the `/performance` page, and existing data **intact** so you can flip it back on later if you ever want.

### 2. New `case_studies` table

Columns: `id`, `client_name`, `vertical` (e.g. "music", "real-estate"), `website_url`, `quote` (nullable), `quote_attribution` (nullable), `headline_outcome` (one-line plain-English win, no numbers/stats), `last_used_at`, `use_count`, `enabled`. RLS: admin-only writes, service_role full.

I'll seed it from the case studies you paste in chat (name + website URL + optional quote). You can add more anytime via a simple form on the `/ops-portal/case-studies` page.

### 3. New edge function: `generate-case-study-post`

- Picks **one** case study (least-recently-used, enabled).
- Generates **one X post + one LinkedIn post** about that case study.
- Voice: Veepo brand (per `public/brands/veepo.json`) — David Ogilvy directness + spiritual-warfare gravitas, no soft tropes.
- Strict rules baked into the system prompt:
  - **No statistics, no numbers, no metrics** (no "increased by X%", no "got Y leads"). Reviewer-style: principles, not proof.
  - **Always include the client's website URL** as a clean link at the end.
  - **Master sales/marketing tip** is the spine of the post — the case study is the example that makes the tip land.
  - If a `quote` exists, weave it in verbatim with attribution.
  - Tips drawn from a rotating pool of website-conversion principles (ICP pain/objection mapping, journey-as-dispelling-objections, hero clarity, friction reduction, social proof framing, CTA specificity, etc.) — passed in the prompt so each post hits a different angle.

### 4. Schedule it

New pg_cron job, once daily (09:00 MST). Output saved to existing `generated_posts` table so the existing `/today` review UI and email pipeline keep working untouched.

### 5. Tiny `/ops-portal/case-studies` admin page

List + add/edit/delete case studies. Toggle enabled. Shows last_used_at so you can see rotation.

---

### What I need from you to build this

Paste your case studies in this format (one per line is fine):

```
Client name | website URL | optional quote | optional quote attribution
```

Example:
```
Karl Salingua Music | https://karlsalinguamusic.com | Parker was the ultimate solution to all my problems. | Karl Salingua
```

I'll seed whatever you paste, build the admin page, and the daily generator will start rotating through them tomorrow morning.

---

### Out of scope (intentionally)

- No changes to `/performance`, tracking functions, or `social_trends` — paused, not deleted.
- No statistics / proof numbers in generated copy — enforced in prompt + a post-generation regex guard that rejects digits-with-% or "X clients/leads/sales".
- No template-product posts in this new flow (they stay in the paused `generate-daily-posts` function, ready to re-enable later).
