-- Add assignment status tracking to programs table
-- This migration adds fields to track assignment generation status

-- Add new columns to programas table
ALTER TABLE public.programas 
ADD COLUMN IF NOT EXISTS assignment_status TEXT DEFAULT 'pending' CHECK (assignment_status IN ('pending', 'generating', 'generated', 'failed')),
ADD COLUMN IF NOT EXISTS assignments_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS assignment_generation_error TEXT,
ADD COLUMN IF NOT EXISTS total_assignments_generated INTEGER DEFAULT 0;

-- Add index for assignment status queries
CREATE INDEX IF NOT EXISTS idx_programas_assignment_status ON public.programas(assignment_status);
CREATE INDEX IF NOT EXISTS idx_programas_assignments_generated_at ON public.programas(assignments_generated_at);

-- Update existing programs to have proper assignment status
UPDATE public.programas 
SET assignment_status = 'pending' 
WHERE assignment_status IS NULL;

-- Add comment to document the new fields
COMMENT ON COLUMN public.programas.assignment_status IS 'Status of assignment generation: pending, generating, generated, failed';
COMMENT ON COLUMN public.programas.assignments_generated_at IS 'Timestamp when assignments were successfully generated';
COMMENT ON COLUMN public.programas.assignment_generation_error IS 'Error message if assignment generation failed';
COMMENT ON COLUMN public.programas.total_assignments_generated IS 'Number of assignments generated for this program';

-- Create function to update assignment status
CREATE OR REPLACE FUNCTION update_program_assignment_status(
  program_id UUID,
  new_status TEXT,
  error_message TEXT DEFAULT NULL,
  assignments_count INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.programas 
  SET 
    assignment_status = new_status,
    assignments_generated_at = CASE 
      WHEN new_status = 'generated' THEN NOW() 
      ELSE assignments_generated_at 
    END,
    assignment_generation_error = error_message,
    total_assignments_generated = COALESCE(assignments_count, total_assignments_generated),
    updated_at = NOW()
  WHERE id = program_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_program_assignment_status TO authenticated;

-- Create function to get programs with assignment statistics
CREATE OR REPLACE FUNCTION get_programs_with_assignment_stats(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  data_inicio_semana DATE,
  mes_apostila VARCHAR(20),
  partes JSONB,
  status status_programa,
  assignment_status TEXT,
  assignments_generated_at TIMESTAMPTZ,
  total_assignments_generated INTEGER,
  assignment_count BIGINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.data_inicio_semana,
    p.mes_apostila,
    p.partes,
    p.status,
    p.assignment_status,
    p.assignments_generated_at,
    p.total_assignments_generated,
    COALESCE(d.assignment_count, 0) as assignment_count,
    p.created_at,
    p.updated_at
  FROM public.programas p
  LEFT JOIN (
    SELECT 
      id_programa,
      COUNT(*) as assignment_count
    FROM public.designacoes
    WHERE user_id = user_uuid
    GROUP BY id_programa
  ) d ON p.id = d.id_programa
  WHERE p.user_id = user_uuid
  ORDER BY p.data_inicio_semana DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_programs_with_assignment_stats TO authenticated;

-- Create trigger to automatically update program status when assignments are created
CREATE OR REPLACE FUNCTION trigger_update_program_assignment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When assignments are inserted, update the program status
  IF TG_OP = 'INSERT' THEN
    UPDATE public.programas 
    SET 
      assignment_status = 'generated',
      assignments_generated_at = NOW(),
      total_assignments_generated = (
        SELECT COUNT(*) 
        FROM public.designacoes 
        WHERE id_programa = NEW.id_programa
      ),
      updated_at = NOW()
    WHERE id = NEW.id_programa;
    
    RETURN NEW;
  END IF;
  
  -- When assignments are deleted, check if we need to update status
  IF TG_OP = 'DELETE' THEN
    DECLARE
      remaining_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO remaining_count
      FROM public.designacoes 
      WHERE id_programa = OLD.id_programa;
      
      IF remaining_count = 0 THEN
        UPDATE public.programas 
        SET 
          assignment_status = 'pending',
          assignments_generated_at = NULL,
          total_assignments_generated = 0,
          updated_at = NOW()
        WHERE id = OLD.id_programa;
      ELSE
        UPDATE public.programas 
        SET 
          total_assignments_generated = remaining_count,
          updated_at = NOW()
        WHERE id = OLD.id_programa;
      END IF;
    END;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_program_assignment_status ON public.designacoes;
CREATE TRIGGER trigger_program_assignment_status
  AFTER INSERT OR DELETE ON public.designacoes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_program_assignment_status();

-- Add RLS policies for the new functions
CREATE POLICY "Users can call assignment status functions" ON public.programas
  FOR ALL USING (auth.uid() = user_id);

-- Update existing RLS policies to include new columns
-- (The existing policies should already cover the new columns since they use SELECT/UPDATE permissions)
