-- =====================================================
-- Sistema Ministerial - Add Admin Role
-- Migration to add 'admin' role to user_role enum
-- =====================================================

-- Step 1: Add 'admin' role to user_role enum
ALTER TYPE user_role ADD VALUE 'admin';

-- Step 2: Update existing profiles to have admin role for specific users
-- (You can customize this based on your needs)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'frankwebber33@hotmail.com' 
   OR nome_completo ILIKE '%Franklin%'
   OR id = '094883b0-6a5b-4594-a433-b2deb506739d'; -- Your current user ID

-- Step 3: Create admin-specific RLS policies
-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Step 4: Create admin dashboard access function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Step 5: Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Step 6: Create admin dashboard table for system management
CREATE TABLE IF NOT EXISTS public.admin_dashboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_name VARCHAR(100) NOT NULL UNIQUE,
  stat_value JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admin dashboard stats
ALTER TABLE public.admin_dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin dashboard stats
CREATE POLICY "Only admins can access admin dashboard stats"
  ON public.admin_dashboard_stats FOR ALL
  USING (public.is_admin());

-- Insert initial admin dashboard stats
INSERT INTO public.admin_dashboard_stats (stat_name, stat_value) VALUES
  ('system_overview', '{"total_users": 0, "total_congregations": 0, "active_programs": 0}'),
  ('mwb_management', '{"total_versions": 0, "last_download": null, "pending_updates": 0}'),
  ('system_health', '{"status": "healthy", "last_check": null, "errors": []}')
ON CONFLICT (stat_name) DO NOTHING;

-- Step 7: Create admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_table VARCHAR(100),
  target_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admin audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin audit log
CREATE POLICY "Only admins can view admin audit log"
  ON public.admin_audit_log FOR SELECT
  USING (public.is_admin());

-- Create RLS policy for admin audit log insert
CREATE POLICY "System can insert admin audit log"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (true);

-- Step 8: Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_name VARCHAR(100),
  target_table_name VARCHAR(100) DEFAULT NULL,
  target_record_id UUID DEFAULT NULL,
  changes_data JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_table,
    target_id,
    changes
  ) VALUES (
    auth.uid(),
    action_name,
    target_table_name,
    target_record_id,
    changes_data
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_admin_action(VARCHAR, VARCHAR, UUID, JSONB) TO authenticated;

-- Step 9: Update existing RLS policies to allow admin access
-- Allow admins to view all estudantes
CREATE POLICY "Admins can view all estudantes"
  ON public.estudantes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to manage all estudantes
CREATE POLICY "Admins can manage all estudantes"
  ON public.estudantes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to view all programas
CREATE POLICY "Admins can view all programas"
  ON public.programas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to manage all programas
CREATE POLICY "Admins can manage all programas"
  ON public.programas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 10: Create admin dashboard view
CREATE OR REPLACE VIEW public.admin_dashboard_view AS
SELECT 
  'users' as category,
  COUNT(*) as count,
  'Total registered users' as description
FROM public.profiles
UNION ALL
SELECT 
  'congregations' as category,
  COUNT(DISTINCT congregacao) as count,
  'Total congregations' as description
FROM public.profiles
WHERE congregacao IS NOT NULL AND congregacao != ''
UNION ALL
SELECT 
  'active_programs' as category,
  COUNT(*) as count,
  'Active weekly programs' as description
FROM public.programas
WHERE status = 'ativo'
UNION ALL
SELECT 
  'total_assignments' as category,
  COUNT(*) as count,
  'Total assignments generated' as description
FROM public.designacoes;

-- Grant access to admin dashboard view
GRANT SELECT ON public.admin_dashboard_view TO authenticated;

-- Create RLS policy for admin dashboard view
ALTER VIEW public.admin_dashboard_view SET (security_invoker = true);

-- Step 11: Log the migration
SELECT public.log_admin_action(
  'migration_applied',
  'system',
  NULL,
  '{"migration": "20250815000000_add_admin_role", "status": "completed"}'
);

-- =====================================================
-- Migration completed successfully!
-- =====================================================
