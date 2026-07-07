
-- 1) Remove anon SELECT on feedback_replies
DROP POLICY IF EXISTS "Anon can read public replies" ON public.feedback_replies;
REVOKE SELECT ON public.feedback_replies FROM anon;

-- 2) Restrict billing column updates on profiles via RLS WITH CHECK
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND plan IS NOT DISTINCT FROM (SELECT p.plan FROM public.profiles p WHERE p.id = auth.uid())
    AND plan_expires_at IS NOT DISTINCT FROM (SELECT p.plan_expires_at FROM public.profiles p WHERE p.id = auth.uid())
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT p.stripe_customer_id FROM public.profiles p WHERE p.id = auth.uid())
    AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT p.stripe_subscription_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- 3) Fix screenshots storage SELECT policy self-join bug
DROP POLICY IF EXISTS screenshots_select_owner ON storage.objects;
CREATE POLICY screenshots_select_owner ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'screenshots'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.owner_id = auth.uid()
        AND p.id::text = (storage.foldername(storage.objects.name))[1]
    )
  );
