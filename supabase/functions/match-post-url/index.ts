import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  try {
    const body = await req.json();
    const { generated_post_id, post_url, impressions, likes, comments, shares } = body;
    if (!generated_post_id) throw new Error("generated_post_id required");

    const update: any = { last_tracked_at: new Date().toISOString() };
    if (post_url) { update.live_post_url = post_url; update.matched_at = new Date().toISOString(); }
    if (impressions != null) update.latest_impressions = impressions;
    if (likes != null) update.latest_likes = likes;
    if (comments != null) update.latest_comments = comments;
    if (shares != null) update.latest_shares = shares;
    if (likes != null || comments != null || shares != null) {
      update.latest_engagement_rate = (likes || 0) + (comments || 0) + (shares || 0);
    }
    await sb.from("generated_posts").update(update).eq("id", generated_post_id);

    if (impressions != null || likes != null || comments != null || shares != null) {
      await sb.from("post_performance").insert({
        generated_post_id, post_url, source: "manual",
        impressions: impressions ?? null, likes: likes ?? null, comments: comments ?? null, shares: shares ?? null,
        engagement_rate: (likes || 0) + (comments || 0) + (shares || 0),
      });
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});