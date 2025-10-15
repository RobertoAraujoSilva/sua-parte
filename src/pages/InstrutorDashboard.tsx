import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Users, Save, Home, BookOpen, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ProgramacaoViewer } from '@/components/ProgramacaoViewer';
import { useEstudantes } from '@/hooks/useEstudantes';
import { useBackendApi } from '@/hooks/useBackendApi';

interface Programacao {
  semana: string;
  mesAno: string;
  dataInicio: string;
  dataFim: string;
  partes: any[];
}

interface Designacao {
  id: string;
  idParte: string;
  idEstudante: string;
  idAjudante?: string;
  semanaId: string;
  tituloParte: string;
  tipoParte: string;
  tempoMinutos: number;
  observacoes?: string;
  createdAt: string;
}

export default function InstrutorDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { apiCall } = useBackendApi();
  const { estudantes, isLoading: estudantesLoading } = useEstudantes();
  
  const [programacoes, setProgramacoes] = useState<Programacao[]>([]);
  const [designacoes, setDesignacoes] = useState<Designacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Carregar programações do Supabase
  useEffect(() => {
    const carregarProgramacoes = async () => {
      try {
        const response = await apiCall('/programas');
        setProgramacoes(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar programações:', error);
        toast({
          title: "Erro ao carregar programações",
          description: "Não foi possível carregar as programações disponíveis.",
          variant: "destructive"
        });
      }
    };

    carregarProgramacoes();
  }, [apiCall, toast]);

  // Carregar designações do Supabase
  useEffect(() => {
    const carregarDesignacoes = async () => {
      try {
        const response = await apiCall('/designacoes');
        setDesignacoes(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar designações:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDesignacoes();
  }, [apiCall]);

  const handleDesignar = async (parteId: string, estudanteId: string, ajudanteId?: string) => {
    try {
      // Encontrar a parte na programação para obter detalhes
      let parteDetalhes = null;
      for (const prog of programacoes) {
        for (const parte of prog.partes) {
          if (parte.id === parteId) {
            parteDetalhes = { ...parte, semanaId: prog.semana };
            break;
          }
        }
      }

      if (!parteDetalhes) {
        throw new Error('Parte não encontrada');
      }

      const designacao = {
        idParte: parteId,
        idEstudante: estudanteId,
        idAjudante: ajudanteId,
        semanaId: parteDetalhes.semanaId,
        tituloParte: parteDetalhes.titulo,
        tipoParte: parteDetalhes.tipo,
        tempoMinutos: parteDetalhes.duracaoMin,
        observacoes: ''
      };

      await apiCall('/designacoes', {
        method: 'POST',
        body: JSON.stringify(designacao)
      });

      // Atualizar estado local
      setDesignacoes(prev => [...prev, { ...designacao, id: Date.now().toString(), createdAt: new Date().toISOString() }]);

      toast({
        title: "Designação realizada!",
        description: "Estudante designado com sucesso para a parte.",
      });
    } catch (error) {
      console.error('Erro ao designar:', error);
      toast({
        title: "Erro ao designar",
        description: "Não foi possível realizar a designação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleRemoverDesignacao = async (parteId: string) => {
    try {
      const designacao = designacoes.find(d => d.idParte === parteId);
      if (!designacao) return;

      await apiCall(`/designacoes/${designacao.id}`, {
        method: 'DELETE'
      });

      setDesignacoes(prev => prev.filter(d => d.idParte !== parteId));

      toast({
        title: "Designação removida!",
        description: "A designação foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover designação:', error);
      toast({
        title: "Erro ao remover designação",
        description: "Não foi possível remover a designação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const exportarDesignacoes = async () => {
    try {
      const response = await apiCall('/designacoes/export');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `designacoes-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Designações exportadas!",
        description: "As designações foram baixadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar as designações.",
        variant: "destructive"
      });
    }
  };

  const totalDesignacoes = designacoes.length;
  const designacoesEstaSemana = designacoes.filter(d => 
    d.semanaId === programacoes[0]?.semana
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Início
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Sistema Ministerial</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/estudantes')}
              >
                <Users className="h-4 w-4 mr-2" />
                Estudantes ({estudantes.length})
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/importar-programacao')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportarDesignacoes}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard do Instrutor
          </h1>
          <p className="text-gray-600">
            Gerencie as designações da Escola do Ministério Teocrático
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Programações</p>
                  <p className="text-2xl font-bold text-gray-900">{programacoes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Estudantes</p>
                  <p className="text-2xl font-bold text-gray-900">{estudantes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Save className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Designações</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDesignacoes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                  <p className="text-2xl font-bold text-gray-900">{designacoesEstaSemana}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="programacao" className="space-y-6">
          <TabsList>
            <TabsTrigger value="programacao">Programação</TabsTrigger>
            <TabsTrigger value="designacoes">Designações</TabsTrigger>
            <TabsTrigger value="estudantes">Estudantes</TabsTrigger>
          </TabsList>

          <TabsContent value="programacao">
            <Card>
              <CardHeader>
                <CardTitle>Programação Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                {programacoes.length > 0 ? (
                  <ProgramacaoViewer
                    programacao={programacoes}
                    estudantes={estudantes}
                    designacoes={designacoes}
                    onDesignar={handleDesignar}
                    onRemoverDesignacao={handleRemoverDesignacao}
                  />
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma programação encontrada
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Importe uma programação do JW.org para começar a fazer designações.
                    </p>
                    <Button onClick={() => navigate('/importar-programacao')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Programação
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="designacoes">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Designações</CardTitle>
              </CardHeader>
              <CardContent>
                {designacoes.length > 0 ? (
                  <div className="space-y-4">
                    {designacoes.map((designacao) => {
                      const estudante = estudantes.find(e => e.id === designacao.idEstudante);
                      const ajudante = designacao.idAjudante ? estudantes.find(e => e.id === designacao.idAjudante) : null;
                      
                      return (
                        <div key={designacao.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{designacao.tituloParte}</h4>
                              <p className="text-sm text-gray-600">
                                {designacao.semanaId} • {designacao.tempoMinutos} minutos
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="default">
                                {estudante?.nome || 'N/A'}
                              </Badge>
                              {ajudante && (
                                <Badge variant="secondary">
                                  {ajudante.nome}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <Save className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhuma designação realizada ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estudantes">
            <Card>
              <CardHeader>
                <CardTitle>Estudantes Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                {estudantesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando estudantes...</p>
                  </div>
                ) : estudantes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {estudantes.map((estudante) => (
                      <div key={estudante.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{estudante.nome}</h4>
                          <Badge variant={estudante.genero === 'masculino' ? 'default' : 'secondary'}>
                            {estudante.genero}
                          </Badge>
                        </div>
                        {estudante.cargo && (
                          <p className="text-sm text-gray-600">
                            Cargo: {estudante.cargo}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhum estudante cadastrado ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
