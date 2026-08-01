-- ============ ENUM-LIKE via CHECK (evita alterar app_role existente) ============

CREATE TABLE public.connect_moderators (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.connect_moderators TO authenticated;
GRANT ALL ON public.connect_moderators TO service_role;
ALTER TABLE public.connect_moderators ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_connect_moderator(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.connect_moderators m WHERE m.user_id = _user_id)
      OR public.has_role(_user_id, 'admin');
$$;

CREATE POLICY "moderators_read_self" ON public.connect_moderators
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_connect_moderator());

-- ============ PROFILES ============

CREATE TABLE public.connect_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  apelido text NOT NULL,
  data_nascimento date NOT NULL,
  genero text NOT NULL CHECK (genero IN ('masculino','feminino')),
  cidade text,
  pais text,
  congregacao text,
  status_espiritual text NOT NULL CHECK (status_espiritual IN ('batizado','pioneiro_regular','pioneiro_auxiliar','estudante_avancado')),
  tempo_na_verdade_anos integer CHECK (tempo_na_verdade_anos >= 0 AND tempo_na_verdade_anos <= 100),
  idiomas text[] NOT NULL DEFAULT '{}',
  disposto_mudar_cidade boolean NOT NULL DEFAULT false,
  disposto_mudar_pais boolean NOT NULL DEFAULT false,
  bio text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
  rejection_reason text,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  consent_religious_data boolean NOT NULL DEFAULT false,
  code_of_conduct_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT connect_profiles_adult CHECK (data_nascimento <= (CURRENT_DATE - INTERVAL '18 years'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.connect_profiles TO authenticated;
GRANT ALL ON public.connect_profiles TO service_role;
ALTER TABLE public.connect_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.connect_my_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT id FROM public.connect_profiles WHERE user_id = auth.uid() $$;

CREATE OR REPLACE FUNCTION public.connect_is_approved(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.connect_profiles p WHERE p.user_id = _user_id AND p.status = 'approved')
$$;

CREATE OR REPLACE FUNCTION public.connect_profile_is_approved(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.connect_profiles p WHERE p.id = _profile_id AND p.status = 'approved')
$$;

CREATE POLICY "own_profile_select" ON public.connect_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "approved_see_approved" ON public.connect_profiles
  FOR SELECT TO authenticated USING (status = 'approved' AND public.connect_is_approved());
CREATE POLICY "moderator_select_all" ON public.connect_profiles
  FOR SELECT TO authenticated USING (public.is_connect_moderator());
CREATE POLICY "own_profile_insert" ON public.connect_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "own_profile_update" ON public.connect_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "moderator_profile_update" ON public.connect_profiles
  FOR UPDATE TO authenticated USING (public.is_connect_moderator()) WITH CHECK (public.is_connect_moderator());
CREATE POLICY "own_profile_delete" ON public.connect_profiles
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- impede que o próprio usuário altere status/aprovação
CREATE OR REPLACE FUNCTION public.connect_guard_profile_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_connect_moderator() THEN
    NEW.status := OLD.status;
    NEW.approved_by := OLD.approved_by;
    NEW.approved_at := OLD.approved_at;
    NEW.rejection_reason := OLD.rejection_reason;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER connect_profiles_guard_status
  BEFORE UPDATE ON public.connect_profiles
  FOR EACH ROW EXECUTE FUNCTION public.connect_guard_profile_status();

-- ============ PHOTOS ============

CREATE TABLE public.connect_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.connect_profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  moderation_status text NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending','approved','rejected')),
  moderation_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connect_photos TO authenticated;
GRANT ALL ON public.connect_photos TO service_role;
ALTER TABLE public.connect_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_photos_all" ON public.connect_photos
  FOR ALL TO authenticated
  USING (profile_id = public.connect_my_profile_id())
  WITH CHECK (profile_id = public.connect_my_profile_id());
CREATE POLICY "approved_see_approved_photos" ON public.connect_photos
  FOR SELECT TO authenticated
  USING (moderation_status = 'approved' AND public.connect_is_approved() AND public.connect_profile_is_approved(profile_id));
CREATE POLICY "moderator_photos_select" ON public.connect_photos
  FOR SELECT TO authenticated USING (public.is_connect_moderator());
CREATE POLICY "moderator_photos_update" ON public.connect_photos
  FOR UPDATE TO authenticated USING (public.is_connect_moderator()) WITH CHECK (public.is_connect_moderator());

-- ============ PREFERENCES ============

CREATE TABLE public.connect_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES public.connect_profiles(id) ON DELETE CASCADE,
  idade_min integer NOT NULL DEFAULT 18 CHECK (idade_min >= 18),
  idade_max integer NOT NULL DEFAULT 99 CHECK (idade_max <= 120),
  generos_interesse text[] NOT NULL DEFAULT '{}',
  paises text[] NOT NULL DEFAULT '{}',
  idiomas text[] NOT NULL DEFAULT '{}',
  status_espiritual text[] NOT NULL DEFAULT '{}',
  apenas_dispostos_mudar boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connect_preferences TO authenticated;
GRANT ALL ON public.connect_preferences TO service_role;
ALTER TABLE public.connect_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_prefs_all" ON public.connect_preferences
  FOR ALL TO authenticated
  USING (profile_id = public.connect_my_profile_id())
  WITH CHECK (profile_id = public.connect_my_profile_id());

-- ============ SWIPES ============

CREATE TABLE public.connect_swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_profile_id uuid NOT NULL REFERENCES public.connect_profiles(id) ON DELETE CASCADE,
  target_profile_id uuid NOT NULL REFERENCES public.connect_profiles(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('like','pass')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (swiper_profile_id, target_profile_id),
  CONSTRAINT connect_swipes_no_self CHECK (swiper_profile_id <> target_profile_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connect_swipes TO authenticated;
GRANT ALL ON public.connect_swipes TO service_role;
ALTER TABLE public.connect_swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_swipes_all" ON public.connect_swipes
  FOR ALL TO authenticated
  USING (swiper_profile_id = public.connect_my_profile_id())
  WITH CHECK (swiper_profile_id = public.connect_my_profile_id() AND public.connect_is_approved());

-- ============ MATCHES ============

CREATE TABLE public.connect_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_a uuid NOT NULL REFERENCES public.connect_profiles(id) ON DELETE CASCADE,
  profile_b uuid NOT NULL REFERENCES public.connect_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_a, profile_b),
  CONSTRAINT connect_matches_order CHECK (profile_a < profile_b)
);
GRANT SELECT, UPDATE ON public.connect_matches TO authenticated;
GRANT ALL ON public.connect_matches TO service_role;
ALTER TABLE public.connect_matches ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.connect_in_match(_match_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connect_matches m
    WHERE m.id = _match_id
      AND public.connect_my_profile_id() IN (m.profile_a, m.profile_b)
  )
$$;

CREATE POLICY "matches_select_own" ON public.connect_matches
  FOR SELECT TO authenticated
  USING (public.connect_my_profile_id() IN (profile_a, profile_b));
CREATE POLICY "matches_close_own" ON public.connect_matches
  FOR UPDATE TO authenticated
  USING (public.connect_my_profile_id() IN (profile_a, profile_b))
  WITH CHECK (public.connect_my_profile_id() IN (profile_a, profile_b));
CREATE POLICY "matches_moderator_select" ON public.connect_matches
  FOR SELECT TO authenticated USING (public.is_connect_moderator());

CREATE OR REPLACE FUNCTION public.connect_create_match_on_mutual_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  a uuid; b uuid;
BEGIN
  IF NEW.direction <> 'like' THEN RETURN NEW; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.connect_swipes s
    WHERE s.swiper_profile_id = NEW.target_profile_id
      AND s.target_profile_id = NEW.swiper_profile_id
      AND s.direction = 'like'
  ) THEN RETURN NEW; END IF;

  a := LEAST(NEW.swiper_profile_id, NEW.target_profile_id);
  b := GREATEST(NEW.swiper_profile_id, NEW.target_profile_id);
  INSERT INTO public.connect_matches (profile_a, profile_b)
  VALUES (a, b)
  ON CONFLICT (profile_a, profile_b) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER connect_swipes_mutual_like
  AFTER INSERT OR UPDATE ON public.connect_swipes
  FOR EACH ROW EXECUTE FUNCTION public.connect_create_match_on_mutual_like();

-- ============ MESSAGES ============

CREATE TABLE public.connect_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.connect_matches(id) ON DELETE CASCADE,
  sender_profile_id uuid NOT NULL REFERENCES public.connect_profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX connect_messages_match_idx ON public.connect_messages (match_id, created_at);
GRANT SELECT, INSERT ON public.connect_messages TO authenticated;
GRANT ALL ON public.connect_messages TO service_role;
ALTER TABLE public.connect_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_in_match" ON public.connect_messages
  FOR SELECT TO authenticated USING (public.connect_in_match(match_id));
CREATE POLICY "messages_insert_in_match" ON public.connect_messages
  FOR INSERT TO authenticated
  WITH CHECK (public.connect_in_match(match_id) AND sender_profile_id = public.connect_my_profile_id() AND public.connect_is_approved());

ALTER TABLE public.connect_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connect_messages;

-- ============ REPORTS ============

CREATE TABLE public.connect_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_profile_id uuid NOT NULL REFERENCES public.connect_profiles(id) ON DELETE CASCADE,
  reported_profile_id uuid NOT NULL REFERENCES public.connect_profiles(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('fake_profile','harassment','inappropriate_content','not_jw','other')),
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  moderator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_note text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.connect_reports TO authenticated;
GRANT ALL ON public.connect_reports TO service_role;
ALTER TABLE public.connect_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert_own" ON public.connect_reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_profile_id = public.connect_my_profile_id());
CREATE POLICY "reports_select_own" ON public.connect_reports
  FOR SELECT TO authenticated USING (reporter_profile_id = public.connect_my_profile_id());
CREATE POLICY "reports_moderator_select" ON public.connect_reports
  FOR SELECT TO authenticated USING (public.is_connect_moderator());
CREATE POLICY "reports_moderator_update" ON public.connect_reports
  FOR UPDATE TO authenticated USING (public.is_connect_moderator()) WITH CHECK (public.is_connect_moderator());

-- ============ updated_at triggers ============

CREATE OR REPLACE FUNCTION public.connect_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER connect_profiles_touch BEFORE UPDATE ON public.connect_profiles
  FOR EACH ROW EXECUTE FUNCTION public.connect_touch_updated_at();
CREATE TRIGGER connect_photos_touch BEFORE UPDATE ON public.connect_photos
  FOR EACH ROW EXECUTE FUNCTION public.connect_touch_updated_at();
CREATE TRIGGER connect_preferences_touch BEFORE UPDATE ON public.connect_preferences
  FOR EACH ROW EXECUTE FUNCTION public.connect_touch_updated_at();
CREATE TRIGGER connect_swipes_touch BEFORE UPDATE ON public.connect_swipes
  FOR EACH ROW EXECUTE FUNCTION public.connect_touch_updated_at();
CREATE TRIGGER connect_matches_touch BEFORE UPDATE ON public.connect_matches
  FOR EACH ROW EXECUTE FUNCTION public.connect_touch_updated_at();
CREATE TRIGGER connect_reports_touch BEFORE UPDATE ON public.connect_reports
  FOR EACH ROW EXECUTE FUNCTION public.connect_touch_updated_at();