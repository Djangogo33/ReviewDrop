-- 1. Notes internes sur feedback_replies
ALTER TABLE public.feedback_replies
  ADD COLUMN IF NOT EXISTS is_internal boolean NOT NULL DEFAULT false;

-- Lecture publique restreinte : les visiteurs voient les réponses non-internes
DROP POLICY IF EXISTS "Anon can read public replies" ON public.feedback_replies;
CREATE POLICY "Anon can read public replies"
  ON public.feedback_replies
  FOR SELECT
  TO anon
  USING (is_internal = false);

GRANT SELECT ON public.feedback_replies TO anon;

-- 2. Realtime pour feedback_replies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'feedback_replies'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback_replies';
  END IF;
END $$;

-- 3. Webhooks
CREATE TABLE IF NOT EXISTS public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL,
  events text[] NOT NULL DEFAULT ARRAY['feedback.created']::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhooks TO authenticated;
GRANT ALL ON public.webhooks TO service_role;

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manages webhooks" ON public.webhooks;
CREATE POLICY "Owner manages webhooks"
  ON public.webhooks
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = webhooks.project_id AND p.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = webhooks.project_id AND p.owner_id = auth.uid()));

DROP TRIGGER IF EXISTS webhooks_updated_at ON public.webhooks;
CREATE TRIGGER webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Historique de livraison
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event text NOT NULL,
  status_code int,
  ok boolean NOT NULL DEFAULT false,
  response_snippet text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS webhook_deliveries_webhook_id_created_at_idx
  ON public.webhook_deliveries (webhook_id, created_at DESC);

GRANT SELECT ON public.webhook_deliveries TO authenticated;
GRANT ALL ON public.webhook_deliveries TO service_role;

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner reads deliveries" ON public.webhook_deliveries;
CREATE POLICY "Owner reads deliveries"
  ON public.webhook_deliveries
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.webhooks w
    JOIN public.projects p ON p.id = w.project_id
    WHERE w.id = webhook_deliveries.webhook_id AND p.owner_id = auth.uid()
  ));