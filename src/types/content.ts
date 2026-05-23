export type Pillar = "PROOF" | "PAIN" | "EDUCATION" | "PROCESS" | "OFFER";

export interface PostOption {
  pillar: Pillar;
  niche: string;
  hook: string;
  quality_score?: number;
  quality_notes?: string;
  why_this_might_win?: string;
  quality_rubric?: {
    hook_strength: number;
    persona_specificity: number;
    sales_clarity: number;
    emotional_pull: number;
    platform_fit: number;
    anti_generic_score: number;
    cta_strength: number;
    believability_trust: number;
  };
  linkedin: {
    post: string;
    hashtags: string[];
    cta: string;
  };
  x: {
    format: "single" | "thread";
    post: string | string[];
  };
  visual?: {
    type: "screenshot" | "comparison" | "nano_banana_prompt" | "simple_text_overlay";
    concept: string;
    asset_needed: string;
    nano_banana_prompt: string;
    overlay_text: string;
    recommended_format: "LinkedIn image" | "X image" | "Instagram Reel" | "Story";
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
  selected_option: number;
  selected_quality_score: number | null;
  selected_hook: string;
  record_id: string;
}

export interface LearningInsights {
  total_selections: number;
  pillar_counts: Record<string, number>;
  niche_counts: Record<string, number>;
  most_selected_pillar: string | null;
  least_selected_pillar: string | null;
  most_selected_niche: string | null;
  average_selected_quality_score: number | null;
  best_hook_pattern: string | null;
}

export const PILLAR_STYLES: Record<Pillar, { bg: string; text: string; label: string }> = {
  PROOF:     { bg: "#166534", text: "#dcfce7", label: "PROOF" },
  PAIN:      { bg: "#991b1b", text: "#fee2e2", label: "PAIN" },
  EDUCATION: { bg: "#1e40af", text: "#dbeafe", label: "EDUCATION" },
  PROCESS:   { bg: "#6b21a8", text: "#f3e8ff", label: "PROCESS" },
  OFFER:     { bg: "#92400e", text: "#fef3c7", label: "OFFER" },
};
