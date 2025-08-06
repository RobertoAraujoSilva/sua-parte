-- Create user role enum
CREATE TYPE user_role AS ENUM ('instrutor', 'estudante');

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role user_role DEFAULT 'instrutor';

-- Update existing profiles to have instrutor role by default
UPDATE public.profiles SET role = 'instrutor' WHERE role IS NULL;

-- Make role column NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN role SET NOT NULL;

-- Create function to handle new user registration
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

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for profiles table to include role-based access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Recreate policies with role considerations
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow instrutores to view all profiles in their congregation
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

-- Update estudantes table policies to work with role system
-- Instrutores can manage all students in their congregation
CREATE POLICY "Instrutores can manage congregation students"
  ON public.estudantes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'instrutor'
      AND profiles.congregacao = (
        SELECT congregacao FROM public.profiles student_profile
        WHERE student_profile.id = public.estudantes.user_id
      )
    )
  );

-- Estudantes can only view their own record
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

-- Create a view for user profiles with role information
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

-- Grant access to the view
GRANT SELECT ON public.user_profiles TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.user_profiles SET (security_invoker = true);

-- Create function to get current user profile
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

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;
