-- Global Congregation System Migration
-- Supports multiple congregations worldwide with proper isolation and management

-- ============================================================================
-- PHASE 1: CREATE CONGREGATION MANAGEMENT TABLES
-- ============================================================================

-- Create congregations table for centralized management
CREATE TABLE IF NOT EXISTS public.congregations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  pais VARCHAR(50) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  idioma VARCHAR(10) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  codigo_pais VARCHAR(5) DEFAULT '+55', -- For phone formatting
  formato_telefone VARCHAR(50) DEFAULT '(##) ####-####', -- Phone format pattern
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default congregations
INSERT INTO public.congregations (nome, pais, cidade, idioma, timezone, codigo_pais, formato_telefone) VALUES
('Market Harborough', 'Reino Unido', 'Market Harborough', 'en-GB', 'Europe/London', '+44', '#### ### ####'),
('São Paulo Central', 'Brasil', 'São Paulo', 'pt-BR', 'America/Sao_Paulo', '+55', '(##) #####-####'),
('Rio de Janeiro Norte', 'Brasil', 'Rio de Janeiro', 'pt-BR', 'America/Sao_Paulo', '+55', '(##) #####-####')
ON CONFLICT (nome) DO NOTHING;

-- ============================================================================
-- PHASE 2: ADD CONGREGATION FIELDS TO EXISTING TABLES
-- ============================================================================

-- Add congregation fields to estudantes
ALTER TABLE public.estudantes 
  ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS congregacao VARCHAR(100), -- Legacy support
  ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status_aprovacao VARCHAR(20) DEFAULT 'aprovado' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado')),
  ADD COLUMN IF NOT EXISTS pais VARCHAR(50),
  ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);

-- Add designation columns (S-38-T compliance)
ALTER TABLE public.estudantes 
  ADD COLUMN IF NOT EXISTS chairman BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pray BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tresures BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS gems BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reading BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS starting BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS following BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS making BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS explaining BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS talk BOOLEAN DEFAULT false;

-- Add congregation fields to other tables
ALTER TABLE public.programas 
  ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregations(id) ON DELETE SET NULL;

ALTER TABLE public.designacoes 
  ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregations(id) ON DELETE SET NULL;

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregations(id) ON DELETE SET NULL;

-- ============================================================================
-- PHASE 3: CREATE CONGREGATION MEMBERSHIP TABLE
-- ============================================================================

-- Table to manage user-congregation relationships
CREATE TABLE IF NOT EXISTS public.congregation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  congregacao_id UUID REFERENCES public.congregations(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'membro' CHECK (role IN ('membro', 'instrutor', 'anciao', 'servo_ministerial')),
  ativo BOOLEAN DEFAULT true,
  data_entrada TIMESTAMPTZ DEFAULT now(),
  data_saida TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, congregacao_id)
);

-- ============================================================================
-- PHASE 4: DATA MIGRATION AND BACKFILL
-- ============================================================================

-- Function to migrate existing data
CREATE OR REPLACE FUNCTION migrate_congregation_data()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  market_harborough_id UUID;
  sao_paulo_id UUID;
