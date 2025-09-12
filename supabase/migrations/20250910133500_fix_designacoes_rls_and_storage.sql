-- Ensure RLS on designacoes and add owner-based policies
ALTER TABLE public.designacoes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='designacoes' AND policyname='dz_select_own'
  ) THEN
    CREATE POLICY "dz_select_own"
      ON public.designacoes
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='designacoes' AND policyname='dz_insert_own'
  ) THEN
    CREATE POLICY "dz_insert_own"
      ON public.designacoes
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='designacoes' AND policyname='dz_update_own'
  ) THEN
    CREATE POLICY "dz_update_own"
      ON public.designacoes
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='designacoes' AND policyname='dz_delete_own'
  ) THEN
    CREATE POLICY "dz_delete_own"
      ON public.designacoes
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.designacoes TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Storage RLS policies for 'programas' bucket
-- These policies assume the bucket already exists
CREATE POLICY IF NOT EXISTS "programas_read_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'programas');

CREATE POLICY IF NOT EXISTS "programas_insert_auth"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'programas' AND owner = auth.uid());

CREATE POLICY IF NOT EXISTS "programas_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'programas' AND owner = auth.uid())
WITH CHECK (bucket_id = 'programas' AND owner = auth.uid());

CREATE POLICY IF NOT EXISTS "programas_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'programas' AND owner = auth.uid());