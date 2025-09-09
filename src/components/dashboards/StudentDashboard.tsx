import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  UserCheck, 
  Calendar, 
  FileText, 
  Download, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Eye,
  Bell,
  Award,
  TrendingUp,
  Star,
  Target,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface StudentStats {
  totalAssignments: number;
  pendingAssignments: number;
  confirmedAssignments: number;
  completedAssignments: number;
  confirmationRate: number;
  lastAssignment: string;
}

interface PersonalAssignment {
  id: string;
  partTitle: string;
  week: string;
  date: string;
  theme: string;
  type: string;
  time: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed';
  materials?: string[];
  notes?: string;
}

interface CongregationProgram {
  id: string;
  week: string;
  date: string;
  theme: string;
  parts: Array<{
    id: string;
    title: string;
    time: string;
    type: string;
    assignedTo?: string;
    isMyAssignment: boolean;
  }>;
}

interface Material {
  id: string;
  name: string;
  type: 'PDF' | 'JWPub' | 'RTF';
  size: string;
  relevantFor: string[];
  downloadUrl: string;
}

const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<StudentStats>({
    totalAssignments: 0,
    pendingAssignments: 0,
    confirmedAssignments: 0,
    completedAssignments: 0,
    confirmationRate: 0,
    lastAssignment: ''
  });
  const [assignments, setAssignments] = useState<PersonalAssignment[]>([]);
  const [programs, setPrograms] = useState<CongregationProgram[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // Load student statistics
  const loadStats = async () => {
    if (!user?.id) return;

    try {
      // Get all assignments for this student
      const { data: assignmentsData, error } = await supabase
        .from('designacoes')
        .select('*')
        .eq('id_estudante', user.id);

      if (error) throw error;

      const total = assignmentsData?.length || 0;
      const pending = assignmentsData?.filter(a => !a.confirmado && a.status !== 'recusado').length || 0;
      const confirmed = assignmentsData?.filter(a => a.confirmado).length || 0;
      const completed = assignmentsData?.filter(a => a.status === 'concluido').length || 0;
      const confirmationRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

      // Get last assignment date
      const lastAssignment = assignmentsData && assignmentsData.length > 0 
        ? assignmentsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : '';

      setStats({
        totalAssignments: total,
        pendingAssignments: pending,
        confirmedAssignments: confirmed,
        completedAssignments: completed,
        confirmationRate,
        lastAssignment
      });
    } catch (error) {
      console.error('Error loading student stats:', error);
    }
  };

  // Load personal assignments
  const loadPersonalAssignments = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('designacoes')
        .select(`
          *,
          programas!inner(semana, data_reuniao, tema_reuniao)
        `)
        .eq('id_estudante', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform data to match our interface
      const transformedAssignments: PersonalAssignment[] = (data || []).map(assignment => ({
        id: assignment.id,
        partTitle: assignment.tipo_parte || 'Parte não definida',
        week: `Semana ${assignment.programas?.semana}`,
        date: assignment.programas?.data_reuniao || '',
        theme: assignment.programas?.tema_reuniao || 'Tema não definido',
        type: assignment.tipo_parte || 'general',
        time: '10 min', // Would come from program structure
        status: assignment.confirmado ? 'confirmed' : 
                assignment.status === 'recusado' ? 'declined' : 'pending',
        materials: [], // Would be populated based on assignment type
        notes: assignment.observacoes
      }));

      setAssignments(transformedAssignments);
    } catch (error) {
      console.error('Error loading personal assignments:', error);
    }
  };

  // Load congregation programs (read-only view)
  const loadCongregationPrograms = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('programas')
        .select('*')
        .eq('status', 'ativo')
        .order('data_reuniao', { ascending: true })
        .limit(6);

      if (error) throw error;

      // Transform data to match our interface
      const transformedPrograms: CongregationProgram[] = (data || []).map(program => ({
        id: program.id,
        week: `Semana ${program.semana}`,
        date: program.data_reuniao || '',
        theme: program.tema_reuniao || 'Tema não definido',
        parts: [
          {
            id: '1',
            title: 'Cântico e Oração',
            time: '5 min',
            type: 'opening',
            isMyAssignment: false
          },
          {
            id: '2',
            title: 'Tesouros da Palavra de Deus',
            time: '10 min',
            type: 'treasures',
            isMyAssignment: assignments.some(a => a.type === 'treasures' && a.week === `Semana ${program.semana}`)
          },
          {
            id: '3',
            title: 'Faça Seu Melhor no Ministério',
            time: '15 min',
            type: 'ministry',
            isMyAssignment: assignments.some(a => a.type === 'ministry' && a.week === `Semana ${program.semana}`)
          },
          {
            id: '4',
            title: 'Nossa Vida Cristã',
            time: '15 min',
            type: 'christian_life',
            isMyAssignment: assignments.some(a => a.type === 'christian_life' && a.week === `Semana ${program.semana}`)
          }
        ]
      }));

      setPrograms(transformedPrograms);
    } catch (error) {
      console.error('Error loading congregation programs:', error);
    }
  };

  // Mock materials data (would come from actual file storage)
  const loadMaterials = () => {
    const mockMaterials: Material[] = [
      {
        id: '1',
        name: 'Apostila MWB Setembro-Outubro 2025',
        type: 'PDF',
        size: '2.4 MB',
        relevantFor: ['Tesouros da Palavra', 'Faça Seu Melhor no Ministério'],
        downloadUrl: '#'
      },
      {
        id: '2',
        name: 'Guia de Estudo Bíblico',
        type: 'PDF',
        size: '1.8 MB',
        relevantFor: ['Ministério'],
        downloadUrl: '#'
      },
      {
        id: '3',
        name: 'Instruções S-38',
        type: 'PDF',
        size: '0.5 MB',
        relevantFor: ['Geral'],
        downloadUrl: '#'
      }
    ];
    setMaterials(mockMaterials);
  };

  // Handle assignment confirmation/decline
  const handleAssignmentResponse = async (assignmentId: string, response: 'confirm' | 'decline') => {
    if (!assignmentId || !['confirm', 'decline'].includes(response)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('designacoes')
        .update({
          confirmado: response === 'confirm',
          status: response === 'decline' ? 'recusado' : 'confirmado'
        })
        .eq('id', assignmentId);

      if (error) throw error;

      // Reload assignments to reflect changes
      await loadPersonalAssignments();
      await loadStats();
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadPersonalAssignments()
      ]);
      await loadCongregationPrograms(); // Load after assignments to check for matches
      loadMaterials();
      setLoading(false);
    };

    initializeData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando Portal do Estudante...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Portal do Estudante</h1>
              <p className="text-muted-foreground">
                Bem-vindo, {profile?.nome_completo || 'Estudante'}!
              </p>
            </div>
          </div>

          {/* Personal Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Designações</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAssignments}</div>
                <p className="text-xs text-muted-foreground">Total recebidas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingAssignments}</div>
                <p className="text-xs text-muted-foreground">Aguardando resposta</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.confirmedAssignments}</div>
                <p className="text-xs text-muted-foreground">Prontas para apresentar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Confirmação</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.confirmationRate}%</div>
                <p className="text-xs text-muted-foreground">Histórico de participação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Ativo</div>
                <p className="text-xs text-muted-foreground">Participando regularmente</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="assignments">Minhas Designações</TabsTrigger>
            <TabsTrigger value="programs">Programação</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Próximas Designações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignments.filter(a => a.status === 'confirmed').slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{assignment.partTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.week} • {assignment.date}
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Confirmado
                      </Badge>
                    </div>
                  ))}
                  
                  {assignments.filter(a => a.status === 'pending').slice(0, 2).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{assignment.partTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.week} • {assignment.date}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleAssignmentResponse(assignment.id, 'confirm')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAssignmentResponse(assignment.id, 'decline')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    </div>
                  ))}

                  {assignments.length === 0 && (
                    <div className="text-center p-4 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma designação pendente</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Resumo da Semana
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">
                      {stats.confirmedAssignments > 0 
                        ? `Próxima designação: ${assignments.find(a => a.status === 'confirmed')?.date || 'A definir'}`
                        : 'Nenhuma designação confirmada'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Material: Apostila MWB disponível</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Taxa de participação: {stats.confirmationRate}%</span>
                  </div>
                  <Button className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar Status
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Minhas Designações
                </CardTitle>
                <CardDescription>
                  Visualize e responda às suas designações recebidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id} className={`border-l-4 ${
                      assignment.status === 'confirmed' ? 'border-l-green-500' :
                      assignment.status === 'pending' ? 'border-l-orange-500' :
                      assignment.status === 'declined' ? 'border-l-red-500' : 'border-l-gray-500'
                    }`}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{assignment.partTitle}</h4>
                            <p className="text-sm text-muted-foreground">{assignment.theme}</p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.week} • {assignment.date} • {assignment.time}
                            </p>
                            {assignment.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                Observações: {assignment.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                assignment.status === 'confirmed' ? 'default' :
                                assignment.status === 'pending' ? 'secondary' : 'destructive'
                              }
                              className={
                                assignment.status === 'pending' ? 'bg-orange-100 text-orange-800' : ''
                              }
                            >
                              {assignment.status === 'confirmed' ? 'Confirmado' :
                               assignment.status === 'pending' ? 'Pendente' :
                               assignment.status === 'declined' ? 'Recusado' : 'Concluído'}
                            </Badge>
                            {assignment.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAssignmentResponse(assignment.id, 'confirm')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleAssignmentResponse(assignment.id, 'decline')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {assignments.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Nenhuma designação encontrada</h3>
                      <p className="text-sm">Você ainda não recebeu designações ou elas não foram carregadas.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Programação da Congregação
                </CardTitle>
                <CardDescription>
                  Visualização da programação oficial (apenas leitura)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programs.map((program) => (
                    <Card key={program.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{program.week}</h4>
                            <p className="text-sm text-muted-foreground">{program.date}</p>
                            <p className="text-sm mt-1">{program.theme}</p>
                          </div>
                          <Badge variant="outline">Programação Oficial</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {program.parts.map((part) => (
                            <div 
                              key={part.id} 
                              className={`flex items-center justify-between p-2 rounded ${
                                part.isMyAssignment ? 'bg-blue-50 border border-blue-200' : 'bg-muted'
                              }`}
                            >
                              <div>
                                <span className="text-sm font-medium">{part.title}</span>
                                <span className="text-xs text-muted-foreground ml-2">({part.time})</span>
                              </div>
                              {part.isMyAssignment && (
                                <Badge variant="default" className="bg-blue-600">
                                  Minha Designação
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Materiais Disponíveis
                </CardTitle>
                <CardDescription>
                  Baixe os materiais necessários para suas designações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materials.map((material) => (
                    <Card key={material.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                              <h4 className="font-semibold">{material.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {material.type} • {material.size}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Relevante para: {material.relevantFor.join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </Button>
                            <Button size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Baixar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Recursos Adicionais</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Acesse recursos adicionais no site oficial das Testemunhas de Jeová
                  </p>
                  <Button variant="outline" className="border-blue-300 text-blue-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visitar JW.org
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;