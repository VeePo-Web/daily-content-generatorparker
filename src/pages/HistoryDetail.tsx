import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Nav from "../components/studio/Nav";
import PostCard from "../components/studio/PostCard";
import ResultLogger from "../components/studio/ResultLogger";
import { getRecord, logResult, formatDisplayDate, saveRecord } from "../lib/posts";
import type { PostResult } from "../types/content";
import Toast from "../components/studio/Toast";

export default function HistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState(() => (id ? getRecord(id) : null));
  const [toast, setToast] = useState<string | null>(null);

  const handleLogResult = useCallback(
    (result: PostResult) => {
      if (!id) return;
      logResult(id, result);
      setRecord(getRecord(id));
      setToast(`Results saved — ${result.dms_received} DMs, ${result.sales_from_post} sales`);
    },
    [id]
  );

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Record not found.</p>
          <button onClick={() => navigate("/history")} className="text-sm text-blue-400 hover:text-blue-300">
            ← Back to history
          </button>
        </div>
      </div>
    );
  }

  const selectedPost = record.selected_option != null ? record.posts[record.selected_option - 1] : null;

  return (
    <div className="min-h-screen bg-slate-900 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/history")} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <span className="font-bold text-white tracking-tight">Veepo Content Studio</span>
          </div>
          <Nav />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-white">{formatDisplayDate(record.date)}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generated {new Date(record.generated_at).toLocaleString()} ·{" "}
            <span className={`font-medium ${
              record.status === "posted" ? "text-blue-400" :
              record.status === "reviewed" ? "text-emerald-400" : "text-slate-400"
            }`}>
              {record.status}
            </span>
            {record.selected_option && (
              <span className="text-slate-500"> · Option {record.selected_option} selected</span>
            )}
          </p>
        </div>

        {/* Result logger — only show if Parker has selected an option */}
        {record.selected_option !== null && (
          <ResultLogger
            onSave={handleLogResult}
            existing={record.result}
          />
        )}

        {/* Post cards — read only */}
        <div className="space-y-6">
          {record.posts.map((post, i) => (
            <PostCard
              key={i}
              record={record}
              post={post}
              index={i}
              isSelected={record.selected_option === i + 1}
              isDimmed={record.selected_option !== null && record.selected_option !== i + 1}
              readOnly
            />
          ))}
        </div>
      </main>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
