## Goal
Replace the current text-wordmark favicon (`/logo.svg`) with a precise, iconic **Lion of Judah** mark optimized for tiny sizes (16/32px tab favicon up to 512px PWA/Apple icon). Apple-tier craft: instantly readable at 16px, regal at 512px.

## Design direction
- **Subject**: Stylized lion head, front-facing, crowned mane — referencing the Lion of Judah (Revelation 5:5). Geometric, heraldic, slightly brutalist — NOT cartoony, NOT photoreal.
- **Style**: Solid silhouette mark (single-weight), inspired by Chrome Hearts cross seals + Swedish heraldry + Travis Scott Cactus Jack monograms. Sharp edges, zero gradient noise.
- **Palette**: Pure black `#0d0d0d` mark on transparent background (PNG). For dark-mode browser tabs the silhouette stays crisp; a second light variant generated if needed.
- **Composition**: Centered, 12% safe-zone padding so iOS/Android mask rounding never clips the mane. Symmetrical. Mane rendered as ~7 chunky tessellated shapes (not hairy strands) so it survives 16px downscale.
- **Optional accent**: Tiny silver-chrome hairline crown notch above the mane (matches Core memory: Silver Chrome + Forest Green palette, no gold).

## Generation pipeline
1. **Generate master**: `imagegen--generate_image` (premium tier, transparent background, 1024×1024) → `public/favicon-source.png`.
   - Prompt emphasizes: heraldic lion head, bold geometric silhouette, single solid black fill, symmetrical, thick mane shapes, no fine detail, no text, no shadows, vector-style flat, designed to read at 16px, app icon, on a solid white background.
2. **QA the master**: view the PNG, check symmetry, edge cleanliness, 16px legibility (downscale preview). If weak → regenerate or `imagegen--edit_image` to fix.
3. **Derive size set** with ImageMagick (via `nix run nixpkgs#imagemagick`):
   - `public/favicon-16.png` (16×16)
   - `public/favicon-32.png` (32×32)
   - `public/favicon-180.png` (180×180, apple-touch-icon)
   - `public/favicon-192.png` (192×192, Android)
   - `public/favicon-512.png` (512×512, PWA/OG fallback)
   - `public/favicon.ico` (multi-res 16/32/48 bundle)
   - Keep `public/favicon-source.png` as the 1024 master.

## index.html wiring
Replace current two icon links with the full set:
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png">
<link rel="manifest" href="/site.webmanifest">
```
Add minimal `public/site.webmanifest` pointing at 192/512 for PWA install icon.
Remove the obsolete `<link rel="icon" type="image/svg+xml" href="/logo.svg">` and the old `<link rel="apple-touch-icon" href="/logo.png">`.

## QA checklist (must pass before done)
- View `favicon-32.png` — lion silhouette unmistakable, no jaggies.
- View `favicon-16.png` — still reads as a lion (not a blob).
- View `favicon-512.png` — crisp edges, no AI artifacts in mane.
- Confirm transparent background on all PNGs.
- Confirm `index.html` only references the new files; no dead `/logo.svg` favicon link.

## Files touched
- **Create**: `public/favicon-source.png`, `favicon-16.png`, `favicon-32.png`, `favicon-180.png`, `favicon-192.png`, `favicon-512.png`, `favicon.ico`, `site.webmanifest`
- **Edit**: `index.html` (icon link block only)

## Out of scope
- `public/logo.svg` (wordmark) — stays, still used elsewhere.
- OG/Twitter image — already swapped to hoodie flat.
- Any in-app logo component changes.
