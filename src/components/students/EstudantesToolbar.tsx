import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Download,
  Upload,
  Plus, 
  MoreHorizontal,
  RefreshCw,
  Users,
  UserCheck,
  UserX
} from "lucide-react";
import { 
  ToolbarFilters, 
  ToolbarActions, 
  ToolbarTabs,
  ToolbarButtonGroup 
} from "@/components/layout/IntelligentToolbar";
import { DensityToggleCompact } from "@/components/ui/density-toggle";

interface EstudantesToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  activeCount?: number;
  inactiveCount?: number;
  totalCount?: number;
  selectedTab?: string;
  onTabChange?: (tab: string) => void;
  onImport?: () => void;
  onAddStudent?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  onShowFilters?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

/**
 * Toolbar específica para a página de Estudantes
 * Demonstra o uso do IntelligentToolbar com funcionalidades específicas
 */
export default function EstudantesToolbar({
  searchValue = "",
  onSearchChange,
  activeCount = 0,
  inactiveCount = 0,
  totalCount = 0,
  selectedTab = "active",
  onTabChange,
  onAddStudent,
  onExport,
  onImport,
  onRefresh,
  onShowFilters,
  hasActiveFilters = false,
  className
}: EstudantesToolbarProps) {
  return (
    <div className={className}>
      {/* Left side: Tabs and search */}
      <ToolbarTabs>
        <Button 
          variant={selectedTab === "active" ? "default" : "ghost"} 
          size="sm"
          onClick={() => onTabChange?.("active")}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Ativos
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeCount}
            </Badge>
          )}
        </Button>
        <Button 
          variant={selectedTab === "inactive" ? "default" : "ghost"} 
          size="sm"
          onClick={() => onTabChange?.("inactive")}
        >
          <UserX className="h-4 w-4 mr-2" />
          Inativos
          {inactiveCount > 0 && (
            <Badge variant="outline" className="ml-2">
              {inactiveCount}
            </Badge>
          )}
        </Button>
        <Button 
          variant={selectedTab === "all" ? "default" : "ghost"} 
          size="sm"
          onClick={() => onTabChange?.("all")}
        >
          <Users className="h-4 w-4 mr-2" />
          Todos
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
            placeholder="Buscar estudantes..." 
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

      {/* Primary actions */}
      <ToolbarActions>
        <Button size="sm" onClick={onAddStudent}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Estudante
        </Button>
      </ToolbarActions>

      {/* Secondary actions */}
      <ToolbarButtonGroup variant="compact">
        <Button variant="outline" size="sm" onClick={onImport}>
          <Upload className="h-4 w-4 mr-2" />
          Importar
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <DensityToggleCompact />
      </ToolbarButtonGroup>

      {/* Tertiary actions */}
      <Button variant="ghost" size="sm">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}

/**
 * Hook para gerenciar estado da toolbar de estudantes
 */
export function useEstudantesToolbar() {
  // Este hook pode ser expandido para gerenciar estado da toolbar
  // Por enquanto, retorna valores mock para demonstração
  return {
    searchValue: "",
    activeCount: 24,
    inactiveCount: 3,
    totalCount: 27,
    selectedTab: "active" as const,
    hasActiveFilters: false,
    
    // Handlers
    handleSearchChange: (value: string) => {
      console.log("Search changed:", value);
    },
    handleTabChange: (tab: "active" | "inactive" | "all") => {
      console.log("Tab changed:", tab);
    },
    handleAddStudent: () => {
      console.log("Add student clicked");
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