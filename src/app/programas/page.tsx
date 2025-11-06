"use client";

// Página/Componente para Next.js (App Router) em /programas
// Mostra: Lista | Planilha | Estatísticas dos programas da congregação
// Requisitos: tailwind, shadcn/ui, lucide-react, ag-grid-react, @supabase/supabase-js

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, RefreshCw, CloudDownload, FileSpreadsheet, BarChart } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const PAGE_SIZE = 50;

export default function ProgramasPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("programasView") || "sheet" : "sheet"
  );
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const gridRef = useRef<AgGridReact>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("programasView", view);
  }, [view]);

  // Obter usuário atual
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    })();
  }, []);

  // Carregar dados dos programas
  const loadData = async (reset = false) => {
    if (!userId) return;
    setLoading(true);
    
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const q = supabase
        .from("programas")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .ilike("titulo", `%${search}%`)
        .order("data_programa", { ascending: false })
        .range(from, to);
      
      const { data, error, count } = await q;
      
      if (error) {
        console.error(error);
        toast({ title: "Erro ao carregar programas", variant: "destructive" });
      } else {
        setRows(reset ? data ?? [] : data ?? []);
        setTotal(count ?? 0);
      }
    } catch (error) {
      console.error("Exception loading data:", error);
      toast({ title: "Erro ao carregar programas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from("programas")
        .select("*")
        .eq("user_id", userId);
      
      if (error) {
        console.error(error);
        return;
      }
      
      const programs = (data ?? []) as any[];
      const totalPrograms = programs.length;
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthPrograms = programs.filter((p: any) =>
        new Date(p.data_programa) >= thisMonth
      ).length;
      
      // Estatísticas por tipo
      const typeStats = programs.reduce((acc: any, program) => {
        const type = program.tipo_programa || 'outros';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      setStats({
        total: totalPrograms,
        thisMonth: thisMonthPrograms,
        typeStats
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  useEffect(() => {
    loadData(true);
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, page]);

  // Colunas do grid
  const columns = useMemo<ColDef[]>(
    () => [
      { field: "titulo", headerName: "Título", editable: true, pinned: "left", minWidth: 250 },
      { field: "data_programa", headerName: "Data", editable: true, minWidth: 120, type: "date" },
      { field: "tipo_programa", headerName: "Tipo", editable: true, minWidth: 150 },
      { field: "tema", headerName: "Tema", editable: true, minWidth: 200 },
      { field: "orador_principal", headerName: "Orador Principal", editable: true, minWidth: 180 },
      { field: "leitor", headerName: "Leitor", editable: true, minWidth: 150 },
      { field: "primeira_oração", headerName: "1ª Oração", editable: true, minWidth: 150 },
      { field: "tesouros_palavra", headerName: "Tesouros da Palavra", editable: true, minWidth: 200 },
      { field: "faça_seu_melhor", headerName: "Faça seu Melhor", editable: true, minWidth: 200 },
      { field: "nossa_vida_cristã", headerName: "Nossa Vida Cristã", editable: true, minWidth: 200 },
      { field: "oração_final", headerName: "Oração Final", editable: true, minWidth: 150 },
      { field: "observacoes", headerName: "Observações", editable: true, minWidth: 280 },
    ],
    []
  );

  // Salvar edição
  const onCellValueChanged = async (params: any) => {
    const row = params.data as any;
    const field: string = params.colDef.field;
    const value = params.newValue;
    
    try {
      const { error } = await supabase
        .from("programas")
        .update({ [field]: value })
        .eq("id", row.id);
      
      if (error) throw error;
      
      toast({ title: "Campo atualizado com sucesso" });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao atualizar campo", variant: "destructive" });
    }
  };

  const exportCsv = () => {
    gridRef.current?.api.exportDataAsCsv({ fileName: "programas.csv" });
    toast({ title: "Planilha exportada com sucesso" });
  };

  const renderListView = () => (
    <div className="space-y-4">
      <div className="grid gap-4">
        {rows.slice(0, 10).map((program) => (
          <Card key={program.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{program.titulo}</CardTitle>
                <Badge variant="outline">
                  {new Date(program.data_programa).toLocaleDateString('pt-BR')}
                </Badge>
              </div>
              <CardDescription>
                {program.tipo_programa} • {program.tema}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Orador Principal:</span>
                  <p className="text-muted-foreground">{program.orador_principal || '-'}</p>
                </div>
                <div>
                  <span className="font-medium">Leitor:</span>
                  <p className="text-muted-foreground">{program.leitor || '-'}</p>
                </div>
                <div>
                  <span className="font-medium">1ª Oração:</span>
                  <p className="text-muted-foreground">{program.primeira_oração || '-'}</p>
                </div>
                <div>
                  <span className="font-medium">Oração Final:</span>
                  <p className="text-muted-foreground">{program.oração_final || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {rows.length > 10 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              ... e mais {rows.length - 10} programas. Use a visualização "Planilha" para ver todos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStatsView = () => {
    if (!stats) {
      return (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">programas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">programas agendados</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.typeStats).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="capitalize">{type.replace('_', ' ')}</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <CalendarDays className="h-6 w-6" />
              Gestão de Programas
            </h1>
            <p className="text-muted-foreground">
              Gerencie os programas da congregação
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadData(true)} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          {view === 'sheet' && (
            <Button onClick={exportCsv}>
              <CloudDownload className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { setPage(0); loadData(true); } }}
          className="max-w-sm"
        />
        <Button variant="secondary" onClick={() => { setPage(0); loadData(true); }} disabled={loading}>
          Buscar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="sheet" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Planilha
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sheet" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Planilha de Programas</CardTitle>
              <CardDescription>
                Visualização e edição em formato Excel. Clique nas células para editar.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  pagination
                  paginationPageSize={PAGE_SIZE}
                  domLayout="normal"
                  loading={loading}
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground">Total: {total} programas</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0 || loading}
                  >
                    Anterior
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setPage((p) => p + 1)}
                    disabled={rows.length < PAGE_SIZE || loading}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Programas</CardTitle>
              <CardDescription>
                Visualização em cards dos programas da congregação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderListView()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          {renderStatsView()}
        </TabsContent>
      </Tabs>
    </div>
  );
}