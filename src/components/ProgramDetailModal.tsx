import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  FileText, 
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';

interface ProgramDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  programa: any;
  onDownload?: (programa: any) => void;
  onViewAssignments?: (programa: any) => void;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  isOpen,
  onClose,
  programa,
  onDownload,
  onViewAssignments
}) => {
  if (!programa) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Designações Geradas":
        return "bg-green-100 text-green-800 border-green-200";
      case "Gerando Designações":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Aguardando Designações":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Designações Geradas":
        return <CheckCircle className="w-4 h-4" />;
      case "Gerando Designações":
        return <Clock className="w-4 h-4 animate-spin" />;
      case "Aguardando Designações":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-jw-blue" />
            Detalhes do Programa
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre o programa selecionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Program Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-jw-navy">
                    {programa.semana}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Semana de {new Date(programa.data_inicio_semana).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <Badge className={`${getStatusColor(programa.status)} flex items-center gap-1`}>
                  {getStatusIcon(programa.status)}
                  {programa.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Arquivo:</span>
                  <p className="text-gray-600">{programa.arquivo}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Data de Importação:</span>
                  <p className="text-gray-600">
                    {new Date(programa.dataImportacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Parts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-jw-blue" />
                Partes do Programa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {programa.partes && programa.partes.length > 0 ? (
                  programa.partes.map((parte: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-jw-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{parte}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Nenhuma parte específica definida</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Status */}
          {programa.designacoesGeradas && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Status das Designações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Designações Geradas com Sucesso</span>
                  </div>
                  <p className="text-green-700 text-sm mt-2">
                    As designações para este programa foram criadas e estão prontas para uso.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            
            <div className="flex gap-2">
              {programa.assignment_status === 'generated' && onViewAssignments && (
                <Button
                  variant="outline"
                  onClick={() => onViewAssignments(programa)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver Designações
                </Button>
              )}
              
              {programa.assignment_status === 'generated' && onDownload && (
                <Button
                  onClick={() => onDownload(programa)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
