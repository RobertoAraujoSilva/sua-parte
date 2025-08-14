import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Eye, Send, RefreshCw, AlertTriangle, Clock, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TutorialButton } from "@/components/tutorial";
import { DebugPanel } from '@/components/DebugPanel';
import PageShell from "@/components/layout/PageShell";
import DesignacoesToolbar from "@/components/assignments/DesignacoesToolbar";
import { ResponsiveTableWrapper } from "@/components/layout/ResponsiveTableWrapper";
import { AdaptiveGrid } from "@/components/layout/adaptive-grid";

// Import assignment system components
import { ModalSelecaoSemana, type DadosSelecaoSemana } from "@/components/ModalSelecaoSemana";
import { ModalPreviaDesignacoes } from "@/components/ModalPreviaDesignacoes";
import { GeradorDesignacoes, salvarDesignacoes } from "@/utils/assignmentGenerator";
import { carregarDadosCompletos, carregarProgramaPorData, removerDesignacoesPrograma } from "@/utils/dataLoaders";
import { TratadorErros } from "@/utils/tratamentoErros";
import type {
  DesignacaoGerada,
  EstatisticasDesignacao,
  ConflitosDesignacao,
} from "@/types/designacoes";
import type { ParteProgramaS38T } from "@/utils/assignmentGenerator";
import type { EstudanteRow } from "@/types/estudantes";

