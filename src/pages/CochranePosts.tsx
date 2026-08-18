import { useEffect, useState } from "react";
import { Plus, Trash2, RefreshCw, Copy, Check, ExternalLink, Send, MapPin } from "lucide-react";
import Nav from "../components/studio/Nav";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://www.localcochranewebdesign.com";

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

const CATEGORIES = [
  "trust", "local-search", "mobile", "cost",
  "trades", "objection", "behind-the-build", "seasonal",
];

export default function CochranePosts() {
  const [angles, setAngles] = useState<Angle[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [newAngle, setNewAngle] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);

  async function load() {
    setLoading(true);
    const [a, p] = await Promise.all([
      supabase.from("cochrane_angles").select("*").order("last_used_at", { ascending: true, nullsFirst: true }),
      supabase.from("generated_posts").select("id, batch_date, created_at, copy, score_breakdown")
        .eq("platform", "facebook").order("created_at", { ascending: false }).limit(60),
    ]);
    if (a.error) setMsg(a.error.message);
    if (p.error) setMsg(p.error.message);
    setAngles((a.data as Angle[]) || []);
    setPosts((p.data as unknown as Post[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function generate(send: boolean) {
    setBusy(send ? "send" : "generate");
    setMsg(null);
    const { data, error } = await supabase.functions.invoke("generate-cochrane-facebook-post", {
      body: { send },
    });
    setBusy(null);
    if (error) { setMsg(error.message); return; }
    setMsg(send ? "Generated and emailed to parker@veepo.ca." : `Generated (${(data as { chars?: number })?.chars ?? "?"} characters).`);
    load();
  }

  async function addAngle() {
    if (!newAngle.trim()) return;
    setBusy("add");
    const { error } = await supabase.from("cochrane_angles").insert({ angle: newAngle.trim(), category: newCategory });
    setBusy(null);
    if (error) { setMsg(error.message); return; }
    setNewAngle("");
    load();
  }

  async function toggle(id: string, enabled: boolean) {
    await supabase.from("cochrane_angles").update({ enabled: !enabled }).eq("id", id);
    load();
  }

  async function remove(id: string) {
    await supabase.from("cochrane_angles").delete().eq("id", id);
    load();
  }

  async function copyPost(p: Post) {
    await navigator.clipboard.writeText(p.copy);
    setCopied(p.id);
    setTimeout(() => setCopied(null), 1600);
  }

  const enabledCount = angles.filter((a) => a.enabled).length;
  const nextAngle = angles.find((a) => a.enabled);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold">Cochrane</h1>
            <p className="text-xs text-slate-400">Daily Facebook engine · Local Cochrane Web Design</p>
          </div>
          <Nav />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6 space-y-6">
        {msg && (
          <div className="rounded border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">{msg}</div>
        )}

        {/* Bento: campaign tile + stats */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
              <MapPin size={13} /> Cochrane, Alberta
            </div>
            <h2 className="mt-3 text-2xl font-semibold">Local Cochrane Web Design</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              One Facebook post every morning at 7:00am — a local marketing lesson, a Cochrane scene,
              and a soft link. No statistics, no invented results.
            </p>
            <a
              href={SITE_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"
            >
              {SITE_URL.replace("https://www.", "")} <ExternalLink size={13} />
            </a>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => generate(false)}
                disabled={!!busy}
                className="inline-flex items-center gap-2 rounded bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
              >
                <RefreshCw size={14} className={busy === "generate" ? "animate-spin" : ""} />
                Generate now
              </button>
              <button
                onClick={() => generate(true)}
                disabled={!!busy}
                className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
              >
                <Send size={14} className={busy === "send" ? "animate-pulse" : ""} />
                Generate & email
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <div className="text-3xl font-semibold">{enabledCount}</div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Active angles</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <div className="text-3xl font-semibold">{posts.length}</div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Posts generated</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <div className="text-xs uppercase tracking-wider text-slate-500">Next angle up</div>
              <div className="mt-1 text-sm text-slate-300">{nextAngle?.angle || "—"}</div>
            </div>
          </div>
        </section>

        {/* History */}
        <section className="rounded-lg border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-5 py-3 text-sm font-medium">Post history</div>
          {loading ? (
            <div className="px-5 py-6 text-sm text-slate-500">Loading…</div>
          ) : posts.length === 0 ? (
            <div className="px-5 py-6 text-sm text-slate-500">No posts yet. Hit Generate now.</div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {posts.map((p) => {
                const sb = (p.score_breakdown || {}) as { angle?: string; category?: string };
                return (
                  <li key={p.id} className="px-5 py-4">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium text-slate-200">{sb.angle || "—"}</div>
                        <div className="text-xs text-slate-500">
                          {p.batch_date} · {sb.category || "—"} · {p.copy.length} characters
                        </div>
                      </div>
                      <button
                        onClick={() => copyPost(p)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                      >
                        {copied === p.id ? <Check size={13} /> : <Copy size={13} />}
                        {copied === p.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap rounded bg-slate-950 p-3 text-sm leading-relaxed text-slate-300">
                      {p.copy}
                    </pre>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Angle library */}
        <section className="rounded-lg border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-5 py-3 text-sm font-medium">Angle library</div>
          <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row">
            <input
              value={newAngle}
              onChange={(e) => setNewAngle(e.target.value)}
              placeholder="New angle, e.g. Why your service area page decides the call"
              className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={addAngle}
              disabled={busy === "add"}
              className="inline-flex items-center justify-center gap-1.5 rounded bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700 disabled:opacity-50"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <ul className="divide-y divide-slate-800">
            {angles.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                <input
                  type="checkbox"
                  checked={a.enabled}
                  onChange={() => toggle(a.id, a.enabled)}
                  className="h-4 w-4 accent-blue-500"
                />
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm ${a.enabled ? "text-slate-200" : "text-slate-600 line-through"}`}>
                    {a.angle}
                  </div>
                  <div className="text-xs text-slate-500">
                    {a.category} · used {a.use_count}× · {a.last_used_at ? new Date(a.last_used_at).toLocaleDateString() : "never"}
                  </div>
                </div>
                <button onClick={() => remove(a.id)} className="text-slate-600 hover:text-red-400">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
