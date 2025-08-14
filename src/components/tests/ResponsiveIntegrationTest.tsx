import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Plus, Settings } from 'lucide-react';

// Import all responsive components
import PageShell from '@/components/layout/PageShell';
import { ResponsivePageShell, ResponsiveTableShell, AdaptiveGridShell, useResponsiveShell } from '@/components/layout/responsive-integration';
import { ResponsiveHeader, PageHeader } from '@/components/layout/responsive-header';
import { AdaptiveGrid, StudentsGrid, ProgramsGrid } from '@/components/layout/adaptive-grid';
import { ResponsiveTable, StudentsSpreadsheetTable } from '@/components/ui/responsive-table';
import { ResponsiveContainer, FullWidthContainer, ContentContainer } from '@/components/layout/responsive-container';
import { DensityToggle } from '@/components/ui/density-toggle';

// Test data
const testStudents = [
  { id: 1, nome: 'João Silva', idade: 25, genero: 'masculino', cargo: 'Ancião', email: 'joao@email.com', telefone: '(11) 99999-9999', data_batismo: '2020-01-15', ativo: true },
  { id: 2, nome: 'Maria Santos', idade: 30, genero: 'feminino', cargo: 'Pioneira Regular', email: 'maria@email.com', telefone: '(11) 88888-8888', data_batismo: '2018-05-20', ativo: true },
  { id: 3, nome: 'Pedro Costa', idade: 22, genero: 'masculino', cargo: 'Servo Ministerial', email: 'pedro@email.com', telefone: '(11) 77777-7777', data_batismo: '2021-03-10', ativo: false },
  { id: 4, nome: 'Ana Oliveira', idade: 28, genero: 'feminino', cargo: 'Publicadora', email: 'ana@email.com', telefone: '(11) 66666-6666', data_batismo: '2019-08-25', ativo: true },
  { id: 5, nome: 'Carlos Ferreira', idade: 35, genero: 'masculino', cargo: 'Ancião', email: 'carlos@email.com', telefone: '(11) 55555-5555', data_batismo: '2015-12-05', ativo: true }
];

const testCards = [
  { id: 1, title: 'Estudantes Ativos', value: '45', change: '+5', color: 'bg-green-500' },
  { id: 2, title: 'Programas Agendados', value: '12', change: '+2', color: 'bg-blue-500' },
  { id: 3, title: 'Designações Pendentes', value: '8', change: '-1', color: 'bg-yellow-500' },
  { id: 4, title: 'Relatórios Entregues', value: '38', change: '+7', color: 'bg-purple-500' }
];

