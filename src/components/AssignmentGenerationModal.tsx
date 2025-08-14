import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Settings, 
  BookOpen, 
  Brain,
  Database,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface AssignmentGenerationModalProps {
  isOpen: boolean;
  progress: number;
  currentStep: string;
  programTitle: string;
  onClose: () => void;
}

export const AssignmentGenerationModal: React.FC<AssignmentGenerationModalProps> = ({
  isOpen,
  progress,
  currentStep,
  programTitle,
  onClose
}) => {
  const getStepIcon = (step: string) => {
    if (step.includes('estudantes')) return <Users className="w-5 h-5 text-blue-600" />;
    if (step.includes('configurando') || step.includes('gerador')) return <Settings className="w-5 h-5 text-purple-600" />;
    if (step.includes('programa') || step.includes('partes')) return <BookOpen className="w-5 h-5 text-green-600" />;
    if (step.includes('gerando') || step.includes('inteligentes')) return <Brain className="w-5 h-5 text-orange-600" />;
    if (step.includes('salvando') || step.includes('banco')) return <Database className="w-5 h-5 text-indigo-600" />;
    if (step.includes('sucesso') || progress === 100) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />;
  };

  const getProgressColor = () => {
    if (progress === 100) return 'bg-green-600';
    if (progress >= 80) return 'bg-blue-600';
    if (progress >= 60) return 'bg-purple-600';
    if (progress >= 40) return 'bg-orange-600';
    if (progress >= 20) return 'bg-yellow-600';
    return 'bg-gray-600';
  };

  const steps = [
    { threshold: 10, label: 'Carregando estudantes ativos', icon: Users },
    { threshold: 25, label: 'Configurando gerador de designações', icon: Settings },
    { threshold: 40, label: 'Analisando partes do programa', icon: BookOpen },
    { threshold: 60, label: 'Gerando designações inteligentes', icon: Brain },
    { threshold: 80, label: 'Salvando no banco de dados', icon: Database },
    { threshold: 100, label: 'Concluído com sucesso', icon: CheckCircle }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-jw-blue" />
            Gerando Designações
          </DialogTitle>
          <DialogDescription>
            Criando designações inteligentes para <strong>{programTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progresso</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-3"
              style={{
                background: `linear-gradient(to right, ${getProgressColor()} ${progress}%, #e5e7eb ${progress}%)`
              }}
            />
          </div>

          {/* Current Step */}
          <Card className="border-l-4 border-l-jw-blue">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {getStepIcon(currentStep)}
                <div>
                  <p className="font-medium text-gray-900">Status Atual</p>
                  <p className="text-sm text-gray-600">{currentStep}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steps Progress */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Etapas do Processo</h4>
            <div className="space-y-2">
              {steps.map((step, index) => {
                const isCompleted = progress >= step.threshold;
                const isCurrent = progress >= (steps[index - 1]?.threshold || 0) && progress < step.threshold;
                const IconComponent = step.icon;
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      isCompleted 
                        ? 'bg-green-50 text-green-800' 
                        : isCurrent 
                        ? 'bg-blue-50 text-blue-800' 
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    ) : (
                      <IconComponent className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Processing Info */}
          <div className="bg-jw-blue/5 border border-jw-blue/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-jw-blue mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-jw-blue mb-1">Sistema Inteligente</p>
                <p className="text-gray-600">
                  O algoritmo está analisando qualificações dos estudantes, 
                  regras organizacionais e histórico de designações para 
                  criar a melhor distribuição possível.
                </p>
              </div>
            </div>
          </div>

          {progress === 100 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Designações Criadas!</p>
                  <p className="text-green-700">
                    As designações foram geradas com sucesso e salvas no sistema.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
