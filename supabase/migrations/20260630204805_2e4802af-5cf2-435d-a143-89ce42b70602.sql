
CREATE POLICY "company members read documents bucket" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-documents' AND public.is_company_member((storage.foldername(name))[1]::uuid));
CREATE POLICY "company members upload documents bucket" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-documents' AND public.is_company_member((storage.foldername(name))[1]::uuid));
CREATE POLICY "company members delete documents bucket" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-documents' AND public.is_company_member((storage.foldername(name))[1]::uuid));

CREATE POLICY "company members read plans bucket" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-plans' AND public.is_company_member((storage.foldername(name))[1]::uuid));
CREATE POLICY "company members upload plans bucket" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-plans' AND public.is_company_member((storage.foldername(name))[1]::uuid));
CREATE POLICY "company members delete plans bucket" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-plans' AND public.is_company_member((storage.foldername(name))[1]::uuid));
