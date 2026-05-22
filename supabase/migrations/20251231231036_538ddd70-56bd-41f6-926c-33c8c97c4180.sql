-- Create lookbook_looks table for editorial looks
CREATE TABLE public.lookbook_looks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  headline text NOT NULL,
  scripture_reference text,
  description text,
  image_url text NOT NULL,
  video_url text,
  gender text DEFAULT 'unisex',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create lookbook_look_products junction table
CREATE TABLE public.lookbook_look_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  look_id uuid REFERENCES public.lookbook_looks(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  position text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(look_id, product_id)
);

-- Create fit_guide_models table
CREATE TABLE public.fit_guide_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text NOT NULL,
  height_cm integer,
  height_imperial text,
  size_worn text NOT NULL,
  weight_kg integer,
  chest_cm integer,
  waist_cm integer,
  hip_cm integer,
  photo_url text NOT NULL,
  fit_notes text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.lookbook_looks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookbook_look_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fit_guide_models ENABLE ROW LEVEL SECURITY;

-- RLS policies for lookbook_looks
CREATE POLICY "Active looks are viewable by everyone"
ON public.lookbook_looks FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert looks"
ON public.lookbook_looks FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update looks"
ON public.lookbook_looks FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete looks"
ON public.lookbook_looks FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for lookbook_look_products
CREATE POLICY "Look products viewable with their looks"
ON public.lookbook_look_products FOR SELECT
USING (EXISTS (
  SELECT 1 FROM lookbook_looks
  WHERE lookbook_looks.id = lookbook_look_products.look_id
  AND (lookbook_looks.is_active = true OR has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Admins can insert look products"
ON public.lookbook_look_products FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update look products"
ON public.lookbook_look_products FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete look products"
ON public.lookbook_look_products FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for fit_guide_models
CREATE POLICY "Active models are viewable by everyone"
ON public.fit_guide_models FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert models"
ON public.fit_guide_models FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update models"
ON public.fit_guide_models FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete models"
ON public.fit_guide_models FOR DELETE
USING (has_role(auth.uid(), 'admin'));