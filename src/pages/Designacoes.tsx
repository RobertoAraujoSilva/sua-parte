import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Zap, Calendar, FileText, ArrowLeft, Download, Eye, Send, RefreshCw, AlertTriangle, Clock } from "lucide-react";

// Importar componentes e utilitários do sistema de designações
import { ModalSelecaoSemana, type DadosSelecaoSemana } from "@/components/ModalSelecaoSemana";
import { ModalPreviaDesignacoes } from "@/components/ModalPreviaDesignacoes";
import { GeradorDesignacoes, salvarDesignacoes } from "@/utils/assignmentGenerator";
import { carregarDadosCompletos, carregarProgramaPorData, removerDesignacoesPrograma } from "@/utils/dataLoaders";
import { BalanceadorHistorico } from "@/utils/balanceamentoHistorico";
import { RegrasS38T } from "@/utils/regrasS38T";
import { TratadorErros } from "@/utils/tratamentoErros";
import type {
  DesignacaoGerada,
  EstatisticasDesignacao,
  ConflitosDesignacao,
  ParteProgramaS38T
} from "@/types/designacoes";
import type { EstudanteRow } from "@/types/estudantes";
import { supabase } from "@/integrations/supabase/client";
import { TutorialButton } from "@/components/tutorial";
import { DebugPanel } from '@/components/DebugPanel';

