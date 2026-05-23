import { useState, useCallback } from "react";
import Nav from "../components/studio/Nav";
import PostCard from "../components/studio/PostCard";
import Toast from "../components/studio/Toast";
import {
  getTodayRecord,
  updateSelection,
  formatDisplayDate,
} from "../lib/posts";

export default function Today() {
  const [record, setRecord] = useState(() => getTodayRecord());
  const [toast, setToast] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const displayDate = formatDisplayDate(today);

  const handleSelect = useCallback(
    (optionNumber: number) => {
      if (!record) return;
      updateSelection(record.id, optionNumber, record);
      const post = record.posts[optionNumber - 1];
      setRecord(getTodayRecord());
      setToast(
        `Option ${optionNumber} selected — ${post.pillar} / ${post.niche}${typeof post.quality_score === "number" ? ` / ${post.quality_score}/10` : ""}`
      );
    },
    [record]
  );

  const selectedOption = record?.selected_option ?? null;

  return (
    <div className="min-h-screen bg-slate-900 pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold text-white tracking-tight">
              Veepo Content Studio
            </span>
            <span className="hidden sm:block text-sm text-slate-400">
              {displayDate}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {record ? (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-800">
                Generated ✓
              </span>
            ) : (
              <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-400">
                Not yet generated
              </span>
            )}
            <Nav />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="sm:hidden text-sm text-slate-400 mb-4">{displayDate}</p>

        {record ? (
          <div className="space-y-6">
            {record.posts.map((post, i) => (
              <PostCard
                key={i}
                record={record}
                post={post}
                index={i}
                isSelected={selectedOption === i + 1}
                isDimmed={selectedOption !== null && selectedOption !== i + 1}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Today's posts haven't been generated yet
            </h2>
            <p className="text-sm text-slate-400 mb-1">
              The Python script runs automatically at 8 AM MST.
            </p>
            <p className="text-sm text-slate-500 font-mono mt-3 bg-slate-800 px-4 py-2 rounded">
              python generator.py
            </p>
          </div>
        )}
      </main>

      {toast && (
        <Toast message={toast} onDone={() => setToast(null)} />
      )}
    </div>
  );
}
