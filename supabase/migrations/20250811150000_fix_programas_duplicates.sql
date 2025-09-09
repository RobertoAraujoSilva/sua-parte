-- =====================================================
-- Sistema Ministerial - Fix Programas Duplicates
-- Migration to prevent duplicate program entries
-- =====================================================

-- ISSUE: Multiple programs with same mes_apostila for same user
-- SOLUTION: Add unique constraint and clean up existing duplicates

-- Step 1: Clean up existing duplicates (keep the most recent one)
-- First, identify duplicates
WITH duplicate_programs AS (
  SELECT 
    user_id,
    mes_apostila,
    COUNT(*) as count,
    MIN(created_at) as first_created,
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

-- Step 2: Add unique constraint to prevent future duplicates
-- This ensures each user can only have one program per mes_apostila
ALTER TABLE public.programas 
ADD CONSTRAINT unique_programa_per_user_month 
UNIQUE (user_id, mes_apostila);

-- Step 3: Add missing fields that are expected by the frontend
-- Add semana field if it doesn't exist
ALTER TABLE public.programas 
ADD COLUMN IF NOT EXISTS semana VARCHAR(100);

-- Add arquivo field if it doesn't exist (for PDF file names)
ALTER TABLE public.programas 
ADD COLUMN IF NOT EXISTS arquivo VARCHAR(255);

-- Step 4: Update existing records to have proper semana values
-- Generate semana from mes_apostila or data_inicio_semana
UPDATE public.programas 
SET semana = COALESCE(
  mes_apostila,
  'Semana de ' || TO_CHAR(data_inicio_semana, 'DD/MM/YYYY')
)
WHERE semana IS NULL;

-- Step 5: Update existing records to have proper arquivo values
-- Generate arquivo names based on data_inicio_semana
UPDATE public.programas 
SET arquivo = 'programa-' || data_inicio_semana || '.pdf'
WHERE arquivo IS NULL;

-- Step 6: Create function to validate programa data before insert/update
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

-- Step 7: Create trigger to validate data on insert/update
DROP TRIGGER IF EXISTS trigger_validate_programa_data ON public.programas;
CREATE TRIGGER trigger_validate_programa_data
  BEFORE INSERT OR UPDATE ON public.programas
  FOR EACH ROW
  EXECUTE FUNCTION validate_programa_data();

-- Step 8: Create index for better performance on duplicate checking
CREATE INDEX IF NOT EXISTS idx_programas_user_mes_apostila 
ON public.programas(user_id, mes_apostila);

-- Step 9: Add helpful function to check for duplicates before insert
CREATE OR REPLACE FUNCTION check_programa_duplicate(
  p_user_id UUID,
  p_mes_apostila VARCHAR(20)
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.programas 
    WHERE user_id = p_user_id 
    AND mes_apostila = p_mes_apostila
  );
END;
$$ LANGUAGE plpgsql;

-- Step 10: Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_programa_duplicate(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_programa_data() TO authenticated;

-- Step 11: Add comments for documentation
COMMENT ON CONSTRAINT unique_programa_per_user_month ON public.programas 
IS 'Prevents duplicate programs for the same user and month';

COMMENT ON FUNCTION check_programa_duplicate(UUID, VARCHAR) 
IS 'Helper function to check if a program already exists for a user and month';

COMMENT ON FUNCTION validate_programa_data() 
IS 'Validates and auto-generates programa data before insert/update';

-- Step 12: Create view for program statistics
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

-- Grant access to the view
GRANT SELECT ON programa_stats TO authenticated;

-- Add RLS policy for the view
CREATE POLICY "Users can view their own program stats"
  ON programa_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Enable RLS on the view
ALTER VIEW programa_stats ENABLE ROW LEVEL SECURITY;
