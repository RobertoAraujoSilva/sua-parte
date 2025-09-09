-- Database Migration Script for Sistema Ministerial
-- Based on estudantes_enriquecido.xlsx structure analysis
-- This script safely migrates the existing database to the new enhanced schema

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

-- ============================================================================
-- PHASE 3: CREATE FAMILY_LINKS TABLE
-- ============================================================================

-- Create flexible family relationships table
CREATE TABLE IF NOT EXISTS public.family_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Add indexes for family_links table
CREATE INDEX IF NOT EXISTS idx_family_links_source ON public.family_links(source_id);
CREATE INDEX IF NOT EXISTS idx_family_links_target ON public.family_links(target_id);
CREATE INDEX IF NOT EXISTS idx_family_links_relacao ON public.family_links(relacao);

-- ============================================================================
-- PHASE 5: DATA MIGRATION AND BACKFILL
-- ============================================================================

BEGIN;

-- A) Migrate existing id_pai_mae to new id_pai/id_mae fields based on gender
UPDATE public.estudantes e 
SET id_pai = p.id 
FROM public.estudantes p 
WHERE e.id_pai IS NULL 
  AND e.id_pai_mae = p.id 
  AND LOWER(p.genero) = 'masculino';

UPDATE public.estudantes e 
SET id_mae = m.id 
FROM public.estudantes m 
WHERE e.id_mae IS NULL 
  AND e.id_pai_mae = m.id 
  AND LOWER(m.genero) = 'feminino';

-- B) Set menor field based on age
UPDATE public.estudantes 
SET menor = CASE 
  WHEN idade IS NOT NULL AND idade < 18 THEN true 
  ELSE false 
END 
WHERE menor IS NULL;

-- C) Estimate birth date from age (for existing records)
UPDATE public.estudantes 
SET data_nascimento_estimada = DATE(CONCAT(EXTRACT(YEAR FROM NOW()) - idade, '-06-15'))
WHERE data_nascimento_estimada IS NULL 
  AND idade IS NOT NULL;

-- D) Assign papel_familiar based on age and family structure
-- Set adults (≥25) as potential parents
UPDATE public.estudantes 
SET papel_familiar = CASE 
  WHEN LOWER(genero) = 'masculino' AND idade >= 25 THEN 'pai'
  WHEN LOWER(genero) = 'feminino' AND idade >= 25 THEN 'mae'
  WHEN idade < 18 THEN CASE 
    WHEN LOWER(genero) = 'masculino' THEN 'filho'
    ELSE 'filha'
  END
  ELSE CASE 
    WHEN LOWER(genero) = 'masculino' THEN 'filho_adulto'
    ELSE 'filha_adulta'
  END
END
WHERE papel_familiar IS NULL;

-- E) Set responsible parties for minors
UPDATE public.estudantes 
SET responsavel_primario = COALESCE(id_pai, id_mae),
    responsavel_secundario = CASE 
      WHEN id_pai IS NOT NULL THEN id_mae 
      ELSE NULL 
    END
WHERE menor = true 
  AND responsavel_primario IS NULL;

-- F) Infer spouse relationships where both parents exist for same family
WITH pares AS (
  SELECT DISTINCT c.id_pai, c.id_mae
  FROM public.estudantes c
  WHERE c.id_pai IS NOT NULL AND c.id_mae IS NOT NULL
)
UPDATE public.estudantes e 
SET id_conjuge = p.id_mae 
FROM pares p 
WHERE e.id = p.id_pai 
  AND e.id_conjuge IS NULL;

WITH pares AS (
  SELECT DISTINCT c.id_pai, c.id_mae
  FROM public.estudantes c
  WHERE c.id_pai IS NOT NULL AND c.id_mae IS NOT NULL
)
UPDATE public.estudantes e 
SET id_conjuge = p.id_pai 
FROM pares p 
WHERE e.id = p.id_mae 
  AND e.id_conjuge IS NULL;

-- G) Populate family_links table from new relationship fields
INSERT INTO public.family_links (source_id, target_id, relacao)
SELECT id, id_pai, 'filho_de' 
FROM public.estudantes 
WHERE id_pai IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.family_links (source_id, target_id, relacao)
SELECT id, id_mae, 'filho_de' 
FROM public.estudantes 
WHERE id_mae IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.family_links (source_id, target_id, relacao)
SELECT id, id_conjuge, 'conjuge' 
FROM public.estudantes 
WHERE id_conjuge IS NOT NULL
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================================================
-- PHASE 6: ADD CONSTRAINTS AND VALIDATION
-- ============================================================================

-- Add check constraints for data integrity
ALTER TABLE public.estudantes 
  ADD CONSTRAINT IF NOT EXISTS chk_self_spouse 
  CHECK (id_conjuge IS NULL OR id_conjuge <> id);

ALTER TABLE public.estudantes 
  ADD CONSTRAINT IF NOT EXISTS chk_self_parent 
  CHECK (id_pai IS NULL OR id_pai <> id);

ALTER TABLE public.estudantes 
  ADD CONSTRAINT IF NOT EXISTS chk_self_parent_mae 
  CHECK (id_mae IS NULL OR id_mae <> id);

-- Add constraint for reading qualification (S-38-T rule: only males can read Bible)
ALTER TABLE public.estudantes 
  ADD CONSTRAINT IF NOT EXISTS chk_reading_gender 
  CHECK (reading = false OR LOWER(genero) = 'masculino');

-- ============================================================================
-- PHASE 7: CREATE COMPATIBILITY VIEW (OPTIONAL)
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
-- PHASE 8: UPDATE RLS POLICIES (IF NEEDED)
-- ============================================================================

-- Update RLS policies to include new fields (adjust as needed for your security model)
-- Example: Allow users to see family relationships
-- ALTER POLICY "Users can view own students" ON public.estudantes
-- USING (user_id = auth.uid());

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify migration success
-- SELECT 
--   COUNT(*) as total_students,
--   COUNT(id_pai) as students_with_father,
--   COUNT(id_mae) as students_with_mother,
--   COUNT(id_conjuge) as students_with_spouse,
--   COUNT(CASE WHEN menor = true THEN 1 END) as minors,
--   COUNT(CASE WHEN papel_familiar IS NOT NULL THEN 1 END) as with_family_role
-- FROM public.estudantes;

-- Verify family_links population
-- SELECT relacao, COUNT(*) as count
-- FROM public.family_links
-- GROUP BY relacao;

-- ============================================================================
-- ROLLBACK SCRIPT (EMERGENCY USE ONLY)
-- ============================================================================

-- UNCOMMENT ONLY IF ROLLBACK IS NEEDED
-- DROP VIEW IF EXISTS public.estudantes_legacy;
-- DROP TABLE IF EXISTS public.family_links;
-- ALTER TABLE public.estudantes 
--   DROP COLUMN IF EXISTS data_nascimento_estimada,
--   DROP COLUMN IF EXISTS estado_civil,
--   DROP COLUMN IF EXISTS papel_familiar,
--   DROP COLUMN IF EXISTS id_pai,
--   DROP COLUMN IF EXISTS id_mae,
--   DROP COLUMN IF EXISTS id_conjuge,
--   DROP COLUMN IF EXISTS coabitacao,
--   DROP COLUMN IF EXISTS menor,
--   DROP COLUMN IF EXISTS responsavel_primario,
--   DROP COLUMN IF EXISTS responsavel_secundario;
-- DROP TYPE IF EXISTS estado_civil;
-- DROP TYPE IF EXISTS papel_familiar;
-- DROP TYPE IF EXISTS relacao_familiar;