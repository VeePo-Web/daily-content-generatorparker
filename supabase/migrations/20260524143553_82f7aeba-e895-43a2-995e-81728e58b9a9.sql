
ALTER TABLE public.post_send_log ADD COLUMN IF NOT EXISTS platform text;
UPDATE public.post_send_log l SET platform = p.platform
  FROM public.generated_posts p
  WHERE p.id = l.winner_post_id AND l.platform IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS post_send_log_batch_platform_uidx
  ON public.post_send_log (batch_id, platform) WHERE platform IS NOT NULL;
