CREATE POLICY "connect_photos_own_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'connect-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "connect_photos_own_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'connect-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'connect-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "connect_photos_own_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'connect-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "connect_photos_own_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'connect-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "connect_photos_approved_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'connect-photos'
    AND public.connect_is_approved()
    AND EXISTS (
      SELECT 1 FROM public.connect_photos ph
      JOIN public.connect_profiles p ON p.id = ph.profile_id
      WHERE ph.storage_path = storage.objects.name
        AND ph.moderation_status = 'approved'
        AND p.status = 'approved'
    )
  );

CREATE POLICY "connect_photos_moderator_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'connect-photos' AND public.is_connect_moderator());