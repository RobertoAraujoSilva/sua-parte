-- Enhanced Family Relationships Migration for Sistema Ministerial
-- Based on estudantes_enriquecido.xlsx structure analysis
-- This migration adds comprehensive family relationship support while maintaining backward compatibility

-- ============================================================================
-- PHASE 1: CREATE NEW ENUM TYPES
-- ============================================================================

-- Create enum types for new fields
CREATE TYPE IF NOT EXISTS estado_civil AS ENUM ('solteiro','casado','viuvo','desconhecido');
CREATE TYPE IF NOT EXISTS papel_familiar AS ENUM ('pai','mae','filho','filha','filho_adulto','filha_adulta');
CREATE TYPE IF NOT EXISTS relacao_familiar AS ENUM ('conjuge','filho_de','tutor_de');

-- ============================================================================
-- PHASE 2: ADD NEW COLUMNS TO ESTUDANTES TABLE
-- ============================================================================

-- Add new relationship and demographic fields
ALTER TABLE public.estudantes 
  ADD COLUMN IF NOT EXISTS data_nascimento_estimada DATE,
  ADD COLUMN IF NOT EXISTS estado_civil estado_civil DEFAULT 'desconhecido',
  ADD COLUMN IF NOT EXISTS papel_familiar papel_familiar,
  ADD COLUMN IF NOT EXISTS id_pai UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS id_mae UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS id_conjuge UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS coabitacao BOOLEAN DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS menor BOOLEAN,
  ADD COLUMN IF NOT EXISTS responsavel_primario UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS responsavel_secundario UUID REFERENCES public.estudantes(id) ON DELETE SET NULL;

-- Add familia field if it doesn't exist (for surname-based grouping)
ALTER TABLE public.estudantes 
  ADD COLUMN IF NOT EXISTS familia VARCHAR(100);

-- ============================================================================
-- PHASE 3: CREATE FAMILY_LINKS TABLE
-- ============================================================================

-- Create flexible family relationships table
CREATE TABLE IF NOT EXISTS public.family_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_id UUID NOT NULL REFERENCES public.estudantes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES public.estudantes(id) ON DELETE CASCADE,
  relacao relacao_familiar NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (source_id, target_id, relacao)
);

-- ============================================================================
-- PHASE 4: CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Add indexes for new relationship fields
CREATE INDEX IF NOT EXISTS idx_estudantes_id_pai ON public.estudantes(id_pai);
CREATE INDEX IF NOT EXISTS idx_estudantes_id_mae ON public.estudantes(id_mae);
CREATE INDEX IF NOT EXISTS idx_estudantes_id_conjuge ON public.estudantes(id_conjuge);
CREATE INDEX IF NOT EXISTS idx_estudantes_menor ON public.estudantes(menor);
CREATE INDEX IF NOT EXISTS idx_estudantes_papel_familiar ON public.estudantes(papel_familiar);
CREATE INDEX IF NOT EXISTS idx_estudantes_estado_civil ON public.estudantes(estado_civil);
CREATE INDEX IF NOT EXISTS idx_estudantes_familia ON public.estudantes(familia);
CREATE INDEX IF NOT EXISTS idx_estudantes_responsavel_primario ON public.estudantes(responsavel_primario);
CREATE INDEX IF NOT EXISTS idx_estudantes_responsavel_secundario ON public.estudantes(responsavel_secundario);

-- Add indexes for family_links table
CREATE INDEX IF NOT EXISTS idx_family_links_user_id ON public.family_links(user_id);
CREATE INDEX IF NOT EXISTS idx_family_links_source ON public.family_links(source_id);
CREATE INDEX IF NOT EXISTS idx_family_links_target ON public.family_links(target_id);
CREATE INDEX IF NOT EXISTS idx_family_links_relacao ON public.family_links(relacao);

-- ============================================================================
-- PHASE 5: DATA MIGRATION AND BACKFILL
-- ============================================================================

