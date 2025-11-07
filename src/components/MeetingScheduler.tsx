import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Sparkles, Save, X, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Student {
  id: string;
  nome: string;
  cargo: 'estudante_novo' | 'publicador_nao_batizado' | 'publicador_batizado' | 'pioneiro_regular' | 'servo_ministerial' | 'anciao';
  genero: 'masculino' | 'feminino';
  idade: number;
  ativo: boolean;
  total_assignments?: number;
  last_assignment_date?: string;
}

interface MeetingPart {
  id?: string;
  part_number: number;
  part_type: string;
  title: string;
  duration_minutes: number;
  assigned_student_id?: string;
  helper_id?: string;
  assigned_student?: Student;
  helper?: Student;
}

interface MeetingSchedulerProps {
  onClose?: () => void;
  onSave?: () => void;
  initialDate?: string;
  meetingId?: string;
}

const MIDWEEK_PARTS = [
  { type: 'bible_reading', title: 'Leitura da Bíblia', duration: 4, requiresHelper: false },
  { type: 'initial_call', title: 'Primeira Conversa', duration: 3, requiresHelper: true },
  { type: 'return_visit', title: 'Revisita', duration: 4, requiresHelper: true },
  { type: 'bible_study', title: 'Estudo Bíblico', duration: 5, requiresHelper: true },
  { type: 'talk', title: 'Discurso', duration: 5, requiresHelper: false },
];

