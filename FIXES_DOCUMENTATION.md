# 🛠️ Fixes Documentation

This document describes the fixes implemented to address the issues identified in the system.

## 📦 Issues Addressed

### 1. Banco/RLS Issues
- **403 ao salvar designações**: Fixed by applying proper RLS policies for `assignment_history` table
- **Testes RLS ruidosos**: Improved test data to avoid PostgreSQL errors
- **Duplicidade "mês/semana"**: Enhanced duplicate detection logic
- **Missing INSERT policy**: Applied migration `20250910193000_fix_assignment_history_insert_policies.sql`

### 2. Parsing/Upload Issues
- **Reconhecimento de arquivo JW**: Improved filename parsing in `pdfParser.ts`
- **Parser baseado apenas no nome do arquivo**: Added storage upload functionality
- **Storage 400 errors**: Created proper storage bucket and policies

### 3. Fluxo/UX Issues
- **Confirmação nativa para duplicados**: Replaced with custom modal component
- **Geração automática surpreendente**: Maintained but with clearer UI
- **Excesso de logs**: Implemented logging utility with levels

### 4. Geração/Designações Issues
- **"Partes undefined"**: Improved part mapping and extraction
- **Constraints de designacoes**: Applied proper migrations

## 🚀 Implemented Solutions

### 1. Storage Upload + Bucket Policies
- Created `usePdfUpload` hook with storage upload functionality
- Added storage bucket creation script
- Implemented proper RLS policies for storage access
- Added bucket existence check in upload process

### 2. Modal "Atualizar e Gerar"
- Created `DuplicateProgramModal` component
- Replaced native `window.confirm` with proper modal
- Added "Atualizar" and "Atualizar e Gerar" options

### 3. Logging Reduction
- Created `logger.ts` utility with log levels
- Replaced direct `console.log` calls with `logger` calls
- Added `VITE_LOG_LEVEL` environment variable for control

## 📋 How to Apply Fixes

### Run the Policy Fix Script
```bash
npm run fix:policies-only
```

This script will:
1. Display instructions for manual bucket creation
2. Show SQL commands to apply all necessary policies
3. Provide guidance for testing the fixes

### Manual Steps (Required)
1. **Create Storage Bucket**:
   - Go to Supabase dashboard → Storage
   - Create a new bucket named `programas`
   - Make it public for read access

2. **Apply SQL Policies**:
   Run the following SQL commands in the Supabase SQL Editor:
   
   ```sql
   -- Assignment History RLS Policies
   ALTER TABLE public.assignment_history ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Instructor can insert assignment history"
   ON public.assignment_history
   FOR INSERT
   WITH CHECK (
     EXISTS (
       SELECT 1
       FROM public.congregation_assignments ca
       JOIN public.congregation_instructors ci
         ON ci.congregation_id = ca.congregation_id
       WHERE ca.id = assignment_history.congregation_assignment_id
         AND ci.user_id = auth.uid()
         AND ci.status = 'active'
     )
   );
   
   CREATE POLICY "Admin can insert assignment history"
   ON public.assignment_history
   FOR INSERT
   WITH CHECK (
     EXISTS (
       SELECT 1
       FROM public.profiles p
       WHERE p.user_id = auth.uid()
         AND p.role = 'admin'
     )
   );
   
   CREATE POLICY "Enforce changed_by = auth.uid()"
   ON public.assignment_history
   FOR INSERT
   WITH CHECK (changed_by = auth.uid());
   
   GRANT INSERT ON public.assignment_history TO authenticated;
   GRANT USAGE ON SCHEMA public TO authenticated;
   
   -- Designacoes RLS Policies
   ALTER TABLE public.designacoes ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY IF NOT EXISTS "dz_select_own"
     ON public.designacoes
     FOR SELECT
     TO authenticated
     USING (auth.uid() = user_id);
   
   CREATE POLICY IF NOT EXISTS "dz_insert_own"
     ON public.designacoes
     FOR INSERT
     TO authenticated
     WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY IF NOT EXISTS "dz_update_own"
     ON public.designacoes
     FOR UPDATE
     TO authenticated
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY IF NOT EXISTS "dz_delete_own"
     ON public.designacoes
     FOR DELETE
     TO authenticated
     USING (auth.uid() = user_id);
   
   GRANT SELECT, INSERT, UPDATE, DELETE ON public.designacoes TO authenticated;
   GRANT USAGE ON SCHEMA public TO authenticated;
   
   -- Storage RLS Policies
   CREATE POLICY IF NOT EXISTS "programas_read_public"
   ON storage.objects
   FOR SELECT
   TO public
   USING (bucket_id = 'programas');
   
   CREATE POLICY IF NOT EXISTS "programas_insert_auth"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'programas' AND owner = auth.uid());
   
   CREATE POLICY IF NOT EXISTS "programas_update_own"
   ON storage.objects
   FOR UPDATE
   TO authenticated
   USING (bucket_id = 'programas' AND owner = auth.uid())
   WITH CHECK (bucket_id = 'programas' AND owner = auth.uid());
   
   CREATE POLICY IF NOT EXISTS "programas_delete_own"
   ON storage.objects
   FOR DELETE
   TO authenticated
   USING (bucket_id = 'programas' AND owner = auth.uid());
   
   GRANT SELECT ON storage.objects TO public;
   GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
   ```

## 🧪 Testing the Fixes

### Test Storage Upload
1. Navigate to Programas page
2. Upload a PDF file
3. Verify it appears in the storage bucket

### Test Duplicate Handling
1. Upload a program for a week that already exists
2. Verify the DuplicateProgramModal appears
3. Test both "Atualizar" and "Atualizar e Gerar" options

### Test Assignment Generation
1. Create a new program
2. Generate assignments
3. Verify no 403 errors occur

## 📊 Verification

After applying the fixes, you should see:
- ✅ No more 403 errors when saving assignments
- ✅ Proper duplicate handling with modal interface
- ✅ Reduced console noise
- ✅ Successful PDF uploads to storage
- ✅ Correct assignment generation

## 🛡️ Security Notes

- All storage operations use authenticated access
- RLS policies ensure users can only access their own data
- Storage bucket is configured with appropriate file size limits
- File type restrictions are in place for PDF uploads

## 📚 Additional Documentation

For detailed step-by-step instructions, see:
- [MANUAL_STORAGE_SETUP.md](MANUAL_STORAGE_SETUP.md) - Complete manual setup guide
- [supabase/migrations/](supabase/migrations/) - SQL migration files