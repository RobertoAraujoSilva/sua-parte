import { supabase } from '@/integrations/supabase/client';

/**
 * Apply strict RLS on public.estudantes so only the owner (user_id = auth.uid())
 * can read/write their student records.
 *
 * How to run (in browser devtools):
 *   await window.applyEstudantesRLS()
 */
export const applyEstudantesRLS = async () => {
  console.log('🔐 Applying RLS policies for public.estudantes...');

  const sql = `
    -- Ensure table exists before applying policies
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'estudantes'
      ) THEN
        RAISE EXCEPTION 'Table public.estudantes not found';
      END IF;
    END $$;

    -- Enable Row Level Security
    ALTER TABLE public.estudantes ENABLE ROW LEVEL SECURITY;

    -- Optional: enforce RLS even for table owners (service role bypasses regardless)
    -- ALTER TABLE public.estudantes FORCE ROW LEVEL SECURITY;

    -- Remove any previous policies that could widen access
    DROP POLICY IF EXISTS "Users can view their own students" ON public.estudantes;
    DROP POLICY IF EXISTS "Users can update their own students" ON public.estudantes;
    DROP POLICY IF EXISTS "Users can view students from same congregation" ON public.estudantes;
    DROP POLICY IF EXISTS "Users can update students from same congregation" ON public.estudantes;
    DROP POLICY IF EXISTS estudantes_select_own ON public.estudantes;
    DROP POLICY IF EXISTS estudantes_insert_own ON public.estudantes;
    DROP POLICY IF EXISTS estudantes_update_own ON public.estudantes;
    DROP POLICY IF EXISTS estudantes_delete_own ON public.estudantes;

    -- Ensure API roles have privileges; RLS still restricts row access
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.estudantes TO authenticated;

    -- Strict owner-only policies based on user_id
    CREATE POLICY estudantes_select_own
      ON public.estudantes
      FOR SELECT
      USING (user_id = auth.uid());

    CREATE POLICY estudantes_insert_own
      ON public.estudantes
      FOR INSERT
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY estudantes_update_own
      ON public.estudantes
      FOR UPDATE
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY estudantes_delete_own
      ON public.estudantes
      FOR DELETE
      USING (user_id = auth.uid());
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error('❌ Failed to apply RLS policies:', error);
      return false;
    }
    console.log('✅ RLS policies applied to public.estudantes');
    return true;
  } catch (e) {
    console.error('❌ Exception while applying RLS policies:', e);
    return false;
  }
};

// Expose in browser for easy execution
if (typeof window !== 'undefined') {
  (window as any).applyEstudantesRLS = applyEstudantesRLS;
  console.log('🔧 RLS tool available: window.applyEstudantesRLS()');
}
