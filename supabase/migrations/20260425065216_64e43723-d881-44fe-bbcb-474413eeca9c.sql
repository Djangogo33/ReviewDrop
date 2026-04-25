-- Fix function search path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Replace broad public SELECT policies with object-level access only.
-- Public buckets still serve files via signed/public URLs without listing.
DROP POLICY IF EXISTS "mockups_select_public" ON storage.objects;
DROP POLICY IF EXISTS "screenshots_select_public" ON storage.objects;

-- Allow owner to list their own mockup files (for management UI), nobody else can list
CREATE POLICY "mockups_select_own" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'mockups' AND (storage.foldername(name))[1] = auth.uid()::text
  );