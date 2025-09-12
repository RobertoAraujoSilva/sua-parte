-- Fix RLS policies for programas table to prevent 403 errors
-- Migration: 20250910130000_fix_programas_rls

-- Ensure RLS is enabled
ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own programs" ON public.programas;
DROP POLICY IF EXISTS "Users can create their own programs" ON public.programas;
DROP POLICY IF EXISTS "Users can update their own programs" ON public.programas;
DROP POLICY IF EXISTS "Users can delete their own programs" ON public.programas;
DROP POLICY IF EXISTS "Admin users can view all programas" ON public.programas;
DROP POLICY IF EXISTS "Admin users can insert programas" ON public.programas;
DROP POLICY IF EXISTS "Admin users can update programas" ON public.programas;
DROP POLICY IF EXISTS "Admin users can delete programas" ON public.programas;

-- Create comprehensive RLS policies

-- Basic user policies
CREATE POLICY "Users can view their own programs"
ON public.programas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own programs"
ON public.programas FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs"
ON public.programas FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own programs"
ON public.programas FOR DELETE
USING (auth.uid() = user_id);

-- Admin policies (using the is_admin_user function)
CREATE POLICY "Admin users can view all programas"
ON public.programas FOR SELECT
USING (
  auth.uid() = user_id OR 
  is_admin_user()
);

CREATE POLICY "Admin users can insert any programas"
ON public.programas FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR 
  is_admin_user()
);

CREATE POLICY "Admin users can update any programas"
ON public.programas FOR UPDATE
USING (
  auth.uid() = user_id OR 
  is_admin_user()
)
WITH CHECK (
  auth.uid() = user_id OR 
  is_admin_user()
);

CREATE POLICY "Admin users can delete any programas"
ON public.programas FOR DELETE
USING (
  auth.uid() = user_id OR 
  is_admin_user()
);

-- Public read access for published programs (optional, enable if needed)
-- CREATE POLICY "Public can view published programs"
-- ON public.programas FOR SELECT
-- USING (status = 'ativo' AND published_at IS NOT NULL);

-- Grant necessary table permissions
GRANT ALL ON public.programas TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create or update the is_admin_user function if it doesn't exist
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;

-- Verify RLS policies were created
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'programas';
    
    IF policy_count >= 8 THEN
        RAISE NOTICE 'RLS policies created successfully for programas table. Total policies: %', policy_count;
    ELSE
        RAISE WARNING 'Expected at least 8 policies, found %', policy_count;
    END IF;
END $$;

-- Test that authenticated users can access the table
-- (This will be checked during actual usage)
