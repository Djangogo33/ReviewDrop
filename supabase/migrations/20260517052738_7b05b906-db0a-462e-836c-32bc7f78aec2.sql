
-- 1. Add fingerprint columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signup_ip_hash text,
  ADD COLUMN IF NOT EXISTS signup_email_normalized text;

CREATE INDEX IF NOT EXISTS profiles_signup_ip_hash_idx ON public.profiles(signup_ip_hash);
CREATE INDEX IF NOT EXISTS profiles_signup_email_normalized_idx ON public.profiles(signup_email_normalized);

ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS ip_hash text,
  ADD COLUMN IF NOT EXISTS blocked_reason text;

CREATE INDEX IF NOT EXISTS referrals_ip_hash_idx ON public.referrals(ip_hash);

-- 2. Event log
CREATE TABLE IF NOT EXISTS public.referral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- signup_attempt, referral_credited, referral_blocked, rate_limited
  referral_code text,
  referrer_id uuid,
  referred_id uuid,
  ip_hash text,
  email_normalized text,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_events_referrer_idx ON public.referral_events(referrer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS referral_events_ip_idx ON public.referral_events(ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS referral_events_code_idx ON public.referral_events(referral_code, created_at DESC);

ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referral_events_select_own"
  ON public.referral_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- 3. Email normalization helper
CREATE OR REPLACE FUNCTION public.normalize_email(_email text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  e text;
  local_part text;
  domain_part text;
BEGIN
  IF _email IS NULL THEN RETURN NULL; END IF;
  e := lower(trim(_email));
  IF position('@' IN e) = 0 THEN RETURN e; END IF;
  local_part := split_part(e, '@', 1);
  domain_part := split_part(e, '@', 2);
  -- Strip "+alias"
  local_part := split_part(local_part, '+', 1);
  -- For gmail/googlemail, remove dots
  IF domain_part IN ('gmail.com', 'googlemail.com') THEN
    local_part := replace(local_part, '.', '');
    domain_part := 'gmail.com';
  END IF;
  RETURN local_part || '@' || domain_part;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.normalize_email(text) FROM PUBLIC, anon, authenticated;

-- 4. Rewrite handle_new_user with anti-fraud
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code text;
  parent_id uuid;
  submitted_code text;
  ip_h text;
  email_norm text;
  block_reason text := NULL;
  ref_status text := 'confirmed';
  recent_by_ref int;
  recent_by_ip_ref int;
  same_email_count int;
BEGIN
  ref_code := public.generate_referral_code();
  email_norm := public.normalize_email(NEW.email);
  ip_h := NULLIF(NEW.raw_user_meta_data->>'signup_ip_hash', '');
  submitted_code := upper(COALESCE(NEW.raw_user_meta_data->>'referral_code', ''));

  -- Lookup parent
  IF submitted_code <> '' THEN
    SELECT id INTO parent_id
    FROM public.profiles
    WHERE referral_code = submitted_code
    LIMIT 1;
  END IF;

  -- Create profile first
  INSERT INTO public.profiles (id, email, full_name, referral_code, referred_by, signup_ip_hash, signup_email_normalized)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    ref_code,
    parent_id,
    ip_h,
    email_norm
  )
  ON CONFLICT (id) DO NOTHING;

  -- Apply anti-fraud rules when a referral code was submitted
  IF submitted_code <> '' THEN
    IF parent_id IS NULL THEN
      block_reason := 'unknown_code';
    ELSIF parent_id = NEW.id THEN
      block_reason := 'self_referral';
    ELSE
      -- Duplicate normalized email already on platform (besides current)
      SELECT count(*) INTO same_email_count
      FROM public.profiles
      WHERE signup_email_normalized = email_norm AND id <> NEW.id;
      IF same_email_count > 0 THEN
        block_reason := 'duplicate_email';
      END IF;

      -- Same IP already credited this referrer multiple times (>=3)
      IF block_reason IS NULL AND ip_h IS NOT NULL THEN
        SELECT count(*) INTO recent_by_ip_ref
        FROM public.referrals
        WHERE referrer_id = parent_id
          AND ip_hash = ip_h
          AND created_at > now() - interval '30 days';
        IF recent_by_ip_ref >= 3 THEN
          block_reason := 'ip_limit_per_referrer';
        END IF;
      END IF;

      -- Referrer already credited 10 in last 24h
      IF block_reason IS NULL THEN
        SELECT count(*) INTO recent_by_ref
        FROM public.referrals
        WHERE referrer_id = parent_id
          AND status = 'confirmed'
          AND created_at > now() - interval '24 hours';
        IF recent_by_ref >= 10 THEN
          block_reason := 'referrer_daily_limit';
        END IF;
      END IF;
    END IF;

    IF block_reason IS NOT NULL THEN
      ref_status := 'blocked';
    END IF;

    -- Insert referral record (only if parent resolved) with status
    IF parent_id IS NOT NULL THEN
      INSERT INTO public.referrals (referrer_id, referred_id, status, confirmed_at, ip_hash, blocked_reason)
      VALUES (
        parent_id,
        NEW.id,
        ref_status,
        CASE WHEN ref_status = 'confirmed' THEN now() ELSE NULL END,
        ip_h,
        block_reason
      )
      ON CONFLICT DO NOTHING;
    END IF;

    INSERT INTO public.referral_events (event_type, referral_code, referrer_id, referred_id, ip_hash, email_normalized, reason)
    VALUES (
      CASE WHEN block_reason IS NULL THEN 'referral_credited' ELSE 'referral_blocked' END,
      submitted_code,
      parent_id,
      NEW.id,
      ip_h,
      email_norm,
      block_reason
    );
  ELSE
    -- Plain signup, log only
    INSERT INTO public.referral_events (event_type, referrer_id, referred_id, ip_hash, email_normalized)
    VALUES ('signup_attempt', NULL, NEW.id, ip_h, email_norm);
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 5. Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
