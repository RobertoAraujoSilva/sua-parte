import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, BookOpen, User, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Designacao {
  id: string;
  titulo: string;
  tipo: string;
  duracao: number;
  referencias?: string | string[];
  semana: string;
  tema: string;
  data: string;
  status: 'pendente' | 'confirmada' | 'concluida';
}

export function StudentPortalSimplified() {
  const navigate = useNavigate();
  
  // Mock de designações do estudante logado
  const [designacoes] = useState<Designacao[]>([
    {
      id: 'tpd_3_sem1',
      titulo: 'Leitura da Bíblia',
      tipo: 'leitura',
      duracao: 4,
      referencias: 'Prov. 30:1-14 (th lição 2)',
      semana: '8-14 de setembro 2025',
      tema: 'Provérbios 30',
      data: '2025-09-11',
      status: 'confirmada'
    },
    {
      id: 'fsm_2_sem2',
      titulo: 'Iniciando conversas',
      tipo: 'de_casa_em_casa',
      duracao: 4,
      referencias: 'Fale sobre uma das "Verdades que amamos ensinar", do apêndice A da brochura Ame as Pessoas (lmd lição 1 ponto 4)',
      semana: '15-21 de setembro 2025',
      tema: 'Provérbios 31',
      data: '2025-09-18',
      status: 'pendente'
    },
    {
      id: 'tpd_2_sem3',
      titulo: 'Joias espirituais',
      tipo: 'participacao',
      duracao: 10,
      referencias: 'Ecl. 1:1 — it "Eclesiastes" § 1',
      semana: '22-28 de setembro 2025',
      tema: 'Eclesiastes 1-2',
      data: '2025-09-25',
      status: 'pendente'
    }
  ]);

  const estudanteNome = "João Silva"; // Mock - viria do contexto de auth

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'leitura': return '📖';
      case 'consideracao': return '💭';
      case 'participacao': return '🙋';
      case 'video': return '🎥';
      case 'discurso': return '🎤';
      case 'de_casa_em_casa': return '🏠';
      case 'testemunho_informal': return '💬';
      case 'testemunho_publico': return '📢';
      default: return '📝';
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'leitura': return 'bg-blue-100 text-blue-800';
      case 'consideracao': return 'bg-green-100 text-green-800';
      case 'participacao': return 'bg-purple-100 text-purple-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'discurso': return 'bg-orange-100 text-orange-800';
      case 'de_casa_em_casa': return 'bg-teal-100 text-teal-800';
      case 'testemunho_informal': return 'bg-cyan-100 text-cyan-800';
      case 'testemunho_publico': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'concluida': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        <div className="max-w-6xl mx-auto px-6 py-4">
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Portal do Estudante
            </h1>
          </div>
          <p className="text-gray-600">
            Bem-vindo, <span className="font-semibold">{estudanteNome}</span>! 
            Aqui estão suas designações da Escola do Ministério Teocrático.
          </p>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Designações Pendentes
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

        {/* Lista de Designações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Suas Designações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {designacoes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Você ainda não possui designações.</p>
                  <p className="text-sm">Entre em contato com seu instrutor.</p>
                </div>
              ) : (
                designacoes.map((designacao) => (
                  <div key={designacao.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTipoIcon(designacao.tipo)}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{designacao.titulo}</h3>
                          <p className="text-sm text-gray-600">{designacao.semana} - {designacao.tema}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getTipoBadgeColor(designacao.tipo)}>
                          {designacao.tipo.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusBadgeColor(designacao.status)}>
                          {designacao.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatarData(designacao.data)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{designacao.duracao} minutos</span>
                      </div>
                    </div>

                    {designacao.referencias && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Referências:</h4>
                        <p className="text-sm text-gray-600">
                          {Array.isArray(designacao.referencias) 
                            ? designacao.referencias.join('; ') 
                            : designacao.referencias}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dicas */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">💡 Dicas para sua preparação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">📖 Para Leituras:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Pratique a pronúncia das palavras difíceis</li>
                  <li>• Leia com entonação natural</li>
                  <li>• Mantenha contato visual com a assistência</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🎤 Para Discursos:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Prepare um esboço simples</li>
                  <li>• Use ilustrações práticas</li>
                  <li>• Termine dentro do tempo estipulado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}