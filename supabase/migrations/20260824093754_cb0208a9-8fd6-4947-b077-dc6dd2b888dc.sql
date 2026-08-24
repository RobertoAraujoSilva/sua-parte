CREATE OR REPLACE FUNCTION public.check_student_duplicate(p_user_id uuid, p_nome text, p_email text, p_telefone text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.estudantes e
    WHERE e.user_id = auth.uid()
      AND (
        (p_nome IS NOT NULL AND e.nome = p_nome)
        OR (p_email IS NOT NULL AND e.email = p_email)
        OR (p_telefone IS NOT NULL AND e.telefone = p_telefone)
      )
  );
$$;

REVOKE ALL ON FUNCTION public.check_student_duplicate(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_student_duplicate(uuid, text, text, text) TO authenticated;