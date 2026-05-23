CREATE OR REPLACE FUNCTION public.prevent_premium_tier_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.premium_tier IS DISTINCT FROM OLD.premium_tier
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can change premium_tier';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_premium_tier ON public.user_settings;
CREATE TRIGGER guard_premium_tier
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.prevent_premium_tier_self_update();