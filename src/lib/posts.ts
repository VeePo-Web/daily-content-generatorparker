// TODO: Replace localStorage-based reads with Supabase queries when migrating to cloud DB
// The data model is already Supabase-compatible

import type {
  ContentRecord,
  PostResult,
  SelectionHistory,
  LearningInsights,
  LearningSummary,
  Pillar,
} from "../types/content";

const RECORDS_KEY = "veepo_content_records";
const SELECTIONS_KEY = "veepo_selection_history";
const LEARNING_KEY = "veepo_learning_summary";

// ── Seeding ──────────────────────────────────────────────────────────────────

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
    // not accessible in this env — fine
  }
}

// ── Records ───────────────────────────────────────────────────────────────────

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

// ── Selection ─────────────────────────────────────────────────────────────────

export function updateSelection(id: string, option: number, record: ContentRecord): void {
  const all = getAllRecords();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return;

  all[idx] = { ...all[idx], selected_option: option, status: "reviewed" };
  localStorage.setItem(RECORDS_KEY, JSON.stringify(all));

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
  refreshLearningSummary();
}

// ── Result logging ────────────────────────────────────────────────────────────

export function logResult(id: string, result: PostResult): void {
  const all = getAllRecords();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return;

  all[idx] = { ...all[idx], result, status: "posted" };
  localStorage.setItem(RECORDS_KEY, JSON.stringify(all));

  // Back-fill result onto SelectionHistory entry for this record
  const selections = getSelectionHistory();
  const selIdx = selections.findIndex((s) => s.record_id === id);
  if (selIdx >= 0) {
    selections[selIdx] = { ...selections[selIdx], result };
    localStorage.setItem(SELECTIONS_KEY, JSON.stringify(selections));
  }

  refreshLearningSummary();
}

// ── Selection history ─────────────────────────────────────────────────────────

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

// ── Learning insights (UI display) ───────────────────────────────────────────

