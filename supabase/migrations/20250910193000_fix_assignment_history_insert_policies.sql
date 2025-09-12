-- Fix RLS: allow instructors to insert assignment history rows
-- This addresses frontend 403 errors when DB triggers write to assignment_history

DO $$
BEGIN
  -- Ensure table exists before creating policies
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'assignment_history'
  ) THEN
    -- Create INSERT policy if it doesn't exist yet
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'assignment_history' 
        AND polname = 'Instructors can insert own assignment history'
    ) THEN
      EXECUTE $$
        CREATE POLICY "Instructors can insert own assignment history" 
        ON public.assignment_history
        FOR INSERT
        WITH CHECK (
          changed_by = auth.uid()
        );
      $$;
    END IF;
  ELSE
    RAISE NOTICE 'assignment_history table not found. Skipping policy creation.';
  END IF;
END $$;

