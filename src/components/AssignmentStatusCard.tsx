import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Calendar,
  Zap,
  Eye
} from 'lucide-react';

interface AssignmentStatusCardProps {
  program: {
    id: string | number;
    semana: string;
    arquivo: string;
    status: string;
    designacoesGeradas: boolean;
    partes: string[];
    dataImportacao: string;
  };
  onGenerateAssignments: (program: any) => void;
  onViewAssignments: () => void;
  isGenerating?: boolean;
  isCurrentlyGenerating?: boolean;
}

export const AssignmentStatusCard: React.FC<AssignmentStatusCardProps> = ({
  program,
  onGenerateAssignments,
  onViewAssignments,
  isGenerating = false,
  isCurrentlyGenerating = false
}) => {
  const getStatusIcon = () => {
    if (isCurrentlyGenerating) {
      return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-jw-blue" />;
    }
    
    if (program.designacoesGeradas) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusText = () => {
    if (isCurrentlyGenerating) {
      return 'Gerando Designações...';
    }
    
    if (program.designacoesGeradas) {
      return 'Designações Geradas';
    }
    
    return 'Aguardando Designações';
  };

  const getStatusColor = () => {
    if (isCurrentlyGenerating) {
      return 'bg-blue-100 text-blue-800';
    }
    
    if (program.designacoesGeradas) {
      return 'bg-green-100 text-green-800';
    }
    
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <Card className="border-l-4 border-l-jw-blue hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-jw-blue" />
              {program.semana}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Importado em {new Date(program.dataImportacao).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Badge className={getStatusColor()}>
            {program.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Program Information */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Arquivo:</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {program.arquivo}
          </p>
        </div>

        {/* Program Parts */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">
            Partes do Programa ({program.partes.length}):
          </h4>
          <div className="space-y-1">
            {program.partes.map((parte, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-jw-blue rounded-full mr-2 flex-shrink-0"></div>
                <span>{parte}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Status */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium text-gray-700">Status das Designações:</span>
            </div>
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {!program.designacoesGeradas && !isCurrentlyGenerating && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => onGenerateAssignments(program)}
                disabled={isGenerating}
                className="bg-jw-blue hover:bg-jw-blue-dark"
              >
                <Zap className="w-4 h-4 mr-1" />
                Gerar Designações
              </Button>
            )}

            {isCurrentlyGenerating && (
              <Button 
                variant="outline" 
                size="sm"
                disabled
                className="cursor-not-allowed"
              >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2" />
                Gerando...
              </Button>
            )}

            {program.designacoesGeradas && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onViewAssignments}
              >
                <Users className="w-4 h-4 mr-1" />
                Ver Designações
              </Button>
            )}

            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              Visualizar
            </Button>
          </div>
        </div>

        {/* Assignment Statistics (if generated) */}
        {program.designacoesGeradas && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Designações Criadas com Sucesso
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">Partes Designadas:</span>
                <span className="font-medium ml-1">{program.partes.length}</span>
              </div>
              <div>
                <span className="text-green-700">Status:</span>
                <span className="font-medium ml-1">Confirmado</span>
              </div>
            </div>
          </div>
        )}

        {/* Generation Instructions (if pending) */}
        {!program.designacoesGeradas && !isCurrentlyGenerating && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">
                  Pronto para Gerar Designações
                </p>
                <p className="text-yellow-700">
                  Clique em "Gerar Designações" para criar automaticamente as 
                  designações seguindo as diretrizes organizacionais e qualificações dos estudantes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
