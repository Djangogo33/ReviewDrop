
-- 1. ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "user_roles_select_self_or_admin" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 2. PLAN EXPIRATION
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

-- 3. PROMO CODES
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  plan text NOT NULL CHECK (plan IN ('pro','max')),
  duration_days integer NOT NULL CHECK (duration_days > 0),
  max_uses integer NOT NULL DEFAULT 1 CHECK (max_uses > 0),
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promo_codes_admin_all" ON public.promo_codes
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER promo_codes_updated_at
BEFORE UPDATE ON public.promo_codes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. REDEMPTIONS
CREATE TABLE public.redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL,
  granted_until timestamptz NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (promo_code_id, user_id)
);

GRANT SELECT ON public.redemptions TO authenticated;
GRANT ALL ON public.redemptions TO service_role;

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "redemptions_select_own_or_admin" ON public.redemptions
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 5. REDEEM FUNCTION
CREATE OR REPLACE FUNCTION public.redeem_promo_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  pc record;
  current_until timestamptz;
  new_until timestamptz;
  base_plan text;
  new_plan text;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT * INTO pc FROM public.promo_codes WHERE upper(code) = upper(_code) FOR UPDATE;

  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'unknown_code'); END IF;
  IF NOT pc.is_active THEN RETURN jsonb_build_object('ok', false, 'error', 'inactive'); END IF;
  IF pc.expires_at IS NOT NULL AND pc.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'expired');
  END IF;
  IF pc.used_count >= pc.max_uses THEN
    RETURN jsonb_build_object('ok', false, 'error', 'max_uses_reached');
  END IF;
  IF EXISTS (SELECT 1 FROM public.redemptions WHERE promo_code_id = pc.id AND user_id = uid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_redeemed');
  END IF;

  SELECT plan, COALESCE(plan_expires_at, now()) INTO base_plan, current_until
  FROM public.profiles WHERE id = uid;

  -- Upgrade: max > pro
  new_plan := CASE
    WHEN pc.plan = 'max' THEN 'max'
    WHEN pc.plan = 'pro' AND base_plan = 'max' THEN 'max'
    ELSE 'pro'
  END;

  new_until := GREATEST(current_until, now()) + (pc.duration_days || ' days')::interval;

  UPDATE public.profiles
  SET plan = new_plan, plan_expires_at = new_until, updated_at = now()
  WHERE id = uid;

  INSERT INTO public.redemptions (promo_code_id, user_id, plan, granted_until)
  VALUES (pc.id, uid, new_plan, new_until);

  UPDATE public.promo_codes SET used_count = used_count + 1 WHERE id = pc.id;

  RETURN jsonb_build_object('ok', true, 'plan', new_plan, 'granted_until', new_until);
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_promo_code(text) TO authenticated;

-- 6. ADMIN POLICIES on existing tables
CREATE POLICY "profiles_select_admin" ON public.profiles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "profiles_update_admin" ON public.profiles
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "projects_select_admin" ON public.projects
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "feedbacks_select_admin" ON public.feedbacks
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "referrals_select_admin" ON public.referrals
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "referral_events_select_admin" ON public.referral_events
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. SEED ADMIN ROLES
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE lower(email) IN ('paul.ardant@gmail.com', 'djangogo33.tdac@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. Auto-grant admin on signup for the allowlist
CREATE OR REPLACE FUNCTION public.auto_grant_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) IN ('paul.ardant@gmail.com', 'djangogo33.tdac@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_auto_grant_admin
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.auto_grant_admin();
