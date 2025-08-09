import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, User, BookOpen, Users, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface FamilyMemberData {
  id: string;
  name: string;
  relation: string;
  student_id: string;
  student_name: string;
}

interface Assignment {
  id: string;
  meeting_date: string;
  part_number: number;
  part_title: string;
  assignment_type: string;
  student_name: string;
  assistant_name?: string;
  theme: string;
  duration_minutes: number;
  status: string;
}

const PortalFamiliar: React.FC = () => {
  const { user } = useAuth();
  const [familyMemberData, setFamilyMemberData] = useState<FamilyMemberData | null>(null);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFamilyMemberData();
    }
  }, [user]);

  const loadFamilyMemberData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get family member data based on user email
      const { data: familyMember, error: familyError } = await supabase
        .from('family_members')
        .select(`
          id,
          name,
          relation,
          student_id,
          profiles!family_members_student_id_fkey (
            nome_completo
          )
        `)
        .eq('email', user.email)
        .eq('invitation_status', 'ACCEPTED')
        .single();

      if (familyError || !familyMember) {
        console.error('❌ Error loading family member data:', familyError);
        setError('Dados do familiar não encontrados ou acesso não autorizado.');
        setLoading(false);
        return;
      }

      const familyData: FamilyMemberData = {
        id: familyMember.id,
        name: familyMember.name,
        relation: familyMember.relation,
        student_id: familyMember.student_id,
        student_name: familyMember.profiles?.nome_completo || 'Nome não encontrado',
      };

      setFamilyMemberData(familyData);

      // Load upcoming assignments for the student
      await loadUpcomingAssignments(familyMember.student_id);
    } catch (error) {
      console.error('❌ Exception loading family member data:', error);
      setError('Erro ao carregar dados do portal familiar.');
      setLoading(false);
    }
  };

  const loadUpcomingAssignments = async (studentId: string) => {
    try {
      // Get upcoming assignments for the next 8 weeks
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 56); // 8 weeks

      // First, get designacoes for the student
      const { data: designacoes, error: designacoesError } = await supabase
        .from('designacoes')
        .select('*')
        .eq('id_estudante', studentId);

      if (designacoesError) {
        console.error('❌ Error loading designacoes:', designacoesError);
        setError('Erro ao carregar designações.');
        setLoading(false);
        return;
      }

      if (!designacoes || designacoes.length === 0) {
        setUpcomingAssignments([]);
        setLoading(false);
        return;
      }

      // Get programa IDs from designacoes
      const programaIds = [...new Set(designacoes.map(d => d.id_programa).filter(Boolean))];

      // Get programas data
      const { data: assignments, error: assignmentsError } = await supabase
        .from('programas')
        .select('*')
        .in('id', programaIds)
        .gte('data_inicio_semana', new Date().toISOString().split('T')[0])
        .lte('data_inicio_semana', futureDate.toISOString().split('T')[0])
        .order('data_inicio_semana', { ascending: true });

      if (assignmentsError) {
        console.error('❌ Error loading programas:', assignmentsError);
        setError('Erro ao carregar programas.');
        setLoading(false);
        return;
      }

      // Get student data
      const { data: estudante, error: estudanteError } = await supabase
        .from('estudantes')
        .select('nome')
        .eq('id', studentId)
        .single();

      if (estudanteError) {
        console.error('❌ Error loading student data:', estudanteError);
      }

      // Combine the data
      const formattedAssignments: Assignment[] = [];

      (assignments || []).forEach(programa => {
        const relatedDesignacoes = designacoes.filter(d => d.id_programa === programa.id);

        relatedDesignacoes.forEach(designacao => {
          formattedAssignments.push({
            id: designacao.id,
            meeting_date: programa.data_inicio_semana,
            part_number: designacao.numero_parte,
            part_title: `Parte ${designacao.numero_parte}`,
            assignment_type: (designacao as any).tipo_parte || 'designacao',
            student_name: estudante?.nome || 'Nome não encontrado',
            assistant_name: null, // Not available in current schema
            theme: (designacao as any).cena || '',
            duration_minutes: (designacao as any).tempo_minutos || 0,
            status: 'scheduled', // Default status
          });
        });
      });

      setUpcomingAssignments(formattedAssignments);
      setLoading(false);
    } catch (error) {
      console.error('❌ Exception loading assignments:', error);
      setError('Erro ao carregar designações.');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAssignmentTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
      'leitura_biblica': 'Leitura da Bíblia',
      'initial_call': 'Primeira Conversa',
      'return_visit': 'Revisita',
      'bible_study': 'Estudo Bíblico',
      'discurso': 'Discurso',
      'demonstracao': 'Demonstração',
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { label: 'Agendado', variant: 'default' as const },
      'completed': { label: 'Concluído', variant: 'secondary' as const },
      'cancelled': { label: 'Cancelado', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jw-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando portal familiar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!familyMemberData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Dados do familiar não encontrados. Verifique se o convite foi aceito corretamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-jw-blue">Portal Familiar</h1>
        <p className="text-gray-600">
          Acompanhe as designações da Escola do Ministério Teocrático
        </p>
      </div>

      {/* Family Member Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Informações do Familiar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              <p className="text-lg">{familyMemberData.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Parentesco</label>
              <p className="text-lg">{familyMemberData.relation}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Estudante Relacionado</label>
              <p className="text-lg">{familyMemberData.student_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Próximas Designações
            <Badge variant="secondary" className="ml-2">
              {upcomingAssignments.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma designação encontrada para as próximas semanas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">Parte {assignment.part_number}</Badge>
                        {getStatusBadge(assignment.status)}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1">
                        {assignment.part_title}
                      </h3>
                      
                      <p className="text-gray-600 mb-2">{assignment.theme}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(assignment.meeting_date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {assignment.duration_minutes} minutos
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {assignment.student_name}
                        </div>
                        {assignment.assistant_name && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Assistente: {assignment.assistant_name}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <Badge variant="secondary">
                          {getAssignmentTypeLabel(assignment.assignment_type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Read-only Notice */}
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          Este é um portal de visualização. Você pode acompanhar as designações, mas não pode fazer alterações.
          Para modificações, entre em contato com o responsável pela Escola do Ministério Teocrático.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PortalFamiliar;
