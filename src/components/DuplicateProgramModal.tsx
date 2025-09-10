import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DuplicateProgramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingProgram: any;
  onConfirm: (action: 'update' | 'updateAndGenerate') => void;
  onCancel: () => void;
}

export const DuplicateProgramModal: React.FC<DuplicateProgramModalProps> = ({
  open,
  onOpenChange,
  existingProgram,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Programa Duplicado Encontrado
          </DialogTitle>
          <DialogDescription>
            Já existe um programa para a semana de <strong>{existingProgram?.data_inicio_semana}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              Você pode atualizar o programa existente ou atualizar e gerar novas designações.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => onConfirm('update')}
              variant="outline"
              className="w-full justify-start"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Programa
            </Button>
            
            <Button
              onClick={() => onConfirm('updateAndGenerate')}
              variant="hero"
              className="w-full justify-start"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar e Gerar Designações
            </Button>
            
            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};