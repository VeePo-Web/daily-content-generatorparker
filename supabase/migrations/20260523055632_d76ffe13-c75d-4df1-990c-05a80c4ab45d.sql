
-- =====================================================
-- DAILY SALES POST ENGINE
-- =====================================================

-- Storage bucket for template screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-screenshots', 'template-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Public read on template-screenshots
CREATE POLICY "Template screenshots are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'template-screenshots');

CREATE POLICY "Admins can manage template screenshots"
ON storage.objects FOR ALL
USING (bucket_id = 'template-screenshots' AND public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- TEMPLATE PRODUCTS
-- =====================================================
CREATE TABLE public.template_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  vertical TEXT NOT NULL,
  price_one_time NUMERIC(10,2) NOT NULL DEFAULT 799.00,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 69.00,
  currency TEXT NOT NULL DEFAULT 'CAD',
  landing_url TEXT,
  one_liner TEXT,
  ideal_customer TEXT,
  poison_list TEXT,
  proof_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  weight INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.template_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage template_products"
ON public.template_products FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_template_products_updated_at
BEFORE UPDATE ON public.template_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TEMPLATE ASSETS (screenshot library)
-- =====================================================
CREATE TABLE public.template_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_product_id UUID REFERENCES public.template_products(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('screenshot','scene','portrait','gallery','case-study','mockup')),
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  caption TEXT,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  orientation TEXT NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape','portrait','square','mobile')),
  do_not_use BOOLEAN NOT NULL DEFAULT false,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_template_assets_product ON public.template_assets(template_product_id) WHERE do_not_use = false;
CREATE INDEX idx_template_assets_type ON public.template_assets(asset_type) WHERE do_not_use = false;
CREATE INDEX idx_template_assets_tags ON public.template_assets USING GIN(tags);

ALTER TABLE public.template_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage template_assets"
ON public.template_assets FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- POST THEMES (Hormozi hook bank)
-- =====================================================
CREATE TABLE public.post_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hook TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('pain','proof','status','urgency','myth-bust','transformation','offer')),
  template_product_id UUID REFERENCES public.template_products(id) ON DELETE SET NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.post_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage post_themes"
ON public.post_themes FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- GENERATED POSTS (daily 3-variant batch)
-- =====================================================
CREATE TABLE public.generated_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL,
  batch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  template_product_id UUID NOT NULL REFERENCES public.template_products(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES public.post_themes(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('x','instagram','linkedin')),
  copy TEXT NOT NULL,
  image_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  image_asset_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  is_winner BOOLEAN NOT NULL DEFAULT false,
  swap_token UUID NOT NULL DEFAULT gen_random_uuid(),
  score NUMERIC(6,2) NOT NULL DEFAULT 0,
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_generated_posts_batch ON public.generated_posts(batch_id);
CREATE INDEX idx_generated_posts_date ON public.generated_posts(batch_date DESC);
CREATE INDEX idx_generated_posts_winner ON public.generated_posts(batch_id) WHERE is_winner = true;
CREATE UNIQUE INDEX idx_generated_posts_swap_token ON public.generated_posts(swap_token);

ALTER TABLE public.generated_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage generated_posts"
ON public.generated_posts FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can SELECT by swap_token (used by swap-post-winner edge function via service role anyway, but allows preview pages)
CREATE POLICY "Public read by swap_token"
ON public.generated_posts FOR SELECT
USING (true);

-- =====================================================
-- POST SEND LOG
-- =====================================================
CREATE TABLE public.post_send_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL,
  winner_post_id UUID REFERENCES public.generated_posts(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed','swapped')),
  error TEXT,
  resend_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_send_log_batch ON public.post_send_log(batch_id);

ALTER TABLE public.post_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage post_send_log"
ON public.post_send_log FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
