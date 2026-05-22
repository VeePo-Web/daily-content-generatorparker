-- Create favorites table for wishlist functionality
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_product_id ON public.favorites(product_id);