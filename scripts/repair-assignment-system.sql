-- CRITICAL REPAIR SCRIPT FOR ASSIGNMENT GENERATION SYSTEM
-- This script fixes the database constraints and RLS policies that prevent assignment generation
-- Run this script in your Supabase SQL editor or via migration

-- =============================================================================
-- ISSUE 1: Fix designacoes table constraint (CRITICAL)
-- =============================================================================

-- Current constraint only allows parts 3-7, but new algorithm generates parts 1-12
-- This causes: "new row for relation "designacoes" violates check constraint"

-- Drop the old constraint
ALTER TABLE public.designacoes 
DROP CONSTRAINT IF EXISTS designacoes_numero_parte_check;

-- Add new constraint to support complete meeting structure (parts 1-12)
ALTER TABLE public.designacoes 
ADD CONSTRAINT designacoes_numero_parte_check 
CHECK (numero_parte BETWEEN 1 AND 12);

-- =============================================================================
-- ISSUE 2: Fix tipo_parte constraint for new assignment types
-- =============================================================================

-- Update tipo_parte column to support new assignment types
ALTER TABLE public.designacoes 
DROP CONSTRAINT IF EXISTS designacoes_tipo_parte_check;

ALTER TABLE public.designacoes 
ADD CONSTRAINT designacoes_tipo_parte_check 
CHECK (tipo_parte IN (
  'leitura_biblica',
  'discurso', 
  'demonstracao',
  'oracao_abertura',
  'comentarios_iniciais',
  'tesouros_palavra',
  'joias_espirituais',
  'parte_ministerio',
  'vida_crista',
  'estudo_biblico_congregacao',
  'oracao_encerramento',
  'comentarios_finais'
));

-- =============================================================================
-- ISSUE 3: Add missing titulo_parte column
-- =============================================================================

-- Add titulo_parte column if it doesn't exist
ALTER TABLE public.designacoes 
ADD COLUMN IF NOT EXISTS titulo_parte VARCHAR(100);

-- =============================================================================
-- ISSUE 4: Fix family_members table and RLS policies (406 errors)
-- =============================================================================

-- Create family_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  id_estudante UUID REFERENCES public.estudantes(id) ON DELETE CASCADE NOT NULL,
  id_familiar UUID REFERENCES public.estudantes(id) ON DELETE CASCADE NOT NULL,
  relacionamento VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Prevent self-referencing relationships
  CONSTRAINT family_members_no_self_reference CHECK (id_estudante != id_familiar),
  
  -- Ensure unique relationships (prevent duplicates)
  CONSTRAINT family_members_unique_relationship UNIQUE (user_id, id_estudante, id_familiar)
);

-- Enable RLS on family_members table
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own family relationships" ON public.family_members;
DROP POLICY IF EXISTS "Users can create their own family relationships" ON public.family_members;
DROP POLICY IF EXISTS "Users can update their own family relationships" ON public.family_members;
DROP POLICY IF EXISTS "Users can delete their own family relationships" ON public.family_members;

-- Create comprehensive RLS policies for family_members
CREATE POLICY "Users can view their own family relationships"
  ON public.family_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own family relationships"
  ON public.family_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family relationships"
  ON public.family_members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family relationships"
  ON public.family_members FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- ISSUE 5: Performance optimization indexes
-- =============================================================================

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_estudante ON public.family_members(id_estudante);
CREATE INDEX IF NOT EXISTS idx_family_members_familiar ON public.family_members(id_familiar);

CREATE INDEX IF NOT EXISTS idx_designacoes_user_id ON public.designacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_designacoes_programa ON public.designacoes(id_programa);
CREATE INDEX IF NOT EXISTS idx_designacoes_estudante ON public.designacoes(id_estudante);
CREATE INDEX IF NOT EXISTS idx_designacoes_numero_parte ON public.designacoes(numero_parte);
CREATE INDEX IF NOT EXISTS idx_designacoes_tipo_parte ON public.designacoes(tipo_parte);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify the constraints are properly set
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.designacoes'::regclass 
  AND conname LIKE '%numero_parte%' OR conname LIKE '%tipo_parte%';

-- Verify family_members table exists and has proper structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'family_members'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'family_members';
