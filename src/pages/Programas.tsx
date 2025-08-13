import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Upload, Calendar, FileText, ArrowLeft, Download, Eye, Trash2, Users, Zap, Settings } from "lucide-react";
import { TutorialButton } from "@/components/tutorial";
import { useAuth } from "@/contexts/AuthContext";
import { PdfUpload } from "@/components/PdfUpload";
import { JWContentParser } from "@/components/JWContentParser";
import { toast } from "@/hooks/use-toast";
import { useAssignmentGeneration } from "@/hooks/useAssignmentGeneration";
import { AssignmentGenerationModal } from "@/components/AssignmentGenerationModal";
import { AssignmentPreviewModal } from "@/components/AssignmentPreviewModal";
import { ProgramDetailModal } from "@/components/ProgramDetailModal";
import { TemplateLibrary } from "@/components/TemplateLibrary";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { generateProgramPDF } from "@/utils/pdfGenerator";

const Programas = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const {
    isGenerating,
    progress,
    currentStep,
    generatedAssignments,
    generateAssignments,
    resetState
  } = useAssignmentGeneration();

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [isConfirmingAssignments, setIsConfirmingAssignments] = useState(false);
  const [programas, setProgramas] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [uploadingSpreadsheet, setUploadingSpreadsheet] = useState(false);
  const [showProgramDetail, setShowProgramDetail] = useState(false);

  // Calculate real statistics from programs data
  const programStats = useMemo(() => {
    const total = programas.length;
    const approved = programas.filter(p => p.assignment_status === 'approved').length;
    const draft = programas.filter(p => p.assignment_status === 'generated').length;
    const pending = programas.filter(p => p.assignment_status === 'pending').length;
    const totalAssignments = programas.reduce((sum, p) => sum + (p.total_assignments_generated || 0), 0);

    return {
      total,
      approved,
      draft,
      pending,
      totalAssignments
    };
  }, [programas]);

  // Load programs from database
  const loadPrograms = async () => {
    if (!user?.id) {
      setLoadingPrograms(false);
      return;
    }

    try {
      setLoadingPrograms(true);
      setProgramsError(null);

      console.log('📚 Loading programs for user:', user.id);

      // Use the new function to get complete program information
      const { data, error } = await supabase
        .rpc('get_programs_complete', { user_uuid: user.id });

      if (error) {
        console.error('❌ Error loading programs:', error);
        setProgramsError(`Erro ao carregar programas: ${error.message}`);
        return;
      }

      console.log('✅ Programs loaded:', data?.length || 0);

      // Transform database data to match UI expectations
      const transformedPrograms = (data || []).map(program => ({
        id: program.id,
        semana: program.semana || program.mes_apostila || `Semana de ${new Date(program.data_inicio_semana).toLocaleDateString('pt-BR')}`,
        arquivo: program.arquivo || `programa-${program.data_inicio_semana}.pdf`,
        status: program.assignment_status === 'generated' ? 'Designações Geradas' :
                program.assignment_status === 'generating' ? 'Gerando Designações' :
                'Aguardando Designações',
        dataImportacao: new Date(program.created_at).toISOString().split('T')[0],
        designacoesGeradas: program.assignment_status === 'generated',
        data_inicio_semana: program.data_inicio_semana,
        mes_apostila: program.mes_apostila,
        assignment_status: program.assignment_status,
        partes: Array.isArray(program.partes) ? program.partes : [
          "Tesouros da Palavra de Deus",
          "Faça Seu Melhor no Ministério",
          "Nossa Vida Cristã"
        ]
      }));

      setProgramas(transformedPrograms);

    } catch (error) {
      console.error('❌ Exception loading programs:', error);
      setProgramsError('Erro inesperado ao carregar programas');
    } finally {
      setLoadingPrograms(false);
    }
  };

  // Load programs when user is available
  useEffect(() => {
    if (user?.id) {
      loadPrograms();
    }
  }, [user?.id]);

  // Debug logging
  console.log('🔍 Programas page - Auth state:', {
    loading,
    hasUser: !!user,
    hasProfile: !!profile,
    userRole: profile?.role,
    metadataRole: user?.user_metadata?.role,
    programsCount: programas.length,
    loadingPrograms
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jw-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const handlePdfUploadComplete = async (uploadData: any) => {
    console.log('PDF upload completed:', uploadData);

    if (!user?.id) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para salvar programas.",
        variant: "destructive"
      });
      return;
    }

    try {
      const dataInicio = uploadData.extractedData?.data_inicio || new Date().toISOString().split('T')[0];
      const mesApostila = uploadData.extractedData?.mes_ano || null;

      // Check for duplicate programs using the database function
      console.log('🔍 Checking for duplicate programs...');
      
      const { data: isDuplicate, error: checkError } = await supabase
        .rpc('check_programa_duplicate', {
          p_user_id: user.id,
          p_mes_apostila: mesApostila || '',
          p_data_inicio_semana: dataInicio
        });

      if (checkError) {
        console.error('❌ Error checking for duplicates:', checkError);
        toast({
          title: "Erro de Verificação",
          description: "Não foi possível verificar programas duplicados. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      if (isDuplicate) {
        console.log('⚠️ Duplicate program found');
        toast({
          title: "Programa Já Existe",
          description: `Um programa para "${mesApostila || 'esta semana'}" já foi importado.`,
          variant: "destructive"
        });
        return;
      }

      // Save program to database
      const programData = {
        user_id: user.id,
        data_inicio_semana: dataInicio,
        mes_apostila: mesApostila,
        partes: uploadData.extractedData?.partes || [
          "Tesouros da Palavra de Deus",
          "Faça Seu Melhor no Ministério",
          "Nossa Vida Cristã"
        ],
        status: 'ativo',
        assignment_status: 'pending'
      };

      console.log('💾 Saving program to database:', programData);

      const { data, error } = await supabase
        .from('programas')
        .insert(programData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving program:', error);
        toast({
          title: "Erro ao Salvar",
          description: `Erro ao salvar programa: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Program saved successfully:', data);

      // Refresh programs list
      await loadPrograms();

      toast({
        title: "Programa Salvo!",
        description: `O programa "${uploadData.extractedData?.semana || 'Programa Importado'}" foi salvo e está pronto para gerar designações.`,
      });

    } catch (error) {
      console.error('❌ Exception saving program:', error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro inesperado ao salvar o programa.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateAssignments = async (programa: any) => {
    if (!user?.id) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para gerar designações.",
        variant: "destructive"
      });
      return;
    }

    setSelectedProgram(programa);
    resetState();

    console.log('🎯 Generating assignments for program:', programa);
    console.log('📋 Program partes raw:', programa.partes);
    console.log('📋 Program partes type:', typeof programa.partes);

    // Ensure partes is an array
    let partes = programa.partes;
    if (typeof partes === 'string') {
      try {
        partes = JSON.parse(partes);
      } catch (error) {
        console.error('Error parsing partes:', error);
        partes = [];
      }
    }
    if (!Array.isArray(partes)) {
      console.error('Partes is not an array:', partes);
      partes = [];
    }

    const programData = {
      id: programa.id.toString(),
      semana: programa.semana || `Semana de ${new Date(programa.data_inicio_semana).toLocaleDateString('pt-BR')}`,
      arquivo: programa.arquivo || 'programa.pdf',
      partes: partes,
      data_inicio_semana: programa.data_inicio_semana || new Date().toISOString().split('T')[0],
      mes_apostila: programa.mes_apostila
    };

    const result = await generateAssignments(programData, user.id);

    if (result.success && result.assignments) {
      // Redirect to preview page instead of showing modal
      navigate(`/programa/${programa.id}`);

      toast({
        title: "Designações Geradas!",
        description: "Revise as designações e aprove quando estiver satisfeito.",
      });
    }
  };

  const handleConfirmAssignments = async () => {
    if (!selectedProgram) return;

    setIsConfirmingAssignments(true);

    try {
      // Update program status
      setProgramas(prev => prev.map(p =>
        p.id === selectedProgram.id
          ? { ...p, status: "Designações Geradas", designacoesGeradas: true }
          : p
      ));

      setShowPreviewModal(false);
      setSelectedProgram(null);

      toast({
        title: "Designações Confirmadas!",
        description: "As designações foram salvas e estão disponíveis na página de Designações.",
      });

      // Navigate to designations page
      setTimeout(() => {
        navigate('/designacoes');
      }, 1500);

    } catch (error) {
      toast({
        title: "Erro ao Confirmar",
        description: "Houve um erro ao confirmar as designações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsConfirmingAssignments(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setSelectedProgram(null);
    resetState();
  };

  const handlePdfUploadStart = () => {
    console.log('PDF upload started');
  };

  const handleSpreadsheetUpload = async (file: File, templateId: string) => {
    try {
      setUploadingSpreadsheet(true);

      // Here you would implement the spreadsheet parsing logic
      // For now, we'll just show a success message
      toast({
        title: "Planilha Recebida!",
        description: "A planilha será processada e as designações geradas automaticamente.",
      });

      // Navigate to the program preview page
      navigate(`/programa/${templateId}`);

    } catch (error) {
      console.error('Error uploading spreadsheet:', error);
      toast({
        title: "Erro no Upload",
        description: "Não foi possível processar a planilha. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploadingSpreadsheet(false);
    }
  };

  // Handler for visualizing program details
  const handleVisualizarPrograma = (programa: any) => {
    console.log('Visualizing program:', programa);
    setSelectedProgram(programa);
    setShowProgramDetail(true);
  };

  // Handler for downloading program PDF
  const handleDownloadPrograma = async (programa: any) => {
    console.log('Downloading program:', programa);

    try {
      // First, try to download from Supabase storage if file exists
      if (programa.arquivo && programa.arquivo !== `programa-${programa.data_inicio_semana}.pdf`) {
        try {
          const { data, error } = await supabase.storage
            .from('programas')
            .download(programa.arquivo);

          if (!error && data) {
            // Create download link
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = programa.arquivo;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
              title: "Download Iniciado",
              description: `Baixando: ${programa.arquivo}`,
            });
            return;
          }
        } catch (storageError) {
          console.log('File not found in storage, will generate PDF instead');
        }
      }

      // If no file in storage, generate a PDF from program data
      await handleGenerateProgramPDF(programa);

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Erro no Download",
        description: "Ocorreu um erro ao tentar baixar o arquivo.",
        variant: "destructive"
      });
    }
  };

  // Generate PDF from program data using utility
  const handleGenerateProgramPDF = async (programa: any) => {
    try {
      await generateProgramPDF(programa);
    } catch (error) {
      // Error handling is done in the utility function
      console.error('PDF generation failed:', error);
    }
  };

  // Handler for deleting program
  const handleDeletarPrograma = async (programa: any) => {
    console.log('Deleting program:', programa);

    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar o programa "${programa.semana}"?\n\nEsta ação não pode ser desfeita e também removerá todas as designações associadas.`
    );

    if (!confirmDelete) return;

    try {
      // Delete the program from database
      const { error } = await supabase
        .from('programas')
        .delete()
        .eq('id', programa.id);

      if (error) {
        console.error('Error deleting program:', error);
        toast({
          title: "Erro ao Deletar",
          description: "Não foi possível deletar o programa. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Remove from local state
      setProgramas(prev => prev.filter(p => p.id !== programa.id));

      toast({
        title: "Programa Deletado",
        description: `O programa "${programa.semana}" foi removido com sucesso.`,
      });

      // Reload programs to ensure consistency
      loadPrograms();

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Erro ao Deletar",
        description: "Ocorreu um erro ao deletar o programa.",
        variant: "destructive"
      });
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processado":
      case "Designações Geradas":
        return "bg-green-100 text-green-800";
      case "Pendente":
      case "Aguardando Designações":
        return "bg-yellow-100 text-yellow-800";
      case "Rascunho":
        return "bg-gray-100 text-gray-800";
      case "Gerando Designações":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-jw-gold"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>

            <div className="flex items-start justify-between">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-4">
                  Gestão de <span className="text-jw-gold">Programas</span>
                </h1>
                <p className="text-xl opacity-90 max-w-2xl">
                  Importe e gerencie programas semanais da apostila Vida e Ministério Cristão
                  com parsing automático e validação inteligente.
                </p>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white hover:bg-white hover:text-jw-navy"
                    onClick={() => navigate('/pdf-parsing-test')}
                  >
                    🧪 Testar Parser Aprimorado
                  </Button>
                </div>
              </div>
              <TutorialButton page="programas" variant="secondary" />
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PDF Upload */}
              <PdfUpload
                onUploadComplete={handlePdfUploadComplete}
                onUploadStart={handlePdfUploadStart}
              />

              {/* JW.org Content Parser */}
              <JWContentParser
                onParseComplete={handlePdfUploadComplete}
              />
            </div>
          </div>
        </section>

        {/* Programs List */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-jw-navy">
                {showTemplateLibrary ? 'Biblioteca de Templates' : 'Programas Importados'}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant={showTemplateLibrary ? "default" : "outline"}
                  onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {showTemplateLibrary ? 'Ver Meus Programas' : 'Templates Prontos'}
                </Button>
                {!showTemplateLibrary && (
                  <Input
                    placeholder="Buscar programas..."
                    className="w-64"
                  />
                )}
              </div>
            </div>

            {/* Template Library */}
            {showTemplateLibrary ? (
              <TemplateLibrary
                onUploadSpreadsheet={handleSpreadsheetUpload}
              />
            ) : (
              <>
                {/* Loading State */}
                {loadingPrograms && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
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
            )}

            {/* Error State */}
            {programsError && !loadingPrograms && (
              <Card className="border-red-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-red-500 mb-2">❌</div>
                    <p className="text-red-700 font-medium mb-2">Erro ao Carregar Programas</p>
                    <p className="text-red-600 text-sm mb-4">{programsError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadPrograms}
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!loadingPrograms && !programsError && programas.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">📄</div>
                    <p className="text-gray-500 mb-2">Nenhum programa encontrado</p>
                    <p className="text-sm text-gray-400">
                      Importe um arquivo PDF para começar a criar programas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Programs List */}
            {!loadingPrograms && !programsError && programas.length > 0 && (
              <div className="space-y-4">
                {programas.map((programa) => (
                <Card
                  key={programa.id}
                  className="hover:shadow-lg transition-shadow"
                  data-cy="program-card"
                  data-testid={`program-card-${programa.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{programa.semana}</CardTitle>
                        <CardDescription>
                          Importado em {new Date(programa.dataImportacao).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(programa.status)}>
                        {programa.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Arquivo:</h4>
                        <p className="text-sm text-gray-600 mb-3">{programa.arquivo}</p>
                        
                        <h4 className="font-medium text-gray-700 mb-2">Partes do Programa:</h4>
                        <ul className="space-y-1">
                          {programa.partes.map((parte, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <div className="w-2 h-2 bg-jw-blue rounded-full mr-2"></div>
                              {parte}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Status das Designações:</h4>
                        <div className="flex items-center gap-2 mb-4">
                          {programa.assignment_status === 'approved' ? (
                            <Badge className="bg-green-100 text-green-800">
                              ✓ Aprovado
                            </Badge>
                          ) : programa.assignment_status === 'generated' ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              📋 Rascunho
                            </Badge>
                          ) : programa.assignment_status === 'generating' ? (
                            <Badge className="bg-orange-100 text-orange-800">
                              ⏳ Gerando...
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              ⏸️ Aguardando
                            </Badge>
                          )}
                          {programa.total_assignments_generated > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {programa.total_assignments_generated} designações
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {/* Visualizar Button - For all programs */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVisualizarPrograma(programa)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>

                          {/* Preview/Review Button - Always available if assignments exist */}
                          {(programa.assignment_status === 'generated' || programa.assignment_status === 'approved') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/programa/${programa.id}`)}
                            >
                              <Users className="w-4 h-4 mr-1" />
                              {programa.assignment_status === 'approved' ? 'Ver Designações' : 'Revisar Designações'}
                            </Button>
                          )}

                          {/* Generate Assignments Button - Only for pending programs */}
                          {programa.assignment_status === 'pending' && (
                            <Button
                              variant="hero"
                              size="sm"
                              onClick={() => handleGenerateAssignments(programa)}
                              disabled={isGenerating}
                              data-testid="generate-assignments-button"
                            >
                              {isGenerating && selectedProgram?.id === programa.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  Gerando...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-1" />
                                  Gerar Designações
                                </>
                              )}
                            </Button>
                          )}

                          {/* Download PDF - Only for approved programs */}
                          {programa.assignment_status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPrograma(programa)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Baixar PDF
                            </Button>
                          )}

                          {/* View Assignments - For approved programs */}
                          {programa.assignment_status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/designacoes')}
                            >
                              <Users className="w-4 h-4 mr-1" />
                              Ver Designações
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeletarPrograma(programa)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
              </>
            )}
          </div>
        </section>

        {/* Statistics */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-jw-navy mb-6">Estatísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-jw-blue mb-2">
                    {loadingPrograms ? (
                      <div className="animate-pulse bg-gray-200 h-9 w-8 rounded mx-auto"></div>
                    ) : (
                      programStats.total
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Programas Importados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {loadingPrograms ? (
                      <div className="animate-pulse bg-gray-200 h-9 w-8 rounded mx-auto"></div>
                    ) : (
                      programStats.approved
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Programas Aprovados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {loadingPrograms ? (
                      <div className="animate-pulse bg-gray-200 h-9 w-8 rounded mx-auto"></div>
                    ) : (
                      programStats.draft
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Rascunhos para Revisão</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {loadingPrograms ? (
                      <div className="animate-pulse bg-gray-200 h-9 w-8 rounded mx-auto"></div>
                    ) : (
                      programStats.totalAssignments
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Designações Geradas</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Assignment Generation Modal */}
      <AssignmentGenerationModal
        isOpen={isGenerating}
        progress={progress}
        currentStep={currentStep}
        programTitle={selectedProgram?.semana || ''}
      />

      {/* Assignment Preview Modal */}
      <AssignmentPreviewModal
        isOpen={showPreviewModal}
        onClose={handleClosePreview}
        onConfirm={handleConfirmAssignments}
        assignments={generatedAssignments}
        programTitle={selectedProgram?.semana || ''}
        isConfirming={isConfirmingAssignments}
      />

      {/* Program Detail Modal */}
      <ProgramDetailModal
        isOpen={showProgramDetail}
        onClose={() => setShowProgramDetail(false)}
        programa={selectedProgram}
        onDownload={handleDownloadPrograma}
        onViewAssignments={(programa) => navigate('/designacoes')}
      />
    </div>
  );
};

export default Programas;
