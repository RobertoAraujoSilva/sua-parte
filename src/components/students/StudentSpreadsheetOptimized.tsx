import { useMemo } from 'react';
import { useEstudantes } from '@/hooks/useEstudantes';
import { useDensity } from '@/contexts/DensityContext';
import { ResponsiveTableWrapper } from "@/components/layout/ResponsiveTableWrapper";
import { ResponsiveTable } from "@/components/ui/responsive-table";

interface StudentSpreadsheetOptimizedProps {
  className?: string;
}

export function StudentSpreadsheetOptimized({ className = '' }: StudentSpreadsheetOptimizedProps) {
  const { estudantes, isLoading, error } = useEstudantes();
  const { density } = useDensity();

  const columns = useMemo(() => [
    { key: 'nome', label: 'Nome', minWidth: 200, sticky: true },
    { key: 'idade', label: 'Idade', minWidth: 80 },
    { key: 'genero', label: 'Gênero', minWidth: 100, render: (value) => value === 'masculino' ? 'M' : 'F' },
    { key: 'cargo', label: 'Cargo', minWidth: 150 },
    { key: 'email', label: 'Email', minWidth: 200 },
    { key: 'telefone', label: 'Telefone', minWidth: 130 },
    { key: 'data_batismo', label: 'Batismo', minWidth: 120, render: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '-' },
    { key: 'ativo', label: 'Status', minWidth: 100, render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {value ? 'Ativo' : 'Inativo'}
      </span>
    ) },
    { key: 'observacoes', label: 'Observações', minWidth: 200, render: (value) => value || '-' }
  ], []);

  if (isLoading) {
    return (
      <div className="h-full-viewport flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full-viewport flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Erro ao carregar estudantes</p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveTableWrapper className={className} density={density}>
      <ResponsiveTable 
        data={estudantes || []}
        columns={columns}
      />
    </ResponsiveTableWrapper>
  );
}