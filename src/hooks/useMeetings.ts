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
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          meeting_parts (*),
          administrative_assignments (*)
        `)
        .eq('user_id', user.id)
        .order('meeting_date', { ascending: true });

      if (error) throw error;
      setMeetings(data || []);
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
      const { data, error } = await supabase
        .from('administrative_assignments')
        .select(`
          *,
          estudantes:id_estudante (
            id,
            nome,
            cargo
          )
        `)
        .eq('user_id', user.id)
        .order('assignment_date', { ascending: true });

      if (error) throw error;
      setAdministrativeAssignments(data || []);
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
      const { data, error } = await supabase
        .from('special_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setSpecialEvents(data || []);
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
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('room_name', { ascending: true });

      if (error) throw error;
      setRooms(data || []);
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

      const { error } = await supabase
        .from('meetings')
        .insert(insertData);

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

      const { error } = await supabase
        .from('meetings')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

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

      const { error } = await supabase
        .from('administrative_assignments')
        .insert(insertData);

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

      const { error } = await supabase
        .from('special_events')
        .insert(insertData);

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

      const { error } = await supabase
        .from('rooms')
        .insert(insertData);

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
