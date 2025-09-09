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
  Settings
} from "lucide-react";
import IntelligentToolbar, { 
  ToolbarFilters, 
  ToolbarActions, 
  ToolbarTabs,
  ToolbarButtonGroup 
} from "@/components/layout/IntelligentToolbar";

/**
 * Example demonstrating IntelligentToolbar usage patterns
 */
export default function IntelligentToolbarExample() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Intelligent Toolbar Examples</h2>
        
        {/* Example 1: Basic toolbar with search and actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Basic Toolbar</h3>
          <IntelligentToolbar
            filters={
              <ToolbarFilters>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Buscar estudantes..." 
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </ToolbarFilters>
            }
            primaryActions={
              <ToolbarActions>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Estudante
                </Button>
              </ToolbarActions>
            }
            secondaryActions={
              <ToolbarActions>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </ToolbarActions>
            }
            tertiaryActions={
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
        </div>

        {/* Example 2: Toolbar with tabs and grouped actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Toolbar with Tabs</h3>
          <IntelligentToolbar
            filters={
              <ToolbarTabs>
                <Button variant="default" size="sm">
                  Ativos
                  <Badge variant="secondary" className="ml-2">24</Badge>
                </Button>
                <Button variant="ghost" size="sm">
                  Inativos
                  <Badge variant="outline" className="ml-2">3</Badge>
                </Button>
                <Button variant="ghost" size="sm">
                  Todos
                  <Badge variant="outline" className="ml-2">27</Badge>
                </Button>
              </ToolbarTabs>
            }
            primaryActions={
              <ToolbarButtonGroup>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </ToolbarButtonGroup>
            }
            tertiaryActions={
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            }
          />
        </div>

        {/* Example 3: Complex toolbar with multiple filter types */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Complex Toolbar</h3>
          <IntelligentToolbar
            filters={
              <ToolbarFilters>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Buscar..." 
                    className="pl-10 w-48"
                  />
                </div>
                <select className="px-3 py-1 border rounded-md text-sm">
                  <option>Todas as congregações</option>
                  <option>Congregação A</option>
                  <option>Congregação B</option>
                </select>
                <select className="px-3 py-1 border rounded-md text-sm">
                  <option>Todos os cargos</option>
                  <option>Estudante</option>
                  <option>Instrutor</option>
                </select>
                <Badge variant="secondary">
                  3 filtros ativos
                </Badge>
              </ToolbarFilters>
            }
            primaryActions={
              <ToolbarButtonGroup variant="spaced">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </ToolbarButtonGroup>
            }
            secondaryActions={
              <ToolbarButtonGroup variant="compact">
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </ToolbarButtonGroup>
            }
            tertiaryActions={
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
        </div>

        {/* Example 4: Mobile-responsive behavior demonstration */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Mobile Responsive (resize window to test)</h3>
          <IntelligentToolbar
            filters={
              <ToolbarFilters>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Buscar..." 
                    className="pl-10 w-40 md:w-64"
                  />
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </ToolbarFilters>
            }
            primaryActions={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2 sm:mr-2" />
                <span className="hidden sm:inline">Novo</span>
              </Button>
            }
            tertiaryActions={
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}