-- 1) connect_profiles: prevent self-approval at the policy level
CREATE OR REPLACE FUNCTION public.connect_profile_status_unchanged(_id uuid, _status text, _approved_by uuid, _approved_at timestamptz)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connect_profiles p
    WHERE p.id = _id
      AND p.status IS NOT DISTINCT FROM _status
      AND p.approved_by IS NOT DISTINCT FROM _approved_by
      AND p.approved_at IS NOT DISTINCT FROM _approved_at
  )
$$;

DROP POLICY IF EXISTS own_profile_update ON public.connect_profiles;
CREATE POLICY own_profile_update ON public.connect_profiles
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND (
    public.is_connect_moderator()
    OR public.connect_profile_status_unchanged(id, status, approved_by, approved_at)
  )
);

-- 2) family_members: explicit owner-only insert/delete, verified-email matching for invitees
CREATE OR REPLACE FUNCTION public.current_user_verified_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(u.email)
  FROM auth.users u
  WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL
$$;

DROP POLICY IF EXISTS "Users can manage own family members" ON public.family_members;
CREATE POLICY "Owners can view own family members" ON public.family_members
FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can insert own family members" ON public.family_members
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update own family members" ON public.family_members
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can delete own family members" ON public.family_members
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Invited family members can view linked family record" ON public.family_members;
CREATE POLICY "Invited family members can view linked family record" ON public.family_members
FOR SELECT TO authenticated
USING (
  public.current_user_verified_email() IS NOT NULL
  AND lower(COALESCE(email, '')) = public.current_user_verified_email()
);

DROP POLICY IF EXISTS "Invited family members can confirm invitation status" ON public.family_members;
CREATE POLICY "Invited family members can confirm invitation status" ON public.family_members
FOR UPDATE TO authenticated
USING (
  public.current_user_verified_email() IS NOT NULL
  AND lower(COALESCE(email, '')) = public.current_user_verified_email()
)
WITH CHECK (
  public.current_user_verified_email() IS NOT NULL
  AND lower(COALESCE(email, '')) = public.current_user_verified_email()
);

-- keep the invited-member guard trigger aligned with verified email
CREATE OR REPLACE FUNCTION public.guard_family_member_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  requester_email TEXT := coalesce(public.current_user_verified_email(), '');
  owner_match BOOLEAN := auth.uid() = OLD.user_id;
  invited_match BOOLEAN := requester_email <> '' AND requester_email = lower(coalesce(OLD.email, ''));
BEGIN
  IF owner_match THEN
    RETURN NEW;
  END IF;

  IF invited_match THEN
    IF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.user_id IS DISTINCT FROM OLD.user_id
      OR NEW.student_id IS DISTINCT FROM OLD.student_id
      OR NEW.email IS DISTINCT FROM OLD.email
      OR NEW.phone IS DISTINCT FROM OLD.phone
      OR NEW.name IS DISTINCT FROM OLD.name
      OR NEW.relation IS DISTINCT FROM OLD.relation
      OR NEW.gender IS DISTINCT FROM OLD.gender
    THEN
      RAISE EXCEPTION 'Invited family members can only confirm their invitation status';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Not authorized to update this family member';
END;
$function$;

-- 3) connect_reports: explicit moderator-only delete, everyone else denied
CREATE POLICY reports_moderator_delete ON public.connect_reports
FOR DELETE TO authenticated USING (public.is_connect_moderator());

-- 4) Lock down SECURITY DEFINER functions not meant to be called directly
REVOKE EXECUTE ON FUNCTION public.can_form_pair(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_receive_part(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.connect_create_match_on_mutual_like() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.connect_guard_profile_status() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_family_member_self_update() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_user_role_changes() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.connect_touch_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_student_duplicate(uuid, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_connect_moderator(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.connect_is_approved(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.connect_my_profile_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.connect_in_match(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.connect_profile_is_approved(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.connect_profile_status_unchanged(uuid, text, uuid, timestamptz) FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_user_verified_email() FROM anon;
GRANT EXECUTE ON FUNCTION public.connect_profile_status_unchanged(uuid, text, uuid, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_verified_email() TO authenticated;