
-- Insert admin role for parker@veepo.ca
INSERT INTO public.user_roles (user_id, role)
VALUES ('dee51bd2-8ad5-45f4-ac5f-b369bd2fc23b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create safety-net trigger function
CREATE OR REPLACE FUNCTION public.protect_owner_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.user_id = 'dee51bd2-8ad5-45f4-ac5f-b369bd2fc23b'
     AND OLD.role = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (OLD.user_id, OLD.role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN OLD;
END;
$$;

-- Create trigger on user_roles DELETE
CREATE TRIGGER protect_owner_admin_trigger
AFTER DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_owner_admin();
