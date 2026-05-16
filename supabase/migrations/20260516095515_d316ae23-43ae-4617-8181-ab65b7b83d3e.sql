
-- Add referral fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by uuid;

-- Function to generate a short unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code text;
  exists_count int;
BEGIN
  LOOP
    code := upper(substr(encode(extensions.gen_random_bytes(6), 'base64'), 1, 8));
    code := regexp_replace(code, '[^A-Z0-9]', '', 'g');
    IF length(code) >= 6 THEN
      code := substr(code, 1, 8);
      SELECT count(*) INTO exists_count FROM public.profiles WHERE referral_code = code;
      EXIT WHEN exists_count = 0;
    END IF;
  END LOOP;
  RETURN code;
END;
$$;

-- Backfill referral_code for existing profiles
UPDATE public.profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;

-- Update handle_new_user to set referral_code and referred_by from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code text;
  parent_id uuid;
BEGIN
  ref_code := public.generate_referral_code();

  -- Check if signup came with a referral code
  IF NEW.raw_user_meta_data ? 'referral_code' THEN
    SELECT id INTO parent_id
    FROM public.profiles
    WHERE referral_code = upper(NEW.raw_user_meta_data->>'referral_code')
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    ref_code,
    parent_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create a referral record if there's a parent
  IF parent_id IS NOT NULL AND parent_id <> NEW.id THEN
    INSERT INTO public.referrals (referrer_id, referred_id, status, confirmed_at)
    VALUES (parent_id, NEW.id, 'confirmed', now())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz
);

CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON public.referrals(referrer_id);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_select_own" ON public.referrals;
CREATE POLICY "referrals_select_own"
ON public.referrals
FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Recreate the trigger on auth.users (it may have been dropped)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
