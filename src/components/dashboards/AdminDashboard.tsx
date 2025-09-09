import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Calendar, 
  FileText, 
  Download, 
  Upload, 
  Globe, 
  Users, 
  Settings, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Database,
  Eye,
  Edit3,
  Plus,
  RefreshCw,
  BarChart3,
  Clock,
  ExternalLink,
  BookOpen,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import useBackendAPI from '@/hooks/useBackendAPI';
import CongregationManager from '@/components/CongregationManager';
import ProgramPublisher from '@/components/ProgramPublisher';

interface AdminStats {
  totalCongregations: number;
  totalInstructors: number;
  totalStudents: number;
  totalPrograms: number;
  totalAssignments: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  lastSync: string;
}

interface ProgramSchedule {
  id: string;
  week: string;
  date: string;
  theme: string;
  parts: Array<{
    id: string;
    title: string;
    time: string;
    type: string;
    speaker?: string;
    reading?: string;
  }>;
  status: 'draft' | 'published' | 'archived';
  language: string;
}

interface Material {
  id: string;
  name: string;
  type: 'PDF' | 'JWPub' | 'RTF';
  language: string;
  size: string;
  downloadDate: string;
  status: 'available' | 'downloading' | 'error';
}

const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const backendAPI = useBackendAPI();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalCongregations: 0,
    totalInstructors: 0,
    totalStudents: 0,
    totalPrograms: 0,
    totalAssignments: 0,
    systemHealth: 'healthy',
    lastSync: new Date().toISOString()
  });
  const [programs, setPrograms] = useState<ProgramSchedule[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [usingRealData, setUsingRealData] = useState(false);

  // Load admin statistics
  const loadStats = async () => {
    try {
      const [congregationsResult, instructorsResult, studentsResult, programsResult, assignmentsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'admin'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'instrutor'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'estudante'),
        supabase.from('programas').select('id', { count: 'exact' }),
        supabase.from('designacoes').select('id', { count: 'exact' })
      ]);

      setStats({
        totalCongregations: 1, // For now, single congregation
        totalInstructors: instructorsResult.count || 0,
        totalStudents: studentsResult.count || 0,
        totalPrograms: programsResult.count || 0,
        totalAssignments: assignmentsResult.count || 0,
        systemHealth: 'healthy',
        lastSync: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  // Load program schedules
  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform data to match our interface
      const transformedPrograms: ProgramSchedule[] = (data || []).map(program => ({
        id: program.id,
        week: `Semana ${program.semana}`,
        date: program.data_reuniao || '',
        theme: program.tema_reuniao || 'Tema não definido',
        parts: [], // Would need to parse from program data
        status: program.status === 'ativo' ? 'published' : 'draft',
        language: 'pt-BR'
      }));

      setPrograms(transformedPrograms);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  // Load real materials from backend API using custom hook
  const loadMaterials = async () => {
    // First, test backend connectivity
    const isConnected = await backendAPI.testConnection();
    setBackendConnected(isConnected);
    
    if (!isConnected) {
      setUsingRealData(false);
      
      // Use production mock data
      const { mockMaterials } = await import('@/data/mockMaterials');
      const transformedMaterials: Material[] = mockMaterials.map((material) => {
        const extension = material.filename.split('.').pop()?.toLowerCase();
        let type: 'PDF' | 'JWPub' | 'RTF' = 'PDF';
        
        if (extension === 'jwpub') type = 'JWPub';
        else if (extension === 'rtf') type = 'RTF';
        
        let language = 'pt-BR';
        if (material.filename.includes('_E_') || material.filename.includes('_E.')) {
          language = 'en';
        }

        let displayName = material.filename
          .replace(/[<>"'&]/g, '')
          .replace(/\.(pdf|jwpub|rtf|zip)$/i, '')
          .replace(/_/g, ' ')
          .replace(/mwb /gi, 'MWB ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase());

        return {
          id: material.filename,
          name: `📄 ${displayName}`,
          type,
          language,
          size: material.sizeFormatted,
          downloadDate: new Date(material.modifiedAt).toISOString().split('T')[0],
          status: 'available' as const
        };
      });
      
      setMaterials(transformedMaterials);
      return;
    }

    // Backend is available, load real data
    try {
      const response = await backendAPI.materials.list();
      
      if (response.success && response.data?.materials) {
        setUsingRealData(true);
        
        // Transform backend data to match our interface
        const transformedMaterials: Material[] = response.data.materials.map((material: any) => {
          // Determine file type from extension
          const extension = material.filename.split('.').pop()?.toLowerCase();
          let type: 'PDF' | 'JWPub' | 'RTF' = 'PDF';
          
          if (extension === 'jwpub') type = 'JWPub';
          else if (extension === 'rtf') type = 'RTF';
          else if (extension === 'zip' && material.filename.includes('.daisy.')) type = 'PDF'; // DAISY files
          
          // Determine language from filename
          let language = 'pt-BR';
          if (material.filename.includes('_E_') || material.filename.includes('_E.')) {
            language = 'en';
          } else if (material.filename.includes('_T_')) {
            language = 'pt-BR';
          }

          // Clean up filename for display (sanitized)
          let displayName = material.filename
            .replace(/[<>"'&]/g, '') // Remove XSS characters
            .replace(/\.(pdf|jwpub|rtf|zip)$/i, '')
            .replace(/_/g, ' ')
            .replace(/mwb /gi, 'MWB ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase());

          return {
            id: material.filename,
            name: `📄 ${displayName}`,
            type,
            language,
            size: material.sizeFormatted || '0 KB',
            downloadDate: material.modifiedAt ? new Date(material.modifiedAt).toISOString().split('T')[0] : '',
            status: 'available' as const
          };
        });

        setMaterials(transformedMaterials);
        // Loaded materials from backend successfully
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error) {
      // Error loading materials from backend API
      setUsingRealData(false);
      
      // Fallback to mock data
      const mockMaterials: Material[] = [
        {
          id: 'error-1',
          name: '❌ Erro ao carregar materiais reais',
          type: 'PDF',
          language: 'pt-BR',
          size: '0 KB',
          downloadDate: '',
          status: 'error'
        },
        {
          id: 'error-2',
          name: `Erro: ${backendAPI.error || 'Desconhecido'}`,
          type: 'PDF',
          language: 'pt-BR',
          size: '0 KB',
          downloadDate: '',
          status: 'error'
        }
      ];
      setMaterials(mockMaterials);
    }
  };

  // Function to trigger material sync
  const handleSyncMaterials = async () => {
    // Triggering material sync
    try {
      const response = await backendAPI.materials.syncAll();
      if (response.success) {
        // Sync completed successfully
        // Reload materials after sync
        await loadMaterials();
      } else {
        // Sync failed
      }
    } catch (error) {
      // Sync error occurred
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadPrograms(),
        loadMaterials()
      ]);
      setLoading(false);
    };

    initializeData();
  }, []);

  if (loading) {
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
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
              <p className="text-muted-foreground">
                Sistema Ministerial Global - Controle Central
              </p>
            </div>
          </div>

          {/* Backend Status Alert */}
          {backendConnected !== null && (
            <Alert className={`mb-4 ${backendConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <Database className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    {backendConnected ? (
                      <>
                        <strong>✅ Backend Conectado</strong> - Exibindo dados reais da pasta docs/Oficial
                      </>
                    ) : (
                      <>
                        <strong>❌ Backend Offline</strong> - Exibindo dados de exemplo. Inicie o backend para ver materiais reais.
                      </>
                    )}
                  </span>
                  {usingRealData && (
                    <Badge variant="default" className="bg-green-600">
                      Dados Reais
                    </Badge>
                  )}
                  {!usingRealData && backendConnected === false && (
                    <Badge variant="destructive">
                      Dados Mock
                    </Badge>
                  )}
                </div>
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
                <div className="text-2xl font-bold">{stats.totalCongregations}</div>
                <p className="text-xs text-muted-foreground">Ativas no sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instrutores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInstructors}</div>
                <p className="text-xs text-muted-foreground">Gerenciando congregações</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Total no sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Programas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPrograms}</div>
                <p className="text-xs text-muted-foreground">Publicados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistema</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-xs text-muted-foreground">Status operacional</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="programs">Programação</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
            <TabsTrigger value="congregations">Congregações</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Nova Programação
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Materiais JW.org
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="mr-2 h-4 w-4" />
                    Importar PDF/Planilha
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="mr-2 h-4 w-4" />
                    Publicar Programação
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Status do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Saúde do Sistema</span>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Saudável
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Última Sincronização</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(stats.lastSync).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Integração JW.org</span>
                    <Badge variant="default" className="bg-blue-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativa
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar Status
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Programação das Reuniões
                </CardTitle>
                <CardDescription>
                  Gerencie a programação oficial que será espelhada para todas as congregações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Programação
                    </Button>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Importar PDF
                    </Button>
                  </div>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Publicar Selecionados
                  </Button>
                </div>

                <ProgramPublisher 
                  programs={programs} 
                  onPublish={() => {
                    loadPrograms();
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Materiais Oficiais
                </CardTitle>
                <CardDescription>
                  Gerencie os materiais baixados da JW.org e disponibilize para as congregações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar da JW.org
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Acessar JW.org
                  </Button>
                </div>

                <div className="space-y-4">
                  {materials.map((material) => (
                    <Card key={material.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                              <h4 className="font-semibold">{material.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {material.type} • {material.language} • {material.size}
                              </p>
                              {material.downloadDate && (
                                <p className="text-xs text-muted-foreground">
                                  Baixado em: {new Date(material.downloadDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                material.status === 'available' ? 'default' :
                                material.status === 'downloading' ? 'secondary' : 'destructive'
                              }
                            >
                              {material.status === 'available' ? 'Disponível' :
                               material.status === 'downloading' ? 'Baixando...' : 'Erro'}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
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

          {/* Congregations Tab */}
          <TabsContent value="congregations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Congregações e Instrutores
                </CardTitle>
                <CardDescription>
                  Gerencie congregações, instrutores e suas permissões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CongregationManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estatísticas Globais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Total de Usuários</span>
                      <span className="font-semibold">{stats.totalInstructors + stats.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Programas Ativos</span>
                      <span className="font-semibold">{stats.totalPrograms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Designações Totais</span>
                      <span className="font-semibold">{stats.totalAssignments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Saúde do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Backend</span>
                      <Badge variant="default" className="bg-green-600">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Banco de Dados</span>
                      <Badge variant="default" className="bg-green-600">Conectado</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Integração JW.org</span>
                      <Badge variant="default" className="bg-green-600">Ativa</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Debug Tab */}
          <TabsContent value="debug">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Debug e Desenvolvimento
                </CardTitle>
                <CardDescription>
                  Ferramentas de debug e informações técnicas para suporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Painel de debug disponível apenas para administradores. Logs e ferramentas técnicas serão implementadas aqui.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;