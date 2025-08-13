import { useState, useCallback, useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, CellValueChangedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw } from 'lucide-react';
import { EstudanteWithParent } from '@/types/estudantes';

interface StudentsSpreadsheetProps {
  estudantes: EstudanteWithParent[];
  onRefresh: () => void;
}

const StudentsSpreadsheet = ({ estudantes, onRefresh }: StudentsSpreadsheetProps) => {
  const [loading, setLoading] = useState(false);
  const [gridApi, setGridApi] = useState<any>(null);
  const [rowData, setRowData] = useState<EstudanteWithParent[]>([]);

  // Update row data when estudantes prop changes
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
      headerName: 'Idade',
      field: 'idade',
      editable: true,
      width: 70,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 0, max: 120 }
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
      headerName: 'Email',
      field: 'email',
      editable: true,
      flex: 2,
      minWidth: 200
    },
    {
      headerName: 'Telefone',
      field: 'telefone',
      editable: true,
      flex: 1,
      minWidth: 130
    },
    {
      headerName: 'Cargo',
      field: 'cargo',
      editable: true,
      flex: 2,
      minWidth: 160,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [
          'estudante_novo',
          'publicador_nao_batizado',
          'publicador_batizado',
          'pioneiro_regular',
          'pioneiro_especial',
          'servo_ministerial',
          'anciao'
        ]
      },
      valueFormatter: (params) => {
        const labels: Record<string, string> = {
          'estudante_novo': 'Est. Novo',
          'publicador_nao_batizado': 'Pub. Não Bat.',
          'publicador_batizado': 'Pub. Batizado',
          'pioneiro_regular': 'Pioneiro Reg.',
          'pioneiro_especial': 'Pioneiro Esp.',
          'servo_ministerial': 'Servo Min.',
          'anciao': 'Ancião'
        };
        return labels[params.value] || params.value;
      }
    },
    {
      headerName: 'Data Batismo',
      field: 'data_batismo',
      editable: true,
      width: 130,
      cellEditor: 'agDateCellEditor',
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('pt-BR');
      }
    },
    {
      headerName: 'Estado Civil',
      field: 'estado_civil',
      editable: true,
      width: 120,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['solteiro', 'casado', 'divorciado', 'viuvo', 'desconhecido']
      },
      valueFormatter: (params) => {
        const labels: Record<string, string> = {
          'solteiro': 'Solteiro(a)',
          'casado': 'Casado(a)',
          'divorciado': 'Divorciado(a)',
          'viuvo': 'Viúvo(a)',
          'desconhecido': 'Não informado'
        };
        return labels[params.value] || params.value;
      }
    },
    {
      headerName: 'Ativo',
      field: 'ativo',
      editable: true,
      width: 80,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] },
      valueFormatter: (params) => params.value ? '✓ Sim' : '✗ Não',
      cellStyle: (params) => ({
        color: params.value ? '#16a34a' : '#dc2626',
        fontWeight: 'bold',
        textAlign: 'center'
      })
    },
    {
      headerName: 'Observações',
      field: 'observacoes',
      editable: true,
      flex: 3,
      minWidth: 250,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorParams: {
        maxLength: 500,
        rows: 3,
        cols: 50
      },
      wrapText: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.3' }
    }
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    suppressMenu: false,
    wrapText: true,
    autoHeight: false
  }), []);

  const getRowHeight = useCallback((params: any) => {
    const obs = params.data?.observacoes || '';
    return obs.length > 80 ? 60 : 40;
  }, []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    // First auto-size columns based on content
    params.api.autoSizeAllColumns();
    // Then fit to available space
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 200);
  }, []);

  const onCellValueChanged = useCallback(async (event: CellValueChangedEvent) => {
    const { data, colDef, newValue, oldValue } = event;
    
    if (newValue === oldValue) return;

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
        title: "Dados atualizados",
        description: `${colDef.headerName} de ${data.nome} foi atualizado com sucesso.`,
      });

    } catch (error) {
      console.error('Erro ao atualizar estudante:', error);
      
      // Reverter o valor na grid
      event.node.setDataValue(colDef.field!, oldValue);
      
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveAll = async () => {
    if (!gridApi) return;

    try {
      setLoading(true);
      
      const allData: any[] = [];
      gridApi.forEachNode((node: any) => {
        if (node.data) {
          allData.push(node.data);
        }
      });

      // Batch update all students
      const updates = allData.map(student => ({
        id: student.id,
        nome: student.nome,
        idade: student.idade,
        genero: student.genero,
        email: student.email,
        telefone: student.telefone,
        cargo: student.cargo,
        data_batismo: student.data_batismo,
        ativo: student.ativo,
        observacoes: student.observacoes
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('estudantes')
          .update(update)
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Dados salvos",
        description: `${updates.length} estudantes foram atualizados com sucesso.`,
      });

      onRefresh();

    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar todas as alterações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    onRefresh();
    toast({
      title: "Dados atualizados",
      description: "A planilha foi atualizada com os dados mais recentes.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Planilha de Estudantes</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveAll}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Tudo
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="ag-theme-alpine" style={{ height: '75vh', width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
            animateRows={true}
            enableRangeSelection={true}
            enableFillHandle={true}
            undoRedoCellEditing={true}
            undoRedoCellEditingLimit={20}
            stopEditingWhenCellsLoseFocus={true}
            suppressRowClickSelection={true}
            rowSelection="multiple"
            pagination={true}
            paginationPageSize={25}
            loading={loading}
            getRowHeight={getRowHeight}
            headerHeight={48}
            suppressHorizontalScroll={false}
          />
        </div>
        {rowData.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum estudante encontrado. Verifique se há dados cadastrados.</p>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-600">
          <p>💡 <strong>Dicas:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Clique duplo em uma célula para editá-la</li>
            <li>Use Tab para navegar entre células</li>
            <li>As alterações são salvas automaticamente</li>
            <li>Use Ctrl+Z para desfazer alterações</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsSpreadsheet;