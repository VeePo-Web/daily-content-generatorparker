-- Add apparel-specific columns to products table for PDP
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS fit_type text,
ADD COLUMN IF NOT EXISTS fabric_composition text,
ADD COLUMN IF NOT EXISTS weight_gsm integer,
ADD COLUMN IF NOT EXISTS model_info text,
ADD COLUMN IF NOT EXISTS ministry_statement text,
ADD COLUMN IF NOT EXISTS common_questions jsonb DEFAULT '[]'::jsonb;

-- Create product_ugc table for user-generated content / "Styled By The Tribe"
CREATE TABLE IF NOT EXISTS public.product_ugc (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  instagram_handle text,
  image_url text NOT NULL,
  caption text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on product_ugc
ALTER TABLE public.product_ugc ENABLE ROW LEVEL SECURITY;

-- UGC viewable when approved or by admins
CREATE POLICY "Approved UGC is viewable by everyone"
ON public.product_ugc
FOR SELECT
USING (is_approved = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage UGC
CREATE POLICY "Admins can insert UGC"
ON public.product_ugc
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update UGC"
ON public.product_ugc
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete UGC"
ON public.product_ugc
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for faster product lookups
CREATE INDEX IF NOT EXISTS idx_product_ugc_product_id ON public.product_ugc(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ugc_approved ON public.product_ugc(is_approved);