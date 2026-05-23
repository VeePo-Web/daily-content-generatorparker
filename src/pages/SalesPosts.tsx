import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Nav from "../components/studio/Nav";

type Post = {
  id: string; batch_id: string; batch_date: string; platform: string;
  copy: string; image_urls: string[]; is_winner: boolean; score: number;
  swap_token: string; template_product_id: string; theme_id: string | null; created_at: string;
};
type Theme = { id: string; hook: string; category: string; enabled: boolean; use_count: number; template_product_id: string | null };
type Product = { id: string; name: string; vertical: string; slug: string; one_liner: string | null; price_one_time: number; price_monthly: number; weight: number; enabled: boolean };
type Asset = { id: string; template_product_id: string | null; public_url: string };

export default function SalesPosts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: pr }, { data: p }, { data: t }, { data: a }] = await Promise.all([
      supabase.from("template_products").select("*").eq("enabled", true).order("weight", { ascending: false }),
      supabase.from("generated_posts").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("post_themes").select("*").order("category").order("hook"),
      supabase.from("template_assets").select("id,template_product_id,public_url").eq("do_not_use", false).limit(200),
    ]);
    setProducts((pr as Product[]) || []);
    setPosts((p as Post[]) || []);
    setThemes((t as Theme[]) || []);
    setAssets((a as Asset[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function call(fn: string, label: string, body: Record<string, unknown> = {}) {
    setBusy(label); setMsg(null);
    const { data, error } = await supabase.functions.invoke(fn, { body });
    setBusy(null);
    setMsg(error ? `❌ ${error.message}` : `✓ ${label}`);
    if (!error) load();
    return { data, error };
  }

  async function toggleTheme(id: string, enabled: boolean) {
    await supabase.from("post_themes").update({ enabled: !enabled }).eq("id", id);
    load();
  }

  const selected = selectedId ? products.find(p => p.id === selectedId) : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setSelectedId(null)}
            className="font-bold tracking-tight text-left hover:text-emerald-400"
          >
            Veepo · Sales Posts {selected && <span className="text-slate-500 font-normal">/ {selected.name}</span>}
          </button>
          <Nav />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {msg && <p className="text-xs text-slate-400 font-mono mb-4">{msg}</p>}

        {loading ? <p className="text-slate-500">Loading…</p> :
          !selected ? (
            <CampaignGrid
              products={products}
              posts={posts}
              themes={themes}
              assets={assets}
              busy={busy}
              onOpen={setSelectedId}
              onGenerate={(id) => call("generate-daily-posts", `gen-${id}`, { template_product_id: id })}
              onSend={(id) => call("send-daily-post-email", `send-${id}`, { template_product_id: id })}
            />
          ) : (
            <CampaignDetail
              product={selected}
              posts={posts.filter(p => p.template_product_id === selected.id)}
              themes={themes.filter(t => t.template_product_id === null || t.template_product_id === selected.id)}
              busy={busy}
              onBack={() => setSelectedId(null)}
              onGenerate={() => call("generate-daily-posts", `gen-${selected.id}`, { template_product_id: selected.id })}
              onSend={() => call("send-daily-post-email", `send-${selected.id}`, { template_product_id: selected.id })}
              onToggleTheme={toggleTheme}
            />
          )
        }
      </main>
    </div>
  );
}

