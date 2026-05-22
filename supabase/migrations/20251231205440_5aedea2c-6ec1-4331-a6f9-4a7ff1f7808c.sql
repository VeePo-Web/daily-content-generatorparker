-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'homepage',
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view subscribers
CREATE POLICY "Admins can view subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete subscribers
CREATE POLICY "Admins can delete subscribers" 
ON public.newsletter_subscribers 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_location TEXT,
  customer_avatar_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can view approved reviews
CREATE POLICY "Anyone can view approved reviews" 
ON public.reviews 
FOR SELECT 
USING (is_approved = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert reviews
CREATE POLICY "Admins can insert reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update reviews
CREATE POLICY "Admins can update reviews" 
ON public.reviews 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete reviews
CREATE POLICY "Admins can delete reviews" 
ON public.reviews 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));