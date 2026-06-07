import { useEffect, useState } from "react";
import Nav from "../components/studio/Nav";
import { supabase } from "@/integrations/supabase/client";

type GP = {
  id: string;
  platform: string;
  copy: string;
  created_at: string;
  live_post_url: string | null;
  latest_impressions: number | null;
  latest_likes: number | null;
  latest_comments: number | null;
  latest_shares: number | null;
  latest_engagement_rate: number | null;
  last_tracked_at: string | null;
};

type Account = { id: string; platform: string; profile_url: string; handle: string | null };
type Trend = { id: string; week_of: string; platform: string; hook_pattern: string; example_copy: string | null };

export default function Performance() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [posts, setPosts] = useState<GP[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");

  const [liUrl, setLiUrl] = useState("");
  const [xUrl, setXUrl] = useState("");

  async function load() {
    const [a, p, t] = await Promise.all([
      supabase.from("social_accounts").select("*").order("platform"),
      supabase.from("generated_posts").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("social_trends").select("*").order("week_of", { ascending: false }).limit(10),
    ]);
    setAccounts((a.data as Account[]) || []);
    setPosts((p.data as GP[]) || []);
    setTrends((t.data as Trend[]) || []);
    const li = (a.data as Account[])?.find((x) => x.platform === "linkedin");
    const xx = (a.data as Account[])?.find((x) => x.platform === "x");
    if (li) setLiUrl(li.profile_url);
    if (xx) setXUrl(xx.profile_url);
  }

  useEffect(() => { load(); }, []);

  async function saveAccount(platform: "linkedin" | "x", profile_url: string) {
    if (!profile_url.trim()) return;
    setBusy("save");
    const existing = accounts.find((a) => a.platform === platform);
    if (existing) {
      await supabase.from("social_accounts").update({ profile_url: profile_url.trim() }).eq("id", existing.id);
    } else {
      await supabase.from("social_accounts").insert({ platform, profile_url: profile_url.trim() });
    }
    setBusy(null);
    setMsg("Saved");
    setTimeout(() => setMsg(""), 1500);
    load();
  }

  async function runTracker() {
    setBusy("track");
    const { data, error } = await supabase.functions.invoke("track-post-performance");
    setBusy(null);
    setMsg(error ? `Error: ${error.message}` : `Tracked: ${data?.matched || 0} matched, ${data?.snapshots || 0} snapshots`);
    load();
  }

  async function runTrends() {
    setBusy("trends");
    const { data, error } = await supabase.functions.invoke("scan-social-trends");
    setBusy(null);
    setMsg(error ? `Error: ${error.message}` : `Trends scanned: ${data?.inserted || 0} new patterns`);
    load();
  }

  async function manualUpdate(id: string) {
    const url = prompt("Live post URL (optional)") || undefined;
    const impressions = Number(prompt("Impressions") || "") || undefined;
    const likes = Number(prompt("Likes") || "") || undefined;
    const comments = Number(prompt("Comments") || "") || undefined;
    const shares = Number(prompt("Shares / Reposts") || "") || undefined;
    const { error } = await supabase.functions.invoke("match-post-url", {
      body: { generated_post_id: id, post_url: url, impressions, likes, comments, shares },
    });
    if (error) setMsg(`Error: ${error.message}`); else { setMsg("Updated"); load(); }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 md:pb-0">
      <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Performance</h1>
        <Nav />
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {msg && <div className="bg-blue-900/40 border border-blue-800 px-3 py-2 text-sm rounded">{msg}</div>}

        <section className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
          <h2 className="font-semibold">Your profile URLs</h2>
          <p className="text-xs text-slate-400">Paste once. The tracker scrapes these daily to match your published posts.</p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">LinkedIn profile URL</label>
              <div className="flex gap-2">
                <input value={liUrl} onChange={(e) => setLiUrl(e.target.value)} placeholder="https://www.linkedin.com/in/yourname/recent-activity/all/" className="flex-1 bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm rounded" />
                <button onClick={() => saveAccount("linkedin", liUrl)} className="bg-blue-700 hover:bg-blue-600 px-3 text-sm rounded">Save</button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">X (Twitter) profile URL</label>
              <div className="flex gap-2">
                <input value={xUrl} onChange={(e) => setXUrl(e.target.value)} placeholder="https://x.com/yourhandle" className="flex-1 bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm rounded" />
                <button onClick={() => saveAccount("x", xUrl)} className="bg-blue-700 hover:bg-blue-600 px-3 text-sm rounded">Save</button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button disabled={!!busy} onClick={runTracker} className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 px-3 py-1.5 text-sm rounded">{busy === "track" ? "Tracking…" : "Run tracker now"}</button>
            <button disabled={!!busy} onClick={runTrends} className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 px-3 py-1.5 text-sm rounded">{busy === "trends" ? "Scanning…" : "Scan weekly trends"}</button>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded p-4">
          <h2 className="font-semibold mb-3">Top performers</h2>
          <div className="space-y-2">
            {posts.filter((p) => p.latest_engagement_rate).sort((a, b) => (b.latest_engagement_rate || 0) - (a.latest_engagement_rate || 0)).slice(0, 5).map((p) => (
              <div key={p.id} className="border border-slate-800 p-3 rounded text-sm">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{p.platform.toUpperCase()} · {new Date(p.created_at).toLocaleDateString()}</span>
                  <span>👍 {p.latest_likes || 0} · 💬 {p.latest_comments || 0} · 🔁 {p.latest_shares || 0}</span>
                </div>
                <div className="line-clamp-2">{p.copy}</div>
              </div>
            ))}
            {!posts.some((p) => p.latest_engagement_rate) && <p className="text-xs text-slate-500">No performance data yet. Publish posts and run the tracker.</p>}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded p-4">
          <h2 className="font-semibold mb-3">All posts (last 50)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-slate-400">
                <tr><th className="text-left p-2">Date</th><th className="text-left p-2">Platform</th><th className="text-left p-2">Copy</th><th className="text-right p-2">👍</th><th className="text-right p-2">💬</th><th className="text-right p-2">🔁</th><th className="p-2">Matched</th><th className="p-2"></th></tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-t border-slate-800">
                    <td className="p-2 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-2">{p.platform}</td>
                    <td className="p-2 max-w-md truncate">{p.copy}</td>
                    <td className="p-2 text-right">{p.latest_likes ?? "—"}</td>
                    <td className="p-2 text-right">{p.latest_comments ?? "—"}</td>
                    <td className="p-2 text-right">{p.latest_shares ?? "—"}</td>
                    <td className="p-2 text-center">{p.live_post_url ? <a href={p.live_post_url} target="_blank" rel="noreferrer" className="text-blue-400">↗</a> : <span className="text-slate-600">—</span>}</td>
                    <td className="p-2"><button onClick={() => manualUpdate(p.id)} className="text-xs text-slate-400 hover:text-white">edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded p-4">
          <h2 className="font-semibold mb-3">This week's trending hook patterns</h2>
          <div className="space-y-2">
            {trends.map((t) => (
              <div key={t.id} className="border border-slate-800 p-3 rounded text-sm">
                <div className="text-xs text-slate-400 mb-1">{t.platform.toUpperCase()} · week of {t.week_of}</div>
                <div className="font-medium">{t.hook_pattern}</div>
                {t.example_copy && <div className="text-xs text-slate-500 mt-1 italic">"{t.example_copy}"</div>}
              </div>
            ))}
            {!trends.length && <p className="text-xs text-slate-500">No trends yet. Run the weekly scanner.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}