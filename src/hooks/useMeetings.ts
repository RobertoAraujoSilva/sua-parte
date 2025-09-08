import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  MeetingRow,
  MeetingInsert,
  MeetingUpdate,
  MeetingWithParts,
  AdministrativeAssignmentRow,
  AdministrativeAssignmentInsert,
  AdministrativeAssignmentWithStudent,
  SpecialEventRow,
  SpecialEventInsert,
  RoomRow,
  RoomInsert,
  MeetingPartRow,
  MeetingPartInsert,
  MeetingFormData,
  AdministrativeAssignmentFormData,
  SpecialEventFormData,
  RoomFormData,
  validateMeeting,
  validateAdministrativeAssignment,
  validateSpecialEvent,
  validateRoom,
  shouldCancelMeeting,
  isSpecialMeetingWeek
} from '@/types/meetings';

export const useMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<MeetingWithParts[]>([]);
  const [administrativeAssignments, setAdministrativeAssignments] = useState<AdministrativeAssignmentWithStudent[]>([]);
  const [specialEvents, setSpecialEvents] = useState<SpecialEventRow[]>([]);
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch meetings with parts
  const fetchMeetings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch meetings first
      const { data: meetingsData, error: meetingsError } = await (supabase as any)
        .from('meetings')
        .select('*')
        .eq('user_id', user.id as any)
        .order('meeting_date', { ascending: true });

      if (meetingsError) throw meetingsError;

      // Fetch meeting parts separately
      const { data: partsData, error: partsError } = await (supabase as any)
        .from('meeting_parts')
        .select('*')
        .in('meeting_id', ((meetingsData as any) || []).map((m: any) => (m as any).id));

      if (partsError) throw partsError;

      // Fetch administrative assignments separately
      const { data: adminData, error: adminError } = await (supabase as any)
        .from('administrative_assignments')
        .select('*')
        .eq('user_id', user.id as any);

      if (adminError) throw adminError;

      // Combine the data
      const meetingsWithParts = ((meetingsData as any) || []).map((meeting: any) => ({
        ...(meeting as any),
        meeting_parts: ((partsData as any) || []).filter((part: any) => (part as any).meeting_id === (meeting as any).id),
        administrative_assignments: ((adminData as any) || []).filter((admin: any) => (admin as any).assignment_date === (meeting as any).meeting_date)
      }))

      setMeetings(meetingsWithParts);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar reuniões",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch administrative assignments with student details
  const fetchAdministrativeAssignments = async () => {
    if (!user) return;

    try {
      // Fetch administrative assignments first
      const { data: assignmentsData, error: assignmentsError } = await (supabase as any)
        .from('administrative_assignments')
        .select('*')
        .eq('user_id', user.id as any)
        .order('assignment_date', { ascending: true });

      if (assignmentsError) throw assignmentsError;

      // Get unique student IDs
      const studentIds = [...new Set(((assignmentsData as any) || []).map((a: any) => (a as any).id_estudante).filter(Boolean))];

      // Fetch student details separately if there are any
      let studentsData: any[] = [];
      if (studentIds.length > 0) {
        const { data: students, error: studentsError } = await (supabase as any)
          .from('estudantes')
          .select('id, nome, cargo')
          .in('id', studentIds as any);

        if (studentsError) throw studentsError;
        studentsData = (students as any) || [];
      }

      // Combine the data
      const assignmentsWithStudents = ((assignmentsData as any) || []).map((assignment: any) => ({
        ...(assignment as any),
        estudante: (studentsData as any).find((student: any) => (student as any).id === (assignment as any).id_estudante) || null
      }));

      setAdministrativeAssignments(assignmentsWithStudents);
    } catch (err) {
      console.error('Error fetching administrative assignments:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar designações administrativas",
        variant: "destructive"
      });
    }
  };

  // Fetch special events
  const fetchSpecialEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('special_events')
        .select('*')
        .eq('user_id', user.id as any)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setSpecialEvents((data as any) || []);
    } catch (err) {
      console.error('Error fetching special events:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar eventos especiais",
        variant: "destructive"
      });
    }
  };

  // Fetch rooms
  const fetchRooms = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('rooms')
        .select('*')
        .eq('user_id', user.id as any)
        .eq('is_active', true as any)
        .order('room_name', { ascending: true });

      if (error) throw error;
      setRooms((data as any) || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar salas",
        variant: "destructive"
      });
    }
  };

  // Create meeting
  const createMeeting = async (data: MeetingFormData): Promise<boolean> => {
    if (!user) return false;

    const errors = validateMeeting(data);
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Erro de validação",
        description: Object.values(errors)[0],
        variant: "destructive"
      });
      return false;
    }

    try {
      const insertData: MeetingInsert = {
        ...data,
        user_id: user.id,
        event_details: data.meeting_type === 'special_event' ? {} : null,
        meeting_flow: data.meeting_type === 'circuit_overseer_visit' ? 
          { type: 'circuit_overseer' } : { type: 'regular' }
      };

      const { error } = await (supabase as any)
        .from('meetings')
        .insert(insertData as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Reunião criada com sucesso!",
      });

      await fetchMeetings();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar reunião";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Update meeting
  const updateMeeting = async (id: string, data: Partial<MeetingFormData>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: MeetingUpdate = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { error } = await (supabase as any)
        .from('meetings')
        .update(updateData as any)
        .eq('id', id as any)
        .eq('user_id', user.id as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Reunião atualizada com sucesso!",
      });

      await fetchMeetings();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar reunião";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Create administrative assignment
  const createAdministrativeAssignment = async (data: AdministrativeAssignmentFormData): Promise<boolean> => {
    if (!user) return false;

    const errors = validateAdministrativeAssignment(data);
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Erro de validação",
        description: Object.values(errors)[0],
        variant: "destructive"
      });
      return false;
    }

    try {
      const insertData: AdministrativeAssignmentInsert = {
        ...data,
        user_id: user.id
      };

      const { error } = await (supabase as any)
        .from('administrative_assignments')
        .insert(insertData as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Designação administrativa criada com sucesso!",
      });

      await fetchAdministrativeAssignments();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar designação administrativa";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Create special event
  const createSpecialEvent = async (data: SpecialEventFormData): Promise<boolean> => {
    if (!user) return false;

    const errors = validateSpecialEvent(data);
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Erro de validação",
        description: Object.values(errors)[0],
        variant: "destructive"
      });
      return false;
    }

    try {
      const insertData: SpecialEventInsert = {
        ...data,
        user_id: user.id,
        study_materials: data.study_materials || null
      };

      const { error } = await (supabase as any)
        .from('special_events')
        .insert(insertData as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento especial criado com sucesso!",
      });

      await fetchSpecialEvents();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar evento especial";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Create room
  const createRoom = async (data: RoomFormData): Promise<boolean> => {
    if (!user) return false;

    const errors = validateRoom(data);
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Erro de validação",
        description: Object.values(errors)[0],
        variant: "destructive"
      });
      return false;
    }

    try {
      const insertData: RoomInsert = {
        ...data,
        user_id: user.id,
        is_active: true
      };

      const { error } = await (supabase as any)
        .from('rooms')
        .insert(insertData as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Sala criada com sucesso!",
      });

      await fetchRooms();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar sala";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Check if meeting should be cancelled due to special events
  const checkMeetingCancellation = (meetingDate: Date, meetingType: 'midweek' | 'weekend'): boolean => {
    return shouldCancelMeeting(meetingDate, meetingType, specialEvents);
  };

  // Check if date is during special event
  const checkSpecialMeetingWeek = (date: Date): boolean => {
    return isSpecialMeetingWeek(date, specialEvents);
  };

  // Load all data
  const loadAllData = async () => {
    await Promise.all([
      fetchMeetings(),
      fetchAdministrativeAssignments(),
      fetchSpecialEvents(),
      fetchRooms()
    ]);
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  return {
    meetings,
    administrativeAssignments,
    specialEvents,
    rooms,
    loading,
    createMeeting,
    updateMeeting,
    createAdministrativeAssignment,
    createSpecialEvent,
    createRoom,
    checkMeetingCancellation,
    checkSpecialMeetingWeek,
    fetchMeetings,
    fetchAdministrativeAssignments,
    fetchSpecialEvents,
    fetchRooms,
    loadAllData
  };
};
