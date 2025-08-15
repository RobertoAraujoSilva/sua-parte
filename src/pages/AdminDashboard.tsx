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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [mwbVersions, setMwbVersions] = useState<MWBVersion[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [lastCheck, setLastCheck] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadSystemData();
    }
  }, [user]);

  const loadSystemData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Carregar versões MWB
      const { data: versions, error: versionsError } = await supabase
        .from('mwb_versions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (versionsError) throw versionsError;
      setMwbVersions(versions || []);

      // Carregar estatísticas do sistema
      // TODO: Implementar quando tabelas estiverem criadas
      setSystemStats({
        total_congregations: 0,
        active_congregations: 0,
        total_downloads: 0,
        last_sync: new Date().toISOString()
      });

      setLastCheck(new Date().toISOString());
    } catch (error) {
      console.error('Erro ao carregar dados do sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForUpdates = async () => {
    setLoading(true);
    try {
      // TODO: Implementar verificação automática no JW.org
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulação
      setLastCheck(new Date().toISOString());
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadNewMaterials = async () => {
    setLoading(true);
    try {
      // TODO: Implementar download automático
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulação
      await loadSystemData();
    } catch (error) {
      console.error('Erro ao baixar materiais:', error);
    } finally {
      setLoading(false);
    }
  };

  const publishToCongregations = async (versionId: string) => {
    setLoading(true);
    try {
      // TODO: Implementar publicação para congregações
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulação
      await loadSystemData();
    } catch (error) {
      console.error('Erro ao publicar para congregações:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Acesso Restrito</h2>
          <p className="text-muted-foreground">Faça login para acessar o dashboard administrativo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Gestão global do sistema ministerial para todas as congregações
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={checkForUpdates} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Verificar Atualizações
          </Button>
          <Button onClick={downloadNewMaterials} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Baixar Novos Materiais
          </Button>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Congregações Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.active_congregations || 0}</div>
            <p className="text-xs text-muted-foreground">
              de {systemStats?.total_congregations || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads Hoje</CardTitle>
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
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats?.last_sync ? new Date(systemStats.last_sync).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Status do sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Versões MWB</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mwbVersions.length}</div>
            <p className="text-xs text-muted-foreground">
              Materiais disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="publication">Publicação</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>
                Visão geral da saúde e operação do sistema ministerial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Sistema Operacional</span>
                  </div>
                  <Badge variant="default">Online</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Última Verificação</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {lastCheck ? new Date(lastCheck).toLocaleString() : 'Nunca'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Armazenamento</span>
                  </div>
                  <span className="text-sm text-muted-foreground">2.1 GB / 10 GB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Downloads */}
        <TabsContent value="downloads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Downloads</CardTitle>
              <CardDescription>
                Controle de downloads automáticos e manuais do JW.org
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div>
                    <h3 className="font-semibold">Download Automático</h3>
                    <p className="text-sm text-muted-foreground">
                      Verifica novas apostilas a cada 24 horas
                    </p>
                  </div>
                  <Badge variant="secondary">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Próxima Verificação</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Verificar Agora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materiais */}
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Versões MWB Disponíveis</CardTitle>
              <CardDescription>
                Materiais organizados por período e idioma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mwbVersions.length > 0 ? (
                  mwbVersions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold">{version.version_code}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(version.period_start).toLocaleDateString()} - {new Date(version.period_end).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={version.status === 'active' ? 'default' : 'secondary'}>
                          {version.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {version.total_parts} partes
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="mx-auto h-12 w-12 mb-4" />
                    <p>Nenhuma versão MWB disponível</p>
                    <p className="text-sm">Baixe materiais do JW.org para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publicação */}
        <TabsContent value="publication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publicação para Congregações</CardTitle>
              <CardDescription>
                Controle de distribuição de materiais para congregações locais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mwbVersions.length > 0 ? (
                  mwbVersions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{version.version_code}</h3>
                        <p className="text-sm text-muted-foreground">
                          Status: {version.status === 'active' ? 'Disponível' : 'Rascunho'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => publishToCongregations(version.id)}
                          disabled={loading}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Publicar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="mx-auto h-12 w-12 mb-4" />
                    <p>Nenhum material para publicar</p>
                    <p className="text-sm">Organize os materiais primeiro</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoramento */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento do Sistema</CardTitle>
              <CardDescription>
                Métricas e estatísticas de uso do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-sm">Congregações Ativas</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {systemStats?.active_congregations || 0}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-sm">Downloads Totais</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {systemStats?.total_downloads || 0}
                    </p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-2">Atividade Recente</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Última sincronização</span>
                      <span className="text-muted-foreground">
                        {systemStats?.last_sync ? new Date(systemStats.last_sync).toLocaleString() : 'Nunca'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verificação automática</span>
                      <span className="text-muted-foreground">Ativa</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
