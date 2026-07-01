
-- Fix broken screenshots SELECT policy (was joining on p.name instead of storage object name)
DROP POLICY IF EXISTS "screenshots_select_owner" ON storage.objects;
CREATE POLICY "screenshots_select_owner"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'screenshots'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.owner_id = auth.uid()
      AND (p.id)::text = (storage.foldername(name))[1]
  )
);
