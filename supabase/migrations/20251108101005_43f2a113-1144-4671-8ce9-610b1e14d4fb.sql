-- Add missing columns to family_members for portal and invitations
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS student_id uuid;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS invitation_token text;

-- Create invitations_log table for family invitations
CREATE TABLE IF NOT EXISTS public.invitations_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  family_member_id uuid NOT NULL,
  sent_by_student_id uuid,
  invite_method text,
  invite_status text DEFAULT 'SENT',
  invitation_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and policies for invitations_log
ALTER TABLE public.invitations_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can manage own invitations" ON public.invitations_log
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Foreign key to allow nested select between invitations_log and family_members
DO $$ BEGIN
  ALTER TABLE public.invitations_log
    ADD CONSTRAINT invitations_log_family_member_id_fkey
    FOREIGN KEY (family_member_id)
    REFERENCES public.family_members(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add check_student_duplicate function used by import flow
CREATE OR REPLACE FUNCTION public.check_student_duplicate(
  p_user_id uuid,
  p_nome text,
  p_email text,
  p_telefone text
) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.estudantes e
    WHERE e.user_id = p_user_id
      AND (
        (p_nome IS NOT NULL AND e.nome ILIKE p_nome)
        OR (p_email IS NOT NULL AND e.email = p_email)
        OR (p_telefone IS NOT NULL AND e.telefone = p_telefone)
      )
  );
$$;