BEGIN
  -- Get congregation IDs
  SELECT id INTO market_harborough_id FROM public.congregations WHERE nome = 'Market Harborough';
  SELECT id INTO sao_paulo_id FROM public.congregations WHERE nome = 'São Paulo Central';
  
  -- Update Franklin's record specifically
  UPDATE public.estudantes 
  SET 
    congregacao_id = market_harborough_id,
    congregacao = 'Market Harborough',
    pais = 'Reino Unido',
    cidade = 'Market Harborough',
    timezone = 'Europe/London',
    status_aprovacao = 'aprovado'
  WHERE id = 'd4036a52-2e89-4d79-9e4a-593e7f9fc1af';
  
  -- Update other students based on user metadata
  UPDATE public.estudantes e
  SET 
    congregacao_id = CASE 
      WHEN u.raw_user_meta_data->>'congregacao' = 'Market Harborough' THEN market_harborough_id
      ELSE sao_paulo_id
    END,
    congregacao = COALESCE(u.raw_user_meta_data->>'congregacao', 'São Paulo Central'),
    pais = CASE 
      WHEN u.raw_user_meta_data->>'congregacao' = 'Market Harborough' THEN 'Reino Unido'
      ELSE 'Brasil'
    END,
    cidade = CASE 
      WHEN u.raw_user_meta_data->>'congregacao' = 'Market Harborough' THEN 'Market Harborough'
      ELSE 'São Paulo'
    END,
    timezone = CASE 
      WHEN u.raw_user_meta_data->>'congregacao' = 'Market Harborough' THEN 'Europe/London'
      ELSE 'America/Sao_Paulo'
    END,
    status_aprovacao = 'aprovado'
  FROM auth.users u
  WHERE e.user_id = u.id AND e.congregacao_id IS NULL;
  
  -- Create congregation memberships
  INSERT INTO public.congregation_members (user_id, congregacao_id, role)
  SELECT DISTINCT 
    u.id,
    CASE 
      WHEN u.raw_user_meta_data->>'congregacao' = 'Market Harborough' THEN market_harborough_id
      ELSE sao_paulo_id
    END,
    CASE 
      WHEN u.raw_user_meta_data->>'role' = 'instrutor' THEN 'instrutor'
      ELSE 'membro'
    END
  FROM auth.users u
  WHERE u.raw_user_meta_data->>'congregacao' IS NOT NULL
  ON CONFLICT (user_id, congregacao_id) DO NOTHING;
  
  -- Update profiles
  UPDATE public.profiles p
  SET congregacao_id = cm.congregacao_id
  FROM public.congregation_members cm
  WHERE p.id = cm.user_id AND p.congregacao_id IS NULL;
  
  RAISE NOTICE 'Congregation data migration completed successfully';
END;
$$;

-- Execute migration
SELECT migrate_congregation_data();
DROP FUNCTION migrate_congregation_data();

-- ============================================================================
-- PHASE 5: CREATE PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_estudantes_congregacao_id ON public.estudantes(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_estudantes_congregacao ON public.estudantes(congregacao);
CREATE INDEX IF NOT EXISTS idx_estudantes_status_aprovacao ON public.estudantes(status_aprovacao);
CREATE INDEX IF NOT EXISTS idx_estudantes_pais ON public.estudantes(pais);
CREATE INDEX IF NOT EXISTS idx_congregation_members_user_id ON public.congregation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_congregation_members_congregacao_id ON public.congregation_members(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_congregations_pais ON public.congregations(pais);

-- ============================================================================
-- PHASE 6: UPDATE RLS POLICIES FOR MULTI-CONGREGATION SUPPORT
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can create their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can update their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can delete their own students" ON public.estudantes;

-- New congregation-based policies
CREATE POLICY "Users can view students from same congregation"
  ON public.estudantes FOR SELECT
  USING (
    auth.uid() = user_id OR 
    congregacao_id IN (
      SELECT cm.congregacao_id 
      FROM public.congregation_members cm 
      WHERE cm.user_id = auth.uid() AND cm.ativo = true
    )
  );

CREATE POLICY "Users can create students in their congregation"
  ON public.estudantes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    congregacao_id IN (
      SELECT cm.congregacao_id 
      FROM public.congregation_members cm 
      WHERE cm.user_id = auth.uid() AND cm.ativo = true
    )
  );

CREATE POLICY "Users can update students from same congregation"
  ON public.estudantes FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    congregacao_id IN (
      SELECT cm.congregacao_id 
      FROM public.congregation_members cm 
      WHERE cm.user_id = auth.uid() AND cm.ativo = true
    )
  );

CREATE POLICY "Users can delete their own students"
  ON public.estudantes FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on new tables
ALTER TABLE public.congregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.congregation_members ENABLE ROW LEVEL SECURITY;

-- Congregation policies
CREATE POLICY "Anyone can view active congregations"
  ON public.congregations FOR SELECT
  USING (ativo = true);

