# LOVABLE BUILD PROMPT
## Veepo Daily Content Generator — Personal Admin App
## Paste this entire prompt into Lovable to start the build.

---

## CONTEXT FOR LOVABLE

You are building a private, single-user admin app for Parker — the founder of Veepo.ca. This app connects to an existing Python content generation system that already runs daily and saves post data to a JSON file. The app is Parker's personal dashboard: he logs in, sees today's 3 generated social media post options, picks the best one, downloads it formatted for LinkedIn and X (Twitter), and over time the system learns which post styles he prefers.

This is NOT a public-facing product. It is a private internal tool. The UX must be extremely simple — no onboarding, no tutorials, no complexity. Parker opens it, sees today's posts, picks one, downloads it. That is the entire primary flow.

---

## STEP 1 — REPO CLEANUP (do this first, before building anything)

The repo being connected is: https://github.com/VeePo-Web/daily-content-generatorparker

This repo currently contains content and branding from a previous project called "Line of Judah." Before building anything new, remove ALL of the following:

- Any references to "Line of Judah" in any file (component names, copy, comments, variable names, page titles, meta tags)
- Any Line of Judah branding, colors, logos, imagery, or theme files
- Any Line of Judah-specific page content, routes, or components
- Any Line of Judah-specific API calls, data fetching, or configuration
- Any Line of Judah copy in README.md or documentation files

Replace the project identity with:
- Project name: "Veepo Content Studio"
- Brand color: #0f172a (dark slate — the same dark used in the email template)
- Accent color: #3b82f6 (blue)
- Font: Inter (system default — keep it simple)

After cleanup, the repo should be a clean shell ready to receive the new app.

---

## STEP 2 — FILE STRUCTURE TO ADD TO THE REPO

The following files from the existing Python system need to be present in the repo. Add them as-is, do not modify their logic:

```
/generator.py          — the Python content generation script
/brands/veepo.json     — the brand configuration file
/data/posts.json       — the post history database (starts as [])
/requirements.txt      — Python dependencies
/run.bat               — Windows scheduler runner
/.env.example          — API key template (never commit .env itself)
/CONTENT-VAULT.md      — the pre-written caption reference library
/PERSONA-PROMPT.md     — the buyer persona document
```

The `.env` file itself is in `.gitignore` and must never be committed. The `.env.example` file shows the required keys:
```
ANTHROPIC_API_KEY=your-key-here
RESEND_API_KEY=your-key-here
```

---

## STEP 3 — APP ARCHITECTURE

### Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Auth: Clerk (single user — Parker's email: officallulas@gmail.com)
- Database: The existing `/data/posts.json` file for now. Structure it as Supabase-ready for future migration.
- Hosting: Vercel

### Data Model

The app reads from and writes to this data structure (matches the existing Python output):

```typescript
// A single generated post option
interface PostOption {
  pillar: "PROOF" | "PAIN" | "EDUCATION" | "PROCESS" | "OFFER";
  niche: string;
  hook: string;
  linkedin: {
    post: string;
    hashtags: string[];
    cta: string;
  };
  x: {
    format: "single" | "thread";
    post: string | string[]; // string[] if thread
  };
  buffer_tip: string;
}

// A daily generation record
interface ContentRecord {
  id: string;                    // format: "veepo-2026-05-22"
  brand_id: string;              // "veepo"
  date: string;                  // ISO date "2026-05-22"
  generated_at: string;          // ISO datetime
  status: "emailed" | "reviewed" | "posted";
  selected_option: number | null; // 1, 2, or 3 — null if not yet chosen
  posts: PostOption[];            // always 3 items
}

// Learning data — stored separately, grows over time
interface SelectionHistory {
  date: string;
  selected_pillar: string;
  selected_niche: string;
  record_id: string;
}
```

---

## STEP 4 — PAGE STRUCTURE

### Route: `/` → Redirect to `/today` if logged in, or `/login` if not

### Route: `/login`
- Clerk login page
- Minimal styling — dark background, Veepo logo/wordmark centered, Clerk's sign-in component
- Only Parker's email (officallulas@gmail.com) can log in — configure Clerk to restrict to this email only

### Route: `/today` (PRIMARY VIEW — this is where Parker spends 90% of his time)

This is the most important screen. Design it carefully.

