import PageShell from "@/components/layout/PageShell";
import IntelligentToolbar from "@/components/layout/IntelligentToolbar";
import EstudantesToolbar, { useEstudantesToolbar } from "@/components/students/EstudantesToolbar";
import ProgramasToolbar, { useProgramasToolbar } from "@/components/programs/ProgramasToolbar";
import DesignacoesToolbar, { useDesignacoesToolbar } from "@/components/assignments/DesignacoesToolbar";
import IntelligentToolbarExample from "@/components/examples/IntelligentToolbarExample";

/**
 * Página de teste para demonstrar o IntelligentToolbar
 * integrado com o PageShell
 */
export default function IntelligentToolbarTest() {
  const estudantesToolbar = useEstudantesToolbar();
  const programasToolbar = useProgramasToolbar();
  const designacoesToolbar = useDesignacoesToolbar();

  return (
    <div className="space-y-8">
      {/* Teste 1: Estudantes Toolbar */}
      <PageShell
        title="Estudantes"
        hero={false}
        toolbar={
          <IntelligentToolbar>
            <EstudantesToolbar
              searchValue={estudantesToolbar.searchValue}
              onSearchChange={estudantesToolbar.handleSearchChange}
              activeCount={estudantesToolbar.activeCount}
              inactiveCount={estudantesToolbar.inactiveCount}
              totalCount={estudantesToolbar.totalCount}
              selectedTab={estudantesToolbar.selectedTab}
              onTabChange={estudantesToolbar.handleTabChange}
              onAddStudent={estudantesToolbar.handleAddStudent}
              onExport={estudantesToolbar.handleExport}
              onRefresh={estudantesToolbar.handleRefresh}
              onShowFilters={estudantesToolbar.handleShowFilters}
              hasActiveFilters={estudantesToolbar.hasActiveFilters}
            />
          </IntelligentToolbar>
        }
      >
        <div className="responsive-table-container">
          <div className="p-8 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold mb-2">Área de Conteúdo - Estudantes</h3>
            <p>Aqui ficaria a tabela de estudantes com altura calculada automaticamente.</p>
            <p className="text-sm mt-4">
              Altura: calc(100svh - var(--toolbar-h) - var(--footer-h) - gutters)
            </p>
          </div>
        </div>
      </PageShell>

      {/* Teste 2: Programas Toolbar */}
      <PageShell
        title="Programas"
        hero={false}
        toolbar={
          <IntelligentToolbar>
            <ProgramasToolbar
              searchValue={programasToolbar.searchValue}
              onSearchChange={programasToolbar.handleSearchChange}
              upcomingCount={programasToolbar.upcomingCount}
              completedCount={programasToolbar.completedCount}
              totalCount={programasToolbar.totalCount}
              selectedTab={programasToolbar.selectedTab}
              onTabChange={programasToolbar.handleTabChange}
              onAddProgram={programasToolbar.handleAddProgram}
              onExport={programasToolbar.handleExport}
              onRefresh={programasToolbar.handleRefresh}
              onShowFilters={programasToolbar.handleShowFilters}
              hasActiveFilters={programasToolbar.hasActiveFilters}
            />
          </IntelligentToolbar>
        }
      >
        <div className="responsive-table-container">
          <div className="p-8 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold mb-2">Área de Conteúdo - Programas</h3>
            <p>Aqui ficaria a grade de programas com altura calculada automaticamente.</p>
          </div>
        </div>
      </PageShell>

      {/* Teste 3: Designações Toolbar */}
      <PageShell
        title="Designações"
        hero={false}
        toolbar={
          <IntelligentToolbar>
            <DesignacoesToolbar
              searchValue={designacoesToolbar.searchValue}
              onSearchChange={designacoesToolbar.handleSearchChange}
              pendingCount={designacoesToolbar.pendingCount}
              completedCount={designacoesToolbar.completedCount}
              totalCount={designacoesToolbar.totalCount}
              selectedTab={designacoesToolbar.selectedTab}
              onTabChange={designacoesToolbar.handleTabChange}
              onAddAssignment={designacoesToolbar.handleAddAssignment}
              onExport={designacoesToolbar.handleExport}
              onRefresh={designacoesToolbar.handleRefresh}
              onShowFilters={designacoesToolbar.handleShowFilters}
              hasActiveFilters={designacoesToolbar.hasActiveFilters}
            />
          </IntelligentToolbar>
        }
      >
        <div className="responsive-table-container">
          <div className="p-8 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold mb-2">Área de Conteúdo - Designações</h3>
            <p>Aqui ficaria a lista de designações com altura calculada automaticamente.</p>
          </div>
        </div>
      </PageShell>

      {/* Teste 4: Exemplos diversos */}
      <PageShell
        title="Exemplos de Toolbar"
        hero={false}
      >
        <IntelligentToolbarExample />
      </PageShell>
    </div>
  );
}