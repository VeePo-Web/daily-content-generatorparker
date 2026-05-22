-- Create discount_codes table
CREATE TABLE public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Code identification
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Discount configuration
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC NOT NULL,
  
  -- Usage constraints
  minimum_order_cents INTEGER DEFAULT 0,
  maximum_discount_cents INTEGER,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  
  -- Validity period
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create redemptions tracking table
CREATE TABLE public.discount_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID NOT NULL REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  customer_email TEXT NOT NULL,
  discount_applied_cents INTEGER NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX idx_discount_codes_active ON public.discount_codes(is_active, starts_at, expires_at);
CREATE INDEX idx_redemptions_email ON public.discount_code_redemptions(customer_email);
CREATE INDEX idx_redemptions_code ON public.discount_code_redemptions(discount_code_id);

-- Enable RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_code_redemptions ENABLE ROW LEVEL SECURITY;

-- discount_codes policies
CREATE POLICY "Anyone can read active codes for validation"
  ON public.discount_codes FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert codes"
  ON public.discount_codes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update codes"
  ON public.discount_codes FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete codes"
  ON public.discount_codes FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- discount_code_redemptions policies (service role access)
CREATE POLICY "Service can manage redemptions"
  ON public.discount_code_redemptions FOR ALL
  USING (true);

-- Updated at trigger
CREATE TRIGGER update_discount_codes_updated_at
  BEFORE UPDATE ON public.discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed test discount codes
INSERT INTO public.discount_codes (code, name, discount_type, discount_value, minimum_order_cents, is_active)
VALUES
  ('SAVE10', '10% Off Everything', 'percentage', 10, 0, true),
  ('WELCOME15', 'New Customer 15%', 'percentage', 15, 5000, true),
  ('FLAT20', '€20 Off Orders Over €100', 'fixed_amount', 2000, 10000, true),
  ('SUMMER2024', 'Summer Sale 25%', 'percentage', 25, 0, true);