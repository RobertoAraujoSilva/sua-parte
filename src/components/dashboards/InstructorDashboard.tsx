import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Calendar, 
  FileText, 
  Download, 
  BookOpen, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Edit3,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Bell,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface InstructorStats {
  totalStudents: number;
  totalAssignments: number;
  pendingConfirmations: number;
  completedAssignments: number;
  activePrograms: number;
  lastSync: string;
}

interface OfficialProgram {
  id: string;
  week: string;
  date: string;
  theme: string;
  parts: Array<{
    id: string;
    title: string;
    time: string;
    type: string;
    assignedStudent?: string;
    status: 'unassigned' | 'assigned' | 'confirmed' | 'declined';
  }>;
  language: string;
  publishedBy: string;
}

interface Student {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  lastAssignment: string;
  totalAssignments: number;
  confirmationRate: number;
}

interface Assignment {
  id: string;
  studentName: string;
  partTitle: string;
  week: string;
  date: string;
  status: 'pending' | 'confirmed' | 'declined';
  type: string;
}

const InstructorDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<InstructorStats>({
    totalStudents: 0,
    totalAssignments: 0,
    pendingConfirmations: 0,
    completedAssignments: 0,
    activePrograms: 0,
    lastSync: new Date().toISOString()
  });
  const [programs, setPrograms] = useState<OfficialProgram[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load instructor statistics
  const loadStats = async () => {
    if (!user?.id) return;

    try {
      const [studentsResult, assignmentsResult, programsResult] = await Promise.all([
        supabase.from('estudantes').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('designacoes').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('programas').select('id', { count: 'exact' }).eq('status', 'ativo')
      ]);

      // Get pending confirmations
      const { data: pendingData } = await supabase
        .from('designacoes')
        .select('id')
        .eq('user_id', user.id)
        .eq('confirmado', false);

      setStats({
        totalStudents: studentsResult.count || 0,
        totalAssignments: assignmentsResult.count || 0,
        pendingConfirmations: pendingData?.length || 0,
        completedAssignments: (assignmentsResult.count || 0) - (pendingData?.length || 0),
        activePrograms: programsResult.count || 0,
        lastSync: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading instructor stats:', error);
    }
  };

  // Load official programs (mirror from admin)
  const loadOfficialPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programas')
        .select('*')
        .eq('status', 'ativo')
        .order('data_reuniao', { ascending: true })
        .limit(8);

      if (error) throw error;

      // Transform data to match our interface
      const transformedPrograms: OfficialProgram[] = (data || []).map(program => ({
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
            status: 'unassigned'
          },
          {
            id: '2',
            title: 'Tesouros da Palavra de Deus',
            time: '10 min',
            type: 'treasures',
            status: 'unassigned'
          },
          {
            id: '3',
            title: 'Faça Seu Melhor no Ministério',
            time: '15 min',
            type: 'ministry',
            status: 'unassigned'
          },
          {
            id: '4',
            title: 'Nossa Vida Cristã',
            time: '15 min',
            type: 'christian_life',
            status: 'unassigned'
          }
        ],
        language: 'pt-BR',
        publishedBy: 'Administrador'
      }));

      setPrograms(transformedPrograms);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  // Load students from congregation
  const loadStudents = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('estudantes')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) throw error;

      // Transform data to match our interface
      const transformedStudents: Student[] = (data || []).map(student => ({
        id: student.id,
        name: student.nome,
        role: student.cargo || 'Estudante',
        status: student.ativo ? 'active' : 'inactive',
        lastAssignment: '2024-08-15', // Would come from assignments query
        totalAssignments: 0, // Would come from assignments count
        confirmationRate: 95 // Would be calculated from assignment history
      }));

      setStudents(transformedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // Load recent assignments
  const loadAssignments = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('designacoes')
        .select(`
          *,
          estudantes!inner(nome),
          programas!inner(semana, data_reuniao)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform data to match our interface
      const transformedAssignments: Assignment[] = (data || []).map(assignment => ({
        id: assignment.id,
        studentName: assignment.estudantes?.nome || 'Nome não encontrado',
        partTitle: assignment.tipo_parte || 'Parte não definida',
        week: `Semana ${assignment.programas?.semana}`,
        date: assignment.programas?.data_reuniao || '',
        status: assignment.confirmado ? 'confirmed' : 'pending',
        type: assignment.tipo_parte || 'general'
      }));

      setAssignments(transformedAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadOfficialPrograms(),
        loadStudents(),
        loadAssignments()
      ]);
      setLoading(false);
    };

    initializeData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando Dashboard do Instrutor...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Dashboard do Instrutor</h1>
              <p className="text-muted-foreground">
                {profile?.congregacao || 'Sua Congregação'} - Gestão Local
              </p>
            </div>
          </div>

          {/* Local Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Em sua congregação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Designações</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAssignments}</div>
                <p className="text-xs text-muted-foreground">Total criadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingConfirmations}</div>
                <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completedAssignments}</div>
                <p className="text-xs text-muted-foreground">Prontas para reunião</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Programas</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activePrograms}</div>
                <p className="text-xs text-muted-foreground">Disponíveis</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="programs">Programação Oficial</TabsTrigger>
            <TabsTrigger value="assignments">Designações</TabsTrigger>
            <TabsTrigger value="students">Estudantes</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Designação
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Cadastrar Estudante
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Materiais
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificações Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.pendingConfirmations > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {stats.pendingConfirmations} designações aguardando confirmação dos estudantes.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Nova programação oficial disponível</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Materiais atualizados pelo administrador</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Official Programs Tab */}
          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Programação Oficial (Espelho do Admin)
                </CardTitle>
                <CardDescription>
                  Programação publicada pelo administrador - base para suas designações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtrar por Mês
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar
                    </Button>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    Sincronizado com Admin
                  </Badge>
                </div>

                <div className="space-y-4">
                  {programs.map((program) => (
                    <Card key={program.id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{program.week}</h4>
                            <p className="text-sm text-muted-foreground">{program.date}</p>
                            <p className="text-sm mt-1">{program.theme}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Oficial</Badge>
                            <Button variant="outline" size="sm">
                              <UserCheck className="mr-2 h-4 w-4" />
                              Designar
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {program.parts.map((part) => (
                            <div key={part.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <span className="text-sm font-medium">{part.title}</span>
                                <span className="text-xs text-muted-foreground ml-2">({part.time})</span>
                              </div>
                              <Badge 
                                variant={part.status === 'confirmed' ? 'default' : 'secondary'}
                                className={part.status === 'unassigned' ? 'bg-orange-100 text-orange-800' : ''}
                              >
                                {part.status === 'unassigned' ? 'Não Designado' :
                                 part.status === 'assigned' ? 'Designado' :
                                 part.status === 'confirmed' ? 'Confirmado' : 'Recusado'}
                              </Badge>
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

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Designações da Congregação
                </CardTitle>
                <CardDescription>
                  Gerencie as designações dos estudantes para as partes da programação oficial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Designação
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </Button>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtrar
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{assignment.studentName}</h4>
                            <p className="text-sm text-muted-foreground">{assignment.partTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {assignment.week} • {assignment.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                assignment.status === 'confirmed' ? 'default' :
                                assignment.status === 'pending' ? 'secondary' : 'destructive'
                              }
                            >
                              {assignment.status === 'confirmed' ? 'Confirmado' :
                               assignment.status === 'pending' ? 'Pendente' : 'Recusado'}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestão de Estudantes
                </CardTitle>
                <CardDescription>
                  Cadastre e gerencie os estudantes da sua congregação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Estudante
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </Button>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Importar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((student) => (
                    <Card key={student.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{student.name}</h4>
                            <p className="text-sm text-muted-foreground">{student.role}</p>
                          </div>
                          <Badge 
                            variant={student.status === 'active' ? 'default' : 'secondary'}
                          >
                            {student.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>Última designação: {student.lastAssignment}</p>
                          <p>Total de designações: {student.totalAssignments}</p>
                          <p>Taxa de confirmação: {student.confirmationRate}%</p>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Relatórios de Participação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Relatório Mensal (PDF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Histórico de Designações (Excel)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="mr-2 h-4 w-4" />
                    Frequência por Estudante
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Materiais Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Apostila MWB Setembro-Outubro 2025</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Instruções S-38 atualizadas</span>
                  </div>
                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Todos os Materiais
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InstructorDashboard;