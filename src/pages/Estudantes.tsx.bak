import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EstudanteForm from "@/components/EstudanteForm";
import EstudanteCard from "@/components/EstudanteCard";
import SpreadsheetUpload from "@/components/SpreadsheetUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Users, ArrowLeft, Upload, BarChart3, Filter, FileSpreadsheet, Table } from "lucide-react";
import StudentsSpreadsheet from "@/components/StudentsSpreadsheet";
import { useEstudantes } from "@/hooks/useEstudantes";
import { useAuth } from "@/contexts/AuthContext";
import { TutorialButton } from "@/components/tutorial";
import { useTranslation } from "@/hooks/useTranslation";
import Hero from "@/components/Hero";
import { ScrollTabs } from "@/components/ui/scroll-tabs";
import QuickActions from "@/components/QuickActions";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
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
import { DebugPanel } from '@/components/DebugPanel';

const Estudantes = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

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

  const {
    data: instructorData,
    loading: instructorLoading,
    error: instructorError,
    refreshData: refreshInstructorData
  } = useInstructorDashboard();

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

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4">
          <EmptyState
            title={t('errors.loadingFailed')}
            description={String(error).includes("timeout") ? t('errors.timeout') : t('errors.unknownError')}
            action={<Button onClick={() => refetch()}>{t('common.refresh')}</Button>}
          />
        </div>
      );
    }

    return (
      <section className="py-4 md:py-8">
        <div className="responsive-container px-2 md:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4 md:gap-6">
                <ScrollTabs>
                  <TabsList className="responsive-tabs w-full md:w-auto" data-tutorial="tabs-navigation">
                    <TabsTrigger value="list" className="flex items-center gap-2 shrink-0 snap-start">
                      <Users className="w-4 h-4" />
                      {t('students.tabs.list')}
                    </TabsTrigger>
                    <TabsTrigger value="form" className="flex items-center gap-2 shrink-0 snap-start">
                      <Plus className="w-4 h-4" />
                      {editingEstudante ? t('common.edit') : t('students.tabs.new')}
                    </TabsTrigger>
                    <TabsTrigger value="import" className="flex items-center gap-2 shrink-0 snap-start">
                      <FileSpreadsheet className="w-4 h-4" />
                      {t('students.tabs.import')}
                    </TabsTrigger>
                    <TabsTrigger value="spreadsheet" className="flex items-center gap-2 shrink-0 snap-start">
                      <Table className="w-4 h-4" />
                      {t('students.tabs.spreadsheet')}
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="flex items-center gap-2 shrink-0 snap-start">
                      <BarChart3 className="w-4 h-4" />
                      {t('students.tabs.statistics')}
                    </TabsTrigger>
                    <TabsTrigger value="instructor" className="flex items-center gap-2 shrink-0 snap-start">
                      <Users className="w-4 h-4" />
                      {t('students.tabs.instructorPanel')}
                    </TabsTrigger>
                  </TabsList>
                </ScrollTabs>
                <div className="responsive-buttons w-full md:w-auto flex flex-col md:flex-row gap-2 md:gap-3">
                  <Button variant="outline" size="sm" onClick={() => refetch()}>🔄 {t('common.refresh')}</Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("import")}> <Upload className="w-4 h-4 mr-2" />{t('students.importSpreadsheet')}</Button>
                  <Button variant="hero" size="sm" onClick={() => { setEditingEstudante(null); setActiveTab("form"); }}> <Plus className="w-4 h-4 mr-2" />{t('students.newStudent')}</Button>
                </div>
              </div>

              <TabsContent value="list" className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5" />{t('students.filters')}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="responsive-form grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input placeholder={t('students.searchByName')} value={filters.searchTerm} onChange={(e) => handleFilterChange("searchTerm", e.target.value)} className="pl-10" />
                      </div>
                      <Select value={filters.cargo} onValueChange={(value) => handleFilterChange("cargo", value)}>
                        <SelectTrigger><SelectValue placeholder={t('students.filterByRole')} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">{t('students.allRoles')}</SelectItem>
                          {Object.entries(CARGO_LABELS).map(([value]) => (
                            <SelectItem key={value} value={value}>{t(`terms.${value}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                <div className="responsive-grid students-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {filteredEstudantes.map((estudante) => (
                    <EstudanteCard key={estudante.id} estudante={estudante} onEdit={() => handleEditEstudante(estudante)} onDelete={() => handleDeleteEstudante(estudante.id)} />
                  ))}
                </div>
                {filteredEstudantes.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">{t('students.noStudentsFound')}</h3>
                    <p className="text-gray-500 mb-4">{t('students.adjustFiltersOrRegister')}</p>
                    <Button variant="hero" onClick={() => setActiveTab("form")}><Plus className="w-4 h-4 mr-2" />{t('students.registerNewStudent')}</Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="form">
                <EstudanteForm estudante={editingEstudante || undefined} potentialParents={potentialParents} onSubmit={editingEstudante ? handleUpdateEstudante : handleCreateEstudante} onCancel={handleCancelForm} loading={formLoading} />
              </TabsContent>
              <TabsContent value="stats" className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <Card><CardContent className="p-6 text-center"><div className="text-3xl font-bold text-jw-blue mb-2">{statistics.total}</div><div className="text-sm text-gray-600">{t('students.totalStudents')}</div></CardContent></Card>
                  <Card><CardContent className="p-6 text-center"><div className="text-3xl font-bold text-green-600 mb-2">{statistics.ativos}</div><div className="text-sm text-gray-600">{t('students.activeStudents')}</div></CardContent></Card>
                  <Card><CardContent className="p-6 text-center"><div className="text-3xl font-bold text-red-600 mb-2">{statistics.inativos}</div><div className="text-sm text-gray-600">{t('students.inactiveStudents')}</div></CardContent></Card>
                  <Card><CardContent className="p-6 text-center"><div className="text-3xl font-bold text-orange-600 mb-2">{statistics.menores}</div><div className="text-sm text-gray-600">{t('students.minors')}</div></CardContent></Card>
                </div>
              </TabsContent>
              <TabsContent value="instructor" className="space-y-6">
                {instructorLoading ? <p>{t('common.loading')}</p> : instructorError ? <p>{t('errors.loadingFailed')}</p> : (
                  <InstructorDashboardStats data={instructorData} />
                )}
              </TabsContent>
              <TabsContent value="import" className="space-y-6">
                <SpreadsheetUpload onImportComplete={handleImportComplete} onViewList={handleViewList} />
              </TabsContent>
              <TabsContent value="spreadsheet" className="space-y-4 sm:space-y-6 w-full overflow-x-auto">
                <StudentsSpreadsheet estudantes={estudantes || []} onRefresh={() => refetch()} />
              </TabsContent>
            </Tabs>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Hero
          title={t('students.title')}
          subtitle={t('students.subtitle')}
          actions={
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <Button variant="ghost" size="sm" className="text-white hover:text-jw-gold -ml-0 md:-ml-4" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.backToDashboard')}
              </Button>
              <TutorialButton page="estudantes" variant="secondary" />
              <QuickActions />
            </div>
          }
        />
        {renderMainContent()}
      </main>
      <Footer />
      {import.meta.env.DEV && <DebugPanel />}
    </div>
  );
};

export default Estudantes;
