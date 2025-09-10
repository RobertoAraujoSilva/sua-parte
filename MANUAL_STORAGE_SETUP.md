# Manual Storage Setup Instructions

Since programmatic bucket creation is not possible with the current permissions, you'll need to manually set up the storage bucket and policies through the Supabase dashboard.

## Step 1: Create the Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create bucket**
4. Enter the following details:
   - **Bucket name**: `programas`
   - **Public bucket**: Check this box (makes files publicly readable)
5. Click **Create bucket**

## Step 2: Apply Storage Policies

After creating the bucket, you need to apply the storage policies. Navigate to the **SQL Editor** in your Supabase dashboard and run the following SQL commands:

```sql
-- Storage RLS policies for 'programas' bucket
-- Allow public read access to files in the 'programas' bucket
CREATE POLICY IF NOT EXISTS "programas_read_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'programas');

-- Allow authenticated users to upload files to the 'programas' bucket
CREATE POLICY IF NOT EXISTS "programas_insert_auth"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'programas' AND owner = auth.uid());

-- Allow owners to update their own files
CREATE POLICY IF NOT EXISTS "programas_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'programas' AND owner = auth.uid())
WITH CHECK (bucket_id = 'programas' AND owner = auth.uid());

-- Allow owners to delete their own files
CREATE POLICY IF NOT EXISTS "programas_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'programas' AND owner = auth.uid());

-- Grant necessary permissions
GRANT SELECT ON storage.objects TO public;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
```

## Step 3: Apply Assignment History RLS Policies

Also apply the assignment history policies if they haven't been applied yet:

```sql
-- Fix RLS to allow writing audit rows when saving designações
-- Enable RLS on assignment_history table
ALTER TABLE public.assignment_history ENABLE ROW LEVEL SECURITY;

-- Allow instructors to insert history rows for their congregation's assignments
CREATE POLICY "Instructor can insert assignment history"
ON public.assignment_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.congregation_assignments ca
    JOIN public.congregation_instructors ci
      ON ci.congregation_id = ca.congregation_id
    WHERE ca.id = assignment_history.congregation_assignment_id
      AND ci.user_id = auth.uid()
      AND ci.status = 'active'
  )
);

-- Allow admins to insert history rows
CREATE POLICY "Admin can insert assignment history"
ON public.assignment_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
  )
);

-- Optional integrity guard: ensure changed_by matches the actor
CREATE POLICY "Enforce changed_by = auth.uid()"
ON public.assignment_history
FOR INSERT
WITH CHECK (changed_by = auth.uid());

-- Grant DML to authenticated (RLS still applies)
GRANT INSERT ON public.assignment_history TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
```

## Step 4: Apply Designations RLS Policies

Finally, apply the designations RLS policies:

```sql
-- Ensure RLS on designacoes and add owner-based policies
ALTER TABLE public.designacoes ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
CREATE POLICY IF NOT EXISTS "dz_select_own"
  ON public.designacoes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "dz_insert_own"
  ON public.designacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "dz_update_own"
  ON public.designacoes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "dz_delete_own"
  ON public.designacoes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.designacoes TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
```

## Verification

After applying all the policies:

1. Restart your development server
2. Try uploading a PDF file again
3. Check that the error is resolved

If you still encounter issues, please check the browser console for specific error messages and verify that all policies have been applied correctly.