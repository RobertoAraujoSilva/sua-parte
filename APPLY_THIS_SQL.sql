-- =====================================================
-- Sistema Ministerial - Database Migration
-- Execute this SQL in Supabase Dashboard > SQL Editor
-- =====================================================

-- Step 1: Create user role enum
CREATE TYPE user_role AS ENUM ('instrutor', 'estudante');

-- Step 2: Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role user_role DEFAULT 'instrutor';

-- Step 3: Update existing profiles to have instrutor role by default
UPDATE public.profiles SET role = 'instrutor' WHERE role IS NULL;

-- Step 4: Make role column NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN role SET NOT NULL;

-- Step 5: Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, congregacao, cargo, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''),
    COALESCE(NEW.raw_user_meta_data->>'congregacao', ''),
    COALESCE(NEW.raw_user_meta_data->>'cargo', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'instrutor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Update RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Instrutores can view congregation profiles" ON public.profiles;

-- Step 8: Recreate policies with role considerations
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 9: Allow instrutores to view all profiles in their congregation
CREATE POLICY "Instrutores can view congregation profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles instructor_profile
      WHERE instructor_profile.id = auth.uid()
      AND instructor_profile.role = 'instrutor'
      AND instructor_profile.congregacao = public.profiles.congregacao
    )
  );

-- Step 10: Update estudantes table policies
DROP POLICY IF EXISTS "Instrutores can manage congregation students" ON public.estudantes;
DROP POLICY IF EXISTS "Estudantes can view own record" ON public.estudantes;

CREATE POLICY "Instrutores can manage congregation students"
  ON public.estudantes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'instrutor'
    )
  );

CREATE POLICY "Estudantes can view own record"
  ON public.estudantes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'estudante'
      AND profiles.id = public.estudantes.user_id
    )
  );

-- Step 11: Create a view for user profiles with role information
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  p.id,
  p.nome_completo,
  p.congregacao,
  p.cargo,
  p.role,
  p.created_at,
  p.updated_at,
  u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id;

-- Step 12: Grant access to the view
GRANT SELECT ON public.user_profiles TO authenticated;

-- Step 13: Create function to get current user profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE (
  id UUID,
  nome_completo TEXT,
  congregacao TEXT,
  cargo TEXT,
  role user_role,
  email TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome_completo,
    p.congregacao,
    p.cargo,
    p.role,
    u.email,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 14: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;

-- =====================================================
-- Migration Complete!
-- You can now test the dual-role authentication system
-- =====================================================
