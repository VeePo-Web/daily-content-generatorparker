import { useEffect, useState } from "react";
import { Plus, Trash2, RefreshCw, Copy, Check, ExternalLink, Send, MapPin, ArrowLeft, HandCoins, Quote } from "lucide-react";
import Nav from "../components/studio/Nav";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://www.localcochranewebdesign.com";

type CampaignKey = "value" | "referral";

const CAMPAIGNS: Record<CampaignKey, {
  title: string;
  kicker: string;
  blurb: string;
  table: "cochrane_angles" | "cochrane_referral_angles";
  fn: string;
  source: string;
  sendTime: string;
  categories: string[];
}> = {
  value: {
    title: "Daily Value Post",
    kicker: "Cochrane business owners",
    blurb: "A local marketing lesson, a Cochrane scene, and a soft link. No statistics, no invented results.",
    table: "cochrane_angles",
    fn: "generate-cochrane-facebook-post",
    source: "cochrane-facebook",
    sendTime: "7:00am MST",
    categories: ["trust", "local-search", "mobile", "cost", "trades", "objection", "behind-the-build", "seasonal"],
  },
  referral: {
    title: "$300 Referral Post",
    kicker: "People who know a business owner",
    blurb: "Refer someone. When they buy a site over $2,500, the referrer gets $300 by e-transfer. Every post carries a real Google review.",
    table: "cochrane_referral_angles",
    fn: "generate-cochrane-referral-post",
    source: "cochrane-referral",
    sendTime: "7:05am MST",
    categories: [
      "trusted-friend-ask", "proof-and-reputation", "reluctant-referrer", "trades-network",
      "why-we-pay", "what-300-buys", "who-to-think-of", "awkward-recommendation", "seasonal",
    ],
  },
};

interface Angle {
  id: string;
  angle: string;
  category: string;
  enabled: boolean;
  use_count: number;
  last_used_at: string | null;
}

interface Post {
  id: string;
  batch_date: string;
  created_at: string;
  copy: string;
  score_breakdown: Record<string, unknown> | null;
}

interface Review {
  id: string;
  reviewer_name: string;
  quote: string;
  enabled: boolean;
  use_count: number;
  last_used_at: string | null;
}

