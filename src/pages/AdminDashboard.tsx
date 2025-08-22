import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { useJWorgIntegration } from '../hooks/useJWorgIntegration';
import { JWorgTest } from '../components/JWorgTest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import LazyLoader from '../components/LazyLoader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Download, 
  Upload, 
  Globe, 
  BarChart3, 
  Settings, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Users,
  Package,
  Activity,
  Database
} from 'lucide-react';

interface SystemStats {
  total_congregations: number;
  active_congregations: number;
  total_users: number;
  total_estudantes: number;
  total_programas: number;
  last_sync: string;
}

export default function AdminDashboard() {
  const { user, profile, isAdmin } = useAuth();
  const jworg = useJWorgIntegration();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [lastCheck, setLastCheck] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  // DEBUG: Log component state
  useEffect(() => {
    console.log('🔍 AdminDashboard Component Debug:', {
      user: !!user,
      userId: user?.id,
      userEmail: user?.email,
      profile: !!profile,
      profileRole: profile?.role,
      isAdmin,
      loading,
      userMetadata: user?.user_metadata
    });

    // Adicionar informações de debug na tela
    setDebugInfo(JSON.stringify({
      user: !!user,
      userId: user?.id,
      userEmail: user?.email,
      profile: !!profile,
      profileRole: profile?.role,
      isAdmin,
      loading,
      userMetadata: user?.user_metadata
    }, null, 2));
  }, [user, profile, isAdmin, loading]);

  useEffect(() => {
    console.log('🔄 AdminDashboard useEffect triggered:', { user, isAdmin });
    
    if (user && isAdmin) {
      console.log('✅ Admin user detected, loading system data...');
      loadSystemData();
    } else if (user && !isAdmin) {
      console.log('❌ User is not admin, role:', profile?.role);
      setDebugInfo(prev => prev + '\n\n❌ User is not admin, role: ' + profile?.role);
    } else if (!user) {
      console.log('❌ No user found');
      setDebugInfo(prev => prev + '\n\n❌ No user found');
    }
  }, [user, isAdmin]);

  const loadSystemData = useCallback(async () => {
    if (!user || !isAdmin) {
      console.log('🚫 loadSystemData: User not admin or not logged in');
      return;
    }
    
    console.log('🔄 Loading system data for admin...');
    setLoading(true);
    try {
      // Testar conexão com Supabase
      console.log('🔍 Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError);
        setDebugInfo(prev => prev + '\n\n❌ Supabase connection test failed: ' + testError.message);
      } else {
        console.log('✅ Supabase connection test successful');
        setDebugInfo(prev => prev + '\n\n✅ Supabase connection test successful');
      }

      // Carregar estatísticas do sistema usando Supabase
      console.log('🔍 Loading system statistics from Supabase...');
      await loadSystemStatistics();

      setLastCheck(new Date().toISOString());
      console.log('✅ System data loaded successfully');
      setDebugInfo(prev => prev + '\n\n✅ System data loaded successfully');
    } catch (error) {
      console.error('❌ Erro ao carregar dados do sistema:', error);
      setDebugInfo(prev => prev + '\n\n❌ Erro ao carregar dados do sistema: ' + error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const loadSystemStatistics = async () => {
    try {
      console.log('🔍 Loading system statistics...');
      
      // Contar usuários por tipo (com tratamento de erro robusto)
      let totalUsers = 0;
      try {
        const { count, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) {
          console.error('❌ Error counting users:', usersError);
        } else {
          totalUsers = count || 0;
        }
      } catch (error) {
        console.log('⚠️ Could not count users, using default value');
      }

      // Contar estudantes (com tratamento de erro robusto)
      let totalEstudantes = 0;
      try {
        const { count, error: estudantesError } = await supabase
          .from('estudantes')
          .select('*', { count: 'exact', head: true });

        if (estudantesError) {
          console.error('❌ Error counting estudantes:', estudantesError);
        } else {
          totalEstudantes = count || 0;
        }
      } catch (error) {
        console.log('⚠️ Could not count estudantes, using default value');
      }

      // Contar programas (com tratamento de erro robusto)
      let totalProgramas = 0;
      try {
        const { count, error: programasError } = await supabase
          .from('programas')
          .select('*', { count: 'exact', head: true });

        if (programasError) {
          console.error('❌ Error counting programas:', programasError);
        } else {
          totalProgramas = count || 0;
        }
      } catch (error) {
        console.log('⚠️ Could not count programas, using default value');
      }

      // Contar congregações únicas (com tratamento de erro robusto)
      let totalCongregacoes = 0;
      try {
        const { data: congregacoes, error: congregacoesError } = await supabase
          .from('profiles')
          .select('congregacao')
          .not('congregacao', 'is', null);

        if (congregacoesError) {
          console.error('❌ Error getting congregations:', congregacoesError);
        } else if (congregacoes) {
          const uniqueCongregacoes = new Set(congregacoes.map(p => p.congregacao));
          totalCongregacoes = uniqueCongregacoes.size;
        }
      } catch (error) {
        console.log('⚠️ Could not count congregations, using default value');
      }

      const activeCongregacoes = totalCongregacoes; // Simplificado por enquanto

      setSystemStats({
        total_congregations: totalCongregacoes,
        active_congregations: activeCongregacoes,
        total_users: totalUsers,
        total_estudantes: totalEstudantes,
        total_programas: totalProgramas,
        last_sync: new Date().toISOString()
      });

      console.log('✅ System statistics loaded:', {
        totalCongregacoes,
        activeCongregacoes,
        totalUsers,
        totalEstudantes,
        totalProgramas
      });

    } catch (error) {
      console.error('❌ Error loading system statistics:', error);
      
      // Definir estatísticas padrão em caso de erro
      setSystemStats({
        total_congregations: 0,
        active_congregations: 0,
        total_users: 0,
        total_estudantes: 0,
        total_programas: 0,
        last_sync: new Date().toISOString()
      });
    }
  };

  const checkForUpdates = async () => {
    console.log('🔄 checkForUpdates called');
    setLoading(true);
    try {
      // Simular verificação de atualizações
      console.log('🔍 Checking for system updates...');
      
      // Recarregar estatísticas
      await loadSystemStatistics();
      
      console.log('✅ Updates check completed');
      setDebugInfo(prev => prev + '\n\n✅ Updates check completed');
      
      setLastCheck(new Date().toISOString());
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error);
      setDebugInfo(prev => prev + '\n\n❌ Erro ao verificar atualizações: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    console.log('🔍 Testing Supabase connection...');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('❌ Supabase test failed:', error);
        alert('Supabase test failed: ' + error.message);
      } else {
        console.log('✅ Supabase test successful:', data);
        alert('Supabase connection successful! Found ' + data.length + ' profiles.');
      }
    } catch (error) {
      console.error('❌ Supabase test exception:', error);
      alert('Supabase test exception: ' + error);
    }
  };

  // Se não for admin, mostrar mensagem de acesso negado
  if (user && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar o painel administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Seu perfil atual: <strong>{profile?.role}</strong>
            </p>
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não houver usuário, mostrar loading
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
            <CardDescription>
              Verificando autenticação...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">📊 Dashboard do Administrador Geral</h1>
                <p className="text-muted-foreground">
                  Programação oficial das reuniões ministeriais - Padronização mundial para todas as congregações
              </p>
            </div>
              <div className="flex items-center space-x-2">
              {/* Force Profile Load Button */}
              {import.meta.env.DEV && (
                <Button 
                  variant="outline" 
                  size="sm"
                    onClick={testSupabaseConnection}
                  >
                    🔧 Test Supabase
                </Button>
              )}
              
              <Button onClick={checkForUpdates} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
              </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info Panel */}
      {import.meta.env.DEV && (
        <div className="container mx-auto px-4 py-2">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-800">🐛 Debug Info (Development Only)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-yellow-700 overflow-auto max-h-40">
                {debugInfo}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview">🏠 Visão Geral</TabsTrigger>
                            <TabsTrigger value="users">👥 Usuários & S-38</TabsTrigger>
                            <TabsTrigger value="congregations">🏢 Congregações</TabsTrigger>
                            <TabsTrigger value="system">📚 JW.org & S-38</TabsTrigger>
                            <TabsTrigger value="monitoring">📊 Monitoramento</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                🌍 Programação Oficial: 2-3 meses correntes • Semanas de reunião • Discursos, temas, duração • PT/EN
              </h3>
              <div className="text-center text-sm text-muted-foreground mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <strong>📊 Admin Geral:</strong> Disponibiliza programação oficial semanal (SEM nomes de estudantes) <br/>
                <strong>🎓 Instrutores:</strong> Recebem programação automaticamente + fazem designações locais reais
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useMemo(() => (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Congregações Conectadas</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats?.total_congregations || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Recebendo programação oficial
                    </p>
                  </CardContent>
                </Card>
              ), [systemStats?.total_congregations])}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Semanas Programadas</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    Próximas 3 meses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Idiomas Disponíveis</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">
                    Português e Inglês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">✅</div>
                  <p className="text-xs text-muted-foreground">
                    Hoje, {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle>Status do Sistema</CardTitle>
                  <CardDescription>
                    Informações sobre a última verificação e status geral
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Última Verificação:</span>
                    <span className="text-sm text-muted-foreground">
                      {lastCheck ? new Date(lastCheck).toLocaleString('pt-BR') : 'Nunca'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Operacional
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Supabase:</span>
                    <Badge variant="outline" className="text-green-600">
                      <Database className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* JW.org Downloads */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">📚 JW.org Downloads</CardTitle>
                  <CardDescription className="text-green-700">
                    Programações das reuniões para instrutores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-green-700 space-y-2">
                    <p>📊 <strong>Admin Geral:</strong> Programação oficial semanal (SEM nomes)</p>
                    <p>🎓 <strong>Para Instrutores:</strong> Recebem programação + fazem designações locais</p>
                    <p>🌍 <strong>Alcance:</strong> Padronização mundial para todas as congregações</p>
                    <p>🌐 <strong>Idiomas:</strong> PT/EN conforme preferência do usuário</p>
                  </div>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full text-green-700 border-green-300">
                      <Download className="h-3 w-3 mr-2" />
                      Disponibilizar MWB Atual
                    </Button>
                    <Button size="sm" variant="outline" className="w-full text-green-700 border-green-300">
                      <Globe className="h-3 w-3 mr-2" />
                      Configurar URLs JW.org
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                    Operações administrativas essenciais
                </CardDescription>
              </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Programação Oficial (2-3 meses)
                </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    Sincronizar com Congregações
                </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Semanas de Reunião
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações Globais S-38
                </Button>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="users" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                👥 Usuários do Sistema & Sistema S-38 de Designações
              </h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                🎯 Função Principal: Admin gerencia usuários → Instrutores fazem designações S-38
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de Usuários */}
            <Card>
              <CardHeader>
                  <CardTitle>Usuários Registrados</CardTitle>
                <CardDescription>
                    Últimos usuários cadastrados no sistema
                </CardDescription>
              </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                  <div>
                          <p className="font-medium">Roberto Araujo da Silva</p>
                          <p className="text-sm text-muted-foreground">Administrator</p>
                    </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Admin</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                          <p className="font-medium">Instrutores Ativos</p>
                          <p className="text-sm text-muted-foreground">{systemStats?.total_users || 0} cadastrados</p>
                    </div>
                  </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">Instrutor</Badge>
                </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações de Usuários */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Administrativas</CardTitle>
                  <CardDescription>
                    Gerenciar usuários e permissões
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Listar Todos os Usuários
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Gerenciar Permissões
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Relatório de Atividades
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Backup de Dados
                  </Button>
                </CardContent>
              </Card>

              {/* Sistema S-38 - Designações */}
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800">⚙️ Sistema S-38</CardTitle>
                  <CardDescription className="text-purple-700">
                    Estrutura das reuniões ministeriais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-purple-700 space-y-2">
                    <p>📚 <strong>Função do Admin:</strong> Disponibilizar apostilas MWB</p>
                    <p>👥 <strong>Para Instrutores:</strong> Designar estudantes para partes</p>
                    <p>🎯 <strong>Partes da Reunião:</strong></p>
                    <div className="grid grid-cols-2 gap-1 text-xs ml-2">
                      <div>• Chairman</div>
                      <div>• Treasures</div>
                      <div>• Gems</div>
                      <div>• Reading</div>
                      <div>• Starting</div>
                      <div>• Following</div>
                      <div>• Making</div>
                      <div>• Explaining</div>
                      <div>• Talk</div>
                    </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Congregações */}
          <TabsContent value="congregations" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                🏢 Gestão de Congregações para Acesso às Apostilas MWB
              </h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                🎯 Função Principal: Admin gerencia congregações → Instrutores acessam apostilas
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Estatísticas de Congregações */}
            <Card>
              <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                  <CardDescription>Resumo das congregações</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total de Congregações:</span>
                      <Badge variant="outline">{systemStats?.total_congregations || 0}</Badge>
                  </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Congregações Ativas:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {systemStats?.active_congregations || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total de Estudantes:</span>
                      <Badge variant="outline">{systemStats?.total_estudantes || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Congregações */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Congregações Registradas</CardTitle>
                  <CardDescription>Lista das congregações no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Sistema Ministerial Global</p>
                          <p className="text-sm text-muted-foreground">Congregação Principal</p>
                          </div>
                        </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Ativa
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3 mr-1" />
                          Gerenciar
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Adicionar Nova Congregação</p>
                          <p className="text-sm text-muted-foreground">Expandir o sistema para mais congregações</p>
                        </div>
                      </div>
                      <Button size="sm">
                        <Users className="h-3 w-3 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sistema */}
          <TabsContent value="system" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                📊 Programação Oficial das Reuniões Ministeriais
              </h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                🌍 Administrador Geral disponibiliza programação oficial semanal • 🎓 Instrutores fazem designações locais
              </p>
              <div className="text-center text-xs text-muted-foreground mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                ⚠️ <strong>Importante:</strong> Esta programação NÃO inclui nomes de estudantes - isso é responsabilidade local das congregações
              </div>
            </div>
            
            {/* Programação Semanal Atual */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                                            <CardTitle className="text-blue-800">📅 Apostila Semanal Atual</CardTitle>
                <CardDescription className="text-blue-700">
                  {jworg.currentWeek ? `Semana de ${jworg.currentWeek.week}` : 'Carregando...'}
                </CardDescription>
          </CardHeader>
          <CardContent>
            {jworg.isLoading ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-blue-600">Carregando programação...</span>
              </div>
            ) : jworg.error ? (
              <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Erro: {jworg.error}
              </div>
            ) : jworg.currentWeek ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-800">📖 TESOUROS DA PALAVRA DE DEUS</h4>
                    {jworg.currentWeek.parts
                      .filter(part => ['treasures', 'gems', 'reading'].includes(part.type))
                      .map(part => (
                        <div key={part.id} className="text-sm space-y-1">
                          <div>🎤 <strong>{part.id}. {part.title}</strong> ({part.duration} min)</div>
                          {part.references.map((ref, idx) => (
                            <div key={idx} className="ml-4 text-blue-600">• {ref}</div>
                          ))}
                        </div>
                      ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-800">🚪 FAÇA SEU MELHOR NO MINISTÉRIO</h4>
                    {jworg.currentWeek.parts
                      .filter(part => ['starting', 'following', 'making', 'explaining', 'talk'].includes(part.type))
                      .map(part => (
                        <div key={part.id} className="text-sm space-y-1">
                          <div>💬 <strong>{part.id}. {part.title}</strong> ({part.duration} min)</div>
                          {part.references.map((ref, idx) => (
                            <div key={idx} className="ml-4 text-blue-600">• {ref}</div>
                          ))}
                        </div>
                      ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-800">👥 NOSSA VIDA CRISTÃ</h4>
                  {jworg.currentWeek.parts
                    .filter(part => ['discussion', 'study'].includes(part.type))
                    .map(part => (
                      <div key={part.id} className="text-sm space-y-1">
                        <div>💙 <strong>{part.id}. {part.title}</strong> ({part.duration} min)</div>
                        {part.references.map((ref, idx) => (
                          <div key={idx} className="ml-4 text-blue-600">• {ref}</div>
                        ))}
                      </div>
                    ))}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-800">
                    <strong>📊 Admin Geral:</strong> Fornece programação oficial semanal (sem nomes de estudantes)
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    <strong>🎓 Instrutores:</strong> Recebem esta programação e fazem designações reais com estudantes locais
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    <strong>🌍 Resultado:</strong> Padronização mundial + flexibilidade local nas designações
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                    <Globe className="h-3 w-3 mr-2" />
                    Sincronizar com Congregações
                  </Button>
                  <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                    <BarChart3 className="h-3 w-3 mr-2" />
                    Ver Programação Completa (3 meses)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg">
                Nenhuma programação disponível
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Downloads JW.org - Principal */}
            <Card>
              <CardHeader>
                  <CardTitle>📊 Programação Oficial Global</CardTitle>
                <CardDescription>
                    Administrador Geral - Programação para todas as congregações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-800">Apostila MWB Atual</span>
                      <Badge className="bg-blue-100 text-blue-800">Disponível</Badge>
                    </div>
                    <p className="text-sm text-blue-600 mb-3">Última verificação: Hoje, 10:30</p>
                    
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-3">
                      <div className="text-sm text-blue-800">
                        <strong>📊 Admin Geral:</strong> Programação oficial (sem nomes de estudantes)
                      </div>
                      <div className="text-sm text-blue-700 mt-1">
                        <strong>🎓 Para Instrutores:</strong> Recebem programação + fazem designações locais
                      </div>
                      <div className="text-sm text-blue-600 mt-1">
                        <strong>🌍 Alcance:</strong> Padronização mundial (200 mil congregações)
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => jworg.downloadWorkbook('pt', '07', '2025')}
                        disabled={jworg.isLoading}
                      >
                        <Download className="h-3 w-3 mr-2" />
                        {jworg.isLoading ? 'Atualizando...' : 'Atualizar Programação PT (3 meses)'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => jworg.downloadWorkbook('en', '07', '2025')}
                        disabled={jworg.isLoading}
                      >
                        <Download className="h-3 w-3 mr-2" />
                        {jworg.isLoading ? 'Updating...' : 'Update Programming EN (3 months)'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      Sincronizar com 200k Congregações
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Histórico de Sincronizações
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Verificar Novas Semanas
                    </Button>
                </div>
              </CardContent>
            </Card>

              {/* Sistema S-38 */}
              <Card>
                <CardHeader>
                  <CardTitle>⚙️ Sistema S-38 Global</CardTitle>
                  <CardDescription>
                    Estrutura oficial das reuniões ministeriais mundiais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Estrutura da Reunião</p>
                        <p className="text-sm text-muted-foreground">S-38 implementado conforme documentação oficial</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Ativo
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="font-medium">Partes da Reunião:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>• Chairman</div>
                        <div>• Treasures</div>
                        <div>• Gems</div>
                        <div>• Reading</div>
                        <div>• Starting</div>
                        <div>• Following</div>
                        <div>• Making</div>
                        <div>• Explaining</div>
                        <div>• Talk</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-sm text-blue-800">
                        <strong>📊 Admin Geral:</strong> Define estrutura S-38 mundial padrão
                      </div>
                      <div className="text-sm text-blue-700 mt-1">
                        <strong>🎓 Para Instrutores:</strong> Seguem estrutura + fazem designações locais
                      </div>
                      <div className="text-sm text-blue-600 mt-1">
                        <strong>🌍 Resultado:</strong> Mesma estrutura global, designações locais flexíveis
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Atualizar Estrutura S-38 Global
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Próximas Semanas */}
            <Card>
              <CardHeader>
                <CardTitle>📅 Apostilas das Próximas Semanas</CardTitle>
                <CardDescription>
                  Admin disponibiliza apostilas futuras para instrutores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="text-sm text-blue-800">
                    <strong>📊 Admin Geral:</strong> Programação oficial dos próximos 2-3 meses
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    <strong>🎓 Para Instrutores:</strong> Planejamento antecipado de designações locais
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    <strong>🌍 Sincronização:</strong> Todas as congregações recebem automaticamente
                  </div>
                </div>
                {jworg.isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-blue-600">Carregando próximas semanas...</span>
                  </div>
                ) : jworg.error ? (
                  <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    Erro: {jworg.error}
                  </div>
                ) : jworg.nextWeeks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {jworg.nextWeeks.map((week, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm">{week.week}</div>
                        <div className="text-xs text-muted-foreground">
                          {week.book} - {week.parts[0]?.title || 'Programação disponível'}
                        </div>
                        <Button size="sm" variant="outline" className="w-full mt-2">
                          Sincronizar com Congregações
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg">
                    Nenhuma programação futura disponível
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Componente de Teste JW.org */}
            <JWorgTest />
          </TabsContent>

          {/* Monitoramento */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                📊 Monitoramento do Sistema JW.org & S-38
              </h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                🎯 Função Principal: Admin disponibiliza apostilas MWB → Instrutores designam estudantes
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Métricas em Tempo Real */}
            <Card>
              <CardHeader>
                  <CardTitle>Métricas do Sistema</CardTitle>
                <CardDescription>
                    Monitoramento em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">99.9%</p>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">~120ms</p>
                      <p className="text-sm text-muted-foreground">Latência</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CPU:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div className="w-1/4 h-2 bg-green-500 rounded-full"></div>
                    </div>
                        <span className="text-sm">25%</span>
                  </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memória:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div className="w-1/3 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                        <span className="text-sm">33%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Banco:</span>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Conectado</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Logs e Atividades */}
              <Card>
                <CardHeader>
                  <CardTitle>Logs Recentes</CardTitle>
                  <CardDescription>
                    Últimas atividades do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-2 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sistema iniciado</p>
                        <p className="text-xs text-muted-foreground">Hoje, 08:00</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-2 border rounded-lg">
                      <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Backup automático executado</p>
                        <p className="text-xs text-muted-foreground">Hoje, 02:00</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-2 border rounded-lg">
                      <Users className="h-4 w-4 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Novo usuário registrado</p>
                        <p className="text-xs text-muted-foreground">Ontem, 16:30</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-2 border rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Manutenção programada</p>
                        <p className="text-xs text-muted-foreground">Ontem, 03:00</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Todos os Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
