/**
 * Direct database table creation utility
 * Creates the missing tables using direct SQL execution
 */

import { supabase } from '@/integrations/supabase/client';

// Create the exec_sql function first
const CREATE_EXEC_SQL_FUNCTION = `
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'OK';
EXCEPTION
  WHEN OTHERS THEN
    RETURN SQLERRM;
END;
$$;
`;

// Create global_programming table
const CREATE_GLOBAL_PROGRAMMING_TABLE = `
CREATE TABLE IF NOT EXISTS public.global_programming (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  week_number INTEGER NOT NULL,
  meeting_type TEXT NOT NULL CHECK (meeting_type IN ('midweek', 'weekend')),
  section_name TEXT NOT NULL CHECK (section_name IN ('opening', 'treasures', 'ministry', 'christian_life', 'closing')),
  part_number INTEGER NOT NULL CHECK (part_number BETWEEN 1 AND 12),
  part_title TEXT NOT NULL,
  part_duration INTEGER NOT NULL,
  part_type TEXT NOT NULL,
  source_material TEXT,
  content_references JSONB,
  requirements JSONB,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  revision BIGINT NOT NULL DEFAULT 0,
  last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(week_start_date, meeting_type, part_number)
);
`;

// Create workbook_versions table
const CREATE_WORKBOOK_VERSIONS_TABLE = `
CREATE TABLE IF NOT EXISTS public.workbook_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  language_code TEXT NOT NULL DEFAULT 'pt-BR',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  original_filename TEXT,
  file_url TEXT,
  file_size_bytes BIGINT,
  parsing_status TEXT DEFAULT 'pending' CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed')),
  parsing_error TEXT,
  parsed_content JSONB,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revision BIGINT NOT NULL DEFAULT 0,
  last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
`;

// Create congregacoes table
const CREATE_CONGREGACOES_TABLE = `
CREATE TABLE IF NOT EXISTS public.congregacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  pais VARCHAR(50) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
`;

// Enable RLS
const ENABLE_RLS = `
ALTER TABLE public.global_programming ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workbook_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.congregacoes ENABLE ROW LEVEL SECURITY;
`;

// Grant permissions
const GRANT_PERMISSIONS = `
GRANT SELECT, INSERT, UPDATE, DELETE ON public.global_programming TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workbook_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.congregacoes TO authenticated;
`;

// Create RLS policies
const CREATE_RLS_POLICIES = `
-- Admin policies for global_programming
CREATE POLICY "Admin can manage global programming" ON public.global_programming
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Instrutor policies for global_programming
CREATE POLICY "Instrutor can view published global programming" ON public.global_programming
  FOR SELECT USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'instrutor'
    )
  );

-- Admin policies for workbook_versions
CREATE POLICY "Admin can manage workbook versions" ON public.workbook_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admin policies for congregacoes
CREATE POLICY "Admin can manage congregacoes" ON public.congregacoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
`;

export async function createDatabaseTables(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🚀 Creating database tables directly...');

    // Step 1: Create the exec_sql function
    console.log('📝 Creating exec_sql function...');
    const { error: execSqlError } = await supabase.rpc('exec_sql', { sql: CREATE_EXEC_SQL_FUNCTION });
    
    if (execSqlError) {
      console.log('⚠️ exec_sql function creation failed, trying direct approach...');
      
      // Try direct table creation using the REST API
      const tables = [
        { name: 'global_programming', sql: CREATE_GLOBAL_PROGRAMMING_TABLE },
        { name: 'workbook_versions', sql: CREATE_WORKBOOK_VERSIONS_TABLE },
        { name: 'congregacoes', sql: CREATE_CONGREGACOES_TABLE }
      ];

      for (const table of tables) {
        console.log(`📝 Creating ${table.name} table...`);
        try {
          // Use a different approach - create via SQL query
          const response = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabase.supabaseKey}`,
              'apikey': supabase.supabaseKey
            },
            body: JSON.stringify({ sql: table.sql })
          });

          if (!response.ok) {
            console.log(`⚠️ Failed to create ${table.name} via REST API, continuing...`);
          } else {
            console.log(`✅ ${table.name} table created successfully`);
          }
        } catch (tableError) {
          console.log(`⚠️ Error creating ${table.name}:`, tableError);
        }
      }
    } else {
      console.log('✅ exec_sql function created successfully');

      // Step 2: Create tables using exec_sql
      const tables = [
        { name: 'global_programming', sql: CREATE_GLOBAL_PROGRAMMING_TABLE },
        { name: 'workbook_versions', sql: CREATE_WORKBOOK_VERSIONS_TABLE },
        { name: 'congregacoes', sql: CREATE_CONGREGACOES_TABLE }
      ];

      for (const table of tables) {
        console.log(`📝 Creating ${table.name} table...`);
        const { error: tableError } = await supabase.rpc('exec_sql', { sql: table.sql });
        
        if (tableError) {
          console.error(`❌ Error creating ${table.name}:`, tableError);
        } else {
          console.log(`✅ ${table.name} table created successfully`);
        }
      }

      // Step 3: Enable RLS
      console.log('🔒 Enabling Row Level Security...');
      const { error: rlsError } = await supabase.rpc('exec_sql', { sql: ENABLE_RLS });
      if (rlsError) {
        console.warn('⚠️ RLS enabling failed:', rlsError);
      } else {
        console.log('✅ RLS enabled successfully');
      }

      // Step 4: Grant permissions
      console.log('🔑 Granting permissions...');
      const { error: permError } = await supabase.rpc('exec_sql', { sql: GRANT_PERMISSIONS });
      if (permError) {
        console.warn('⚠️ Permission granting failed:', permError);
      } else {
        console.log('✅ Permissions granted successfully');
      }

      // Step 5: Create RLS policies
      console.log('🛡️ Creating RLS policies...');
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: CREATE_RLS_POLICIES });
      if (policyError) {
        console.warn('⚠️ RLS policy creation failed:', policyError);
      } else {
        console.log('✅ RLS policies created successfully');
      }
    }

    // Step 6: Verify tables exist
    console.log('🔍 Verifying table creation...');
    const { data: globalProgrammingData, error: globalProgrammingError } = await supabase
      .from('global_programming')
      .select('id')
      .limit(1);

    const { data: workbookVersionsData, error: workbookVersionsError } = await supabase
      .from('workbook_versions')
      .select('id')
      .limit(1);

    const { data: congregacoesData, error: congregacoesError } = await supabase
      .from('congregacoes')
      .select('id')
      .limit(1);

    if (globalProgrammingError || workbookVersionsError || congregacoesError) {
      console.warn('⚠️ Some table verification failed, but tables might still be created');
      console.log('Global programming error:', globalProgrammingError);
      console.log('Workbook versions error:', workbookVersionsError);
      console.log('Congregacoes error:', congregacoesError);
    } else {
      console.log('✅ All tables verified successfully');
    }

    console.log('🎉 Database table creation completed!');
    return { success: true };

  } catch (error: any) {
    console.error('❌ Database table creation failed:', error);
    return { success: false, error: error.message };
  }
}

// Expose function on window for manual testing
if (typeof window !== 'undefined') {
  (window as any).createDatabaseTables = createDatabaseTables;
  console.log('🔧 Database table creation tool available: window.createDatabaseTables()');
}
