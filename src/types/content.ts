export type Pillar = "PROOF" | "PAIN" | "EDUCATION" | "PROCESS" | "OFFER";

export interface PostOption {
  pillar: Pillar;
  niche: string;
  hook: string;
  linkedin: {
    post: string;
    hashtags: string[];
    cta: string;
  };
  x: {
    format: "single" | "thread";
    post: string | string[];
  };
  buffer_tip: string;
}

export interface ContentRecord {
  id: string;
  brand_id: string;
  date: string;
  generated_at: string;
  status: "emailed" | "reviewed" | "posted";
  selected_option: number | null;
  posts: PostOption[];
}

export interface SelectionHistory {
  date: string;
  selected_pillar: string;
  selected_niche: string;
  record_id: string;
}

export interface LearningInsights {
  total_selections: number;
  pillar_counts: Record<string, number>;
  niche_counts: Record<string, number>;
  most_selected_pillar: string | null;
  least_selected_pillar: string | null;
  most_selected_niche: string | null;
}

export const PILLAR_STYLES: Record<Pillar, { bg: string; text: string; label: string }> = {
  PROOF:     { bg: "#166534", text: "#dcfce7", label: "PROOF" },
  PAIN:      { bg: "#991b1b", text: "#fee2e2", label: "PAIN" },
  EDUCATION: { bg: "#1e40af", text: "#dbeafe", label: "EDUCATION" },
  PROCESS:   { bg: "#6b21a8", text: "#f3e8ff", label: "PROCESS" },
  OFFER:     { bg: "#92400e", text: "#fef3c7", label: "OFFER" },
};
