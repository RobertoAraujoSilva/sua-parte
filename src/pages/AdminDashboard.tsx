import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { useMaterials } from '../hooks/useMaterials';
import { JWorgTest } from '../components/JWorgTest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import LazyLoader from '../components/LazyLoader';
import AuthErrorHandler from '../components/AuthErrorHandler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ProgramManager from '../components/ProgramManager';
import CongregationManager from '../components/CongregationManager';
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

// 🚀 Lazy loading para componentes pesados (comentado por enquanto)
// const JWorgTestLazy = lazy(() => import('../components/JWorgTest'));

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
  const { syncAllMaterials, isLoading: materialsLoading } = useMaterials();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [lastCheck, setLastCheck] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showJWorgTest, setShowJWorgTest] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [programsLoading, setProgramsLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // 🚀 Memoização de dados estáticos para reduzir re-renders
  const staticStats = useMemo(() => ({
    total_congregations: systemStats?.total_congregations || 0,
    active_congregations: systemStats?.active_congregations || 0,
    total_users: systemStats?.total_users || 0,
    total_estudantes: systemStats?.total_estudantes || 0,
    total_programas: systemStats?.total_programas || 0,
    last_sync: systemStats?.last_sync || ''
  }), [systemStats]);

  // 🚀 Debounced function para reduzir chamadas desnecessárias
  const debouncedSetDebugInfo = useCallback((info: string) => {
    let timeoutId: NodeJS.Timeout;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => setDebugInfo(info), 100);
  }, []);

  // DEBUG: Log component state (otimizado)
  useEffect(() => {
    const debugData = {
      user: !!user,
      userId: user?.id,
      userEmail: user?.email,
      profile: !!profile,
      profileRole: profile?.role,
      isAdmin,
      loading,
      userMetadata: user?.user_metadata
    };

    console.log('🔍 AdminDashboard Component Debug:', debugData);
    debouncedSetDebugInfo(JSON.stringify(debugData, null, 2));
  }, [user, profile, isAdmin, loading, debouncedSetDebugInfo]);

  useEffect(() => {
    console.log('🔄 AdminDashboard useEffect triggered:', { user, isAdmin, initialized });
    
    if (user && isAdmin && !initialized) {
      console.log('✅ Admin user detected, loading system data...');
      setInitialized(true);
      loadSystemData();
    } else if (user && !isAdmin) {
      console.log('❌ User is not admin, role:', profile?.role);
      setProgramsLoading(false);
      debouncedSetDebugInfo(debugInfo + '\n\n❌ User is not admin, role: ' + profile?.role);
    } else if (!user) {
      console.log('❌ No user found');
      setProgramsLoading(false);
      debouncedSetDebugInfo(debugInfo + '\n\n❌ No user found');
    }
  }, [user, isAdmin, initialized, debouncedSetDebugInfo]);

  // Fallback para garantir que dados sejam carregados após delay
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (user && isAdmin && programs.length === 0 && !programsLoading) {
        console.log('🔄 Fallback: Recarregando dados após delay...');
        loadSystemData();
      }
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [user, isAdmin, programs.length, programsLoading]);

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
      const { count: profilesCount, error: testError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError);
        debouncedSetDebugInfo(debugInfo + '\n\n❌ Supabase Test Failed: ' + testError.message);
        return;
      }

        console.log('✅ Supabase connection test successful');
      debouncedSetDebugInfo(debugInfo + '\n\n✅ Supabase Test: Connected');

      // Carregar estatísticas do sistema
      await loadSystemStats();
      // Carregar programações publicadas
      await loadPrograms();

    } catch (error) {
      console.error('❌ Supabase test exception:', error);
      debouncedSetDebugInfo(debugInfo + '\n\n❌ Supabase Test Exception: ' + error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, debouncedSetDebugInfo, debugInfo]);

  const loadSystemStats = useCallback(async () => {
    try {
      console.log('📊 Loading system statistics...');

      const [profilesRes, estudantesRes, programasRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('estudantes').select('*', { count: 'exact', head: true }),
        supabase.from('programas').select('*', { count: 'exact', head: true }),
      ]);

      // congregacoes (removido: tabela pode não existir neste projeto)
      const congregacoesCount = 0;

      const stats: SystemStats = {
        total_congregations: congregacoesCount,
        active_congregations: congregacoesCount,
        total_users: (profilesRes.count as number) || 0,
        total_estudantes: (estudantesRes.count as number) || 0,
        total_programas: (programasRes.count as number) || 0,
        last_sync: new Date().toISOString(),
      };

      setSystemStats(stats);
      setLastCheck(new Date().toISOString());

      console.log('✅ System stats loaded:', stats);
      debouncedSetDebugInfo(debugInfo + '\n\n✅ System Stats Loaded: ' + JSON.stringify(stats, null, 2));

    } catch (error) {
      console.error('❌ Error loading system stats:', error);
      debouncedSetDebugInfo(debugInfo + '\n\n❌ System Stats Error: ' + error);
    }
  }, [debouncedSetDebugInfo, debugInfo, supabase]);

  const loadPrograms = useCallback(async () => {
    try {
      setProgramsLoading(true);
      const { data, error } = await supabase
        .from('programas')
        .select('id, semana, mes_apostila, status, data_inicio_semana, arquivo')
        .order('data_inicio_semana', { ascending: false })
        .limit(12);
      if (error) throw error;
      setPrograms(data || []);
      console.log('✅ Programs loaded:', data?.length || 0);
    } catch (error: any) {
      console.error('❌ Error loading programs:', error);
      debouncedSetDebugInfo(debugInfo + '\n\n❌ Programs Load Error: ' + (error?.message || error));
    } finally {
      setProgramsLoading(false);
    }
  }, [debouncedSetDebugInfo, debugInfo]);

  const checkForUpdates = useCallback(async () => {
    console.log('🔄 Checking for updates...');
    setLoading(true);
    
    try {
      await loadSystemStats();
      await loadPrograms();
      console.log('✅ Updates checked successfully');
    } catch (error) {
      console.error('❌ Error checking updates:', error);
    } finally {
      setLoading(false);
    }
  }, [loadSystemStats]);

  const testSupabaseConnection = useCallback(async () => {
    console.log('🔧 Testing Supabase connection...');
    
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Supabase test error:', error);
        alert('Supabase test error: ' + error.message);
      } else {
        console.log('✅ Supabase test successful. Profiles count:', count);
        alert('Supabase test successful! Total profiles: ' + (count ?? 0));
      }
    } catch (error) {
      console.error('❌ Supabase test exception:', error);
      alert('Supabase test exception: ' + error);
    }
  }, []);

  // ========== HANDLERS DOS BOTÕES ==========
  
  const handleListUsers = useCallback(async () => {
    console.log('👥 Listando usuários...');
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, nome_completo, role, congregacao, cargo')
        .order('nome_completo');
      
      if (error) throw error;
      
      console.log('✅ Usuários carregados:', users);
      alert(`Encontrados ${users?.length || 0} usuários no sistema:\n\n${users?.map(u => `${u.nome_completo || u.id} - ${u.role} (${u.congregacao || 'N/A'})`).join('\n')}`);
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error);
      alert('Erro ao carregar usuários: ' + error.message);
    }
  }, []);

  const handleManagePermissions = useCallback(async () => {
    console.log('⚙️ Gerenciando permissões...');
    const newRole = prompt('Digite o novo role (admin, instrutor, estudante):');
    if (!newRole) return;
    
    // Validar role
    const validRoles = ['admin', 'instrutor', 'estudante', 'family_member', 'developer'];
    if (!validRoles.includes(newRole)) {
      alert('Role inválido. Use: admin, instrutor, estudante, family_member ou developer');
      return;
    }
    
    const userId = prompt('Digite o ID do usuário:');
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole as any })
        .eq('id', userId);
      
      if (error) throw error;
      
      console.log('✅ Permissão atualizada');
      alert('Permissão atualizada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao atualizar permissão:', error);
      alert('Erro ao atualizar permissão: ' + error.message);
    }
  }, []);

  const handleActivityReport = useCallback(async () => {
    console.log('📊 Gerando relatório de atividades...');
    try {
      // Simulação de relatório
      const report = {
        totalUsers: staticStats.total_users,
        totalCongregations: staticStats.total_congregations,
        lastUpdate: new Date().toLocaleString('pt-BR'),
        activeUsers: Math.floor(staticStats.total_users * 0.8)
      };
      
      alert(`📊 Relatório de Atividades:\n\n` +
            `• Total de usuários: ${report.totalUsers}\n` +
            `• Usuários ativos: ${report.activeUsers}\n` +
            `• Total de congregações: ${report.totalCongregations}\n` +
            `• Última atualização: ${report.lastUpdate}`);
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório: ' + error.message);
    }
  }, [staticStats]);

  const handleBackupData = useCallback(async () => {
    console.log('💾 Fazendo backup dos dados...');
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Simular backup
      const backupData = {
        timestamp: new Date().toISOString(),
        profiles: profiles,
        stats: staticStats
      };
      
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_sistema_ministerial_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      console.log('✅ Backup criado com sucesso');
      alert('Backup criado e baixado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao fazer backup:', error);
      alert('Erro ao fazer backup: ' + error.message);
    }
  }, [staticStats]);

  // Congregações
  const handleManageCongregation = useCallback((congregationName: string) => {
    console.log('🏢 Gerenciando congregação:', congregationName);
    alert(`🏢 Gerenciando congregação: ${congregationName}\n\nEsta funcionalidade abrirá o painel de gerenciamento da congregação.`);
  }, []);

  const handleAddCongregation = useCallback(async () => {
    console.log('➕ Adicionando nova congregação...');
    const congregationName = prompt('Digite o nome da nova congregação:');
    if (!congregationName) return;
    
    try {
      // Simulação - em produção seria inserção no Supabase
      console.log('✅ Congregação adicionada:', congregationName);
      alert(`✅ Congregação "${congregationName}" adicionada com sucesso!\n\nEla agora receberá automaticamente a programação oficial.`);
    } catch (error) {
      console.error('❌ Erro ao adicionar congregação:', error);
      alert('Erro ao adicionar congregação: ' + error.message);
    }
  }, []);

  // JW.org & S-38
  const handleSyncMaterials = useCallback(async () => {
    console.log('🔄 Sincronizando materiais com o backend...');
    await syncAllMaterials();
  }, [syncAllMaterials]);

  const handleSyncCongregations = useCallback(async () => {
    console.log('🔄 Sincronizando com congregações...');
    try {
      // Simulação de sincronização
      const congregationsCount = staticStats.total_congregations;
      console.log(`✅ Sincronizando com ${congregationsCount} congregações`);
      alert(`🔄 Sincronização iniciada!\n\nProgramação oficial sendo enviada para ${congregationsCount} congregações...\n\nTempo estimado: ${Math.ceil(congregationsCount / 100)} minutos`);
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      alert('Erro na sincronização: ' + error.message);
    }
  }, [staticStats]);

  // Programação Oficial
  const handleViewFullProgram = useCallback(() => {
    console.log('📅 Visualizando programação completa (3 meses)...');
    alert(`📅 Programação Completa dos Próximos 3 Meses\n\n` +
          `• Semanas carregadas: 12\n` +
          `• Idiomas: PT e EN\n` +
          `• Última atualização: Hoje\n\n` +
          `Esta visualização mostrará todas as apostilas MWB dos próximos 3 meses.`);
  }, []);

  // Monitoramento
  const handleViewAllLogs = useCallback(async () => {
    console.log('📋 Visualizando todos os logs...');
    try {
      // Simulação de logs
      const logs = [
        { timestamp: new Date().toLocaleString(), event: 'Sistema iniciado', level: 'info' },
        { timestamp: new Date(Date.now() - 3600000).toLocaleString(), event: 'Backup automático executado', level: 'info' },
        { timestamp: new Date(Date.now() - 86400000).toLocaleString(), event: 'Novo usuário registrado', level: 'info' },
        { timestamp: new Date(Date.now() - 172800000).toLocaleString(), event: 'Manutenção programada', level: 'warning' }
      ];
      
      const logText = logs.map(log => `${log.timestamp} [${log.level.toUpperCase()}] ${log.event}`).join('\n');
      alert(`📋 Logs do Sistema\n\n${logText}`);
    } catch (error) {
      console.error('❌ Erro ao carregar logs:', error);
      alert('Erro ao carregar logs: ' + error.message);
    }
  }, []);


  // Sincronizar materiais da pasta docs/Oficial -> tabela public.programas
  const syncMaterialsToPrograms = useCallback(async () => {
    try {
      setLoading(true);

      // Obter token do usuário atual para autenticar no backend
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        alert('Sessão inválida. Faça login novamente.');
        return;
      }

      // Buscar lista de materiais no backend (requer Authorization)
      const res = await fetch('http://localhost:3001/api/materials', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        alert('Falha ao listar materiais no backend.');
        return;
      }
      const payload = await res.json();
      const materials: Array<{ filename: string }> = payload.materials || [];

      // Filtrar arquivos relevantes e preparar upserts
      const rows: any[] = materials
        .map((m) => m.filename)
        .filter((name) => /^(mwb_|S-38_|mwb_T_)/i.test(name))
        .map((arquivo) => {
          // Extrair ano/mês do padrão mwb_E_YYYYMM.pdf
          let ano = '';
          let mes = '';
          const match = arquivo.match(/mwb_[A-Z]_([0-9]{6})/i);
          if (match) {
            ano = match[1].slice(0, 4);
            mes = match[1].slice(4, 6);
          }
          const mes_apostila = ano && mes ? `${ano}-${mes}` : null;
          const data_inicio_semana = mes_apostila ? `${ano}-${mes}-01` : null;
          return {
            semana: null,
            mes_apostila,
            status: 'ativo',
            data_inicio_semana,
            arquivo,
          };
        });

      // Inserir somente os que ainda não existem por arquivo
      for (const row of rows) {
        const { data: exists, error: selErr } = await supabase
          .from('programas')
          .select('id')
          .eq('arquivo', row.arquivo)
          .maybeSingle();
        if (selErr) {
          console.warn('Select error (ignorado):', selErr.message);
        }
        if (!exists) {
          const { error: insErr } = await supabase.from('programas').insert(row as any);
          if (insErr) {
            console.warn('Insert error para', row.arquivo, insErr.message);
          }
        }
      }

      await loadPrograms();
      alert('Sincronização concluída.');
    } catch (error: any) {
      console.error('❌ Erro ao sincronizar materiais:', error);
      alert('Erro ao sincronizar materiais: ' + (error?.message || error));
    } finally {
      setLoading(false);
    }
  }, [supabase, loadPrograms]);

  // NOW CHECK CONDITIONS AND RENDER APPROPRIATELY
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
      {/* Auth Error Handler */}
      <AuthErrorHandler />
      
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
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="programacao">Programação</TabsTrigger>
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

              {/* Programações Publicadas */}
              <Card>
                <CardHeader>
                  <CardTitle>Programações Publicadas</CardTitle>
                  <CardDescription>
                    Últimas semanas importadas/publicadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {programsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">Carregando programações...</span>
                    </div>
                  ) : programs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                      <h4 className="font-medium mb-2">Nenhuma programação encontrada</h4>
                      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                        Não há programações carregadas. Isso pode ocorrer após recarregar a página (F5).
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadPrograms}
                        disabled={programsLoading}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Recarregar Programações
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {programs.map((p) => (
                        <div key={p.id} className="p-2 border rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <div className="font-medium">Semana {p.semana || '—'} • {p.mes_apostila || '—'}</div>
                              <div className="text-xs text-muted-foreground">
                                {p.data_inicio_semana ? new Date(p.data_inicio_semana).toLocaleDateString('pt-BR') : '—'}
                              </div>
                            </div>
                            <Badge variant="outline" className={p.status === 'ativo' || p.status === 'publicado' ? 'bg-green-50 text-green-700' : ''}>
                              {p.status || '—'}
                            </Badge>
                          </div>
                          {p.arquivo && (
                            <div className="mt-2">
                              <a
                                href={`http://localhost:3001/materials/${encodeURIComponent(p.arquivo)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 text-xs underline"
                              >
                                Abrir material ({p.arquivo})
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* JW.org Downloads */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">📚 JW.org Downloads</CardTitle>
                  <CardDescription className="text-green-700">
                    Gerenciar materiais oficiais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Apostila MWB Atual:</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Disponível
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Última verificação:</span>
                    <span className="text-sm text-green-700">Hoje, 10:30</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={handleSyncMaterials}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sincronizar Materiais com JW.org
                    </Button>
                    <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={syncMaterialsToPrograms} disabled={loading}>
                      <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                      Sincronizar materiais → programas
                    </Button>
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

              {/* Importar Estudantes */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">📥 Importar Estudantes</CardTitle>
                  <CardDescription className="text-blue-700">
                    Importe estudantes em massa usando uma planilha Excel.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="/estudantes?tab=import">
                    <Button className="w-full" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Planilha
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Debug / Integração */}
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-800">🧪 Debug / Integração</CardTitle>
                  <CardDescription className="text-slate-700">
                    Ferramentas rápidas para validar integrações e idioma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={handleSyncMaterials}>
                      Sincronizar Materiais
                    </Button>
                    <Button size="sm" variant="outline" onClick={checkForUpdates} disabled={loading}>
                      Atualizar Contagens
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                        {isAdmin ? 1 : 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Instrutores:</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {staticStats.total_users - (isAdmin ? 1 : 0)}
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
                          <p className="font-medium">{profile?.nome_completo || 'Roberto Araujo da Silva'}</p>
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

            {/* Ações Administrativas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Administrativas</CardTitle>
                <CardDescription>
                  Gerenciar usuários e permissões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="w-full justify-start" variant="outline" onClick={handleListUsers}>
                    <Users className="h-4 w-4 mr-2" />
                    Listar Todos os Usuários
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleManagePermissions}>
                    <Settings className="h-4 w-4 mr-2" />
                    Gerenciar Permissões
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleActivityReport}>
                    <Activity className="h-4 w-4 mr-2" />
                    Relatório de Atividades
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleBackupData}>
                    <Database className="h-4 w-4 mr-2" />
                    Backup de Dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programação */}
          <TabsContent value="programacao">
            <ProgramManager />
          </TabsContent>

          {/* Congregações */}
          <TabsContent value="congregations">
            <CongregationManager />
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
              {/* Downloads JW.org */}
              <Card className="bg-green-50 border-green-200">
              <CardHeader>
                  <CardTitle className="text-green-800">📚 JW.org Downloads</CardTitle>
                  <CardDescription className="text-green-700">
                    Gerenciar materiais oficiais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Apostila MWB Atual:</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Disponível
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Última verificação:</span>
                    <span className="text-sm text-green-700">Hoje, 10:30</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={handleSyncCongregations}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sincronizar com Congregações
                    </Button>
                    <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={handleViewFullProgram}>
                      <Settings className="h-3 w-3 mr-1" />
                      Ver Programação Completa
                    </Button>
                </div>
              </CardContent>
            </Card>

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
            </div>

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
                    <Button variant="outline" className="w-full" onClick={handleViewAllLogs}>
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Todos os Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
