
# Reset Image Pool — Capture ~100 Screenshots Per Template Site

## Mapping

| Campaign / product | Template URL |
|---|---|
| **Photographer Website** (`bdb56f5b…`) | `https://veepo-templates-photographer.xyz` (1st site) |
| **Portfolio Website Template** (`2f456b28…`) | `https://veepo-templates-businesscard.xyz` (2nd site) |

## 1. Wipe current cache

- `DELETE FROM template_assets` (both products).
- Delete all objects in the `template-screenshots` storage bucket so we start from a clean slate. Old URLs will 404 — only newly inserted rows are used by the generator anyway, so old `generated_posts` won't pull from the cache.

## 2. Capture ~100 screenshots per site

Build a one-shot edge function `scrape-template-screenshots` that takes `{ template_product_id, base_url }` and:

1. **Discover routes** — call Firecrawl `map` on `base_url` (limit 50, includeSubdomains false) to get every page URL on the template.
2. **For each URL, capture multiple shots** to reach ~100 per site:
   - **Desktop full-page** (1440×900 viewport, full scroll height) — 1 shot per URL
   - **Mobile full-page** (390×844 viewport, full scroll height) — 1 shot per URL
   - **Desktop section crops** — slice each desktop full-page into ~1080px-tall tiles (3–6 tiles per long page) → individual `gallery` assets
   - **Mobile section crops** — same idea, ~844px tiles
   - Use Firecrawl `scrape` with `formats: ['screenshot']` and `waitFor: 1500` for each (viewport configured per call). Section tiles are produced server-side by re-cropping the returned base64 PNG with the standard `Image` decoder in Deno (via `npm:sharp` or `npm:@napi-rs/canvas`).
3. **Upload each tile** to `template-screenshots/{product_slug}/{uuid}.png` and insert a row in `template_assets`:
   - `template_product_id` = passed in
   - `asset_type` = `'gallery'` (whitelisted by the generator — guarantees template-only)
   - `public_url` = storage public URL
   - `do_not_use = false`, `use_count = 0`
   - `meta = { source_url, viewport: 'desktop'|'mobile', tile_index, total_tiles }`
4. Target **~100 rows per product** — if Firecrawl returns ~15 URLs × (1 desktop full + 1 mobile full + ~4 desktop tiles + ~3 mobile tiles) ≈ 135 shots, then trim to the first 100 by tile order.

Run the function twice — once per product/URL pair.

## 3. Verify

- `SELECT template_product_id, COUNT(*) FROM template_assets GROUP BY 1` → expect ~100 each.
- Trigger `generate-daily-posts` once per campaign and confirm the 7 picked images all come from the new bucket (URLs contain the new uploads, all `asset_type='gallery'`).

## Files touched

- **New edge function** `supabase/functions/scrape-template-screenshots/index.ts` (Firecrawl + sharp tiling + storage upload + insert).
- **DB data**: truncate `template_assets`, insert ~200 new rows via the function.
- **Storage**: wipe + repopulate `template-screenshots` bucket.
- No frontend changes. Generator code already whitelists `asset_type IN ('mockup','case-study','gallery')` so the new `gallery` rows will be picked up automatically.

## Requirements

- **Firecrawl connector** must be connected (provides `FIRECRAWL_API_KEY`). I'll prompt to connect it if it isn't already.
- Adds `npm:sharp` (or `@napi-rs/canvas`) to the edge function for tile cropping — bundled at deploy time, no manual step.

## Out of scope

- Re-running the old generated_posts against the new image pool (yesterday's email images will stay broken-link if we delete the old storage objects — confirm you're OK with that, or I'll keep the old objects and only clear the DB rows).
- Watermarking / overlay branding on the tiles.
- Re-seeding `post_themes` (already done in the previous pass).
