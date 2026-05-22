-- Track which products are good for threshold upsells (accessories, hats, etc.)
CREATE TABLE public.threshold_upsell_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  priority integer DEFAULT 0,  -- Higher = shown first
  min_threshold_gap numeric,   -- Show when gap is >= this (e.g., €5)
  max_threshold_gap numeric,   -- Show when gap is <= this (e.g., €100)
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id)
);

-- Index for efficient querying by active status and priority
CREATE INDEX idx_threshold_upsell_active ON public.threshold_upsell_products (is_active, priority DESC);

-- Enable Row Level Security
ALTER TABLE public.threshold_upsell_products ENABLE ROW LEVEL SECURITY;

-- Anyone can view active threshold upsell products
CREATE POLICY "Anyone can view active threshold upsells" 
ON public.threshold_upsell_products 
FOR SELECT 
USING (is_active = true);

-- Admins can manage threshold upsells
CREATE POLICY "Admins can manage threshold upsells" 
ON public.threshold_upsell_products 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));