export function getLearningInsights(): LearningInsights {
  const history = getSelectionHistory();
  const total = history.length;

  const pillar_counts: Record<string, number> = {};
  const niche_counts: Record<string, number> = {};
  const hook_pattern_counts: Record<string, number> = {};
  const pillar_dms: Record<string, number[]> = {};
  let qualityTotal = 0;
  let qualityCount = 0;
  let totalDMs = 0;
  let postedCount = 0;
  let totalSales = 0;
  let visualCreated = 0;
  let visualTotal = 0;

  for (const s of history) {
    pillar_counts[s.selected_pillar] = (pillar_counts[s.selected_pillar] ?? 0) + 1;
    niche_counts[s.selected_niche] = (niche_counts[s.selected_niche] ?? 0) + 1;
    const pattern = classifyHookPattern(s.selected_hook ?? "");
    hook_pattern_counts[pattern] = (hook_pattern_counts[pattern] ?? 0) + 1;
    if (typeof s.selected_quality_score === "number") {
      qualityTotal += s.selected_quality_score;
      qualityCount += 1;
    }
    if (s.result) {
      postedCount += 1;
      totalDMs += s.result.dms_received;
      totalSales += s.result.sales_from_post;
      visualTotal += 1;
      if (s.result.visual_created) visualCreated += 1;
      if (!pillar_dms[s.selected_pillar]) pillar_dms[s.selected_pillar] = [];
      pillar_dms[s.selected_pillar].push(s.result.dms_received);
    }
  }

  const sortedPillars = Object.entries(pillar_counts).sort((a, b) => b[1] - a[1]);
  const sortedNiches = Object.entries(niche_counts).sort((a, b) => b[1] - a[1]);
  const sortedHookPatterns = Object.entries(hook_pattern_counts).sort((a, b) => b[1] - a[1]);

  // Best performing pillar = highest average DMs
  let best_performing_pillar: string | null = null;
  let bestAvgDMs = -1;
  for (const [pillar, dms] of Object.entries(pillar_dms)) {
    const avg = dms.reduce((a, b) => a + b, 0) / dms.length;
    if (avg > bestAvgDMs) { bestAvgDMs = avg; best_performing_pillar = pillar; }
  }

  return {
    total_selections: total,
    total_posted: postedCount,
    pillar_counts,
    niche_counts,
    most_selected_pillar: sortedPillars[0]?.[0] ?? null,
    least_selected_pillar: sortedPillars[sortedPillars.length - 1]?.[0] ?? null,
    most_selected_niche: sortedNiches[0]?.[0] ?? null,
    average_selected_quality_score: qualityCount > 0 ? Number((qualityTotal / qualityCount).toFixed(1)) : null,
    best_hook_pattern: sortedHookPatterns[0]?.[0] ?? null,
    best_performing_pillar,
    avg_dms_per_post: postedCount > 0 ? Number((totalDMs / postedCount).toFixed(1)) : null,
    total_sales_attributed: totalSales,
    visual_creation_rate: visualTotal > 0 ? Math.round((visualCreated / visualTotal) * 100) : null,
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

// ── Learning summary (feeds the Python generator) ─────────────────────────────

export function getLearningSummary(): LearningSummary | null {
  try {
    const raw = localStorage.getItem(LEARNING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function refreshLearningSummary(): void {
  const history = getSelectionHistory();
  if (history.length < 5) return; // not enough data yet

  const all = getAllRecords();
  const pillar_counts: Record<string, number> = {};
  const niche_counts: Record<string, number> = {};
  const hook_pattern_counts: Record<string, number> = {};

  for (const s of history) {
    pillar_counts[s.selected_pillar] = (pillar_counts[s.selected_pillar] ?? 0) + 1;
    niche_counts[s.selected_niche] = (niche_counts[s.selected_niche] ?? 0) + 1;
    const pattern = classifyHookPattern(s.selected_hook ?? "");
    hook_pattern_counts[pattern] = (hook_pattern_counts[pattern] ?? 0) + 1;
  }

  const total = history.length;
  const PILLARS: Pillar[] = ["PROOF", "PAIN", "EDUCATION", "PROCESS", "OFFER"];
  const pillar_bias: Record<string, number> = {};
  for (const p of PILLARS) {
    const count = pillar_counts[p] ?? 0;
    const expected = total / PILLARS.length;
    // Bias multiplier: selected 2x as often → bias 1.4 (log-dampened so it doesn't overfit)
    pillar_bias[p] = count === 0 ? 0.5 : Number(Math.min(2.0, Math.max(0.4, 1 + (count - expected) / expected * 0.5)).toFixed(2));
  }

  const sortedNiches = Object.entries(niche_counts).sort((a, b) => b[1] - a[1]);
  const top_niches = sortedNiches.slice(0, 3).map(([n]) => n);
  const avoid_niches = sortedNiches.slice(-2).filter(([, c]) => c === 1).map(([n]) => n);

  const sortedHookPatterns = Object.entries(hook_pattern_counts).sort((a, b) => b[1] - a[1]);

  // Recent hooks for dedup: last 21 days of records
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 21);
  const recentHooks: string[] = [];
  for (const r of all) {
    const d = new Date(r.date + "T12:00:00");
    if (d >= cutoff) {
      for (const p of r.posts) recentHooks.push(p.hook);
    }
  }

  const summary: LearningSummary = {
    generated_at: new Date().toISOString(),
    total_selections: total,
    pillar_bias,
    top_niches,
    avoid_niches,
    best_hook_pattern: sortedHookPatterns[0]?.[0] ?? null,
    avoid_hooks_containing: recentHooks.slice(0, 30).map((h) => h.slice(0, 60)),
    recent_hooks: recentHooks,
  };

  localStorage.setItem(LEARNING_KEY, JSON.stringify(summary));

  // Also write to public/data/learning_summary.json so Python can read it
  // (This only works in local dev — Vercel is read-only)
  try {
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "learning_summary.json";
    // Don't auto-click — we store it and let Settings page offer an explicit export
    URL.revokeObjectURL(url);
  } catch {
    // silent
  }
}

export function exportLearningSummary(): void {
  const summary = getLearningSummary();
  if (!summary) return;
  downloadTxt("learning_summary.json", JSON.stringify(summary, null, 2));
}

// ── Downloads ─────────────────────────────────────────────────────────────────

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
    `Visual brief — ${record.date} — Option ${optionIndex + 1}`,
    "",
    `Pillar: ${post.pillar}  |  Niche: ${post.niche}`,
    `Format: ${visual.recommended_format}  |  Type: ${visual.type}`,
    "",
    "CONCEPT:",
    visual.concept,
    "",
    "ASSET NEEDED:",
    visual.asset_needed,
    "",
    "OVERLAY TEXT:",
    visual.overlay_text,
    "",
    "NANO BANANA PROMPT:",
    visual.nano_banana_prompt,
  ].join("\n");
}

// ── Formatting helpers ────────────────────────────────────────────────────────

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
