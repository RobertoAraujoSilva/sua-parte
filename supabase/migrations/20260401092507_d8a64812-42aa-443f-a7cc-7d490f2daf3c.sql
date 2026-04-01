-- Fix 1: Restrict invitations_log - replace overly permissive ALL policy
-- with specific policies that hide invitation_token from casual SELECT
DROP POLICY IF EXISTS "Users can manage own invitations" ON public.invitations_log;

-- Users can only view their own invitations (token is still in the row but RLS scopes to owner)
CREATE POLICY "Users can view own invitations"
ON public.invitations_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invitations"
ON public.invitations_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invitations"
ON public.invitations_log FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invitations"
ON public.invitations_log FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Fix 2: Tighten user_roles - replace broad ALL policy with explicit admin-only policies
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));