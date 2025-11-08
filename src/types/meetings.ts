import { Database } from "@/integrations/supabase/types";

// Database types for meetings
export type MeetingRow = Database["public"]["Tables"]["meetings"]["Row"];
export type MeetingInsert = Database["public"]["Tables"]["meetings"]["Insert"];
export type MeetingUpdate = Database["public"]["Tables"]["meetings"]["Update"];

export type AdministrativeAssignmentRow = Database["public"]["Tables"]["administrative_assignments"]["Row"];
export type AdministrativeAssignmentInsert = Database["public"]["Tables"]["administrative_assignments"]["Insert"];
export type AdministrativeAssignmentUpdate = Database["public"]["Tables"]["administrative_assignments"]["Update"];

export type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
export type RoomInsert = Database["public"]["Tables"]["rooms"]["Insert"];
export type RoomUpdate = Database["public"]["Tables"]["rooms"]["Update"];

export type SpecialEventRow = Database["public"]["Tables"]["special_events"]["Row"];
export type SpecialEventInsert = Database["public"]["Tables"]["special_events"]["Insert"];
export type SpecialEventUpdate = Database["public"]["Tables"]["special_events"]["Update"];

export type MeetingPartRow = Database["public"]["Tables"]["meeting_parts"]["Row"];
export type MeetingPartInsert = Database["public"]["Tables"]["meeting_parts"]["Insert"];
export type MeetingPartUpdate = Database["public"]["Tables"]["meeting_parts"]["Update"];

// Enums from database - comprehensive type definitions
export type MeetingType = 
  | 'midweek' 
  | 'weekend' 
  | 'special'
  | 'regular_midweek'
  | 'regular_weekend'
  | 'circuit_overseer_visit'
  | 'assembly_week'
  | 'convention_week'
  | 'memorial'
  | 'special_event'
  | 'cancelled';

export type AdministrativeRole = 
  | 'chairman' 
  | 'reader' 
  | 'attendant' 
  | 'sound' 
  | 'stage'
  | 'meeting_overseer'
  | 'room_overseer';

export type MeetingStatus = 
  | 'scheduled' 
  | 'completed' 
  | 'cancelled'
  | 'in_progress'
  | 'postponed';

export type RoomType = 
  | 'main_hall' 
  | 'auxiliary_room_1' 
  | 'auxiliary_room_2'
  | 'auxiliary_room_3';

// Extended types for UI
export interface MeetingWithParts extends MeetingRow {
  meeting_parts?: MeetingPartRow[];
  administrative_assignments?: AdministrativeAssignmentRow[];
}

export interface AdministrativeAssignmentWithStudent extends AdministrativeAssignmentRow {
  estudante?: {
    id: string;
    nome: string;
    cargo: string;
  };
}

export interface RoomWithOverseer extends RoomRow {
  overseer?: {
    id: string;
    nome: string;
    cargo: string;
  };
}

// Form data types
export interface MeetingFormData {
  meeting_date: string;
  meeting_type: MeetingType;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  circuit_overseer_name?: string;
  service_talk_title?: string;
  closing_song_number?: number;
  event_details?: Record<string, any>;
}

export interface AdministrativeAssignmentFormData {
  id_estudante: string;
  role: AdministrativeRole;
  assignment_date: string;
  start_date?: string;
  end_date?: string;
  is_recurring: boolean;
  assigned_room?: RoomType;
  notes?: string;
}

export interface RoomFormData {
  room_name: string;
  room_type: RoomType;
  capacity: number;
  equipment_available: string[];
  current_overseer_id?: string;
}

export interface SpecialEventFormData {
  event_name: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location?: string;
  theme?: string;
  special_instructions?: string;
  cancels_midweek_meetings: boolean;
  cancels_weekend_meetings: boolean;
  study_materials?: Record<string, any>;
}

export interface MeetingPartFormData {
  part_number: number;
  part_type: string;
  title: string;
  duration_minutes: number;
  assigned_student_id?: string;
  assigned_helper_id?: string;
  assigned_room: RoomType;
  source_material?: string;
  scene_setting?: string;
  special_instructions?: string;
  video_content_url?: string;
  video_start_time?: number;
  video_end_time?: number;
}

// Label mappings for UI
export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  midweek: "Reunião de Meio de Semana",
  weekend: "Reunião de Fim de Semana",
  special: "Evento Especial",
  regular_midweek: "Reunião de Meio de Semana",
  regular_weekend: "Reunião de Fim de Semana",
  circuit_overseer_visit: "Visita do Superintendente de Circuito",
  assembly_week: "Semana de Assembleia",
  convention_week: "Semana de Congresso",
  memorial: "Memorial",
  special_event: "Evento Especial",
  cancelled: "Cancelada"
};

