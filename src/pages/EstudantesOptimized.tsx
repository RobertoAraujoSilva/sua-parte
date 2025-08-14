import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEstudantes } from "@/hooks/useEstudantes";
import PageShell from "@/components/layout/PageShell";
import { EstudantesToolbar } from "@/components/students/EstudantesToolbar";
import { StudentSpreadsheetOptimized } from "@/components/students/StudentSpreadsheetOptimized";
import EstudanteForm from "@/components/EstudanteForm";
import EstudanteCard from "@/components/EstudanteCard";
import SpreadsheetUpload from "@/components/SpreadsheetUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, BarChart3 } from "lucide-react";
import { EstudanteWithParent, EstudanteFilters, CARGO_LABELS } from "@/types/estudantes";
import { DebugPanel } from '@/components/DebugPanel';
import { AdaptiveGrid } from "@/components/layout/adaptive-grid";

const EstudantesOptimized = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return ['list', 'spreadsheet', 'stats', 'import', 'form'].includes(tabParam || '') ? tabParam : 'list';
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

  const filteredEstudantes = filterEstudantes(filters);
  const statistics = getStatistics();

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

  const handleImportComplete = () => {
    refetch();
    setActiveTab("list");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'spreadsheet':
        return <StudentSpreadsheetOptimized />;
        
      case 'list':
        return (
          <div className="py-4 space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder="Buscar por nome..." 
                      value={filters.searchTerm} 
                      onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))} 
                      className="pl-10" 
                    />
                  </div>
                  <Select value={filters.cargo} onValueChange={(value) => setFilters(prev => ({ ...prev, cargo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os cargos</SelectItem>
                      {Object.entries(CARGO_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Grid de estudantes */}
            <AdaptiveGrid minItemWidth={280}>
              {filteredEstudantes.map((estudante) => (
                <EstudanteCard 
                  key={estudante.id} 
                  estudante={estudante} 
                  onEdit={() => handleEditEstudante(estudante)} 
                  onDelete={() => handleDeleteEstudante(estudante.id)} 
                />
              ))}
            </AdaptiveGrid>

            {filteredEstudantes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nenhum estudante encontrado</p>
                <button 
                  onClick={() => setActiveTab("form")}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Cadastrar Novo Estudante
                </button>
              </div>
            )}
          </div>
        );

      case 'stats':
      return (
      <div className="py-4">
      <AdaptiveGrid minItemWidth={200}>
      <Card>
      <CardContent className="p-6 text-center">
      <div className="text-3xl font-bold text-jw-blue mb-2">{statistics.total}</div>
      <div className="text-sm text-muted-foreground">Total de Estudantes</div>
      </CardContent>
      </Card>
      <Card>
      <CardContent className="p-6 text-center">
      <div className="text-3xl font-bold text-green-600 mb-2">{statistics.ativos}</div>
      <div className="text-sm text-muted-foreground">Estudantes Ativos</div>
      </CardContent>
      </Card>
      <Card>
      <CardContent className="p-6 text-center">
      <div className="text-3xl font-bold text-red-600 mb-2">{statistics.inativos}</div>
      <div className="text-sm text-muted-foreground">Estudantes Inativos</div>
      </CardContent>
      </Card>
      <Card>
      <CardContent className="p-6 text-center">
      <div className="text-3xl font-bold text-orange-600 mb-2">{statistics.menores}</div>
      <div className="text-sm text-muted-foreground">Menores de Idade</div>
      </CardContent>
      </Card>
      </AdaptiveGrid>
      </div>
      );

      case 'import':
        return (
          <div className="py-4">
            <SpreadsheetUpload onImportComplete={handleImportComplete} onViewList={() => setActiveTab('list')} />
          </div>
        );

      case 'form':
        return (
          <div className="py-4">
            <EstudanteForm 
              estudante={editingEstudante || undefined} 
              potentialParents={estudantes?.filter(e => e.idade && e.idade >= 18 && e.ativo) || []} 
              onSubmit={editingEstudante ? handleUpdateEstudante : handleCreateEstudante} 
              onCancel={() => {
                setEditingEstudante(null);
                setActiveTab("list");
              }} 
              loading={formLoading} 
            />
          </div>
        );

      default:
        return <div>Tab não encontrada</div>;
    }
  };

  if (isLoading) {
    return (
      <PageShell title="Gestão de Estudantes" hero={false}>
        <div className="h-full-viewport flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageShell>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageShell
        title="Gestão de Estudantes"
        hero={false}
        actions={
          <EstudantesToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onRefresh={refetch}
            onImport={() => setActiveTab('import')}
            onNew={() => {
              setEditingEstudante(null);
              setActiveTab('form');
            }}
          />
        }
      >
        {renderTabContent()}
      </PageShell>
      
      {import.meta.env.DEV && <DebugPanel />}
    </div>
  );
};

export default EstudantesOptimized;