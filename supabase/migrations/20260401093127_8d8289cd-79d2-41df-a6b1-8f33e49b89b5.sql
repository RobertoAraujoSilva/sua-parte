-- Fix 1: Add missing INSERT/UPDATE/DELETE policies for meeting_parts
CREATE POLICY "Users can insert meeting parts"
ON public.meeting_parts FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.meetings
  WHERE meetings.id = meeting_parts.meeting_id
  AND meetings.user_id = auth.uid()
));

CREATE POLICY "Users can update meeting parts"
ON public.meeting_parts FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.meetings
  WHERE meetings.id = meeting_parts.meeting_id
  AND meetings.user_id = auth.uid()
));

CREATE POLICY "Users can delete meeting parts"
ON public.meeting_parts FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.meetings
  WHERE meetings.id = meeting_parts.meeting_id
  AND meetings.user_id = auth.uid()
));

-- Fix 2: Restrict user_roles SELECT from public to authenticated only
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);