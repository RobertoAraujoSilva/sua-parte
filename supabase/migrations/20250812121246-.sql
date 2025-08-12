-- Secure functions and drop insecure view
begin;

-- 1) Remove potentially permissive view
DROP VIEW IF EXISTS public.user_profiles;

-- 2) Harden functions with SECURITY DEFINER, STABLE, explicit search_path, and scoped privileges

-- get_current_user_profile: returns the current authenticated user's profile as JSONB
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  uid uuid := auth.uid();
  result jsonb;
BEGIN
  IF uid IS NULL THEN
    RETURN NULL; -- not logged in
  END IF;

  SELECT to_jsonb(p) INTO result
  FROM public.profiles p
  WHERE p.user_id = uid
  LIMIT 1;

  RETURN result;
END;
$$;

-- get_user_profile: only allows a user to fetch their own profile
CREATE OR REPLACE FUNCTION public.get_user_profile(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  result jsonb;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> target_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT to_jsonb(p) INTO result
  FROM public.profiles p
  WHERE p.user_id = target_user_id
  LIMIT 1;

  RETURN result;
END;
$$;

-- Optional debugging helper (keep locked down)
CREATE OR REPLACE FUNCTION public.debug_auth_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN jsonb_build_object(
    'uid', auth.uid(),
    'roles', current_setting('role', true),
    'now', now()
  );
END;
$$;

-- 3) Lock down privileges: remove PUBLIC and grant only to authenticated
REVOKE ALL ON FUNCTION public.get_current_user_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_profile(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.debug_auth_access() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;
-- Keep debug helper ungranted (optional) or grant to service_role only
-- GRANT EXECUTE ON FUNCTION public.debug_auth_access() TO service_role;

commit;