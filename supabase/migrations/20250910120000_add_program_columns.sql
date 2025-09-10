-- Add missing columns to programas table for ProgramManager functionality
-- Migration: 20250910120000_add_program_columns

-- Add missing columns
ALTER TABLE public.programas 
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS week INTEGER,
ADD COLUMN IF NOT EXISTS theme VARCHAR(255),
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Update existing records where possible
-- For date, use data_inicio_semana if available
UPDATE public.programas 
SET date = data_inicio_semana 
WHERE date IS NULL AND data_inicio_semana IS NOT NULL;

-- For theme, use a default value or extract from existing data
UPDATE public.programas 
SET theme = COALESCE(mes_apostila, 'Programa da Semana')
WHERE theme IS NULL;

-- For published_at, use created_at if available
UPDATE public.programas 
SET published_at = created_at
WHERE published_at IS NULL AND created_at IS NOT NULL;

-- Add NOT NULL constraints where appropriate
ALTER TABLE public.programas 
ALTER COLUMN date SET NOT NULL;

-- Add check constraints
ALTER TABLE public.programas 
ADD CONSTRAINT IF NOT EXISTS check_week_valid 
CHECK (week IS NULL OR (week >= 1 AND week <= 53));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_programas_date ON public.programas(date);
CREATE INDEX IF NOT EXISTS idx_programas_week ON public.programas(week);
CREATE INDEX IF NOT EXISTS idx_programas_published_at ON public.programas(published_at);

-- Update existing unique constraints to include date
-- First, drop existing constraints if they exist
ALTER TABLE public.programas 
DROP CONSTRAINT IF EXISTS unique_programa_per_user_date;

-- Add new constraint
ALTER TABLE public.programas 
ADD CONSTRAINT IF NOT EXISTS unique_programa_per_user_date 
UNIQUE (user_id, date);

-- Add comments for documentation
COMMENT ON COLUMN public.programas.date IS 'The specific date for which the program is scheduled';
COMMENT ON COLUMN public.programas.week IS 'Week number within the year (1-53)';
COMMENT ON COLUMN public.programas.theme IS 'Theme or title of the program';
COMMENT ON COLUMN public.programas.published_at IS 'Timestamp when the program was published';

-- Grant necessary permissions
GRANT SELECT ON public.programas TO authenticated;
GRANT INSERT ON public.programas TO authenticated;
GRANT UPDATE ON public.programas TO authenticated;
GRANT DELETE ON public.programas TO authenticated;

-- Verify the schema is correct
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'programas' 
    AND table_schema = 'public'
    AND column_name IN ('date', 'week', 'theme', 'published_at');
    
    IF column_count = 4 THEN
        RAISE NOTICE 'All required columns added successfully to programas table';
    ELSE
        RAISE WARNING 'Not all required columns were added. Expected 4, found %', column_count;
    END IF;
END $$;
