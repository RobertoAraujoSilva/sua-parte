-- Corrigir função RPC get_programs_complete
-- Execute este script no Supabase SQL Editor

-- Recriar a função com a sintaxe correta
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
    programas.id,
    programas.user_id,
    programas.data_inicio_semana,
    programas.mes_apostila,
    programas.semana,
    programas.arquivo,
    programas.partes,
    programas.status,
    programas.assignment_status,
    programas.assignments_generated_at,
    programas.total_assignments_generated,
    programas.created_at,
    programas.updated_at
  FROM public.programas
  WHERE programas.user_id = user_uuid
  ORDER BY programas.data_inicio_semana DESC;
END;
$$;

-- Verificar se a função foi corrigida
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_programs_complete';

-- Testar a função com um usuário existente
-- (substitua o UUID por um usuário real do seu sistema)
SELECT * FROM public.get_programs_complete(
  (SELECT id FROM auth.users LIMIT 1)
) LIMIT 1;
