-- =====================================================
-- Sistema Ministerial - Add Sync Metadata and Triggers
-- Migration to add metadata columns and triggers for sync support
-- MCP-05.1: Add updated_at, revision, last_modified_by, deleted_at
-- =====================================================

-- Step 1: Add metadata columns to estudantes table
ALTER TABLE public.estudantes 
ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Step 2: Add metadata columns to programas table  
ALTER TABLE public.programas 
ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Step 3: Add metadata columns to designacoes table
ALTER TABLE public.designacoes 
ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Step 4: Create trigger function for automatic metadata updates
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

-- Step 5: Create triggers for estudantes table
DROP TRIGGER IF EXISTS trigger_estudantes_sync_metadata ON public.estudantes;
CREATE TRIGGER trigger_estudantes_sync_metadata
  BEFORE UPDATE ON public.estudantes
  FOR EACH ROW
  EXECUTE FUNCTION update_sync_metadata();

-- Step 6: Create triggers for programas table
DROP TRIGGER IF EXISTS trigger_programas_sync_metadata ON public.programas;
CREATE TRIGGER trigger_programas_sync_metadata
  BEFORE UPDATE ON public.programas
  FOR EACH ROW
  EXECUTE FUNCTION update_sync_metadata();

-- Step 7: Create triggers for designacoes table
DROP TRIGGER IF EXISTS trigger_designacoes_sync_metadata ON public.designacoes;
CREATE TRIGGER trigger_designacoes_sync_metadata
  BEFORE UPDATE ON public.designacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_sync_metadata();

-- Step 8: Create indexes for sync performance
CREATE INDEX IF NOT EXISTS idx_estudantes_updated_at ON public.estudantes(updated_at);
CREATE INDEX IF NOT EXISTS idx_estudantes_revision ON public.estudantes(revision);
CREATE INDEX IF NOT EXISTS idx_estudantes_deleted_at ON public.estudantes(deleted_at);

CREATE INDEX IF NOT EXISTS idx_programas_updated_at ON public.programas(updated_at);
CREATE INDEX IF NOT EXISTS idx_programas_revision ON public.programas(revision);
CREATE INDEX IF NOT EXISTS idx_programas_deleted_at ON public.programas(deleted_at);

CREATE INDEX IF NOT EXISTS idx_designacoes_updated_at ON public.designacoes(updated_at);
CREATE INDEX IF NOT EXISTS idx_designacoes_revision ON public.designacoes(revision);
CREATE INDEX IF NOT EXISTS idx_designacoes_deleted_at ON public.designacoes(deleted_at);

-- Step 9: Create helper function for soft delete
CREATE OR REPLACE FUNCTION soft_delete_record(table_name TEXT, record_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sql_query TEXT;
BEGIN
  -- Validate table name to prevent SQL injection
  IF table_name NOT IN ('estudantes', 'programas', 'designacoes') THEN
    RAISE EXCEPTION 'Invalid table name: %', table_name;
  END IF;
  
  -- Build and execute soft delete query
  sql_query := format('UPDATE public.%I SET deleted_at = now(), last_modified_by = auth.uid() WHERE id = $1', table_name);
  EXECUTE sql_query USING record_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create helper function for delta sync queries
CREATE OR REPLACE FUNCTION get_sync_changes(
  table_name TEXT,
  since_timestamp TIMESTAMPTZ DEFAULT NULL,
  since_revision BIGINT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  updated_at TIMESTAMPTZ,
  revision BIGINT,
  deleted_at TIMESTAMPTZ,
  data JSONB
) AS $$
DECLARE
  sql_query TEXT;
BEGIN
  -- Validate table name
  IF table_name NOT IN ('estudantes', 'programas', 'designacoes') THEN
    RAISE EXCEPTION 'Invalid table name: %', table_name;
  END IF;
  
  -- Build query based on provided parameters
  sql_query := format('
    SELECT 
      id,
      updated_at,
      revision,
      deleted_at,
      to_jsonb(%I.*) as data
    FROM public.%I 
    WHERE 1=1
  ', table_name, table_name);
  
  -- Add timestamp filter if provided
  IF since_timestamp IS NOT NULL THEN
    sql_query := sql_query || ' AND updated_at > $1';
  END IF;
  
  -- Add revision filter if provided
  IF since_revision IS NOT NULL THEN
    sql_query := sql_query || ' AND revision > $2';
  END IF;
  
  sql_query := sql_query || ' ORDER BY updated_at ASC, revision ASC';
  
  -- Execute query with appropriate parameters
  IF since_timestamp IS NOT NULL AND since_revision IS NOT NULL THEN
    RETURN QUERY EXECUTE sql_query USING since_timestamp, since_revision;
  ELSIF since_timestamp IS NOT NULL THEN
    RETURN QUERY EXECUTE sql_query USING since_timestamp;
  ELSIF since_revision IS NOT NULL THEN
    RETURN QUERY EXECUTE sql_query USING since_revision;
  ELSE
    RETURN QUERY EXECUTE sql_query;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_sync_metadata() TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_record(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sync_changes(TEXT, TIMESTAMPTZ, BIGINT) TO authenticated;

-- Step 12: Add helpful comments
COMMENT ON COLUMN public.estudantes.revision IS 'Incremental revision number for conflict resolution';
COMMENT ON COLUMN public.estudantes.last_modified_by IS 'User who last modified this record';
COMMENT ON COLUMN public.estudantes.deleted_at IS 'Soft delete timestamp - NULL means active record';

COMMENT ON COLUMN public.programas.revision IS 'Incremental revision number for conflict resolution';
COMMENT ON COLUMN public.programas.last_modified_by IS 'User who last modified this record';
COMMENT ON COLUMN public.programas.deleted_at IS 'Soft delete timestamp - NULL means active record';

COMMENT ON COLUMN public.designacoes.revision IS 'Incremental revision number for conflict resolution';
COMMENT ON COLUMN public.designacoes.last_modified_by IS 'User who last modified this record';
COMMENT ON COLUMN public.designacoes.deleted_at IS 'Soft delete timestamp - NULL means active record';

COMMENT ON FUNCTION update_sync_metadata() IS 'Trigger function to automatically update sync metadata on record changes';
COMMENT ON FUNCTION soft_delete_record(TEXT, UUID) IS 'Helper function for soft deleting records with proper metadata';
COMMENT ON FUNCTION get_sync_changes(TEXT, TIMESTAMPTZ, BIGINT) IS 'Helper function for delta sync queries';

-- Migration completed successfully
SELECT 'Sync metadata and triggers added successfully' as status;
