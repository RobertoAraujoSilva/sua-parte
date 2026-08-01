REVOKE EXECUTE ON FUNCTION public.is_connect_moderator(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.connect_my_profile_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.connect_is_approved(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.connect_profile_is_approved(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.connect_in_match(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.connect_guard_profile_status() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.connect_create_match_on_mutual_like() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.connect_touch_updated_at() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_connect_moderator(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.connect_my_profile_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.connect_is_approved(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.connect_profile_is_approved(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.connect_in_match(uuid) TO authenticated, service_role;