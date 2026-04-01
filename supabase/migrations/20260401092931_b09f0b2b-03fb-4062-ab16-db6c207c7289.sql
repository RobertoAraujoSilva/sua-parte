-- Make bucket private
UPDATE storage.buckets SET public = false WHERE id = 'programas';

-- Drop old permissive policies
DROP POLICY IF EXISTS "programas_read_public" ON storage.objects;
DROP POLICY IF EXISTS "programas_insert_auth" ON storage.objects;
DROP POLICY IF EXISTS "programas_update_auth" ON storage.objects;
DROP POLICY IF EXISTS "programas_delete_auth" ON storage.objects;

-- Read: authenticated users can read their own files (folder = user_id)
CREATE POLICY "programas_read_own" ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'programas' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Insert: authenticated users can upload to their own folder
CREATE POLICY "programas_insert_own" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'programas' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Update: authenticated users can update their own files
CREATE POLICY "programas_update_own" ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'programas' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Delete: authenticated users can delete their own files
CREATE POLICY "programas_delete_own" ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'programas' AND (storage.foldername(name))[1] = auth.uid()::text);