function CampaignGrid({ products, posts, themes, assets, busy, onOpen, onGenerate, onSend }: {
  products: Product[]; posts: Post[]; themes: Theme[]; assets: Asset[];
  busy: string | null;
  onOpen: (id: string) => void;
  onGenerate: (id: string) => void;
  onSend: (id: string) => void;
}) {
  if (!products.length) {
    return <p className="text-slate-500">No enabled campaigns. Add a template_products row.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[220px] gap-3">
      {products.map((p, i) => {
        const productPosts = posts.filter(x => x.template_product_id === p.id);
        const batches = new Set(productPosts.map(x => x.batch_id)).size;
        const last = productPosts[0]?.created_at;
        const themeCount = themes.filter(t => t.template_product_id === null || t.template_product_id === p.id).length;
        const enabledThemeCount = themes.filter(t => (t.template_product_id === null || t.template_product_id === p.id) && t.enabled).length;
        const bgAsset = assets.find(a => a.template_product_id === p.id) || assets[i % Math.max(1, assets.length)];
        // First (heaviest) tile spans 2 cols on md+
        const span = i === 0 ? "md:col-span-2 md:row-span-2" : "";
        return (
          <button
            key={p.id}
            onClick={() => onOpen(p.id)}
            className={`group relative overflow-hidden border border-slate-700 hover:border-emerald-500/60 bg-slate-800/40 text-left transition-colors ${span}`}
          >
            {bgAsset?.public_url && (
              <img src={bgAsset.public_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity" />
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/50 to-transparent" />
            <div className="relative h-full flex flex-col justify-between p-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 mb-2">{p.vertical}</div>
                <h3 className={`font-bold tracking-tight ${i === 0 ? "text-3xl md:text-4xl" : "text-xl"}`}>{p.name}</h3>
                {p.one_liner && i === 0 && <p className="text-sm text-slate-300 mt-2 max-w-md">{p.one_liner}</p>}
              </div>
              <div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                  <span className="text-slate-200 font-mono">${p.price_one_time}</span>
                  <span>·</span>
                  <span className="font-mono">${p.price_monthly}/mo</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3 font-mono">
                  <span>{batches} batches</span>
                  <span>·</span>
                  <span>{enabledThemeCount}/{themeCount} hooks</span>
                  {last && <><span>·</span><span>last {relTime(last)}</span></>}
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); onGenerate(p.id); }}
                    aria-disabled={!!busy}
                    className={`px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold cursor-pointer ${busy ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {busy === `gen-${p.id}` ? "Generating…" : "Generate"}
                  </span>
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); onSend(p.id); }}
                    aria-disabled={!!busy}
                    className={`px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-semibold cursor-pointer ${busy ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {busy === `send-${p.id}` ? "Sending…" : "Send latest"}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CampaignDetail({ product, posts, themes, busy, onBack, onGenerate, onSend, onToggleTheme }: {
  product: Product; posts: Post[]; themes: Theme[]; busy: string | null;
  onBack: () => void; onGenerate: () => void; onSend: () => void;
  onToggleTheme: (id: string, enabled: boolean) => void;
}) {
  const batches = useMemo(() => Array.from(
    posts.reduce((m, p) => {
      const arr = m.get(p.batch_id) || []; arr.push(p); m.set(p.batch_id, arr); return m;
    }, new Map<string, Post[]>()).entries()
  ), [posts]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={onBack} className="text-xs text-slate-400 hover:text-emerald-400 mb-2">← All campaigns</button>
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          {product.one_liner && <p className="text-sm text-slate-400 mt-1">{product.one_liner}</p>}
          <p className="text-xs text-slate-500 mt-1 font-mono">${product.price_one_time} once · ${product.price_monthly}/mo · {product.vertical}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onGenerate}
            disabled={!!busy}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold disabled:opacity-50"
          >{busy?.startsWith("gen-") ? "Generating…" : "Generate now"}</button>
          <button
            onClick={onSend}
            disabled={!!busy}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm font-semibold disabled:opacity-50"
          >{busy?.startsWith("send-") ? "Sending…" : "Send latest"}</button>
        </div>
      </div>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-3">History ({batches.length} batches)</h2>
        {batches.length === 0 ? (
          <p className="text-slate-500 text-sm">No posts yet for this campaign. Click "Generate now".</p>
        ) : (
          <div className="space-y-4">
            {batches.map(([batchId, list]) => {
              const winner = list.find(p => p.is_winner) || list[0];
              return (
                <div key={batchId} className="border border-slate-700 overflow-hidden bg-slate-800/40">
                  <div className="px-4 py-2 bg-slate-800 flex items-center gap-3 text-xs text-slate-400">
                    <span>{new Date(winner.created_at).toLocaleString()}</span>
                    <span className="px-2 py-0.5 bg-emerald-900/50 text-emerald-300 uppercase font-bold">{winner.platform}</span>
                    <span>score {winner.score}</span>
                  </div>
                  <div className="p-4 grid md:grid-cols-3 gap-3">
                    {list.map(p => (
                      <div key={p.id} className={`border p-3 ${p.is_winner ? "border-emerald-500 bg-emerald-950/20" : "border-slate-700"}`}>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="uppercase font-bold text-slate-300">{p.platform}</span>
                          <span className="text-slate-500">{p.score}</span>
                        </div>
                        {p.image_urls?.[0] && <img src={p.image_urls[0]} className="w-full h-24 object-cover mb-2" />}
                        <pre className="text-xs whitespace-pre-wrap font-sans text-slate-200 max-h-48 overflow-y-auto">{p.copy}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-3">
          Hooks ({themes.filter(t => t.enabled).length}/{themes.length} enabled)
        </h2>
        <div className="grid md:grid-cols-2 gap-2">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => onToggleTheme(t.id, t.enabled)}
              className={`text-left p-3 border text-xs ${t.enabled ? "border-slate-700 bg-slate-800/40" : "border-slate-800 bg-slate-900/40 opacity-50"}`}
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
    </div>
  );
}

function relTime(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}