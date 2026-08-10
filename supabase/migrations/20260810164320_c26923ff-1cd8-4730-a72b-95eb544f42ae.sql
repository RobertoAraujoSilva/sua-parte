REVOKE EXECUTE ON FUNCTION public.guard_user_role_changes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.guard_family_member_self_update() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_receive_part(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_form_pair(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_student_duplicate(uuid, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.connect_profile_status_unchanged(uuid, text, uuid, timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.current_user_verified_email() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_student_duplicate(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.connect_profile_status_unchanged(uuid, text, uuid, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_verified_email() TO authenticated;