
-- Pause all current daily/tracking cron jobs (non-destructive: just unschedule)
SELECT cron.unschedule('generate-daily-posts');
SELECT cron.unschedule('send-daily-post-email');
SELECT cron.unschedule('daily-photographer-generate');
SELECT cron.unschedule('daily-photographer-send');
SELECT cron.unschedule('daily-portfolio-generate');
SELECT cron.unschedule('daily-portfolio-send');
SELECT cron.unschedule('track-post-performance-daily');
SELECT cron.unschedule('scan-social-trends-weekly');

-- New case_studies table
CREATE TABLE public.case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  vertical text,
  website_url text NOT NULL,
  quote text,
  quote_attribution text,
  headline_outcome text,
  enabled boolean NOT NULL DEFAULT true,
  use_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.case_studies TO authenticated;
GRANT ALL ON public.case_studies TO service_role;

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage case studies" ON public.case_studies
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_case_studies_updated_at
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Track which case study a generated post belongs to (nullable; old rows untouched)
ALTER TABLE public.generated_posts
  ADD COLUMN IF NOT EXISTS case_study_id uuid REFERENCES public.case_studies(id) ON DELETE SET NULL;
