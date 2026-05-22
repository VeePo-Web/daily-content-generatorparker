-- Add saved_from_cart flag and cart context columns to favorites table
ALTER TABLE public.favorites 
ADD COLUMN IF NOT EXISTS saved_from_cart BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cart_context JSONB DEFAULT '{}'::jsonb;

-- Index for fast saved-from-cart queries
CREATE INDEX IF NOT EXISTS idx_favorites_saved_from_cart 
ON public.favorites(user_id) 
WHERE saved_from_cart = true;

-- Add comments for documentation
COMMENT ON COLUMN public.favorites.saved_from_cart IS 'True if item was saved from cart removal flow';
COMMENT ON COLUMN public.favorites.cart_context IS 'Stores size, color, quantity from cart at save time';