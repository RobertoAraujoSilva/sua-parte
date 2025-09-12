import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Home, ArrowLeft, Users, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Designacao {
  id: string;
  estudante: string;
  parte: string;
  semana: string;
  data: string;
  status: 'confirmada' | 'pendente' | 'concluida';
}

export default function DesignacoesSimplified() {
  const navigate = useNavigate();
  
  // Mock de designações
  const designacoes: Designacao[] = [
    { id: '1', estudante: 'João Silva', parte: 'Leitura da Bíblia - Prov. 30:1-14', semana: '8-14 de setembro 2025', data: '2025-09-11', status: 'confirmada' },
    { id: '2', estudante: 'Maria Santos', parte: 'Iniciando conversas - Casa em casa', semana: '15-21 de setembro 2025', data: '2025-09-18', status: 'pendente' },
    { id: '3', estudante: 'Pedro Costa', parte: 'Joias espirituais - Ecl. 1:1', semana: '22-28 de setembro 2025', data: '2025-09-25', status: 'pendente' },
    { id: '4', estudante: 'Ana Oliveira', parte: 'Consideração - Não me dês nem pobreza nem riquezas', semana: '8-14 de setembro 2025', data: '2025-09-11', status: 'concluida' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'concluida': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const designacoesPorStatus = {
    pendente: designacoes.filter(d => d.status === 'pendente'),
    confirmada: designacoes.filter(d => d.status === 'confirmada'),
    concluida: designacoes.filter(d => d.status === 'concluida')
  };

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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Designações</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/estudantes')}
              >
                <Users className="h-4 w-4 mr-2" />
                Estudantes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Designações
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie as designações da Escola do Ministério Teocrático
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {designacoesPorStatus.pendente.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Confirmadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {designacoesPorStatus.confirmada.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {designacoesPorStatus.concluida.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aviso sobre nova funcionalidade */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Nova Funcionalidade: Dashboard Simplificado
                </h3>
                <p className="text-blue-700 text-sm mb-3">
                  Agora você pode fazer designações diretamente no Dashboard do Instrutor com a programação oficial das reuniões.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Ir para o Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Designações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Todas as Designações ({designacoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {designacoes.map((designacao) => (
                <div key={designacao.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{designacao.parte}</h3>
                      <p className="text-gray-600">{designacao.semana}</p>
                    </div>
                    <Badge className={getStatusColor(designacao.status)}>
                      {designacao.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{designacao.estudante}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(designacao.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}