import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return new Response("Missing token", { status: 400 });

  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: target } = await sb.from("generated_posts").select("*").eq("swap_token", token).maybeSingle();
  if (!target) return new Response("Invalid token", { status: 404 });

  // Flip winner within the batch
  await sb.from("generated_posts").update({ is_winner: false }).eq("batch_id", target.batch_id);
  await sb.from("generated_posts").update({ is_winner: true }).eq("id", target.id);

  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;max-width:520px;margin:80px auto;padding:24px;text-align:center;">
<h2 style="color:#4CAF50;">Winner swapped → ${target.platform.toUpperCase()}</h2>
<pre style="text-align:left;background:#f7f7f5;padding:16px;white-space:pre-wrap;font-size:14px;border-left:3px solid #4CAF50;">${target.copy.replace(/</g, "&lt;")}</pre>
<p style="font-size:12px;color:#888;margin-top:24px;">You can close this tab.</p>
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
});