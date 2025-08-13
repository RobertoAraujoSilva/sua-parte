/**
 * Students AG Grid Component
 * 
 * Excel-like grid using AG Grid Community for advanced features
 */

"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, Settings } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent, CellValueChangedEvent } from "ag-grid-community";
import { toast } from 'sonner';

// Import AG Grid styles
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const PAGE_SIZE = 100;

interface StudentsGridAGProps {
  className?: string;
}

export function StudentsGridAG({ className }: StudentsGridAGProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<AgGridReact>(null);

  // Column definitions
  const columns = useMemo<ColDef[]>(() => [
    { field: "nome", headerName: "Nome", editable: true, pinned: "left", minWidth: 180, filter: true },
    { field: "familia", headerName: "Família", editable: true, minWidth: 120, filter: true },
    { field: "genero", headerName: "Gênero", editable: true, minWidth: 110, 
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['masculino', 'feminino']
      }
    },
    { field: "idade", headerName: "Idade", editable: true, minWidth: 90, type: "rightAligned", filter: 'agNumberColumnFilter' },
    { field: "cargo", headerName: "Cargo", editable: true, minWidth: 150,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['anciao', 'servo_ministerial', 'pioneiro_regular', 'publicador_batizado', 'publicador_nao_batizado', 'estudante_novo']
      }
    },
    { field: "ativo", headerName: "Ativo", editable: true, minWidth: 90, 
      cellRenderer: (params: any) => params.value ? '✅ Sim' : '❌ Não',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [true, false],
        valueListGap: 0,
        valueListMaxHeight: 50
      }
    },
    { field: "email", headerName: "E-mail", editable: true, minWidth: 220, filter: true },
    { field: "telefone", headerName: "Telefone", editable: true, minWidth: 160 },
    { field: "data_batismo", headerName: "Batismo", editable: true, minWidth: 140, 
      cellEditor: 'agDateCellEditor' },
    { field: "data_nascimento", headerName: "Nascimento", editable: true, minWidth: 140, 
      cellEditor: 'agDateCellEditor' },
    { field: "estado_civil", headerName: "Estado Civil", editable: true, minWidth: 130,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['solteiro', 'casado', 'viuvo', 'desconhecido']
      }
    },
    { field: "papel_familiar", headerName: "Papel Familiar", editable: true, minWidth: 140,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['pai', 'mae', 'filho', 'filha', 'filho_adulto', 'filha_adulta']
      }
    },
    { field: "pai_nome", headerName: "Pai", editable: true, minWidth: 150 },
    { field: "mae_nome", headerName: "Mãe", editable: true, minWidth: 150 },
    { field: "conjuge_nome", headerName: "Cônjuge", editable: true, minWidth: 150 },
    { field: "menor", headerName: "Menor", editable: false, minWidth: 80,
      cellRenderer: (params: any) => params.value ? '👶 Sim' : '👤 Não'
    },
    { field: "coabitacao", headerName: "Coabitação", editable: true, minWidth: 100,
      cellRenderer: (params: any) => params.value ? '🏠 Sim' : '🏠 Não',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [true, false]
      }
    },
    { field: "responsavel_primario_nome", headerName: "Resp. Primário", editable: false, minWidth: 150 },
    // S-38-T Qualification columns
    { field: "reading", headerName: "📖 Leitura", editable: true, minWidth: 110,
      cellRenderer: (params: any) => params.value ? '✅' : '❌',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] }
    },
    { field: "starting", headerName: "🗣️ Início", editable: true, minWidth: 110,
      cellRenderer: (params: any) => params.value ? '✅' : '❌',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] }
    },
    { field: "following", headerName: "🔄 Retorno", editable: true, minWidth: 110,
      cellRenderer: (params: any) => params.value ? '✅' : '❌',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] }
    },
    { field: "making", headerName: "📚 Estudo", editable: true, minWidth: 110,
      cellRenderer: (params: any) => params.value ? '✅' : '❌',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] }
    },
    { field: "explaining", headerName: "💬 Exp. Crenças", editable: true, minWidth: 140,
      cellRenderer: (params: any) => params.value ? '✅' : '❌',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] }
    },
    { field: "talk", headerName: "🎤 Discurso 1", editable: true, minWidth: 120,
      cellRenderer: (params: any) => params.value ? '✅' : '❌',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] }
    },
    { field: "observacoes", headerName: "Observações", editable: true, minWidth: 280, 
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true
    }
  ], []);

  // Load data from flattened view
  const loadData = useCallback(async (reset = false) => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const query = (supabase as any)
        .from("vw_estudantes_grid")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("nome", { ascending: true });

      // Apply search filter
      if (search.trim()) {
        query.or(`nome.ilike.%${search}%,email.ilike.%${search}%,familia.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error loading grid data:', error);
        toast.error('Erro ao carregar dados da planilha');
        return;
      }

      setRows(data || []);
      setTotal(count || 0);
      
      console.log(`✅ Loaded ${data?.length || 0} students for grid`);
      
    } catch (error) {
      console.error('Exception loading grid data:', error);
      toast.error('Erro ao carregar dados da planilha');
    } finally {
      setLoading(false);
    }
  }, [user?.id, search]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Handle cell value changes (inline editing)
  const onCellValueChanged = useCallback(async (event: CellValueChangedEvent) => {
    const { data: row, colDef, newValue, oldValue } = event;
    const field = colDef.field!;
    
    if (newValue === oldValue) return; // No change
    
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      let updateData: any = {};

      // Handle family relationship name fields (convert names to IDs)
      if (field === 'pai_nome') {
        if (newValue && newValue.trim()) {
          const { data: pai } = await (supabase as any).rpc('find_student_by_name', {
            search_name: newValue.trim(),
            current_user_id: user.id
          });
          updateData.id_pai = pai;
          if (!pai) {
            toast.warning(`Pai "${newValue}" não encontrado. Campo salvo como texto.`);
          }
        } else {
          updateData.id_pai = null;
        }
      } else if (field === 'mae_nome') {
        if (newValue && newValue.trim()) {
          const { data: mae } = await (supabase as any).rpc('find_student_by_name', {
            search_name: newValue.trim(),
            current_user_id: user.id
          });
          updateData.id_mae = mae;
          if (!mae) {
            toast.warning(`Mãe "${newValue}" não encontrada. Campo salvo como texto.`);
          }
        } else {
          updateData.id_mae = null;
        }
      } else if (field === 'conjuge_nome') {
        if (newValue && newValue.trim()) {
          const { data: conjuge } = await (supabase as any).rpc('find_student_by_name', {
            search_name: newValue.trim(),
            current_user_id: user.id
          });
          updateData.id_conjuge = conjuge;
          if (!conjuge) {
            toast.warning(`Cônjuge "${newValue}" não encontrado. Campo salvo como texto.`);
          }
        } else {
          updateData.id_conjuge = null;
        }
      } else {
        // Direct field update
        updateData[field] = newValue;
      }

      // Update in database
      const { error } = await (supabase as any)
        .from('estudantes')
        .update(updateData)
        .eq('id', row.id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Campo atualizado com sucesso');
      
    } catch (error) {
      console.error('Error updating cell:', error);
      toast.error('Erro ao atualizar campo');
      
      // Revert the change in the grid
      event.node.setDataValue(field, oldValue);
    }
  }, [user?.id]);

  // Export CSV
  const exportCsv = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({ 
        fileName: `estudantes_${new Date().toISOString().split('T')[0]}.csv`,
        columnSeparator: ','
      });
      toast.success('Planilha exportada com sucesso');
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(() => {
    loadData(true);
  }, [loadData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                📊 Planilha de Estudantes
                <Badge variant="secondary">{total} estudantes</Badge>
              </CardTitle>
              <CardDescription>
                Visualização e edição em formato Excel • Clique nas células para editar
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => loadData(true)} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Search */}
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Buscar por nome, email ou família..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="max-w-sm"
            />
            <Button variant="secondary" onClick={handleSearch} disabled={loading}>
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AG Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="ag-theme-quartz w-full" style={{ height: 600 }}>
            <AgGridReact
              ref={gridRef}
              rowData={rows}
              columnDefs={columns}
              onCellValueChanged={onCellValueChanged}
              animateRows
              enableCellTextSelection
              rowSelection="single"
              suppressRowClickSelection
              pagination={false} // We handle pagination manually
              domLayout="normal"
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
                editable: false // Override per column
              }}
              suppressMenuHide
              enableRangeSelection
              enableFillHandle
              undoRedoCellEditing
              undoRedoCellEditingLimit={20}
              stopEditingWhenCellsLoseFocus
              enterNavigatesVertically
              enterNavigatesVerticallyAfterEdit
              suppressClickEdit={false}
              singleClickEdit={true}
              loadingOverlayComponent={() => (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            />
          </div>

          {/* Footer with stats */}
          <div className="flex items-center justify-between p-4 border-t bg-muted/30">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Total: <strong>{total}</strong> estudantes</span>
              <span>Exibindo: <strong>{rows.length}</strong> linhas</span>
              {loading && (
                <span className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                  Carregando...
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>💡 Dica: Clique nas células para editar • Use Tab/Enter para navegar</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}