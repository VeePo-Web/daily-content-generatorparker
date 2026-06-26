DELETE FROM public.generated_posts WHERE batch_date = CURRENT_DATE AND case_study_id IS NOT NULL;
UPDATE public.case_studies SET last_used_at = NULL, use_count = 0 WHERE enabled = true;