-- Congregation members policies
CREATE POLICY "Users can view their own memberships"
  ON public.congregation_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memberships"
  ON public.congregation_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PHASE 7: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's congregations
CREATE OR REPLACE FUNCTION get_user_congregations(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  congregacao_id UUID,
  nome VARCHAR(100),
  pais VARCHAR(50),
  cidade VARCHAR(100),
  role VARCHAR(20)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.nome,
    c.pais,
    c.cidade,
    cm.role
  FROM public.congregations c
  JOIN public.congregation_members cm ON c.id = cm.congregacao_id
  WHERE cm.user_id = user_uuid AND cm.ativo = true;
END;
$$;

-- Function to format phone number by congregation
CREATE OR REPLACE FUNCTION format_phone_number(phone_number VARCHAR, congregacao_id UUID)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
  formato VARCHAR(50);
  codigo_pais VARCHAR(5);
  formatted_phone VARCHAR;
BEGIN
  SELECT c.formato_telefone, c.codigo_pais 
  INTO formato, codigo_pais
  FROM public.congregations c 
  WHERE c.id = congregacao_id;
  
  IF formato IS NULL THEN
    RETURN phone_number;
  END IF;
  
  -- Simple formatting logic (can be enhanced)
  formatted_phone := phone_number;
  
  -- Add country code if not present
  IF NOT formatted_phone LIKE codigo_pais || '%' THEN
    formatted_phone := codigo_pais || ' ' || formatted_phone;
  END IF;
  
  RETURN formatted_phone;
END;
$$;

-- Function to check if user can manage student
CREATE OR REPLACE FUNCTION can_user_manage_student(student_id UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_congregacao UUID;
  user_role VARCHAR(20);
BEGIN
  -- Get student's congregation
  SELECT congregacao_id INTO student_congregacao
  FROM public.estudantes 
  WHERE id = student_id;
  
  -- Check if user is in same congregation with instructor role
  SELECT cm.role INTO user_role
  FROM public.congregation_members cm
  WHERE cm.user_id = user_uuid 
    AND cm.congregacao_id = student_congregacao 
    AND cm.ativo = true;
  
  RETURN user_role IN ('instrutor', 'anciao');
END;
$$;

-- ============================================================================
-- PHASE 8: CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Trigger to update congregation info when user metadata changes
CREATE OR REPLACE FUNCTION sync_user_congregation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  congregacao_id UUID;
BEGIN
  -- Get congregation ID from name
  SELECT id INTO congregacao_id
  FROM public.congregations
  WHERE nome = NEW.raw_user_meta_data->>'congregacao';
  
  -- Update or insert congregation membership
  INSERT INTO public.congregation_members (user_id, congregacao_id, role)
  VALUES (
    NEW.id,
    congregacao_id,
    CASE WHEN NEW.raw_user_meta_data->>'role' = 'instrutor' THEN 'instrutor' ELSE 'membro' END
  )
  ON CONFLICT (user_id, congregacao_id) 
  DO UPDATE SET 
    role = CASE WHEN NEW.raw_user_meta_data->>'role' = 'instrutor' THEN 'instrutor' ELSE 'membro' END,
    ativo = true;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_user_congregation_trigger
  AFTER UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_congregation();

-- ============================================================================
-- PHASE 9: GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.congregations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.congregation_members TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_congregations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION format_phone_number(VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_manage_student(UUID, UUID) TO authenticated;

-- ============================================================================
-- VERIFICATION AND LOGGING
-- ============================================================================

DO $$
DECLARE
  total_congregations INTEGER;
  total_members INTEGER;
  total_students INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_congregations FROM public.congregations;
  SELECT COUNT(*) INTO total_members FROM public.congregation_members;
  SELECT COUNT(*) INTO total_students FROM public.estudantes WHERE congregacao_id IS NOT NULL;
  
  RAISE NOTICE 'Global Congregation System Migration Completed:';
  RAISE NOTICE '- Total congregations: %', total_congregations;
  RAISE NOTICE '- Total congregation members: %', total_members;
  RAISE NOTICE '- Students with congregation: %', total_students;
END $$;