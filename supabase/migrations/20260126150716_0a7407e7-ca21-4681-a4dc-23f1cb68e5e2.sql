-- Create bundle_discounts table for automatic bundle pricing
CREATE TABLE public.bundle_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL,           -- 'lookbook' | 'category' | 'collection'
  source_id UUID,                       -- Optional: specific look/category ID (null = all of type)
  min_items INTEGER NOT NULL DEFAULT 2,
  max_items INTEGER,
  discount_type TEXT NOT NULL DEFAULT 'percentage',  -- 'percentage' | 'fixed_per_item' | 'fixed_total'
  discount_value NUMERIC NOT NULL,      -- 10 for 10%, or cents for fixed
  stacks_with_codes BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,           -- Higher priority applied first
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bundle_discounts ENABLE ROW LEVEL SECURITY;

-- Anyone can read active bundle discounts for cart calculations
CREATE POLICY "Anyone can read active bundle discounts"
  ON public.bundle_discounts FOR SELECT
  USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (expires_at IS NULL OR expires_at > now()));

-- Admins can manage all bundle discounts
CREATE POLICY "Admins can manage bundle discounts"
  ON public.bundle_discounts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient lookups
CREATE INDEX idx_bundle_discounts_source ON public.bundle_discounts(source_type, is_active);
CREATE INDEX idx_bundle_discounts_active ON public.bundle_discounts(is_active, starts_at, expires_at);

-- Add updated_at trigger
CREATE TRIGGER update_bundle_discounts_updated_at
  BEFORE UPDATE ON public.bundle_discounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default lookbook bundle rules
INSERT INTO public.bundle_discounts (name, description, source_type, min_items, discount_type, discount_value, priority)
VALUES 
  ('Complete Look 10%', 'Get 10% off when you buy 2+ items from the same look', 'lookbook', 2, 'percentage', 10, 1),
  ('Full Outfit 15%', 'Get 15% off when you buy 4+ items from the same look', 'lookbook', 4, 'percentage', 15, 2);