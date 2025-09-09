-- Correção final da função RPC get_programs_complete
-- Execute este script no Supabase SQL Editor

-- Recriar a função com a estrutura correta da tabela
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

-- Verificar se a função foi criada
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_programs_complete';

-- Testar a função (substitua o UUID por um usuário real)
SELECT * FROM public.get_programs_complete(
  (SELECT id FROM auth.users LIMIT 1)
) LIMIT 1;
