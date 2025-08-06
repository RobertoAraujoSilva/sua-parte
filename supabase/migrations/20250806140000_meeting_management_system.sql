-- =====================================================
-- Sistema Ministerial - Meeting Management System
-- Migration for comprehensive meeting management
-- =====================================================

-- Create enum types for meeting management
CREATE TYPE meeting_type AS ENUM (
  'regular_midweek',
  'regular_weekend', 
  'circuit_overseer_visit',
  'assembly_week',
  'convention_week',
  'memorial',
  'special_event',
  'cancelled'
);

CREATE TYPE administrative_role AS ENUM (
  'meeting_overseer',      -- Superintendente da Reunião
  'meeting_chairman',      -- Presidente da Reunião  
  'assistant_counselor',   -- Conselheiro Assistente
  'room_overseer',         -- Superintendente de Sala
  'circuit_overseer'       -- Superintendente de Circuito
);

CREATE TYPE meeting_status AS ENUM (
  'scheduled',
  'in_progress', 
  'completed',
  'cancelled',
  'postponed'
);

CREATE TYPE room_type AS ENUM (
  'main_hall',
  'auxiliary_room_1',
  'auxiliary_room_2', 
  'auxiliary_room_3'
);

-- Create meetings table
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_type meeting_type NOT NULL,
  status meeting_status DEFAULT 'scheduled',
  title VARCHAR(200),
  description TEXT,
  start_time TIME,
  end_time TIME,
  
  -- Circuit Overseer specific fields
  circuit_overseer_name VARCHAR(100),
  service_talk_title VARCHAR(200),
  closing_song_number INTEGER,
  
  -- Special event fields
  event_details JSONB,
  
  -- Meeting flow configuration
  meeting_flow JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create administrative_assignments table
CREATE TABLE public.administrative_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  id_estudante UUID REFERENCES public.estudantes(id) ON DELETE CASCADE NOT NULL,
  role administrative_role NOT NULL,
  assignment_date DATE NOT NULL,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  
  -- Assignment period (for recurring roles like Meeting Overseer)
  start_date DATE,
  end_date DATE,
  is_recurring BOOLEAN DEFAULT false,
  
  -- Room assignment for room overseers
  assigned_room room_type,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create rooms table for managing additional rooms
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_name VARCHAR(100) NOT NULL,
  room_type room_type NOT NULL,
  capacity INTEGER CHECK (capacity > 0),
  equipment_available TEXT[],
  is_active BOOLEAN DEFAULT true,
  
  -- Room overseer assignment
  current_overseer_id UUID REFERENCES public.estudantes(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create special_events table for tracking assemblies, conventions, memorial
CREATE TABLE public.special_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_name VARCHAR(200) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'assembly', 'convention', 'memorial', 'co_visit'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Event details
  location VARCHAR(200),
  theme VARCHAR(300),
  special_instructions TEXT,
  
  -- Meeting cancellation rules
  cancels_midweek_meetings BOOLEAN DEFAULT false,
  cancels_weekend_meetings BOOLEAN DEFAULT false,
  
  -- Study materials for personal/family study
  study_materials JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create meeting_parts table for detailed part management
CREATE TABLE public.meeting_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  part_number INTEGER NOT NULL,
  part_type VARCHAR(100) NOT NULL,
  title VARCHAR(300),
  duration_minutes INTEGER,
  
  -- Assignment details
  assigned_student_id UUID REFERENCES public.estudantes(id),
  assigned_helper_id UUID REFERENCES public.estudantes(id),
  assigned_room room_type DEFAULT 'main_hall',
  
  -- Part content
  source_material VARCHAR(500),
  scene_setting VARCHAR(200),
  special_instructions TEXT,
  
  -- Video integration
  video_content_url VARCHAR(500),
  video_start_time INTEGER, -- seconds
  video_end_time INTEGER,   -- seconds
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administrative_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_parts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meetings
CREATE POLICY "Users can view their own meetings"
  ON public.meetings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meetings"
  ON public.meetings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meetings"
  ON public.meetings FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for administrative_assignments
CREATE POLICY "Users can view their own administrative assignments"
  ON public.administrative_assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own administrative assignments"
  ON public.administrative_assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own administrative assignments"
  ON public.administrative_assignments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own administrative assignments"
  ON public.administrative_assignments FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for rooms
CREATE POLICY "Users can view their own rooms"
  ON public.rooms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rooms"
  ON public.rooms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rooms"
  ON public.rooms FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for special_events
CREATE POLICY "Users can view their own special events"
  ON public.special_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own special events"
  ON public.special_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own special events"
  ON public.special_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own special events"
  ON public.special_events FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for meeting_parts
CREATE POLICY "Users can view their own meeting parts"
  ON public.meeting_parts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.meetings 
    WHERE meetings.id = meeting_parts.meeting_id 
    AND meetings.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own meeting parts"
  ON public.meeting_parts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.meetings 
    WHERE meetings.id = meeting_parts.meeting_id 
    AND meetings.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own meeting parts"
  ON public.meeting_parts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.meetings 
    WHERE meetings.id = meeting_parts.meeting_id 
    AND meetings.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own meeting parts"
  ON public.meeting_parts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.meetings 
    WHERE meetings.id = meeting_parts.meeting_id 
    AND meetings.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX idx_meetings_date ON public.meetings(meeting_date);
CREATE INDEX idx_meetings_type ON public.meetings(meeting_type);
CREATE INDEX idx_meetings_status ON public.meetings(status);

CREATE INDEX idx_admin_assignments_user_id ON public.administrative_assignments(user_id);
CREATE INDEX idx_admin_assignments_student ON public.administrative_assignments(id_estudante);
CREATE INDEX idx_admin_assignments_role ON public.administrative_assignments(role);
CREATE INDEX idx_admin_assignments_date ON public.administrative_assignments(assignment_date);

CREATE INDEX idx_rooms_user_id ON public.rooms(user_id);
CREATE INDEX idx_rooms_type ON public.rooms(room_type);
CREATE INDEX idx_rooms_active ON public.rooms(is_active);

CREATE INDEX idx_special_events_user_id ON public.special_events(user_id);
CREATE INDEX idx_special_events_dates ON public.special_events(start_date, end_date);
CREATE INDEX idx_special_events_type ON public.special_events(event_type);

CREATE INDEX idx_meeting_parts_meeting ON public.meeting_parts(meeting_id);
CREATE INDEX idx_meeting_parts_student ON public.meeting_parts(assigned_student_id);
CREATE INDEX idx_meeting_parts_room ON public.meeting_parts(assigned_room);

-- Create triggers for updated_at columns
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_administrative_assignments_updated_at
  BEFORE UPDATE ON public.administrative_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_special_events_updated_at
  BEFORE UPDATE ON public.special_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meeting_parts_updated_at
  BEFORE UPDATE ON public.meeting_parts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