const DesignacoesOptimized = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Assignment generation states
  const [modalSelecaoAberto, setModalSelecaoAberto] = useState(false);
  const [modalPreviaAberto, setModalPreviaAberto] = useState(false);
  const [carregandoGeracao, setCarregandoGeracao] = useState(false);
  const [carregandoSalvamento, setCarregandoSalvamento] = useState(false);

  // Generated assignment data
  const [dadosSelecao, setDadosSelecao] = useState<DadosSelecaoSemana | null>(null);
  const [designacoesGeradas, setDesignacoesGeradas] = useState<DesignacaoGerada[]>([]);
  const [estudantesCarregados, setEstudantesCarregados] = useState<EstudanteRow[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasDesignacao>({
    totalDesignacoes: 0,
    distribuicaoPorGenero: { masculino: 0, feminino: 0 },
    distribuicaoPorCargo: {},
    estudantesComAjudante: 0,
    paresFormados: 0,
    paresFamiliares: 0
  });
  const [conflitos, setConflitos] = useState<ConflitosDesignacao[]>([]);
  const [recomendacoes, setRecomendacoes] = useState<string[]>([]);

  // Real assignment data from database
  const [assignmentPrograms, setAssignmentPrograms] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // Toolbar states
  const [searchValue, setSearchValue] = useState("");
  const [selectedTab, setSelectedTab] = useState<"pending" | "completed" | "all">("pending");

  // Load assignments from database
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);

      // Load programs with generated assignments
      const { data: programs, error: programsError } = await supabase
        .from('programas')
        .select(`
          id,
          data_inicio_semana,
          mes_apostila,
          partes,
          status,
          assignment_status,
          assignments_generated_at,
          total_assignments_generated,
          designacoes (
            id,
            id_estudante,
            numero_parte,
            titulo_parte,
            tipo_parte,
            cena,
            tempo_minutos,
            id_ajudante,
            confirmado,
            estudantes!designacoes_id_estudante_fkey (
              id,
              nome,
              cargo,
              genero
            ),
            ajudante:estudantes!designacoes_id_ajudante_fkey (
              id,
              nome,
              cargo,
              genero
            )
          )
        `)
        .eq('assignment_status', 'generated')
        .order('data_inicio_semana', { ascending: false });

      if (programsError) {
        console.error('Error loading programs:', programsError);
        return;
      }

      setAssignmentPrograms(programs || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Calculate statistics from real data
  const assignmentStats = {
    totalPrograms: assignmentPrograms.length,
    totalAssignments: assignmentPrograms.reduce((sum, p) => sum + (p.designacoes?.length || 0), 0),
    pendingAssignments: assignmentPrograms.reduce((sum, p) => 
      sum + (p.designacoes?.filter(d => !d.confirmado).length || 0), 0),
    confirmedAssignments: assignmentPrograms.reduce((sum, p) => 
      sum + (p.designacoes?.filter(d => d.confirmado).length || 0), 0),
  };

  // Filter assignments based on search and tab
  const filteredPrograms = assignmentPrograms.filter(program => {
    const matchesSearch = !searchValue || 
      program.mes_apostila?.toLowerCase().includes(searchValue.toLowerCase()) ||
      new Date(program.data_inicio_semana).toLocaleDateString('pt-BR').includes(searchValue);

    const matchesTab = selectedTab === "all" || 
      (selectedTab === "pending" && program.designacoes?.some(d => !d.confirmado)) ||
      (selectedTab === "completed" && program.designacoes?.every(d => d.confirmado));

    return matchesSearch && matchesTab;
  });

  // Assignment generation handlers
  const handleAbrirModalSelecao = () => {
    setModalSelecaoAberto(true);
  };

  const handleConfirmarSelecao = async (dados: DadosSelecaoSemana) => {
    setDadosSelecao(dados);
    setModalSelecaoAberto(false);
    setCarregandoGeracao(true);

    try {
      // If regenerating, remove existing assignments first
      if (dados.modoRegeneracao) {
        const resultadoRemocao = await removerDesignacoesPrograma(dados.idPrograma);
        if (!resultadoRemocao.sucesso) {
          throw new Error(`Erro ao remover designações existentes: ${resultadoRemocao.erro}`);
        }

        toast({
          title: "Designações removidas",
          description: `${resultadoRemocao.quantidadeRemovida} designação(ões) removida(s) para regeneração.`,
        });
      }

      // Load necessary data
      const dadosCompletos = await carregarDadosCompletos();

      if (!dadosCompletos.todosCarregados) {
        throw new Error("Erro ao carregar dados necessários para geração");
      }

      // Create assignment generator
      const gerador = new GeradorDesignacoes(dadosCompletos.estudantes.estudantes);

      // Load actual program parts
      const programaResult = await carregarProgramaPorData(dados.dataInicioSemana);
      if (
        !programaResult.sucesso ||
        programaResult.programa == null ||
        programaResult.programa.partes == null
      ) {
        throw new Error("Programa não encontrado ou sem partes definidas");
      }

      const rawPartes = programaResult.programa.partes;
      if (!Array.isArray(rawPartes)) {
        throw new Error("Programa não encontrado ou sem partes definidas");
      }
      const partesPrograma: ParteProgramaS38T[] = (rawPartes as any[]).map((p: any) => ({
        numero_parte: p.numero_parte,
        titulo_parte: p.titulo_parte,
        tipo_parte: p.tipo_parte,
        tempo_minutos: p.tempo_minutos,
        cena: p.cena,
        requer_ajudante: p.requer_ajudante,
      }));

      // Generate assignments
      const opcoes = {
        data_inicio_semana: dados.dataInicioSemana,
        id_programa: dados.idPrograma,
        partes: partesPrograma
      };

      const designacoesGeradas = await gerador.gerarDesignacoes(opcoes);

      // Validate assignments
      const errosValidacao = await gerador.validarDesignacoes(designacoesGeradas);

      const stats = await gerador.gerarEstatisticas(designacoesGeradas);

      // Prepare data for preview
      setDesignacoesGeradas(designacoesGeradas);
      setEstudantesCarregados(dadosCompletos.estudantes.estudantes);
      setEstatisticas(stats);
      setConflitos(errosValidacao.map(erro => ({
        tipo: 'inelegibilidade' as const,
        estudante_id: '',
        numero_parte: 0,
        descricao: erro
      })));
      setRecomendacoes([
        "Verifique se todos os estudantes estão ativos",
        "Confirme os relacionamentos familiares para pares de gêneros diferentes",
        "Considere o balanceamento das últimas 8 semanas"
      ]);

      // Open preview modal
      setModalPreviaAberto(true);

      toast({
        title: "Designações geradas com sucesso!",
        description: `${designacoesGeradas.length} designação(ões) gerada(s) para revisão.`,
      });

    } catch (error) {
      console.error('Erro ao gerar designações:', error);

      const erroProcessado = TratadorErros.processarErro(error, 'Geração de designações');
      TratadorErros.logErro(erroProcessado, 'handleConfirmarSelecao');
      TratadorErros.exibirErro(erroProcessado);

      setTimeout(() => {
        TratadorErros.exibirAcoesSugeridas(erroProcessado);
      }, 2000);
    } finally {
      setCarregandoGeracao(false);
    }
  };

  const handleConfirmarDesignacoes = async () => {
    if (!dadosSelecao || !designacoesGeradas.length) return;

    setCarregandoSalvamento(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const resultado = await salvarDesignacoes(designacoesGeradas, dadosSelecao.idPrograma, user.id);

      if (!resultado.sucesso) {
        throw new Error(resultado.erro || "Erro ao salvar designações");
      }

      toast({
        title: "Designações salvas com sucesso!",
        description: `${designacoesGeradas.length} designação(ões) salva(s) no banco de dados.`,
      });

      // Close modal and clear states
      setModalPreviaAberto(false);
      setDadosSelecao(null);
      setDesignacoesGeradas([]);

      // Reload assignments
      loadAssignments();

    } catch (error) {
      console.error('Erro ao salvar designações:', error);

      const erroProcessado = TratadorErros.processarErro(error, 'Salvamento de designações');
      TratadorErros.logErro(erroProcessado, 'handleConfirmarDesignacoes');
      TratadorErros.exibirErro(erroProcessado);

      if (erroProcessado.recuperavel) {
        setTimeout(() => {
          TratadorErros.exibirAcoesSugeridas(erroProcessado);
        }, 2000);
      }
    } finally {
      setCarregandoSalvamento(false);
    }
  };

  const handleRegenerarDesignacoes = () => {
    if (dadosSelecao) {
      setModalPreviaAberto(false);
      handleConfirmarSelecao({ ...dadosSelecao, modoRegeneracao: true });
    }
  };

  // Toolbar component
  const toolbar = (
    <DesignacoesToolbar
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      pendingCount={assignmentStats.pendingAssignments}
      completedCount={assignmentStats.confirmedAssignments}
      totalCount={assignmentStats.totalAssignments}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      onAddAssignment={handleAbrirModalSelecao}
      onExport={() => console.log('Export clicked')}
      onRefresh={loadAssignments}
      onShowFilters={() => console.log('Show filters clicked')}
      hasActiveFilters={!!searchValue}
    />
  );

  return (
    <PageShell
      title="Gestão de Designações"
      hero={false} // Compact header layout for internal pages
      toolbar={toolbar}
      idToolbar="designacoes-toolbar"
    >
      {/* Navigation and Tutorial Button */}
      <div className="flex flex-col xs:flex-row items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8 px-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary w-full xs:w-auto justify-center xs:justify-start text-sm sm:text-base"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          Voltar ao Dashboard
        </Button>
        <TutorialButton 
          page="designacoes" 
          variant="secondary" 
          className="w-full xs:w-auto text-sm sm:text-base" 
        />
      </div>

      {/* Quick Actions Section */}
      <section className="py-6 md:py-8 bg-white border-b mb-6">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-center">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-jw-navy mb-2">Ações Rápidas</h2>
              <p className="text-gray-600 text-sm md:text-base">Gerencie designações de forma eficiente</p>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <Button
                variant="hero"
                size="sm"
                className="min-w-[180px] md:min-w-[200px]"
                onClick={handleAbrirModalSelecao}
                disabled={carregandoGeracao || carregandoSalvamento}
                data-tutorial="generate-assignments"
              >
                {carregandoGeracao ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Gerar Designações Automáticas
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="min-w-[160px] md:min-w-[180px]"
                onClick={handleAbrirModalSelecao}
                disabled={carregandoGeracao || carregandoSalvamento}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerar Semana
              </Button>
              <Button variant="outline" size="sm" className="min-w-[140px] md:min-w-[160px]">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Responsive Table Wrapper */}
      <ResponsiveTableWrapper
        className="mx-4"
        density="comfortable"
        id="designacoes-table-container"
      >
        <div className="p-6">
          {/* Statistics Cards */}
          <AdaptiveGrid minItemWidth={250} maxColumns={4} gap="md">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-jw-blue mb-2">{assignmentStats.totalPrograms}</div>
                <div className="text-sm text-gray-600">Programas com Designações</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{assignmentStats.totalAssignments}</div>
                <div className="text-sm text-gray-600">Total de Designações</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{assignmentStats.pendingAssignments}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{assignmentStats.confirmedAssignments}</div>
                <div className="text-sm text-gray-600">Confirmadas</div>
              </CardContent>
            </Card>
          </AdaptiveGrid>

          {/* Loading State */}
          {loadingAssignments && (
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

          {/* Empty State */}
          {!loadingAssignments && filteredPrograms.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    {searchValue ? 'Nenhuma designação encontrada' : 'Nenhuma designação disponível'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchValue 
                      ? 'Tente ajustar os filtros de busca.' 
                      : 'As designações aparecerão aqui após serem geradas na página de Programas.'
                    }
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/programas')}
                  >
                    Ir para Programas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Assignments List */}
          {!loadingAssignments && filteredPrograms.length > 0 && (
            <div className="space-y-6">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
                      <div>
                        <CardTitle className="text-base md:text-lg flex items-center gap-2">
                          <Clock className="w-5 h-5 text-green-600" />
                          {program.mes_apostila || `Semana de ${new Date(program.data_inicio_semana).toLocaleDateString('pt-BR')}`}
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm">
                          Geradas em {new Date(program.assignments_generated_at).toLocaleDateString('pt-BR')} às {new Date(program.assignments_generated_at).toLocaleTimeString('pt-BR')}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <Badge className="bg-green-100 text-green-800">
                          {program.total_assignments_generated} designações
                        </Badge>
                        <Badge variant="outline">
                          {program.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {program.designacoes && program.designacoes.length > 0 ? (
                      <div className="space-y-4">
                        <AdaptiveGrid minItemWidth={300} maxColumns={3} gap="sm">
                          {program.designacoes.map((assignment, index) => (
                            <Card key={assignment.id} className="border border-gray-200">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    Parte {assignment.numero_parte}
                                  </Badge>
                                  <Badge className={assignment.confirmado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                    {assignment.confirmado ? 'Confirmado' : 'Pendente'}
                                  </Badge>
                                </div>
                                <CardTitle className="text-xs md:text-sm">{assignment.tipo_parte}</CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="space-y-2 text-xs md:text-sm">
                                  <div>
                                    <span className="font-medium text-gray-600">Estudante:</span>
                                    <p className="text-gray-900">
                                      {assignment.estudantes?.nome || `ID: ${assignment.id_estudante}`}
                                    </p>
                                    {assignment.estudantes?.cargo && (
                                      <p className="text-xs text-gray-500">{assignment.estudantes.cargo}</p>
                                    )}
                                  </div>
                                  {assignment.id_ajudante && (
                                    <div>
                                      <span className="font-medium text-gray-600">Ajudante:</span>
                                      <p className="text-gray-900">
                                        {assignment.ajudante?.nome || `ID: ${assignment.id_ajudante}`}
                                      </p>
                                    </div>
                                  )}
                                  {assignment.cena && (
                                    <div>
                                      <span className="font-medium text-gray-600">Cenário:</span>
                                      <p className="text-gray-700 text-xs">{assignment.cena}</p>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {assignment.tempo_minutos} min
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </AdaptiveGrid>
                        <div className="flex flex-wrap gap-2 md:gap-3 pt-4 border-t">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          <Button variant="outline" size="sm">
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Notificações
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar PDF
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>Nenhuma designação encontrada para este programa</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ResponsiveTableWrapper>

      {/* Assignment Generation Modals */}
      <ModalSelecaoSemana
        aberto={modalSelecaoAberto}
        onFechar={() => setModalSelecaoAberto(false)}
        onConfirmar={handleConfirmarSelecao}
        carregando={carregandoGeracao}
      />

      <ModalPreviaDesignacoes
        aberto={modalPreviaAberto && !!dadosSelecao}
        onFechar={() => setModalPreviaAberto(false)}
        onConfirmar={handleConfirmarDesignacoes}
        onRegenerar={handleRegenerarDesignacoes}
        designacoes={designacoesGeradas}
        estudantes={estudantesCarregados}
        estatisticas={estatisticas}
        conflitos={conflitos}
        recomendacoes={recomendacoes}
        dataInicioSemana={dadosSelecao?.dataInicioSemana || ''}
        carregando={carregandoSalvamento}
      />

      {import.meta.env.DEV && <DebugPanel />}
    </PageShell>
  );
};

export default DesignacoesOptimized;