-- Create function to safely migrate existing data
CREATE OR REPLACE FUNCTION migrate_family_relationships()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- A) Extract familia (surname) from nome if not already set
  UPDATE public.estudantes 
  SET familia = TRIM(SPLIT_PART(nome, ' ', -1))
  WHERE familia IS NULL OR familia = '';

  -- B) Migrate existing id_pai_mae to new id_pai/id_mae fields based on gender
  UPDATE public.estudantes e 
  SET id_pai = p.id 
  FROM public.estudantes p 
  WHERE e.id_pai IS NULL 
    AND e.id_pai_mae = p.id 
    AND p.genero = 'masculino';

  UPDATE public.estudantes e 
  SET id_mae = m.id 
  FROM public.estudantes m 
  WHERE e.id_mae IS NULL 
    AND e.id_pai_mae = m.id 
    AND m.genero = 'feminino';

  -- C) Set menor field based on age
  UPDATE public.estudantes 
  SET menor = CASE 
    WHEN idade IS NOT NULL AND idade < 18 THEN true 
    ELSE false 
  END 
  WHERE menor IS NULL;

  -- D) Estimate birth date from age (for existing records)
  UPDATE public.estudantes 
  SET data_nascimento_estimada = DATE(CONCAT(EXTRACT(YEAR FROM NOW()) - idade, '-06-15'))
  WHERE data_nascimento_estimada IS NULL 
    AND idade IS NOT NULL;

  -- E) Assign papel_familiar based on age and family structure
  UPDATE public.estudantes 
  SET papel_familiar = CASE 
    WHEN genero = 'masculino' AND idade >= 25 THEN 'pai'
    WHEN genero = 'feminino' AND idade >= 25 THEN 'mae'
    WHEN idade < 18 THEN CASE 
      WHEN genero = 'masculino' THEN 'filho'
      ELSE 'filha'
    END
    ELSE CASE 
      WHEN genero = 'masculino' THEN 'filho_adulto'
      ELSE 'filha_adulta'
    END
  END
  WHERE papel_familiar IS NULL;

  -- F) Set responsible parties for minors
  UPDATE public.estudantes 
  SET responsavel_primario = COALESCE(id_pai, id_mae),
      responsavel_secundario = CASE 
        WHEN id_pai IS NOT NULL THEN id_mae 
        ELSE NULL 
      END
  WHERE menor = true 
    AND responsavel_primario IS NULL;

  -- G) Infer spouse relationships where both parents exist for same family
  WITH pares AS (
    SELECT DISTINCT c.id_pai, c.id_mae, c.user_id
    FROM public.estudantes c
    WHERE c.id_pai IS NOT NULL AND c.id_mae IS NOT NULL
  )
  UPDATE public.estudantes e 
  SET id_conjuge = p.id_mae,
      estado_civil = 'casado'
  FROM pares p 
  WHERE e.id = p.id_pai 
    AND e.id_conjuge IS NULL;

  WITH pares AS (
    SELECT DISTINCT c.id_pai, c.id_mae, c.user_id
    FROM public.estudantes c
    WHERE c.id_pai IS NOT NULL AND c.id_mae IS NOT NULL
  )
  UPDATE public.estudantes e 
  SET id_conjuge = p.id_pai,
      estado_civil = 'casado'
  FROM pares p 
  WHERE e.id = p.id_mae 
    AND e.id_conjuge IS NULL;

  -- H) Populate family_links table from new relationship fields
  INSERT INTO public.family_links (user_id, source_id, target_id, relacao)
  SELECT e.user_id, e.id, e.id_pai, 'filho_de' 
  FROM public.estudantes e
  WHERE e.id_pai IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO public.family_links (user_id, source_id, target_id, relacao)
  SELECT e.user_id, e.id, e.id_mae, 'filho_de' 
  FROM public.estudantes e
  WHERE e.id_mae IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO public.family_links (user_id, source_id, target_id, relacao)
  SELECT e.user_id, e.id, e.id_conjuge, 'conjuge' 
  FROM public.estudantes e
  WHERE e.id_conjuge IS NOT NULL
  ON CONFLICT DO NOTHING;

  -- I) Set responsible relationships
  INSERT INTO public.family_links (user_id, source_id, target_id, relacao)
  SELECT e.user_id, e.responsavel_primario, e.id, 'tutor_de' 
  FROM public.estudantes e
  WHERE e.responsavel_primario IS NOT NULL 
    AND e.responsavel_primario != e.id
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Family relationships migration completed successfully';
END;
$$;

-- Execute the migration function
SELECT migrate_family_relationships();

-- Drop the migration function (cleanup)
DROP FUNCTION migrate_family_relationships();

-- ============================================================================
-- PHASE 6: ADD CONSTRAINTS AND VALIDATION
-- ============================================================================

-- Add check constraints for data integrity
ALTER TABLE public.estudantes 
  ADD CONSTRAINT IF NOT EXISTS chk_self_spouse 
  CHECK (id_conjuge IS NULL OR id_conjuge <> id);

ALTER TABLE public.estudantes 
  ADD CONSTRAINT IF NOT EXISTS chk_self_parent_pai 
  CHECK (id_pai IS NULL OR id_pai <> id);

ALTER TABLE public.estudantes 
  ADD CONSTRAINT IF NOT EXISTS chk_self_parent_mae 
  CHECK (id_mae IS NULL OR id_mae <> id);

ALTER TABLE public.estudantes 
  ADD CONSTRAINT IF NOT EXISTS chk_self_responsavel_primario 
  CHECK (responsavel_primario IS NULL OR responsavel_primario <> id);

ALTER TABLE public.estudantes 
  ADD CONSTRAINT IF NOT EXISTS chk_self_responsavel_secundario 
  CHECK (responsavel_secundario IS NULL OR responsavel_secundario <> id);

-- Add constraint for family_links to prevent self-relationships
ALTER TABLE public.family_links 
  ADD CONSTRAINT IF NOT EXISTS chk_family_links_no_self 
  CHECK (source_id <> target_id);

-- ============================================================================
-- PHASE 7: UPDATE RLS POLICIES
-- ============================================================================

-- Enable RLS on family_links table
ALTER TABLE public.family_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for family_links
CREATE POLICY "Users can view their own family links"
  ON public.family_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own family links"
  ON public.family_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family links"
  ON public.family_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family links"
  ON public.family_links FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PHASE 8: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get family members for a student
