
# Capture Real Page Sections, Not Just Embedded Imagery

## What's wrong now

The current scraper takes blind scroll-position screenshots (scroll 0, 700, 1400…). On a single-page site, many of those land mid-section, repeat the same view, or grab whitespace — they don't cleanly show "the About page", "the Portfolio page", "the Contact page" as discrete shots.

## Fix — section-aware screenshots

Rewrite `scrape-template-screenshots` to capture each **logical page/section** of the template, both as a focused viewport shot and a full-page shot, at desktop + mobile.

### Step 1 — Enumerate sections per site

For each base URL:

1. `fetch(base_url)` → parse the HTML server-side (regex / lightweight DOM scan in Deno).
2. Extract:
   - **Nav links** — every `<a href="#…">` and `<a href="/…">` inside `<nav>`, `<header>`, or with `data-section` attributes.
   - **Section anchors** — every `<section id="…">`, `<div id="…">`, `<main id="…">` on the home page.
   - **Sub-routes** from Firecrawl `map` (already working — found 2 for businesscard, 1 for photographer).
3. Dedupe → produce a `sections` array like:
   ```
   [
     { label: "home",      url: "https://site.xyz",            anchor: null      },
     { label: "about",     url: "https://site.xyz",            anchor: "about"   },
     { label: "portfolio", url: "https://site.xyz",            anchor: "portfolio"},
     { label: "services",  url: "https://site.xyz",            anchor: "services"},
     { label: "contact",   url: "https://site.xyz",            anchor: "contact" },
     { label: "pricing",   url: "https://site.xyz/pricing",    anchor: null      },
     ...
   ]
   ```

### Step 2 — Capture each section

For every `section × viewport (desktop+mobile)`, fire **two** Firecrawl scrapes:

- **Full-page** — `formats: [{ type: 'screenshot', fullPage: true, viewport }]`, navigate to `url#anchor`. Captures the entire scrolling section/page as one tall image.
- **Focused viewport** — `formats: [{ type: 'screenshot', fullPage: false, viewport }]` with `actions: [{ type: 'wait', ms: 1500 }, { type: 'scroll', selector: '#${anchor}' }, { type: 'wait', ms: 800 }]` so the section is scrolled into view, then a single-viewport shot is taken showing just that section in frame.

If a site has e.g. 8 sections: 8 × 2 viewports × 2 shot-types = **32 high-signal shots per site** — each one shows an actual labeled part of the site, not a random scroll offset.

### Step 3 — Top up to ~100

If the enumerated section count × 4 falls short of 100, top up by:
- Adding mid-section viewport scrolls within each long full-page (every ~900px down the captured full-page is implicitly extra — but we'll keep these in the full-page shot only).
- For sites with `/sub-route` pages, repeat Step 2 on each route.

For the two current sites (likely 6–10 sections each), we'll land at ~40–80 clean shots per site. **Quality > quantity** — better than 100 near-duplicate scroll frames.

### Step 4 — Store with semantic labels

Each row written to `template_assets`:

- `caption` = `"${label} — ${viewport} — ${full|focus}"` (e.g. `"portfolio — mobile — focus"`).
- `tags` = `[label, viewport, kind, "template-screenshot"]`.
- `orientation` = portrait for mobile / full-page, landscape for desktop focus.
- `asset_type = 'gallery'` (already whitelisted by the generator).

This also makes the email "01/07 portfolio (desktop)" label-able later if you want.

## Wipe and rerun

- Truncate `template_assets` again (current 47 photographer shots are blind scrolls — replace them).
- Empty the `template-screenshots/photography/` and `template-screenshots/portfolio/` storage folders.
- Run the new function once per site in background.

## Files touched

- `supabase/functions/scrape-template-screenshots/index.ts` — replace scroll-grid with section enumeration + targeted captures.
- DB data: `DELETE FROM template_assets`, repopulate via the function.
- Storage: clear the two product folders, repopulate.

## Out of scope

- Visually annotating screenshots with section names.
- Crawling depth > 1 sub-route (won't recurse into nested routes).
- Headed-browser interactions like opening modals / hovering — captures the static rendered state at each anchor.
