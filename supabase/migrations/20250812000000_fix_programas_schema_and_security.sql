-- =====================================================
-- Sistema Ministerial - Fix Programas Schema and Security
-- Migration to fix missing columns, prevent duplicates, and improve security
-- =====================================================

-- Step 1: Add missing columns to programas table
ALTER TABLE public.programas 
ADD COLUMN IF NOT EXISTS semana VARCHAR(100),
ADD COLUMN IF NOT EXISTS arquivo VARCHAR(255);

-- Step 2: Update existing records to have proper semana values
UPDATE public.programas 
SET semana = COALESCE(
  mes_apostila,
  'Semana de ' || TO_CHAR(data_inicio_semana, 'DD/MM/YYYY')
)
WHERE semana IS NULL;

-- Step 3: Update existing records to have proper arquivo values
UPDATE public.programas 
SET arquivo = 'programa-' || data_inicio_semana || '.pdf'
WHERE arquivo IS NULL;

-- Step 4: Add unique constraints to prevent duplicates
-- First, clean up any existing duplicates (keep the most recent one)
WITH duplicate_programs AS (
  SELECT 
    user_id,
    mes_apostila,
    COUNT(*) as count,
    MAX(created_at) as last_created
  FROM public.programas 
  WHERE mes_apostila IS NOT NULL
  GROUP BY user_id, mes_apostila
  HAVING COUNT(*) > 1
),
programs_to_delete AS (
  SELECT p.id
  FROM public.programas p
  INNER JOIN duplicate_programs dp ON 
    p.user_id = dp.user_id 
    AND p.mes_apostila = dp.mes_apostila
    AND p.created_at < dp.last_created
)
DELETE FROM public.programas 
WHERE id IN (SELECT id FROM programs_to_delete);

-- Step 5: Add unique constraint to prevent future duplicates
ALTER TABLE public.programas 
ADD CONSTRAINT IF NOT EXISTS unique_programa_per_user_month 
UNIQUE (user_id, mes_apostila);

-- Step 6: Add unique constraint for data_inicio_semana per user
ALTER TABLE public.programas 
ADD CONSTRAINT IF NOT EXISTS unique_programa_per_user_week 
UNIQUE (user_id, data_inicio_semana);

-- Step 7: Add unique constraints to estudantes table to prevent duplicates
-- First, clean up any existing duplicates (keep the most recent one)
WITH duplicate_students AS (
  SELECT 
    user_id,
    nome,
    COUNT(*) as count,
    MAX(created_at) as last_created
  FROM public.estudantes 
  WHERE nome IS NOT NULL
  GROUP BY user_id, nome
  HAVING COUNT(*) > 1
),
students_to_delete AS (
  SELECT e.id
  FROM public.estudantes e
  INNER JOIN duplicate_students ds ON 
    e.user_id = ds.user_id 
    AND e.nome = ds.nome
    AND e.created_at < ds.last_created
)
DELETE FROM public.estudantes 
WHERE id IN (SELECT id FROM students_to_delete);

-- Step 8: Add unique constraints for estudantes
ALTER TABLE public.estudantes 
ADD CONSTRAINT IF NOT EXISTS unique_student_name_per_user 
UNIQUE (user_id, nome);

-- Step 9: Add unique constraint for email per user (if email exists)
ALTER TABLE public.estudantes 
ADD CONSTRAINT IF NOT EXISTS unique_student_email_per_user 
UNIQUE (user_id, email)
WHERE email IS NOT NULL;

-- Step 10: Add unique constraint for telefone per user (if telefone exists)
ALTER TABLE public.estudantes 
ADD CONSTRAINT IF NOT EXISTS unique_student_phone_per_user 
UNIQUE (user_id, telefone)
WHERE telefone IS NOT NULL;

-- Step 11: Create family_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.estudantes(id) ON DELETE CASCADE NOT NULL,
  related_student_id UUID REFERENCES public.estudantes(id) ON DELETE CASCADE NOT NULL,
  relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('pai', 'mae', 'filho', 'filha', 'irmao', 'irma', 'conjuge')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 12: Enable RLS on family_members
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Step 13: Create RLS policies for family_members
DROP POLICY IF EXISTS "Users can view their own family members" ON public.family_members;
CREATE POLICY "Users can view their own family members"
  ON public.family_members FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own family members" ON public.family_members;
CREATE POLICY "Users can create their own family members"
  ON public.family_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own family members" ON public.family_members;
