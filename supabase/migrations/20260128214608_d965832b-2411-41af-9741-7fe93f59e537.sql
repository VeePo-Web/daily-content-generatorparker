-- Add flash_sale_ends_at column to products table for time-limited flash sales
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS flash_sale_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient querying of active flash sales
CREATE INDEX IF NOT EXISTS idx_products_flash_sale_ends_at 
ON public.products (flash_sale_ends_at) 
WHERE flash_sale_ends_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.products.flash_sale_ends_at IS 'End timestamp for flash sale countdown. NULL means no active flash sale.';