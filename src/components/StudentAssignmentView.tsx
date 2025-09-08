import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  User,
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface StudentAssignmentViewProps {
  studentId: string;
  showAllAssignments?: boolean;
}

interface Assignment {
  id: string;
  numero_parte: number;
  tipo_parte: string;
  titulo_parte?: string;
  cena?: string;
  tempo_minutos: number;
  confirmado: boolean;
  id_ajudante?: string;
  programa: {
    id: string;
    data_inicio_semana: string;
    mes_apostila?: string;
  };
  ajudante?: {
    id: string;
    nome: string;
  };
}

export const StudentAssignmentView: React.FC<StudentAssignmentViewProps> = ({
  studentId,
  showAllAssignments = false
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudentAssignments();
    
    // Set up real-time subscription
    const assignmentChannel = supabase
      .channel('assignments-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'designacoes',
          filter: `id_estudante=eq.${studentId}`
        },
        (payload) => {
          // Update the specific assignment in the list
          setAssignments(prev => prev.map(assignment =>
            assignment.id === payload.new.id
              ? { ...assignment, ...payload.new }
              : assignment
          ));
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(assignmentChannel);
    };
  }, [studentId]);

  const loadStudentAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: assignmentError } = await supabase
        .from('designacoes')
        .select(`
          id,
          numero_parte,
          tipo_parte,
          titulo_parte,
          cena,
          tempo_minutos,
          confirmado,
          id_ajudante,
          programa:programas (
            id,
            data_inicio_semana,
            mes_apostila
          ),
          ajudante:estudantes!designacoes_id_ajudante_fkey (
            id,
            nome
          )
        `)
        .eq('id_estudante', studentId as any)
        .order('programa.data_inicio_semana', { ascending: false });

      if (assignmentError) {
        throw new Error(assignmentError.message);
      }

      setAssignments((data as any) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar designações');
      console.error('Error loading student assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPartTypeIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'leitura_biblica':
      case 'leitura da bíblia':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'demonstracao':
      case 'primeira conversa':
      case 'revisita':
      case 'estudo bíblico':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'discurso':
        return <User className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPartTypeBadgeColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'leitura_biblica':
      case 'leitura da bíblia':
        return 'bg-blue-100 text-blue-800';
      case 'demonstracao':
      case 'primeira conversa':
      case 'revisita':
      case 'estudo bíblico':
        return 'bg-green-100 text-green-800';
      case 'discurso':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatProgramTitle = (assignment: Assignment) => {
    if (assignment.programa?.mes_apostila) {
      return assignment.programa.mes_apostila;
    }
    
    const date = new Date(assignment.programa?.data_inicio_semana);
    return `Semana de ${date.toLocaleDateString('pt-BR')}`;
  };

  const handleConfirmAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('designacoes')
        .update({ confirmado: true } as any)
        .eq('id', assignmentId as any);

      if (error) throw error;

      // Update local state
      setAssignments(prev => prev.map(assignment =>
        assignment.id === assignmentId
          ? { ...assignment, confirmado: true }
          : assignment
      ));
      
      // Show success message
      toast({
        title: "Participação Confirmada!",
        description: "Sua confirmação de participação foi registrada com sucesso.",
      });
    } catch (err) {
      console.error('Error confirming assignment:', err);
      toast({
        title: "Erro ao Confirmar Participação",
        description: "Ocorreu um erro ao registrar sua confirmação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">Erro ao carregar designações</p>
            <p className="text-red-600 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={loadStudentAssignments}
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nenhuma designação encontrada</p>
            <p className="text-sm text-gray-400">
              As designações aparecerão aqui quando forem programadas pelo instrutor.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingAssignments = showAllAssignments 
    ? assignments 
    : assignments.filter(a => new Date(a.programa?.data_inicio_semana) >= new Date()).slice(0, 3);

  return (
    <div className="space-y-4">
      {upcomingAssignments.map((assignment) => (
        <Card key={assignment.id} className="border-l-4 border-l-jw-blue">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getPartTypeIcon(assignment.tipo_parte)}
                <div>
                  <CardTitle className="text-lg">
                    Parte {assignment.numero_parte}: {assignment.titulo_parte || assignment.tipo_parte}
                  </CardTitle>
                  <CardDescription>
                    {formatProgramTitle(assignment)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className={getPartTypeBadgeColor(assignment.tipo_parte)}>
                  {assignment.tipo_parte}
                </Badge>
                <Badge className={assignment.confirmado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {assignment.confirmado ? 'Confirmado' : 'Pendente'}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Assignment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>
                    {new Date(assignment.programa?.data_inicio_semana).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{assignment.tempo_minutos} minutos</span>
                </div>
              </div>

              {assignment.id_ajudante && assignment.ajudante && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Ajudante:</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{assignment.ajudante.nome}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Scene/Setting */}
            {assignment.cena && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm">
                  <strong>Cenário:</strong> {assignment.cena}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {!assignment.confirmado && (
                <Button 
                  size="sm" 
                  onClick={() => handleConfirmAssignment(assignment.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Participação
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Baixar Material
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {!showAllAssignments && assignments.length > 3 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-3">
                Você tem {assignments.length - 3} designação(ões) adicional(is)
              </p>
              <Button variant="outline" size="sm">
                Ver Todas as Designações
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
