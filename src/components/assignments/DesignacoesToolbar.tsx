import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreHorizontal,
  RefreshCw,
  ClipboardList,
  ClipboardCheck,
  Clock
} from "lucide-react";
import { DensityToggleCompact } from "@/components/ui/density-toggle";
import IntelligentToolbar, {
  ToolbarFilters,
  ToolbarActions,
  ToolbarTabs,
  ToolbarButtonGroup
} from "@/components/layout/IntelligentToolbar";

interface DesignacoesToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  pendingCount?: number;
  completedCount?: number;
  totalCount?: number;
  selectedTab?: "pending" | "completed" | "all";
  onTabChange?: (tab: "pending" | "completed" | "all") => void;
  onAddAssignment?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  onShowFilters?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

/**
 * Toolbar específica para a página de Designações
 * Usa grid layout simples para organização eficiente
 */
export default function DesignacoesToolbar({
  searchValue = "",
  onSearchChange,
  pendingCount = 0,
  completedCount = 0,
  totalCount = 0,
  selectedTab = "pending",
  onTabChange,
  onAddAssignment,
  onExport,
  onRefresh,
  onShowFilters,
  hasActiveFilters = false,
  className
}: DesignacoesToolbarProps) {
  return (
    <IntelligentToolbar
      className={className}
      filters={
        <>
          <ToolbarTabs>
            <Button 
              variant={selectedTab === "pending" ? "default" : "ghost"} 
              size="sm"
              onClick={() => onTabChange?.("pending")}
            >
              <Clock className="h-4 w-4 mr-2" />
              Pendentes
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </Button>
            <Button 
              variant={selectedTab === "completed" ? "default" : "ghost"} 
              size="sm"
              onClick={() => onTabChange?.("completed")}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Concluídas
              {completedCount > 0 && (
                <Badge variant="outline" className="ml-2">
                  {completedCount}
                </Badge>
              )}
            </Button>
            <Button 
              variant={selectedTab === "all" ? "default" : "ghost"} 
              size="sm"
              onClick={() => onTabChange?.("all")}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Todas
              {totalCount > 0 && (
                <Badge variant="outline" className="ml-2">
                  {totalCount}
                </Badge>
              )}
            </Button>
          </ToolbarTabs>

          <ToolbarFilters>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Buscar designações..." 
                className="pl-10 w-64"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
            <Button 
              variant={hasActiveFilters ? "default" : "outline"} 
              size="sm"
              onClick={onShowFilters}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  !
                </Badge>
              )}
            </Button>
          </ToolbarFilters>
        </>
      }
      primaryActions={
        <ToolbarActions>
          <Button size="sm" onClick={onAddAssignment}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Designação
          </Button>
        </ToolbarActions>
      }
      secondaryActions={
        <ToolbarButtonGroup variant="compact">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <DensityToggleCompact />
        </ToolbarButtonGroup>
      }
      tertiaryActions={
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      }
    />
  );
}

/**
 * Hook para gerenciar estado da toolbar de designações
 */
export function useDesignacoesToolbar() {
  return {
    searchValue: "",
    pendingCount: 8,
    completedCount: 32,
    totalCount: 40,
    selectedTab: "pending" as const,
    hasActiveFilters: false,
    
    // Handlers
    handleSearchChange: (value: string) => {
      console.log("Search changed:", value);
    },
    handleTabChange: (tab: "pending" | "completed" | "all") => {
      console.log("Tab changed:", tab);
    },
    handleAddAssignment: () => {
      console.log("Add assignment clicked");
    },
    handleExport: () => {
      console.log("Export clicked");
    },
    handleRefresh: () => {
      console.log("Refresh clicked");
    },
    handleShowFilters: () => {
      console.log("Show filters clicked");
    }
  };
}