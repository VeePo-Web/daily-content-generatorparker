import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY")!;

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim().slice(0, 120);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const dp: number[] = Array(b.length + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = a[i - 1] === b[j - 1] ? dp[j - 1] : Math.min(dp[j - 1], dp[j], prev) + 1;
      dp[j - 1] = prev;
      prev = cur;
    }
    dp[b.length] = prev;
  }
  return dp[b.length];
}

async function firecrawl(url: string, formats: string[] = ["markdown", "html"]) {
  const r = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats, onlyMainContent: false, waitFor: 2000 }),
  });
  if (!r.ok) throw new Error(`firecrawl ${r.status}: ${await r.text()}`);
  return await r.json();
}

// Parse approximate counts like "1.2K", "3,456" → integer
function parseCount(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = String(s).trim().replace(/,/g, "").match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (isNaN(n)) return null;
  const mult = m[2]?.toUpperCase() === "K" ? 1000 : m[2]?.toUpperCase() === "M" ? 1e6 : m[2]?.toUpperCase() === "B" ? 1e9 : 1;
  return Math.round(n * mult);
}

// Extract per-post snippets and engagement from scraped profile markdown/html.
// Strategy: split on blank-line gaps, look for blocks containing reaction/comment/repost keywords.
function extractProfilePosts(markdown: string, html: string): { snippet: string; url?: string; likes?: number; comments?: number; shares?: number }[] {
  const out: { snippet: string; url?: string; likes?: number; comments?: number; shares?: number }[] = [];
  // Try to pull anchored post URLs from HTML (LinkedIn /feed/update/urn:li:activity: and X /status/)
  const urlRe = /(https?:\/\/(?:www\.)?(?:linkedin\.com\/(?:feed\/update\/urn:li:activity:\d+|posts\/[^\s"']+)|x\.com\/[^\/]+\/status\/\d+|twitter\.com\/[^\/]+\/status\/\d+))/g;
  const urls = Array.from(new Set((html || "").match(urlRe) || []));

  // Chunk markdown
  const blocks = (markdown || "").split(/\n\s*\n/);
  let urlIdx = 0;
  for (const block of blocks) {
    const text = block.trim();
    if (text.length < 40) continue;
    const likesM = text.match(/([\d.,]+\s*[KMB]?)\s*(?:reactions|likes|like)/i);
    const commentsM = text.match(/([\d.,]+\s*[KMB]?)\s*comments?/i);
    const sharesM = text.match(/([\d.,]+\s*[KMB]?)\s*(?:reposts?|shares?|retweets?)/i);
    // Only treat as a post if at least one engagement marker exists, OR block is long-form
    if (!likesM && !commentsM && !sharesM && text.length < 200) continue;
    out.push({
      snippet: text,
      url: urls[urlIdx++],
      likes: parseCount(likesM?.[1]) ?? undefined,
      comments: parseCount(commentsM?.[1]) ?? undefined,
      shares: parseCount(sharesM?.[1]) ?? undefined,
    });
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const { data: accounts } = await sb.from("social_accounts").select("*");
    if (!accounts?.length) {
      return new Response(JSON.stringify({ message: "No social accounts registered yet — add them in /admin/social-accounts" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get generated posts from last 14 days
    const since = new Date(Date.now() - 14 * 86400 * 1000).toISOString();
    const { data: posts } = await sb.from("generated_posts").select("*").gte("created_at", since);
    if (!posts?.length) {
      return new Response(JSON.stringify({ message: "No recent posts to track" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const results: any = { scraped: [], matched: 0, snapshots: 0, errors: [] };

    for (const acct of accounts) {
      try {
        const scraped = await firecrawl(acct.profile_url, ["markdown", "html"]);
        const md = scraped?.data?.markdown || scraped?.markdown || "";
        const html = scraped?.data?.html || scraped?.html || "";
        const profilePosts = extractProfilePosts(md, html);
        results.scraped.push({ platform: acct.platform, found: profilePosts.length });

        // Match each generated post on this platform
        const platformPosts = posts.filter((p: any) => p.platform === acct.platform);
        for (const gp of platformPosts) {
          const target = normalize(gp.copy).slice(0, 80);
          let best: { score: number; pp: typeof profilePosts[number] | null } = { score: 999, pp: null };
          for (const pp of profilePosts) {
            const candidate = normalize(pp.snippet).slice(0, 80);
            const d = levenshtein(target, candidate);
            if (d < best.score) best = { score: d, pp };
          }
          if (!best.pp || best.score > 20) continue;

          const url = best.pp.url || gp.live_post_url;
          const ageDays = Math.floor((Date.now() - new Date(gp.created_at).getTime()) / 86400000);
          const eng = (best.pp.likes || 0) + (best.pp.comments || 0) + (best.pp.shares || 0);
          const er = best.pp.likes != null ? eng : null;

          await sb.from("post_performance").insert({
            generated_post_id: gp.id,
            post_url: url,
            day_offset: ageDays,
            likes: best.pp.likes ?? null,
            comments: best.pp.comments ?? null,
            shares: best.pp.shares ?? null,
            engagement_rate: er,
            source: "scrape",
            raw: { match_distance: best.score, snippet: best.pp.snippet.slice(0, 300) },
          });
          results.snapshots++;

          await sb.from("generated_posts").update({
            live_post_url: url,
            matched_at: gp.matched_at || new Date().toISOString(),
            latest_likes: best.pp.likes ?? gp.latest_likes,
            latest_comments: best.pp.comments ?? gp.latest_comments,
            latest_shares: best.pp.shares ?? gp.latest_shares,
            latest_engagement_rate: er ?? gp.latest_engagement_rate,
            last_tracked_at: new Date().toISOString(),
          }).eq("id", gp.id);
          results.matched++;
        }
      } catch (e) {
        results.errors.push({ platform: acct.platform, error: e instanceof Error ? e.message : String(e) });
      }
    }

    // Roll up theme averages
    const { data: themePerf } = await sb
      .from("generated_posts")
      .select("theme_id, latest_engagement_rate")
      .not("latest_engagement_rate", "is", null);
    const buckets: Record<string, number[]> = {};
    for (const r of themePerf || []) {
      if (!r.theme_id) continue;
      (buckets[r.theme_id] ||= []).push(Number(r.latest_engagement_rate));
    }
    for (const [tid, arr] of Object.entries(buckets)) {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      await sb.from("post_themes").update({ avg_engagement_rate: avg, performance_sample_size: arr.length }).eq("id", tid);
    }

    return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("track-post-performance error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});