export const ADMINISTRATIVE_ROLE_LABELS: Record<AdministrativeRole, string> = {
  chairman: "Presidente",
  reader: "Leitor",
  attendant: "Atendente",
  sound: "Som",
  stage: "Palco",
  meeting_overseer: "Superintendente da Reunião",
  room_overseer: "Superintendente de Sala"
};

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled: "Agendada",
  in_progress: "Em Andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
  postponed: "Adiada"
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  main_hall: "Salão Principal",
  auxiliary_room_1: "Sala Auxiliar 1",
  auxiliary_room_2: "Sala Auxiliar 2",
  auxiliary_room_3: "Sala Auxiliar 3"
};

// Meeting flow templates
export const REGULAR_MIDWEEK_FLOW = {
  parts: [
    { name: "Cântico de Abertura e Oração", duration: 5 },
    { name: "Comentários Iniciais", duration: 3 },
    { name: "Tesouros da Palavra de Deus", duration: 10 },
    { name: "Faça Seu Melhor no Ministério", duration: 15 },
    { name: "Nossa Vida Cristã", duration: 15 },
    { name: "Comentários Finais", duration: 3 },
    { name: "Cântico Final e Oração", duration: 5 }
  ]
};

export const CIRCUIT_OVERSEER_FLOW = {
  parts: [
    { name: "Revisão do Presidente", duration: 5 },
    { name: "Anúncios", duration: 5 },
    { name: "Leitura de Carta", duration: 10 },
    { name: "Apresentação do Superintendente de Circuito", duration: 2 },
    { name: "Discurso de Serviço", duration: 30 },
    { name: "Cântico Final (escolhido pelo SC)", duration: 5 },
    { name: "Oração Final (outro irmão)", duration: 3 }
  ]
};

// Validation functions
export const validateMeeting = (data: MeetingFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.meeting_date) {
    errors.meeting_date = "Data da reunião é obrigatória";
  }

  if (!data.meeting_type) {
    errors.meeting_type = "Tipo de reunião é obrigatório";
  }

  if (!data.title?.trim()) {
    errors.title = "Título é obrigatório";
  }

  if (data.meeting_type === 'circuit_overseer_visit') {
    if (!data.circuit_overseer_name?.trim()) {
      errors.circuit_overseer_name = "Nome do Superintendente de Circuito é obrigatório";
    }
    if (!data.service_talk_title?.trim()) {
      errors.service_talk_title = "Título do discurso de serviço é obrigatório";
    }
  }

  return errors;
};

export const validateAdministrativeAssignment = (data: AdministrativeAssignmentFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.id_estudante) {
    errors.id_estudante = "Estudante é obrigatório";
  }

  if (!data.role) {
    errors.role = "Função administrativa é obrigatória";
  }

  if (!data.assignment_date) {
    errors.assignment_date = "Data da designação é obrigatória";
  }

  if (data.role === 'room_overseer' && !data.assigned_room) {
    errors.assigned_room = "Sala designada é obrigatória para superintendente de sala";
  }

  return errors;
};

export const validateRoom = (data: RoomFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.room_name?.trim()) {
    errors.room_name = "Nome da sala é obrigatório";
  }

  if (!data.room_type) {
    errors.room_type = "Tipo de sala é obrigatório";
  }

  if (!data.capacity || data.capacity <= 0) {
    errors.capacity = "Capacidade deve ser maior que zero";
  }

  return errors;
};

export const validateSpecialEvent = (data: SpecialEventFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.event_name?.trim()) {
    errors.event_name = "Nome do evento é obrigatório";
  }

  if (!data.event_type?.trim()) {
    errors.event_type = "Tipo de evento é obrigatório";
  }

  if (!data.start_date) {
    errors.start_date = "Data de início é obrigatória";
  }

  if (!data.end_date) {
    errors.end_date = "Data de fim é obrigatória";
  }

  if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
    errors.end_date = "Data de fim deve ser posterior à data de início";
  }

  return errors;
};

// Utility functions
export const isSpecialMeetingWeek = (date: Date, specialEvents: SpecialEventRow[]): boolean => {
  return specialEvents.some(event => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    return date >= startDate && date <= endDate;
  });
};

export const shouldCancelMeeting = (
  meetingDate: Date, 
  meetingType: 'midweek' | 'weekend',
  specialEvents: SpecialEventRow[]
): boolean => {
  return specialEvents.some(event => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    const isInEventPeriod = meetingDate >= startDate && meetingDate <= endDate;
    
    if (!isInEventPeriod) return false;
    
    return (meetingType === 'midweek' && event.cancel_midweek_meetings) ||
           (meetingType === 'weekend' && event.cancel_weekend_meetings);
  });
};

export const getQualifiedAdministrativeRoles = (cargo: string): AdministrativeRole[] => {
  const roles: AdministrativeRole[] = [];
  
  // Only elders can be meeting overseers and chairmen
  if (cargo === 'anciao') {
    roles.push('meeting_overseer', 'chairman', 'room_overseer');
  }
  
  // Ministerial servants can be room overseers
  if (cargo === 'servo_ministerial') {
    roles.push('room_overseer');
  }
  
  return roles;
};
