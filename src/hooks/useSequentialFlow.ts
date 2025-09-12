import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface SequentialStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  route: string;
  data?: Record<string, any>;
  validation?: () => Promise<boolean>;
}

export interface SequentialFlowState {
  currentStep: number;
  steps: SequentialStep[];
  isComplete: boolean;
  loading: boolean;
  error: string | null;
}

interface UseSequentialFlowOptions {
  steps: SequentialStep[];
  autoNavigation?: boolean;
  onStepComplete?: (stepId: string, data?: Record<string, any>) => void;
  onFlowComplete?: () => void;
  persistState?: boolean;
  storageKey?: string;
}

export const useSequentialFlow = ({
  steps,
  autoNavigation = true,
  onStepComplete,
  onFlowComplete,
  persistState = true,
  storageKey = 'sequential-flow-state'
}: UseSequentialFlowOptions) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<SequentialFlowState>({
    currentStep: 0,
    steps,
    isComplete: false,
    loading: false,
    error: null
  });

  // Load persisted state on initialization
  useEffect(() => {
    if (persistState) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedState = JSON.parse(saved);
          setState(prevState => ({
            ...prevState,
            ...parsedState,
            steps: steps.map(step => {
              const savedStep = parsedState.steps?.find((s: SequentialStep) => s.id === step.id);
              return savedStep ? { ...step, ...savedStep } : step;
            })
          }));
        }
      } catch (error) {
        console.warn('Failed to load sequential flow state from localStorage:', error);
      }
    }
  }, [persistState, storageKey, steps]);

  // Persist state changes
  useEffect(() => {
    if (persistState) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          currentStep: state.currentStep,
          steps: state.steps,
          isComplete: state.isComplete
        }));
      } catch (error) {
        console.warn('Failed to persist sequential flow state:', error);
      }
    }
  }, [state, persistState, storageKey]);

  // Calculate current step and completion status
  useEffect(() => {
    const currentStepIndex = state.steps.findIndex(step => !step.completed);
    const isComplete = state.steps.every(step => !step.required || step.completed);
    
    setState(prev => ({
      ...prev,
      currentStep: currentStepIndex === -1 ? state.steps.length : currentStepIndex,
      isComplete
    }));

    if (isComplete && onFlowComplete) {
      onFlowComplete();
    }
  }, [state.steps, onFlowComplete]);

  // Mark step as completed
  const completeStep = useCallback(async (stepId: string, data?: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const stepIndex = state.steps.findIndex(step => step.id === stepId);
      const step = state.steps[stepIndex];

      if (!step) {
        throw new Error(`Step with id "${stepId}" not found`);
      }

      // Run validation if provided
      if (step.validation) {
        const isValid = await step.validation();
        if (!isValid) {
          throw new Error(`Validation failed for step "${stepId}"`);
        }
      }

      // Mark step as completed
      setState(prev => ({
        ...prev,
        steps: prev.steps.map(s => 
          s.id === stepId 
            ? { ...s, completed: true, data: { ...s.data, ...data } }
            : s
        ),
        loading: false
      }));

      // Call completion callback
      if (onStepComplete) {
        onStepComplete(stepId, data);
      }

      // Auto-navigate to next step if enabled
      if (autoNavigation) {
        const nextStepIndex = stepIndex + 1;
        if (nextStepIndex < state.steps.length) {
          const nextStep = state.steps[nextStepIndex];
          if (!nextStep.completed) {
            navigate(nextStep.route);
          }
        }
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, [state.steps, navigate, autoNavigation, onStepComplete]);

  // Navigate to specific step
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= state.steps.length) {
      console.warn(`Invalid step index: ${stepIndex}`);
      return;
    }

    const step = state.steps[stepIndex];
    setState(prev => ({ ...prev, currentStep: stepIndex }));
    
    if (autoNavigation) {
      navigate(step.route);
    }
  }, [state.steps, navigate, autoNavigation]);

  // Navigate to next step
  const nextStep = useCallback(() => {
    const nextIndex = Math.min(state.currentStep + 1, state.steps.length - 1);
    goToStep(nextIndex);
  }, [state.currentStep, state.steps.length, goToStep]);

  // Navigate to previous step
  const previousStep = useCallback(() => {
    const prevIndex = Math.max(state.currentStep - 1, 0);
    goToStep(prevIndex);
  }, [state.currentStep, goToStep]);

  // Reset flow
  const resetFlow = useCallback(() => {
    setState({
      currentStep: 0,
      steps: steps.map(step => ({ ...step, completed: false, data: undefined })),
      isComplete: false,
      loading: false,
      error: null
    });

    if (persistState) {
      localStorage.removeItem(storageKey);
    }

    if (autoNavigation && steps.length > 0) {
      navigate(steps[0].route);
    }
  }, [steps, navigate, autoNavigation, persistState, storageKey]);

  // Update step data without completing
  const updateStepData = useCallback((stepId: string, data: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId
          ? { ...step, data: { ...step.data, ...data } }
          : step
      )
    }));
  }, []);

  // Get current step
  const getCurrentStep = useCallback(() => {
    return state.steps[state.currentStep] || null;
  }, [state.steps, state.currentStep]);

  // Get step by ID
  const getStepById = useCallback((stepId: string) => {
    return state.steps.find(step => step.id === stepId) || null;
  }, [state.steps]);

  // Check if step is accessible (all previous required steps completed)
  const isStepAccessible = useCallback((stepIndex: number) => {
    if (stepIndex === 0) return true;
    
    for (let i = 0; i < stepIndex; i++) {
      const step = state.steps[i];
      if (step.required && !step.completed) {
        return false;
      }
    }
    return true;
  }, [state.steps]);

  // Get progress percentage
  const getProgress = useCallback(() => {
    const completedSteps = state.steps.filter(step => step.completed).length;
    return (completedSteps / state.steps.length) * 100;
  }, [state.steps]);

  // Get completed required steps count
  const getCompletedRequiredSteps = useCallback(() => {
    return state.steps.filter(step => step.required && step.completed).length;
  }, [state.steps]);

  // Get total required steps count
  const getTotalRequiredSteps = useCallback(() => {
    return state.steps.filter(step => step.required).length;
  }, [state.steps]);

  return {
    // State
    ...state,
    
    // Actions
    completeStep,
    goToStep,
    nextStep,
    previousStep,
    resetFlow,
    updateStepData,
    
    // Getters
    getCurrentStep,
    getStepById,
    isStepAccessible,
    getProgress,
    getCompletedRequiredSteps,
    getTotalRequiredSteps,
    
    // Computed properties
    canProceed: state.currentStep < state.steps.length - 1,
    canGoBack: state.currentStep > 0,
    currentStepData: getCurrentStep()?.data,
    progressPercentage: getProgress(),
    completedRequiredCount: getCompletedRequiredSteps(),
    totalRequiredCount: getTotalRequiredSteps()
  };
};

export default useSequentialFlow;