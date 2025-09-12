import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Activity, 
  AlertCircle, 
  FileText,
  Database
} from 'lucide-react';
import { useBackendApi } from '@/hooks/useBackendApi';
import { toast } from 'sonner';

// Lazy load components
const OverviewTab = lazy(() => import('@/components/admin/OverviewTab'));
const UsersTab = lazy(() => import('@/components/admin/UsersTab'));
const CongregationsTab = lazy(() => import('@/components/admin/CongregationsTab'));
const SystemTab = lazy(() => import('@/components/admin/SystemTab'));
const MonitoringTab = lazy(() => import('@/components/admin/MonitoringTab'));

export default function AdminDashboardConnected() {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    isConnected, 
    systemStatus, 
    loading, 
    error, 
    checkConnection, 
    checkUpdates,
    getMaterials 
  } = useBackendApi();

  const [materials, setMaterials] = useState<any[]>([]);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadMaterials();
    }
  }, [isConnected]);

  const loadMaterials = async () => {
    const materialsData = await getMaterials();
    setMaterials(materialsData);
  };

  const handleCheckUpdates = async () => {
    setUpdateLoading(true);
    try {
      const result = await checkUpdates();
      if (result) {
        toast.success(`Verificação concluída! ${result.newMaterials?.length || 0} novos materiais encontrados.`);
        await loadMaterials(); // Reload materials after update
      } else {
        toast.error("Erro ao verificar atualizações");
      }
    } catch (err) {
      toast.error("Erro ao conectar com o backend");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleRefreshConnection = async () => {
    const success = await checkConnection();
    if (success) {
      toast.success("Conexão reestabelecida com o backend");
    } else {
      toast.error("Falha ao conectar com o backend");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
            <p className="text-muted-foreground mt-2">
              Sistema Ministerial - Gestão Centralizada
            </p>
          </div>
          
          {/* Status da Conexão */}
          <div className="flex items-center gap-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Backend Online</span>
                    <Badge variant="secondary">v{systemStatus?.version}</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium">Backend Offline</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleRefreshConnection}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Botão Verificar Atualizações */}
            <Button 
              onClick={handleCheckUpdates}
              disabled={updateLoading || !isConnected}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${updateLoading ? 'animate-spin' : ''}`} />
              {updateLoading ? 'Verificando...' : 'Verificar Atualizações'}
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="congregations">Congregações</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando...</span>
          </div>
        }>
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="materials">
            <MaterialsTab materials={materials} isConnected={isConnected} />
          </TabsContent>
          
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          
          <TabsContent value="congregations">
            <CongregationsTab />
          </TabsContent>
          
          <TabsContent value="system">
            <SystemTab systemStatus={systemStatus} isConnected={isConnected} />
          </TabsContent>
          
          <TabsContent value="monitoring">
            <MonitoringTab systemStatus={systemStatus} />
          </TabsContent>
        </Suspense>
      </Tabs>
    </div>
  );
}

// Materials Tab Component
function MaterialsTab({ materials, isConnected }: { materials: any[], isConnected: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Materiais Disponíveis</h3>
        <Badge variant={isConnected ? "default" : "secondary"}>
          {materials.length} materiais
        </Badge>
      </div>

      {!isConnected ? (
        <Card className="p-6 text-center">
          <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="font-semibold mb-2">Backend Desconectado</h4>
          <p className="text-muted-foreground">
            Conecte-se ao backend para visualizar materiais disponíveis.
          </p>
        </Card>
      ) : materials.length === 0 ? (
        <Card className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="font-semibold mb-2">Nenhum Material Encontrado</h4>
          <p className="text-muted-foreground">
            Execute "Verificar Atualizações" para baixar materiais da JW.org.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {materials.map((material, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{material.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {material.type} • {material.language} • {(material.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {new Date(material.lastModified).toLocaleDateString()}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}