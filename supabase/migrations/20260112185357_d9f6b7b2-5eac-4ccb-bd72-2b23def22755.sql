-- ============================================
-- MIGRAÇÃO: Expandir tabela estudantes para modelo S-38
-- ============================================

-- 1. Criar ENUMs para novos campos
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_civil_type') THEN
    CREATE TYPE estado_civil_type AS ENUM ('solteiro', 'casado', 'divorciado', 'viuvo', 'separado');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'papel_familiar_type') THEN
    CREATE TYPE papel_familiar_type AS ENUM ('pai', 'mae', 'filho', 'filha', 'avo', 'avo_f', 'tio', 'tia', 'sobrinho', 'sobrinha', 'primo', 'prima', 'outro');
  END IF;
END $$;

-- 2. Adicionar campos de família à tabela estudantes
ALTER TABLE public.estudantes 
ADD COLUMN IF NOT EXISTS familia TEXT,
ADD COLUMN IF NOT EXISTS family_id UUID,
ADD COLUMN IF NOT EXISTS estado_civil estado_civil_type,
ADD COLUMN IF NOT EXISTS papel_familiar papel_familiar_type,
ADD COLUMN IF NOT EXISTS id_mae UUID REFERENCES public.estudantes(id),
ADD COLUMN IF NOT EXISTS id_conjuge UUID REFERENCES public.estudantes(id),
ADD COLUMN IF NOT EXISTS coabitacao BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS menor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS responsavel_primario UUID REFERENCES public.estudantes(id),
ADD COLUMN IF NOT EXISTS responsavel_secundario UUID REFERENCES public.estudantes(id),
ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- 3. Adicionar campos de qualificações S-38 (colunas separadas para melhor performance)
ALTER TABLE public.estudantes 
ADD COLUMN IF NOT EXISTS q_chairman BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS q_pray BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS q_treasures BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS q_gems BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS q_reading BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS q_starting BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS q_following BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS q_making BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS q_explaining BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS q_talk BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS q_living BOOLEAN DEFAULT false;

-- 4. Criar índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_estudantes_familia ON public.estudantes(familia);
CREATE INDEX IF NOT EXISTS idx_estudantes_family_id ON public.estudantes(family_id);
CREATE INDEX IF NOT EXISTS idx_estudantes_menor ON public.estudantes(menor);
CREATE INDEX IF NOT EXISTS idx_estudantes_genero ON public.estudantes(genero);
CREATE INDEX IF NOT EXISTS idx_estudantes_cargo ON public.estudantes(cargo);
CREATE INDEX IF NOT EXISTS idx_estudantes_ativo ON public.estudantes(ativo);

-- 5. Migrar dados existentes do id_pai_mae para id_pai ou id_mae baseado em inferência
UPDATE public.estudantes 
SET id_mae = id_pai_mae 
WHERE id_pai_mae IS NOT NULL 
  AND (SELECT genero FROM public.estudantes p WHERE p.id = estudantes.id_pai_mae) = 'feminino';

-- 6. Criar função para verificar se estudante pode receber parte baseado nas regras S-38
CREATE OR REPLACE FUNCTION public.can_receive_part(
  p_student_id UUID,
  p_part_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student RECORD;
BEGIN
  SELECT * INTO v_student FROM estudantes WHERE id = p_student_id;
  
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF v_student.ativo = FALSE THEN RETURN FALSE; END IF;
  
  CASE p_part_type
    WHEN 'chairman' THEN
      RETURN v_student.genero = 'masculino' 
             AND v_student.cargo IN ('anciao', 'servo_ministerial')
             AND v_student.q_chairman = TRUE;
    WHEN 'pray' THEN
      RETURN v_student.genero = 'masculino' 
             AND v_student.q_pray = TRUE;
    WHEN 'treasures' THEN
      RETURN v_student.genero = 'masculino' 
             AND v_student.cargo IN ('anciao', 'servo_ministerial')
             AND v_student.q_treasures = TRUE;
    WHEN 'gems' THEN
      RETURN v_student.genero = 'masculino' 
             AND v_student.cargo IN ('anciao', 'servo_ministerial')
             AND v_student.q_gems = TRUE;
    WHEN 'reading' THEN
      RETURN v_student.genero = 'masculino' 
             AND v_student.q_reading = TRUE;
    WHEN 'starting', 'following', 'making' THEN
      RETURN (p_part_type = 'starting' AND v_student.q_starting = TRUE)
             OR (p_part_type = 'following' AND v_student.q_following = TRUE)
             OR (p_part_type = 'making' AND v_student.q_making = TRUE);
    WHEN 'explaining' THEN
      RETURN v_student.q_explaining = TRUE;
    WHEN 'talk' THEN
      RETURN v_student.genero = 'masculino' 
             AND v_student.q_talk = TRUE;
    WHEN 'living' THEN
      RETURN v_student.genero = 'masculino' 
             AND v_student.cargo IN ('anciao', 'servo_ministerial')
             AND v_student.q_living = TRUE;
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;

-- 7. Criar função para verificar se dois estudantes podem formar par (mesmo gênero ou familiares)
CREATE OR REPLACE FUNCTION public.can_form_pair(
  p_student1_id UUID,
  p_student2_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student1 RECORD;
  v_student2 RECORD;
  v_is_family BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_student1 FROM estudantes WHERE id = p_student1_id;
  SELECT * INTO v_student2 FROM estudantes WHERE id = p_student2_id;
  
  IF NOT FOUND THEN 
    RETURN jsonb_build_object('can_pair', FALSE, 'reason', 'Estudante não encontrado');
  END IF;
  
  -- Verificar se são da mesma família
  IF v_student1.family_id IS NOT NULL AND v_student1.family_id = v_student2.family_id THEN
    v_is_family := TRUE;
  END IF;
  
  -- Verificar relações parentais
  IF v_student1.id_pai_mae = v_student2.id 
     OR v_student2.id_pai_mae = v_student1.id
     OR v_student1.id_mae = v_student2.id
     OR v_student2.id_mae = v_student1.id
     OR v_student1.id_conjuge = v_student2.id THEN
    v_is_family := TRUE;
  END IF;
  
  -- Familiares podem fazer par independente do gênero
  IF v_is_family THEN
    RETURN jsonb_build_object('can_pair', TRUE, 'reason', 'Familiares', 'is_family', TRUE);
  END IF;
  
  -- Não familiares: mesmo gênero obrigatório
  IF v_student1.genero = v_student2.genero THEN
    RETURN jsonb_build_object('can_pair', TRUE, 'reason', 'Mesmo gênero', 'is_family', FALSE);
  END IF;
  
  RETURN jsonb_build_object('can_pair', FALSE, 'reason', 'Gêneros diferentes e não são familiares', 'is_family', FALSE);
END;
$$;

-- 8. Auto-preencher campo menor baseado na idade
UPDATE public.estudantes SET menor = (idade < 18) WHERE menor IS NULL;

-- 9. Auto-preencher qualificações baseado no cargo existente
UPDATE public.estudantes 
SET 
  q_pray = (genero = 'masculino'),
  q_reading = (genero = 'masculino'),
  q_starting = TRUE,
  q_following = TRUE,
  q_making = TRUE,
  q_explaining = TRUE,
  q_talk = (genero = 'masculino'),
  q_treasures = (cargo IN ('anciao', 'servo_ministerial')),
  q_gems = (cargo IN ('anciao', 'servo_ministerial')),
  q_chairman = (cargo = 'anciao'),
  q_living = (cargo IN ('anciao', 'servo_ministerial'))
WHERE q_reading IS NULL OR q_reading = FALSE;