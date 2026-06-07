
-- Social accounts (one LinkedIn + one X profile)
CREATE TABLE public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('linkedin','x')),
  profile_url TEXT NOT NULL,
  handle TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (platform)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_accounts TO authenticated;
GRANT SELECT ON public.social_accounts TO anon;
GRANT ALL ON public.social_accounts TO service_role;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_accounts read all" ON public.social_accounts FOR SELECT USING (true);
CREATE POLICY "social_accounts write authenticated" ON public.social_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_social_accounts_updated BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Performance snapshots
CREATE TABLE public.post_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_post_id UUID NOT NULL REFERENCES public.generated_posts(id) ON DELETE CASCADE,
  post_url TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  day_offset INT,
  impressions INT,
  likes INT,
  comments INT,
  shares INT,
  engagement_rate NUMERIC,
  source TEXT NOT NULL DEFAULT 'scrape' CHECK (source IN ('scrape','manual')),
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_performance TO authenticated;
GRANT SELECT ON public.post_performance TO anon;
GRANT ALL ON public.post_performance TO service_role;
ALTER TABLE public.post_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perf read all" ON public.post_performance FOR SELECT USING (true);
CREATE POLICY "perf write authenticated" ON public.post_performance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_perf_post ON public.post_performance(generated_post_id, captured_at DESC);

-- Trends scanned from the wider web
CREATE TABLE public.social_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin','x','both')),
  niche TEXT,
  hook_pattern TEXT NOT NULL,
  example_copy TEXT,
  source_url TEXT,
  est_engagement INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_trends TO authenticated;
GRANT SELECT ON public.social_trends TO anon;
GRANT ALL ON public.social_trends TO service_role;
ALTER TABLE public.social_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trends read all" ON public.social_trends FOR SELECT USING (true);
CREATE POLICY "trends write authenticated" ON public.social_trends FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_trends_week ON public.social_trends(week_of DESC);

-- Extend generated_posts
ALTER TABLE public.generated_posts
  ADD COLUMN IF NOT EXISTS live_post_url TEXT,
  ADD COLUMN IF NOT EXISTS matched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS latest_impressions INT,
  ADD COLUMN IF NOT EXISTS latest_likes INT,
  ADD COLUMN IF NOT EXISTS latest_comments INT,
  ADD COLUMN IF NOT EXISTS latest_shares INT,
  ADD COLUMN IF NOT EXISTS latest_engagement_rate NUMERIC,
  ADD COLUMN IF NOT EXISTS last_tracked_at TIMESTAMPTZ;

-- Extend post_themes
ALTER TABLE public.post_themes
  ADD COLUMN IF NOT EXISTS avg_engagement_rate NUMERIC,
  ADD COLUMN IF NOT EXISTS performance_sample_size INT DEFAULT 0;
