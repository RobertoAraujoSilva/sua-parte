import { useState, useCallback, useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, CellValueChangedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

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
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsSpreadsheet;