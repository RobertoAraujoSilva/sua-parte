import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  Edit3, 
  Users, 
  Clock, 
  User,
  AlertTriangle,
  FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AssignmentEditModal } from "@/components/AssignmentEditModal";
import { TutorialManager } from "@/components/TutorialManager";
import { TutorialIntegration } from "@/components/TutorialIntegration";
import { JWTerminologyHelper } from "@/components/JWTerminologyHelper";
import { generateAssignmentsPDF } from "@/utils/pdfGenerator";

interface Assignment {
  id: string;
  numero_parte: number;
  titulo_parte: string;
  tipo_parte: string;
  tempo_minutos: number;
  estudante: {
    id: string;
    nome: string;
    cargo: string;
    genero: string;
  };
  ajudante?: {
    id: string;
    nome: string;
    cargo: string;
    genero: string;
  } | null;
  confirmado: boolean;
  [key: string]: any; // Allow additional properties from database
}

interface Program {
  id: string;
  data_inicio_semana: string;
  mes_apostila: string;
  partes: any;
  status: string;
  assignment_status: string;
  assignments_generated_at: string;
  total_assignments_generated: number;
  [key: string]: any; // Allow additional properties
}

const ProgramaPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [program, setProgram] = useState<Program | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadProgramAndAssignments();
    }
  }, [id, user]);

  const loadProgramAndAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load program details
      const { data: programData, error: programError } = await supabase
        .from('programas')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (programError) throw programError;
      setProgram(programData);

      // Load assignments with student details
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('designacoes')
        .select('*')
        .eq('id_programa', id)
        .eq('user_id', user?.id)
        .order('numero_parte');

      if (assignmentsError) throw assignmentsError;
      
      // Load student details separately to avoid embedding issues
      const assignmentIds = (assignmentsData || []).map(a => a.id);
      if (assignmentIds.length > 0) {
        // Load all students for this program
        const studentIds = [
          ...new Set(
            (assignmentsData || []).flatMap(a => [a.id_estudante, a.id_ajudante]).filter(Boolean)
          )
        ];
        
        const { data: studentsData } = await supabase
          .from('estudantes')
          .select('id, nome, cargo, genero')
          .in('id', studentIds);
        
        const studentMap = (studentsData || []).reduce((acc, student) => {
          acc[student.id] = student;
          return acc;
        }, {} as Record<string, any>);
        
        // Transform assignments with student data
        const transformedData = (assignmentsData || []).map(assignment => ({
          ...assignment,
          estudante: studentMap[assignment.id_estudante] || { id: '', nome: '', cargo: '', genero: '' },
          ajudante: assignment.id_ajudante ? studentMap[assignment.id_ajudante] : undefined
        }));
        
        setAssignments(transformedData);
      } else {
        setAssignments([]);
      }

    } catch (error) {
      console.error('Error loading program and assignments:', error);
      setError('Erro ao carregar programa e designações');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProgram = async () => {
    try {
      setIsApproving(true);

      // Update program status to approved
      const { error: programError } = await supabase
        .from('programas')
        .update({ 
          assignment_status: 'approved',
          status: 'aprovado'
        })
        .eq('id', id);

      if (programError) throw programError;

      // Mark all assignments as confirmed
      const { error: assignmentsError } = await supabase
        .from('designacoes')
        .update({ confirmado: true })
        .eq('id_programa', id);

      if (assignmentsError) throw assignmentsError;

      toast({
        title: "Programa Aprovado!",
        description: "Todas as designações foram confirmadas e o programa está pronto para uso.",
      });

      // Reload data to reflect changes
      await loadProgramAndAssignments();

    } catch (error) {
      console.error('Error approving program:', error);
      toast({
        title: "Erro ao Aprovar",
        description: "Ocorreu um erro ao aprovar o programa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRegenerateAssignments = async () => {
    try {
      setIsRegenerating(true);

      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('designacoes')
        .delete()
        .eq('id_programa', id);

      if (deleteError) throw deleteError;

      // Reset program status
      const { error: updateError } = await supabase
        .from('programas')
        .update({ 
          assignment_status: 'pending',
          status: 'ativo'
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: "Designações Removidas",
        description: "Retorne à página de programas para gerar novas designações.",
      });

      // Navigate back to programs page
      navigate('/programas');

    } catch (error) {
      console.error('Error regenerating assignments:', error);
      toast({
        title: "Erro ao Regenerar",
        description: "Ocorreu um erro ao regenerar as designações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!program || assignments.length === 0) {
      toast({
        title: "Dados Insuficientes",
        description: "Não há dados suficientes para gerar o PDF.",
        variant: "destructive"
      });
      return;
    }

    try {
      await generateAssignmentsPDF(program, assignments);
    } catch (error) {
      // Error handling is done in the utility function
      console.error('PDF generation failed:', error);
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowEditModal(true);
  };

  const handleSaveEditedAssignment = (updatedAssignment: Assignment) => {
    // Update the assignment in the local state
    setAssignments(prev => prev.map(a =>
      a.id === updatedAssignment.id ? updatedAssignment : a
    ));

    setEditingAssignment(null);
    setShowEditModal(false);
  };

  const handleCloseEditModal = () => {
    setEditingAssignment(null);
    setShowEditModal(false);
  };

  const getAssignmentTypeLabel = (tipo: string): string => {
    const labels: Record<string, string> = {
      'oracao_abertura': 'Oração de Abertura',
      'comentarios_iniciais': 'Comentários Iniciais',
      'tesouros_palavra': 'Tesouros da Palavra de Deus',
      'joias_espirituais': 'Joias Espirituais',
      'leitura_biblica': 'Leitura da Bíblia',
      'parte_ministerio': 'Parte do Ministério',
      'vida_crista': 'Nossa Vida Cristã',
      'estudo_biblico_congregacao': 'Estudo Bíblico da Congregação',
      'comentarios_finais': 'Comentários Finais',
      'oracao_encerramento': 'Oração de Encerramento'
    };
    return labels[tipo] || tipo;
  };

  const getSectionInfo = (numeroParte: number) => {
    if (numeroParte <= 2) return { section: 'Abertura', color: 'bg-purple-100 text-purple-800' };
    if (numeroParte <= 5) return { section: 'Tesouros da Palavra', color: 'bg-blue-100 text-blue-800' };
    if (numeroParte <= 8) return { section: 'Ministério', color: 'bg-orange-100 text-orange-800' };
    if (numeroParte <= 10) return { section: 'Vida Cristã', color: 'bg-red-100 text-red-800' };
    return { section: 'Encerramento', color: 'bg-gray-100 text-gray-800' };
  };

  const getGenderRestrictionInfo = (tipo: string) => {
    const maleOnly = [
      'oracao_abertura', 'comentarios_iniciais', 'tesouros_palavra',
      'joias_espirituais', 'leitura_biblica', 'vida_crista',
      'estudo_biblico_congregacao', 'comentarios_finais', 'oracao_encerramento'
    ];
    
    return maleOnly.includes(tipo) 
      ? { restriction: 'Apenas Homens', icon: '♂️', color: 'text-blue-600' }
      : { restriction: 'Ambos os Gêneros', icon: '♂️♀️', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jw-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando programa e designações...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Programa não encontrado'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => navigate('/programas')} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Programas
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isApproved = program.assignment_status === 'approved';
  const isDraft = program.assignment_status === 'generated' || program.assignment_status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/programas')} 
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Programas
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-jw-navy">
                Programa - {program.mes_apostila}
              </h1>
              <p className="text-gray-600">
                Semana de {new Date(program.data_inicio_semana).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={isApproved ? "default" : "secondary"}
              className={isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
            >
              {isApproved ? 'Aprovado' : 'Rascunho'}
            </Badge>
            <Badge variant="outline">
              {assignments.length} designações
            </Badge>
          </div>
        </div>

        {/* Tutorial Integration */}
        <TutorialIntegration
          page="program-preview"
          showOnboarding={true}
          onboardingCompleted={localStorage.getItem('onboarding_completed') === 'true'}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          {!isApproved && (
            <>
              <Button 
                onClick={handleApproveProgram}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isApproving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Aprovando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar e Finalizar
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleRegenerateAssignments}
                disabled={isRegenerating}
                variant="outline"
              >
                {isRegenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-jw-blue mr-2" />
                    Regenerando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar Designações
                  </>
                )}
              </Button>
            </>
          )}
          
          {isApproved && (
            <Button
              variant="outline"
              onClick={handleExportPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          )}
        </div>

        {/* Program Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações do Programa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Data de Início</p>
                <p className="font-medium">
                  {new Date(program.data_inicio_semana).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mês da Apostila</p>
                <p className="font-medium">{program.mes_apostila}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Designações</p>
                <p className="font-medium">{assignments.length} partes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-jw-navy mb-4">
            Designações da Reunião
          </h2>
          
          {assignments.map((assignment) => {
            const sectionInfo = getSectionInfo(assignment.numero_parte);
            const genderInfo = getGenderRestrictionInfo(assignment.tipo_parte);
            
            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {assignment.numero_parte.toString().padStart(2, '0')}
                        </Badge>
                        <Badge className={sectionInfo.color}>
                          {sectionInfo.section}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {assignment.tempo_minutos} min
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-jw-navy mb-2">
                        {assignment.titulo_parte}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {getAssignmentTypeLabel(assignment.tipo_parte)}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{assignment.estudante.nome}</span>
                          <Badge variant="outline" className="text-xs">
                            {assignment.estudante.cargo}
                          </Badge>
                        </div>
                        
                        {assignment.ajudante && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{assignment.ajudante.nome}</span>
                            <Badge variant="outline" className="text-xs">
                              Ajudante
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs ${genderInfo.color}`}>
                          {genderInfo.icon} {genderInfo.restriction}
                        </span>
                        {assignment.confirmado && (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            ✓ Confirmado
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {!isApproved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAssignment(assignment)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {assignments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma Designação Encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Este programa ainda não possui designações geradas.
              </p>
              <Button onClick={() => navigate('/programas')}>
                Voltar aos Programas
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />

      {/* Assignment Edit Modal */}
      <AssignmentEditModal
        assignment={editingAssignment}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSave={handleSaveEditedAssignment}
        programId={id || ''}
      />

      {/* Tutorial System */}
      <TutorialManager
        page="program-preview"
        autoStart={false}
        showProgress={true}
      />

      {/* JW Terminology Helper */}
      <JWTerminologyHelper />
    </div>
  );
};

export default ProgramaPreview;
