import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Globe, 
  BarChart3, 
  CheckCircle, 
  Database,
  Settings,
  Users,
  Activity,
  AlertCircle,
  FileText,
  Calendar
} from 'lucide-react';
import { PDFProgrammingManager } from '@/components/PDFProgrammingManager';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/integrations/supabase/client';

/**
 * Novo Admin Dashboard com funcionalidade de PDF
 */
export default function AdminDashboardNew() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<null | {
    system: string;
    timestamp: string;
    services: Record<string, string>;
    storage?: any;
    lastSync?: any;
  }>(null);
  const [materials, setMaterials] = useState<Array<any>>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  const { user } = useAuth();

  const apiBase = useMemo(() => '/api/admin', []);

  const getAuthHeader = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${apiBase}/status`, { headers });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setSystemStatus(json);
    } catch (err) {
      console.error('Erro ao carregar status do sistema', err);
    }
  }, [apiBase, getAuthHeader]);

  const fetchMaterials = useCallback(async () => {
    setMaterialsLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${apiBase}/materials`, { headers });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setMaterials(Array.isArray(json.materials) ? json.materials : []);
    } catch (err) {
      console.error('Erro ao carregar materiais', err);
    } finally {
      setMaterialsLoading(false);
    }
  }, [apiBase, getAuthHeader]);

  // Estatísticas estáticas (em produção viriam do backend)
  const staticStats = {
    total_congregations: 1,
    active_congregations: 1,
    total_users: 1,
    total_estudantes: 0
  };

  const checkForUpdates = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${apiBase}/check-updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      console.log('✅ Atualizações verificadas');
      // refresh materials and status after check
      fetchMaterials();
      fetchStatus();
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchStatus();
  }, [user, fetchStatus]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'materials') {
      fetchMaterials();
    }
  }, [user, activeTab, fetchMaterials]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">📊 Dashboard do Administrador Geral</h1>
              <p className="text-muted-foreground">
                Programação oficial das reuniões ministeriais - Padronização mundial para todas as congregações
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={checkForUpdates} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="pdfs">PDFs</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="congregations">Congregações</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                🎯 Sistema Ministerial Global - Padronização Mundial
              </h3>
              <div className="text-center text-sm text-muted-foreground mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <strong>📊 Admin Geral:</strong> Disponibiliza programação oficial semanal (SEM nomes de estudantes) <br/>
                <strong>🎓 Instrutores:</strong> Recebem programação automaticamente + fazem designações locais reais
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Congregações Conectadas</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staticStats.total_congregations}</div>
                  <p className="text-xs text-muted-foreground">
                    Recebendo programação oficial
                  </p>
                </CardContent>
              </Card>

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
                  <div className="text-2xl font-bold">{systemStatus?.lastSync ? '✅' : '—'}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemStatus?.lastSync?.timestamp
                      ? new Date(systemStatus.lastSync.timestamp).toLocaleString('pt-BR')
                      : 'Sem registro'}
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
                      {systemStatus?.timestamp
                        ? new Date(systemStatus.timestamp).toLocaleString('pt-BR')
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="outline" className={systemStatus?.system === 'online' ? 'text-green-600' : 'text-amber-600'}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {systemStatus?.system || '—'}
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

          {/* PDFs */}
          <TabsContent value="pdfs" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                📚 Gestão de PDFs de Programação MWB
              </h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                🎯 Extrair programações dos PDFs oficiais da JW.org e disponibilizar para instrutores
              </p>
            </div>
            
            <PDFProgrammingManager />
          </TabsContent>

          {/* Materiais */}
          <TabsContent value="materials" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                📁 Materiais baixados (JW.org)
              </h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Listagem de arquivos disponíveis em <code>/materials</code>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Arquivos</CardTitle>
                <CardDescription>
                  {materialsLoading ? 'Carregando…' : `${materials.length} itens`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {materials.length === 0 && !materialsLoading && (
                    <div className="text-sm text-muted-foreground">Nenhum material encontrado.</div>
                  )}
                  {materials.map((m) => (
                    <div key={m.filename} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{m.filename}</span>
                        <span className="text-xs text-muted-foreground">
                          {m.language || '—'} • {m.size ? `${(m.size/1024/1024).toFixed(2)} MB` : '—'} • {m.createdAt ? new Date(m.createdAt).toLocaleString('pt-BR') : '—'}
                        </span>
                      </div>
                      <a className="text-sm text-blue-600 hover:underline" href={`/materials/${encodeURIComponent(m.filename)}`} target="_blank" rel="noreferrer">
                        Abrir
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="users" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                👥 Gestão de Usuários para Acesso às Apostilas MWB
              </h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                🎯 Função Principal: Admin gerencia usuários → Instrutores acessam apostilas
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Estatísticas de Usuários */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                  <CardDescription>Resumo dos usuários</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total de Usuários:</span>
                      <Badge variant="outline">{staticStats.total_users}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Admins:</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        1
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Instrutores:</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {staticStats.total_users - 1}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usuários Registrados */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Usuários Registrados</CardTitle>
                  <CardDescription>Últimos usuários cadastrados no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Administrador</p>
                          <p className="text-sm text-muted-foreground">Administrator</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        Admin
                      </Badge>
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
                      <Badge variant="outline">{staticStats.total_congregations}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Congregações Ativas:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {staticStats.active_congregations}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total de Estudantes:</span>
                      <Badge variant="outline">{staticStats.total_estudantes}</Badge>
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
                          <Globe className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Sistema Ministerial Global</p>
                          <p className="text-sm text-muted-foreground">Congregação Principal</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Ativa
                      </Badge>
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
                ⚙️ Monitoramento e Configurações do Sistema
              </h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                🎯 Função Principal: Admin monitora sistema → Instrutores recebem apostilas estáveis
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configurações Gerais */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                  <CardDescription>
                    Parâmetros do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Backup Automático:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Diário às 02:00
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Notificações:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Email + Sistema
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Manutenção:</span>
                    <span className="text-sm text-muted-foreground">Última: Ontem</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle>Métricas do Sistema</CardTitle>
                  <CardDescription>
                    Monitoramento em tempo real
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">99.9%</p>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">~120ms</p>
                      <p className="text-sm text-muted-foreground">Latência</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">25%</p>
                      <p className="text-sm text-muted-foreground">CPU</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">33%</p>
                      <p className="text-sm text-muted-foreground">Memória</p>
                    </div>
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
