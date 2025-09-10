-- Add 'date' column to the 'programas' table
ALTER TABLE public.programas
ADD COLUMN IF NOT EXISTS date DATE;

-- Update existing records to populate the new 'date' column
-- Assuming 'data_inicio_semana' can be used to derive the date
UPDATE public.programas
SET date = data_inicio_semana
WHERE date IS NULL AND data_inicio_semana IS NOT NULL;

-- Make the 'date' column NOT NULL after populating existing data
ALTER TABLE public.programas
ALTER COLUMN date SET NOT NULL;

-- Add a unique constraint to prevent duplicate programs for the same user on the same date
ALTER TABLE public.programas
ADD CONSTRAINT unique_programa_per_user_date
UNIQUE (user_id, date);

-- Add comment for documentation
COMMENT ON COLUMN public.programas.date IS 'The specific date for which the program is scheduled.';

-- Log migration completion
INSERT INTO public.audit_overrides (user_id, action, table_name, details, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- System user ID
  'migration_applied',
  'programas',
  '{"migration": "20250910110000_add_date_to_programas", "status": "completed", "description": "Added date column to programas table"}',
  NOW()
);