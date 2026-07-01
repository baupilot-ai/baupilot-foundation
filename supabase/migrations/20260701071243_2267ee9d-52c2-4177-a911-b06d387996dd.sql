
CREATE POLICY "drf_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'daily-report-files' AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text);
CREATE POLICY "drf_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'daily-report-files' AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text);
CREATE POLICY "drf_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'daily-report-files' AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text);
CREATE POLICY "drf_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'daily-report-files' AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text);
