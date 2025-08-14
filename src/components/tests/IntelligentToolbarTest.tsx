import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Download, MoreHorizontal } from "lucide-react";
import IntelligentToolbar, { 
  ToolbarFilters, 
  ToolbarActions, 
  ToolbarTabs,
  ToolbarButtonGroup 
} from "@/components/layout/IntelligentToolbar";

/**
 * Componente de teste para verificar funcionalidade do IntelligentToolbar
 */
export default function IntelligentToolbarTest() {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Teste do IntelligentToolbar</h2>
      
      {/* Teste básico de layout */}
      <div className="border rounded-lg">
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
                Adicionar
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

      {/* Teste com tabs */}
      <div className="border rounded-lg">
        <IntelligentToolbar
          filters={
            <ToolbarTabs>
              <Button variant="default" size="sm">
                Ativos
                <Badge variant="secondary" className="ml-2">12</Badge>
              </Button>
              <Button variant="ghost" size="sm">
                Inativos
                <Badge variant="outline" className="ml-2">3</Badge>
              </Button>
            </ToolbarTabs>
          }
          primaryActions={
            <ToolbarButtonGroup>
              <Button size="sm">Novo</Button>
              <Button variant="outline" size="sm">Exportar</Button>
            </ToolbarButtonGroup>
          }
        />
      </div>

      {/* Teste de responsividade */}
      <div className="border rounded-lg">
        <p className="p-2 text-sm text-muted-foreground">
          Redimensione a janela para testar comportamento responsivo
        </p>
        <IntelligentToolbar
          filters={
            <ToolbarFilters>
              <Input placeholder="Buscar..." className="w-32 md:w-48" />
              <select className="px-2 py-1 border rounded text-sm">
                <option>Filtro 1</option>
                <option>Filtro 2</option>
              </select>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                Filtros Avançados
              </Button>
            </ToolbarFilters>
          }
          primaryActions={
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          }
          tertiaryActions={
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      <div className="text-sm text-muted-foreground space-y-2">
        <p><strong>Teste 1:</strong> Layout básico com 4 colunas (1fr auto auto auto)</p>
        <p><strong>Teste 2:</strong> Tabs no lado esquerdo com botões agrupados</p>
        <p><strong>Teste 3:</strong> Comportamento responsivo - elementos se escondem em telas menores</p>
        <p><strong>CSS Grid:</strong> Filtros ocupam espaço restante, ações se ajustam automaticamente</p>
      </div>
    </div>
  );
}