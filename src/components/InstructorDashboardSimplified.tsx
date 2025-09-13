import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Users, Save, ArrowLeft, Home, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import programacoesData from '@/data/programacoes-setembro-2025.json';

interface Estudante {
  id: string;
  nome: string;
  genero: 'M' | 'F';
  privilegios: string[];
}

interface Parte {
  id: string;
  titulo: string;
  duracao: number;
  tipo: string;
  referencias?: string | string[];
  designado: string | null;
}

interface Semana {
  periodo: string;
  tema: string;
  cantico_abertura: string;
  cantico_meio: string;
  cantico_encerramento: string;
  programacao: {
    secao: string;
    partes: Parte[];
  }[];
}

export function InstructorDashboardSimplified() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [semanaAtual, setSemanaAtual] = useState<number>(0);
  const [estudantes, setEstudantes] = useState<Estudante[]>([
    { id: '1', nome: 'João Silva', genero: 'M', privilegios: ['leitura', 'consideracao'] },
    { id: '2', nome: 'Maria Santos', genero: 'F', privilegios: ['leitura', 'participacao'] },
    { id: '3', nome: 'Pedro Costa', genero: 'M', privilegios: ['leitura', 'discurso'] },
    { id: '4', nome: 'Ana Oliveira', genero: 'F', privilegios: ['leitura', 'testemunho_informal'] },
  ]);
  const [designacoes, setDesignacoes] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  const semanas: Semana[] = programacoesData.semanas;
  const semanaEscolhida = semanas[semanaAtual];

  const handleDesignacao = (parteId: string, estudanteId: string) => {
    setDesignacoes(prev => ({
      ...prev,
      [parteId]: estudanteId
    }));
  };

  const handleSalvarDesignacoes = async () => {
    setSalvando(true);
    try {
      // Simular salvamento no Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Designações salvas!",
        description: `${Object.values(designacoes).filter(id => id !== 'nao-designado').length} designações foram salvas com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as designações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSalvando(false);
    }
  };

  const getEstudanteNome = (estudanteId: string) => {
    if (estudanteId === 'nao-designado') return 'Não designado';
    const estudante = estudantes.find(e => e.id === estudanteId);
    return estudante?.nome || 'Não designado';
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'leitura': return '📖';
      case 'consideracao': return '💭';
      case 'participacao': return '🙋';
      case 'video': return '🎥';
      case 'discurso': return '🎤';
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
      default: return 'bg-gray-100 text-gray-800';
    }
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
                Estudantes
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/designacoes')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Designações
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

        {/* Seletor de Semana */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Selecionar Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={semanaAtual.toString()} onValueChange={(value) => setSemanaAtual(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {semanas.map((semana, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {semana.periodo} - {semana.tema}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Programação da Semana */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Programação */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{semanaEscolhida.periodo}</span>
                  <Badge variant="outline">{semanaEscolhida.tema}</Badge>
                </CardTitle>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>🎵 Abertura: {semanaEscolhida.cantico_abertura}</span>
                  <span>🎵 Meio: {semanaEscolhida.cantico_meio}</span>
                  <span>🎵 Encerramento: {semanaEscolhida.cantico_encerramento}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {semanaEscolhida.programacao.map((secao, secaoIndex) => (
                  <div key={secaoIndex} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-4 text-blue-700">
                      {secao.secao}
                    </h3>
                    <div className="space-y-3">
                      {secao.partes.map((parte) => (
                        <div key={parte.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getTipoIcon(parte.tipo)}</span>
                              <h4 className="font-medium">{parte.titulo}</h4>
                              <Badge className={getTipoBadgeColor(parte.tipo)}>
                                {parte.tipo.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {parte.duracao} min
                              </span>
                              {parte.referencias && (
                                <span className="text-xs">
                                  {Array.isArray(parte.referencias) 
                                    ? parte.referencias[0] 
                                    : parte.referencias}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={designacoes[parte.id] || 'nao-designado'} 
                              onValueChange={(value) => handleDesignacao(parte.id, value)}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Designar estudante" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="nao-designado">Não designado</SelectItem>
                                {estudantes.map((estudante) => (
                                  <SelectItem key={estudante.id} value={estudante.id}>
                                    {estudante.nome} ({estudante.genero})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Estudantes */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Estudantes ({estudantes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {estudantes.map((estudante) => (
                    <div key={estudante.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{estudante.nome}</span>
                        <Badge variant={estudante.genero === 'M' ? 'default' : 'secondary'}>
                          {estudante.genero}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        Privilégios: {estudante.privilegios.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Adicionar Estudante
                </Button>
              </CardContent>
            </Card>

            {/* Resumo de Designações */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Resumo da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total de partes:</span>
                    <span className="font-medium">
                      {semanaEscolhida.programacao.reduce((acc, secao) => acc + secao.partes.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Designadas:</span>
                    <span className="font-medium text-green-600">
                      {Object.values(designacoes).filter(id => id !== 'nao-designado').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pendentes:</span>
                    <span className="font-medium text-orange-600">
                      {semanaEscolhida.programacao.reduce((acc, secao) => acc + secao.partes.length, 0) - Object.values(designacoes).filter(id => id !== 'nao-designado').length}
                    </span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={handleSalvarDesignacoes}
                  disabled={salvando || Object.values(designacoes).filter(id => id !== 'nao-designado').length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {salvando ? 'Salvando...' : 'Salvar Designações'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}