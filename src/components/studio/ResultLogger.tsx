import { useState } from "react";
import { BarChart2, Check, Image } from "lucide-react";
import type { PostResult } from "../../types/content";

interface Props {
  onSave: (result: PostResult) => void;
  existing?: PostResult;
}

export default function ResultLogger({ onSave, existing }: Props) {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<PostResult["platform"]>(existing?.platform ?? "both");
  const [likes, setLikes] = useState(existing?.likes?.toString() ?? "");
  const [comments, setComments] = useState(existing?.comments?.toString() ?? "");
  const [shares, setShares] = useState(existing?.shares?.toString() ?? "");
  const [dms, setDMs] = useState(existing?.dms_received?.toString() ?? "");
  const [sales, setSales] = useState(existing?.sales_from_post?.toString() ?? "");
  const [visualCreated, setVisualCreated] = useState(existing?.visual_created ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saved, setSaved] = useState(!!existing);

  const handleSave = () => {
    const result: PostResult = {
      posted_at: existing?.posted_at ?? new Date().toISOString(),
      platform,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
      shares: Number(shares) || 0,
      dms_received: Number(dms) || 0,
      sales_from_post: Number(sales) || 0,
      visual_created: visualCreated,
      notes,
    };
    onSave(result);
    setSaved(true);
    setOpen(false);
  };

  if (saved && existing) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BarChart2 size={12} /> Results logged
          </p>
          <button
            onClick={() => { setSaved(false); setOpen(true); }}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: "Likes", val: existing.likes },
            { label: "Comments", val: existing.comments },
            { label: "Shares", val: existing.shares },
            { label: "DMs", val: existing.dms_received, highlight: true },
            { label: "Sales $", val: existing.sales_from_post, highlight: existing.sales_from_post > 0 },
          ].map(({ label, val, highlight }) => (
            <div key={label} className="text-center">
              <p className={`text-lg font-bold ${highlight ? "text-emerald-400" : "text-white"}`}>{val}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
          <div className="text-center">
            <p className={`text-lg font-bold ${existing.visual_created ? "text-blue-400" : "text-slate-600"}`}>
              {existing.visual_created ? "✓" : "✗"}
            </p>
            <p className="text-xs text-slate-500">Visual</p>
          </div>
        </div>
        {existing.notes && (
          <p className="mt-2 text-xs text-slate-500 italic">"{existing.notes}"</p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-slate-600 text-sm text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
      >
        <BarChart2 size={14} />
        Mark as posted + log results
      </button>
    );
  }

  const inputClass = "w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500";
  const numInputClass = `${inputClass} text-center`;

  return (
    <div className="rounded-xl border border-slate-600 bg-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white flex items-center gap-1.5">
          <BarChart2 size={14} className="text-blue-400" />
          Log post results
        </p>
        <button onClick={() => setOpen(false)} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
      </div>

      {/* Platform */}
      <div>
        <p className="text-xs text-slate-400 mb-1.5">Posted to</p>
        <div className="flex gap-2">
          {(["linkedin", "x", "both"] as PostResult["platform"][]).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                platform === p ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {p === "both" ? "Both" : p === "linkedin" ? "LinkedIn" : "X"}
            </button>
          ))}
        </div>
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Likes", val: likes, set: setLikes },
          { label: "Comments", val: comments, set: setComments },
          { label: "Shares", val: shares, set: setShares },
          { label: "DMs", val: dms, set: setDMs },
          { label: "Sales ($799 each)", val: sales, set: setSales },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <p className="text-xs text-slate-500 mb-1 text-center">{label}</p>
            <input
              type="number"
              min="0"
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder="0"
              className={numInputClass}
            />
          </div>
        ))}
      </div>

      {/* Visual created */}
      <button
        onClick={() => setVisualCreated(!visualCreated)}
        className={`flex items-center gap-2 text-sm px-3 py-2 rounded border transition-colors ${
          visualCreated
            ? "border-blue-600 bg-blue-950/40 text-blue-300"
            : "border-slate-600 text-slate-400 hover:border-slate-500"
        }`}
      >
        <Image size={13} />
        {visualCreated ? "Visual was created ✓" : "Did you create the visual?"}
      </button>

      {/* Notes */}
      <div>
        <p className="text-xs text-slate-400 mb-1">Notes (optional)</p>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Got 2 DMs asking about the $799, posted Tuesday 9am"
          className={inputClass}
        />
      </div>

      <button
        onClick={handleSave}
        className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors"
      >
        <Check size={14} />
        Save results
      </button>
    </div>
  );
}
