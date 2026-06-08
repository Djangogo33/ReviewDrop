
-- 1) Block self-escalation of billing fields on profiles
CREATE OR REPLACE FUNCTION public.prevent_billing_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow privileged roles (service_role, postgres, supabase_admin) to change anything.
  IF current_setting('request.jwt.claims', true) IS NULL
     OR (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- For all other roles (authenticated end users), force billing fields to old values.
  NEW.plan := OLD.plan;
  NEW.plan_expires_at := OLD.plan_expires_at;
  NEW.stripe_customer_id := OLD.stripe_customer_id;
  NEW.stripe_subscription_id := OLD.stripe_subscription_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_billing_self_update ON public.profiles;
CREATE TRIGGER trg_prevent_billing_self_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_billing_self_update();

-- 2) Fix broken screenshots storage policy (used p.name instead of name)
DROP POLICY IF EXISTS screenshots_select_owner ON storage.objects;
CREATE POLICY screenshots_select_owner
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'screenshots'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.owner_id = auth.uid()
      AND p.id::text = (storage.foldername(name))[1]
  )
);

-- 3) Realtime channel authorization — restrict topic subscriptions
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rd_realtime_topic_read" ON realtime.messages;
CREATE POLICY "rd_realtime_topic_read"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  -- Dashboard channel: only the matching user
  (
    realtime.topic() LIKE 'dashboard-%'
    AND substring(realtime.topic() FROM 11) = (auth.uid())::text
  )
  OR
  -- Project channel: only the project owner
  (
    realtime.topic() LIKE 'project-%'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.owner_id = auth.uid()
        AND p.id::text = substring(realtime.topic() FROM 9)
    )
  )
);
