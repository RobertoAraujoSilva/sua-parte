-- ================================================================================================
-- MINISTERIAL SYSTEM - COMPLETE DATABASE SCHEMA MIGRATION
-- ================================================================================================

-- 1. CREATE ENUMS
-- ================================================================================================

CREATE TYPE public.app_genero AS ENUM ('masculino', 'feminino');
CREATE TYPE public.app_cargo AS ENUM (
  'anciao',
  'servo_ministerial', 
  'pioneiro_regular',
  'publicador_batizado',
  'publicador_nao_batizado',
  'estudante_novo'
);
CREATE TYPE public.app_role AS ENUM ('admin', 'instrutor', 'estudante', 'family_member');
CREATE TYPE public.progress_level AS ENUM ('beginning', 'developing', 'qualified', 'advanced');

-- 2. CREATE PROFILES TABLE
-- ================================================================================================

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome_completo TEXT,
  congregacao TEXT,
  cargo TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. CREATE USER ROLES TABLE (SECURITY BEST PRACTICE)
-- ================================================================================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. CREATE CONGREGACOES TABLE
-- ================================================================================================

CREATE TABLE public.congregacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.congregacoes ENABLE ROW LEVEL SECURITY;

-- 5. CREATE ESTUDANTES TABLE
-- ================================================================================================

CREATE TABLE public.estudantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  idade INTEGER NOT NULL CHECK (idade >= 1 AND idade <= 120),
  genero app_genero NOT NULL,
  email TEXT,
  telefone TEXT,
  data_batismo DATE,
  cargo app_cargo NOT NULL DEFAULT 'estudante_novo',
  id_pai_mae UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT TRUE,
  observacoes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.estudantes ENABLE ROW LEVEL SECURITY;

-- 6. CREATE PROGRAMAS TABLE
-- ================================================================================================

CREATE TABLE public.programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  semana TEXT,
  conteudo JSONB,
  status TEXT DEFAULT 'draft',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;

-- 7. CREATE DESIGNACOES TABLE (ASSIGNMENTS)
-- ================================================================================================

CREATE TABLE public.designacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_programa UUID REFERENCES public.programas(id) ON DELETE CASCADE,
  id_estudante UUID REFERENCES public.estudantes(id) ON DELETE CASCADE NOT NULL,
  id_ajudante UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
  titulo_parte TEXT NOT NULL,
  tempo_minutos INTEGER,
  cena TEXT,
  data_designacao DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.designacoes ENABLE ROW LEVEL SECURITY;

-- 8. CREATE STUDENT PROGRESS TABLE
-- ================================================================================================

CREATE TABLE public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.estudantes(id) ON DELETE CASCADE NOT NULL,
  progress_level progress_level NOT NULL DEFAULT 'beginning',
  bible_reading BOOLEAN DEFAULT FALSE,
  initial_call BOOLEAN DEFAULT FALSE,
  return_visit BOOLEAN DEFAULT FALSE,
  bible_study BOOLEAN DEFAULT FALSE,
  talk BOOLEAN DEFAULT FALSE,
  demonstration BOOLEAN DEFAULT FALSE,
  can_be_helper BOOLEAN DEFAULT FALSE,
  can_teach_others BOOLEAN DEFAULT FALSE,
  last_assignment_date DATE,
  total_assignments INTEGER DEFAULT 0,
  performance_notes TEXT,
  instructor_feedback TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id)
);

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- 9. CREATE TRIGGERS FOR UPDATED_AT
-- ================================================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_congregacoes_updated_at BEFORE UPDATE ON public.congregacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estudantes_updated_at BEFORE UPDATE ON public.estudantes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programas_updated_at BEFORE UPDATE ON public.programas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_designacoes_updated_at BEFORE UPDATE ON public.designacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON public.student_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. CREATE RLS POLICIES
-- ================================================================================================

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- USER_ROLES POLICIES
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- CONGREGACOES POLICIES
CREATE POLICY "Users can view own congregacoes" ON public.congregacoes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own congregacoes" ON public.congregacoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own congregacoes" ON public.congregacoes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own congregacoes" ON public.congregacoes
  FOR DELETE USING (auth.uid() = user_id);

-- ESTUDANTES POLICIES
CREATE POLICY "Users can view own estudantes" ON public.estudantes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own estudantes" ON public.estudantes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own estudantes" ON public.estudantes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own estudantes" ON public.estudantes
  FOR DELETE USING (auth.uid() = user_id);

-- PROGRAMAS POLICIES
CREATE POLICY "Users can view own programas" ON public.programas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own programas" ON public.programas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own programas" ON public.programas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own programas" ON public.programas
  FOR DELETE USING (auth.uid() = user_id);

-- DESIGNACOES POLICIES
CREATE POLICY "Users can view own designacoes" ON public.designacoes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own designacoes" ON public.designacoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own designacoes" ON public.designacoes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own designacoes" ON public.designacoes
  FOR DELETE USING (auth.uid() = user_id);

-- STUDENT_PROGRESS POLICIES
CREATE POLICY "Users can view student progress for their students" ON public.student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estudantes
      WHERE estudantes.id = student_progress.student_id
      AND estudantes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage student progress for their students" ON public.student_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.estudantes
      WHERE estudantes.id = student_progress.student_id
      AND estudantes.user_id = auth.uid()
    )
  );

-- 11. CREATE PROFILE ON USER SIGNUP
-- ================================================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, congregacao)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'congregacao', '')
  );
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'instrutor');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. CREATE INDEXES FOR PERFORMANCE
-- ================================================================================================

CREATE INDEX idx_estudantes_user_id ON public.estudantes(user_id);
CREATE INDEX idx_estudantes_cargo ON public.estudantes(cargo);
CREATE INDEX idx_estudantes_ativo ON public.estudantes(ativo);
CREATE INDEX idx_programas_user_id ON public.programas(user_id);
CREATE INDEX idx_programas_data ON public.programas(data);
CREATE INDEX idx_designacoes_user_id ON public.designacoes(user_id);
CREATE INDEX idx_designacoes_estudante ON public.designacoes(id_estudante);
CREATE INDEX idx_student_progress_student_id ON public.student_progress(student_id);