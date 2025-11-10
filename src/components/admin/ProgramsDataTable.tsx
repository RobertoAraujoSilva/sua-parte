/**
 * Data table for programs admin dashboard
 */

import React, { useState } from 'react';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { useNavigate } from 'react-router-dom';

interface ProgramsDataTableProps {
  programs: any[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: () => void;
  onDelete: (ids: string[]) => Promise<void>;
  isDeleting: boolean;
  isLoading: boolean;
}

export function ProgramsDataTable({
  programs,
  selectedIds,
  onToggleSelection,
  onToggleSelectAll,
  onDelete,
  isDeleting,
  isLoading,
}: ProgramsDataTableProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await onDelete([deleteId]);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      draft: 'outline',
      active: 'secondary',
      publicada: 'default',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status === 'draft' ? 'Rascunho' : status === 'active' ? 'Ativo' : 'Publicada'}
      </Badge>
    );
  };

  const getAssignmentBadge = (status: string) => {
    return (
      <Badge variant={status === 'pending' ? 'outline' : 'default'}>
        {status === 'pending' ? 'Pendente' : 'Concluída'}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'select',
      label: '',
      render: (program: any) => (
        <Checkbox
          checked={selectedIds.has(program.id)}
          onCheckedChange={() => onToggleSelection(program.id)}
        />
      ),
    },
    {
      key: 'semana',
      label: 'Semana',
      sortable: true,
      render: (program: any) => (
        <div>
          <div className="font-medium">{program.semana || '-'}</div>
          <div className="text-sm text-muted-foreground">{program.titulo}</div>
        </div>
      ),
    },
    {
      key: 'data_inicio_semana',
      label: 'Data',
      sortable: true,
      render: (program: any) =>
        program.data_inicio_semana
          ? format(new Date(program.data_inicio_semana), 'dd/MM/yyyy', { locale: ptBR })
          : '-',
    },
    {
      key: 'mes_apostila',
      label: 'Mês',
      render: (program: any) => program.mes_apostila || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (program: any) => getStatusBadge(program.status || 'draft'),
    },
    {
      key: 'assignment_status',
      label: 'Designação',
      render: (program: any) => getAssignmentBadge(program.assignment_status || 'pending'),
    },
    {
      key: 'created_at',
      label: 'Criado em',
      sortable: true,
      render: (program: any) =>
        program.created_at
          ? format(new Date(program.created_at), 'dd/MM/yyyy', { locale: ptBR })
          : '-',
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (program: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/programas?id=${program.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteClick(program.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* Select All Checkbox */}
        <div className="flex items-center gap-2 px-4">
          <Checkbox
            checked={selectedIds.size === programs.length && programs.length > 0}
            onCheckedChange={onToggleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            Selecionar Todos
          </span>
        </div>

        <ResponsiveTable
          data={programs}
          columns={columns}
          loading={isLoading}
          className="border rounded-lg"
        />
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        itemCount={1}
        isDeleting={isDeleting}
      />
    </>
  );
}
