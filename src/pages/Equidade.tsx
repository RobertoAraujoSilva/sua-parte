import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Settings, 
  PlayCircle,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface FairQueueItem {
  student_id: string;
  student_name: string;
  queue_position: number;
  fairness_score: number;
  last_assigned_days: number;
  count_90d: number;
  count_total: number;
  family_conflicts: string[];
  eligibility_reason: string;
}

interface AssignmentStats {
  part_type: string;
  total_assignments: number;
  average_fairness_score: number;
  students_with_assignments: number;
}

interface FairnessPolicy {
  part_type: string;
  cooldown_days: number;
  max_per_month: number;
  max_per_quarter: number;
  family_restriction_days: number;
  is_active: boolean;
}

export default function Equidade() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [fairQueue, setFairQueue] = useState<FairQueueItem[]>([]);
  const [selectedPartType, setSelectedPartType] = useState('leitura_biblica');
  const [stats, setStats] = useState<AssignmentStats[]>([]);
  const [policies, setPolicies] = useState<FairnessPolicy[]>([]);

  const partTypes = [
    { value: 'leitura_biblica', label: 'Leitura Bíblica', color: 'bg-blue-100 text-blue-800' },
    { value: 'discurso', label: 'Discurso', color: 'bg-purple-100 text-purple-800' },
    { value: 'demonstracao', label: 'Demonstração', color: 'bg-green-100 text-green-800' },
    { value: 'oracao_abertura', label: 'Oração Abertura', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'oracao_encerramento', label: 'Oração Encerramento', color: 'bg-orange-100 text-orange-800' },
    { value: 'tesouros_palavra', label: 'Tesouros da Palavra', color: 'bg-red-100 text-red-800' },
    { value: 'joias_espirituais', label: 'Joias Espirituais', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'parte_ministerio', label: 'Parte Ministério', color: 'bg-pink-100 text-pink-800' },
    { value: 'estudo_biblico_congregacao', label: 'Estudo Bíblico', color: 'bg-teal-100 text-teal-800' }
  ];

  useEffect(() => {
    if (user) {
      loadStats();
      loadPolicies();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assignment_stats')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Processar estatísticas
      const processedStats = partTypes.map(pt => {
        const typeStats = data?.filter(s => s.part_type === pt.value) || [];
        const totalAssignments = typeStats.reduce((sum, s) => sum + (s.count_total || 0), 0);
        const avgScore = typeStats.length > 0 ? 
          typeStats.reduce((sum, s) => sum + (s.count_90d || 0), 0) / typeStats.length : 0;
        
        return {
          part_type: pt.value,
          total_assignments: totalAssignments,
          average_fairness_score: avgScore,
          students_with_assignments: typeStats.length
        };
      });
      
      setStats(processedStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPolicies = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('fairness_policy')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Erro ao carregar políticas:', error);
    }
  };

  const calculateFairQueue = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('calculate_fair_queue', {
          p_user_id: user.id,
          p_part_type: selectedPartType,
          p_meeting_date: new Date().toISOString().split('T')[0]
        });
      
      if (error) throw error;
      setFairQueue(data || []);
    } catch (error) {
      console.error('Erro ao calcular fila justa:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPartTypeLabel = (value: string) => {
    return partTypes.find(pt => pt.value === value)?.label || value;
  };

  const getPartTypeColor = (value: string) => {
    return partTypes.find(pt => pt.value === value)?.color || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Acesso Restrito</h2>
          <p className="text-muted-foreground">Faça login para acessar o sistema de equidade.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Equidade</h1>
          <p className="text-muted-foreground">
            Gerencie a distribuição justa de designações entre os estudantes
          </p>
        </div>
        <Button onClick={loadStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="queue">Fila Justa</TabsTrigger>
          <TabsTrigger value="policies">Políticas</TabsTrigger>
          <TabsTrigger value="simulation">Simulação</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Estatísticas Gerais */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Designações</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.reduce((sum, s) => sum + s.total_assignments, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Todas as categorias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estudantes Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.reduce((sum, s) => sum + s.students_with_assignments, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Com designações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats.reduce((sum, s) => sum + s.average_fairness_score, 0) / Math.max(stats.length, 1)).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Fairness geral
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas por Categoria</CardTitle>
              <CardDescription>
                Distribuição de designações e scores de fairness por tipo de parte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.map((stat) => (
                  <div key={stat.part_type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge className={getPartTypeColor(stat.part_type)}>
                        {getPartTypeLabel(stat.part_type)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {stat.students_with_assignments} estudantes
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{stat.total_assignments}</div>
                      <div className="text-xs text-muted-foreground">
                        Score: {stat.average_fairness_score.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fila Justa */}
        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fila Justa por Categoria</CardTitle>
              <CardDescription>
                Visualize a ordem de prioridade para designações baseada no algoritmo de fairness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seletor de Tipo de Parte */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Tipo de Parte:</label>
                <select
                  value={selectedPartType}
                  onChange={(e) => setSelectedPartType(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  {partTypes.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
                <Button onClick={calculateFairQueue} disabled={loading}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Calcular Fila
                </Button>
              </div>

              {/* Resultado da Fila */}
              {fairQueue.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    {fairQueue.length} estudantes elegíveis encontrados
                  </div>
                  {fairQueue.map((item, index) => (
                    <div key={item.student_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                          {item.queue_position}
                        </Badge>
                        <div>
                          <div className="font-medium">{item.student_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.eligibility_reason}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {item.last_assigned_days === 999 ? 'Nunca' : `${item.last_assigned_days} dias`}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.count_90d} nos últimos 90 dias
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Calculando fila justa...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Políticas */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Fairness</CardTitle>
              <CardDescription>
                Configure as regras de equidade para cada tipo de parte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.part_type} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getPartTypeColor(policy.part_type)}>
                        {getPartTypeLabel(policy.part_type)}
                      </Badge>
                      <Badge variant={policy.is_active ? "default" : "secondary"}>
                        {policy.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Cooldown</div>
                        <div className="text-muted-foreground">{policy.cooldown_days} dias</div>
                      </div>
                      <div>
                        <div className="font-medium">Máx/Mês</div>
                        <div className="text-muted-foreground">{policy.max_per_month}</div>
                      </div>
                      <div>
                        <div className="font-medium">Máx/Trimestre</div>
                        <div className="text-muted-foreground">{policy.max_per_quarter}</div>
                      </div>
                      <div>
                        <div className="font-medium">Restrição Familiar</div>
                        <div className="text-muted-foreground">{policy.family_restriction_days} dias</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulação */}
        <TabsContent value="simulation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulação de Designações</CardTitle>
              <CardDescription>
                Teste o algoritmo de fairness com diferentes cenários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <PlayCircle className="mx-auto h-12 w-12 mb-4" />
                <p>Funcionalidade de simulação em desenvolvimento</p>
                <p className="text-sm">Permitirá testar diferentes cenários de designação</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
