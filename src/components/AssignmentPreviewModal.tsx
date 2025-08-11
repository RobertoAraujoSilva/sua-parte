import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Clock, 
  User, 
  UserCheck, 
  Calendar,
  CheckCircle,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import type { DesignacaoGerada } from '@/types/designacoes';

interface AssignmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assignments: DesignacaoGerada[];
  programTitle: string;
  isConfirming?: boolean;
}

export const AssignmentPreviewModal: React.FC<AssignmentPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  assignments,
  programTitle,
  isConfirming = false
}) => {
  const getPartTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'leitura_biblica':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'demonstracao':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'discurso':
        return <User className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPartTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'leitura_biblica':
        return 'Leitura da Bíblia';
      case 'demonstracao':
        return 'Demonstração';
      case 'discurso':
        return 'Discurso';
      default:
        return 'Parte';
    }
  };

  const getPartTypeBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'leitura_biblica':
        return 'bg-blue-100 text-blue-800';
      case 'demonstracao':
        return 'bg-green-100 text-green-800';
      case 'discurso':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalStudentsAssigned = new Set(
    assignments.flatMap(a => [a.id_estudante, a.id_ajudante].filter(Boolean))
  ).size;

  const totalParts = assignments.length;
  const partsWithHelpers = assignments.filter(a => a.id_ajudante).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Prévia das Designações Geradas
          </DialogTitle>
          <DialogDescription>
            Revise as designações geradas para <strong>{programTitle}</strong> antes de confirmar.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Estudantes Designados</p>
                  <p className="text-2xl font-bold text-blue-600">{totalStudentsAssigned}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Partes</p>
                  <p className="text-2xl font-bold text-green-600">{totalParts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Com Ajudantes</p>
                  <p className="text-2xl font-bold text-purple-600">{partsWithHelpers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Assignments List */}
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {assignments.map((assignment, index) => (
              <Card key={index} className="border-l-4 border-l-jw-blue">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getPartTypeIcon(assignment.tipo_parte)}
                      <div>
                        <CardTitle className="text-lg">
                          Parte {assignment.numero_parte}: {assignment.titulo_parte}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPartTypeBadgeColor(assignment.tipo_parte)}>
                            {getPartTypeLabel(assignment.tipo_parte)}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-3 h-3" />
                            {assignment.tempo_minutos} min
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Main Student */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Estudante Principal</p>
                        <p className="text-sm text-blue-700">
                          {/* We'll need to fetch student names in a real implementation */}
                          ID: {assignment.id_estudante}
                        </p>
                      </div>
                    </div>

                    {/* Helper Student */}
                    {assignment.id_ajudante ? (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <UserCheck className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Ajudante</p>
                          <p className="text-sm text-green-700">
                            ID: {assignment.id_ajudante}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-600">Sem Ajudante</p>
                          <p className="text-sm text-gray-500">Parte individual</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scene/Setting */}
                  {assignment.cena && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                      <p className="text-sm">
                        <strong>Cenário:</strong> {assignment.cena}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isConfirming}
            className="bg-jw-blue hover:bg-jw-blue-dark"
          >
            {isConfirming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Designações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
