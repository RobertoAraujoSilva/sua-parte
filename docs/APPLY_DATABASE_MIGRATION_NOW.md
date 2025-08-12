# 🚨 CRITICAL: Apply Database Migration Immediately

## **BLOCKING ERROR: PGRST204 - titulo_parte column not found**

The assignment generation system is completely blocked due to missing database schema changes. **This migration MUST be applied immediately.**

## **STEP 1: Copy and Execute This SQL in Supabase SQL Editor**

```sql
-- CRITICAL FIX: Assignment Generation Database Issues
-- This migration fixes the critical issues preventing assignment generation
-- Run this immediately to resolve the 400/406 errors

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
-- ISSUE 4: Performance optimization indexes
-- =============================================================================

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_designacoes_user_id ON public.designacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_designacoes_programa ON public.designacoes(id_programa);
CREATE INDEX IF NOT EXISTS idx_designacoes_estudante ON public.designacoes(id_estudante);
CREATE INDEX IF NOT EXISTS idx_designacoes_numero_parte ON public.designacoes(numero_parte);
CREATE INDEX IF NOT EXISTS idx_designacoes_tipo_parte ON public.designacoes(tipo_parte);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify the constraints are properly set
DO $$
BEGIN
  -- Check if the constraints exist and are correct
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.designacoes'::regclass 
    AND conname = 'designacoes_numero_parte_check'
    AND pg_get_constraintdef(oid) LIKE '%BETWEEN 1 AND 12%'
  ) THEN
    RAISE NOTICE '✅ designacoes_numero_parte_check constraint updated successfully (parts 1-12)';
  ELSE
    RAISE NOTICE '❌ designacoes_numero_parte_check constraint not found or incorrect';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.designacoes'::regclass 
    AND conname = 'designacoes_tipo_parte_check'
    AND pg_get_constraintdef(oid) LIKE '%oracao_abertura%'
  ) THEN
    RAISE NOTICE '✅ designacoes_tipo_parte_check constraint updated successfully (new types)';
  ELSE
    RAISE NOTICE '❌ designacoes_tipo_parte_check constraint not found or incorrect';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'designacoes'
    AND column_name = 'titulo_parte'
  ) THEN
    RAISE NOTICE '✅ titulo_parte column exists';
  ELSE
    RAISE NOTICE '❌ titulo_parte column missing';
  END IF;
END $$;

-- Add helpful comments for documentation
COMMENT ON TABLE public.designacoes IS 'Stores assignment data for JW meeting parts 1-12 with complete meeting structure support';
COMMENT ON COLUMN public.designacoes.numero_parte IS 'Meeting part number (1-12): 1-2=Opening, 3-5=Treasures, 6-8=Ministry, 9-10=Christian Life, 11-12=Closing';
COMMENT ON COLUMN public.designacoes.tipo_parte IS 'Assignment type following S-38-T guidelines with expanded types for complete meeting structure';
COMMENT ON COLUMN public.designacoes.titulo_parte IS 'Human-readable title for the assignment part';

-- Grant necessary permissions (if not already granted)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.designacoes TO authenticated;

-- Final verification message
DO $$
BEGIN
  RAISE NOTICE '🎉 Assignment generation database fixes applied successfully!';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '   1. Test assignment generation with a program';
  RAISE NOTICE '   2. Verify all 12 meeting parts are created';
  RAISE NOTICE '   3. Check that programs change status to "Designações Geradas"';
END $$;
```

## **STEP 2: Verification Query**

After running the migration, execute this to verify success:

```sql
-- Verify titulo_parte column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'designacoes' 
  AND column_name = 'titulo_parte';

-- Should return: titulo_parte | character varying | YES
```

## **STEP 3: Test Assignment Generation**

1. Navigate to http://localhost:8080/programas
2. Click "Gerar Designações" on any program
3. Should complete without PGRST204 errors
4. Check browser console for success messages

## **🚨 CRITICAL SUCCESS INDICATORS**

- ✅ No PGRST204 errors in browser console
- ✅ Assignment generation completes successfully
- ✅ 12 assignments created per program
- ✅ Program status changes to "Designações Geradas"

**This migration MUST be applied before any other fixes will work!**