const PART_TYPE_LABELS: Record<string, string> = {
  bible_reading: 'Leitura da Bíblia',
  initial_call: 'Primeira Conversa',
  return_visit: 'Revisita',
  bible_study: 'Estudo Bíblico',
  talk: 'Discurso',
  demonstration: 'Demonstração'
};

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  onClose,
  onSave,
  initialDate,
  meetingId
}) => {
  const [meetingDate, setMeetingDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));
  const [meetingType, setMeetingType] = useState<'midweek' | 'weekend'>('midweek');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parts, setParts] = useState<MeetingPart[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);

  useEffect(() => {
    loadStudents();
    if (meetingType === 'midweek') {
      initializeMidweekParts();
    }
  }, [meetingType]);

  const loadStudents = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('estudantes')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;

      // Get assignment counts for each student
      const studentsWithStats = await Promise.all(
        (data || []).map(async (student) => {
          const { count } = await supabase
            .from('designacoes')
            .select('*', { count: 'exact', head: true })
            .eq('id_estudante', student.id);

          const { data: lastAssignment } = await supabase
            .from('designacoes')
            .select('data_designacao')
            .eq('id_estudante', student.id)
            .order('data_designacao', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...student,
            total_assignments: count || 0,
            last_assignment_date: lastAssignment?.data_designacao
          };
        })
      );

      setStudents(studentsWithStats);
    } catch (err) {
      console.error('Error loading students:', err);
      toast({
        title: 'Erro ao carregar estudantes',
        description: 'Não foi possível carregar a lista de estudantes',
        variant: 'destructive'
      });
    }
  };

  const initializeMidweekParts = () => {
    const initialParts = MIDWEEK_PARTS.map((part, index) => ({
      part_number: index + 1,
      part_type: part.type,
      title: part.title,
      duration_minutes: part.duration,
      assigned_student_id: undefined,
      helper_id: undefined
    }));
    setParts(initialParts);
  };

  const getQualifiedStudents = (partType: string, excludeIds: string[] = []): Student[] => {
    return students.filter(student => {
      if (excludeIds.includes(student.id)) return false;

      switch (partType) {
        case 'bible_reading':
          // Only baptized males
          return student.genero === 'masculino' && 
                 ['publicador_batizado', 'pioneiro_regular', 'servo_ministerial', 'anciao'].includes(student.cargo);
        
        case 'talk':
          // Only baptized males
          return student.genero === 'masculino' && 
                 ['publicador_batizado', 'pioneiro_regular', 'servo_ministerial', 'anciao'].includes(student.cargo);
        
        case 'initial_call':
        case 'return_visit':
        case 'bible_study':
          // Both males and females, baptized or unbaptized publishers
          return ['publicador_nao_batizado', 'publicador_batizado', 'pioneiro_regular', 'servo_ministerial', 'anciao'].includes(student.cargo);
        
        default:
          return true;
      }
    }).sort((a, b) => {
      // Sort by: fewer assignments first, then by last assignment date
      if (a.total_assignments !== b.total_assignments) {
        return (a.total_assignments || 0) - (b.total_assignments || 0);
      }
      if (a.last_assignment_date && b.last_assignment_date) {
        return new Date(a.last_assignment_date).getTime() - new Date(b.last_assignment_date).getTime();
      }
      return 0;
    });
  };

  const autoAssignParts = () => {
    setAutoAssigning(true);
    
    const updatedParts = [...parts];
    const assignedStudentIds: string[] = [];

    updatedParts.forEach(part => {
      // Assign main student
      const qualifiedStudents = getQualifiedStudents(part.part_type, assignedStudentIds);
      if (qualifiedStudents.length > 0) {
        const selectedStudent = qualifiedStudents[0];
        part.assigned_student_id = selectedStudent.id;
        part.assigned_student = selectedStudent;
        assignedStudentIds.push(selectedStudent.id);

        // Assign helper if needed
        const needsHelper = ['initial_call', 'return_visit', 'bible_study'].includes(part.part_type);
        if (needsHelper) {
          const helperCandidates = getQualifiedStudents(part.part_type, assignedStudentIds);
          if (helperCandidates.length > 0) {
            const selectedHelper = helperCandidates[0];
            part.helper_id = selectedHelper.id;
            part.helper = selectedHelper;
            assignedStudentIds.push(selectedHelper.id);
          }
        }
      }
    });

    setParts(updatedParts);
    setAutoAssigning(false);

    toast({
      title: 'Designações Automáticas Concluídas',
      description: `${assignedStudentIds.length} estudantes foram designados automaticamente`,
    });
  };

  const updatePartAssignment = (partIndex: number, field: 'assigned_student_id' | 'helper_id', studentId: string) => {
    const updatedParts = [...parts];
    const student = students.find(s => s.id === studentId);
    
    if (field === 'assigned_student_id') {
      updatedParts[partIndex].assigned_student_id = studentId;
      updatedParts[partIndex].assigned_student = student;
    } else {
      updatedParts[partIndex].helper_id = studentId;
      updatedParts[partIndex].helper = student;
    }
    
    setParts(updatedParts);
  };

  const saveMeeting = async () => {
    if (!title.trim()) {
      toast({
        title: 'Título obrigatório',
        description: 'Por favor, informe um título para a reunião',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      // Create meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          user_id: userData.user.id,
          meeting_date: meetingDate,
          meeting_type: meetingType === 'midweek' ? 'regular_midweek' : 'regular_weekend',
          title,
          description,
          status: 'scheduled'
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Create meeting parts
      const partsToInsert = parts
        .filter(part => part.assigned_student_id)
        .map(part => ({
          meeting_id: meeting.id,
          part_number: part.part_number,
          part_type: part.part_type,
          title: part.title,
          duration_minutes: part.duration_minutes,
          assigned_student_id: part.assigned_student_id,
          helper_id: part.helper_id
        }));

      if (partsToInsert.length > 0) {
        const { error: partsError } = await supabase
          .from('meeting_parts')
          .insert(partsToInsert);

        if (partsError) throw partsError;
      }

      // Create designacoes records for tracking
      const designacoes = parts
        .filter(part => part.assigned_student_id)
        .map(part => ({
          user_id: userData.user.id,
          id_programa: meeting.id,
          id_estudante: part.assigned_student_id!,
          id_ajudante: part.helper_id,
          titulo_parte: part.title,
          tempo_minutos: part.duration_minutes,
          numero_parte: part.part_number,
          tipo_parte: part.part_type,
          data_designacao: meetingDate,
          confirmado: false
        }));

      if (designacoes.length > 0) {
        const { error: designacoesError } = await supabase
          .from('designacoes')
          .insert(designacoes);

        if (designacoesError) throw designacoesError;
      }

      toast({
        title: 'Reunião Criada com Sucesso!',
        description: `${partsToInsert.length} partes foram designadas`,
      });

      onSave?.();
      onClose?.();
    } catch (err) {
      console.error('Error saving meeting:', err);
      toast({
        title: 'Erro ao salvar reunião',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPartTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'bible_reading': return 'bg-blue-100 text-blue-800';
      case 'initial_call': return 'bg-green-100 text-green-800';
      case 'return_visit': return 'bg-purple-100 text-purple-800';
      case 'bible_study': return 'bg-orange-100 text-orange-800';
      case 'talk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Nova Reunião
          </CardTitle>
          <CardDescription>
            Configure a reunião e designe as partes automaticamente ou manualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meeting Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-date">Data da Reunião</Label>
              <Input
                id="meeting-date"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-type">Tipo de Reunião</Label>
              <Select value={meetingType} onValueChange={(value: 'midweek' | 'weekend') => setMeetingType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midweek">Meio de Semana</SelectItem>
                  <SelectItem value="weekend">Fim de Semana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reunião Vida e Ministério - Semana de 7 de novembro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Informações adicionais"
              />
            </div>
          </div>

          {/* Auto-assign Button */}
          <div className="flex items-center gap-3 py-4 border-t">
            <Button
              onClick={autoAssignParts}
              disabled={autoAssigning || parts.length === 0}
              className="bg-jw-blue hover:bg-jw-blue-dark"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Designar Automaticamente
            </Button>
            <p className="text-sm text-gray-600">
              O sistema irá balancear as designações entre os estudantes qualificados
            </p>
          </div>

          {/* Parts Assignment */}
          {parts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Partes da Reunião</h3>
                <Badge variant="outline">
                  {parts.filter(p => p.assigned_student_id).length} / {parts.length} designadas
                </Badge>
              </div>

              <div className="space-y-3">
                {parts.map((part, index) => (
                  <Card key={index} className="border-l-4 border-l-jw-blue">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getPartTypeBadgeColor(part.part_type)}>
                              Parte {part.part_number}
                            </Badge>
                            <div>
                              <p className="font-medium">{part.title}</p>
                              <p className="text-sm text-gray-600">
                                {PART_TYPE_LABELS[part.part_type]} • {part.duration_minutes} min
                              </p>
                            </div>
                          </div>
                          <Clock className="w-4 h-4 text-gray-400" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm">Estudante Principal</Label>
                            <Select
                              value={part.assigned_student_id || ''}
                              onValueChange={(value) => updatePartAssignment(index, 'assigned_student_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um estudante" />
                              </SelectTrigger>
                              <SelectContent>
                                {getQualifiedStudents(part.part_type).map(student => (
                                  <SelectItem key={student.id} value={student.id}>
                                    {student.nome} ({student.cargo.replace(/_/g, ' ')})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {['initial_call', 'return_visit', 'bible_study'].includes(part.part_type) && (
                            <div className="space-y-2">
                              <Label className="text-sm">Ajudante</Label>
                              <Select
                                value={part.helper_id || ''}
                                onValueChange={(value) => updatePartAssignment(index, 'helper_id', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um ajudante" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getQualifiedStudents(part.part_type, part.assigned_student_id ? [part.assigned_student_id] : []).map(student => (
                                    <SelectItem key={student.id} value={student.id}>
                                      {student.nome} ({student.cargo.replace(/_/g, ' ')})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {part.assigned_student_id && (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                            <CheckCircle className="w-4 h-4" />
                            <span>Parte designada com sucesso</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              onClick={saveMeeting}
              disabled={loading || parts.filter(p => p.assigned_student_id).length === 0}
              className="bg-jw-blue hover:bg-jw-blue-dark"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Reunião
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
