-- Fix RLS policies for admin dashboard access
-- This migration ensures all tables have proper RLS policies

-- 1. Fix audit_overrides table RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own audit overrides" ON public.audit_overrides;
DROP POLICY IF EXISTS "Users can insert their own audit overrides" ON public.audit_overrides;
DROP POLICY IF EXISTS "Users can update their own audit overrides" ON public.audit_overrides;
DROP POLICY IF EXISTS "Users can delete their own audit overrides" ON public.audit_overrides;

-- Create proper policies for audit_overrides
CREATE POLICY "Users can view their own audit overrides"
ON public.audit_overrides
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit overrides"
ON public.audit_overrides
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audit overrides"
ON public.audit_overrides
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audit overrides"
ON public.audit_overrides
FOR DELETE
USING (auth.uid() = user_id);

-- 2. Ensure admin users can access all data (for admin dashboard)
-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create admin access policies for profiles table
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
CREATE POLICY "Admin users can view all profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR -- Users can view their own profile
  is_admin_user()     -- Admin users can view all profiles
);

-- 4. Create admin access policies for estudantes table
DROP POLICY IF EXISTS "Admin users can view all estudantes" ON public.estudantes;
CREATE POLICY "Admin users can view all estudantes"
ON public.estudantes
FOR SELECT
USING (
  auth.uid() = user_id OR -- Users can view their own estudantes
  is_admin_user()         -- Admin users can view all estudantes
);

-- 5. Create admin access policies for programas table
DROP POLICY IF EXISTS "Admin users can view all programas" ON public.programas;
CREATE POLICY "Admin users can view all programas"
ON public.programas
FOR SELECT
USING (
  auth.uid() = user_id OR -- Users can view their own programas
  is_admin_user()         -- Admin users can view all programas
);

DROP POLICY IF EXISTS "Admin users can insert programas" ON public.programas;
CREATE POLICY "Admin users can insert programas"
ON public.programas
FOR INSERT
WITH CHECK (
  is_admin_user()
);

DROP POLICY IF EXISTS "Admin users can update programas" ON public.programas;
CREATE POLICY "Admin users can update programas"
ON public.programas
FOR UPDATE
USING (
  auth.uid() = user_id OR
  is_admin_user()
)
WITH CHECK (
  auth.uid() = user_id OR
  is_admin_user()
);

DROP POLICY IF EXISTS "Admin users can delete programas" ON public.programas;
CREATE POLICY "Admin users can delete programas"
ON public.programas
FOR DELETE
USING (
  auth.uid() = user_id OR
  is_admin_user()
);

-- Add policy for 'date' column
DROP POLICY IF EXISTS "Admin users can manage date column in programas" ON public.programas;
CREATE POLICY "Admin users can manage date column in programas"
ON public.programas
FOR ALL
USING (
  is_admin_user()
)
WITH CHECK (
  is_admin_user()
);

-- 6. Ensure RLS is enabled on all tables
ALTER TABLE IF EXISTS public.audit_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.estudantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.programas ENABLE ROW LEVEL SECURITY;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_overrides_user_id ON public.audit_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_estudantes_user_id ON public.estudantes(user_id);
CREATE INDEX IF NOT EXISTS idx_programas_user_id ON public.programas(user_id);

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 9. Update existing data to ensure consistency
-- Set default values for any null user_id fields
UPDATE public.audit_overrides 
SET user_id = auth.uid() 
WHERE user_id IS NULL AND auth.uid() IS NOT NULL;

-- 10. Create a view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admin_users,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'instrutor') as instructor_users,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'estudante') as student_users,
  (SELECT COUNT(*) FROM public.estudantes) as total_estudantes,
  (SELECT COUNT(*) FROM public.programas) as total_programas,
  (SELECT COUNT(DISTINCT congregacao) FROM public.profiles WHERE congregacao IS NOT NULL) as total_congregations,
  NOW() as last_updated;

-- Grant access to the view
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- 11. Create a function to get user statistics for admin
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS TABLE(
  total_users BIGINT,
  admin_users BIGINT,
  instructor_users BIGINT,
  student_users BIGINT,
  total_estudantes BIGINT,
  total_programas BIGINT,
  total_congregations BIGINT
) AS $$
BEGIN
  -- Only allow admin users to call this function
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.profiles),
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin'),
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'instrutor'),
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'estudante'),
    (SELECT COUNT(*) FROM public.estudantes),
    (SELECT COUNT(*) FROM public.programas),
    (SELECT COUNT(DISTINCT congregacao) FROM public.profiles WHERE congregacao IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_statistics() TO authenticated;

-- 12. Log the migration completion
INSERT INTO public.audit_overrides (user_id, action, table_name, details, created_at)
VALUES (
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'MIGRATION',
  'admin_dashboard_rls_fix',
  'Applied admin dashboard RLS policies and functions',
  NOW()
);

