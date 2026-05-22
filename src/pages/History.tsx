import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/studio/Nav";
import PillarBadge from "../components/studio/PillarBadge";
import {
  getAllRecords,
  getLearningInsights,
  formatDisplayDate,
  pct,
} from "../lib/posts";
import type { Pillar } from "../types/content";

type PillarFilter = "ALL" | Pillar;
type StatusFilter = "all" | "reviewed" | "not-reviewed";

const PILLARS: Pillar[] = ["PROOF", "PAIN", "EDUCATION", "PROCESS", "OFFER"];

export default function History() {
  const navigate = useNavigate();
  const [pillarFilter, setPillarFilter] = useState<PillarFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const allRecords = getAllRecords();
  const insights = getLearningInsights();

  const filtered = allRecords.filter((r) => {
    const matchesPillar =
      pillarFilter === "ALL" ||
      r.posts.some((p) => p.pillar === pillarFilter);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "reviewed" && r.selected_option !== null) ||
      (statusFilter === "not-reviewed" && r.selected_option === null);
    return matchesPillar && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-900 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-white tracking-tight">
            Veepo Content Studio
          </span>
          <Nav />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Learning panel */}
        {insights.total_selections > 0 && (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              What's Working
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Most selected pillar</p>
                {insights.most_selected_pillar && (
                  <div className="flex items-center gap-2">
                    <PillarBadge pillar={insights.most_selected_pillar} />
                    <span className="text-sm text-slate-300">
                      {pct(
                        insights.pillar_counts[insights.most_selected_pillar] ?? 0,
                        insights.total_selections
                      )}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Most selected niche</p>
                <p className="text-sm text-slate-200">
                  {insights.most_selected_niche ?? "—"}
                  {insights.most_selected_niche && (
                    <span className="text-slate-400 ml-1">
                      {pct(
                        insights.niche_counts[insights.most_selected_niche] ?? 0,
                        insights.total_selections
                      )}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Least selected pillar</p>
                {insights.least_selected_pillar && (
                  <div className="flex items-center gap-2">
                    <PillarBadge pillar={insights.least_selected_pillar} />
                    <span className="text-sm text-slate-300">
                      {pct(
                        insights.pillar_counts[insights.least_selected_pillar] ?? 0,
                        insights.total_selections
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pillar breakdown bars */}
            <div className="space-y-2">
              {PILLARS.map((p) => {
                const count = insights.pillar_counts[p] ?? 0;
                const percentage = insights.total_selections > 0
                  ? Math.round((count / insights.total_selections) * 100)
                  : 0;
                return (
                  <div key={p} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-slate-400">{p}</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs text-slate-400 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-600 mt-3">
              Based on {insights.total_selections} selection{insights.total_selections !== 1 ? "s" : ""} so far
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPillarFilter("ALL")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              pillarFilter === "ALL"
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-slate-600 text-slate-400 hover:text-white"
            }`}
          >
            All pillars
          </button>
          {PILLARS.map((p) => (
            <button
              key={p}
              onClick={() => setPillarFilter(p)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                pillarFilter === p
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-slate-600 text-slate-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
          <div className="w-px bg-slate-700 mx-1" />
          {(["all", "reviewed", "not-reviewed"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === s
                  ? "bg-slate-600 border-slate-500 text-white"
                  : "border-slate-700 text-slate-500 hover:text-slate-300"
              }`}
            >
              {s === "all" ? "All" : s === "reviewed" ? "Reviewed" : "Not reviewed"}
            </button>
          ))}
        </div>

        {/* Records list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            No records yet. Generate your first posts by running{" "}
            <code className="bg-slate-800 px-1 rounded">python generator.py</code>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 cursor-pointer group"
                onClick={() => navigate(`/history/${record.id}`)}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200">
                    {formatDisplayDate(record.date)}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {record.posts.map((p, i) => (
                      <PillarBadge key={i} pillar={p.pillar} />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {record.selected_option !== null ? (
                    <span className="text-xs text-emerald-400 font-medium">
                      Option {record.selected_option} ✓
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600">Not reviewed</span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      record.status === "reviewed"
                        ? "bg-emerald-900/40 text-emerald-400"
                        : record.status === "posted"
                        ? "bg-blue-900/40 text-blue-400"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {record.status}
                  </span>
                  <span className="text-slate-600 group-hover:text-slate-400 transition-colors">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