CREATE OR REPLACE FUNCTION get_family_members(student_id UUID)
RETURNS TABLE (
  id UUID,
  nome VARCHAR,
  genero app_genero,
  idade INTEGER,
  relacao TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.nome,
    e.genero,
    e.idade,
    CASE 
      WHEN e.id = s.id_pai THEN 'Pai'
      WHEN e.id = s.id_mae THEN 'Mãe'
      WHEN e.id = s.id_conjuge THEN 'Cônjuge'
      WHEN s.id = e.id_pai OR s.id = e.id_mae THEN 
        CASE WHEN e.genero = 'masculino' THEN 'Filho' ELSE 'Filha' END
      ELSE 'Familiar'
    END as relacao
  FROM public.estudantes s
  CROSS JOIN public.estudantes e
  WHERE s.id = student_id
    AND s.user_id = e.user_id
    AND (
      e.id IN (s.id_pai, s.id_mae, s.id_conjuge) OR
      s.id IN (e.id_pai, e.id_mae) OR
      EXISTS (
        SELECT 1 FROM public.family_links fl 
        WHERE (fl.source_id = s.id AND fl.target_id = e.id) OR
              (fl.source_id = e.id AND fl.target_id = s.id)
      )
    )
    AND e.id <> s.id;
END;
$$;

-- Function to check if two students can be paired (S-38-T compliance)
CREATE OR REPLACE FUNCTION can_students_be_paired(student1_id UUID, student2_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  s1 RECORD;
  s2 RECORD;
  are_family BOOLEAN := false;
BEGIN
  -- Get student information
  SELECT genero, idade, menor INTO s1 FROM public.estudantes WHERE id = student1_id;
  SELECT genero, idade, menor INTO s2 FROM public.estudantes WHERE id = student2_id;
  
  -- If either student not found, return false
  IF s1 IS NULL OR s2 IS NULL THEN
    RETURN false;
  END IF;
  
  -- Same gender pairs are always allowed
  IF s1.genero = s2.genero THEN
    RETURN true;
  END IF;
  
  -- Different gender pairs require family relationship
  -- Check if they are family members
  SELECT EXISTS (
    SELECT 1 FROM public.estudantes e1, public.estudantes e2
    WHERE e1.id = student1_id AND e2.id = student2_id
    AND (
      e1.id_pai = e2.id OR e1.id_mae = e2.id OR e1.id_conjuge = e2.id OR
      e2.id_pai = e1.id OR e2.id_mae = e1.id OR e2.id_conjuge = e1.id OR
      (e1.id_pai IS NOT NULL AND e1.id_pai = e2.id_pai) OR
      (e1.id_mae IS NOT NULL AND e1.id_mae = e2.id_mae) OR
      EXISTS (
        SELECT 1 FROM public.family_links fl 
        WHERE (fl.source_id = e1.id AND fl.target_id = e2.id) OR
              (fl.source_id = e2.id AND fl.target_id = e1.id)
      )
    )
  ) INTO are_family;
  
  -- For minors, only allow same gender pairs
  IF (s1.menor = true OR s2.menor = true) AND s1.genero <> s2.genero THEN
    RETURN false;
  END IF;
  
  RETURN are_family;
END;
$$;

-- ============================================================================
-- PHASE 9: CREATE COMPATIBILITY VIEW
-- ============================================================================

-- Create view for backward compatibility during transition
CREATE OR REPLACE VIEW public.estudantes_legacy AS
SELECT 
  id, user_id, familia, nome, idade, genero, email, telefone, 
  data_batismo, cargo,
  COALESCE(id_pai, id_mae) as id_pai_mae, -- Legacy compatibility
  ativo, observacoes, created_at, updated_at,
  chairman, pray, tresures, gems, reading, starting, 
  following, making, explaining, talk
FROM public.estudantes;

-- ============================================================================
-- PHASE 10: GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT SELECT ON public.family_links TO authenticated;
GRANT INSERT ON public.family_links TO authenticated;
GRANT UPDATE ON public.family_links TO authenticated;
GRANT DELETE ON public.family_links TO authenticated;

GRANT EXECUTE ON FUNCTION get_family_members(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_students_be_paired(UUID, UUID) TO authenticated;

-- ============================================================================
-- VERIFICATION AND LOGGING
-- ============================================================================

-- Log migration completion
DO $$
DECLARE
  total_students INTEGER;
  students_with_family INTEGER;
  family_links_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_students FROM public.estudantes;
  SELECT COUNT(*) INTO students_with_family 
  FROM public.estudantes 
  WHERE id_pai IS NOT NULL OR id_mae IS NOT NULL OR id_conjuge IS NOT NULL;
  SELECT COUNT(*) INTO family_links_count FROM public.family_links;
  
  RAISE NOTICE 'Enhanced Family Relationships Migration Completed:';
  RAISE NOTICE '- Total students: %', total_students;
  RAISE NOTICE '- Students with family relationships: %', students_with_family;
  RAISE NOTICE '- Family links created: %', family_links_count;
END $$;