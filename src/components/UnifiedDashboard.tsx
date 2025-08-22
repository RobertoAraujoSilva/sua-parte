import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { realDataFetcher } from '@/utils/fetchRealDashboardData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Building2, 
  RefreshCw, 
  Upload,
  TrendingUp,
  Activity,
  FileText,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MaterialUploader from '@/components/MaterialUploader';

// Lazy load components for better performance
const OverviewTab = lazy(() => import('@/components/admin/OverviewTab'));
const CongregationsTab = lazy(() => import('@/components/admin/CongregationsTab'));
const MonitoringTab = lazy(() => import('@/components/admin/MonitoringTab'));

// 🚀 DASHBOARD UNIFICADO QUE ADAPTA AO ROLE DO USUÁRIO
export default function UnifiedDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({
    totalEstudantes: 0,
    totalProgramas: 0,
    totalDesignacoes: 0,
    totalCongregacoes: 0,
    loading: true
  });
  const [jworgData, setJworgData] = useState<any>(null);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMaterialUploader, setShowMaterialUploader] = useState(false);

  // 📊 DADOS REAIS DO SUPABASE
  const {
    stats: supabaseStats,
    workbooks,
    programming,
    loading: supabaseLoading,
    error: supabaseError,
    refreshData,
    refreshAllData
  } = useSupabaseData();

  const { toast } = useToast();

  // 🎯 CARREGAR ESTATÍSTICAS REAIS BASEADAS NO ROLE
  const loadDashboardStats = async () => {
    if (!user?.id) return;

    try {
      setDashboardStats(prev => ({ ...prev, loading: true }));

      // Use real data fetcher for all roles
      const realStats = await realDataFetcher.fetchDashboardStats();

      if (profile?.role === 'admin') {
        // 📊 ESTATÍSTICAS GLOBAIS PARA ADMIN - usando dados reais
        setDashboardStats({
          totalEstudantes: realStats.totalStudents,
          totalProgramas: realStats.totalWorkbooks,
          totalDesignacoes: realStats.totalAssignments,
          totalCongregacoes: realStats.totalCongregations,
          loading: false
        });
      } else if (profile?.role === 'instrutor') {
        // 📊 ESTATÍSTICAS LOCAIS PARA INSTRUTOR - usando dados reais
        const studentsInCongregation = await realDataFetcher.fetchStudents(100);
        const congregationStudents = studentsInCongregation.filter(s => s.ativo).length;

        setDashboardStats({
          totalEstudantes: congregationStudents,
          totalProgramas: realStats.totalWorkbooks,
          totalDesignacoes: realStats.totalAssignments,
          totalCongregacoes: 1, // Instrutor gerencia uma congregação
          loading: false
        });
      } else if (profile?.role === 'estudante') {
        // 📊 ESTATÍSTICAS INDIVIDUAIS PARA ESTUDANTE - usando dados reais
        setDashboardStats({
          totalEstudantes: 1,
          totalProgramas: realStats.totalWorkbooks,
          totalDesignacoes: realStats.totalAssignments,
          totalCongregacoes: 1,
          loading: false
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas reais:', error);
      setDashboardStats(prev => ({ ...prev, loading: false }));
    }
  };

  // 🎯 CARREGAR DADOS REAIS ESPECÍFICOS POR ROLE
  const loadRoleSpecificData = async () => {
    if (!user?.id || !profile?.role) return;

    try {
      setLoading(true);

      if (profile.role === 'admin') {
        // 🏠 DADOS ADMIN: Materiais JW.org e estatísticas globais
        const realWorkbooks = await realDataFetcher.fetchWorkbooks(5);
        setJworgData(realWorkbooks);

        // Fetch recent programming data
        const recentProgramming = await realDataFetcher.fetchProgramming(5);
        setRecentAssignments(recentProgramming);

      } else if (profile.role === 'instrutor') {
        // 👨‍🏫 DADOS INSTRUTOR: Programação recente da congregação
        const recentProgramming = await realDataFetcher.fetchProgramming(5);
        setRecentAssignments(recentProgramming);

        // Fetch students in instructor's congregation
        const students = await realDataFetcher.fetchStudents(50);
        setJworgData(students); // Use students data for instructor view

      } else if (profile.role === 'estudante') {
        // 👨‍🎓 DADOS ESTUDANTE: Programação disponível e materiais
        const recentProgramming = await realDataFetcher.fetchProgramming(5);
        setRecentAssignments(recentProgramming);

        // Fetch available workbooks for student
        const availableWorkbooks = await realDataFetcher.fetchWorkbooks(5);
        setJworgData(availableWorkbooks);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados específicos reais:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && profile?.role) {
      loadDashboardStats();
      loadRoleSpecificData();
    }
  }, [user?.id, profile?.role]);

  // Função para recarregar dados após upload
  const handleUploadComplete = async (results: any[]) => {
    console.log('📤 Upload completed, refreshing data...');
    
    try {
      // Refresh all data
      await refreshAllData();
      await loadDashboardStats();
      await loadRoleSpecificData();
      
      toast({
        title: "✅ Upload Concluído",
        description: `Processados ${results.length} arquivos com sucesso.`,
      });
    } catch (error) {
      console.error('❌ Error refreshing data after upload:', error);
      toast({
        title: "⚠️ Aviso",
        description: "Upload concluído, mas houve erro ao atualizar dados.",
        variant: "destructive"
      });
    }
  };

  // Função para recarregar dados manualmente
  const handleRefreshData = async () => {
    try {
      setLoading(true);
      await refreshAllData();
      await loadDashboardStats();
      await loadRoleSpecificData();
      
      toast({
        title: "🔄 Dados Atualizados",
        description: "Todos os dados foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao atualizar dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizar estatísticas baseadas no role
  const renderStats = () => {
    const stats = [
      {
        title: "Estudantes",
        value: dashboardStats.totalEstudantes,
        icon: Users,
        description: profile?.role === 'admin' ? 'Total de estudantes' : 'Estudantes ativos',
        color: "text-blue-600"
      },
      {
        title: "Materiais",
        value: dashboardStats.totalProgramas,
        icon: BookOpen,
        description: "Apostilas disponíveis",
        color: "text-green-600"
      },
      {
        title: "Designações",
        value: dashboardStats.totalDesignacoes,
        icon: Calendar,
        description: "Designações programadas",
        color: "text-purple-600"
      },
      {
        title: "Congregações",
        value: dashboardStats.totalCongregacoes,
        icon: Building2,
        description: "Congregações ativas",
        color: "text-orange-600"
      }
    ];

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.loading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stat.value.toLocaleString('pt-BR')
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Renderizar dados específicos por role
  const renderRoleSpecificData = () => {
    if (loading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (profile?.role === 'admin') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Materiais JW.org */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Materiais JW.org
              </CardTitle>
              <CardDescription>
                Apostilas e materiais oficiais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jworgData && jworgData.length > 0 ? (
                <div className="space-y-2">
                  {jworgData.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.title || item.version_code}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.parsing_status || item.status}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {item.language_code || 'pt-BR'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum material disponível</p>
              )}
            </CardContent>
          </Card>

          {/* Programação Recente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Programação Recente
              </CardTitle>
              <CardDescription>
                Últimas designações criadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAssignments && recentAssignments.length > 0 ? (
                <div className="space-y-2">
                  {recentAssignments.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.part_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.meeting_type} - {item.section_name}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma designação recente</p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (profile?.role === 'instrutor') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Estudantes da Congregação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estudantes da Congregação
              </CardTitle>
              <CardDescription>
                Estudantes ativos sob sua responsabilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jworgData && jworgData.length > 0 ? (
                <div className="space-y-2">
                  {jworgData.slice(0, 5).map((student: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{student.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.cargo} - {student.idade} anos
                        </p>
                      </div>
                      <Badge variant={student.ativo ? "default" : "secondary"}>
                        {student.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum estudante encontrado</p>
              )}
            </CardContent>
          </Card>

          {/* Programação da Semana */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Programação da Semana
              </CardTitle>
              <CardDescription>
                Designações para esta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAssignments && recentAssignments.length > 0 ? (
                <div className="space-y-2">
                  {recentAssignments.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.part_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.meeting_type} - {item.section_name}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {item.part_duration}min
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma designação para esta semana</p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (profile?.role === 'estudante') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Minhas Designações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Minhas Designações
              </CardTitle>
              <CardDescription>
                Suas próximas designações
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAssignments && recentAssignments.length > 0 ? (
                <div className="space-y-2">
                  {recentAssignments.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.part_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.meeting_type} - {item.section_name}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {item.part_duration}min
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma designação agendada</p>
              )}
            </CardContent>
          </Card>

          {/* Materiais Disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Materiais Disponíveis
              </CardTitle>
              <CardDescription>
                Apostilas e materiais para estudo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jworgData && jworgData.length > 0 ? (
                <div className="space-y-2">
                  {jworgData.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.title || item.version_code}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.period_start} - {item.period_end}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {item.language_code || 'pt-BR'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum material disponível</p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com título e ações */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard {profile?.role === 'admin' ? 'Administrativo' : 
                       profile?.role === 'instrutor' ? 'do Instrutor' : 'do Estudante'}
          </h1>
                     <p className="text-muted-foreground">
             Bem-vindo, {profile?.nome_completo || user.email}
           </p>
        </div>
        
        <div className="flex items-center gap-2">
          {profile?.role === 'admin' && (
            <Button
              onClick={() => setShowMaterialUploader(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Material
            </Button>
          )}
          
          <Button
            onClick={handleRefreshData}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {renderStats()}

      {/* Dados específicos por role */}
      {renderRoleSpecificData()}

      {/* Tabs para Admin */}
      {profile?.role === 'admin' && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="congregations">Congregações</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Suspense fallback={<div>Carregando...</div>}>
              <OverviewTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="congregations" className="space-y-4">
            <Suspense fallback={<div>Carregando...</div>}>
              <CongregationsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Suspense fallback={<div>Carregando...</div>}>
              <MonitoringTab />
            </Suspense>
          </TabsContent>
        </Tabs>
      )}

             {/* Material Uploader Modal */}
       {showMaterialUploader && (
         <MaterialUploader
           onUploadComplete={handleUploadComplete}
           onClose={() => setShowMaterialUploader(false)}
         />
       )}
    </div>
  );
}
