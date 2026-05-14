
-- 1. Add strict INSERT policy on feedbacks (only project owner; public API uses service role and bypasses RLS)
CREATE POLICY "feedbacks_insert_owner"
ON public.feedbacks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = feedbacks.project_id AND p.owner_id = auth.uid()
  )
);

-- 2. Make screenshots bucket private
UPDATE storage.buckets SET public = false WHERE id = 'screenshots';

-- 3. RLS policies on storage.objects for screenshots: only project owners can read
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
      AND p.id::text = (storage.foldername(name))[1]
  )
);
