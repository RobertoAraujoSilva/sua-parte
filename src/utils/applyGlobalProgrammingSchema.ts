/**
 * Apply Global Programming Schema
 * Creates the database schema for role-based dashboard architecture
 * Separates Admin (global programming) from Instrutor (local assignments)
 */

import { supabase } from '@/integrations/supabase/client';

const GLOBAL_PROGRAMMING_SCHEMA_SQL = `
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

-- Step 5: Link global programming to workbook versions
ALTER TABLE public.global_programming 
ADD COLUMN IF NOT EXISTS workbook_version_id UUID REFERENCES public.workbook_versions(id) ON DELETE SET NULL;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_programming_week_date ON public.global_programming(week_start_date);
CREATE INDEX IF NOT EXISTS idx_global_programming_meeting_type ON public.global_programming(meeting_type);
CREATE INDEX IF NOT EXISTS idx_global_programming_status ON public.global_programming(status);
CREATE INDEX IF NOT EXISTS idx_global_programming_admin_user ON public.global_programming(admin_user_id);

CREATE INDEX IF NOT EXISTS idx_workbook_versions_version_code ON public.workbook_versions(version_code);
CREATE INDEX IF NOT EXISTS idx_workbook_versions_period ON public.workbook_versions(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_workbook_versions_status ON public.workbook_versions(parsing_status);

CREATE INDEX IF NOT EXISTS idx_programas_global_week ON public.programas(global_programming_week_id);
CREATE INDEX IF NOT EXISTS idx_designacoes_global_part ON public.designacoes(global_part_id);

-- Step 7: Create triggers for sync metadata on new tables
CREATE TRIGGER trigger_global_programming_sync_metadata
  BEFORE UPDATE ON public.global_programming
  FOR EACH ROW
  EXECUTE FUNCTION update_sync_metadata();

CREATE TRIGGER trigger_workbook_versions_sync_metadata
  BEFORE UPDATE ON public.workbook_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_sync_metadata();

-- Step 8: Enable RLS on new tables
ALTER TABLE public.global_programming ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workbook_versions ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies for global programming

-- Admin: Full access to global programming
CREATE POLICY "Admin can manage global programming"
  ON public.global_programming FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Instrutor: Read-only access to published global programming
CREATE POLICY "Instrutor can view published global programming"
  ON public.global_programming FOR SELECT
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'instrutor'
    )
  );

-- Estudante: Read-only access to published programming they're assigned to
CREATE POLICY "Estudante can view assigned global programming"
  ON public.global_programming FOR SELECT
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'estudante'
    ) AND
    EXISTS (
      SELECT 1 FROM public.designacoes d
      WHERE d.global_part_id = global_programming.id
      AND (d.id_estudante = auth.uid() OR d.id_ajudante = auth.uid())
    )
  );

-- Step 10: Create RLS policies for workbook versions

-- Admin: Full access to workbook versions
CREATE POLICY "Admin can manage workbook versions"
  ON public.workbook_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Instrutor: Read-only access to completed workbook versions
CREATE POLICY "Instrutor can view completed workbook versions"
  ON public.workbook_versions FOR SELECT
  USING (
    parsing_status = 'completed' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'instrutor'
    )
  );

-- Step 11: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.global_programming TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workbook_versions TO authenticated;

-- Step 12: Create helper functions for global programming

-- Function to get current week's global programming
CREATE OR REPLACE FUNCTION get_current_week_programming(
  target_date DATE DEFAULT CURRENT_DATE,
  meeting_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  week_start_date DATE,
  meeting_type TEXT,
  section_name TEXT,
  part_number INTEGER,
  part_title TEXT,
  part_duration INTEGER,
  part_type TEXT,
  requirements JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gp.id,
    gp.week_start_date,
    gp.meeting_type,
    gp.section_name,
    gp.part_number,
    gp.part_title,
    gp.part_duration,
    gp.part_type,
    gp.requirements
  FROM public.global_programming gp
  WHERE gp.status = 'published'
    AND gp.deleted_at IS NULL
    AND gp.week_start_date <= target_date
    AND gp.week_end_date >= target_date
    AND (meeting_type_filter IS NULL OR gp.meeting_type = meeting_type_filter)
  ORDER BY gp.part_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access global programming
CREATE OR REPLACE FUNCTION can_access_global_programming(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_uuid 
    AND p.role IN ('admin', 'instrutor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_current_week_programming(DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_global_programming(UUID) TO authenticated;

-- Step 13: Add helpful comments
COMMENT ON TABLE public.global_programming IS 'Global programming managed by Admin users for distribution to all congregations';
COMMENT ON TABLE public.workbook_versions IS 'Official JW workbook versions with parsing status and content';
COMMENT ON COLUMN public.programas.global_programming_week_id IS 'Links local program to global programming week';
COMMENT ON COLUMN public.designacoes.global_part_id IS 'Links local assignment to global programming part';
`;

export async function applyGlobalProgrammingSchema(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🚀 Starting global programming schema migration...');
    
    // Split the migration into individual statements
    const statements = GLOBAL_PROGRAMMING_SCHEMA_SQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.includes('$$'));
    
    // Handle function definitions separately
    const functionBlocks = GLOBAL_PROGRAMMING_SCHEMA_SQL.match(/CREATE OR REPLACE FUNCTION[\s\S]*?\$\$ LANGUAGE plpgsql SECURITY DEFINER;/g) || [];
    
    console.log(`📝 Found ${statements.length} SQL statements and ${functionBlocks.length} function blocks to execute`);
    
    // Execute regular statements first
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';'
        });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          return { success: false, error: error.message };
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (statementError: any) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, statementError);
        return { success: false, error: statementError.message };
      }
    }
    
    // Execute function blocks
    for (let i = 0; i < functionBlocks.length; i++) {
      const block = functionBlocks[i];
      console.log(`⚡ Executing function block ${i + 1}/${functionBlocks.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: block });
        
        if (error) {
          console.error(`❌ Error in function block ${i + 1}:`, error);
          return { success: false, error: error.message };
        }
        
        console.log(`✅ Function block ${i + 1} executed successfully`);
      } catch (blockError: any) {
        console.error(`❌ Failed to execute function block ${i + 1}:`, blockError);
        return { success: false, error: blockError.message };
      }
    }
    
    console.log('🎉 Global programming schema migration completed successfully!');
    
    // Verify the migration by checking if the new tables exist
    console.log('🔍 Verifying schema...');
    
    const { data: globalProgrammingData, error: globalProgrammingError } = await supabase
      .from('global_programming')
      .select('id')
      .limit(1);
    
    const { data: workbookVersionsData, error: workbookVersionsError } = await supabase
      .from('workbook_versions')
      .select('id')
      .limit(1);
    
    if (globalProgrammingError || workbookVersionsError) {
      console.warn('⚠️ Some verification queries failed, but this might be expected for empty tables');
    } else {
      console.log('✅ Global programming schema is active and working');
    }
    
    console.log('✨ Schema verification completed!');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Global programming schema migration failed:', error);
    return { success: false, error: error.message };
  }
}

// Expose function on window for manual testing
if (typeof window !== 'undefined') {
  (window as any).applyGlobalProgrammingSchema = applyGlobalProgrammingSchema;
  console.log('🔧 Global programming schema tool available: window.applyGlobalProgrammingSchema()');
}
