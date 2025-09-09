-- Fix Programas Schema - Sistema Ministerial
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar colunas faltantes
ALTER TABLE public.programas 
ADD COLUMN IF NOT EXISTS semana VARCHAR(100),
ADD COLUMN IF NOT EXISTS arquivo VARCHAR(255);

-- 2. Atualizar registros existentes com valores padrão
UPDATE public.programas 
SET semana = COALESCE(
  mes_apostila,
  'Semana de ' || TO_CHAR(data_inicio_semana, 'DD/MM/YYYY')
)
WHERE semana IS NULL;

UPDATE public.programas 
SET arquivo = 'programa-' || data_inicio_semana || '.pdf'
WHERE arquivo IS NULL;

-- 3. Adicionar constraints NOT NULL
ALTER TABLE public.programas 
ALTER COLUMN semana SET NOT NULL,
ALTER COLUMN arquivo SET NOT NULL;

-- 4. Verificar resultado
SELECT 
  id,
  data_inicio_semana,
  mes_apostila,
  semana,
  arquivo,
  created_at
FROM public.programas 
ORDER BY created_at DESC 
LIMIT 10;