CREATE POLICY "Users can update their own family members"
  ON public.family_members FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own family members" ON public.family_members;
CREATE POLICY "Users can delete their own family members"
  ON public.family_members FOR DELETE
  USING (auth.uid() = user_id);

-- Step 14: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_student_id ON public.family_members(student_id);
CREATE INDEX IF NOT EXISTS idx_family_members_related_student_id ON public.family_members(related_student_id);
CREATE INDEX IF NOT EXISTS idx_family_members_relationship_type ON public.family_members(relationship_type);

-- Step 15: Create function to validate programa data before insert/update
CREATE OR REPLACE FUNCTION validate_programa_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure mes_apostila is not null or empty
  IF NEW.mes_apostila IS NULL OR TRIM(NEW.mes_apostila) = '' THEN
    RAISE EXCEPTION 'mes_apostila cannot be null or empty';
  END IF;
  
  -- Ensure data_inicio_semana is not null
  IF NEW.data_inicio_semana IS NULL THEN
    RAISE EXCEPTION 'data_inicio_semana cannot be null';
  END IF;
  
  -- Auto-generate semana if not provided
  IF NEW.semana IS NULL OR TRIM(NEW.semana) = '' THEN
    NEW.semana := COALESCE(NEW.mes_apostila, 'Semana de ' || TO_CHAR(NEW.data_inicio_semana, 'DD/MM/YYYY'));
  END IF;
  
  -- Auto-generate arquivo if not provided
  IF NEW.arquivo IS NULL OR TRIM(NEW.arquivo) = '' THEN
    NEW.arquivo := 'programa-' || NEW.data_inicio_semana || '.pdf';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 16: Create trigger to validate data on insert/update
DROP TRIGGER IF EXISTS trigger_validate_programa_data ON public.programas;
CREATE TRIGGER trigger_validate_programa_data
  BEFORE INSERT OR UPDATE ON public.programas
  FOR EACH ROW
  EXECUTE FUNCTION validate_programa_data();

-- Step 17: Create function to check for programa duplicates before insert
CREATE OR REPLACE FUNCTION check_programa_duplicate(
  p_user_id UUID,
  p_mes_apostila VARCHAR(20),
  p_data_inicio_semana DATE
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.programas 
    WHERE user_id = p_user_id 
    AND (mes_apostila = p_mes_apostila OR data_inicio_semana = p_data_inicio_semana)
  );
END;
$$ LANGUAGE plpgsql;

