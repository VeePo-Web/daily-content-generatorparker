import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Nav from "../components/studio/Nav";

type Post = {
  id: string;
  batch_id: string;
  batch_date: string;
  platform: string;
  copy: string;
  image_urls: string[];
  is_winner: boolean;
  score: number;
  swap_token: string;
  template_product_id: string;
  theme_id: string | null;
  created_at: string;
};

type Theme = { id: string; hook: string; category: string; enabled: boolean; use_count: number };

export default function SalesPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: p }, { data: t }] = await Promise.all([
      supabase.from("generated_posts").select("*").order("created_at", { ascending: false }).limit(90),
      supabase.from("post_themes").select("*").order("category").order("hook"),
    ]);
    setPosts((p as Post[]) || []);
    setThemes((t as Theme[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function call(fn: string, label: string) {
    setBusy(label); setMsg(null);
    const { data, error } = await supabase.functions.invoke(fn, { body: {} });
    setBusy(null);
    setMsg(error ? `❌ ${error.message}` : `✓ ${label}: ${JSON.stringify(data)}`);
    if (!error) load();
  }

  async function toggleTheme(id: string, enabled: boolean) {
    await supabase.from("post_themes").update({ enabled: !enabled }).eq("id", id);
    load();
  }

  // Group posts by batch
  const batches = Array.from(
    posts.reduce((m, p) => {
      const arr = m.get(p.batch_id) || [];
      arr.push(p);
      m.set(p.batch_id, arr);
      return m;
    }, new Map<string, Post[]>()).entries()
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold tracking-tight">Veepo · Sales Posts</span>
          <Nav />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        <section className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => call("generate-daily-posts", "Generated")}
            disabled={!!busy}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-semibold disabled:opacity-50"
          >
            {busy === "Generated" ? "Generating…" : "Generate now"}
          </button>
          <button
            onClick={() => call("send-daily-post-email", "Sent")}
            disabled={!!busy}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-semibold disabled:opacity-50"
          >
            {busy === "Sent" ? "Sending…" : "Send latest to parker@veepo.ca"}
          </button>
          {msg && <span className="text-xs text-slate-400 font-mono">{msg}</span>}
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-3">Recent batches</h2>
          {loading ? <p className="text-slate-500">Loading…</p> :
            batches.length === 0 ? <p className="text-slate-500">No posts yet. Click "Generate now".</p> :
              <div className="space-y-4">
                {batches.map(([batchId, list]) => {
                  const winner = list.find(p => p.is_winner) || list[0];
                  return (
                    <div key={batchId} className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/50">
                      <div className="px-4 py-2 bg-slate-800 flex items-center gap-3 text-xs text-slate-400">
                        <span>{new Date(winner.created_at).toLocaleString()}</span>
                        <span className="px-2 py-0.5 bg-emerald-900/50 text-emerald-300 rounded uppercase font-bold">{winner.platform}</span>
                        <span>score {winner.score}</span>
                      </div>
                      <div className="p-4 grid md:grid-cols-3 gap-3">
                        {list.map(p => (
                          <div key={p.id} className={`rounded border p-3 ${p.is_winner ? "border-emerald-500 bg-emerald-950/20" : "border-slate-700"}`}>
                            <div className="flex justify-between text-xs mb-2">
                              <span className="uppercase font-bold text-slate-300">{p.platform}</span>
                              <span className="text-slate-500">{p.score}</span>
                            </div>
                            {p.image_urls?.[0] && <img src={p.image_urls[0]} className="w-full h-24 object-cover mb-2 rounded" />}
                            <pre className="text-xs whitespace-pre-wrap font-sans text-slate-200 max-h-48 overflow-y-auto">{p.copy}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-3">Themes ({themes.filter(t => t.enabled).length}/{themes.length} enabled)</h2>
          <div className="grid md:grid-cols-2 gap-2">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => toggleTheme(t.id, t.enabled)}
                className={`text-left p-3 rounded border text-xs ${t.enabled ? "border-slate-700 bg-slate-800/40" : "border-slate-800 bg-slate-900/40 opacity-50"}`}
              >
                <div className="flex justify-between mb-1">
                  <span className="uppercase font-bold text-slate-400">{t.category}</span>
                  <span className="text-slate-500">used {t.use_count}×</span>
                </div>
                <span className="text-slate-200">{t.hook}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}