export default function ResponsiveIntegrationTest() {
  const [activeTest, setActiveTest] = useState<string>('pageshell');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  
  const { 
    currentBreakpoint, 
    isMobile, 
    density,
    getContainerClasses,
    getTableClasses,
    getToolbarClasses 
  } = useResponsiveShell();

  // Test toolbar component
  const TestToolbar = () => (
    <div className={getToolbarClasses()}>
      <div className="intelligent-toolbar__filters">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar estudantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        <Select value={filterValue} onValueChange={setFilterValue}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">
          {testStudents.length} estudantes
        </Badge>
      </div>
      
      <div className="intelligent-toolbar__primary-actions">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          {!isMobile && "Filtros"}
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          {!isMobile && "Exportar"}
        </Button>
      </div>
      
      <div className="intelligent-toolbar__secondary-actions">
        <DensityToggle />
      </div>
      
      <div className="intelligent-toolbar__tertiary-actions">
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {!isMobile && "Novo"}
        </Button>
      </div>
    </div>
  );

  const renderTest = () => {
    switch (activeTest) {
      case 'pageshell':
        return (
          <PageShell
            title="Teste PageShell Básico"
            hero={false}
            toolbar={<TestToolbar />}
          >
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Integração PageShell</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600">Breakpoint</div>
                    <div className="text-lg font-semibold">{currentBreakpoint}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600">Densidade</div>
                    <div className="text-lg font-semibold">{density}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600">Mobile</div>
                    <div className="text-lg font-semibold">{isMobile ? 'Sim' : 'Não'}</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600">CSS Variables</div>
                    <div className="text-lg font-semibold">Ativo</div>
                  </div>
                </div>
              </div>
              
              <ResponsiveTableShell>
                <StudentsSpreadsheetTable 
                  students={testStudents}
                  onStudentClick={(student) => console.log('Student clicked:', student)}
                />
              </ResponsiveTableShell>
            </div>
          </PageShell>
        );

      case 'responsive-pageshell':
        return (
          <ResponsivePageShell
            title="Teste ResponsivePageShell"
            hero={false}
            toolbar={<TestToolbar />}
            maxWidth="3xl"
            padding="lg"
          >
            <div className="space-y-6">
              <AdaptiveGridShell minItemWidth={250} maxColumns={4}>
                {testCards.map((card) => (
                  <div key={card.id} className="bg-white rounded-lg border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">{card.title}</div>
                        <div className="text-2xl font-bold">{card.value}</div>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${card.color}`}></div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className={card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                        {card.change}
                      </span>
                      <span className="text-muted-foreground ml-1">vs mês anterior</span>
                    </div>
                  </div>
                ))}
              </AdaptiveGridShell>
              
              <div className="bg-white rounded-lg border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">Tabela Responsiva Integrada</h3>
                </div>
                <ResponsiveTableShell>
                  <ResponsiveTable
                    data={testStudents}
                    columns={[
                      { key: 'nome', label: 'Nome', sticky: true, sortable: true },
                      { key: 'idade', label: 'Idade', sortable: true },
                      { key: 'cargo', label: 'Cargo', sortable: true },
                      { key: 'email', label: 'Email' },
                      { key: 'ativo', label: 'Status', render: (value) => (
                        <Badge variant={value ? 'default' : 'secondary'}>
                          {value ? 'Ativo' : 'Inativo'}
                        </Badge>
                      )}
                    ]}
                    onRowClick={(row) => console.log('Row clicked:', row)}
                  />
                </ResponsiveTableShell>
              </div>
            </div>
          </ResponsivePageShell>
        );

      case 'legacy-compatibility':
        return (
          <div className="min-h-screen bg-gray-50">
            <ResponsiveHeader
              title="Sistema Ministerial"
              user={{ name: 'João Silva', role: 'Administrador' }}
              onMenuClick={() => console.log('Menu clicked')}
            />
            
            <PageHeader
              title="Teste de Compatibilidade"
              subtitle="Verificando se componentes legados funcionam com PageShell"
              actions={
                <div className="flex gap-2">
                  <Button variant="secondary">Ação 1</Button>
                  <Button>Ação 2</Button>
                </div>
              }
            />
            
            <div className="py-8">
              <ResponsiveContainer maxWidth="2xl" padding="md">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">AdaptiveGrid Legacy</h3>
                    <AdaptiveGrid minItemWidth={200} maxColumns={6}>
                      {testCards.map((card) => (
                        <div key={card.id} className="bg-white rounded-lg border p-4">
                          <div className="text-sm font-medium">{card.title}</div>
                          <div className="text-xl font-bold mt-1">{card.value}</div>
                        </div>
                      ))}
                    </AdaptiveGrid>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">StudentsGrid Legacy</h3>
                    <StudentsGrid>
                      {testStudents.slice(0, 3).map((student) => (
                        <div key={student.id} className="bg-white rounded-lg border p-4">
                          <div className="font-medium">{student.nome}</div>
                          <div className="text-sm text-muted-foreground">{student.cargo}</div>
                          <div className="text-sm mt-2">{student.email}</div>
                        </div>
                      ))}
                    </StudentsGrid>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">FullWidthContainer Legacy</h3>
                    <FullWidthContainer>
                      <div className="bg-white rounded-lg border p-6">
                        <ResponsiveTable
                          data={testStudents.slice(0, 3)}
                          columns={[
                            { key: 'nome', label: 'Nome', sortable: true },
                            { key: 'cargo', label: 'Cargo' },
                            { key: 'email', label: 'Email' }
                          ]}
                        />
                      </div>
                    </FullWidthContainer>
                  </div>
                </div>
              </ResponsiveContainer>
            </div>
          </div>
        );

      default:
        return <div>Teste não encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Navigation */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Teste de Integração Responsiva</h1>
            <div className="flex gap-2">
              <Button
                variant={activeTest === 'pageshell' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTest('pageshell')}
              >
                PageShell
              </Button>
              <Button
                variant={activeTest === 'responsive-pageshell' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTest('responsive-pageshell')}
              >
                ResponsivePageShell
              </Button>
              <Button
                variant={activeTest === 'legacy-compatibility' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTest('legacy-compatibility')}
              >
                Legacy Compatibility
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Test Content */}
      {renderTest()}
    </div>
  );
}