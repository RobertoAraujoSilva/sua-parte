import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EstudanteForm from "@/components/EstudanteForm";
import EstudanteCard from "@/components/EstudanteCard";
import SpreadsheetUpload from "@/components/SpreadsheetUpload";
import TemplateDownload from "@/components/TemplateDownload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Users, ArrowLeft, Upload, BarChart3, Filter, FileSpreadsheet } from "lucide-react";
import { useEstudantes } from "@/hooks/useEstudantes";
import { useAuth } from "@/contexts/AuthContext";
import { TutorialButton } from "@/components/tutorial";
import {
  ProgressBoard,
  SpeechTypeCategories,
  InstructorDashboardStats
} from "@/components/instructor";
import { useInstructorDashboard } from "@/hooks/useInstructorDashboard";
import {
  EstudanteWithParent,
  EstudanteFilters,
  Cargo,
  Genero,
  CARGO_LABELS,
  GENERO_LABELS,
} from "@/types/estudantes";

const Estudantes = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    estudantes,
    loading,
    error,
    createEstudante,
    updateEstudante,
    deleteEstudante,
    filterEstudantes,
    getPotentialParents,
    getStatistics,
  } = useEstudantes();

  // Instructor Dashboard Hook
  const {
    data: instructorData,
    loading: instructorLoading,
    error: instructorError,
    updateQualifications,
    updateProgress,
    moveStudent,
    refreshData: refreshInstructorData
  } = useInstructorDashboard();

  // UI State - Initialize from URL parameter
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return ['list', 'form', 'import', 'stats', 'instructor'].includes(tabParam || '') ? tabParam : 'list';
  });

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== 'list') {
      setSearchParams({ tab: activeTab });
    } else {
      setSearchParams({});
    }
  }, [activeTab, setSearchParams]);
  const [editingEstudante, setEditingEstudante] = useState<EstudanteWithParent | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<EstudanteFilters>({
    searchTerm: "",
    cargo: "todos",
    genero: "todos",
    ativo: "todos",
  });

  // Filtered students
  const filteredEstudantes = useMemo(() => {
    return filterEstudantes(filters);
  }, [estudantes, filters, filterEstudantes]);

  // Statistics
  const statistics = useMemo(() => {
    return getStatistics();
  }, [estudantes, getStatistics]);

  // Potential parents for form
  const potentialParents = useMemo(() => {
    return getPotentialParents();
  }, [estudantes, getPotentialParents]);

  // Event handlers
  const handleFilterChange = (field: keyof EstudanteFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateEstudante = async (data: any) => {
    setFormLoading(true);
    const success = await createEstudante(data);
    setFormLoading(false);
    if (success) {
      setActiveTab("list");
    }
    return success;
  };

  const handleUpdateEstudante = async (data: any) => {
    if (!editingEstudante) return false;
    setFormLoading(true);
    const success = await updateEstudante(editingEstudante.id, data);
    setFormLoading(false);
    if (success) {
      setEditingEstudante(null);
      setActiveTab("list");
    }
    return success;
  };

  const handleEditEstudante = (estudante: EstudanteWithParent) => {
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
    // Refresh students list after import
    window.location.reload();
  };

  const handleViewList = () => {
    setActiveTab("list");
  };

  // Show loading state
  if (loading && estudantes.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jw-blue mx-auto mb-4"></div>
            <p>Carregando estudantes...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-20 text-center">
            <p className="text-red-600 mb-4">Erro ao carregar estudantes: {error}</p>
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-jw-gold"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>

            <div className="flex items-start justify-between">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-4">
                  Gestão de <span className="text-jw-gold">Estudantes</span>
                </h1>
                <p className="text-xl opacity-90 max-w-2xl">
                  Cadastre e gerencie estudantes da Escola do Ministério Teocrático com
                  validação automática de qualificações e regras congregacionais.
                </p>
              </div>
              <TutorialButton page="estudantes" variant="secondary" />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="grid w-auto grid-cols-5" data-tutorial="tabs-navigation">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Lista
                  </TabsTrigger>
                  <TabsTrigger value="form" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {editingEstudante ? "Editar" : "Novo"}
                  </TabsTrigger>
                  <TabsTrigger value="import" className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Importar
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Estatísticas
                  </TabsTrigger>
                  <TabsTrigger value="instructor" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Painel do Instrutor
                  </TabsTrigger>
                </TabsList>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("import")}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Planilha
                  </Button>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => {
                      setEditingEstudante(null);
                      setActiveTab("form");
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Estudante
                  </Button>
                </div>
              </div>

              {/* Students List Tab */}
              <TabsContent value="list" className="space-y-6">
                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Filtros
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Buscar por nome..."
                          value={filters.searchTerm}
                          onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <Select
                        value={filters.cargo}
                        onValueChange={(value) => handleFilterChange("cargo", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os cargos</SelectItem>
                          {Object.entries(CARGO_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filters.genero}
                        onValueChange={(value) => handleFilterChange("genero", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por gênero" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os gêneros</SelectItem>
                          {Object.entries(GENERO_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filters.ativo?.toString() || "todos"}
                        onValueChange={(value) => handleFilterChange("ativo", value === "todos" ? "todos" : value === "true")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os status</SelectItem>
                          <SelectItem value="true">Apenas ativos</SelectItem>
                          <SelectItem value="false">Apenas inativos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Students Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEstudantes.map((estudante) => (
                    <EstudanteCard
                      key={estudante.id}
                      estudante={estudante}
                      onEdit={handleEditEstudante}
                      onDelete={handleDeleteEstudante}
                      loading={loading}
                    />
                  ))}
                </div>

                {/* Empty State */}
                {filteredEstudantes.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      {filters.searchTerm || filters.cargo !== "todos" || filters.genero !== "todos" || filters.ativo !== "todos"
                        ? "Nenhum estudante encontrado"
                        : "Nenhum estudante cadastrado"
                      }
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {filters.searchTerm || filters.cargo !== "todos" || filters.genero !== "todos" || filters.ativo !== "todos"
                        ? "Tente ajustar os filtros de busca"
                        : "Comece cadastrando seu primeiro estudante"
                      }
                    </p>
                    <Button
                      variant="hero"
                      onClick={() => {
                        setEditingEstudante(null);
                        setActiveTab("form");
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeiro Estudante
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Form Tab */}
              <TabsContent value="form">
                <EstudanteForm
                  estudante={editingEstudante || undefined}
                  potentialParents={potentialParents}
                  onSubmit={editingEstudante ? handleUpdateEstudante : handleCreateEstudante}
                  onCancel={handleCancelForm}
                  loading={formLoading}
                />
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="stats" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-jw-blue mb-2">{statistics.total}</div>
                      <div className="text-sm text-gray-600">Total de Estudantes</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{statistics.ativos}</div>
                      <div className="text-sm text-gray-600">Estudantes Ativos</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">{statistics.inativos}</div>
                      <div className="text-sm text-gray-600">Estudantes Inativos</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">{statistics.menores}</div>
                      <div className="text-sm text-gray-600">Menores de Idade</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gender Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição por Gênero</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Homens</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${statistics.total > 0 ? (statistics.homens / statistics.total) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{statistics.homens}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Mulheres</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-pink-600 h-2 rounded-full"
                                style={{ width: `${statistics.total > 0 ? (statistics.mulheres / statistics.total) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{statistics.mulheres}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Role Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição por Cargo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(statistics.cargoStats).map(([cargo, count]) => (
                          <div key={cargo} className="flex items-center justify-between">
                            <span className="text-sm">{CARGO_LABELS[cargo as Cargo]}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-jw-blue h-2 rounded-full"
                                  style={{ width: `${statistics.total > 0 ? (count / statistics.total) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-6 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Instructor Dashboard Tab */}
              <TabsContent value="instructor" className="space-y-6">
                {instructorLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jw-blue mx-auto mb-4"></div>
                      <p className="text-gray-600">Carregando painel do instrutor...</p>
                    </div>
                  </div>
                ) : instructorError ? (
                  <div className="text-center py-12">
                    <p className="text-red-600 mb-4">Erro ao carregar painel do instrutor: {instructorError}</p>
                    <Button onClick={refreshInstructorData}>Tentar Novamente</Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Dashboard Statistics */}
                    <div data-tutorial="instructor-stats">
                      <InstructorDashboardStats data={instructorData} />
                    </div>

                    {/* Progress Board */}
                    <div data-tutorial="progress-board">
                      <ProgressBoard
                        studentsByProgress={instructorData.students_by_progress}
                        onMoveStudent={moveStudent}
                        onUpdateQualifications={updateQualifications}
                        onUpdateProgress={updateProgress}
                        isLoading={instructorLoading}
                      />
                    </div>

                    {/* Speech Type Categories */}
                    <div data-tutorial="speech-categories">
                      <SpeechTypeCategories
                        studentsBySpeechType={instructorData.students_by_speech_type}
                        onUpdateQualifications={updateQualifications}
                        onUpdateProgress={updateProgress}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Import Tab */}
              <TabsContent value="import" className="space-y-6">
                <SpreadsheetUpload
                  onImportComplete={handleImportComplete}
                  onViewList={handleViewList}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Estudantes;
