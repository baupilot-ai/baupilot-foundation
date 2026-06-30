
CREATE POLICY "Members read own company logo" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
  );

CREATE POLICY "Members upload own company logo" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
  );

CREATE POLICY "Members update own company logo" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
  );

CREATE POLICY "Members delete own company logo" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
  );
