-- Criar funções RPC necessárias para o Sistema Ministerial
-- Execute este script no Supabase SQL Editor

-- 1. Função para buscar programas completos
CREATE OR REPLACE FUNCTION public.get_programs_complete(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  data_inicio_semana DATE,
  mes_apostila TEXT,
  semana TEXT,
  arquivo TEXT,
  partes JSONB,
  status status_programa,
  assignment_status TEXT,
  assignments_generated_at TIMESTAMPTZ,
  total_assignments_generated INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
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
$$;

-- 2. Função para verificar duplicatas de programas
CREATE OR REPLACE FUNCTION public.check_programa_duplicate(
  p_user_id UUID,
  p_mes_apostila TEXT,
  p_data_inicio_semana DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duplicate_exists BOOLEAN := FALSE;
BEGIN
  -- Verificar se já existe um programa para o mesmo mês ou semana
  SELECT EXISTS(
    SELECT 1 FROM public.programas 
    WHERE user_id = p_user_id 
    AND (
      (p_mes_apostila IS NOT NULL AND mes_apostila = p_mes_apostila)
      OR 
      (p_data_inicio_semana IS NOT NULL AND data_inicio_semana = p_data_inicio_semana)
    )
  ) INTO duplicate_exists;
  
  RETURN duplicate_exists;
END;
$$;

-- 3. Função para verificar duplicatas de estudantes
CREATE OR REPLACE FUNCTION public.check_student_duplicate(
  p_user_id UUID,
  p_nome TEXT,
  p_email TEXT,
  p_telefone TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duplicate_exists BOOLEAN := FALSE;
BEGIN
  -- Verificar se já existe um estudante com o mesmo nome, email ou telefone
  SELECT EXISTS(
    SELECT 1 FROM public.estudantes 
    WHERE user_id = p_user_id 
    AND (
      (p_nome IS NOT NULL AND nome = p_nome)
      OR 
      (p_email IS NOT NULL AND email = p_email)
      OR 
      (p_telefone IS NOT NULL AND telefone = p_telefone)
    )
  ) INTO duplicate_exists;
  
  RETURN duplicate_exists;
END;
$$;

-- 4. Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_programs_complete(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_programa_duplicate(UUID, TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_student_duplicate(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- 5. Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_programs_complete',
  'check_programa_duplicate', 
  'check_student_duplicate'
)
ORDER BY routine_name;