**Layout:** Single column, max-width 800px, centered. Dark background (#0f172a). Clean, minimal.

**Header:**
- "Veepo Content Studio" wordmark top-left
- Today's date displayed prominently: "Thursday, May 22" style
- Small pill showing today's status: "Generated ✓" or "Not yet generated"
- Nav links: Today | History | Settings (keep nav minimal — these are the only 3 pages)

**The 3 Post Options:**

Each option is a card. The 3 cards stack vertically on mobile. On desktop, they can be 3 columns if space allows, but single-column reading is the priority — these are long posts.

Each card contains:

```
┌─────────────────────────────────────────────────────┐
│ OPTION 1  [PAIN]  wedding photographer              │
│ ─────────────────────────────────────────────────── │
│ HOOK: "She emailed on a Tuesday afternoon..."       │
│                                                     │
│ [LINKEDIN TAB]  [X THREAD TAB]                      │
│                                                     │
│ [Full post text — scrollable if long]               │
│                                                     │
│ Hashtags: #weddingphotography #photographerbusiness │
│ CTA: DM me WEBSITE                                  │
│                                                     │
│ Buffer Tip: [tip text]                              │
│                                                     │
│ [★ SELECT THIS ONE]  [↓ Download LinkedIn]  [↓ Download X]  │
└─────────────────────────────────────────────────────┘
```

Card header color codes by pillar:
- PROOF: green header (#166534 bg, #dcfce7 text)
- PAIN: red header (#991b1b bg, #fee2e2 text)
- EDUCATION: blue header (#1e40af bg, #dbeafe text)
- PROCESS: purple header (#6b21a8 bg, #f3e8ff text)
- OFFER: amber header (#92400e bg, #fef3c7 text)

**Tab behavior:** LinkedIn/X tabs switch the post content view within the card. Default shows LinkedIn. Both tabs are always visible.

**Select button behavior:**
- When Parker clicks "★ Select This One" on a card, that card gets a green selected ring, the button changes to "✓ Selected", the other two cards dim slightly
- The selection is saved to the record's `selected_option` field and to `SelectionHistory`
- The status pill in the header updates to "Reviewed ✓"
- A toast notification appears: "Option [1/2/3] selected. [Pillar] / [Niche]"

**Download buttons:**
- "↓ Download LinkedIn" — downloads a plain .txt file with the full LinkedIn post text + hashtags on separate lines. Filename: `veepo-[date]-linkedin-option[n].txt`
- "↓ Download X" — downloads a .txt file with the X thread formatted as numbered tweets (1/5, 2/5, etc.) or the single tweet. Filename: `veepo-[date]-x-option[n].txt`
- Downloads work whether or not Parker has selected that option

**If no content generated today:**
Show a centered empty state:
```
Today's posts haven't been generated yet.

The Python script runs automatically at 8 AM MST daily.
To generate now: open terminal → python generator.py

[manual trigger button — see below]
```

**Manual trigger (stretch goal, implement if possible):**
A button "Generate Now" that hits an API route `/api/generate` which runs `python generator.py` as a subprocess and returns when complete. If this is not possible in the Vercel serverless environment (Python subprocess limitations), show a note instead: "Run `python generator.py` in your terminal to generate today's content."

---

### Route: `/history`

A reverse-chronological list of all generated content records.

**Layout:** Table or card list. Each row/card shows:
- Date
- 3 pillars generated (as colored pills)
- Selected option (which one Parker picked, or "Not reviewed" if null)
- Status badge (emailed / reviewed / posted)
- "View" button → expands inline or navigates to `/history/[id]`

**Filter bar:** Filter by pillar (PROOF/PAIN/EDUCATION/PROCESS/OFFER) and by status (all/reviewed/not-reviewed).

**The learning signal panel** (simple analytics, shown at the top of the history page):

```
WHAT'S WORKING
──────────────────────────────────────
Most selected pillar:    PAIN (43%)
Most selected niche:     wedding photographer (38%)
Least selected:          PROCESS (2%)

Based on [23] selections so far.
```

This panel reads from `SelectionHistory` and calculates frequency counts. No ML required at this stage — pure frequency analysis. This IS the learning: over time, the system will see that Parker always picks PAIN posts over PROCESS posts, and this data will eventually feed back into the generator prompt to bias toward what works.

**Future state (add a comment in code):** When 50+ selections exist, pass `SelectionHistory` summary back into the Python generator via a config file update — so pillars Parker never selects get lower weight, and niches he always picks get higher frequency.

---

### Route: `/history/[id]`

Full view of a single day's generated content. Same card layout as `/today` but read-only. Shows which option was selected (if any) with the green ring. Shows the full date and generated_at timestamp.

---

### Route: `/settings`

Simple settings page. Two sections:

**Section 1 — API Configuration**
Three input fields (password type — masked):
- Anthropic API Key
- Resend API Key

Save button → writes to `.env` file via a server action, or shows instructions to add manually if file system access isn't available in the deployment.

**Section 2 — Campaign Configuration**
Read-only display of the current `brands/veepo.json` config:
- Product name, price, delivery days
- Active campaign name
- Pillar weights (shown as a simple bar chart or percentage list)
- A note: "To edit the campaign, modify brands/veepo.json directly."

No editing UI for the brand config yet — that's a future feature.

---

## STEP 5 — GLOBAL DESIGN SYSTEM

**Colors:**
```css
--bg-primary: #0f172a       /* main background */
--bg-card: #1e293b          /* card background */
--bg-card-hover: #263548    /* card hover */
--border: #334155            /* borders */
--text-primary: #f8fafc     /* main text */
--text-secondary: #94a3b8   /* secondary text */
--text-muted: #64748b       /* muted text */
--accent: #3b82f6           /* blue — selected state, CTAs */
--success: #22c55e          /* green — selected, confirmed */
```

**Typography:**
- Font: Inter (system stack fallback)
- Headings: font-semibold
- Body: font-normal, leading-relaxed
- Code/pre: font-mono for post text blocks (makes it feel like a content tool)
- Post text in cards: rendered in `font-mono text-sm` — makes it easy to read before copying

**Spacing:** 8px base unit. Generous padding on cards (24px). Tight, information-dense but not cramped.

**No animations:** This is a tool, not a marketing site. Keep all interactions instant. No scroll animations, no fancy transitions. Only a subtle 150ms fade on tab switches inside cards.

**Mobile:** Cards stack to single column. Download buttons stack vertically. Nav collapses to bottom tab bar with icons only (Today, History, Settings).

---

## STEP 6 — API ROUTES

```
GET  /api/posts/today           → returns today's ContentRecord or null
GET  /api/posts/history         → returns all ContentRecords, newest first
GET  /api/posts/[id]            → returns single ContentRecord
POST /api/posts/[id]/select     → body: { option: 1|2|3 } → updates selected_option + appends to SelectionHistory
GET  /api/learning/summary      → returns SelectionHistory frequency analysis
POST /api/generate              → triggers python generator.py (if possible in environment)
```

All routes are protected — require Clerk auth. Since this is single-user, auth check is: is the session user's email equal to `officallulas@gmail.com`? If not, return 401.

---

## STEP 7 — DATA LAYER

For now, read/write directly to `/data/posts.json` using Node's `fs` module in server components and API routes. Structure the data access layer as a clean abstraction (`lib/posts.ts`) so it can be swapped to Supabase later with minimal changes.

```typescript
// lib/posts.ts — data access abstraction
export async function getTodayRecord(): Promise<ContentRecord | null>
export async function getAllRecords(): Promise<ContentRecord[]>
export async function getRecord(id: string): Promise<ContentRecord | null>
export async function updateSelection(id: string, option: number): Promise<void>
export async function getSelectionHistory(): Promise<SelectionHistory[]>
export async function getLearningInsights(): Promise<LearningInsights>
```

Add a comment in `lib/posts.ts`: `// TODO: Replace fs-based reads with Supabase queries when migrating to cloud DB`

---

## STEP 8 — FUTURE FEATURES (do NOT build these now — add TODO comments only)

```typescript
// TODO: Multi-brand support — when brands/ folder has multiple JSONs, 
// show a brand switcher in the nav header

// TODO: Campaign switching — allow Parker to switch between active campaigns
// without editing the JSON file directly

// TODO: Posted status — a "Mark as Posted" button that updates status to "posted"
// and optionally records which platform it was posted to

// TODO: Learning feedback loop — when SelectionHistory.length >= 50, 
// auto-update pillar weights in veepo.json based on selection frequency

// TODO: Supabase migration — swap lib/posts.ts fs reads for Supabase queries
// Data model is already Supabase-compatible

// TODO: Manual content editing — allow Parker to edit the generated post text
// before downloading, with a simple textarea that overwrites the read-only view
```

---

## STEP 9 — WHAT SUCCESS LOOKS LIKE

When this app is complete, Parker's daily workflow is:

1. Open the app (it's bookmarked, he's already logged in via Clerk)
2. See today's 3 post options on `/today`
3. Read the hook for each option — takes 20 seconds
4. Click to the option he likes best to expand the full LinkedIn and X content
5. Click "Select This One" on the winner
6. Click "Download LinkedIn" and "Download X"
7. Open Buffer, paste in the LinkedIn version, paste in the X version, schedule
8. Close the app

Total time: under 5 minutes.

The history page lets him look back at what he's posted, see patterns in what he prefers, and eventually the system gets smarter about what to generate without him touching any config.

---

## FINAL NOTES FOR LOVABLE

- Do NOT add any features not listed above. This is a personal tool for one person. Simplicity is the entire point.
- Do NOT use any UI component library beyond Tailwind. No shadcn/ui, no Radix unless strictly necessary for accessibility. Keep the component count low.
- The post text in cards can be very long (500-900 words for LinkedIn). Make sure the card handles this gracefully — either with a "Show full post" expand toggle, or with a max-height scroll container inside the card.
- The app should feel like a premium internal tool — not a consumer app. Think Notion or Linear's density and seriousness, not a colorful marketing dashboard.
- Auth is the first thing to set up. If Parker can't log in, nothing else matters.
