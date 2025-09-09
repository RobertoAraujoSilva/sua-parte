-- Fix missing RLS policies for family_members and invitations_log tables
-- This migration adds the missing Row Level Security policies that are causing
-- family member insertion to hang

-- First, ensure the tables exist and have RLS enabled
-- (They should already exist, but this is a safety check)

-- Enable RLS on family_members table if not already enabled
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Enable RLS on invitations_log table if not already enabled  
ALTER TABLE public.invitations_log ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies (in case they exist but are incorrect)
DROP POLICY IF EXISTS "Users can view their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can create their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can update their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can delete their own family members" ON public.family_members;

DROP POLICY IF EXISTS "Users can view their own invitations" ON public.invitations_log;
DROP POLICY IF EXISTS "Users can create their own invitations" ON public.invitations_log;
DROP POLICY IF EXISTS "Users can update their own invitations" ON public.invitations_log;
DROP POLICY IF EXISTS "Users can delete their own invitations" ON public.invitations_log;

-- Create RLS policies for family_members table
-- Users can only access family members where they are the student

CREATE POLICY "Users can view their own family members"
  ON public.family_members FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own family members"
  ON public.family_members FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own family members"
  ON public.family_members FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Users can delete their own family members"
  ON public.family_members FOR DELETE
  USING (auth.uid() = student_id);

-- Create RLS policies for invitations_log table
-- Users can only access invitations they sent

CREATE POLICY "Users can view their own invitations"
  ON public.invitations_log FOR SELECT
  USING (auth.uid() = sent_by_student_id);

CREATE POLICY "Users can create their own invitations"
  ON public.invitations_log FOR INSERT
  WITH CHECK (auth.uid() = sent_by_student_id);

CREATE POLICY "Users can update their own invitations"
  ON public.invitations_log FOR UPDATE
  USING (auth.uid() = sent_by_student_id);

CREATE POLICY "Users can delete their own invitations"
  ON public.invitations_log FOR DELETE
  USING (auth.uid() = sent_by_student_id);

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_family_members_student_id ON public.family_members(student_id);
CREATE INDEX IF NOT EXISTS idx_family_members_email ON public.family_members(email);
CREATE INDEX IF NOT EXISTS idx_family_members_phone ON public.family_members(phone);

CREATE INDEX IF NOT EXISTS idx_invitations_log_family_member_id ON public.invitations_log(family_member_id);
CREATE INDEX IF NOT EXISTS idx_invitations_log_sent_by_student_id ON public.invitations_log(sent_by_student_id);
CREATE INDEX IF NOT EXISTS idx_invitations_log_status ON public.invitations_log(invite_status);
CREATE INDEX IF NOT EXISTS idx_invitations_log_expires_at ON public.invitations_log(expires_at);

-- Add triggers for automatic timestamp updates (if they don't exist)
CREATE TRIGGER IF NOT EXISTS update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations_log TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.family_members IS 'Family members registered by students for invitation to the portal';
COMMENT ON TABLE public.invitations_log IS 'Log of all invitations sent to family members';

COMMENT ON POLICY "Users can view their own family members" ON public.family_members IS 'Students can only view family members they registered';
COMMENT ON POLICY "Users can create their own family members" ON public.family_members IS 'Students can only create family members for themselves';
COMMENT ON POLICY "Users can update their own family members" ON public.family_members IS 'Students can only update family members they registered';
COMMENT ON POLICY "Users can delete their own family members" ON public.family_members IS 'Students can only delete family members they registered';

COMMENT ON POLICY "Users can view their own invitations" ON public.invitations_log IS 'Students can only view invitations they sent';
COMMENT ON POLICY "Users can create their own invitations" ON public.invitations_log IS 'Students can only create invitations for their family members';
COMMENT ON POLICY "Users can update their own invitations" ON public.invitations_log IS 'Students can only update invitations they sent';
COMMENT ON POLICY "Users can delete their own invitations" ON public.invitations_log IS 'Students can only delete invitations they sent';
