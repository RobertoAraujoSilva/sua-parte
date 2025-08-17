import { supabase } from '@/integrations/supabase/client';

/**
 * Apply metadata columns, triggers, and RLS policies for programas and designacoes.
 * - Adds: updated_at, revision, last_modified_by, deleted_at
 * - Creates BEFORE UPDATE triggers to bump revision and timestamps
 * - Enables RLS and adds admin + owner-based (program owner) policies
 *
 * How to run (in browser devtools):
 *   await window.applyProgramsDesignacoesRLS()
 */
export const applyProgramsDesignacoesRLS = async () => {
  console.log('🔐 Applying RLS and metadata for programas/designacoes...');

  const sql = `
    -- Ensure tables exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='programas') THEN
        RAISE EXCEPTION 'Table public.programas not found';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='designacoes') THEN
        RAISE EXCEPTION 'Table public.designacoes not found';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
        RAISE EXCEPTION 'Table public.profiles not found';
      END IF;
    END $$;

    -- Add metadata columns (idempotent)
    ALTER TABLE public.programas
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_modified_by UUID NULL,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

    ALTER TABLE public.designacoes
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_modified_by UUID NULL,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

    -- Bump function for metadata (idempotent create or replace)
    CREATE OR REPLACE FUNCTION public.bump_metadata()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.updated_at := now();
      NEW.revision := COALESCE(OLD.revision, 0) + 1;
      BEGIN
        NEW.last_modified_by := auth.uid();
      EXCEPTION WHEN OTHERS THEN
        -- auth.uid() not available; leave as-is
        NEW.last_modified_by := NEW.last_modified_by;
      END;
      RETURN NEW;
    END;
    $$;

    -- Create triggers (replace existing if present)
    DROP TRIGGER IF EXISTS trg_programas_bump_metadata ON public.programas;
    CREATE TRIGGER trg_programas_bump_metadata
      BEFORE UPDATE ON public.programas
      FOR EACH ROW EXECUTE FUNCTION public.bump_metadata();

    DROP TRIGGER IF EXISTS trg_designacoes_bump_metadata ON public.designacoes;
    CREATE TRIGGER trg_designacoes_bump_metadata
      BEFORE UPDATE ON public.designacoes
      FOR EACH ROW EXECUTE FUNCTION public.bump_metadata();

    -- Enable RLS on both tables
    ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.designacoes ENABLE ROW LEVEL SECURITY;

    -- Grant basic privileges to 'authenticated'; RLS still restricts rows
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.programas TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.designacoes TO authenticated;

    -- Admin policies (view/manage all via profiles.role='admin')
    DROP POLICY IF EXISTS "Admins can view all programas" ON public.programas;
    CREATE POLICY "Admins can view all programas"
      ON public.programas FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );

    DROP POLICY IF EXISTS "Admins can manage all programas" ON public.programas;
    CREATE POLICY "Admins can manage all programas"
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

    DROP POLICY IF EXISTS "Admins can view all designacoes" ON public.designacoes;
    CREATE POLICY "Admins can view all designacoes"
      ON public.designacoes FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );

    DROP POLICY IF EXISTS "Admins can manage all designacoes" ON public.designacoes;
    CREATE POLICY "Admins can manage all designacoes"
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

    -- Owner-based policies for instructors (program owner controls their programs and related designations)
    -- Program owners: user_id = auth.uid()
    DROP POLICY IF EXISTS "Program owners manage their programs" ON public.programas;
    CREATE POLICY "Program owners manage their programs"
      ON public.programas FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());

    DROP POLICY IF EXISTS "Program owners view their designacoes" ON public.designacoes;
    CREATE POLICY "Program owners view their designacoes"
      ON public.designacoes FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.programas pr
          WHERE pr.id = designacoes.id_programa
            AND pr.user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "Program owners manage their designacoes" ON public.designacoes;
    CREATE POLICY "Program owners manage their designacoes"
      ON public.designacoes FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.programas pr
          WHERE pr.id = designacoes.id_programa
            AND pr.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.programas pr
          WHERE pr.id = designacoes.id_programa
            AND pr.user_id = auth.uid()
        )
      );
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error('❌ Failed to apply programas/designacoes RLS/metadata:', error);
      return false;
    }
    console.log('✅ RLS/metadata applied for programas/designacoes');
    return true;
  } catch (e) {
    console.error('❌ Exception while applying RLS/metadata:', e);
    return false;
  }
};

// Expose in browser for easy execution
if (typeof window !== 'undefined') {
  (window as any).applyProgramsDesignacoesRLS = applyProgramsDesignacoesRLS;
  console.log('🔧 RLS tool available: window.applyProgramsDesignacoesRLS()');
}
