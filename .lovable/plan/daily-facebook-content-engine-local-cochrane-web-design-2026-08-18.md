# Daily Facebook Content Engine — Local Cochrane Web Design

Switch the daily engine from X/LinkedIn case-study posts to a single daily **Facebook** post for **localcochranewebdesign.com**, written for Cochrane-area business owners.

## What changes

1. **Pause the current job.** The existing daily X + LinkedIn case-study cron is unscheduled. All code, tables and post history stay untouched so it can be turned back on any time.
2. **New daily Facebook post**, emailed to parker@veepo.ca at **7:00am MST**.
3. **One post per day**: a local marketing value post — a real, useful lesson on why websites win or lose local customers — closing with a soft link to localcochranewebdesign.com.
4. **No images.** Copy only.

## Post format (Facebook, built for local reach)

Facebook rewards conversation and dwell time, not link clicks — so the post is written to be readable on its own, with the link as the last line rather than the hook.

```text
1. HOOK        One plain, contrarian or unusually specific line about local
               business websites. No "In today's market". No emojis.
2. THE SCENE   2-4 short lines grounding it in Cochrane: a customer standing
               in a parking lot on their phone, a quote request that never
               arrived, a Sunset Ridge homeowner searching at 9pm.
3. THE LESSON  The actual principle, said plainly and usefully enough that
               someone could apply it without hiring anyone.
4. PROOF       Optional. A real named client site or a verbatim Google
               review, only when one genuinely fits.
5. SOFT CTA    One low-pressure line + the URL on its own line.
               e.g. "Written proposal within a business day, no obligation."
```

Hard rules baked into the generator:
- 400–900 characters. Short paragraphs, blank line between each.
- No statistics, percentages, dollar figures or "X+ clients" claims — the one exception is published pricing when the post is explicitly about cost.
- No hashtags, no emojis, no "DM me", no "drop a comment below".
- No invented results and no invented testimonials. Quotes are used verbatim from the seeded review library or not at all.
- Voice: David Ogilvy directness with the site's own anti-hype posture ("we can't promise a ranking, and anyone who does is selling you something").

## Content the AI writes from

Seeded from research of the live site so posts are accurate, not generic:

- **Services**: custom web design, website redesign, local SEO, AI search optimization, landing pages & CRO, website care & hosting.
- **Positioning**: conversion-first, mobile-first, building for Cochrane since 2013, written proposal within one business day.
- **Guarantees**: you own your site and content, sub-1.5s mobile load target, no hostage clauses, no ranking promises.
- **Geography**: Cochrane and its neighbourhoods (Sunset Ridge, Heritage Hills, Riversong, Gleneagles, Fireside, Glenbow, Heartland), plus Bearspaw, Springbank, Rocky View, Calgary NW, Canmore, Bow Valley.
- **Clients for proof**: Royal Mechanical, Cochrane Master Painters, Flex Services, Street Smart Detailing, Fly4MEdia, Lashes by Halle, Hickory & Rose, Karl Salingua Music, Haven Creek Renovations.
- **Verbatim reviews only**: Toby Rennick, Calem Wood, Rick Bergh, Caden Steinke, Aaron Garcia, Will Jacques.

## Angle rotation

A seeded library of ~45 local angles, rotated least-recently-used so nothing repeats for six weeks. Categories:

- Trust & credibility (what a Cochrane homeowner decides in five seconds)
- Local search intent (how people actually search here at 9pm on a phone)
- Mobile reality (job sites, trucks, one thumb, bad signal)
- Cost & value (why the cheap site costs more)
- Trades-specific (quote forms, service areas, after-hours calls)
- Objection handling (DIY builders, Calgary agencies, "my nephew built it")
- Behind the build (a specific design decision and why it was made)
- Seasonal Cochrane rhythm (spring trades rush, stampede, winter slowdown)

## Admin page

A new **Cochrane** tab in the studio nav with a bento layout matching the existing campaign pages:

- Campaign tile for Local Cochrane Web Design — angle count, posts generated, next scheduled send.
- History list of every generated Facebook post with copy, character count, and one-click copy-to-clipboard.
- Manual **Generate now** and **Send now** buttons.
- Angle library management: add, edit, enable/disable angles.

## Technical notes

- Migration: new `cochrane_angles` table (angle, category, enabled, last_used_at) plus GRANTs and RLS; extend `generated_posts.platform` usage with `facebook`; allow the case-study/product columns to stay null for these rows.
- New edge function `generate-cochrane-facebook-post`: picks the least-recently-used angle, calls the AI gateway with the seeded brand context, runs the no-stats / no-hashtag / length guards with one automatic retry, saves to `generated_posts`, then emails via Resend to parker@veepo.ca.
- Cron: unschedule `daily-case-study-post`; schedule `daily-cochrane-facebook-post` at **13:00 UTC** (7:00am Cochrane time, MDT). Note that after the November clock change this lands at 6:00am local unless adjusted.
- New page `src/pages/CochranePosts.tsx`, routed in `src/App.tsx`, linked from `src/components/studio/Nav.tsx`.
