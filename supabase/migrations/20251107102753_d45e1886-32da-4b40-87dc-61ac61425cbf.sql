-- Add missing columns to designacoes table
ALTER TABLE designacoes 
  ADD COLUMN IF NOT EXISTS numero_parte INTEGER,
  ADD COLUMN IF NOT EXISTS tipo_parte TEXT,
  ADD COLUMN IF NOT EXISTS confirmado BOOLEAN DEFAULT false;

-- Add missing columns to programas table
ALTER TABLE programas
  ADD COLUMN IF NOT EXISTS data_inicio_semana DATE,
  ADD COLUMN IF NOT EXISTS mes_apostila TEXT,
  ADD COLUMN IF NOT EXISTS assignment_status TEXT DEFAULT 'pending';

-- Create meetings table if not exists
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  meeting_date DATE NOT NULL,
  start_time TIME,
  meeting_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'scheduled',
  event_details JSONB,
  meeting_flow JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meetings" ON meetings
  FOR ALL USING (auth.uid() = user_id);

-- Create meeting_parts table
CREATE TABLE IF NOT EXISTS meeting_parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  part_number INTEGER,
  part_type TEXT,
  title TEXT,
  duration_minutes INTEGER,
  assigned_student_id UUID REFERENCES estudantes(id),
  helper_id UUID REFERENCES estudantes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE meeting_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meeting parts" ON meeting_parts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_parts.meeting_id AND meetings.user_id = auth.uid())
  );

-- Create administrative_assignments table
CREATE TABLE IF NOT EXISTS administrative_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  assignment_date DATE NOT NULL,
  role TEXT NOT NULL,
  id_estudante UUID REFERENCES estudantes(id),
  assigned_room TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE administrative_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own admin assignments" ON administrative_assignments
  FOR ALL USING (auth.uid() = user_id);

-- Create special_events table
CREATE TABLE IF NOT EXISTS special_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  event_type TEXT,
  cancel_midweek_meetings BOOLEAN DEFAULT false,
  cancel_weekend_meetings BOOLEAN DEFAULT false,
  study_materials JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE special_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own special events" ON special_events
  FOR ALL USING (auth.uid() = user_id);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  room_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own rooms" ON rooms
  FOR ALL USING (auth.uid() = user_id);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  relation TEXT,
  gender TEXT,
  email TEXT,
  phone TEXT,
  invitation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own family members" ON family_members
  FOR ALL USING (auth.uid() = user_id);