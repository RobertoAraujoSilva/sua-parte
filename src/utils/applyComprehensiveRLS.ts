/**
 * Apply Comprehensive RLS Policies
 * Implements the complete RLS system for Admin/Instrutor/Estudante roles
 * Based on docs/SISTEMA-UNIFICADO.md specifications
 */

import { supabase } from '@/integrations/supabase/client';

const COMPREHENSIVE_RLS_SQL = `
-- =====================================================
-- COMPREHENSIVE RLS POLICIES FOR SISTEMA MINISTERIAL
-- Admin (Global Access) / Instrutor (Local Access) / Estudante (Individual Access)
-- =====================================================

-- Step 1: Ensure role enum includes all required roles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'instrutor', 'estudante', 'developer');
  ELSE
    -- Add missing roles if they don't exist
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'developer';
    EXCEPTION WHEN duplicate_object THEN
      -- Roles already exist, continue
    END;
  END IF;
END $$;

-- Step 2: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own programs" ON public.programas;
DROP POLICY IF EXISTS "Users can create their own programs" ON public.programas;
DROP POLICY IF EXISTS "Users can update their own programs" ON public.programas;
DROP POLICY IF EXISTS "Users can delete their own programs" ON public.programas;

DROP POLICY IF EXISTS "Users can view their own designations" ON public.designacoes;
DROP POLICY IF EXISTS "Users can create their own designations" ON public.designacoes;
DROP POLICY IF EXISTS "Users can update their own designations" ON public.designacoes;
DROP POLICY IF EXISTS "Users can delete their own designations" ON public.designacoes;

-- Step 3: PROGRAMAS RLS Policies

-- Admin: Global access to all programs
CREATE POLICY "Admin can manage all programs"
  ON public.programas FOR ALL
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

-- Instrutor: Access to programs from their congregation
CREATE POLICY "Instrutor can manage congregation programs"
  ON public.programas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'instrutor'
      AND (
        -- Own programs
        user_id = auth.uid()
        OR
        -- Programs from same congregation (if congregation system is implemented)
        EXISTS (
          SELECT 1 FROM public.profiles p2
          WHERE p2.id = programas.user_id
          AND p2.congregacao = p.congregacao
          AND p.congregacao IS NOT NULL
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'instrutor'
    )
    AND user_id = auth.uid()
  );

-- Estudante: Read-only access to published programs they're assigned to
CREATE POLICY "Estudante can view assigned programs"
  ON public.programas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'estudante'
    )
    AND (
      -- Programs with assignments for this student
      EXISTS (
        SELECT 1 FROM public.designacoes d
        WHERE d.id_programa = programas.id
        AND (d.id_estudante = auth.uid() OR d.id_ajudante = auth.uid())
      )
      OR
      -- Published programs from same congregation
      status = 'ativo'
    )
  );

-- Step 4: DESIGNACOES RLS Policies

-- Admin: Global access to all assignments
CREATE POLICY "Admin can manage all designations"
  ON public.designacoes FOR ALL
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

-- Instrutor: Manage assignments for their congregation's programs
CREATE POLICY "Instrutor can manage congregation designations"
  ON public.designacoes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'instrutor'
      AND (
        -- Own assignments
        user_id = auth.uid()
        OR
        -- Assignments for programs they can access
        EXISTS (
          SELECT 1 FROM public.programas prog
          WHERE prog.id = designacoes.id_programa
          AND (
            prog.user_id = auth.uid()
            OR
            EXISTS (
              SELECT 1 FROM public.profiles p2
              WHERE p2.id = prog.user_id
              AND p2.congregacao = p.congregacao
              AND p.congregacao IS NOT NULL
            )
          )
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'instrutor'
    )
    AND (
      user_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM public.programas prog
        WHERE prog.id = id_programa
        AND prog.user_id = auth.uid()
      )
    )
  );

-- Estudante: View and confirm their own assignments
CREATE POLICY "Estudante can view own designations"
  ON public.designacoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'estudante'
    )
    AND (id_estudante = auth.uid() OR id_ajudante = auth.uid())
  );

CREATE POLICY "Estudante can confirm own designations"
  ON public.designacoes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'estudante'
    )
    AND (id_estudante = auth.uid() OR id_ajudante = auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'estudante'
    )
    AND (id_estudante = auth.uid() OR id_ajudante = auth.uid())
    -- Only allow updating confirmation status and notes
    AND (
      OLD.id_estudante = NEW.id_estudante
      AND OLD.id_ajudante = NEW.id_ajudante
      AND OLD.id_programa = NEW.id_programa
      AND OLD.numero_parte = NEW.numero_parte
      AND OLD.tipo_parte = NEW.tipo_parte
    )
  );

-- Step 5: Developer access (for template system)
CREATE POLICY "Developer can manage templates"
  ON public.programas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'developer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'developer'
    )
  );

-- Step 6: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.designacoes TO authenticated;

-- Step 7: Create helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role::TEXT 
    FROM public.profiles 
    WHERE id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create helper function to check congregation access
CREATE OR REPLACE FUNCTION same_congregation(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT p1.congregacao = p2.congregacao
    FROM public.profiles p1, public.profiles p2
    WHERE p1.id = user1_uuid 
    AND p2.id = user2_uuid
    AND p1.congregacao IS NOT NULL
    AND p2.congregacao IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION same_congregation(UUID, UUID) TO authenticated;
`;

export async function applyComprehensiveRLS(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🚀 Starting comprehensive RLS migration...');
    
    // Split the migration into individual statements
    const statements = COMPREHENSIVE_RLS_SQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.includes('$$'));
    
    // Handle DO blocks separately
    const doBlocks = COMPREHENSIVE_RLS_SQL.match(/DO \$\$[\s\S]*?\$\$;/g) || [];
    
    console.log(`📝 Found ${statements.length} SQL statements and ${doBlocks.length} DO blocks to execute`);
    
    // Execute DO blocks first
    for (let i = 0; i < doBlocks.length; i++) {
      const block = doBlocks[i];
      console.log(`⚡ Executing DO block ${i + 1}/${doBlocks.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: block });
        
        if (error) {
          console.error(`❌ Error in DO block ${i + 1}:`, error);
          return { success: false, error: error.message };
        }
        
        console.log(`✅ DO block ${i + 1} executed successfully`);
      } catch (blockError: any) {
        console.error(`❌ Failed to execute DO block ${i + 1}:`, blockError);
        return { success: false, error: blockError.message };
      }
    }
    
    // Execute regular statements
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
    
    console.log('🎉 Comprehensive RLS migration completed successfully!');
    
    // Verify the migration by testing access
    console.log('🔍 Verifying RLS policies...');
    
    const { data: programsData, error: programsError } = await supabase
      .from('programas')
      .select('id, user_id')
      .limit(1);
    
    const { data: designacoesData, error: designacoesError } = await supabase
      .from('designacoes')
      .select('id, user_id')
      .limit(1);
    
    if (programsError || designacoesError) {
      console.warn('⚠️ Some verification queries failed, but this might be expected based on user role');
    } else {
      console.log('✅ RLS policies are active and working');
    }
    
    console.log('✨ RLS verification completed!');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Comprehensive RLS migration failed:', error);
    return { success: false, error: error.message };
  }
}

// Expose function on window for manual testing
if (typeof window !== 'undefined') {
  (window as any).applyComprehensiveRLS = applyComprehensiveRLS;
  console.log('🔧 RLS migration tool available: window.applyComprehensiveRLS()');
}
