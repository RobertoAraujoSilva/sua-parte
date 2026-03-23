
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('programas', 'programas', true, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "programas_read_public" ON storage.objects FOR SELECT TO public USING (bucket_id = 'programas');
CREATE POLICY "programas_insert_auth" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'programas');
CREATE POLICY "programas_update_auth" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'programas');
CREATE POLICY "programas_delete_auth" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'programas');
