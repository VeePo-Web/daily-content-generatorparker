import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Nav from "../components/studio/Nav";
import PostCard from "../components/studio/PostCard";
import { getRecord, formatDisplayDate } from "../lib/posts";

export default function HistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const record = id ? getRecord(id) : null;

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Record not found.</p>
          <button
            onClick={() => navigate("/history")}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to history
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/history")}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="font-bold text-white tracking-tight">
              Veepo Content Studio
            </span>
          </div>
          <Nav />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">
            {formatDisplayDate(record.date)}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generated {new Date(record.generated_at).toLocaleString()} ·{" "}
            <span
              className={`font-medium ${
                record.status === "reviewed"
                  ? "text-emerald-400"
                  : record.status === "posted"
                  ? "text-blue-400"
                  : "text-slate-400"
              }`}
            >
              {record.status}
            </span>
          </p>
        </div>

        <div className="space-y-6">
          {record.posts.map((post, i) => (
            <PostCard
              key={i}
              record={record}
              post={post}
              index={i}
              isSelected={record.selected_option === i + 1}
              isDimmed={false}
              readOnly
            />
          ))}
        </div>
      </main>
    </div>
  );
}
