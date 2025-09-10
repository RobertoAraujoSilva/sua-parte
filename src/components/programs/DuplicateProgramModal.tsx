import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DuplicateProgramModalProps {
  open: boolean;
  onClose: () => void;
  mesApostila?: string | null;
  semana?: string | null;
  isProcessing?: boolean;
  onUpdate: () => void | Promise<void>;
  onUpdateAndGenerate: () => void | Promise<void>;
}

export default function DuplicateProgramModal({
  open,
  onClose,
  mesApostila,
  semana,
  isProcessing = false,
  onUpdate,
  onUpdateAndGenerate,
}: DuplicateProgramModalProps) {
  const label = mesApostila || semana || 'este período';

  return (
    <Dialog open={open} onOpenChange={(v) => !isProcessing && (!v ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programa duplicado detectado</DialogTitle>
          <DialogDescription>
            Já existe um programa para "{label}". Você deseja atualizar o existente com o novo PDF?
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-muted-foreground">
          - Atualizar: substitui partes, semana e arquivo, mantendo o status de aprovação.
          <br />
          - Atualizar e Gerar: atualiza e inicia a geração de designações imediatamente.
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button onClick={onUpdate} disabled={isProcessing}>
            {isProcessing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button variant="hero" onClick={onUpdateAndGenerate} disabled={isProcessing}>
            {isProcessing ? 'Processando...' : 'Atualizar e Gerar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

