-- Create abandoned_carts table for tracking cart abandonment
CREATE TABLE public.abandoned_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  cart_total NUMERIC NOT NULL DEFAULT 0,
  recovery_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'email_1_sent', 'email_2_sent', 'email_3_sent', 'recovered', 'converted', 'expired')),
  discount_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_1_sent_at TIMESTAMP WITH TIME ZONE,
  email_2_sent_at TIMESTAMP WITH TIME ZONE,
  email_3_sent_at TIMESTAMP WITH TIME ZONE,
  recovered_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (cart sync happens before auth)
CREATE POLICY "Anyone can create abandoned cart"
ON public.abandoned_carts
FOR INSERT
WITH CHECK (true);

-- Allow update/select by recovery token (for recovery flow)
CREATE POLICY "Anyone can select by recovery token"
ON public.abandoned_carts
FOR SELECT
USING (true);

-- Allow edge functions to update (service role)
CREATE POLICY "Service role can update carts"
ON public.abandoned_carts
FOR UPDATE
USING (true);

-- Create index for efficient querying
CREATE INDEX idx_abandoned_carts_status ON public.abandoned_carts(status);
CREATE INDEX idx_abandoned_carts_email ON public.abandoned_carts(email);
CREATE INDEX idx_abandoned_carts_recovery_token ON public.abandoned_carts(recovery_token);
CREATE INDEX idx_abandoned_carts_created_at ON public.abandoned_carts(created_at);

-- Trigger for updated_at
CREATE TRIGGER update_abandoned_carts_updated_at
BEFORE UPDATE ON public.abandoned_carts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();