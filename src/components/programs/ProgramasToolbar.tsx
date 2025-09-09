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
  Calendar,
  CalendarCheck,
  CalendarX
} from "lucide-react";
import { 
  ToolbarFilters, 
  ToolbarActions, 
  ToolbarTabs,
  ToolbarButtonGroup 
} from "@/components/layout/IntelligentToolbar";
import { DensityToggleCompact } from "@/components/ui/density-toggle";

interface ProgramasToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  upcomingCount?: number;
  completedCount?: number;
  totalCount?: number;
  selectedTab?: "upcoming" | "completed" | "all";
  onTabChange?: (tab: "upcoming" | "completed" | "all") => void;
  onAddProgram?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  onShowFilters?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

/**
 * Toolbar específica para a página de Programas
 * Demonstra o uso do IntelligentToolbar para gestão de programas
 */
export default function ProgramasToolbar({
  searchValue = "",
  onSearchChange,
  upcomingCount = 0,
  completedCount = 0,
  totalCount = 0,
  selectedTab = "upcoming",
  onTabChange,
  onAddProgram,
  onExport,
  onRefresh,
  onShowFilters,
  hasActiveFilters = false,
  className
}: ProgramasToolbarProps) {
  return (
    <>
      {/* Left side: Tabs and search */}
      <ToolbarTabs>
        <Button 
          variant={selectedTab === "upcoming" ? "default" : "ghost"} 
          size="sm"
          onClick={() => onTabChange?.("upcoming")}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Próximos
          {upcomingCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {upcomingCount}
            </Badge>
          )}
        </Button>
        <Button 
          variant={selectedTab === "completed" ? "default" : "ghost"} 
          size="sm"
          onClick={() => onTabChange?.("completed")}
        >
          <CalendarCheck className="h-4 w-4 mr-2" />
          Realizados
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
          <CalendarX className="h-4 w-4 mr-2" />
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
            placeholder="Buscar programas..." 
            className="pl-10 w-64"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
        <select className="px-3 py-1 border rounded-md text-sm">
          <option>Todas as semanas</option>
          <option>Esta semana</option>
          <option>Próxima semana</option>
          <option>Este mês</option>
        </select>
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
        <Button size="sm" onClick={onAddProgram}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Programa
        </Button>
      </ToolbarActions>

      {/* Secondary actions */}
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

      {/* Tertiary actions */}
      <Button variant="ghost" size="sm">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </>
  );
}

/**
 * Hook para gerenciar estado da toolbar de programas
 */
export function useProgramasToolbar() {
  return {
    searchValue: "",
    upcomingCount: 12,
    completedCount: 45,
    totalCount: 57,
    selectedTab: "upcoming" as const,
    hasActiveFilters: false,
    
    // Handlers
    handleSearchChange: (value: string) => {
      console.log("Search changed:", value);
    },
    handleTabChange: (tab: "upcoming" | "completed" | "all") => {
      console.log("Tab changed:", tab);
    },
    handleAddProgram: () => {
      console.log("Add program clicked");
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