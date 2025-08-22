import React, { useState, useEffect } from 'react';
import { useUserRole, hasAdminAccess } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Upload, 
  FileText, 
  Users, 
  Globe, 
  Settings,
  BookOpen,
  Download,
  Eye,
  Plus,
  RefreshCw
} from 'lucide-react';
import { ConnectionStatusIndicator } from '@/components/ConnectionStatusBanner';
import PageShell from '@/components/layout/PageShell';

interface GlobalProgramming {
  id: string;
  week_start_date: string;
  week_end_date: string;
  meeting_type: 'midweek' | 'weekend';
  section_name: string;
  part_number: number;
  part_title: string;
  part_duration: number;
  part_type: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

interface WorkbookVersion {
  id: string;
  version_code: string;
  title: string;
  period_start: string;
  period_end: string;
  parsing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export default function AdminGlobalDashboard() {
  const { role, loading: roleLoading, profile } = useUserRole();
  const [globalProgramming, setGlobalProgramming] = useState<GlobalProgramming[]>([]);
  const [workbookVersions, setWorkbookVersions] = useState<WorkbookVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [autoRecoveryTriggered, setAutoRecoveryTriggered] = useState(false);

  // Check admin access
  if (!roleLoading && !hasAdminAccess(role)) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert className="max-w-md">
            <AlertDescription>
              Acesso negado. Esta área é restrita a administradores.
            </AlertDescription>
          </Alert>
        </div>
      </PageShell>
    );
  }

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load global programming, but handle missing table gracefully
      try {
        const { data: programmingData, error: programmingError } = await supabase
          .from('global_programming')
          .select('*')
          .order('semana_inicio', { ascending: false })
          .limit(50);

        if (programmingError) {
          console.error('Error loading global programming:', programmingError);
          if (programmingError.code === 'PGRST205') {
            setError('Tabelas do sistema não encontradas. Execute: window.createDatabaseTables()');
          } else {
            setError(programmingError.message);
          }
        } else {
          // Transform data to match expected interface
          const transformedData = (programmingData || []).map(item => ({
            id: item.id,
            week_start_date: item.semana_inicio,
            week_end_date: item.semana_fim,
            week_number: item.numero_semana,
            meeting_type: 'midweek',
            section_name: 'treasures',
            part_number: 1,
            part_title: item.tema_semanal || 'Programação Semanal',
            part_duration: 10,
            part_type: 'bible_study',
            source_material: `mwb_PT_${item.ano}${String(item.mes).padStart(2, '0')}`,
            status: item.status || 'draft',
            tema_semanal: item.tema_semanal,
            leitura_biblica: item.leitura_biblica,
            partes_emt: item.partes_emt || [],
            partes_mwb: item.partes_mwb || []
          }));
          setGlobalProgramming(transformedData);
        }
      } catch (programmingErr: any) {
        console.error('Exception loading global programming:', programmingErr);
        setError('Erro ao carregar programação global');
      }

