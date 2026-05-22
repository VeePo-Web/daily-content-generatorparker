-- Create ambassador applications table
CREATE TABLE public.ambassador_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Personal info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT,
  
  -- Social media handles
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_handle TEXT,
  twitter_handle TEXT,
  
  -- Content details
  follower_count_range TEXT NOT NULL,
  content_types TEXT[] NOT NULL DEFAULT '{}',
  
  -- Essay questions
  why_represent TEXT NOT NULL,
  faith_in_content TEXT NOT NULL,
  
  -- Commitment
  content_frequency TEXT NOT NULL,
  
  -- Terms
  agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.ambassador_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "Anyone can submit ambassador application"
ON public.ambassador_applications
FOR INSERT
WITH CHECK (true);

-- Only admins can view applications
CREATE POLICY "Admins can view all applications"
ON public.ambassador_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update applications
CREATE POLICY "Admins can update applications"
ON public.ambassador_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete applications
CREATE POLICY "Admins can delete applications"
ON public.ambassador_applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));