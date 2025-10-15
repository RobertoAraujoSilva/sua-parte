import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, BookOpen, Home, LogOut, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBackendApi } from '@/hooks/useBackendApi';

interface Designacao {
  id: string;
  idParte: string;
  idEstudante: string;
  idAjudante?: string;
  semanaId: string;
  semanaLabel: string;
  tituloParte: string;
  tipoParte: string;
  tempoMinutos: number;
  observacoes?: string;
  dataDesignacao: string;
  dataSemana: string;
  ajudanteNome?: string;
}

interface Programacao {
  idSemana: string;
  semanaLabel: string;
  tema: string;
}

export function EstudantePortal() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { apiCall } = useBackendApi();
  
  const [designacoes, setDesignacoes] = useState<Designacao[]>([]);
  const [programacoes, setProgramacoes] = useState<Programacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDesignacoes = async () => {
      if (!user?.id) return;

      try {
        const response = await apiCall(`/api/designacoes/estudante/${user.id}`);
        setDesignacoes(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar designações:', error);
        toast({
          title: "Erro ao carregar designações",
          description: "Não foi possível carregar suas designações.",
          variant: "destructive"
        });
      }
    };

    const carregarProgramacoes = async () => {
      try {
        const response = await apiCall('/api/programas');
        setProgramacoes(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar programações:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDesignacoes();
    carregarProgramacoes();
  }, [user?.id, apiCall, toast]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const getIconForTipo = (tipo: string) => {
    switch (tipo) {
      case 'leitura':
        return <BookOpen className="h-4 w-4" />;
      case 'consideracao':
      case 'video+consideracao':
        return <User className="h-4 w-4" />;
      case 'discurso':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getColorForTipo = (tipo: string) => {
    switch (tipo) {
      case 'leitura':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'consideracao':
      case 'video+consideracao':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'discurso':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'joias':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProximasDesignacoes = () => {
    const hoje = new Date();
    return designacoes
      .filter(d => new Date(d.dataSemana) >= hoje)
      .sort((a, b) => new Date(a.dataSemana).getTime() - new Date(b.dataSemana).getTime())
      .slice(0, 3);
  };

  const getDesignacoesPassadas = () => {
    const hoje = new Date();
    return designacoes
      .filter(d => new Date(d.dataSemana) < hoje)
      .sort((a, b) => new Date(b.dataSemana).getTime() - new Date(a.dataSemana).getTime())
      .slice(0, 5);
  };

  const proximasDesignacoes = getProximasDesignacoes();
  const designacoesPassadas = getDesignacoesPassadas();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando portal...</p>
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
                <User className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Portal do Estudante</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {user?.user_metadata?.nome || user?.email}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo, {user?.user_metadata?.nome || 'Estudante'}!
          </h1>
          <p className="text-gray-600">
            Aqui você pode visualizar suas designações na Escola do Ministério Teocrático
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Próximas Designações</p>
                  <p className="text-2xl font-bold text-gray-900">{proximasDesignacoes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Designações</p>
                  <p className="text-2xl font-bold text-gray-900">{designacoes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Horas Ministradas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(designacoes.reduce((acc, d) => acc + d.tempoMinutos, 0) / 60).toFixed(1)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Próximas Designações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Próximas Designações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proximasDesignacoes.length > 0 ? (
                <div className="space-y-4">
                  {proximasDesignacoes.map((designacao) => (
                    <div key={designacao.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{designacao.tituloParte}</h4>
                          <p className="text-sm text-gray-600">{designacao.semanaLabel}</p>
                        </div>
                        <Badge className={getColorForTipo(designacao.tipoParte)}>
                          {getIconForTipo(designacao.tipoParte)}
                          <span className="ml-1">{designacao.tipoParte}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(designacao.dataSemana).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {designacao.tempoMinutos} min
                        </span>
                      </div>
                      {designacao.ajudanteNome && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Ajudante:</strong> {designacao.ajudanteNome}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma designação futura encontrada.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Designações Passadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Designações Realizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {designacoesPassadas.length > 0 ? (
                <div className="space-y-4">
                  {designacoesPassadas.map((designacao) => (
                    <div key={designacao.id} className="border rounded-lg p-4 opacity-75">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{designacao.tituloParte}</h4>
                          <p className="text-sm text-gray-600">{designacao.semanaLabel}</p>
                        </div>
                        <Badge variant="outline">
                          {getIconForTipo(designacao.tipoParte)}
                          <span className="ml-1">{designacao.tipoParte}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(designacao.dataSemana).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {designacao.tempoMinutos} min
                        </span>
                      </div>
                      {designacao.ajudanteNome && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Ajudante:</strong> {designacao.ajudanteNome}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma designação passada encontrada.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Atividade */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumo de Atividade</CardTitle>
          </CardHeader>
          <CardContent>
            {designacoes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {designacoes.filter(d => d.tipoParte === 'leitura').length}
                  </p>
                  <p className="text-sm text-gray-600">Leituras</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {designacoes.filter(d => d.tipoParte === 'consideracao').length}
                  </p>
                  <p className="text-sm text-gray-600">Considerações</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {designacoes.filter(d => d.tipoParte === 'discurso').length}
                  </p>
                  <p className="text-sm text-gray-600">Discursos</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {designacoes.filter(d => d.tipoParte === 'joias').length}
                  </p>
                  <p className="text-sm text-gray-600">Joias Espirituais</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Você ainda não possui designações.</p>
                <p className="text-sm">Aguarde o instrutor fazer as designações.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