      // Try to load workbook versions, but handle missing table gracefully
      try {
        const { data: workbookData, error: workbookError } = await supabase
          .from('workbook_versions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (workbookError) {
          console.error('Error loading workbook versions:', workbookError);
          // Don't override the main error if global_programming failed
          if (!error && workbookError.code === 'PGRST205') {
            setError('Tabelas do sistema não encontradas. Execute: window.createDatabaseTables()');
          }
        } else {
          setWorkbookVersions(workbookData || []);
        }
      } catch (workbookErr: any) {
        console.error('Exception loading workbook versions:', workbookErr);
        // Don't override the main error
      }

    } catch (err: any) {
      console.error('Error in loadData:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading && hasAdminAccess(role)) {
      loadData();
    }
  }, [role, roleLoading]);

  // Auto-recovery timeout mechanism with multiple stages
  useEffect(() => {
    if (roleLoading || loading) {
      // Stage 1: Show timeout warning after 3 seconds
      const warningTimeoutId = setTimeout(() => {
        if (roleLoading || loading) {
          console.log('⚠️ Loading taking longer than expected...');
          setLoadingTimeout(true);
        }
      }, 3000);

      // Stage 2: Trigger emergency fix after 8 seconds
      const emergencyTimeoutId = setTimeout(() => {
        if (roleLoading || loading && !autoRecoveryTriggered) {
          console.log('🚨 Loading timeout detected, triggering emergency fix...');
          setAutoRecoveryTriggered(true);

          // Use emergency fix for immediate results
          import('../utils/emergencyAuthFix').then(({ autoEmergencyFix }) => {
            autoEmergencyFix().catch(error => {
              console.error('❌ Emergency fix failed, trying regular recovery:', error);

              // Fallback to regular recovery
              import('../utils/authRecovery').then(({ detectAuthCorruption, recoverAuthentication }) => {
                detectAuthCorruption().then(isCorrupted => {
                  if (isCorrupted) {
                    console.log('🔄 Auto-triggering authentication recovery due to timeout...');
                    recoverAuthentication({ clearStorageOnFailure: true }).then(result => {
                      if (result.success && result.action === 'cleared') {
                        window.location.href = '/auth';
                      } else if (result.success && result.action === 'recovered') {
                        window.location.reload();
                      }
                    });
                  }
                });
              });
            });
          });
        }
      }, 8000); // 8 second timeout for emergency fix

      return () => {
        clearTimeout(warningTimeoutId);
        clearTimeout(emergencyTimeoutId);
      };
    }
  }, [roleLoading, loading, autoRecoveryTriggered]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
      case 'completed':
        return 'default';
      case 'draft':
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'outline';
      case 'failed':
      case 'archived':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (roleLoading || loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-lg">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Carregando Dashboard</h2>

            {/* Immediate help message */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>Se o carregamento demorar:</strong><br/>
                Clique no botão "CORRIGIR AGORA" abaixo para resolver imediatamente.
              </p>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              {loadingTimeout
                ? "Carregamento demorado detectado - verificando autenticação..."
                : "Carregando dados da programação global..."
              }
            </p>

            {/* Show immediate recovery option after 5 seconds */}
            {(loadingTimeout || Date.now() - performance.now() > 5000) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm mb-2">
                  ⚠️ O carregamento está demorando mais que o esperado.
                  {autoRecoveryTriggered ? " Recuperação automática em andamento..." : " Você pode tentar recuperar agora."}
                </p>
                {!autoRecoveryTriggered && (
                  <Button
                    onClick={async () => {
                      console.log('🔄 Manual recovery triggered by user...');
                      setAutoRecoveryTriggered(true);

                      try {
                        if (typeof (window as any).authRecovery?.recover === 'function') {
                          const result = await (window as any).authRecovery.recover();
                          console.log('Manual recovery result:', result);

                          if (result.success) {
                            if (result.action === 'cleared') {
                              window.location.href = '/auth';
                            } else {
                              window.location.reload();
                            }
                          } else {
                            // Fallback to clear
                            if (typeof (window as any).authRecovery?.clear === 'function') {
                              await (window as any).authRecovery.clear();
                              window.location.href = '/auth';
                            }
                          }
                        }
                      } catch (error) {
                        console.error('Manual recovery failed:', error);
                        // Force page reload as last resort
                        window.location.reload();
                      }
                    }}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    🔄 Recuperar Agora
                  </Button>
                )}
              </div>
            )}

            {/* Quick setup and recovery buttons */}
            <div className="flex flex-col gap-2 mt-4">
              <Button
                onClick={async () => {
                  try {
                    // Use emergency fix for immediate results
                    if (typeof (window as any).emergencyAuthFix === 'function') {
                      console.log('🚨 Using emergency auth fix...');
                      await (window as any).emergencyAuthFix();
                      return;
                    }

                    // Fallback to regular recovery
                    if (typeof (window as any).authRecovery?.recover === 'function') {
                      console.log('🔄 Attempting authentication recovery...');
                      const result = await (window as any).authRecovery.recover();
                      console.log('Recovery result:', result);

                      if (result.success) {
                        if (result.action === 'cleared') {
                          window.location.href = '/auth';
                        } else {
                          window.location.reload();
                        }
                        return;
                      }
                    }

                    // Final fallback to manual storage clear
                    if (typeof (window as any).authRecovery?.clear === 'function') {
                      await (window as any).authRecovery.clear();
                      window.location.href = '/auth';
                    }
                  } catch (err) {
                    console.error('Error during recovery:', err);
                    // Force reload as absolute last resort
                    window.location.reload();
                  }
                }}
                size="sm"
                variant="destructive"
                className="w-full font-semibold"
              >
                🚨 CORRIGIR AGORA
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (typeof (window as any).healthCheck?.full === 'function') {
                      console.log('🏥 Running comprehensive health check...');
                      const result = await (window as any).healthCheck.full();
                      console.log('Health check completed:', result);
                      alert(`Health Check Results:\n\nOverall: ${result.overall}\n\nRecommendations:\n${result.recommendations.join('\n')}`);
                    }
                  } catch (err) {
                    console.error('Error during health check:', err);
                  }
                }}
                size="sm"
                variant="outline"
                className="w-full"
              >
                🏥 Verificar Saúde do Sistema
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (typeof (window as any).createDatabaseTables === 'function') {
                      const result = await (window as any).createDatabaseTables();
                      console.log('Tables creation result:', result);
                    }
                  } catch (err) {
                    console.error('Error creating tables:', err);
                  }
                }}
                size="sm"
                variant="outline"
                className="w-full"
              >
                Criar Tabelas
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (typeof (window as any).fixAdminProfile === 'function') {
                      const result = await (window as any).fixAdminProfile();
                      console.log('Profile fix result:', result);
                      if (result.success) {
                        window.location.reload();
                      }
                    }
                  } catch (err) {
                    console.error('Error fixing profile:', err);
                  }
                }}
                size="sm"
                variant="default"
                className="w-full"
              >
                Corrigir Perfil Admin
              </Button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">
              <Globe className="inline-block mr-2 h-8 w-8" />
              Painel Administrativo Global
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerenciamento global de programação para todas as congregações
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Users className="h-3 w-3 mr-1" />
              {profile?.nome_completo || 'Admin'}
            </Badge>
            <ConnectionStatusIndicator />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              {error.includes('Tabelas do sistema não encontradas') && (
                <div className="mt-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        try {
                          if (typeof (window as any).createDatabaseTables === 'function') {
                            setLoading(true);
                            const result = await (window as any).createDatabaseTables();
                            if (result.success) {
                              setError(null);
                              await loadData();
                            } else {
                              setError(`Erro ao criar tabelas: ${result.error}`);
                            }
                          } else {
                            setError('Função de criação de tabelas não disponível');
                          }
                        } catch (err: any) {
                          setError(`Erro ao criar tabelas: ${err.message}`);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Criar Tabelas do Sistema
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          if (typeof (window as any).createSampleData === 'function') {
                            setLoading(true);
                            const result = await (window as any).createSampleData();
                            if (result.success) {
                              setError(null);
                              await loadData();
                            } else {
                              setError(`Erro ao criar dados de exemplo: ${result.error}`);
                            }
                          } else {
                            setError('Função de criação de dados não disponível');
                          }
                        } catch (err: any) {
                          setError(`Erro ao criar dados de exemplo: ${err.message}`);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      size="sm"
                      variant="default"
                    >
                      Criar Dados de Exemplo
                    </Button>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programação Global</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalProgramming.length}</div>
              <p className="text-xs text-muted-foreground">
                partes programadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Apostilas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workbookVersions.length}</div>
              <p className="text-xs text-muted-foreground">
                versões carregadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicadas</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {globalProgramming.filter(p => p.status === 'published').length}
              </div>
              <p className="text-xs text-muted-foreground">
                disponíveis para congregações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processadas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workbookVersions.filter(w => w.parsing_status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                apostilas prontas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="programming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="programming">Programação Global</TabsTrigger>
            <TabsTrigger value="workbooks">Apostilas</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="programming" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Programação Global</h2>
              <div className="flex gap-2">
                <Button onClick={loadData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Programação
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {globalProgramming.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nenhuma programação global encontrada.
                      </p>
                      <Button className="mt-4" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeira Programação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                globalProgramming.map((programming) => (
                  <Card key={programming.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {programming.part_title}
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(programming.status)}>
                          {programming.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Semana de {formatDate(programming.week_start_date)} • 
                        {programming.meeting_type === 'midweek' ? ' Meio da Semana' : ' Fim de Semana'} • 
                        Parte {programming.part_number} • 
                        {programming.part_duration} min
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {programming.section_name}
                          </Badge>
                          <Badge variant="outline">
                            {programming.part_type}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}
