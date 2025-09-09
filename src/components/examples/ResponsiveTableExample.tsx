import React from 'react';
import { ResponsiveTableWrapper } from '@/components/layout/ResponsiveTableWrapper';
import { EnhancedResponsiveTable, ResponsiveTableColumn } from '@/components/ui/enhanced-responsive-table';
import { useResponsiveTable } from '@/hooks/use-responsive-table';

// Example data
const sampleData = [
  { id: 1, nome: 'João Silva', idade: 25, cargo: 'Ancião', email: 'joao@example.com', telefone: '(11) 99999-9999', ativo: true },
  { id: 2, nome: 'Maria Santos', idade: 30, cargo: 'Pioneira Regular', email: 'maria@example.com', telefone: '(11) 88888-8888', ativo: true },
  { id: 3, nome: 'Pedro Oliveira', idade: 22, cargo: 'Servo Ministerial', email: 'pedro@example.com', telefone: '(11) 77777-7777', ativo: false },
  { id: 4, nome: 'Ana Costa', idade: 28, cargo: 'Publicadora', email: 'ana@example.com', telefone: '(11) 66666-6666', ativo: true },
  { id: 5, nome: 'Carlos Ferreira', idade: 35, cargo: 'Ancião', email: 'carlos@example.com', telefone: '(11) 55555-5555', ativo: true },
];

// Example columns configuration
const columns: ResponsiveTableColumn[] = [
  {
    key: 'nome',
    label: 'Nome',
    minWidth: 200,
    sticky: true,
    sortable: true,
  },
  {
    key: 'idade',
    label: 'Idade',
    minWidth: 80,
    sortable: true,
  },
  {
    key: 'cargo',
    label: 'Cargo',
    minWidth: 150,
    sortable: true,
  },
  {
    key: 'email',
    label: 'Email',
    minWidth: 200,
  },
  {
    key: 'telefone',
    label: 'Telefone',
    minWidth: 130,
  },
  {
    key: 'ativo',
    label: 'Status',
    minWidth: 100,
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      }`}>
        {value ? 'Ativo' : 'Inativo'}
      </span>
    ),
  },
];

/**
 * Example component demonstrating ResponsiveTableWrapper usage
 */
export function ResponsiveTableExample() {
  const { density, toggleDensity, tableHeight } = useResponsiveTable();

  const handleRowClick = (row: any) => {
    console.log('Row clicked:', row);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    console.log('Sort:', column, direction);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Exemplo de Tabela Responsiva</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Densidade:</span>
          <button
            onClick={toggleDensity}
            className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
          >
            {density === 'compact' ? 'Compacto' : 'Confortável'}
          </button>
        </div>
      </div>

      {/* Using EnhancedResponsiveTable (recommended) */}
      <EnhancedResponsiveTable
        data={sampleData}
        columns={columns}
        onRowClick={handleRowClick}
        onSort={handleSort}
        density={density}
        emptyMessage="Nenhum estudante encontrado"
      />

      {/* Alternative: Using ResponsiveTableWrapper directly */}
      <div className="mt-8">
        <h3 className="text-md font-medium mb-2">Uso Direto do ResponsiveTableWrapper</h3>
        <ResponsiveTableWrapper
          height={tableHeight}
          density={density}
          className="border border-border/20 rounded-lg"
        >
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Conteúdo personalizado dentro do wrapper responsivo.
              <br />
              Altura calculada: <code className="bg-muted px-1 rounded">{tableHeight}</code>
              <br />
              Densidade atual: <code className="bg-muted px-1 rounded">{density}</code>
            </p>
            <div className="mt-4 space-y-2">
              {sampleData.slice(0, 3).map((item) => (
                <div key={item.id} className="p-2 bg-muted/30 rounded">
                  <strong>{item.nome}</strong> - {item.cargo}
                </div>
              ))}
            </div>
          </div>
        </ResponsiveTableWrapper>
      </div>
    </div>
  );
}

export default ResponsiveTableExample;