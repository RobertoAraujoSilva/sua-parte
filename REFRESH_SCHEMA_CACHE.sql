-- Refresh Supabase schema cache to recognize new columns
-- Run this in Supabase SQL Editor

-- Force refresh of the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the date column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'programas' 
  AND table_schema = 'public'
  AND column_name IN ('date', 'week', 'theme', 'published_at')
ORDER BY column_name;

-- Check current RLS policies
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'programas'
ORDER BY policyname;

-- Test a simple insert (this should work now)
-- INSERT INTO public.programas (user_id, date, week, theme, status, published_at)
-- VALUES (auth.uid(), CURRENT_DATE, 1, 'Test Program', 'ativo', NOW());
-- (Remove the -- above to test, but make sure to delete the test record after)
