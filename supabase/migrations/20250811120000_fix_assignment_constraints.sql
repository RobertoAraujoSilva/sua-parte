-- Fix Assignment Algorithm Database Constraints
-- This migration addresses critical issues preventing assignment generation

-- ISSUE 1: Update designacoes table constraint to support full JW meeting structure (parts 1-12)
-- Current constraint only allows parts 3-7, but new algorithm generates parts 1-12

-- Drop the old constraint
ALTER TABLE public.designacoes 
DROP CONSTRAINT IF EXISTS designacoes_numero_parte_check;

-- Add new constraint to support complete meeting structure (parts 1-12)
ALTER TABLE public.designacoes 
ADD CONSTRAINT designacoes_numero_parte_check 
CHECK (numero_parte BETWEEN 1 AND 12);

-- ISSUE 2: Ensure family_members table exists and has proper RLS policies
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_estudante ON public.family_members(id_estudante);
CREATE INDEX IF NOT EXISTS idx_family_members_familiar ON public.family_members(id_familiar);

-- ISSUE 3: Add titulo_parte column to designacoes if it doesn't exist
-- This is needed for the new assignment structure
ALTER TABLE public.designacoes 
ADD COLUMN IF NOT EXISTS titulo_parte VARCHAR(100);

-- Update existing records to have proper titles if they don't have them
UPDATE public.designacoes 
SET titulo_parte = CASE 
  WHEN numero_parte = 3 THEN 'Leitura da Bíblia'
  WHEN numero_parte = 4 THEN 'Primeira Conversa'
  WHEN numero_parte = 5 THEN 'Revisita'
  WHEN numero_parte = 6 THEN 'Estudo Bíblico'
  WHEN numero_parte = 7 THEN 'Discurso'
  ELSE 'Parte ' || numero_parte::text
END
WHERE titulo_parte IS NULL;

-- ISSUE 4: Add validation for new assignment types
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

-- ISSUE 5: Performance optimization - add missing indexes
CREATE INDEX IF NOT EXISTS idx_designacoes_user_id ON public.designacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_designacoes_programa ON public.designacoes(id_programa);
CREATE INDEX IF NOT EXISTS idx_designacoes_estudante ON public.designacoes(id_estudante);
CREATE INDEX IF NOT EXISTS idx_designacoes_numero_parte ON public.designacoes(numero_parte);
CREATE INDEX IF NOT EXISTS idx_designacoes_tipo_parte ON public.designacoes(tipo_parte);

-- Add comment for documentation
COMMENT ON TABLE public.designacoes IS 'Stores assignment data for JW meeting parts 1-12 with complete meeting structure support';
COMMENT ON COLUMN public.designacoes.numero_parte IS 'Meeting part number (1-12): 1-2=Opening, 3-5=Treasures, 6-8=Ministry, 9-10=Christian Life, 11-12=Closing';
COMMENT ON COLUMN public.designacoes.tipo_parte IS 'Assignment type following S-38-T guidelines with expanded types for complete meeting structure';
