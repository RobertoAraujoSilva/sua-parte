/**
 * Componente para guiar o usuário através do fluxo principal do sistema
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  Upload, 
  Users, 
  Calendar, 
  FileText,
  ArrowRight,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  current: boolean;
  action?: () => void;
  actionLabel?: string;
  route?: string;
}

interface UserFlowGuideProps {
  onNavigate?: (route: string) => void;
}

export const UserFlowGuide: React.FC<UserFlowGuideProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Verificar status do sistema
  const checkSystemStatus = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Verificar estudantes
      const { data: students, error: studentsError } = await supabase
        .from('estudantes')
        .select('id')
        .eq('user_id', user.id)
        .eq('ativo', true);

      // Verificar programas
      const { data: programs, error: programsError } = await supabase
        .from('programas')
        .select('id, assignment_status')
        .eq('user_id', user.id);

      // Verificar designações
      const { data: assignments, error: assignmentsError } = await supabase
        .from('designacoes')
        .select('id')
        .eq('user_id', user.id);

      const hasStudents = students && students.length > 0;
      const hasPrograms = programs && programs.length > 0;
      const hasAssignments = assignments && assignments.length > 0;
      const hasPendingPrograms = programs?.some(p => p.assignment_status === 'pending') || false;

      // Definir próximo passo
      let nextStep = 0;
      if (!hasStudents) nextStep = 0;
      else if (!hasPrograms) nextStep = 1;
      else if (hasPendingPrograms) nextStep = 2;
      else nextStep = 3;

      const flowSteps: FlowStep[] = [
        {
          id: 'students',
          title: 'Cadastrar Estudantes',
          description: hasStudents 
            ? `${students.length} estudantes cadastrados` 
            : 'Cadastre os estudantes da sua congregação',
          icon: <Users className="w-5 h-5" />,
          completed: hasStudents,
          current: nextStep === 0,
          route: '/estudantes',
          actionLabel: hasStudents ? 'Gerenciar Estudantes' : 'Cadastrar Estudantes'
        },
        {
          id: 'programs',
          title: 'Importar Programas',
          description: hasPrograms 
            ? `${programs.length} programas importados` 
            : 'Importe os programas da reunião (PDF)',
          icon: <Upload className="w-5 h-5" />,
          completed: hasPrograms,
          current: nextStep === 1,
          route: '/programas',
          actionLabel: hasPrograms ? 'Ver Programas' : 'Importar Programa'
        },
        {
          id: 'assignments',
          title: 'Gerar Designações',
          description: hasPendingPrograms 
            ? 'Há programas aguardando designações' 
            : hasAssignments 
            ? 'Designações geradas e prontas' 
            : 'Gere as designações automaticamente',
          icon: <Calendar className="w-5 h-5" />,
          completed: hasAssignments && !hasPendingPrograms,
          current: nextStep === 2,
          route: '/programas',
          actionLabel: hasPendingPrograms ? 'Gerar Designações' : 'Ver Designações'
        },
        {
          id: 'manage',
          title: 'Gerenciar Sistema',
          description: 'Sistema configurado e funcionando',
          icon: <FileText className="w-5 h-5" />,
          completed: hasStudents && hasPrograms && hasAssignments,
          current: nextStep === 3,
          route: '/designacoes',
          actionLabel: 'Ver Designações'
        }
      ];

      setSteps(flowSteps);
      setCurrentStepIndex(nextStep);

    } catch (error) {
      console.error('Erro ao verificar status do sistema:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o status do sistema.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
  }, [user?.id]);

  const handleStepAction = (step: FlowStep) => {
    if (step.route && onNavigate) {
      onNavigate(step.route);
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = steps.filter(step => step.completed).length;
    return (completedSteps / steps.length) * 100;
  };

  const getCurrentStepInfo = () => {
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return null;

    return {
      title: currentStep.title,
      description: currentStep.description,
      action: () => handleStepAction(currentStep),
      actionLabel: currentStep.actionLabel
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jw-blue"></div>
            <span className="ml-2 text-gray-600">Verificando sistema...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStepInfo = getCurrentStepInfo();
  const progressPercentage = getProgressPercentage();

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-jw-blue" />
            Progresso do Sistema
          </CardTitle>
          <CardDescription>
            Configure seu sistema seguindo estes passos essenciais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso Geral</span>
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Current Step Highlight */}
      {currentStepInfo && (
        <Card className="border-jw-blue bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-jw-blue">
              <ArrowRight className="w-5 h-5" />
              Próximo Passo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{currentStepInfo.title}</h3>
                <p className="text-sm text-gray-600">{currentStepInfo.description}</p>
              </div>
              <Button 
                onClick={currentStepInfo.action}
                className="bg-jw-blue hover:bg-jw-blue/90"
              >
                {currentStepInfo.actionLabel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps List */}
      <Card>
        <CardHeader>
          <CardTitle>Passos de Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  step.current 
                    ? 'border-jw-blue bg-blue-50' 
                    : step.completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : step.current ? (
                    <Circle className="w-6 h-6 text-jw-blue fill-current" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-lg ${
                    step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : step.current 
                      ? 'bg-blue-100 text-jw-blue' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.icon}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>

                <div className="flex-shrink-0">
                  <Badge variant={
                    step.completed ? 'default' : 
                    step.current ? 'secondary' : 
                    'outline'
                  }>
                    {step.completed ? 'Concluído' : 
                     step.current ? 'Atual' : 
                     'Pendente'}
                  </Badge>
                </div>

                {step.actionLabel && (
                  <div className="flex-shrink-0">
                    <Button
                      variant={step.current ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStepAction(step)}
                    >
                      {step.actionLabel}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Precisa de Ajuda?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Se você está enfrentando dificuldades, aqui estão algumas dicas:
            </p>
            <ul className="text-sm space-y-2 text-gray-600">
              <li>• <strong>Estudantes:</strong> Cadastre pelo menos 10-15 estudantes ativos</li>
              <li>• <strong>Programas:</strong> Use os PDFs oficiais do jw.org</li>
              <li>• <strong>Designações:</strong> O sistema gera automaticamente seguindo as regras S-38-T</li>
              <li>• <strong>Problemas:</strong> Tente recarregar a página ou fazer logout/login</li>
            </ul>
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Recarregar Sistema
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};