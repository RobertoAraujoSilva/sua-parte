-- Add congregation system to allow instructors to manage students from same congregation
-- This allows students to register and be approved by instructors

-- Add congregacao column to estudantes table
ALTER TABLE public.estudantes 
  ADD COLUMN IF NOT EXISTS congregacao VARCHAR(100),
  ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status_aprovacao VARCHAR(20) DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado'));

-- Create index for congregation-based queries
CREATE INDEX IF NOT EXISTS idx_estudantes_congregacao ON public.estudantes(congregacao);
CREATE INDEX IF NOT EXISTS idx_estudantes_status_aprovacao ON public.estudantes(status_aprovacao);
CREATE INDEX IF NOT EXISTS idx_estudantes_aprovado_por ON public.estudantes(aprovado_por);

-- Update existing records to set congregacao from user metadata
UPDATE public.estudantes e
SET congregacao = (
  SELECT raw_user_meta_data->>'congregacao'
  FROM auth.users u 
  WHERE u.id = e.user_id
)
WHERE congregacao IS NULL;

-- Create function to get instructor's congregation
CREATE OR REPLACE FUNCTION get_user_congregacao(user_uuid UUID)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_congregacao VARCHAR(100);
BEGIN
  SELECT raw_user_meta_data->>'congregacao' 
  INTO user_congregacao
  FROM auth.users 
  WHERE id = user_uuid;
  
  RETURN user_congregacao;
END;
$$;

-- Update RLS policies to include congregation-based access
DROP POLICY IF EXISTS "Users can view their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can create their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can update their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can delete their own students" ON public.estudantes;

-- New RLS policies for congregation-based access
CREATE POLICY "Users can view students from same congregation"
  ON public.estudantes FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (congregacao = get_user_congregacao(auth.uid()) AND congregacao IS NOT NULL)
  );

CREATE POLICY "Users can create their own students"
  ON public.estudantes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update students from same congregation"
  ON public.estudantes FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    (congregacao = get_user_congregacao(auth.uid()) AND congregacao IS NOT NULL)
  );

CREATE POLICY "Users can delete their own students"
  ON public.estudantes FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to approve student
CREATE OR REPLACE FUNCTION approve_student(student_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  instructor_role VARCHAR(20);
  student_congregacao VARCHAR(100);
  instructor_congregacao VARCHAR(100);
BEGIN
  -- Check if user is instructor
  SELECT raw_user_meta_data->>'role' 
  INTO instructor_role
  FROM auth.users 
  WHERE id = auth.uid();
  
  IF instructor_role != 'instrutor' THEN
    RETURN FALSE;
  END IF;
  
  -- Get student and instructor congregations
  SELECT congregacao INTO student_congregacao
  FROM public.estudantes 
  WHERE id = student_id;
  
  SELECT raw_user_meta_data->>'congregacao' 
  INTO instructor_congregacao
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- Check if same congregation
  IF student_congregacao != instructor_congregacao THEN
    RETURN FALSE;
  END IF;
  
  -- Approve student
  UPDATE public.estudantes 
  SET 
    status_aprovacao = 'aprovado',
    aprovado_por = auth.uid(),
    data_aprovacao = NOW()
  WHERE id = student_id;
  
  RETURN TRUE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_congregacao(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_student(UUID) TO authenticated;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Congregation system migration completed successfully';
END $$;