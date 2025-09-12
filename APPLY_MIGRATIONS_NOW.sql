-- APPLY THESE MIGRATIONS TO FIX PROGRAMAS TABLE ISSUES
-- Run this SQL on your Supabase dashboard SQL Editor

-- ================================================
-- MIGRATION 1: Add missing columns to programas table
-- ================================================

-- Add missing columns
ALTER TABLE public.programas 
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS week INTEGER,
ADD COLUMN IF NOT EXISTS theme VARCHAR(255),
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Update existing records where possible
-- For date, use data_inicio_semana if available
UPDATE public.programas 
SET date = data_inicio_semana 
WHERE date IS NULL AND data_inicio_semana IS NOT NULL;

-- For theme, use a default value or extract from existing data
UPDATE public.programas 
SET theme = COALESCE(mes_apostila, 'Programa da Semana')
WHERE theme IS NULL;

-- For published_at, use created_at if available
UPDATE public.programas 
SET published_at = created_at
WHERE published_at IS NULL AND created_at IS NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_programas_date ON public.programas(date);
CREATE INDEX IF NOT EXISTS idx_programas_week ON public.programas(week);
CREATE INDEX IF NOT EXISTS idx_programas_published_at ON public.programas(published_at);

-- ================================================
-- MIGRATION 2: Fix RLS policies for programas table
-- ================================================

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

-- Create or update the is_admin_user function
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Admin policies
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

-- Grant necessary permissions
GRANT ALL ON public.programas TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ================================================
-- VERIFICATION
-- ================================================

-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'programas' 
AND table_schema = 'public'
AND column_name IN ('date', 'week', 'theme', 'published_at');

-- Check policies exist
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'programas'
ORDER BY policyname;
