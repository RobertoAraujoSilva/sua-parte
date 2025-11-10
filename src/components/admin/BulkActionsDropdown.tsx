/**
 * Bulk actions dropdown for selected programs
 */

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Trash2, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

interface BulkActionsDropdownProps {
  selectedIds: Set<string>;
  programs: any[];
  onBulkDelete: (ids: string[]) => Promise<void>;
  onExportExcel: (programs: any[]) => void;
  onExportPDF: (programs: any[]) => void;
  isDeleting: boolean;
}

export function BulkActionsDropdown({
  selectedIds,
  programs,
  onBulkDelete,
  onExportExcel,
  onExportPDF,
  isDeleting,
}: BulkActionsDropdownProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const selectedPrograms = programs.filter(p => selectedIds.has(p.id));

  const handleDelete = async () => {
    await onBulkDelete(Array.from(selectedIds));
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Ações em Massa ({selectedIds.size})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onExportExcel(selectedPrograms)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar para Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExportPDF(selectedPrograms)}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar para PDF
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Selecionados
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        itemCount={selectedIds.size}
        isDeleting={isDeleting}
      />
    </>
  );
}
