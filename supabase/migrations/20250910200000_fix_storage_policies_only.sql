-- Storage RLS policies for 'programas' bucket
-- These policies assume the bucket already exists

-- Allow public read access to files in the 'programas' bucket
CREATE POLICY IF NOT EXISTS "programas_read_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'programas');

-- Allow authenticated users to upload files to the 'programas' bucket
CREATE POLICY IF NOT EXISTS "programas_insert_auth"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'programas' AND owner = auth.uid());

-- Allow owners to update their own files
CREATE POLICY IF NOT EXISTS "programas_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'programas' AND owner = auth.uid())
WITH CHECK (bucket_id = 'programas' AND owner = auth.uid());

-- Allow owners to delete their own files
CREATE POLICY IF NOT EXISTS "programas_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'programas' AND owner = auth.uid());

-- Grant necessary permissions
GRANT SELECT ON storage.objects TO public;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;