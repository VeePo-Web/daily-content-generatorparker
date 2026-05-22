import { useState } from "react";
import { Download, Star, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ContentRecord, PostOption } from "../../types/content";
import { PILLAR_STYLES, type Pillar } from "../../types/content";
import {
  downloadTxt,
  buildLinkedinDownload,
  buildXDownload,
} from "../../lib/posts";

interface Props {
  record: ContentRecord;
  post: PostOption;
  index: number; // 0-based
  isSelected: boolean;
  isDimmed: boolean;
  readOnly?: boolean;
  onSelect?: (optionNumber: number) => void;
}

export default function PostCard({
  record,
  post,
  index,
  isSelected,
  isDimmed,
  readOnly = false,
  onSelect,
}: Props) {
  const [tab, setTab] = useState<"linkedin" | "x">("linkedin");
  const [expanded, setExpanded] = useState(false);

  const optionNumber = index + 1;
  const pillarStyle = PILLAR_STYLES[post.pillar as Pillar] ?? {
    bg: "#334155",
    text: "#94a3b8",
  };

  const xContent = Array.isArray(post.x.post)
    ? post.x.post.map((t, i) => `${i + 1}/${post.x.post.length} ${t}`).join("\n\n")
    : post.x.post;

  const activeContent = tab === "linkedin"
    ? `${post.linkedin.post}\n\n${post.linkedin.hashtags.map(h => `#${h.replace(/^#/, "")}`).join(" ")}`
    : xContent;

  const isLong = activeContent.length > 600;
  const previewContent = isLong && !expanded
    ? activeContent.slice(0, 600) + "..."
    : activeContent;

  const handleDownloadLinkedIn = () => {
    downloadTxt(
      `veepo-${record.date}-linkedin-option${optionNumber}.txt`,
      buildLinkedinDownload(record, index)
    );
  };

  const handleDownloadX = () => {
    downloadTxt(
      `veepo-${record.date}-x-option${optionNumber}.txt`,
      buildXDownload(record, index)
    );
  };

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-150"
      style={{
        borderColor: isSelected ? "#22c55e" : "#334155",
        backgroundColor: "#1e293b",
        opacity: isDimmed ? 0.5 : 1,
        boxShadow: isSelected ? "0 0 0 2px #22c55e" : "none",
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ backgroundColor: pillarStyle.bg }}
      >
        <span className="text-xs font-bold text-white/70">
          OPTION {optionNumber}
        </span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider"
          style={{ backgroundColor: "rgba(0,0,0,0.25)", color: pillarStyle.text }}
        >
          {post.pillar}
        </span>
        <span className="text-xs text-white/60 ml-auto">{post.niche}</span>
      </div>

      {/* Hook */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Hook →{" "}
        </span>
        <span className="text-sm text-slate-200 italic">"{post.hook}"</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setTab("linkedin")}
          className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            tab === "linkedin"
              ? "text-blue-400 border-b-2 border-blue-400 bg-slate-800/40"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          LinkedIn
        </button>
        <button
          onClick={() => setTab("x")}
          className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            tab === "x"
              ? "text-blue-400 border-b-2 border-blue-400 bg-slate-800/40"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          X · {post.x.format === "thread" ? "Thread" : "Single"}
        </button>
      </div>

      {/* Post content */}
      <div className="px-4 pt-4">
        <pre
          className="font-mono text-sm text-slate-200 whitespace-pre-wrap leading-relaxed"
          style={{ fontFamily: "'Inter', monospace" }}
        >
          {previewContent}
        </pre>

        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {expanded ? (
              <><ChevronUp size={12} /> Show less</>
            ) : (
              <><ChevronDown size={12} /> Show full post</>
            )}
          </button>
        )}

        {tab === "linkedin" && (
          <div className="mt-3 space-y-1">
            <div className="text-xs text-blue-400">
              {post.linkedin.hashtags.map(h => `#${h.replace(/^#/, "")}`).join(" ")}
            </div>
            <div className="text-xs font-semibold text-blue-300 bg-blue-950/40 px-3 py-1.5 rounded">
              📌 {post.linkedin.cta}
            </div>
            <p className="text-xs text-slate-500">
              Put veepo.ca/templates in the first comment — not the post body
            </p>
          </div>
        )}

        {tab === "x" && post.x.format === "thread" && Array.isArray(post.x.post) && (
          <p className="mt-2 text-xs text-slate-500">
            Put the link in your first reply to your own thread
          </p>
        )}

        {post.buffer_tip && (
          <div className="mt-3 bg-emerald-950/30 border border-emerald-900/40 rounded px-3 py-2">
            <span className="text-xs text-emerald-400">💡 {post.buffer_tip}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-4 mt-2">
        {!readOnly && (
          <button
            onClick={() => onSelect?.(optionNumber)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-semibold transition-colors ${
              isSelected
                ? "bg-emerald-600 text-white"
                : "bg-slate-700 text-slate-200 hover:bg-slate-600"
            }`}
          >
            {isSelected ? (
              <><Check size={14} /> Selected</>
            ) : (
              <><Star size={14} /> Select This One</>
            )}
          </button>
        )}

        <button
          onClick={handleDownloadLinkedIn}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <Download size={13} />
          LinkedIn
        </button>

        <button
          onClick={handleDownloadX}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <Download size={13} />
          X
        </button>
      </div>
    </div>
  );
}
