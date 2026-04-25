-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Projects
CREATE TABLE public.projects (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'live' CHECK (type IN ('live','mockup')),
  public_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  mockup_image_path TEXT,
  brand_color TEXT NOT NULL DEFAULT '#6366f1',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notify_email BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX projects_owner_idx ON public.projects(owner_id);
CREATE INDEX projects_token_idx ON public.projects(public_token);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_own" ON public.projects
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "projects_insert_own" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "projects_update_own" ON public.projects
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "projects_delete_own" ON public.projects
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Feedbacks
CREATE TABLE public.feedbacks (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  page_url TEXT,
  position_x NUMERIC(6,3) NOT NULL,
  position_y NUMERIC(6,3) NOT NULL,
  viewport_w INTEGER,
  viewport_h INTEGER,
  css_selector TEXT,
  screenshot_path TEXT,
  author_name TEXT NOT NULL DEFAULT 'Anonyme',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','closed')),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX feedbacks_project_idx ON public.feedbacks(project_id);
CREATE INDEX feedbacks_status_idx ON public.feedbacks(project_id, status);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Owner can read and manage feedbacks of their projects
CREATE POLICY "feedbacks_select_owner" ON public.feedbacks
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
  );
CREATE POLICY "feedbacks_update_owner" ON public.feedbacks
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
  );
CREATE POLICY "feedbacks_delete_owner" ON public.feedbacks
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
  );

-- Public insert is handled server-side via service role + token validation; deny direct anon insert.

CREATE TRIGGER feedbacks_set_updated_at
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Feedback replies (internal notes by owner)
CREATE TABLE public.feedback_replies (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.feedbacks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX feedback_replies_feedback_idx ON public.feedback_replies(feedback_id);

ALTER TABLE public.feedback_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "replies_select_owner" ON public.feedback_replies
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.feedbacks f
      JOIN public.projects p ON p.id = f.project_id
      WHERE f.id = feedback_id AND p.owner_id = auth.uid()
    )
  );
CREATE POLICY "replies_insert_owner" ON public.feedback_replies
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = author_id AND EXISTS (
      SELECT 1 FROM public.feedbacks f
      JOIN public.projects p ON p.id = f.project_id
      WHERE f.id = feedback_id AND p.owner_id = auth.uid()
    )
  );
CREATE POLICY "replies_delete_owner" ON public.feedback_replies
  FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('mockups', 'mockups', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true)
  ON CONFLICT (id) DO NOTHING;

-- Mockups: only owner can upload to their folder (folder = user id)
CREATE POLICY "mockups_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'mockups');
CREATE POLICY "mockups_insert_own" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'mockups' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "mockups_delete_own" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'mockups' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Screenshots: public read; insert via server only (service role bypasses RLS)
CREATE POLICY "screenshots_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots');