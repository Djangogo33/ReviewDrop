-- 1. Feedback status
ALTER TABLE public.feedbacks
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','in_progress','resolved'));

-- 2. AI categorization
ALTER TABLE public.feedbacks
  ADD COLUMN IF NOT EXISTS category text
    CHECK (category IS NULL OR category IN ('bug','idea','question','ux','other'));
ALTER TABLE public.feedbacks
  ADD COLUMN IF NOT EXISTS ai_summary text;

-- 3. Onboarding
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;

-- 4. Realtime on feedback_replies
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback_replies;
