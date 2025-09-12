import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Home,
  Database,
  Shield,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBackendApi } from '@/hooks/useBackendApi';
import SystemTab from './SystemTab';
import MonitoringTab from './MonitoringTab';
import { LoadingCard, ErrorState } from '@/components/shared/LoadingStates';

// Sub-componentes para cada aba
const OverviewTab = () => {
  const { systemStatus: status, loading, error } = useBackendApi();
  
  if (loading) {
    return <LoadingCard title="Carregando visão geral" />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Erro ao carregar dados gerais do sistema"
        onRetry={() => window.location.reload()}
      />
    );
  }

  const stats = [
    {
      title: "Congregações Ativas",
      value: status?.services?.congregationCount || 0,
      icon: Home,
      color: "text-blue-600"
    },
    {
      title: "Usuários Registrados",
      value: status?.services?.userCount || 0,
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Programas Processados", 
      value: status?.services?.programCount || 0,
      icon: FileText,
      color: "text-purple-600"
    },
    {
      title: "PDFs Disponíveis",
      value: status?.services?.materialCount || 0,
      icon: Database,
      color: "text-orange-600"
    }
  ];
      icon: Home,
      color: "text-blue-600"
    },
    {
      title: "Usuários Registrados",
      value: status?.users || 0,
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Programas Processados",
      value: status?.programs || 0,
      icon: FileText,
      color: "text-purple-600"
    },
    {
      title: "PDFs Disponíveis",
      value: status?.materials || 0,
      icon: Database,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  Total no sistema
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Operacional</div>
              <p className="text-sm text-green-700">Todos os serviços</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{status?.services?.uptime || "N/A"}</div>
              <p className="text-sm text-blue-700">Tempo ativo</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {status?.services?.version || "1.0.0"}
              </div>
              <p className="text-sm text-blue-700">Tempo ativo</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {status?.version || "1.0.0"}
              </div>
              <p className="text-sm text-purple-700">Versão atual</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const UsersTab = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          Funcionalidade em desenvolvimento. Em breve será possível gerenciar usuários, 
          congregações e permissões diretamente pelo admin.
        </p>
      </CardContent>
    </Card>
  </div>
);

const MaterialsTab = () => {
  const { loading, error, getMaterials } = useBackendApi();
  const [materials, setMaterials] = React.useState([]);
  
  React.useEffect(() => {
    const loadMaterials = async () => {
      try {
        const result = await getMaterials();
        setMaterials(result || []);
      } catch (err) {
        console.error('Erro ao carregar materiais:', err);
      }
    };
    loadMaterials();
  }, [getMaterials]);

  if (loading) {
    return <LoadingCard title="Carregando materiais" />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Erro ao carregar lista de materiais"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Materiais Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {materials && materials.length > 0 ? (
            <div className="space-y-3">
              {materials.map((material: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{material.name || `Material ${index + 1}`}</h4>
                    <p className="text-sm text-gray-600">
                      Tamanho: {material.size || 'N/A'} • 
                      Modificado: {material.modified || 'N/A'}
                    </p>
                  </div>
                  <Badge variant="secondary">PDF</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Nenhum material disponível no momento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determinar aba ativa baseada na rota
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/overview') return 'overview';
    if (path === '/admin/users') return 'users';
    if (path === '/admin/materials') return 'materials';
    if (path === '/admin/system') return 'system';
    if (path === '/admin/monitoring') return 'monitoring';
    return 'overview';
  };

  const handleTabChange = (value: string) => {
    navigate(`/admin/${value === 'overview' ? '' : value}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Painel Administrativo
              </h1>
              <p className="text-slate-600">
                Sistema Ministerial - Gerenciamento Central
              </p>
            </div>
            
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="w-4 h-4 mr-1" />
              Admin
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={
            <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuários
                </TabsTrigger>
                <TabsTrigger value="materials" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Materiais
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Sistema
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Monitoramento
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <OverviewTab />
              </TabsContent>

              <TabsContent value="users">
                <UsersTab />
              </TabsContent>

              <TabsContent value="materials">
                <MaterialsTab />
              </TabsContent>

              <TabsContent value="system">
                <SystemTab />
              </TabsContent>

              <TabsContent value="monitoring">
                <MonitoringTab />
              </TabsContent>
            </Tabs>
          } />
          
          {/* Sub-rotas específicas */}
          <Route path="/overview" element={<Navigate to="/admin" replace />} />
          <Route path="/users" element={<Navigate to="/admin" replace />} />
          <Route path="/materials" element={<Navigate to="/admin" replace />} />
          <Route path="/system" element={<Navigate to="/admin" replace />} />
          <Route path="/monitoring" element={<Navigate to="/admin" replace />} />
        </Routes>

        {children}
      </div>
    </div>
  );
};