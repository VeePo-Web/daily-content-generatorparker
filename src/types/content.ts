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

export interface PostResult {
  posted_at: string;        // ISO datetime when Parker actually posted
  platform: "linkedin" | "x" | "both";
  likes: number;
  comments: number;
  shares: number;
  dms_received: number;
  sales_from_post: number;  // direct revenue Parker attributes to this post
  notes: string;
  visual_created: boolean;
}

export interface ContentRecord {
  id: string;
  brand_id: string;
  date: string;
  generated_at: string;
  status: "emailed" | "reviewed" | "posted";
  selected_option: number | null;
  posts: PostOption[];
  result?: PostResult;       // filled in after Parker posts and logs results
}

export interface SelectionHistory {
  date: string;
  selected_pillar: string;
  selected_niche: string;
  selected_option: number;
  selected_quality_score: number | null;
  selected_hook: string;
  record_id: string;
  result?: PostResult;       // joined in when result is logged
}

export interface LearningInsights {
  total_selections: number;
  total_posted: number;
  pillar_counts: Record<string, number>;
  niche_counts: Record<string, number>;
  most_selected_pillar: string | null;
  least_selected_pillar: string | null;
  most_selected_niche: string | null;
  average_selected_quality_score: number | null;
  best_hook_pattern: string | null;
  // Result-based insights (only when Parker has logged results)
  best_performing_pillar: string | null;   // most DMs
  avg_dms_per_post: number | null;
  total_sales_attributed: number;
  visual_creation_rate: number | null;     // % of selected posts where visual was made
}

export interface LearningSummary {
  generated_at: string;
  total_selections: number;
  pillar_bias: Record<string, number>;      // multiplier per pillar (1.0 = no bias)
  top_niches: string[];
  avoid_niches: string[];
  best_hook_pattern: string | null;
  avoid_hooks_containing: string[];         // hook fragments to avoid repeating
  recent_hooks: string[];                   // last 21 days — for dedup
}

export const PILLAR_STYLES: Record<Pillar, { bg: string; text: string; label: string }> = {
  PROOF:     { bg: "#166534", text: "#dcfce7", label: "PROOF" },
  PAIN:      { bg: "#991b1b", text: "#fee2e2", label: "PAIN" },
  EDUCATION: { bg: "#1e40af", text: "#dbeafe", label: "EDUCATION" },
  PROCESS:   { bg: "#6b21a8", text: "#f3e8ff", label: "PROCESS" },
  OFFER:     { bg: "#92400e", text: "#fef3c7", label: "OFFER" },
};
