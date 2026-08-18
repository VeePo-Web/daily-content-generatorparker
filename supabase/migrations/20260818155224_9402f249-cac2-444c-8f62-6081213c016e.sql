CREATE TABLE public.cochrane_angles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  angle text NOT NULL,
  category text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  use_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cochrane_angles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cochrane_angles TO authenticated;
GRANT ALL ON public.cochrane_angles TO service_role;

ALTER TABLE public.cochrane_angles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cochrane angles"
  ON public.cochrane_angles FOR SELECT
  USING (true);

CREATE POLICY "Admins manage cochrane angles"
  ON public.cochrane_angles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_cochrane_angles_updated_at
  BEFORE UPDATE ON public.cochrane_angles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();