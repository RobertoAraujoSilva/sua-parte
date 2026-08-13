-- 1. student_progress: explicit per-command owner-scoped policies with WITH CHECK
DROP POLICY IF EXISTS "Users can manage student progress for their students" ON public.student_progress;

CREATE POLICY "Users can insert progress for their students"
ON public.student_progress FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.estudantes e WHERE e.id = student_progress.student_id AND e.user_id = auth.uid()));

CREATE POLICY "Users can update progress for their students"
ON public.student_progress FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.estudantes e WHERE e.id = student_progress.student_id AND e.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.estudantes e WHERE e.id = student_progress.student_id AND e.user_id = auth.uid()));

CREATE POLICY "Users can delete progress for their students"
ON public.student_progress FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.estudantes e WHERE e.id = student_progress.student_id AND e.user_id = auth.uid()));

-- 2. family_members: invited-email access only when the email is unambiguous
CREATE OR REPLACE FUNCTION public.family_member_email_is_unique(_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT _email IS NOT NULL
     AND (SELECT count(DISTINCT fm.user_id) FROM public.family_members fm
          WHERE lower(coalesce(fm.email, '')) = _email) = 1
     AND (SELECT count(*) FROM public.family_members fm
          WHERE lower(coalesce(fm.email, '')) = _email) = 1
$$;

REVOKE ALL ON FUNCTION public.family_member_email_is_unique(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.family_member_email_is_unique(text) TO authenticated;

DROP POLICY IF EXISTS "Invited family members can view linked family record" ON public.family_members;
CREATE POLICY "Invited family members can view linked family record"
ON public.family_members FOR SELECT TO authenticated
USING (
  public.current_user_verified_email() IS NOT NULL
  AND lower(coalesce(email, '')) = public.current_user_verified_email()
  AND public.family_member_email_is_unique(public.current_user_verified_email())
);

DROP POLICY IF EXISTS "Invited family members can confirm invitation status" ON public.family_members;
CREATE POLICY "Invited family members can confirm invitation status"
ON public.family_members FOR UPDATE TO authenticated
USING (
  public.current_user_verified_email() IS NOT NULL
  AND lower(coalesce(email, '')) = public.current_user_verified_email()
  AND public.family_member_email_is_unique(public.current_user_verified_email())
)
WITH CHECK (
  public.current_user_verified_email() IS NOT NULL
  AND lower(coalesce(email, '')) = public.current_user_verified_email()
  AND public.family_member_email_is_unique(public.current_user_verified_email())
);

-- 3. check_student_duplicate: ignore client-supplied user id, always scope to caller
CREATE OR REPLACE FUNCTION public.check_student_duplicate(p_user_id uuid, p_nome text, p_email text, p_telefone text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.estudantes e
    WHERE e.user_id = auth.uid()
      AND (
        (p_nome IS NOT NULL AND e.nome ILIKE p_nome)
        OR (p_email IS NOT NULL AND e.email = p_email)
        OR (p_telefone IS NOT NULL AND e.telefone = p_telefone)
      )
  );
$$;

REVOKE ALL ON FUNCTION public.check_student_duplicate(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_student_duplicate(uuid, text, text, text) TO authenticated;