// TODO: Replace localStorage-based reads with Supabase queries when migrating to cloud DB
// The data model is already Supabase-compatible

import type { ContentRecord, SelectionHistory, LearningInsights, Pillar } from "../types/content";

const RECORDS_KEY = "veepo_content_records";
const SELECTIONS_KEY = "veepo_selection_history";

// Seed from the static posts.json at startup if localStorage is empty
export async function seedFromStaticFile(): Promise<void> {
  try {
    const existing = localStorage.getItem(RECORDS_KEY);
    if (existing) return;
    const res = await fetch("/data/posts.json");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(data));
    }
  } catch {
    // File not accessible in this env — that's fine
  }
}

export function getAllRecords(): ContentRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getTodayRecord(): ContentRecord | null {
  const today = new Date().toISOString().split("T")[0];
  return getAllRecords().find((r) => r.date === today) ?? null;
}

export function getRecord(id: string): ContentRecord | null {
  return getAllRecords().find((r) => r.id === id) ?? null;
}

export function updateSelection(id: string, option: number, record: ContentRecord): void {
  const all = getAllRecords();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return;

  const updated = {
    ...all[idx],
    selected_option: option,
    status: "reviewed" as const,
  };
  all[idx] = updated;
  localStorage.setItem(RECORDS_KEY, JSON.stringify(all));

  // Append to SelectionHistory
  const post = record.posts[option - 1];
  if (!post) return;
  const selections = getSelectionHistory();
  selections.push({
    date: record.date,
    selected_pillar: post.pillar,
    selected_niche: post.niche,
    selected_option: option,
    selected_quality_score: post.quality_score ?? null,
    selected_hook: post.hook,
    record_id: id,
  });
  localStorage.setItem(SELECTIONS_KEY, JSON.stringify(selections));
}

export function getSelectionHistory(): SelectionHistory[] {
  try {
    const raw = localStorage.getItem(SELECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLearningInsights(): LearningInsights {
  const history = getSelectionHistory();
  const total = history.length;

  const pillar_counts: Record<string, number> = {};
  const niche_counts: Record<string, number> = {};
  const hook_pattern_counts: Record<string, number> = {};
  let qualityTotal = 0;
  let qualityCount = 0;

  for (const s of history) {
    pillar_counts[s.selected_pillar] = (pillar_counts[s.selected_pillar] ?? 0) + 1;
    niche_counts[s.selected_niche] = (niche_counts[s.selected_niche] ?? 0) + 1;
    const pattern = classifyHookPattern(s.selected_hook ?? "");
    hook_pattern_counts[pattern] = (hook_pattern_counts[pattern] ?? 0) + 1;
    if (typeof s.selected_quality_score === "number") {
      qualityTotal += s.selected_quality_score;
      qualityCount += 1;
    }
  }

  const sortedPillars = Object.entries(pillar_counts).sort((a, b) => b[1] - a[1]);
  const sortedNiches = Object.entries(niche_counts).sort((a, b) => b[1] - a[1]);
  const sortedHookPatterns = Object.entries(hook_pattern_counts).sort((a, b) => b[1] - a[1]);

  return {
    total_selections: total,
    pillar_counts,
    niche_counts,
    most_selected_pillar: sortedPillars[0]?.[0] ?? null,
    least_selected_pillar: sortedPillars[sortedPillars.length - 1]?.[0] ?? null,
    most_selected_niche: sortedNiches[0]?.[0] ?? null,
    average_selected_quality_score: qualityCount > 0 ? Number((qualityTotal / qualityCount).toFixed(1)) : null,
    best_hook_pattern: sortedHookPatterns[0]?.[0] ?? null,
  };
}

function classifyHookPattern(hook: string): string {
  const lower = hook.toLowerCase();
  if (lower.includes("$") || lower.includes("cost") || lower.includes("booking")) return "money gap";
  if (lower.includes("instagram") || lower.includes("website") || lower.includes("portfolio")) return "presentation gap";
  if (lower.includes("client") || lower.includes("asked") || lower.includes("email")) return "client moment";
  if (lower.includes("premium") || lower.includes("ready") || lower.includes("look")) return "identity shift";
  return "uncomfortable truth";
}

// Download helper
export function downloadTxt(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildLinkedinDownload(record: ContentRecord, optionIndex: number): string {
  const post = record.posts[optionIndex];
  if (!post) return "";
  const hashtags = post.linkedin.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ");
  return `${post.linkedin.post}\n\n${hashtags}\n\n${post.linkedin.cta}`;
}

export function buildXDownload(record: ContentRecord, optionIndex: number): string {
  const post = record.posts[optionIndex];
  if (!post) return "";
  const { format, post: xPost } = post.x;
  if (format === "thread" && Array.isArray(xPost)) {
    return xPost.map((tweet, i) => `${i + 1}/${xPost.length} ${tweet}`).join("\n\n");
  }
  return typeof xPost === "string" ? xPost : xPost.join("\n\n");
}

export function buildVisualDownload(record: ContentRecord, optionIndex: number): string {
  const post = record.posts[optionIndex];
  const visual = post?.visual;
  if (!post || !visual) return "";
  return [
    `Visual prompt for ${record.date} - Option ${optionIndex + 1}`,
    "",
    `Pillar: ${post.pillar}`,
    `Niche: ${post.niche}`,
    `Type: ${visual.type}`,
    `Recommended format: ${visual.recommended_format}`,
    "",
    "Concept:",
    visual.concept,
    "",
    "Asset needed:",
    visual.asset_needed,
    "",
    "Overlay text:",
    visual.overlay_text,
    "",
    "Nano Banana prompt:",
    visual.nano_banana_prompt,
  ].join("\n");
}

export function pct(count: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((count / total) * 100)}%`;
}

export function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split("T")[0];
}

// Save a new record (used if you ever generate from the UI)
export function saveRecord(record: ContentRecord): void {
  const all = getAllRecords();
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.unshift(record);
  }
  localStorage.setItem(RECORDS_KEY, JSON.stringify(all));
}
