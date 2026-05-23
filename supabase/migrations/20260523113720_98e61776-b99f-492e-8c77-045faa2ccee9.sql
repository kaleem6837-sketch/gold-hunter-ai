
-- user_roles: admin-only insert/delete/update
CREATE POLICY "admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- user_settings: own delete
CREATE POLICY "settings own delete" ON public.user_settings
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- watchlist: own update
CREATE POLICY "wl own update" ON public.watchlist
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- storage: charts bucket update + delete owner-only
CREATE POLICY "charts own update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'charts' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'charts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "charts own delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'charts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "charts own select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'charts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "charts own insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'charts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Lock down has_role: revoke public execute, keep for service role and internal use
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
