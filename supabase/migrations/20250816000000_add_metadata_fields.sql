-- =====================================================
-- Sistema Ministerial - Add Metadata Fields
-- Migration to add metadata tracking fields to core tables
-- MCP-05.1: Database Metadata Implementation
-- =====================================================

-- ============================================================================
-- PHASE 1: ADD METADATA FIELDS TO ESTUDANTES TABLE
-- ============================================================================

-- Add metadata fields to estudantes table
ALTER TABLE public.estudantes 
  ADD COLUMN IF NOT EXISTS revision INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Update existing records to set last_modified_by to user_id
UPDATE public.estudantes 
SET last_modified_by = user_id 
WHERE last_modified_by IS NULL;

-- ============================================================================
-- PHASE 2: ADD METADATA FIELDS TO PROGRAMAS TABLE
-- ============================================================================

-- Add metadata fields to programas table
ALTER TABLE public.programas 
  ADD COLUMN IF NOT EXISTS revision INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Update existing records to set last_modified_by to user_id
UPDATE public.programas 
SET last_modified_by = user_id 
WHERE last_modified_by IS NULL;

-- ============================================================================
-- PHASE 3: ADD METADATA FIELDS TO DESIGNACOES TABLE
-- ============================================================================

-- Add metadata fields to designacoes table
ALTER TABLE public.designacoes 
  ADD COLUMN IF NOT EXISTS revision INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Update existing records to set last_modified_by to user_id
UPDATE public.designacoes 
SET last_modified_by = user_id 
WHERE last_modified_by IS NULL;

-- ============================================================================
-- PHASE 4: CREATE METADATA UPDATE TRIGGERS
-- ============================================================================

-- Create function to update metadata on record changes
CREATE OR REPLACE FUNCTION update_metadata_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Update timestamp
  NEW.updated_at = NOW();
  
  -- Increment revision number
  NEW.revision = COALESCE(OLD.revision, 0) + 1;
  
  -- Set last_modified_by to current user
  NEW.last_modified_by = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for estudantes table
DROP TRIGGER IF EXISTS trigger_update_estudantes_metadata ON public.estudantes;
CREATE TRIGGER trigger_update_estudantes_metadata
  BEFORE UPDATE ON public.estudantes
  FOR EACH ROW
  EXECUTE FUNCTION update_metadata_fields();

-- Create triggers for programas table
DROP TRIGGER IF EXISTS trigger_update_programas_metadata ON public.programas;
CREATE TRIGGER trigger_update_programas_metadata
  BEFORE UPDATE ON public.programas
  FOR EACH ROW
  EXECUTE FUNCTION update_metadata_fields();

-- Create triggers for designacoes table
DROP TRIGGER IF EXISTS trigger_update_designacoes_metadata ON public.designacoes;
CREATE TRIGGER trigger_update_designacoes_metadata
  BEFORE UPDATE ON public.designacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_metadata_fields();

-- ============================================================================
-- PHASE 5: CREATE SOFT DELETE FUNCTIONS
-- ============================================================================

-- Create function for soft delete
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
  sql_query := format(
    'UPDATE public.%I SET deleted_at = NOW(), last_modified_by = %L WHERE id = %L AND deleted_at IS NULL',
    table_name, auth.uid(), record_id
  );
  
  EXECUTE sql_query;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PHASE 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for metadata fields
CREATE INDEX IF NOT EXISTS idx_estudantes_deleted_at ON public.estudantes(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_estudantes_last_modified_by ON public.estudantes(last_modified_by);
CREATE INDEX IF NOT EXISTS idx_estudantes_revision ON public.estudantes(revision);

CREATE INDEX IF NOT EXISTS idx_programas_deleted_at ON public.programas(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_programas_last_modified_by ON public.programas(last_modified_by);
CREATE INDEX IF NOT EXISTS idx_programas_revision ON public.programas(revision);

CREATE INDEX IF NOT EXISTS idx_designacoes_deleted_at ON public.designacoes(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_designacoes_last_modified_by ON public.designacoes(last_modified_by);
CREATE INDEX IF NOT EXISTS idx_designacoes_revision ON public.designacoes(revision);

-- ============================================================================
-- PHASE 7: UPDATE RLS POLICIES FOR SOFT DELETE
-- ============================================================================

-- Update RLS policies to exclude soft-deleted records
-- For estudantes table
DROP POLICY IF EXISTS "Users can view their own students" ON public.estudantes;
CREATE POLICY "Users can view their own students"
  ON public.estudantes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- For programas table
DROP POLICY IF EXISTS "Users can view their own programs" ON public.programas;
CREATE POLICY "Users can view their own programs"
  ON public.programas FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- For designacoes table
DROP POLICY IF EXISTS "Users can view their own assignments" ON public.designacoes;
CREATE POLICY "Users can view their own assignments"
  ON public.designacoes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- ============================================================================
-- PHASE 8: ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

-- Add comments to document the new fields
COMMENT ON COLUMN public.estudantes.revision IS 'Incremental revision number for change tracking';
COMMENT ON COLUMN public.estudantes.last_modified_by IS 'User ID who last modified this record';
COMMENT ON COLUMN public.estudantes.deleted_at IS 'Timestamp when record was soft deleted (NULL = active)';

COMMENT ON COLUMN public.programas.revision IS 'Incremental revision number for change tracking';
COMMENT ON COLUMN public.programas.last_modified_by IS 'User ID who last modified this record';
COMMENT ON COLUMN public.programas.deleted_at IS 'Timestamp when record was soft deleted (NULL = active)';

COMMENT ON COLUMN public.designacoes.revision IS 'Incremental revision number for change tracking';
COMMENT ON COLUMN public.designacoes.last_modified_by IS 'User ID who last modified this record';
COMMENT ON COLUMN public.designacoes.deleted_at IS 'Timestamp when record was soft deleted (NULL = active)';

-- ============================================================================
-- MIGRATION COMPLETED
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Metadata fields migration completed successfully';
  RAISE NOTICE 'Added fields: revision, last_modified_by, deleted_at';
  RAISE NOTICE 'Created triggers: BEFORE UPDATE for metadata tracking';
  RAISE NOTICE 'Updated RLS policies: exclude soft-deleted records';
  RAISE NOTICE 'Created indexes: for performance optimization';
END $$;