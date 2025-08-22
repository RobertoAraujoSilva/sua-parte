/**
 * Apply Sync Metadata Migration
 * This utility applies the sync metadata migration to add revision tracking
 */

import { supabase } from '@/integrations/supabase/client';

const MIGRATION_SQL = `
-- Add metadata columns to estudantes table
ALTER TABLE public.estudantes 
ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Add metadata columns to programas table  
ALTER TABLE public.programas 
ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Add metadata columns to designacoes table
ALTER TABLE public.designacoes 
ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Create trigger function for automatic metadata updates
CREATE OR REPLACE FUNCTION update_sync_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update timestamp and revision
  NEW.updated_at = now();
  NEW.revision = OLD.revision + 1;
  
  -- Set last_modified_by to current user if available
  IF auth.uid() IS NOT NULL THEN
    NEW.last_modified_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for estudantes table
DROP TRIGGER IF EXISTS trigger_estudantes_sync_metadata ON public.estudantes;
CREATE TRIGGER trigger_estudantes_sync_metadata
  BEFORE UPDATE ON public.estudantes
  FOR EACH ROW
  EXECUTE FUNCTION update_sync_metadata();

-- Create triggers for programas table
DROP TRIGGER IF EXISTS trigger_programas_sync_metadata ON public.programas;
CREATE TRIGGER trigger_programas_sync_metadata
  BEFORE UPDATE ON public.programas
  FOR EACH ROW
  EXECUTE FUNCTION update_sync_metadata();

-- Create triggers for designacoes table
DROP TRIGGER IF EXISTS trigger_designacoes_sync_metadata ON public.designacoes;
CREATE TRIGGER trigger_designacoes_sync_metadata
  BEFORE UPDATE ON public.designacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_sync_metadata();

-- Create indexes for sync performance
CREATE INDEX IF NOT EXISTS idx_estudantes_updated_at ON public.estudantes(updated_at);
CREATE INDEX IF NOT EXISTS idx_estudantes_revision ON public.estudantes(revision);
CREATE INDEX IF NOT EXISTS idx_estudantes_deleted_at ON public.estudantes(deleted_at);

CREATE INDEX IF NOT EXISTS idx_programas_updated_at ON public.programas(updated_at);
CREATE INDEX IF NOT EXISTS idx_programas_revision ON public.programas(revision);
CREATE INDEX IF NOT EXISTS idx_programas_deleted_at ON public.programas(deleted_at);

CREATE INDEX IF NOT EXISTS idx_designacoes_updated_at ON public.designacoes(updated_at);
CREATE INDEX IF NOT EXISTS idx_designacoes_revision ON public.designacoes(revision);
CREATE INDEX IF NOT EXISTS idx_designacoes_deleted_at ON public.designacoes(deleted_at);
`;

export async function applyMigration(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🚀 Starting sync metadata migration...');
    
    // Split the migration into individual statements
    const statements = MIGRATION_SQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement using rpc
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
    
    console.log('🎉 Migration completed successfully!');
    
    // Verify the migration by checking if the new columns exist
    console.log('🔍 Verifying migration...');
    
    const tables = ['estudantes', 'programas', 'designacoes'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('revision, last_modified_by, deleted_at')
        .limit(1);
      
      if (error) {
        console.error(`❌ Verification failed for table ${table}:`, error);
        return { success: false, error: `Verification failed for table ${table}: ${error.message}` };
      } else {
        console.log(`✅ Table ${table} has sync metadata columns`);
      }
    }
    
    console.log('✨ Migration verification completed!');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
}

// Expose function on window for manual testing
if (typeof window !== 'undefined') {
  (window as any).applyMigration = applyMigration;
  console.log('🔧 Migration tool available: window.applyMigration()');
}
