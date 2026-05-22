
-- Step 1: Drop dangerous "Service can..." policies
DROP POLICY IF EXISTS "Service can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Service can update orders" ON public.orders;
DROP POLICY IF EXISTS "Service can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Service can manage redemptions" ON public.discount_code_redemptions;
DROP POLICY IF EXISTS "Service role can update carts" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Anyone can select by recovery token" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Users can view their outfits" ON public.saved_outfits;

-- Step 2: Replace with scoped policies

-- abandoned_carts: admin-only SELECT
CREATE POLICY "Admins can view all carts"
ON public.abandoned_carts FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- saved_outfits: owner, anonymous, or shared
CREATE POLICY "Users can view own or shared outfits"
ON public.saved_outfits FOR SELECT
USING (
  user_id = auth.uid()
  OR user_id IS NULL
  OR share_id IS NOT NULL
);

-- discount_code_redemptions: admin-only
CREATE POLICY "Admins can manage redemptions"
ON public.discount_code_redemptions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
