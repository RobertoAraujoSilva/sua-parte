import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Globe, 
  Users, 
  Calendar,
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Database,
  RefreshCw,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useAdminData } from '@/hooks/useUnifiedData';

// ==============================================================================
// 🎯 REFACTORED ADMIN DASHBOARD - Usa Sistema Unificado
// ==============================================================================

const RefactoredAdminDashboard: React.FC = () => {
  const {
    adminStats,
    systemHealth,
    allPrograms,
    isLoading,
    error,
    isDataStale,
    smartRefresh,
    forceRefresh,
    lastCacheUpdate
  } = useAdminData();

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
        <span className="ml-2">Carregando Dashboard Administrativo...</span>
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
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
                <p className="text-muted-foreground">
                  Sistema Ministerial Global - Controle Central
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleForceRefresh}
                disabled={isLoading}
              >
                <Zap className="h-4 w-4 mr-2" />
                Forçar Sync
              </Button>
            </div>
          </div>

          {/* System Status Alert */}
          <div className="flex gap-4 mb-6">
            <Alert className={`flex-1 ${systemHealth === 'healthy' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <Database className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    {systemHealth === 'healthy' ? (
                      <>
                        <strong>✅ Sistema Operacional</strong> - Todos os serviços funcionando normalmente
                      </>
                    ) : (
                      <>
                        <strong>❌ Sistema com Problemas</strong> - Alguns serviços podem estar indisponíveis
                      </>
                    )}
                  </span>
                  <Badge variant={systemHealth === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth === 'healthy' ? 'Online' : 'Problemas'}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>

            {isDataStale() && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dados Desatualizados</strong> - Última atualização: {lastCacheUpdate || 'Nunca'}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erro:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Global Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Congregações</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.totalCongregations || 0}</div>
                <p className="text-xs text-muted-foreground">Ativas no sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instrutores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.totalInstructors || 0}</div>
                <p className="text-xs text-muted-foreground">Gerenciando congregações</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">Total no sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Programas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.totalPrograms || 0}</div>
                <p className="text-xs text-muted-foreground">Publicados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistema</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${systemHealth === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                  {systemHealth === 'healthy' ? 'Online' : 'Problemas'}
                </div>
                <p className="text-xs text-muted-foreground">Status operacional</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="congregations">Congregações</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Resumo do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Status Geral</span>
                    <Badge variant={systemHealth === 'healthy' ? 'default' : 'destructive'}>
                      {systemHealth === 'healthy' ? 'Operacional' : 'Problemas'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Última Sincronização</span>
                    <span className="text-sm text-muted-foreground">
                      {adminStats?.lastSync ? new Date(adminStats.lastSync).toLocaleString('pt-BR') : 'Nunca'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Total de Designações</span>
                    <span className="text-sm font-bold">{adminStats?.totalAssignments || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Programação Global
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {allPrograms && allPrograms.length > 0 ? (
                    allPrograms.slice(0, 3).map((program: any) => (
                      <div key={program.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{program.semana || 'Semana não definida'}</p>
                          <p className="text-xs text-muted-foreground">
                            {program.data_inicio_semana || 'Data não definida'}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {program.status === 'ativo' ? 'Ativo' : program.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum programa encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs can be implemented as needed */}
          <TabsContent value="congregations">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Congregações</CardTitle>
                <CardDescription>
                  Gerencie congregações e instrutores do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Configure parâmetros globais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Globais</CardTitle>
                <CardDescription>
                  Relatórios e análises do sistema completo
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

export default RefactoredAdminDashboard;
