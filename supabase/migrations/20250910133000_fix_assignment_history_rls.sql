-- Fix RLS to allow writing audit rows when saving designações
-- Context: inserts into public.designacoes trigger writes to public.assignment_history.
-- Without INSERT policies on assignment_history, PostgREST returns 403 (row-level security).

-- 1) Ensure RLS is enabled
ALTER TABLE public.assignment_history ENABLE ROW LEVEL SECURITY;

-- 2) Drop old write policies if present (idempotent safety)
DROP POLICY IF EXISTS "Instructor can insert assignment history" ON public.assignment_history;
DROP POLICY IF EXISTS "Admin can insert assignment history" ON public.assignment_history;
DROP POLICY IF EXISTS "Enforce changed_by = auth.uid()" ON public.assignment_history;

-- 3) Allow instructors to insert history rows for their congregation's assignments
CREATE POLICY "Instructor can insert assignment history"
ON public.assignment_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.congregation_assignments ca
    JOIN public.congregation_instructors ci
      ON ci.congregation_id = ca.congregation_id
    WHERE ca.id = assignment_history.congregation_assignment_id
      AND ci.user_id = auth.uid()
      AND ci.status = 'active'
  )
);

-- 4) Allow admins to insert history rows
CREATE POLICY "Admin can insert assignment history"
ON public.assignment_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
  )
);

-- 5) Optional integrity guard: ensure changed_by matches the actor
-- If your trigger sets changed_by := auth.uid(), this keeps policy consistent.
CREATE POLICY "Enforce changed_by = auth.uid()"
ON public.assignment_history
FOR INSERT
WITH CHECK (changed_by = auth.uid());

-- 6) Grant DML to authenticated (RLS still applies)
GRANT INSERT ON public.assignment_history TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 7) Sanity report
DO $$
DECLARE
  n int;
BEGIN
  SELECT COUNT(*) INTO n
  FROM pg_policies
  WHERE schemaname='public' AND tablename='assignment_history';
  RAISE NOTICE 'assignment_history policies total: %', n;
END$$;

