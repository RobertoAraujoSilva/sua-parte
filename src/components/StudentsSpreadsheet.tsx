import { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load AG-Grid to reduce initial bundle size
const AgGridReact = lazy(() => import('ag-grid-react').then(module => ({ default: module.AgGridReact })));

// Lazy load AG-Grid styles
const loadAgGridStyles = () => {
  if (typeof window !== 'undefined' && !document.querySelector('[data-ag-grid-styles]')) {
    import('ag-grid-community/styles/ag-grid.css');
    import('ag-grid-community/styles/ag-theme-alpine.css');
    
    // Register modules only when needed
    import('ag-grid-community').then(({ ModuleRegistry, AllCommunityModule }) => {
      ModuleRegistry.registerModules([AllCommunityModule]);
    });
    
    // Mark as loaded
    const marker = document.createElement('meta');
    marker.setAttribute('data-ag-grid-styles', 'loaded');
    document.head.appendChild(marker);
  }
};

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw, Columns } from 'lucide-react';
import { EstudanteWithParent } from '@/types/estudantes';

interface StudentsSpreadsheetProps {
  estudantes: EstudanteWithParent[];
  onRefresh: () => void;
}

const StudentsSpreadsheet = ({ estudantes, onRefresh }: StudentsSpreadsheetProps) => {
  const [loading, setLoading] = useState(false);
  const [gridApi, setGridApi] = useState<any>(null);
  const [rowData, setRowData] = useState<EstudanteWithParent[]>([]);

  useEffect(() => {
    setRowData(estudantes || []);
    loadAgGridStyles(); // Load AG-Grid styles when component mounts
  }, [estudantes]);

  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Nome',
      field: 'nome',
      editable: true,
      flex: 2,
      minWidth: 180,
      pinned: 'left',
      cellStyle: { fontWeight: '500' }
    },
    {
      headerName: 'Família',
      field: 'familia',
      editable: true,
      width: 120
    },
    {
      headerName: 'Idade',
      field: 'idade',
      editable: true,
      width: 70,
      cellEditor: 'agNumberCellEditor'
    },
    {
      headerName: 'Gênero',
      field: 'genero',
      editable: true,
      width: 90,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['masculino', 'feminino'] },
      valueFormatter: (params) => params.value === 'masculino' ? 'M' : 'F'
    },
    {
      headerName: 'Cargo',
      field: 'cargo',
      editable: true,
      flex: 2,
      minWidth: 160
    },
    {
      headerName: 'Ativo',
      field: 'ativo',
      editable: true,
      width: 80,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] },
      valueFormatter: (params) => params.value ? '✓' : '✗'
    }
  ], []);

  const gridOptions = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true
  }), []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  }, []);

  const onCellValueChanged = useCallback(async (event: CellValueChangedEvent) => {
    const { data, colDef, newValue } = event;
    
    try {
      setLoading(true);
      const updateData: any = {};
      updateData[colDef.field!] = newValue;

      const { error } = await supabase
        .from('estudantes')
        .update(updateData)
        .eq('id', data.id);

      if (error) throw error;

      toast({
        title: "Atualizado",
        description: `${data.nome} foi atualizado.`,
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planilha de Estudantes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
          <Suspense fallback={
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          }>
            <AgGridReact
              theme="legacy"
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={gridOptions}
              onGridReady={onGridReady}
              onCellValueChanged={onCellValueChanged}
              pagination={true}
              paginationPageSize={25}
            />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsSpreadsheet;