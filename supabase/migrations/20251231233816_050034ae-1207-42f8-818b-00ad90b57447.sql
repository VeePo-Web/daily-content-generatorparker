-- Create table for 3D avatar models
CREATE TABLE public.try_on_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  body_type TEXT NOT NULL DEFAULT 'average',
  model_url TEXT NOT NULL,
  thumbnail_url TEXT,
  height_cm INTEGER DEFAULT 175,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for 3D product models
CREATE TABLE public.product_3d_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('head', 'top', 'outerwear', 'bottom', 'footwear')),
  model_url TEXT NOT NULL,
  texture_variants JSONB DEFAULT '{}',
  fit_adjustment JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for saved outfits
CREATE TABLE public.saved_outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  avatar_gender TEXT NOT NULL,
  avatar_body_type TEXT NOT NULL,
  equipped_items JSONB NOT NULL DEFAULT '{}',
  screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.try_on_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_3d_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;

-- Avatars are viewable by everyone
CREATE POLICY "Avatars are viewable by everyone" 
ON public.try_on_avatars 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage avatars
CREATE POLICY "Admins can manage avatars" 
ON public.try_on_avatars 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3D models are viewable by everyone
CREATE POLICY "3D models are viewable by everyone" 
ON public.product_3d_models 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage 3D models
CREATE POLICY "Admins can manage 3D models" 
ON public.product_3d_models 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can save outfits
CREATE POLICY "Anyone can save outfits" 
ON public.saved_outfits 
FOR INSERT 
WITH CHECK (true);

-- Users can view their own saved outfits
CREATE POLICY "Users can view their outfits" 
ON public.saved_outfits 
FOR SELECT 
USING (true);

-- Create indexes
CREATE INDEX idx_try_on_avatars_gender ON public.try_on_avatars(gender);
CREATE INDEX idx_product_3d_models_product ON public.product_3d_models(product_id);
CREATE INDEX idx_product_3d_models_slot ON public.product_3d_models(slot_type);