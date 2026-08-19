# Second Daily Engine: The $300 Referral Post (Local Cochrane Web Design)

Keep the existing daily Facebook value post exactly as it is. Add a **second, separate daily campaign** for the same site, aimed at a different ideal customer: **the person who knows a business owner who needs a website** — not the buyer.

Offer: refer someone, and when they buy a site over $2,500, the referrer gets **$300 by e-transfer**.

## The marketing thinking (why the posts will be built this way)

Drawn from Hormozi (*$100M Offers*, *$100M Leads*, *$100M Money Models*) and Brunson's referral/affiliate teaching (*DotCom Secrets*, *Expert Secrets*, *Traffic Secrets*).

1. **Value equation applied to the referrer, not the buyer** (Hormozi, *Offers*). The referrer's dream outcome is looking good to a friend plus easy money. The two costs to attack are *time delay* and *effort & sacrifice*. So every post shrinks the ask to one sentence: send a name, or forward the link. No forms, no tracking codes, no selling on the referrer's part.
2. **Make the offer specific and unmissable.** "$300, e-transfer, paid when they buy" beats "generous referral bonus." Concrete number, concrete payment rail, concrete trigger. This is the one campaign where a dollar figure is *required* — the no-statistics rule stays in force for everything else.
3. **Referral is a currency of trust, not cash** (Brunson). People refer to protect their reputation first and earn second. So the post leads with *why it's safe to send someone our way* — a real review, an ownership guarantee, no ranking promises — and treats the $300 as the thank-you, never the hook.
4. **"Who do you know?" is the highest-converting referral ask ever written** (Brunson's Dream 100 logic pointed at your own audience). Nearly every post ends with a specific, scoped version of it: not "know anyone?" but "who do you know in Cochrane whose website still says 2016?"
5. **Cash is a bad hook, permission is a good one** (Hormozi, *Leads* — warm outreach beats cold). Leading with money attracts nobody and mildly cheapens the brand. Leading with a real story, then closing with the bounty, converts the people already inside your circle.
6. **The stack ends with risk reversal** (Hormozi). The referred friend can get a written proposal within a business day with no obligation, so a referral costs the referrer's friend nothing — which is what makes the referrer willing to spend their social capital.
7. **Cliffhanger and rotation** (Brunson's soap-opera principle). Forty-plus distinct angles rotated least-recently-used so nobody sees the same referral ask twice in six weeks — the same rotation discipline the value campaign already uses.

## Post anatomy

```text
1. HOOK        A plain, specific line. Never opens with money.
2. THE SCENE   2-4 short lines: a real Cochrane situation where someone
               was asked "do you know a good website person?"
3. PROOF       A verbatim Google review, in quotation marks, with the
               reviewer's name. Required in every post of this campaign.
4. THE OFFER   The $300 stated plainly: refer someone, when they buy a
               site over $2,500 the referrer gets $300 by e-transfer.
               No obligation for the friend, written proposal in a day.
5. THE ASK     A scoped "who do you know" question + URL on its own line.
```

Rules baked into the generator:
- 500-1000 characters, short paragraphs, blank line between each.
- The **only** numbers permitted: `$300`, `$2,500`, and digits inside a verbatim review. Everything else — percentages, counts, rankings, "X+ clients" — is still banned and auto-caught.
- No hashtags, no emojis, no "DM me", no "comment below", no invented reviews or results.
- Voice: Ogilvy directness, small-town Alberta plainness, unhurried, no hype.
- Every post carries exactly one real review, rotated least-recently-used so the same quote doesn't repeat.

## Angle library (~42, rotated)

Categories: the trusted-friend ask · trades network (contractor recommends contractor) · the reluctant referrer's objection ("what if they hate it") · what $300 actually buys you · the awkward-recommendation problem · who to think of (realtors, trades, salons, coaches, church networks) · why we pay rather than beg · proof and reputation · Cochrane seasonal rhythm.

## Admin

A **Referrals** campaign tile added to the existing `/cochrane` page, matching the bento pattern already there: angle count, posts generated, next send, full post history with copy-to-clipboard, Generate now / Send now, and angle add/edit/enable.

## Technical notes

- Migration: `cochrane_referral_angles` (angle, category, enabled, use_count, last_used_at) and `cochrane_reviews` (reviewer_name, quote, enabled, use_count, last_used_at), both with GRANTs and RLS mirroring `cochrane_angles`. Seed 42 angles and the six verbatim Google reviews (Toby Rennick, Calem Wood, Rick Bergh, Caden Steinke, Aaron Garcia, Will Jacques).
- New edge function `generate-cochrane-referral-post`: picks the least-recently-used angle and review, calls the AI gateway with the referral brand context, runs the money-guard (allows only $300 / $2,500 / quoted digits), hook, paragraph and length checks with one automatic retry each, saves to `generated_posts` with `score_breakdown.source = "cochrane-referral"`, emails via Resend to parker@veepo.ca.
- Cron: keep `daily-cochrane-facebook-post` at 13:00 UTC untouched; add `daily-cochrane-referral-post` at **13:05 UTC** so both land in the inbox together at 7am.
- Frontend: extend `src/pages/CochranePosts.tsx` to a two-campaign bento (Value Post / Referral Post) filtering history by `score_breakdown.source`. No new route.
