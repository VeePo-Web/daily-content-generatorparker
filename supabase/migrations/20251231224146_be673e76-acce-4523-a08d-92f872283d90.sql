-- Add new columns to reviews table for enhanced community features
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS story_type text DEFAULT 'product_review',
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS is_contactable boolean DEFAULT false;

-- Create community_stories table for full testimonials
CREATE TABLE public.community_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_photo_url text,
  customer_location text,
  gender text,
  headline text NOT NULL,
  story_text text NOT NULL,
  video_url text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  instagram_handle text,
  is_approved boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_contactable boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on community_stories
ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_stories

-- Anyone can view approved stories
CREATE POLICY "Approved stories are viewable by everyone"
ON public.community_stories
FOR SELECT
USING (is_approved = true OR has_role(auth.uid(), 'admin'::app_role));

-- Anyone can submit a story (will be pending approval)
CREATE POLICY "Anyone can submit a story"
ON public.community_stories
FOR INSERT
WITH CHECK (true);

-- Only admins can update stories
CREATE POLICY "Admins can update stories"
ON public.community_stories
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete stories
CREATE POLICY "Admins can delete stories"
ON public.community_stories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));