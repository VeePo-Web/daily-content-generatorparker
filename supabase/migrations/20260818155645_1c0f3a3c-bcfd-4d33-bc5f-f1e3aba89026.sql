ALTER TABLE public.generated_posts DROP CONSTRAINT IF EXISTS generated_posts_platform_check;
ALTER TABLE public.generated_posts ADD CONSTRAINT generated_posts_platform_check
  CHECK (platform IN ('x', 'linkedin', 'instagram', 'facebook'));