-- Fix database schema issues
-- Run this in Supabase SQL Editor

-- 1. Create or update programas table with correct schema
CREATE TABLE IF NOT EXISTS programas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  semana TEXT,
  conteudo JSONB,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programas' AND column_name = 'data') THEN
    ALTER TABLE programas ADD COLUMN data DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programas' AND column_name = 'titulo') THEN
    ALTER TABLE programas ADD COLUMN titulo TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE programas ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for programas
DROP POLICY IF EXISTS "Admin can do everything on programas" ON programas;
CREATE POLICY "Admin can do everything on programas" ON programas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Instructors can read programas" ON programas;
CREATE POLICY "Instructors can read programas" ON programas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'instrutor')
    )
  );

-- 5. Ensure profiles table has correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome_completo TEXT,
  congregacao TEXT,
  cargo TEXT,
  role user_role DEFAULT 'instrutor',
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create user_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'instrutor', 'estudante', 'family_member');
  END IF;
END $$;

-- 7. Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. Admin policies for profiles
DROP POLICY IF EXISTS "Admin can do everything on profiles" ON profiles;
CREATE POLICY "Admin can do everything on profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 10. Create admin user if not exists
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'amazonwebber007@gmail.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin", "nome_completo": "Admin", "congregacao": "Sistema"}'
) ON CONFLICT (email) DO NOTHING;

-- 11. Ensure admin profile exists
INSERT INTO profiles (id, nome_completo, congregacao, cargo, role)
SELECT id, 'Admin', 'Sistema', 'Administrador', 'admin'::user_role
FROM auth.users 
WHERE email = 'amazonwebber007@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;