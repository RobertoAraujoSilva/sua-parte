-- Migration: 20250118000000_create_missing_tables.sql
-- Create missing tables: workbook_versions, global_programming, and ensure congregacoes exists

-- =====================================================
-- GLOBAL PROGRAMMING SYSTEM - DATABASE SCHEMA
-- Admin manages global programming, Instrutor manages local assignments
-- =====================================================

-- Step 1: Create global programming table (Admin-managed)
CREATE TABLE IF NOT EXISTS public.global_programming (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Week identification
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  week_number INTEGER NOT NULL, -- 1-52
  
  -- Meeting information
  meeting_type TEXT NOT NULL CHECK (meeting_type IN ('midweek', 'weekend')),
  section_name TEXT NOT NULL CHECK (section_name IN ('opening', 'treasures', 'ministry', 'christian_life', 'closing')),
  
  -- Part details
  part_number INTEGER NOT NULL CHECK (part_number BETWEEN 1 AND 12),
  part_title TEXT NOT NULL,
  part_duration INTEGER NOT NULL, -- minutes
  part_type TEXT NOT NULL,
  
  -- Source and content
  source_material TEXT, -- workbook reference (e.g., "mwb_E_202507.pdf")
  content_references JSONB, -- Bible references, page numbers, etc.
  requirements JSONB, -- S-38 requirements (gender, experience level, etc.)
  
  -- Administrative metadata
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Sync metadata (from MCP-05.1)
  revision BIGINT NOT NULL DEFAULT 0,
  last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure unique parts per week
  UNIQUE(week_start_date, meeting_type, part_number)
);

-- Step 2: Add global programming reference to existing programas table
ALTER TABLE public.programas 
ADD COLUMN IF NOT EXISTS global_programming_week_id UUID,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_source TEXT CHECK (template_source IN ('admin_global', 'local_custom', 'imported'));

-- Step 3: Add global programming reference to existing designacoes table
ALTER TABLE public.designacoes 
ADD COLUMN IF NOT EXISTS global_part_id UUID REFERENCES public.global_programming(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assignment_source TEXT DEFAULT 'local' CHECK (assignment_source IN ('global_template', 'local_custom'));

-- Step 4: Create workbook versions table for tracking official JW materials
CREATE TABLE IF NOT EXISTS public.workbook_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Version identification
  version_code TEXT NOT NULL UNIQUE, -- e.g., "mwb_E_202507"
  title TEXT NOT NULL, -- e.g., "Our Christian Life and Ministry Meeting Workbook July 2025"
  language_code TEXT NOT NULL DEFAULT 'pt-BR',
  
  -- Date range
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- File information
  original_filename TEXT,
  file_url TEXT,
  file_size_bytes BIGINT,
  
  -- Processing status
  parsing_status TEXT DEFAULT 'pending' CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed')),
  parsing_error TEXT,
  parsed_content JSONB,
  
  -- Administrative metadata
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Sync metadata
  revision BIGINT NOT NULL DEFAULT 0,
  last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 5: Ensure congregacoes table exists (in case it was missed)
CREATE TABLE IF NOT EXISTS public.congregacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  pais VARCHAR(100) NOT NULL DEFAULT 'Brasil',
  cidade VARCHAR(100),
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Add congregacao_id to estudantes if not exists
ALTER TABLE public.estudantes 
ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id);

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_programming_week_date ON public.global_programming(week_start_date);
CREATE INDEX IF NOT EXISTS idx_global_programming_meeting_type ON public.global_programming(meeting_type);
CREATE INDEX IF NOT EXISTS idx_global_programming_status ON public.global_programming(status);
CREATE INDEX IF NOT EXISTS idx_global_programming_admin_user ON public.global_programming(admin_user_id);

CREATE INDEX IF NOT EXISTS idx_programas_global_week ON public.programas(global_programming_week_id);
CREATE INDEX IF NOT EXISTS idx_designacoes_global_part ON public.designacoes(global_part_id);

CREATE INDEX IF NOT EXISTS idx_workbook_versions_version_code ON public.workbook_versions(version_code);
CREATE INDEX IF NOT EXISTS idx_workbook_versions_period ON public.workbook_versions(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_workbook_versions_status ON public.workbook_versions(parsing_status);

CREATE INDEX IF NOT EXISTS idx_congregacoes_nome ON public.congregacoes(nome);
CREATE INDEX IF NOT EXISTS idx_congregacoes_ativa ON public.congregacoes(ativa);
CREATE INDEX IF NOT EXISTS idx_estudantes_congregacao_id ON public.estudantes(congregacao_id);

-- Step 8: Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_global_programming_sync_metadata
BEFORE UPDATE ON public.global_programming
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_workbook_versions_sync_metadata
BEFORE UPDATE ON public.workbook_versions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_congregacoes_updated_at 
BEFORE UPDATE ON public.congregacoes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Enable RLS on all tables
ALTER TABLE public.global_programming ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workbook_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.congregacoes ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS policies for global_programming
CREATE POLICY "Admin can manage global programming" 
ON public.global_programming FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Instrutor can view published global programming" 
ON public.global_programming FOR SELECT
USING (
  status = 'published' OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Users can view published global programming" 
ON public.global_programming FOR SELECT
USING (status = 'published');

-- Step 11: Create RLS policies for workbook_versions
CREATE POLICY "Admin can manage workbook versions" 
ON public.workbook_versions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Users can view workbook versions" 
ON public.workbook_versions FOR SELECT
USING (true);

-- Step 12: Create RLS policies for congregacoes
CREATE POLICY "Users can view congregacoes" 
ON public.congregacoes FOR SELECT
USING (true);

CREATE POLICY "Instructors can manage their congregation" 
ON public.congregacoes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'instrutor'
    AND profiles.congregacao = congregacoes.nome
  )
);

-- Step 13: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.global_programming TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workbook_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.congregacoes TO authenticated;

-- Step 14: Insert sample congregacoes if they don't exist
INSERT INTO public.congregacoes (nome, pais, cidade) VALUES 
('Market Harborough', 'Reino Unido', 'Market Harborough'),
('compensa', 'Brasil', 'Manaus')
ON CONFLICT (nome) DO NOTHING;

-- Step 15: Add comments for documentation
COMMENT ON TABLE public.global_programming IS 'Global programming managed by Admin users for distribution to all congregations';
COMMENT ON TABLE public.workbook_versions IS 'Official JW workbook versions with parsing status and content';
COMMENT ON TABLE public.congregacoes IS 'Congregations managed by instructors';
COMMENT ON COLUMN public.programas.global_programming_week_id IS 'Links local program to global programming week';
COMMENT ON COLUMN public.designacoes.global_part_id IS 'Links local assignment to global programming part';
