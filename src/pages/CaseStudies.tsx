import { useEffect, useState } from "react";
import { Plus, Trash2, Send, RefreshCw, ExternalLink } from "lucide-react";
import Nav from "../components/studio/Nav";
import { supabase } from "@/integrations/supabase/client";

interface CaseStudy {
  id: string;
  client_name: string;
  vertical: string | null;
  website_url: string;
  quote: string | null;
  quote_attribution: string | null;
  headline_outcome: string | null;
  enabled: boolean;
  use_count: number;
  last_used_at: string | null;
}

const EMPTY: Omit<CaseStudy, "id" | "use_count" | "last_used_at"> = {
  client_name: "",
  vertical: "",
  website_url: "",
  quote: "",
  quote_attribution: "",
  headline_outcome: "",
  enabled: true,
};

export default function CaseStudies() {
  const [rows, setRows] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .order("last_used_at", { ascending: true, nullsFirst: true });
    if (error) setMsg(error.message);
    setRows((data as CaseStudy[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function add() {
    if (!form.client_name.trim() || !form.website_url.trim()) {
      setMsg("Client name and website URL are required.");
      return;
    }
    setBusy("add");
    const payload = {
      ...form,
      vertical: form.vertical || null,
      quote: form.quote || null,
      quote_attribution: form.quote_attribution || null,
      headline_outcome: form.headline_outcome || null,
    };
    const { error } = await supabase.from("case_studies").insert(payload);
    setBusy(null);
    if (error) { setMsg(error.message); return; }
    setForm(EMPTY);
    setMsg("Added.");
    load();
  }

  async function toggle(id: string, enabled: boolean) {
    await supabase.from("case_studies").update({ enabled: !enabled }).eq("id", id);
    load();
  }

  async function del(id: string) {
    if (!confirm("Delete this case study?")) return;
    await supabase.from("case_studies").delete().eq("id", id);
    load();
  }

  async function generateNow(id?: string) {
    setBusy(id || "all");
    setMsg(null);
    const { data, error } = await supabase.functions.invoke("generate-case-study-post", {
      body: id ? { case_study_id: id, send: true } : { send: true },
    });
    setBusy(null);
    if (error) { setMsg(error.message); return; }
    setMsg(`Generated + emailed: ${(data as any)?.case_study?.client_name || "post"}`);
    load();
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 md:pb-0 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-white tracking-tight">Case Studies</span>
          <Nav />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Case study library</h1>
          <p className="text-sm text-slate-400">
            Each daily post pulls one of these (least-recently-used first). One X post + one LinkedIn post per day. No statistics — just master tips with the client as the living example.
          </p>
        </div>

        <div className="rounded border border-slate-700 bg-slate-800/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Run now</h2>
            <button
              disabled={busy === "all"}
              onClick={() => generateNow()}
              className="flex items-center gap-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-3 py-1.5"
            >
              <Send size={14} /> {busy === "all" ? "Working..." : "Generate + email next post"}
            </button>
          </div>
          {msg && <p className="text-xs text-emerald-400">{msg}</p>}
        </div>

        <div className="rounded border border-slate-700 bg-slate-800/40 p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><Plus size={16} /> Add a case study</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              placeholder="Client name *"
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
            />
            <input
              className="rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              placeholder="Vertical (e.g. music, real estate)"
              value={form.vertical || ""}
              onChange={(e) => setForm({ ...form, vertical: e.target.value })}
            />
            <input
              className="rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm md:col-span-2"
              placeholder="Website URL * (https://...)"
              value={form.website_url}
              onChange={(e) => setForm({ ...form, website_url: e.target.value })}
            />
            <textarea
              className="rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm md:col-span-2"
              placeholder="Verbatim client quote (optional)"
              rows={2}
              value={form.quote || ""}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
            />
            <input
              className="rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              placeholder="Quote attribution (e.g. Karl Salingua)"
              value={form.quote_attribution || ""}
              onChange={(e) => setForm({ ...form, quote_attribution: e.target.value })}
            />
            <input
              className="rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              placeholder="Headline outcome (plain English, NO numbers)"
              value={form.headline_outcome || ""}
              onChange={(e) => setForm({ ...form, headline_outcome: e.target.value })}
            />
          </div>
          <button
            disabled={busy === "add"}
            onClick={add}
            className="rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-3 py-1.5"
          >
            {busy === "add" ? "Adding..." : "Add case study"}
          </button>
        </div>

        <div className="rounded border border-slate-700 bg-slate-800/40">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="font-semibold">Library ({rows.length})</h2>
            <button onClick={load} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          {loading ? (
            <p className="p-4 text-sm text-slate-400">Loading...</p>
          ) : rows.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No case studies yet. Add one above or paste them in chat to seed.</p>
          ) : (
            <ul className="divide-y divide-slate-700">
              {rows.map((r) => (
                <li key={r.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{r.client_name}</span>
                      {r.vertical && <span className="text-xs text-slate-500">· {r.vertical}</span>}
                      {!r.enabled && <span className="text-xs text-amber-400">paused</span>}
                    </div>
                    <a
                      href={r.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <ExternalLink size={11} /> {r.website_url}
                    </a>
                    {r.quote && (
                      <p className="text-xs text-slate-400 italic mt-2 line-clamp-2">
                        "{r.quote}" {r.quote_attribution && <span className="not-italic">— {r.quote_attribution}</span>}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">
                      Used {r.use_count}× · last {r.last_used_at ? new Date(r.last_used_at).toLocaleDateString() : "never"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      disabled={busy === r.id}
                      onClick={() => generateNow(r.id)}
                      className="text-xs rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-2 py-1"
                      title="Generate + email a post for this client now"
                    >
                      {busy === r.id ? "..." : "Run"}
                    </button>
                    <button
                      onClick={() => toggle(r.id, r.enabled)}
                      className="text-xs rounded border border-slate-600 hover:bg-slate-700 px-2 py-1"
                    >
                      {r.enabled ? "Pause" : "Enable"}
                    </button>
                    <button
                      onClick={() => del(r.id)}
                      className="text-xs rounded border border-red-700 text-red-400 hover:bg-red-900/30 px-2 py-1 flex items-center justify-center"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}