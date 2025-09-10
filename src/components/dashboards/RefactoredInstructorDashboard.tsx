import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle,
  BookOpen, 
  AlertCircle,
  Plus,
  RefreshCw,
  Target,
  Bell,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInstructorData } from '@/hooks/useUnifiedData';

// ==============================================================================
// 🎯 REFACTORED INSTRUCTOR DASHBOARD - Usa Sistema Unificado
// ==============================================================================

const RefactoredInstructorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const {
    instructorStats,
    congregationStudents,
    congregationPrograms,
    congregationAssignments,
    isLoading,
    error,
    isDataStale,
    smartRefresh,
    forceRefresh,
    createStudent,
    createProgram,
    pendingAssignments,
    confirmedAssignments,
    activePrograms
  } = useInstructorData();

  const [activeTab, setActiveTab] = useState('overview');

  // Handle refresh
  const handleRefresh = async () => {
    await smartRefresh();
  };

  const handleForceRefresh = async () => {
    await forceRefresh();
  };

  if (isLoading) {
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Dashboard do Instrutor</h1>
                <p className="text-muted-foreground">
                  {profile?.congregacao || 'Sua Congregação'} - Gestão Local
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Status Alerts */}
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erro:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {isDataStale() && (
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Dados Desatualizados</strong> - Clique em "Atualizar" para sincronizar
              </AlertDescription>
            </Alert>
          )}

          {/* Local Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{instructorStats?.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">Em sua congregação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Designações</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{instructorStats?.totalAssignments || 0}</div>
                <p className="text-xs text-muted-foreground">Total criadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{instructorStats?.pendingConfirmations || 0}</div>
                <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{instructorStats?.completedAssignments || 0}</div>
                <p className="text-xs text-muted-foreground">Prontas para reunião</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Programas</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{instructorStats?.activePrograms || 0}</div>
                <p className="text-xs text-muted-foreground">Disponíveis</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="students">Estudantes</TabsTrigger>
            <TabsTrigger value="assignments">Designações</TabsTrigger>
            <TabsTrigger value="programs">Programas</TabsTrigger>
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
                    Criar Nova Designação
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Cadastrar Estudante
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Novo Programa
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
                  {instructorStats?.pendingConfirmations && instructorStats.pendingConfirmations > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {instructorStats.pendingConfirmations} designações aguardando confirmação dos estudantes.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Sistema sincronizado com sucesso</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      {congregationStudents?.length || 0} estudantes ativos na congregação
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Estudantes da Congregação</span>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Estudante
                  </Button>
                </CardTitle>
                <CardDescription>
                  Gerencie os estudantes da sua congregação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {congregationStudents && congregationStudents.length > 0 ? (
                  <div className="space-y-4">
                    {congregationStudents.slice(0, 10).map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{student.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.cargo} • {student.genero} • {student.idade ? `${student.idade} anos` : ''}
                          </p>
                        </div>
                        <Badge variant={student.ativo ? 'default' : 'outline'}>
                          {student.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    ))}
                    {congregationStudents.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        E mais {congregationStudents.length - 10} estudantes...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Nenhum estudante cadastrado</p>
                    <p className="text-sm mb-4">Comece cadastrando estudantes da sua congregação</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Primeiro Estudante
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Designações</CardTitle>
                <CardDescription>
                  Gerencie as designações da congregação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {congregationAssignments && congregationAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {congregationAssignments.slice(0, 10).map((assignment: any) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{assignment.titulo_parte || assignment.tipo_parte}</p>
                          <p className="text-xs text-muted-foreground">
                            Parte {assignment.numero_parte} • {assignment.tempo_minutos || 10} min
                          </p>
                        </div>
                        <Badge variant={assignment.confirmado ? 'default' : 'outline'}>
                          {assignment.confirmado ? 'Confirmado' : 'Pendente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Nenhuma designação criada</p>
                    <p className="text-sm mb-4">Crie designações para seus estudantes</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Designação
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <CardTitle>Programas</CardTitle>
                <CardDescription>
                  Programas disponíveis para sua congregação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {congregationPrograms && congregationPrograms.length > 0 ? (
                  <div className="space-y-4">
                    {congregationPrograms.slice(0, 5).map((program: any) => (
                      <div key={program.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{program.semana}</p>
                          <p className="text-xs text-muted-foreground">
                            {program.data_inicio_semana} • {program.mes_apostila}
                          </p>
                        </div>
                        <Badge variant={program.status === 'ativo' ? 'default' : 'outline'}>
                          {program.status === 'ativo' ? 'Ativo' : program.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Nenhum programa disponível</p>
                    <p className="text-sm">Programas aparecerão aqui quando estiverem disponíveis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>
                  Relatórios e estatísticas da congregação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RefactoredInstructorDashboard;