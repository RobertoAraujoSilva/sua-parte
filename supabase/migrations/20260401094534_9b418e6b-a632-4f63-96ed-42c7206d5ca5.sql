ALTER POLICY "Users can view own profile" ON public.profiles TO authenticated;
ALTER POLICY "Users can update own profile" ON public.profiles TO authenticated;
ALTER POLICY "Users can insert own profile" ON public.profiles TO authenticated;

ALTER POLICY "Users can view own congregacoes" ON public.congregacoes TO authenticated;
ALTER POLICY "Users can insert own congregacoes" ON public.congregacoes TO authenticated;
ALTER POLICY "Users can update own congregacoes" ON public.congregacoes TO authenticated;
ALTER POLICY "Users can delete own congregacoes" ON public.congregacoes TO authenticated;

ALTER POLICY "Users can view own estudantes" ON public.estudantes TO authenticated;
ALTER POLICY "Users can insert own estudantes" ON public.estudantes TO authenticated;
ALTER POLICY "Users can update own estudantes" ON public.estudantes TO authenticated;
ALTER POLICY "Users can delete own estudantes" ON public.estudantes TO authenticated;

ALTER POLICY "Users can view own programas" ON public.programas TO authenticated;
ALTER POLICY "Users can insert own programas" ON public.programas TO authenticated;
ALTER POLICY "Users can update own programas" ON public.programas TO authenticated;
ALTER POLICY "Users can delete own programas" ON public.programas TO authenticated;

ALTER POLICY "Users can view own designacoes" ON public.designacoes TO authenticated;
ALTER POLICY "Users can insert own designacoes" ON public.designacoes TO authenticated;
ALTER POLICY "Users can update own designacoes" ON public.designacoes TO authenticated;
ALTER POLICY "Users can delete own designacoes" ON public.designacoes TO authenticated;

ALTER POLICY "Users can view student progress for their students" ON public.student_progress TO authenticated;
ALTER POLICY "Users can manage student progress for their students" ON public.student_progress TO authenticated;

ALTER POLICY "Users can manage own meetings" ON public.meetings TO authenticated;
ALTER POLICY "Users can view meeting parts" ON public.meeting_parts TO authenticated;
ALTER POLICY "Users can manage own admin assignments" ON public.administrative_assignments TO authenticated;
ALTER POLICY "Users can manage own special events" ON public.special_events TO authenticated;
ALTER POLICY "Users can manage own rooms" ON public.rooms TO authenticated;
ALTER POLICY "Users can manage own family members" ON public.family_members TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_family_member_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_email TEXT := lower(coalesce(auth.jwt() ->> 'email', ''));
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
$$;

DROP TRIGGER IF EXISTS guard_family_member_self_update_trigger ON public.family_members;
CREATE TRIGGER guard_family_member_self_update_trigger
BEFORE UPDATE ON public.family_members
FOR EACH ROW
EXECUTE FUNCTION public.guard_family_member_self_update();

DROP POLICY IF EXISTS "Invited family members can view linked family record" ON public.family_members;
CREATE POLICY "Invited family members can view linked family record"
ON public.family_members
FOR SELECT
TO authenticated
USING (
  lower(coalesce(email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

DROP POLICY IF EXISTS "Invited family members can confirm invitation status" ON public.family_members;
CREATE POLICY "Invited family members can confirm invitation status"
ON public.family_members
FOR UPDATE
TO authenticated
USING (
  lower(coalesce(email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
WITH CHECK (
  lower(coalesce(email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

CREATE OR REPLACE FUNCTION public.guard_user_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_is_admin BOOLEAN := public.has_role(auth.uid(), 'admin');
BEGIN
  IF auth.uid() IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin' AND NOT requester_is_admin THEN
      RAISE EXCEPTION 'Only admins can assign the admin role';
    END IF;

    IF auth.uid() <> NEW.user_id AND NOT requester_is_admin THEN
      RAISE EXCEPTION 'Only admins can assign roles to other users';
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NOT requester_is_admin THEN
      RAISE EXCEPTION 'Only admins can update roles';
    END IF;

    IF OLD.user_id = auth.uid() AND OLD.role = 'admin' AND NEW.role <> OLD.role THEN
      RAISE EXCEPTION 'Admins cannot remove their own admin role';
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF NOT requester_is_admin THEN
      RAISE EXCEPTION 'Only admins can delete roles';
    END IF;

    IF OLD.user_id = auth.uid() AND OLD.role = 'admin' THEN
      RAISE EXCEPTION 'Admins cannot delete their own admin role';
    END IF;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS guard_user_role_changes_trigger ON public.user_roles;
CREATE TRIGGER guard_user_role_changes_trigger
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.guard_user_role_changes();