export default function CochranePosts() {
  const [active, setActive] = useState<CampaignKey | null>(null);
  const [angles, setAngles] = useState<Record<CampaignKey, Angle[]>>({ value: [], referral: [] });
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [newAngle, setNewAngle] = useState("");
  const [newCategory, setNewCategory] = useState("");

  async function load() {
    setLoading(true);
    const [v, r, p, rv] = await Promise.all([
      supabase.from("cochrane_angles").select("*").order("last_used_at", { ascending: true, nullsFirst: true }),
      supabase.from("cochrane_referral_angles").select("*").order("last_used_at", { ascending: true, nullsFirst: true }),
      supabase.from("generated_posts").select("id, batch_date, created_at, copy, score_breakdown")
        .eq("platform", "facebook").order("created_at", { ascending: false }).limit(120),
      supabase.from("cochrane_reviews").select("*").order("last_used_at", { ascending: true, nullsFirst: true }),
    ]);
    const err = v.error || r.error || p.error || rv.error;
    if (err) setMsg(err.message);
    setAngles({ value: (v.data as Angle[]) || [], referral: (r.data as Angle[]) || [] });
    setPosts((p.data as unknown as Post[]) || []);
    setReviews((rv.data as Review[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function postsFor(key: CampaignKey) {
    return posts.filter((p) => (p.score_breakdown as { source?: string } | null)?.source === CAMPAIGNS[key].source);
  }

  async function generate(key: CampaignKey, send: boolean) {
    setBusy(send ? "send" : "generate");
    setMsg(null);
    const { data, error } = await supabase.functions.invoke(CAMPAIGNS[key].fn, { body: { send } });
    setBusy(null);
    if (error) { setMsg(error.message); return; }
    setMsg(send ? "Generated and emailed to parker@veepo.ca." : `Generated (${(data as { chars?: number })?.chars ?? "?"} characters).`);
    load();
  }

  async function addAngle(key: CampaignKey) {
    if (!newAngle.trim()) return;
    setBusy("add");
    const { error } = await supabase.from(CAMPAIGNS[key].table)
      .insert({ angle: newAngle.trim(), category: newCategory || CAMPAIGNS[key].categories[0] });
    setBusy(null);
    if (error) { setMsg(error.message); return; }
    setNewAngle("");
    load();
  }

  async function toggle(key: CampaignKey, id: string, enabled: boolean) {
    await supabase.from(CAMPAIGNS[key].table).update({ enabled: !enabled }).eq("id", id);
    load();
  }

  async function remove(key: CampaignKey, id: string) {
    await supabase.from(CAMPAIGNS[key].table).delete().eq("id", id);
    load();
  }

  async function copyPost(p: Post) {
    await navigator.clipboard.writeText(p.copy);
    setCopied(p.id);
    setTimeout(() => setCopied(null), 1600);
  }

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold">Cochrane</h1>
            <p className="text-xs text-slate-400">Daily Facebook engines · Local Cochrane Web Design</p>
          </div>
          <Nav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-6 space-y-6">
        {msg && <div className="rounded border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">{msg}</div>}
        {children}
      </main>
    </div>
  );

  // ── Level 1: campaign bento ───────────────────────────────────────────────
  if (!active) {
    return shell(
      <>
        <section className="grid gap-4 md:grid-cols-2">
          {(Object.keys(CAMPAIGNS) as CampaignKey[]).map((key) => {
            const c = CAMPAIGNS[key];
            const enabled = angles[key].filter((a) => a.enabled).length;
            return (
              <button
                key={key}
                onClick={() => { setActive(key); setNewCategory(c.categories[0]); }}
                className="group rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-left transition hover:border-slate-600"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                  {key === "referral" ? <HandCoins size={13} /> : <MapPin size={13} />} {c.kicker}
                </div>
                <h2 className="mt-3 text-2xl font-semibold">{c.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{c.blurb}</p>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded border border-slate-800 bg-slate-900 py-3">
                    <div className="text-xl font-semibold">{enabled}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Angles</div>
                  </div>
                  <div className="rounded border border-slate-800 bg-slate-900 py-3">
                    <div className="text-xl font-semibold">{postsFor(key).length}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Posts</div>
                  </div>
                  <div className="rounded border border-slate-800 bg-slate-900 py-3">
                    <div className="text-xl font-semibold">{c.sendTime.split("am")[0]}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Daily MST</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-blue-400 group-hover:text-blue-300">Open campaign →</div>
              </button>
            );
          })}
        </section>
        <a href={SITE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300">
          {SITE_URL.replace("https://www.", "")} <ExternalLink size={13} />
        </a>
      </>
    );
  }

  // ── Level 2: campaign detail ──────────────────────────────────────────────
  const c = CAMPAIGNS[active];
  const list = angles[active];
  const history = postsFor(active);
  const nextAngle = list.find((a) => a.enabled);
  const nextReview = reviews.find((r) => r.enabled);

  return shell(
    <>
      <button onClick={() => setActive(null)} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft size={14} /> All campaigns
      </button>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
            {active === "referral" ? <HandCoins size={13} /> : <MapPin size={13} />} {c.kicker}
          </div>
          <h2 className="mt-3 text-2xl font-semibold">{c.title}</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">{c.blurb}</p>
          <p className="mt-2 text-xs text-slate-500">Sends daily at {c.sendTime} to parker@veepo.ca.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => generate(active, false)} disabled={!!busy}
              className="inline-flex items-center gap-2 rounded bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50">
              <RefreshCw size={14} className={busy === "generate" ? "animate-spin" : ""} /> Generate now
            </button>
            <button onClick={() => generate(active, true)} disabled={!!busy}
              className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50">
              <Send size={14} className={busy === "send" ? "animate-pulse" : ""} /> Generate &amp; email
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <div className="text-3xl font-semibold">{list.filter((a) => a.enabled).length}</div>
            <div className="text-xs uppercase tracking-wider text-slate-500">Active angles</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <div className="text-3xl font-semibold">{history.length}</div>
            <div className="text-xs uppercase tracking-wider text-slate-500">Posts generated</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500">Next angle up</div>
            <div className="mt-1 text-sm text-slate-300">{nextAngle?.angle || "—"}</div>
            {active === "referral" && (
              <div className="mt-3 text-xs text-slate-500">Next review: {nextReview?.reviewer_name || "—"}</div>
            )}
          </div>
        </div>
      </section>

      {active === "referral" && (
        <section className="rounded-lg border border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-3 text-sm font-medium">
            <Quote size={14} /> Review library (used verbatim, rotated)
          </div>
          <ul className="divide-y divide-slate-800">
            {reviews.map((r) => (
              <li key={r.id} className="px-5 py-3">
                <div className="text-sm text-slate-300">“{r.quote}”</div>
                <div className="mt-1 text-xs text-slate-500">
                  {r.reviewer_name} · used {r.use_count}× · {r.last_used_at ? new Date(r.last_used_at).toLocaleDateString() : "never"}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-5 py-3 text-sm font-medium">Post history</div>
        {loading ? (
          <div className="px-5 py-6 text-sm text-slate-500">Loading…</div>
        ) : history.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500">No posts yet. Hit Generate now.</div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {history.map((p) => {
              const sb = (p.score_breakdown || {}) as { angle?: string; category?: string; reviewer?: string };
              return (
                <li key={p.id} className="px-5 py-4">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-200">{sb.angle || "—"}</div>
                      <div className="text-xs text-slate-500">
                        {p.batch_date} · {sb.category || "—"}{sb.reviewer ? ` · review: ${sb.reviewer}` : ""} · {p.copy.length} characters
                      </div>
                    </div>
                    <button onClick={() => copyPost(p)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800">
                      {copied === p.id ? <Check size={13} /> : <Copy size={13} />}
                      {copied === p.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap rounded bg-slate-950 p-3 text-sm leading-relaxed text-slate-300">{p.copy}</pre>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-5 py-3 text-sm font-medium">Angle library</div>
        <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row">
          <input
            value={newAngle}
            onChange={(e) => setNewAngle(e.target.value)}
            placeholder={active === "referral" ? "New referral angle, e.g. the friend who just opened a shop" : "New angle, e.g. why your service area page decides the call"}
            className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none">
            {c.categories.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <button onClick={() => addAngle(active)} disabled={busy === "add"}
            className="inline-flex items-center justify-center gap-1.5 rounded bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700 disabled:opacity-50">
            <Plus size={14} /> Add
          </button>
        </div>
        <ul className="divide-y divide-slate-800">
          {list.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-5 py-3">
              <input type="checkbox" checked={a.enabled} onChange={() => toggle(active, a.id, a.enabled)} className="h-4 w-4 accent-blue-500" />
              <div className="min-w-0 flex-1">
                <div className={`truncate text-sm ${a.enabled ? "text-slate-200" : "text-slate-600 line-through"}`}>{a.angle}</div>
                <div className="text-xs text-slate-500">
                  {a.category} · used {a.use_count}× · {a.last_used_at ? new Date(a.last_used_at).toLocaleDateString() : "never"}
                </div>
              </div>
              <button onClick={() => remove(active, a.id)} className="text-slate-600 hover:text-red-400">
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
