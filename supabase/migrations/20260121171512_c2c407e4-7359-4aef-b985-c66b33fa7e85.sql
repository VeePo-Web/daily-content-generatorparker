-- Create addresses table for user address management
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Address details
  label TEXT DEFAULT 'Home',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  
  -- Flags
  is_default_shipping BOOLEAN DEFAULT false,
  is_default_billing BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);

-- Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own addresses" ON public.addresses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own addresses" ON public.addresses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own addresses" ON public.addresses
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own addresses" ON public.addresses
  FOR DELETE USING (user_id = auth.uid());

-- Updated_at trigger
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();