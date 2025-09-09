# Assignment System Repair Guide

## Critical Issues Analysis & Solutions

### **Issue 1: Database Constraint Violation (CRITICAL)**

**Problem**: `POST` request to `designacoes` table failing with `400 (Bad Request)`
- **Error**: `"new row for relation "designacoes" violates check constraint "designacoes_numero_parte_check"`
- **Root Cause**: Database constraint `CHECK (numero_parte BETWEEN 3 AND 7)` but new algorithm generates parts 1-12
- **Location**: `supabase/migrations/20250806090345_570602b1-847e-40c1-81c2-cdf49bbeffe8.sql:108`

**Solution Applied**:
```sql
-- Drop old constraint
ALTER TABLE public.designacoes DROP CONSTRAINT IF EXISTS designacoes_numero_parte_check;

-- Add new constraint supporting parts 1-12
ALTER TABLE public.designacoes ADD CONSTRAINT designacoes_numero_parte_check 
CHECK (numero_parte BETWEEN 1 AND 12);
```

### **Issue 2: Missing Assignment Types (HIGH)**

**Problem**: New assignment types not supported in database constraint
- **Root Cause**: `tipo_parte` constraint only allows old types: `leitura_biblica`, `discurso`, `demonstracao`
- **New Types Needed**: `oracao_abertura`, `comentarios_iniciais`, `tesouros_palavra`, etc.

**Solution Applied**:
```sql
ALTER TABLE public.designacoes ADD CONSTRAINT designacoes_tipo_parte_check 
CHECK (tipo_parte IN (
  'leitura_biblica', 'discurso', 'demonstracao',
  'oracao_abertura', 'comentarios_iniciais', 'tesouros_palavra',
  'joias_espirituais', 'parte_ministerio', 'vida_crista',
  'estudo_biblico_congregacao', 'oracao_encerramento', 'comentarios_finais'
));
```

### **Issue 3: Supabase API 406 Errors (HIGH)**

**Problem**: Multiple `GET` requests to `family_members` table returning `406 (Not Acceptable)`
- **Root Cause**: RLS policy misconfiguration or table doesn't exist
- **Impact**: Family relationship validation fails during assignment generation

**Solution Applied**:
1. **Created `family_members` table** with proper structure
2. **Fixed RLS policies** for proper access control
3. **Updated `getFamilyRelationship` function** to use correct column names

### **Issue 4: Missing Database Column (MEDIUM)**

**Problem**: `titulo_parte` column missing from database inserts
- **Root Cause**: New assignment structure includes titles but database insert was missing this field
- **Impact**: Assignment titles not saved to database

**Solution Applied**:
```typescript
// Added titulo_parte to database insert
const designacoesParaSalvar = designacoes.map(designacao => ({
  // ... other fields
  titulo_parte: designacao.titulo_parte, // Added this line
  // ... rest of fields
}));
```

## **Implementation Steps**

### **Step 1: Apply Database Migration**
```bash
# Run the migration file
supabase migration up
# OR apply the repair script directly in Supabase SQL editor
```

### **Step 2: Verify Database Changes**
```sql
-- Check constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.designacoes'::regclass;

-- Check family_members table
SELECT * FROM information_schema.tables 
WHERE table_name = 'family_members';
```

### **Step 3: Test Assignment Generation**
1. Create test students in the system
2. Create a test program
3. Generate assignments and verify all 12 parts are created
4. Check that family relationships work without 406 errors

## **New Meeting Structure (Parts 1-12)**

| Part | Type | Title | Time | Gender Restriction |
|------|------|-------|------|-------------------|
| 1 | oracao_abertura | Oração de Abertura | 1 min | Men only |
| 2 | comentarios_iniciais | Comentários Iniciais | 1 min | Men only |
| 3 | tesouros_palavra | Tesouros da Palavra de Deus | 10 min | Men only |
| 4 | joias_espirituais | Joias Espirituais | 10 min | Men only |
| 5 | leitura_biblica | Leitura da Bíblia | 4 min | Men only |
| 6 | parte_ministerio | Primeira Conversa | 3 min | Both genders |
| 7 | parte_ministerio | Revisita | 4 min | Both genders |
| 8 | parte_ministerio | Estudo Bíblico | 5 min | Both genders |
| 9 | vida_crista | Nossa Vida Cristã | 15 min | Men only |
| 10 | estudo_biblico_congregacao | Estudo Bíblico da Congregação | 30 min | Men only |
| 11 | comentarios_finais | Comentários Finais | 3 min | Men only |
| 12 | oracao_encerramento | Oração de Encerramento | 1 min | Men only |

## **Error Handling Improvements**

Added comprehensive error logging and user-friendly error messages:

```typescript
// Enhanced error handling in salvarDesignacoes
if (error.message.includes('designacoes_numero_parte_check')) {
  errorMessage = 'Erro: Execute a migração do banco de dados para suportar partes 1-12.';
} else if (error.message.includes('designacoes_tipo_parte_check')) {
  errorMessage = 'Erro: Execute a migração do banco de dados para suportar novos tipos.';
}
```

## **Performance Optimizations**

Added database indexes for better query performance:
- `idx_family_members_user_id`
- `idx_family_members_estudante` 
- `idx_family_members_familiar`
- `idx_designacoes_numero_parte`
- `idx_designacoes_tipo_parte`

## **Testing Checklist**

- [ ] Database migration applied successfully
- [ ] Constraints updated (parts 1-12 allowed)
- [ ] New assignment types accepted
- [ ] Family_members table exists with RLS policies
- [ ] Assignment generation creates 12 parts
- [ ] No 400 errors on designacoes insert
- [ ] No 406 errors on family_members queries
- [ ] All assignment titles saved correctly
- [ ] Performance is acceptable with new indexes

## **Rollback Plan**

If issues occur, rollback by:
1. Reverting constraint to `CHECK (numero_parte BETWEEN 3 AND 7)`
2. Reverting assignment generation to use old 5-part structure
3. Removing new assignment types from constraint

## **Expected Outcome**

After applying these fixes:
- ✅ Assignment generation creates all 12 meeting parts
- ✅ No database constraint violations
- ✅ Family relationship validation works properly
- ✅ Complete JW meeting structure supported
- ✅ Better error messages for troubleshooting
- ✅ Improved performance with proper indexing
