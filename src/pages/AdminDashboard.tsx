import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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

interface MWBVersion {
  id: string;
  version_code: string;
  period_start: string;
  period_end: string;
  language: string;
  status: string;
  total_parts: number;
  created_at: string;
}

interface SystemStats {
  total_congregations: number;
  active_congregations: number;
  total_downloads: number;
  last_sync: string;
}

export default function AdminDashboard() {
  const { user, profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [mwbVersions, setMwbVersions] = useState<MWBVersion[]>([]);
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

  const loadSystemData = async () => {
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

      // Carregar dados do backend
      console.log('🔍 Loading data from backend...');
      try {
        const response = await fetch('http://localhost:3001/api/admin/status', {
          headers: {
            'Authorization': `Bearer ${user.id}` // Simplificado para desenvolvimento
          }
        });
        
        if (response.ok) {
          const statusData = await response.json();
          console.log('✅ Backend status loaded:', statusData);
          setDebugInfo(prev => prev + '\n\n✅ Backend status loaded: ' + JSON.stringify(statusData, null, 2));
        } else {
          console.error('❌ Backend status failed:', response.status);
          setDebugInfo(prev => prev + '\n\n❌ Backend status failed: ' + response.status);
        }
      } catch (backendError) {
        console.error('❌ Backend connection failed:', backendError);
        setDebugInfo(prev => prev + '\n\n❌ Backend connection failed: ' + backendError);
      }

      // TODO: Implementar quando tabela mwb_versions for criada
      console.log('⚠️ Tabela mwb_versions não implementada ainda');
      setMwbVersions([]);

      // Carregar estatísticas do sistema
      // TODO: Implementar quando tabelas estiverem criadas
      setSystemStats({
        total_congregations: 0,
        active_congregations: 0,
        total_downloads: 0,
        last_sync: new Date().toISOString()
      });

      setLastCheck(new Date().toISOString());
      console.log('✅ System data loaded successfully');
      setDebugInfo(prev => prev + '\n\n✅ System data loaded successfully');
    } catch (error) {
      console.error('❌ Erro ao carregar dados do sistema:', error);
      setDebugInfo(prev => prev + '\n\n❌ Erro ao carregar dados do sistema: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const checkForUpdates = async () => {
    console.log('🔄 checkForUpdates called');
    setLoading(true);
    try {
      // Chamar API real do backend
      console.log('🔍 Calling backend check-updates API...');
      const response = await fetch('http://localhost:3001/api/admin/check-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}` // Simplificado para desenvolvimento
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Updates check successful:', result);
        setDebugInfo(prev => prev + '\n\n✅ Updates check successful: ' + JSON.stringify(result, null, 2));
        
        // Atualizar lista de materiais se houver novos
        if (result.results && result.results.newMaterials) {
          console.log('📦 New materials found:', result.results.newMaterials.length);
          setDebugInfo(prev => prev + '\n\n📦 New materials found: ' + result.results.newMaterials.length);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Updates check failed:', errorData);
        setDebugInfo(prev => prev + '\n\n❌ Updates check failed: ' + JSON.stringify(errorData, null, 2));
      }
      
      setLastCheck(new Date().toISOString());
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error);
      setDebugInfo(prev => prev + '\n\n❌ Erro ao verificar atualizações: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // Se não for admin, mostrar mensagem de acesso negado
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar o Dashboard Administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Seu perfil atual: <strong>{profile?.role}</strong>
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jw-blue mx-auto mb-4"></div>
          <p>Carregando...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Aguardando autenticação...
          </p>
        </div>
      </div>
    );
  }

  // DEBUG: Mostrar informações do usuário se não for admin
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Acesso Negado - Debug Info
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar o Dashboard Administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Informações do Usuário:</h3>
              <div className="text-sm space-y-1">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role no Profile:</strong> {profile?.role || 'N/A'}</p>
                <p><strong>Role no Metadata:</strong> {user.user_metadata?.role || 'N/A'}</p>
                <p><strong>isAdmin:</strong> {isAdmin ? 'true' : 'false'}</p>
                <p><strong>Profile Existe:</strong> {profile ? 'Sim' : 'Não'}</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <pre className="text-xs text-yellow-700 overflow-auto max-h-40">
                {debugInfo}
              </pre>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => window.history.back()} variant="outline">
                Voltar
              </Button>
              <Button 
                onClick={() => {
                  console.log('🔍 Full Debug Info:', {
                    user,
                    profile,
                    isAdmin,
                    userMetadata: user.user_metadata
                  });
                }}
                variant="outline"
              >
                Log Debug Info
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
              <p className="text-muted-foreground mt-2">
                Sistema Ministerial Global - Gerenciamento Central
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-4 w-4 mr-2" />
                Sistema Ativo
              </Badge>
              
              {/* Debug Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  console.log('🔍 DEBUG - Current Auth State:', {
                    user: !!user,
                    userId: user?.id,
                    userEmail: user?.email,
                    profile: !!profile,
                    profileRole: profile?.role,
                    isAdmin,
                    userMetadata: user?.user_metadata
                  });
                }}
              >
                🐛 Debug Auth
              </Button>

              {/* Test Login Button */}
              {import.meta.env.DEV && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    console.log('🔧 Testing admin login...');
                    try {
                      // Testar login direto com Supabase
                      const { data, error } = await supabase.auth.signInWithPassword({
                        email: 'amazonwebber007@gmail.com',
                        password: 'admin123'
                      });
                      
                      if (error) {
                        console.error('❌ Test login failed:', error);
                        alert('Test login failed: ' + error.message);
                      } else {
                        console.log('✅ Test login successful:', data);
                        alert('Test login successful! Check console for details.');
                      }
                    } catch (error) {
                      console.error('❌ Test login exception:', error);
                      alert('Test login exception: ' + error);
                    }
                  }}
                >
                  🔧 Test Login
                </Button>
              )}

              {/* Test Database Button */}
              {import.meta.env.DEV && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    console.log('🔍 Testing backend connection...');
                    try {
                      // Testar conexão com backend
                      const response = await fetch('http://localhost:3001/api/status');
                      
                      if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Backend connection test successful:', data);
                        alert('Backend connection test successful!\nStatus: ' + data.status + '\nCheck console for details.');
                      } else {
                        console.error('❌ Backend connection test failed:', response.status);
                        alert('Backend connection test failed: ' + response.status + '\nCheck console for details.');
                      }
                    } catch (error) {
                      console.error('❌ Backend connection test exception:', error);
                      alert('Backend connection test exception: ' + error);
                    }
                  }}
                >
                  🗄️ Test Backend
                </Button>
              )}

              {/* Force Profile Load Button */}
              {import.meta.env.DEV && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    console.log('🔧 Force loading profile and testing backend...');
                    try {
                      if (user) {
                        // Testar backend primeiro
                        console.log('🔍 Testing backend...');
                        const backendResponse = await fetch('http://localhost:3001/api/status');
                        
                        if (backendResponse.ok) {
                          const backendData = await backendResponse.json();
                          console.log('✅ Backend test successful:', backendData);
                        } else {
                          console.error('❌ Backend test failed:', backendResponse.status);
                        }
                        
                        // Forçar carregamento do perfil
                        const { data, error } = await supabase
                          .from('profiles')
                          .select('*')
                          .eq('id', user.id)
                          .single();
                        
                        if (error) {
                          console.error('❌ Force profile load failed:', error);
                          alert('Force profile load failed: ' + error.message + '\nBackend test completed. Check console for details.');
                        } else {
                          console.log('✅ Force profile load successful:', data);
                          alert('Profile loaded! Role: ' + data.role + '\nBackend test completed.\nCheck console for details.');
                        }
                      } else {
                        alert('No user logged in');
                      }
                    } catch (error) {
                      console.error('❌ Force profile load exception:', error);
                      alert('Force profile load exception: ' + error);
                    }
                  }}
                >
                  👤 Force Profile + Backend
                </Button>
              )}
              
              <Button onClick={checkForUpdates} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Verificar Atualizações
              </Button>
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
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
            <TabsTrigger value="publication">Publicação</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Congregações</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.total_congregations || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total registradas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.total_downloads || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Materiais baixados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemStats?.last_sync ? new Date(systemStats.last_sync).toLocaleDateString('pt-BR') : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {systemStats?.last_sync ? new Date(systemStats.last_sync).toLocaleTimeString('pt-BR') : ''}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <p className="text-xs text-muted-foreground">
                    Sistema operacional
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Gerenciamento rápido do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Globe className="h-6 w-6 mb-2" />
                  <span>Verificar JW.org</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Package className="h-6 w-6 mb-2" />
                  <span>Gerenciar Materiais</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  <span>Configurações</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Downloads */}
          <TabsContent value="downloads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Downloads</CardTitle>
                <CardDescription>
                  Configure idiomas e URLs para download automático
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Português (Brasil)</label>
                    <div className="text-xs text-muted-foreground mt-1">
                      https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Inglês (EUA)</label>
                    <div className="text-xs text-muted-foreground mt-1">
                      https://www.jw.org/en/library/jw-meeting-workbook/
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Verificar Novas Versões
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar URLs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materiais */}
          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Materiais Disponíveis</CardTitle>
                <CardDescription>
                  Lista de materiais baixados e seus status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mwbVersions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum material encontrado</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Execute a verificação de atualizações para baixar materiais
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mwbVersions.map((version) => (
                      <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{version.version_code}</div>
                          <div className="text-sm text-muted-foreground">
                            {version.language} • {version.period_start} - {version.period_end}
                          </div>
                        </div>
                        <Badge variant={version.status === 'active' ? 'default' : 'secondary'}>
                          {version.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Publicação */}
          <TabsContent value="publication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publicação de Materiais</CardTitle>
                <CardDescription>
                  Publique materiais para que as congregações possam acessar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum material para publicação</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Baixe materiais primeiro para poder publicá-los
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoramento */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monitoramento do Sistema</CardTitle>
                <CardDescription>
                  Status e métricas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status do Banco</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Database className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Última Verificação</span>
                      <span className="text-sm text-muted-foreground">
                        {lastCheck ? new Date(lastCheck).toLocaleString('pt-BR') : 'Nunca'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Armazenamento</span>
                      <span className="text-sm text-muted-foreground">0 MB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Logs do Sistema</span>
                      <Button variant="outline" size="sm">
                        Ver Logs
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
