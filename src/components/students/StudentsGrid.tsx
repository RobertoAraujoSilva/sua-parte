/**
 * Students Grid Component
 * 
 * Excel-like grid for viewing and editing students with inline editing,
 * filtering, sorting, and export capabilities
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useStudentsGrid, type StudentGridRow } from '@/hooks/useStudentsGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Download, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X
} from 'lucide-react';
import { toast } from 'sonner';

// Column definitions
const COLUMN_DEFINITIONS = [
  { key: 'nome', label: 'Nome', width: 200, pinned: true, editable: true, type: 'text' },
  { key: 'familia', label: 'Família', width: 150, editable: true, type: 'text' },
  { key: 'idade', label: 'Idade', width: 80, editable: true, type: 'number' },
  { key: 'genero', label: 'Gênero', width: 100, editable: true, type: 'select', 
    options: [{ value: 'masculino', label: 'Masculino' }, { value: 'feminino', label: 'Feminino' }] },
  { key: 'cargo', label: 'Cargo', width: 180, editable: true, type: 'select',
    options: [
      { value: 'anciao', label: 'Ancião' },
      { value: 'servo_ministerial', label: 'Servo Ministerial' },
      { value: 'pioneiro_regular', label: 'Pioneiro Regular' },
      { value: 'publicador_batizado', label: 'Publicador Batizado' },
      { value: 'publicador_nao_batizado', label: 'Publicador Não Batizado' },
      { value: 'estudante_novo', label: 'Estudante' }
    ] },
  { key: 'ativo', label: 'Ativo', width: 80, editable: true, type: 'boolean' },
  { key: 'email', label: 'E-mail', width: 220, editable: true, type: 'email' },
  { key: 'telefone', label: 'Telefone', width: 140, editable: true, type: 'tel' },
  { key: 'data_batismo', label: 'Batismo', width: 120, editable: true, type: 'date' },
  { key: 'data_nascimento', label: 'Nascimento', width: 120, editable: true, type: 'date' },
  { key: 'estado_civil', label: 'Estado Civil', width: 130, editable: true, type: 'select',
    options: [
      { value: 'solteiro', label: 'Solteiro(a)' },
      { value: 'casado', label: 'Casado(a)' },
      { value: 'viuvo', label: 'Viúvo(a)' },
      { value: 'desconhecido', label: 'Não informado' }
    ] },
  { key: 'papel_familiar', label: 'Papel Familiar', width: 140, editable: true, type: 'select',
    options: [
      { value: 'pai', label: 'Pai' },
      { value: 'mae', label: 'Mãe' },
      { value: 'filho', label: 'Filho' },
      { value: 'filha', label: 'Filha' },
      { value: 'filho_adulto', label: 'Filho (adulto)' },
      { value: 'filha_adulta', label: 'Filha (adulta)' }
    ] },
  { key: 'pai_nome', label: 'Pai', width: 150, editable: true, type: 'text' },
  { key: 'mae_nome', label: 'Mãe', width: 150, editable: true, type: 'text' },
  { key: 'conjuge_nome', label: 'Cônjuge', width: 150, editable: true, type: 'text' },
  { key: 'menor', label: 'Menor', width: 80, editable: false, type: 'boolean' },
  { key: 'coabitacao', label: 'Coabitação', width: 100, editable: true, type: 'boolean' },
  { key: 'responsavel_primario_nome', label: 'Resp. Primário', width: 150, editable: false, type: 'text' },
  { key: 'reading', label: 'Leitura', width: 80, editable: true, type: 'boolean' },
  { key: 'starting', label: 'Início', width: 80, editable: true, type: 'boolean' },
  { key: 'following', label: 'Retorno', width: 80, editable: true, type: 'boolean' },
  { key: 'making', label: 'Estudo', width: 80, editable: true, type: 'boolean' },
  { key: 'explaining', label: 'Exp. Crenças', width: 100, editable: true, type: 'boolean' },
  { key: 'talk', label: 'Discurso 1', width: 90, editable: true, type: 'boolean' },
  { key: 'observacoes', label: 'Observações', width: 280, editable: true, type: 'textarea' }
];

interface EditableCellProps {
  value: any;
  column: typeof COLUMN_DEFINITIONS[0];
  onSave: (value: any) => Promise<boolean>;
  isUpdating: boolean;
}

function EditableCell({ value, column, onSave, isUpdating }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    if (editValue !== value) {
      const success = await onSave(editValue);
      if (success) {
        setIsEditing(false);
      } else {
        setEditValue(value); // Reset on failure
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (!column.editable) {
    // Read-only cell
    if (column.type === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Sim' : 'Não'}
        </Badge>
      );
    }
    return <span className="text-sm">{value || '-'}</span>;
  }

  if (isEditing) {
    if (column.type === 'select') {
      return (
        <Select value={editValue || ''} onValueChange={setEditValue}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Selecionar...</SelectItem>
            {column.options?.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else if (column.type === 'boolean') {
      return (
        <Select value={editValue?.toString() || 'false'} onValueChange={(v) => setEditValue(v === 'true')}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Sim</SelectItem>
            <SelectItem value="false">Não</SelectItem>
          </SelectContent>
        </Select>
      );
    } else {
      return (
        <Input
          value={editValue || ''}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-8 text-xs"
          type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
          autoFocus
          disabled={isUpdating}
        />
      );
    }
  }

  // Display mode
  const displayValue = () => {
    if (column.type === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Sim' : 'Não'}
        </Badge>
      );
    } else if (column.type === 'select' && column.options) {
      const option = column.options.find(opt => opt.value === value);
      return option?.label || value || '-';
    } else if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString('pt-BR');
    }
    return value || '-';
  };

  return (
    <div 
      className="cursor-pointer hover:bg-muted/50 p-1 rounded text-sm min-h-[24px] flex items-center"
      onClick={() => setIsEditing(true)}
    >
      {displayValue()}
    </div>
  );
}

export function StudentsGrid() {
  const {
    rows,
    totalCount,
    isLoading,
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    filters,
    setFilters,
    clearFilters,
    sort,
    setSort,
    updateCell,
    isUpdating,
    exportData
  } = useStudentsGrid();

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(COLUMN_DEFINITIONS.slice(0, 12).map(col => col.key)) // Show first 12 columns by default
  );

  const visibleColumnDefs = useMemo(() => 
    COLUMN_DEFINITIONS.filter(col => visibleColumns.has(col.key)),
    [visibleColumns]
  );

  const handleSort = useCallback((field: string) => {
    if (sort?.field === field) {
      if (sort.direction === 'asc') {
        setSort({ field, direction: 'desc' });
      } else {
        setSort(null);
      }
    } else {
      setSort({ field, direction: 'asc' });
    }
  }, [sort, setSort]);

  const handleExport = useCallback(() => {
    const data = exportData();
    const csv = [
      // Header
      visibleColumnDefs.map(col => col.label).join(','),
      // Rows
      ...data.map(row => 
        visibleColumnDefs.map(col => {
          const value = (row as any)[col.key];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `estudantes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('Planilha exportada com sucesso');
  }, [exportData, visibleColumnDefs]);

  const getSortIcon = (field: string) => {
    if (sort?.field !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sort.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Planilha de Estudantes</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Planilha de Estudantes
                <Badge variant="secondary">{totalCount} estudantes</Badge>
              </CardTitle>
              <CardDescription>
                Visualização e edição em formato planilha
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Colunas
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mostrar/Ocultar Colunas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {COLUMN_DEFINITIONS.map(col => (
                    <DropdownMenuCheckboxItem
                      key={col.key}
                      checked={visibleColumns.has(col.key)}
                      onCheckedChange={(checked) => {
                        const newVisible = new Set(visibleColumns);
                        if (checked) {
                          newVisible.add(col.key);
                        } else {
                          newVisible.delete(col.key);
                        }
                        setVisibleColumns(newVisible);
                      }}
                    >
                      {col.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou família..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="w-64"
              />
            </div>
            
            <Select value={filters.cargo || ''} onValueChange={(value) => setFilters({ cargo: value || undefined })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="anciao">Ancião</SelectItem>
                <SelectItem value="servo_ministerial">Servo Ministerial</SelectItem>
                <SelectItem value="pioneiro_regular">Pioneiro Regular</SelectItem>
                <SelectItem value="publicador_batizado">Publicador Batizado</SelectItem>
                <SelectItem value="publicador_nao_batizado">Publicador Não Batizado</SelectItem>
                <SelectItem value="estudante_novo">Estudante</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.genero || ''} onValueChange={(value) => setFilters({ genero: value || undefined })}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.ativo?.toString() || ''} 
              onValueChange={(value) => setFilters({ ativo: value ? value === 'true' : undefined })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  {visibleColumnDefs.map(col => (
                    <TableHead 
                      key={col.key}
                      className={`${col.pinned ? 'sticky left-0 bg-background z-20' : ''} cursor-pointer hover:bg-muted/50`}
                      style={{ width: col.width }}
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {getSortIcon(col.key)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id}>
                    {visibleColumnDefs.map(col => (
                      <TableCell 
                        key={col.key}
                        className={col.pinned ? 'sticky left-0 bg-background' : ''}
                        style={{ width: col.width }}
                      >
                        <EditableCell
                          value={(row as any)[col.key]}
                          column={col}
                          onSave={(value) => updateCell(row.id, col.key, value)}
                          isUpdating={isUpdating}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Mostrando {page * pageSize + 1} a {Math.min((page + 1) * pageSize, totalCount)} de {totalCount} estudantes</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 py-1 text-sm">
                  {page + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}