-- Step 18: Create function to check for student duplicates before insert
CREATE OR REPLACE FUNCTION check_student_duplicate(
  p_user_id UUID,
  p_nome VARCHAR(100),
  p_email VARCHAR(255) DEFAULT NULL,
  p_telefone VARCHAR(20) DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.estudantes 
    WHERE user_id = p_user_id 
    AND (
      nome = p_nome 
      OR (p_email IS NOT NULL AND email = p_email)
      OR (p_telefone IS NOT NULL AND telefone = p_telefone)
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Step 19: Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_programa_duplicate(UUID, VARCHAR, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION check_student_duplicate(UUID, VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_programa_data() TO authenticated;

-- Step 20: Add comments for documentation
COMMENT ON CONSTRAINT unique_programa_per_user_month ON public.programas 
IS 'Prevents duplicate programs for the same user and month';

COMMENT ON CONSTRAINT unique_programa_per_user_week ON public.programas 
IS 'Prevents duplicate programs for the same user and week';

COMMENT ON CONSTRAINT unique_student_name_per_user ON public.estudantes 
IS 'Prevents duplicate student names for the same user';

COMMENT ON CONSTRAINT unique_student_email_per_user ON public.estudantes 
IS 'Prevents duplicate student emails for the same user';

COMMENT ON CONSTRAINT unique_student_phone_per_user ON public.estudantes 
IS 'Prevents duplicate student phone numbers for the same user';

COMMENT ON FUNCTION check_programa_duplicate(UUID, VARCHAR, DATE) 
IS 'Helper function to check if a program already exists for a user and month/week';

COMMENT ON FUNCTION check_student_duplicate(UUID, VARCHAR, VARCHAR, VARCHAR) 
IS 'Helper function to check if a student already exists for a user by name, email, or phone';

COMMENT ON FUNCTION validate_programa_data() 
IS 'Validates and auto-generates programa data before insert/update';

-- Step 21: Create view for program statistics
CREATE OR REPLACE VIEW programa_stats AS
SELECT 
  user_id,
  COUNT(*) as total_programs,
  COUNT(CASE WHEN assignment_status = 'generated' THEN 1 END) as programs_with_assignments,
  COUNT(CASE WHEN assignment_status = 'pending' THEN 1 END) as pending_programs,
  MIN(data_inicio_semana) as first_program_date,
  MAX(data_inicio_semana) as last_program_date
FROM public.programas
GROUP BY user_id;

-- Step 22: Grant access to the view
GRANT SELECT ON programa_stats TO authenticated;

-- Step 23: Add RLS policy for the view
DROP POLICY IF EXISTS "Users can view their own program stats" ON programa_stats;
CREATE POLICY "Users can view their own program stats"
  ON programa_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Step 24: Enable RLS on the view
ALTER VIEW programa_stats ENABLE ROW LEVEL SECURITY;

-- Step 25: Create function to safely link family relationships
CREATE OR REPLACE FUNCTION link_family_relationship(
  p_user_id UUID,
  p_student_id UUID,
  p_related_student_id UUID,
  p_relationship_type VARCHAR(50)
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if both students belong to the same user
  IF NOT EXISTS (
    SELECT 1 FROM public.estudantes 
    WHERE id IN (p_student_id, p_related_student_id) 
    AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Students must belong to the same user';
  END IF;
  
  -- Check if relationship already exists
  IF EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE user_id = p_user_id 
    AND student_id = p_student_id 
    AND related_student_id = p_related_student_id
  ) THEN
    RETURN false; -- Relationship already exists
  END IF;
  
  -- Insert the relationship
  INSERT INTO public.family_members (user_id, student_id, related_student_id, relationship_type)
  VALUES (p_user_id, p_student_id, p_related_student_id, p_relationship_type);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 26: Grant execute permission
GRANT EXECUTE ON FUNCTION link_family_relationship(UUID, UUID, UUID, VARCHAR) TO authenticated;

-- Step 27: Add comments
COMMENT ON FUNCTION link_family_relationship(UUID, UUID, UUID, VARCHAR) 
IS 'Safely links two students in a family relationship, ensuring they belong to the same user';

-- Step 28: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_programas_user_id ON public.programas(user_id);
CREATE INDEX IF NOT EXISTS idx_programas_mes_apostila ON public.programas(mes_apostila);
CREATE INDEX IF NOT EXISTS idx_programas_data_inicio_semana ON public.programas(data_inicio_semana);
CREATE INDEX IF NOT EXISTS idx_programas_status ON public.programas(status);

-- Step 29: Add NOT NULL constraints where appropriate
ALTER TABLE public.programas 
ALTER COLUMN semana SET NOT NULL,
ALTER COLUMN arquivo SET NOT NULL;

-- Step 30: Add check constraints for data validation
ALTER TABLE public.programas 
ADD CONSTRAINT IF NOT EXISTS check_semana_not_empty 
CHECK (TRIM(semana) != '');

ALTER TABLE public.programas 
ADD CONSTRAINT IF NOT EXISTS check_arquivo_not_empty 
CHECK (TRIM(arquivo) != '');

-- Step 31: Create function to get programs with all required fields
CREATE OR REPLACE FUNCTION get_programs_complete(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  data_inicio_semana DATE,
  mes_apostila VARCHAR(20),
  semana VARCHAR(100),
  arquivo VARCHAR(255),
  partes JSONB,
  status status_programa,
  assignment_status TEXT,
  assignments_generated_at TIMESTAMPTZ,
  total_assignments_generated INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.data_inicio_semana,
    p.mes_apostila,
    p.semana,
    p.arquivo,
    p.partes,
    p.status,
    p.assignment_status,
    p.assignments_generated_at,
    p.total_assignments_generated,
    p.created_at,
    p.updated_at
  FROM public.programas p
  WHERE p.user_id = user_uuid
  ORDER BY p.data_inicio_semana DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 32: Grant execute permission
GRANT EXECUTE ON FUNCTION get_programs_complete(UUID) TO authenticated;

-- Step 33: Add final comments
COMMENT ON FUNCTION get_programs_complete(UUID) 
IS 'Returns complete program information for a user, including all required fields';

-- Migration complete
-- This migration fixes:
-- 1. Missing semana and arquivo columns in programas table
-- 2. Duplicate prevention with unique constraints
-- 3. Family members table with proper RLS policies
-- 4. Performance optimization with indexes
-- 5. Data validation with check constraints
-- 6. Helper functions for duplicate checking
-- 7. Security improvements for family relationships
