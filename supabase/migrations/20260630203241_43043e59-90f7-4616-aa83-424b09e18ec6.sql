
CREATE POLICY "defect_photos_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'defect-photos' AND (storage.foldername(name))[1] = get_user_company(auth.uid())::text);
CREATE POLICY "defect_photos_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'defect-photos' AND (storage.foldername(name))[1] = get_user_company(auth.uid())::text);
CREATE POLICY "defect_photos_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'defect-photos' AND (storage.foldername(name))[1] = get_user_company(auth.uid())::text);

CREATE POLICY "project_photos_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'project-photos' AND (storage.foldername(name))[1] = get_user_company(auth.uid())::text);
CREATE POLICY "project_photos_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-photos' AND (storage.foldername(name))[1] = get_user_company(auth.uid())::text);
CREATE POLICY "project_photos_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-photos' AND (storage.foldername(name))[1] = get_user_company(auth.uid())::text);
