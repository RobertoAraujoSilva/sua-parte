import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  TutorialContextType, 
  TutorialState, 
  Tutorial, 
  TutorialPage,
  TutorialEvent,
  TutorialEventType 
} from '@/types/tutorial';
import { tutorialConfig } from '@/config/tutorials';
import { toast } from '@/hooks/use-toast';

// Initial state
const initialState: TutorialState = {
  currentTutorial: null,
  currentStep: 0,
  isActive: false,
  completedTutorials: [],
  skippedTutorials: [],
  userPreferences: {
    autoStart: false,
    showHints: true,
    animationSpeed: 'normal'
  }
};

// Action types
type TutorialAction =
  | { type: 'START_TUTORIAL'; payload: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SKIP_TUTORIAL' }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'RESET_TUTORIAL'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<TutorialState['userPreferences']> }
  | { type: 'LOAD_STATE'; payload: Partial<TutorialState> }
  | { type: 'SET_STEP'; payload: number };

// Reducer
function tutorialReducer(state: TutorialState, action: TutorialAction): TutorialState {
  switch (action.type) {
    case 'START_TUTORIAL':
      return {
        ...state,
        currentTutorial: action.payload,
        currentStep: 0,
        isActive: true
      };

    case 'NEXT_STEP': {
      const currentTutorial = getCurrentTutorial(state.currentTutorial);
      if (!currentTutorial) return state;
      
      const nextStep = state.currentStep + 1;
      if (nextStep >= currentTutorial.steps.length) {
        // Tutorial completed
        return {
          ...state,
          currentTutorial: null,
          currentStep: 0,
          isActive: false,
          completedTutorials: [...state.completedTutorials, currentTutorial.id]
        };
      }
      
      return {
        ...state,
        currentStep: nextStep
      };
    }

    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1)
      };

    case 'SKIP_TUTORIAL':
      return {
        ...state,
        currentTutorial: null,
        currentStep: 0,
        isActive: false,
        skippedTutorials: state.currentTutorial 
          ? [...state.skippedTutorials, state.currentTutorial]
          : state.skippedTutorials
      };

    case 'COMPLETE_TUTORIAL':
      return {
        ...state,
        currentTutorial: null,
        currentStep: 0,
        isActive: false,
        completedTutorials: state.currentTutorial 
          ? [...state.completedTutorials, state.currentTutorial]
          : state.completedTutorials
      };

    case 'RESET_TUTORIAL':
      return {
        ...state,
        completedTutorials: state.completedTutorials.filter(id => id !== action.payload),
        skippedTutorials: state.skippedTutorials.filter(id => id !== action.payload)
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload
        }
      };

    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload
      };

    default:
      return state;
  }
}

// Helper function to get current tutorial
function getCurrentTutorial(tutorialId: string | null): Tutorial | null {
  if (!tutorialId) return null;
  
  for (const page of Object.keys(tutorialConfig.tutorials) as TutorialPage[]) {
    const tutorial = tutorialConfig.tutorials[page].find(t => t.id === tutorialId);
    if (tutorial) return tutorial;
  }
  
  return null;
}

// Storage utilities
const STORAGE_KEYS = {
  completedTutorials: 'tutorial_completed',
  skippedTutorials: 'tutorial_skipped',
  userPreferences: 'tutorial_preferences'
};

function loadFromStorage(): Partial<TutorialState> {
  try {
    const completed = JSON.parse(localStorage.getItem(STORAGE_KEYS.completedTutorials) || '[]');
    const skipped = JSON.parse(localStorage.getItem(STORAGE_KEYS.skippedTutorials) || '[]');
    const preferences = JSON.parse(localStorage.getItem(STORAGE_KEYS.userPreferences) || '{}');
    
    return {
      completedTutorials: completed,
      skippedTutorials: skipped,
      userPreferences: {
        ...initialState.userPreferences,
        ...preferences
      }
    };
  } catch (error) {
    console.error('Error loading tutorial state from storage:', error);
    return {};
  }
}

function saveToStorage(state: TutorialState) {
  try {
    localStorage.setItem(STORAGE_KEYS.completedTutorials, JSON.stringify(state.completedTutorials));
    localStorage.setItem(STORAGE_KEYS.skippedTutorials, JSON.stringify(state.skippedTutorials));
    localStorage.setItem(STORAGE_KEYS.userPreferences, JSON.stringify(state.userPreferences));
  } catch (error) {
    console.error('Error saving tutorial state to storage:', error);
  }
}

