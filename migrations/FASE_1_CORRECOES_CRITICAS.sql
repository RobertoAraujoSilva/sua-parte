-- =====================================================================
-- FASE 1: CORREÇÕES CRÍTICAS - Sistema Ministerial
-- =====================================================================
-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nwpuurgwnnuejqinkvrh/sql/new
-- =====================================================================

-- =====================================================================
-- TAREFA 1.1: CRIAR TABELA CONGREGACOES
-- =====================================================================

-- Criar tabela congregacoes
CREATE TABLE IF NOT EXISTS public.congregacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_congregacoes_nome ON public.congregacoes(nome);
CREATE INDEX IF NOT EXISTS idx_congregacoes_ativa ON public.congregacoes(ativa);

-- Popular congregações
INSERT INTO public.congregacoes (nome, ativa)
VALUES 
  ('Exemplar', true), 
  ('Compensa', true)
ON CONFLICT (nome) DO NOTHING;

-- Enable RLS
ALTER TABLE public.congregacoes ENABLE ROW LEVEL SECURITY;

-- RLS Policy
DROP POLICY IF EXISTS "Authenticated users can view active congregations" ON public.congregacoes;
CREATE POLICY "Authenticated users can view active congregations"
ON public.congregacoes FOR SELECT
TO authenticated
USING (ativa = true);

-- Adicionar congregacao_id nas tabelas existentes
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id);

ALTER TABLE public.estudantes 
ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id);

ALTER TABLE public.designacoes
ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id);

-- Popular congregacao_id
UPDATE public.profiles p
SET congregacao_id = c.id
FROM public.congregacoes c
WHERE p.congregacao = c.nome
AND p.congregacao_id IS NULL;

UPDATE public.estudantes e
SET congregacao_id = p.congregacao_id
FROM public.profiles p
WHERE e.user_id = p.id
AND e.congregacao_id IS NULL;

UPDATE public.designacoes d
SET congregacao_id = p.congregacao_id
FROM public.profiles p
WHERE d.user_id = p.id
AND d.congregacao_id IS NULL;

GRANT ALL ON public.congregacoes TO authenticated;

-- =====================================================================
-- TAREFA 1.2: MIGRAR ROLES PARA USER_ROLES
-- =====================================================================

-- Criar enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'instrutor', 'estudante', 'family_member');
  END IF;
END $$;

-- Criar tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Migrar dados
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar função has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- =====================================================================
-- ATUALIZAR RLS POLICIES
-- =====================================================================

-- Profiles
DROP POLICY IF EXISTS "Admin can do everything on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;

CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admin can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Estudantes
DROP POLICY IF EXISTS "Instructors can read estudantes" ON public.estudantes;
DROP POLICY IF EXISTS "Users can view their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can view students from their congregation" ON public.estudantes;
DROP POLICY IF EXISTS "Instructors and admins can insert students" ON public.estudantes;
DROP POLICY IF EXISTS "Instructors and admins can update students" ON public.estudantes;
DROP POLICY IF EXISTS "Instructors and admins can delete students" ON public.estudantes;

CREATE POLICY "Users can view students from their congregation"
ON public.estudantes FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  congregacao_id IN (
    SELECT congregacao_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Instructors and admins can insert students"
ON public.estudantes FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'instrutor'::app_role)
);

CREATE POLICY "Instructors and admins can update students"
ON public.estudantes FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  (public.has_role(auth.uid(), 'instrutor'::app_role) AND congregacao_id IN (
    SELECT congregacao_id FROM public.profiles WHERE id = auth.uid()
  ))
);

CREATE POLICY "Instructors and admins can delete students"
ON public.estudantes FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  (public.has_role(auth.uid(), 'instrutor'::app_role) AND congregacao_id IN (
    SELECT congregacao_id FROM public.profiles WHERE id = auth.uid()
  ))
);

-- Programas
DROP POLICY IF EXISTS "Admin can do everything on programas" ON public.programas;
DROP POLICY IF EXISTS "Instructors can read programas" ON public.programas;
DROP POLICY IF EXISTS "Users can view programs from their congregation" ON public.programas;
DROP POLICY IF EXISTS "Instructors and admins can insert programs" ON public.programas;
DROP POLICY IF EXISTS "Instructors and admins can update programs" ON public.programas;
DROP POLICY IF EXISTS "Instructors and admins can delete programs" ON public.programas;

CREATE POLICY "Users can view programs from their congregation"
ON public.programas FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  user_id = auth.uid()
);

CREATE POLICY "Instructors and admins can insert programs"
ON public.programas FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'instrutor'::app_role)
);

CREATE POLICY "Instructors and admins can update programs"
ON public.programas FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  user_id = auth.uid()
);

CREATE POLICY "Instructors and admins can delete programs"
ON public.programas FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  user_id = auth.uid()
);

-- Designacoes
DROP POLICY IF EXISTS "Users can view their own assignments" ON public.designacoes;
DROP POLICY IF EXISTS "Users can create their own assignments" ON public.designacoes;
DROP POLICY IF EXISTS "Users can update their own assignments" ON public.designacoes;
DROP POLICY IF EXISTS "Users can delete their own assignments" ON public.designacoes;
DROP POLICY IF EXISTS "Users can view assignments from their congregation" ON public.designacoes;
DROP POLICY IF EXISTS "Instructors and admins can insert assignments" ON public.designacoes;
DROP POLICY IF EXISTS "Instructors and admins can update assignments" ON public.designacoes;
DROP POLICY IF EXISTS "Instructors and admins can delete assignments" ON public.designacoes;

CREATE POLICY "Users can view assignments from their congregation"
ON public.designacoes FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  user_id = auth.uid() OR
  id_estudante IN (
    SELECT id FROM public.estudantes WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Instructors and admins can insert assignments"
ON public.designacoes FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'instrutor'::app_role)
);

CREATE POLICY "Instructors and admins can update assignments"
ON public.designacoes FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  user_id = auth.uid()
);

CREATE POLICY "Instructors and admins can delete assignments"
ON public.designacoes FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  user_id = auth.uid()
);

GRANT ALL ON public.user_roles TO authenticated;

-- =====================================================================
-- TAREFA 1.3: DEBUGGING PARA PROGRAMAS FAILED
-- =====================================================================

ALTER TABLE public.programas 
ADD COLUMN IF NOT EXISTS error_details JSONB;

ALTER TABLE public.programas
ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_programas_failed ON public.programas(assignment_status) 
WHERE assignment_status = 'failed';

CREATE OR REPLACE FUNCTION public.reset_failed_program(program_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.programas
  SET 
    assignment_status = 'pending',
    error_details = NULL,
    last_attempt_at = now()
  WHERE id = program_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_failed_program(uuid) TO authenticated;

-- Limpar notificações antigas
UPDATE public.notifications
SET status = 'sent', updated_at = now()
WHERE status = 'pending' 
AND created_at < now() - INTERVAL '7 days';

-- =====================================================================
-- VERIFICAÇÃO
-- =====================================================================

-- Verificar congregações
SELECT 'Congregações criadas:' as status, count(*) as total FROM public.congregacoes;

-- Verificar user_roles
SELECT 'Roles migradas:' as status, count(*) as total FROM public.user_roles;

-- Verificar função has_role
SELECT 'Função has_role:' as status, 
  CASE WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN 'Funcionando' ELSE 'OK' END as result;

-- Ver programas failed
SELECT id, titulo, assignment_status, error_details 
FROM public.programas 
WHERE assignment_status = 'failed';

-- =====================================================================
-- FIM - Migration completa!
-- =====================================================================