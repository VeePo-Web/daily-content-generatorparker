## Bento Campaign UI for /sales

Refactor `src/pages/SalesPosts.tsx` into a two-level view: a bento grid of campaigns (one tile per `template_products` row), then drill into a campaign to see its history, themes, and actions.

### Level 1 — Campaign Bento Grid (default view)

Asymmetric bento (Swedish editorial, rounded-none, sharp edges) with one tile per template product:

```text
┌───────────────────────────┬─────────────┐
│  PHOTOGRAPHER             │  HOTEL      │
│  $799 · $69/mo            │  $799·$69mo │
│  [hero asset thumb]       │  [thumb]    │
│  12 batches · last: 2h    │  3 batches  │
│  [Generate] [Send]        │  [Gen][Send]│
└───────────────────────────┴─────────────┘
```

- Tile size weighted by `template_products.weight` (heaviest = col-span-2).
- Background = first `template_assets.public_url` matching that product (cover, low opacity overlay).
- Stats: total batches for that product, last batch timestamp, themes enabled count.
- Per-tile buttons: **Generate** (passes `template_product_id`), **Send latest**.
- Click anywhere else on tile → drill in.

### Level 2 — Campaign Detail (when a tile is clicked)

Header with ← Back, campaign name, one-liner, price.
Three sections (same content as today but scoped to this `template_product_id`):
1. **Action bar** — Generate / Send buttons for this campaign + status message.
2. **Recent batches** — grouped by `batch_id`, 3 variants each, winner highlighted, copy + image preview.
3. **Themes** — filtered to themes where `template_product_id = current OR template_product_id IS NULL` (global hooks), toggle enable.

### Data & wiring

- Single load: fetch `template_products` (enabled), `generated_posts` (last 200), `post_themes`, `template_assets` (first per product).
- Group posts by `template_product_id` for tile stats; group by `batch_id` inside detail view.
- Update `generate-daily-posts` invocation to accept `{ template_product_id }` in the body so a specific campaign generates. The function already exists — confirm it reads this from body and falls back to rotation when absent. If it doesn't, add a 5-line patch to honour the override.
- `send-daily-post-email` similarly accepts `{ template_product_id }` to send latest winner for that campaign.

### Styling

- Match existing dark `bg-slate-900` admin shell, but use `rounded-none`, sharp borders `border-slate-700`, hover `border-emerald-500/50` for tiles per project Core memory.
- Framer Motion `editorialEase` on tile hover scale (1.0 → 1.01) and detail enter/exit (fade + 8px slide).

### Files

- `src/pages/SalesPosts.tsx` — rewrite into `<CampaignGrid />` + `<CampaignDetail />` (single file, two components, `useState` for selectedId).
- `supabase/functions/generate-daily-posts/index.ts` — accept optional `template_product_id` override (only if not already supported).
- `supabase/functions/send-daily-post-email/index.ts` — accept optional `template_product_id` override (only if not already supported).

No DB migration needed — schema already supports per-campaign queries.