// Analytics/tracking
function trackTutorialEvent(event: TutorialEvent) {
  // Log for debugging
  console.log('Tutorial Event:', event);
  
  // Here you could integrate with analytics services
  // Example: analytics.track(event.type, event);
}

// Create context
const TutorialContext = createContext<TutorialContextType | null>(null);

// Provider component
export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tutorialReducer, initialState);

  // Load state from storage on mount
  useEffect(() => {
    const savedState = loadFromStorage();
    if (Object.keys(savedState).length > 0) {
      dispatch({ type: 'LOAD_STATE', payload: savedState });
    }
  }, []);

  // Save state to storage when it changes
  useEffect(() => {
    saveToStorage(state);
  }, [state.completedTutorials, state.skippedTutorials, state.userPreferences]);

  // Context methods
  const startTutorial = useCallback((tutorialId: string) => {
    const tutorial = getCurrentTutorial(tutorialId);
    if (!tutorial) {
      console.error(`Tutorial not found: ${tutorialId}`);
      return;
    }

    dispatch({ type: 'START_TUTORIAL', payload: tutorialId });
    
    trackTutorialEvent({
      type: 'tutorial_started',
      tutorialId,
      timestamp: Date.now()
    });

    toast({
      title: `Tutorial: ${tutorial.title}`,
      description: `Iniciando tutorial com ${tutorial.steps.length} passos`,
    });
  }, []);

  const nextStep = useCallback(() => {
    const currentTutorial = getCurrentTutorial(state.currentTutorial);
    if (!currentTutorial) return;

    const currentStep = currentTutorial.steps[state.currentStep];
    
    trackTutorialEvent({
      type: 'step_completed',
      tutorialId: currentTutorial.id,
      stepId: currentStep?.id,
      timestamp: Date.now()
    });

    dispatch({ type: 'NEXT_STEP' });
  }, [state.currentTutorial, state.currentStep]);

  const previousStep = useCallback(() => {
    dispatch({ type: 'PREVIOUS_STEP' });
  }, []);

  const skipTutorial = useCallback(() => {
    if (state.currentTutorial) {
      trackTutorialEvent({
        type: 'tutorial_skipped',
        tutorialId: state.currentTutorial,
        timestamp: Date.now()
      });
    }
    
    dispatch({ type: 'SKIP_TUTORIAL' });
    
    toast({
      title: "Tutorial ignorado",
      description: "Você pode reiniciar o tutorial a qualquer momento.",
    });
  }, [state.currentTutorial]);

  const completeTutorial = useCallback(() => {
    if (state.currentTutorial) {
      trackTutorialEvent({
        type: 'tutorial_completed',
        tutorialId: state.currentTutorial,
        timestamp: Date.now()
      });
      
      toast({
        title: "Tutorial concluído! 🎉",
        description: "Parabéns! Você completou o tutorial com sucesso.",
      });
    }
    
    dispatch({ type: 'COMPLETE_TUTORIAL' });
  }, [state.currentTutorial]);

  const resetTutorial = useCallback((tutorialId: string) => {
    dispatch({ type: 'RESET_TUTORIAL', payload: tutorialId });
    
    toast({
      title: "Tutorial reiniciado",
      description: "O progresso do tutorial foi resetado.",
    });
  }, []);

  const updatePreferences = useCallback((preferences: Partial<TutorialState['userPreferences']>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  }, []);

  const getTutorialProgress = useCallback((tutorialId: string): number => {
    const tutorial = getCurrentTutorial(tutorialId);
    if (!tutorial) return 0;
    
    if (state.completedTutorials.includes(tutorialId)) return 100;
    if (state.currentTutorial === tutorialId) {
      return Math.round((state.currentStep / tutorial.steps.length) * 100);
    }
    
    return 0;
  }, [state.completedTutorials, state.currentTutorial, state.currentStep]);

  const isTutorialCompleted = useCallback((tutorialId: string): boolean => {
    return state.completedTutorials.includes(tutorialId);
  }, [state.completedTutorials]);

  const getAvailableTutorials = useCallback((page?: string): Tutorial[] => {
    if (page) {
      return tutorialConfig.tutorials[page as TutorialPage] || [];
    }
    
    return Object.values(tutorialConfig.tutorials).flat();
  }, []);

  const contextValue: TutorialContextType = {
    state,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    resetTutorial,
    updatePreferences,
    getTutorialProgress,
    isTutorialCompleted,
    getAvailableTutorials
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
    </TutorialContext.Provider>
  );
};

// Hook to use tutorial context
export const useTutorial = (): TutorialContextType => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

export default TutorialContext;
