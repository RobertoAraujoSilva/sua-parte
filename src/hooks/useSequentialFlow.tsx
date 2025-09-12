import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface FlowStep {
  id: string;
  title: string;
  route: string;
  completed: boolean;
  required: boolean;
  validation?: () => Promise<boolean> | boolean;
  data?: Record<string, any>;
}

export interface FlowState {
  currentStep: number;
  steps: FlowStep[];
  loading: boolean;
  error: string | null;
  canProceed: boolean;
  canGoBack: boolean;
}

export interface UseSequentialFlowOptions {
  steps: FlowStep[];
  onStepComplete?: (stepId: string, data?: Record<string, any>) => void;
  onFlowComplete?: () => void;
  autoNavigate?: boolean;
  persistState?: boolean;
}

export const useSequentialFlow = ({
  steps: initialSteps,
  onStepComplete,
  onFlowComplete,
  autoNavigate = true,
  persistState = false
}: UseSequentialFlowOptions) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado do fluxo
  const [state, setState] = useState<FlowState>({
    currentStep: 0,
    steps: initialSteps,
    loading: false,
    error: null,
    canProceed: false,
    canGoBack: false
  });

  // Recuperar estado persistido (se habilitado)
  useEffect(() => {
    if (persistState) {
      const saved = localStorage.getItem('sequential-flow-state');
      if (saved) {
        try {
          const parsedState = JSON.parse(saved);
          setState(prev => ({
            ...prev,
            ...parsedState,
            steps: initialSteps // Sempre usar steps atuais
          }));
        } catch (error) {
          console.warn('Erro ao recuperar estado do fluxo:', error);
        }
      }
    }
  }, [persistState, initialSteps]);

  // Persistir estado (se habilitado)
  useEffect(() => {
    if (persistState) {
      const stateToSave = {
        currentStep: state.currentStep,
        steps: state.steps.map(step => ({
          id: step.id,
          completed: step.completed,
          data: step.data
        }))
      };
      localStorage.setItem('sequential-flow-state', JSON.stringify(stateToSave));
    }
  }, [state.currentStep, state.steps, persistState]);

  // Calcular permissões de navegação
  useEffect(() => {
    const current = state.steps[state.currentStep];
    const canProceed = current?.completed || false;
    const canGoBack = state.currentStep > 0;

    setState(prev => ({
      ...prev,
      canProceed,
      canGoBack
    }));
  }, [state.currentStep, state.steps]);

  // Detectar step atual baseado na rota
  useEffect(() => {
    if (!autoNavigate) return;

    const currentStepIndex = state.steps.findIndex(
      step => step.route === location.pathname
    );

    if (currentStepIndex !== -1 && currentStepIndex !== state.currentStep) {
      setState(prev => ({
        ...prev,
        currentStep: currentStepIndex
      }));
    }
  }, [location.pathname, state.steps, autoNavigate, state.currentStep]);

  // Validar step atual
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const currentStep = state.steps[state.currentStep];
    if (!currentStep?.validation) return true;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const isValid = await currentStep.validation();
      return isValid;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro de validação'
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.currentStep, state.steps]);

  // Marcar step como completo
  const completeStep = useCallback(async (
    stepId?: string, 
    data?: Record<string, any>
  ) => {
    const targetStepId = stepId || state.steps[state.currentStep]?.id;
    if (!targetStepId) return false;

    // Validar step antes de completar
    const isValid = await validateCurrentStep();
    if (!isValid) return false;

    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === targetStepId
          ? { ...step, completed: true, data: { ...step.data, ...data } }
          : step
      )
    }));

    // Callback de conclusão
    onStepComplete?.(targetStepId, data);

    // Verificar se fluxo está completo
    const updatedSteps = state.steps.map(step =>
      step.id === targetStepId ? { ...step, completed: true } : step
    );
    
    const isFlowComplete = updatedSteps.every(step => !step.required || step.completed);
    if (isFlowComplete) {
      onFlowComplete?.();
    }

    return true;
  }, [state.currentStep, state.steps, validateCurrentStep, onStepComplete, onFlowComplete]);

  // Navegar para próximo step
  const nextStep = useCallback(async () => {
    const completed = await completeStep();
    if (!completed) return false;

    const nextIndex = state.currentStep + 1;
    if (nextIndex < state.steps.length) {
      setState(prev => ({ ...prev, currentStep: nextIndex }));
      
      if (autoNavigate) {
        navigate(state.steps[nextIndex].route);
      }
    }
    return true;
  }, [state.currentStep, state.steps, completeStep, autoNavigate, navigate]);

  // Navegar para step anterior
  const previousStep = useCallback(() => {
    const prevIndex = state.currentStep - 1;
    if (prevIndex >= 0) {
      setState(prev => ({ ...prev, currentStep: prevIndex }));
      
      if (autoNavigate) {
        navigate(state.steps[prevIndex].route);
      }
      return true;
    }
    return false;
  }, [state.currentStep, state.steps, autoNavigate, navigate]);

  // Ir para step específico
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      setState(prev => ({ ...prev, currentStep: stepIndex }));
      
      if (autoNavigate) {
        navigate(state.steps[stepIndex].route);
      }
      return true;
    }
    return false;
  }, [state.steps, autoNavigate, navigate]);

  // Resetar fluxo
  const resetFlow = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 0,
      steps: initialSteps,
      loading: false,
      error: null
    }));

    if (persistState) {
      localStorage.removeItem('sequential-flow-state');
    }
  }, [initialSteps, persistState]);

  // Atualizar dados de step
  const setStepData = useCallback((stepId: string, data: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId
          ? { ...step, data: { ...step.data, ...data } }
          : step
      )
    }));
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Calcular progresso
  const progress = state.steps.length > 0 
    ? (state.steps.filter(step => step.completed).length / state.steps.length) * 100 
    : 0;

  return {
    // Estado
    ...state,
    progress,
    
    // Steps info
    currentStepInfo: state.steps[state.currentStep],
    totalSteps: state.steps.length,
    
    // Ações
    nextStep,
    previousStep,
    goToStep,
    completeStep,
    resetFlow,
    setStepData,
    validateCurrentStep,
    clearError
  };
};