const Designacoes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados para o sistema de designações automáticas
  const [modalSelecaoAberto, setModalSelecaoAberto] = useState(false);
  const [modalPreviaAberto, setModalPreviaAberto] = useState(false);
  const [carregandoGeracao, setCarregandoGeracao] = useState(false);
  const [carregandoSalvamento, setCarregandoSalvamento] = useState(false);

  // Dados da geração atual
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

  // State for real assignment data
  const [assignmentPrograms, setAssignmentPrograms] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

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

  // Remove mock data - rely entirely on database queries

  // Função para abrir modal de seleção de semana
  const handleAbrirModalSelecao = () => {
    setModalSelecaoAberto(true);
  };

  // Função para processar seleção de semana e gerar designações
  const handleConfirmarSelecao = async (dados: DadosSelecaoSemana) => {
    setDadosSelecao(dados);
    setModalSelecaoAberto(false);
    setCarregandoGeracao(true);

    try {
      // Se é regeneração, remover designações existentes primeiro
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

      // Carregar dados necessários
      const dadosCompletos = await carregarDadosCompletos();

      if (!dadosCompletos.todosCarregados) {
        throw new Error("Erro ao carregar dados necessários para geração");
      }

      // Criar gerador de designações
      const gerador = new GeradorDesignacoes(dadosCompletos.estudantes.estudantes);

      // Extrair partes do programa (simulado para demonstração)
      const partesPrograma: ParteProgramaS38T[] = [
        {
          numero_parte: 3,
          titulo_parte: "Leitura da Bíblia",
          tipo_parte: 'leitura_biblica',
          tempo_minutos: 4,
          requer_ajudante: false
        },
        {
          numero_parte: 4,
          titulo_parte: "Primeira Conversa",
          tipo_parte: 'demonstracao',
          tempo_minutos: 3,
          requer_ajudante: true
        },
        {
          numero_parte: 5,
          titulo_parte: "Revisita",
          tipo_parte: 'demonstracao',
          tempo_minutos: 4,
          requer_ajudante: true
        }
      ];

      // Gerar designações
      const opcoes = {
        data_inicio_semana: dados.dataInicioSemana,
        id_programa: dados.idPrograma,
        partes: partesPrograma
      };

      const designacoesGeradas = await gerador.gerarDesignacoes(opcoes);

      // Validar designações
      const errosValidacao = await gerador.validarDesignacoes(designacoesGeradas);

      const stats = gerador.gerarEstatisticas(designacoesGeradas);

      // Preparar dados para prévia
      setDesignacoesGeradas(designacoesGeradas);
      setEstudantesCarregados(dadosCompletos.estudantes.estudantes);
      setEstatisticas({
        ...(stats as any),
        paresFormados: (stats as any).paresFormados ?? 0,
        paresFamiliares: (stats as any).paresFamiliares ?? 0,
      });
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

      // Abrir modal de prévia
      setModalPreviaAberto(true);

      toast({
        title: "Designações geradas com sucesso!",
        description: `${designacoesGeradas.length} designação(ões) gerada(s) para revisão.`,
      });

    } catch (error) {
      console.error('Erro ao gerar designações:', error);

      // Usar sistema de tratamento de erros
      const erroProcessado = TratadorErros.processarErro(error, 'Geração de designações');
      TratadorErros.logErro(erroProcessado, 'handleConfirmarSelecao');
      TratadorErros.exibirErro(erroProcessado);

      // Exibir ações sugeridas após um delay
      setTimeout(() => {
        TratadorErros.exibirAcoesSugeridas(erroProcessado);
      }, 2000);
    } finally {
      setCarregandoGeracao(false);
    }
  };

  // Função para confirmar e salvar designações
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

      // Fechar modal e limpar estados
      setModalPreviaAberto(false);
      setDadosSelecao(null);
      setDesignacoesGeradas([]);

    } catch (error) {
      console.error('Erro ao salvar designações:', error);

      // Usar sistema de tratamento de erros
      const erroProcessado = TratadorErros.processarErro(error, 'Salvamento de designações');
      TratadorErros.logErro(erroProcessado, 'handleConfirmarDesignacoes');
      TratadorErros.exibirErro(erroProcessado);

      // Exibir ações sugeridas se o erro for recuperável
      if (erroProcessado.recuperavel) {
        setTimeout(() => {
          TratadorErros.exibirAcoesSugeridas(erroProcessado);
        }, 2000);
      }
    } finally {
      setCarregandoSalvamento(false);
    }
  };

  // Função para regenerar designações
  const handleRegenerarDesignacoes = () => {
    if (dadosSelecao) {
      setModalPreviaAberto(false);
      // Forçar regeneração
      handleConfirmarSelecao({ ...dadosSelecao, modoRegeneracao: true });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Enviadas":
        return "bg-green-100 text-green-800";
      case "Geradas":
        return "bg-blue-100 text-blue-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
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
                  Gestão de <span className="text-jw-gold">Designações</span>
                </h1>
                <p className="text-xl opacity-90 max-w-2xl">
                  Gere e gerencie designações automáticas com algoritmo inteligente que
                  respeita todas as regras da Escola do Ministério Teocrático.
                </p>
              </div>
              <TutorialButton page="designacoes" variant="secondary" />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-jw-navy mb-2">Ações Rápidas</h2>
                <p className="text-gray-600">Gerencie designações de forma eficiente</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="hero"
                  size="sm"
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
                  onClick={handleAbrirModalSelecao}
                  disabled={carregandoGeracao || carregandoSalvamento}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerar Semana
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Generated Assignments from Programs */}
        {assignmentPrograms.length > 0 && (
          <section className="py-8 bg-green-50">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-jw-navy">Designações Geradas Recentemente</h2>
                  <p className="text-gray-600">Designações criadas através do sistema de geração automática</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {assignmentPrograms.length} programa(s) com designações
                </Badge>
              </div>

              <div className="space-y-6">
                {assignmentPrograms.map((program) => (
                  <Card key={program.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-600" />
                            {program.mes_apostila || `Semana de ${new Date(program.data_inicio_semana).toLocaleDateString('pt-BR')}`}
                          </CardTitle>
                          <CardDescription>
                            Geradas em {new Date(program.assignments_generated_at).toLocaleDateString('pt-BR')} às {new Date(program.assignments_generated_at).toLocaleTimeString('pt-BR')}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                  <CardTitle className="text-sm">{assignment.tipo_parte}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="space-y-2 text-sm">
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
                          </div>
                          <div className="flex gap-2 pt-4 border-t">
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
            </div>
          </section>
        )}

        {/* Designations Overview */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-jw-navy">Designações por Semana</h2>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="enviadas">Enviadas</SelectItem>
                    <SelectItem value="geradas">Geradas</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Show message that only real data is displayed */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-jw-blue mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Designações Baseadas em Dados Reais
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Esta página agora exibe apenas designações reais criadas através do sistema de geração automática.
                    As designações aparecerão aqui após serem geradas na página de Programas.
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
          </div>
        </section>

        {/* Current Week Details - Now shows real data only */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-jw-navy mb-6">Designações da Semana Atual</h2>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">📅</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Designações da Semana
                  </h3>
                  <p className="text-gray-600">
                    As designações da semana atual aparecerão aqui quando forem geradas através do sistema.
                    Utilize a seção "Designações Geradas Recentemente" acima para ver as designações criadas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-jw-navy mb-6">Estatísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-jw-blue mb-2">36</div>
                  <div className="text-sm text-gray-600">Total de Partes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">24</div>
                  <div className="text-sm text-gray-600">Partes Designadas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">8</div>
                  <div className="text-sm text-gray-600">Estudantes Notificados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">75%</div>
                  <div className="text-sm text-gray-600">Taxa de Confirmação</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <DebugPanel />

      {/* Modais do Sistema de Designações */}
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
    </div>
  );
};

export default Designacoes;
