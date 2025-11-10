/**
 * Admin Dashboard for Programs Management
 * Complete management interface for viewing, filtering, and bulk operations on programs
 */

import React from 'react';
import IntelligentToolbar from '@/components/layout/IntelligentToolbar';
import { ProgramsStatsCards } from '@/components/admin/ProgramsStatsCards';
import { ProgramsFilters } from '@/components/admin/ProgramsFilters';
import { ProgramsDataTable } from '@/components/admin/ProgramsDataTable';
import { BulkActionsDropdown } from '@/components/admin/BulkActionsDropdown';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { useProgramasAdmin } from '@/hooks/useProgramasAdmin';
import { exportProgramsToExcel, exportProgramsToPDF } from '@/utils/programsExport';
import { toast } from 'sonner';
import UnifiedNavigation from '@/components/UnifiedNavigation';

export default function ProgramasDashboard() {
  const {
    programs,
    isLoading,
    refetch,
    filters,
    setFilters,
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    bulkDelete,
    isDeleting,
    stats,
  } = useProgramasAdmin();

  const handleClearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      month: null,
      status: [],
      assignmentStatus: [],
      searchTerm: '',
    });
  };

  const handleExportExcel = (exportPrograms: any[]) => {
    try {
      exportProgramsToExcel(exportPrograms);
      toast.success('Programas exportados para Excel com sucesso');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Erro ao exportar para Excel');
    }
  };

  const handleExportPDF = (exportPrograms: any[]) => {
    try {
      exportProgramsToPDF(exportPrograms);
      toast.success('Programas exportados para PDF com sucesso');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Erro ao exportar para PDF');
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await bulkDelete(ids);
      toast.success(`${ids.length} programa(s) excluído(s) com sucesso`);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Erro ao excluir programas');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Programas</h1>
          <p className="text-muted-foreground">
            Visualize, filtre e gerencie todos os programas salvos no sistema
          </p>
        </div>

        {/* Stats Cards */}
        <ProgramsStatsCards stats={stats} />

        {/* Toolbar with Filters and Actions */}
        <IntelligentToolbar
          filters={
            <ProgramsFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          }
          primaryActions={
            <div className="flex gap-2">
              {selectedIds.size > 0 && (
                <BulkActionsDropdown
                  selectedIds={selectedIds}
                  programs={programs}
                  onBulkDelete={handleBulkDelete}
                  onExportExcel={handleExportExcel}
                  onExportPDF={handleExportPDF}
                  isDeleting={isDeleting}
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportExcel(programs)}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar Tudo (Excel)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          }
        />

        {/* Data Table */}
        <ProgramsDataTable
          programs={programs}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onToggleSelectAll={toggleSelectAll}
          onDelete={handleBulkDelete}
          isDeleting={isDeleting}
          isLoading={isLoading}
        />

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground text-center">
          Exibindo {programs.length} programa(s)
          {selectedIds.size > 0 && ` • ${selectedIds.size} selecionado(s)`}
        </div>
      </div>
    </div>
  );
}
