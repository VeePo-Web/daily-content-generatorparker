-- Behavioral signals table for tracking high-intent actions
CREATE TABLE public.user_behavior_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  view_count INTEGER DEFAULT 1,
  total_time_ms INTEGER DEFAULT 0,
  zoom_count INTEGER DEFAULT 0,
  add_remove_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id)
);

-- Create index for efficient lookups
CREATE INDEX idx_behavior_signals_user ON public.user_behavior_signals(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_behavior_signals_session ON public.user_behavior_signals(session_id);
CREATE INDEX idx_behavior_signals_product ON public.user_behavior_signals(product_id);

-- Enable RLS
ALTER TABLE public.user_behavior_signals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own behavior signals"
ON public.user_behavior_signals FOR SELECT
USING (user_id = auth.uid() OR session_id IS NOT NULL);

CREATE POLICY "Users can insert their own behavior signals"
ON public.user_behavior_signals FOR INSERT
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own behavior signals"
ON public.user_behavior_signals FOR UPDATE
USING (user_id = auth.uid() OR (user_id IS NULL AND session_id IS NOT NULL));

CREATE POLICY "Users can delete their own behavior signals"
ON public.user_behavior_signals FOR DELETE
USING (user_id = auth.uid());