import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Home, ArrowLeft, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Estudante {
  id: string;
  nome: string;
  genero: 'masculino' | 'feminino';
  cargo: string;
  ativo: boolean;
  idade: number;
  email: string;
  telefone: string;
  data_batismo: string;
  observacoes: string;
}

export default function EstudantesSimplified() {
  const navigate = useNavigate();
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchEstudantes();
  }, []);

  const fetchEstudantes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('estudantes')
        .select('*')
        .order('nome');

      if (error) {
        throw error;
      }

      setEstudantes(data || []);
    } catch (err) {
      console.error('Erro ao buscar estudantes:', err);
      setError('Erro ao carregar estudantes');
    } finally {
      setLoading(false);
    }
  };

  const estudantesAtivos = estudantes.filter(e => e.ativo);
  const estudantesInativos = estudantes.filter(e => !e.ativo);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando estudantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchEstudantes}>Tentar novamente</Button>
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
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Gerenciar Estudantes</span>
              </div>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Estudante
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciar Estudantes
          </h1>
          <p className="text-gray-600">
            Cadastre e gerencie os estudantes da sua congregação
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Estudantes Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {estudantesAtivos.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Estudantes Inativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {estudantesInativos.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Estudantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {estudantes.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Estudantes Ativos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estudantes Ativos ({estudantesAtivos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estudantesAtivos.map((estudante) => (
                <div key={estudante.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-blue-600">
                            {estudante.nome.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{estudante.nome}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={estudante.genero === 'masculino' ? 'default' : 'secondary'}>
                              {estudante.genero === 'masculino' ? 'Masculino' : 'Feminino'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {estudante.cargo.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {estudante.idade} anos
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {estudante.email} • {estudante.telefone}
                          </div>
                        </div>
                      </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Estudantes Inativos */}
        {estudantesInativos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                Estudantes Inativos ({estudantesInativos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estudantesInativos.map((estudante) => (
                  <div key={estudante.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-gray-500">
                            {estudante.nome.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">{estudante.nome}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">Inativo</Badge>
                            <Badge variant={estudante.genero === 'masculino' ? 'default' : 'secondary'}>
                              {estudante.genero === 'masculino' ? 'Masculino' : 'Feminino'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {estudante.cargo.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {estudante.email} • {estudante.telefone}
                          </div>
                        </div>
                      </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Reativar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}