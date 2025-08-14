import React, { useState } from 'react';
import { ResponsiveTableWrapper, ResponsiveTable } from '@/components/layout/ResponsiveTableWrapper';
import { EnhancedResponsiveTable, ResponsiveTableColumn } from '@/components/ui/enhanced-responsive-table';
import { useResponsiveTable, calculateTableHeight } from '@/hooks/use-responsive-table';
import { useResponsive } from '@/hooks/use-responsive';

/**
 * Test component to verify all task requirements are implemented:
 * 
 * ✅ Implement table container with calculated height using CSS variables
 * ✅ Add height calculation: calc(100svh - var(--toolbar-h) - var(--footer-h) - gutters)
 * ✅ Configure overflow handling (vertical auto, horizontal as needed)
 * ✅ Integrate density system for row heights and cell padding
 * ✅ Add support for different breakpoints with responsive height adjustments
 * ✅ Requirements: 2.1, 2.2, 5.1, 5.2, 6.2
 */
export function ResponsiveTableWrapperTest() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { 
    density, 
    toggleDensity, 
    tableHeight, 
    getRowHeight, 
    getCellPadding,
    getTableStyles 
  } = useResponsiveTable();

  const [testData] = useState(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      nome: `Pessoa ${i + 1}`,
      idade: 20 + (i % 50),
      cargo: ['Ancião', 'Servo Ministerial', 'Pioneira Regular', 'Publicadora'][i % 4],
      email: `pessoa${i + 1}@example.com`,
      telefone: `(11) ${String(i + 1).padStart(5, '0')}-${String(i + 1).padStart(4, '0')}`,
      ativo: i % 3 !== 0,
    }))
  );

  const columns: ResponsiveTableColumn[] = [
    { key: 'nome', label: 'Nome', minWidth: 200, sticky: true, sortable: true },
    { key: 'idade', label: 'Idade', minWidth: 80, sortable: true },
    { key: 'cargo', label: 'Cargo', minWidth: 150, sortable: true },
    { key: 'email', label: 'Email', minWidth: 200 },
    { key: 'telefone', label: 'Telefone', minWidth: 130 },
    {
      key: 'ativo',
      label: 'Status',
      minWidth: 100,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  // Test height calculations for different scenarios
  const heightTests = {
    default: calculateTableHeight(),
    compact: calculateTableHeight({ density: 'compact' }),
    comfortable: calculateTableHeight({ density: 'comfortable' }),
    mobile: calculateTableHeight({ isMobile: true }),
    tablet: calculateTableHeight({ isTablet: true }),
    customOffset: calculateTableHeight({ customOffset: '20px' }),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Teste do ResponsiveTableWrapper</h1>
        
        {/* Test Information Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
          <div>
            <h3 className="font-semibold text-sm">Breakpoint Atual</h3>
            <p className="text-xs text-muted-foreground">
              {isMobile ? 'Mobile' : isTablet ? 'Tablet' : isDesktop ? 'Desktop' : 'Unknown'}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm">Densidade</h3>
            <p className="text-xs text-muted-foreground">
              {density} ({getRowHeight()})
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm">Altura Calculada</h3>
            <p className="text-xs text-muted-foreground font-mono">
              {tableHeight}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm">Padding das Células</h3>
            <p className="text-xs text-muted-foreground">
              {getCellPadding()}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm">CSS Variables</h3>
            <p className="text-xs text-muted-foreground">
              --row-h: {getRowHeight()}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm">Registros de Teste</h3>
            <p className="text-xs text-muted-foreground">
              {testData.length} itens
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={toggleDensity}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Alternar Densidade ({density})
          </button>
        </div>
      </div>

      {/* Test 1: Enhanced Responsive Table */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Teste 1: EnhancedResponsiveTable</h2>
        <p className="text-sm text-muted-foreground">
          Tabela completa com todas as funcionalidades integradas
        </p>
        
        <EnhancedResponsiveTable
          data={testData}
          columns={columns}
          density={density}
          onRowClick={(row) => console.log('Row clicked:', row)}
          onSort={(col, dir) => console.log('Sort:', col, dir)}
          emptyMessage="Nenhum dado de teste encontrado"
        />
      </div>

      {/* Test 2: Direct ResponsiveTableWrapper Usage */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Teste 2: ResponsiveTableWrapper Direto</h2>
        <p className="text-sm text-muted-foreground">
          Uso direto do wrapper com conteúdo personalizado
        </p>
        
        <ResponsiveTableWrapper
          density={density}
          className="border border-border/20 rounded-lg"
        >
          <div className="p-4 space-y-4">
            <h3 className="font-medium">Conteúdo Personalizado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testData.slice(0, 10).map((item) => (
                <div key={item.id} className="p-3 bg-muted/30 rounded-md">
                  <div className="font-medium">{item.nome}</div>
                  <div className="text-sm text-muted-foreground">{item.cargo}</div>
                  <div className="text-xs text-muted-foreground">{item.email}</div>
                </div>
              ))}
            </div>
          </div>
        </ResponsiveTableWrapper>
      </div>

      {/* Test 3: Height Calculation Tests */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Teste 3: Cálculos de Altura</h2>
        <p className="text-sm text-muted-foreground">
          Verificação dos diferentes cálculos de altura
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/10 rounded-lg">
          {Object.entries(heightTests).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="font-medium text-sm capitalize">{key}</div>
              <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test 4: Overflow Behavior Test */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Teste 4: Comportamento de Overflow</h2>
        <p className="text-sm text-muted-foreground">
          Teste de scroll vertical e horizontal
        </p>
        
        <ResponsiveTableWrapper
          height="200px"
          density={density}
          className="border border-border/20 rounded-lg"
        >
          <table className="w-full min-w-[800px] density-table">
            <thead>
              <tr>
                <th className="sticky top-0 bg-muted/50 p-2 text-left">Nome (Largo)</th>
                <th className="sticky top-0 bg-muted/50 p-2 text-left">Coluna Extra 1</th>
                <th className="sticky top-0 bg-muted/50 p-2 text-left">Coluna Extra 2</th>
                <th className="sticky top-0 bg-muted/50 p-2 text-left">Coluna Extra 3</th>
                <th className="sticky top-0 bg-muted/50 p-2 text-left">Coluna Extra 4</th>
              </tr>
            </thead>
            <tbody>
              {testData.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20">
                  <td className="p-2 border-b border-border/10">{item.nome}</td>
                  <td className="p-2 border-b border-border/10">{item.cargo}</td>
                  <td className="p-2 border-b border-border/10">{item.email}</td>
                  <td className="p-2 border-b border-border/10">{item.telefone}</td>
                  <td className="p-2 border-b border-border/10">
                    {item.ativo ? 'Ativo' : 'Inativo'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTableWrapper>
      </div>

      {/* Debug Information */}
      <details className="space-y-2">
        <summary className="text-lg font-semibold cursor-pointer">
          Debug: Estilos CSS Aplicados
        </summary>
        <div className="p-4 bg-muted/10 rounded-lg">
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(getTableStyles(), null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}

export default ResponsiveTableWrapperTest;