import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Users, ArrowLeft, Upload, BarChart3, Filter, FileSpreadsheet, Table } from "lucide-react";

// New responsive components
import { ResponsiveContainer, ContentContainer } from "@/components/layout/responsive-container";
import { StudentsGrid } from "@/components/layout/adaptive-grid";
import { ResponsiveHeader, PageHeader } from "@/components/layout/responsive-header";
import { DensityProvider, useDensity, useResponsiveText } from "@/components/ui/density-provider";
import { StudentsSpreadsheetTable } from "@/components/ui/responsive-table";
import { useResponsive } from "@/hooks/use-responsive";

// Existing components
import EstudanteForm from "@/components/EstudanteForm";
import EstudanteCard from "@/components/EstudanteCard";
import SpreadsheetUpload from "@/components/SpreadsheetUpload";
import { useEstudantes } from "@/hooks/useEstudantes";
import { useAuth } from "@/contexts/AuthContext";
import { TutorialButton } from "@/components/tutorial";
import { useTranslation } from "@/hooks/useTranslation";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  EstudanteWithParent,
  EstudanteFilters,
  CARGO_LABELS,
  GENERO_LABELS,
} from "@/types/estudantes";
import { DebugPanel } from '@/components/DebugPanel';

const EstudantesResponsive = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { isMobile, isTablet } = useResponsive();

  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return ['list', 'form', 'import', 'stats', 'instructor', 'spreadsheet'].includes(tabParam || '') ? tabParam : 'list';
  });

  const {
    estudantes,
    isLoading,
    error,
    refetch,
    createEstudante,
    updateEstudante,
    deleteEstudante,
    filterEstudantes,
    getStatistics,
  } = useEstudantes(activeTab);

  useEffect(() => {
    if (activeTab !== 'list') {
      setSearchParams({ tab: activeTab });
    } else {
      setSearchParams({});
    }
  }, [activeTab, setSearchParams]);

  const [editingEstudante, setEditingEstudante] = useState<EstudanteWithParent | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [filters, setFilters] = useState<EstudanteFilters>({
    searchTerm: "",
    cargo: "todos",
    genero: "todos",
    ativo: "todos",
  });

  const filteredEstudantes = useMemo(() => {
    return filterEstudantes(filters);
  }, [estudantes, filters, filterEstudantes]);

  const statistics = useMemo(() => {
    return getStatistics();
  }, [estudantes, getStatistics]);

  const potentialParents = useMemo(() => {
    if (!estudantes) return [];
    return estudantes.filter(e => e.idade && e.idade >= 18 && e.ativo);
  }, [estudantes]);

  const handleFilterChange = (field: keyof EstudanteFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateEstudante = async (data: any): Promise<boolean> => {
    setFormLoading(true);
    await createEstudante(data);
    setFormLoading(false);
    setActiveTab("list");
    return true;
  };

  const handleUpdateEstudante = async (data: any): Promise<boolean> => {
    if (!editingEstudante) return false;
    setFormLoading(true);
    await updateEstudante({ id: editingEstudante.id, data });
    setFormLoading(false);
    setEditingEstudante(null);
    setActiveTab("list");
    return true;
  };

  const handleEditEstudante = (estudante: any) => {
    setEditingEstudante(estudante);
    setActiveTab("form");
  };

  const handleDeleteEstudante = async (id: string) => {
    await deleteEstudante(id);
  };

  const handleCancelForm = () => {
    setEditingEstudante(null);
    setActiveTab("list");
  };

  const handleImportComplete = () => {
    refetch();
    setActiveTab("list");
  };

  const handleViewList = () => setActiveTab("list");

  // Responsive tabs configuration
  const tabs = [
    { id: 'list', label: t('Lista'), icon: <Users className="w-4 h-4" /> },
    { id: 'form', label: editingEstudante ? t('Editar') : t('Novo'), icon: <Plus className="w-4 h-4" /> },
    { id: 'import', label: t('Importar'), icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'spreadsheet', label: 'Planilha', icon: <Table className="w-4 h-4" /> },
    { id: 'stats', label: t('Estatísticas'), icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'instructor', label: t('Painel do Instrutor'), icon: <Users className="w-4 h-4" /> }
  ];

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <ContentContainer>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <StudentsGrid>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </StudentsGrid>
          </div>
        </ContentContainer>
      );
    }

    if (error) {
      return (
        <ContentContainer>
          <EmptyState
            title="Não foi possível carregar"
            description={String(error).includes("timeout") ? "Tempo esgotado" : "Ocorreu um erro"}
            action={<Button onClick={() => refetch()}>Tentar novamente</Button>}
          />
        </ContentContainer>
      );
    }

    return (
      <ContentContainer>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Responsive Tabs */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div className="w-full overflow-x-auto">
              <TabsList className="flex w-full md:w-auto min-w-max">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="flex items-center gap-2 shrink-0"
                  >
                    {tab.icon}
                    <span className={isMobile ? 'sr-only' : ''}>{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                🔄 {t('Atualizar')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("import")}>
                <Upload className="w-4 h-4 mr-2" />
                {isMobile ? 'Importar' : t('Importar Planilha')}
              </Button>
              <Button variant="default" size="sm" onClick={() => { setEditingEstudante(null); setActiveTab("form"); }}>
                <Plus className="w-4 h-4 mr-2" />
                {isMobile ? 'Novo' : t('Novo Estudante')}
              </Button>
            </div>
          </div>

          {/* Tab Contents */}
          <TabsContent value="list" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  {t('Filtros')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder={t('Buscar por nome...')} 
                      value={filters.searchTerm} 
                      onChange={(e) => handleFilterChange("searchTerm", e.target.value)} 
                      className="pl-10" 
                    />
                  </div>
                  <Select value={filters.cargo} onValueChange={(value) => handleFilterChange("cargo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Filtrar por cargo')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">{t('Todos os cargos')}</SelectItem>
                      {Object.entries(CARGO_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Students Grid */}
            <StudentsGrid>
              {filteredEstudantes.map((estudante) => (
                <EstudanteCard 
                  key={estudante.id} 
                  estudante={estudante} 
                  onEdit={() => handleEditEstudante(estudante)} 
                  onDelete={() => handleDeleteEstudante(estudante.id)} 
                />
              ))}
            </StudentsGrid>

            {/* Empty State */}
            {filteredEstudantes.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">{t('Nenhum estudante encontrado')}</h3>
                <p className="text-gray-500 mb-4">{t('Tente ajustar os filtros ou cadastre um novo estudante.')}</p>
                <Button variant="default" onClick={() => setActiveTab("form")}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('Cadastrar Novo Estudante')}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="form">
            <EstudanteForm 
              estudante={editingEstudante || undefined} 
              potentialParents={potentialParents} 
              onSubmit={editingEstudante ? handleUpdateEstudante : handleCreateEstudante} 
              onCancel={handleCancelForm} 
              loading={formLoading} 
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-jw-blue mb-2">{statistics.total}</div>
                  <div className="text-sm text-gray-600">{t('Total de Estudantes')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{statistics.ativos}</div>
                  <div className="text-sm text-gray-600">{t('Estudantes Ativos')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">{statistics.inativos}</div>
                  <div className="text-sm text-gray-600">{t('Estudantes Inativos')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{statistics.menores}</div>
                  <div className="text-sm text-gray-600">{t('Menores de Idade')}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <SpreadsheetUpload onImportComplete={handleImportComplete} onViewList={handleViewList} />
          </TabsContent>

          <TabsContent value="spreadsheet" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Planilha de Estudantes</h3>
              <p className="text-sm text-muted-foreground">
                {filteredEstudantes.length} de {estudantes?.length || 0} estudantes
              </p>
            </div>
            <StudentsSpreadsheetTable
              students={filteredEstudantes}
              onStudentClick={handleEditEstudante}
            />
          </TabsContent>
        </Tabs>
      </ContentContainer>
    );
  };

  return (
    <DensityProvider>
      <div className="min-h-screen bg-background">
        <ResponsiveHeader 
          user={user ? {
            name: user.email?.split('@')[0] || 'Usuário',
            role: 'Instrutor'
          } : undefined}
        />
        
        <main className="pt-0">
          <PageHeader
            title={t('Gestão de Estudantes')}
            subtitle={t('Cadastre e gerencie alunos da Escola do Ministério, com validações automáticas de qualificações e regras da congregação.')}
            breadcrumbs={
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('Voltar ao Dashboard')}
              </Button>
            }
            actions={
              <div className="flex flex-wrap gap-2">
                <TutorialButton page="estudantes" variant="secondary" />
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-jw-navy">
                  Ações Rápidas
                </Button>
              </div>
            }
          />
          
          {renderMainContent()}
        </main>
        
        {import.meta.env.DEV && <DebugPanel />}
      </div>
    </DensityProvider>
  );
};

export default EstudantesResponsive;