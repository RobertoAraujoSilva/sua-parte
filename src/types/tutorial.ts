/**
 * Types for the interactive tutorial system
 */

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'focus' | 'none';
  optional?: boolean;
  beforeShow?: () => void | Promise<void>;
  afterShow?: () => void | Promise<void>;
  beforeHide?: () => void | Promise<void>;
  validation?: () => boolean | Promise<boolean>;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  page: string;
  category: 'basic' | 'advanced' | 'workflow';
  estimatedTime: number; // in minutes
  prerequisites?: string[];
  steps: TutorialStep[];
}

export interface TutorialState {
  currentTutorial: string | null;
  currentStep: number;
  isActive: boolean;
  completedTutorials: string[];
  skippedTutorials: string[];
  userPreferences: {
    autoStart: boolean;
    showHints: boolean;
    animationSpeed: 'slow' | 'normal' | 'fast';
  };
}

export interface TutorialContextType {
  state: TutorialState;
  startTutorial: (tutorialId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: (tutorialId: string) => void;
  updatePreferences: (preferences: Partial<TutorialState['userPreferences']>) => void;
  getTutorialProgress: (tutorialId: string) => number;
  isTutorialCompleted: (tutorialId: string) => boolean;
  getAvailableTutorials: (page?: string) => Tutorial[];
}

export type TutorialPage = 'dashboard' | 'estudantes' | 'programas' | 'designacoes' | 'reunioes' | 'relatorios';

export interface TutorialHighlight {
  element: HTMLElement;
  originalStyle: {
    position: string;
    zIndex: string;
    boxShadow: string;
    outline: string;
  };
}

export interface TutorialTooltipProps {
  step: TutorialStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  position: { x: number; y: number };
  isVisible: boolean;
}

export interface TutorialOverlayProps {
  isVisible: boolean;
  highlightedElement?: HTMLElement;
  onOverlayClick: () => void;
}

export interface TutorialButtonProps {
  page: TutorialPage;
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface TutorialProgressProps {
  tutorialId: string;
  currentStep: number;
  totalSteps: number;
  onStepClick?: (stepIndex: number) => void;
}

export interface TutorialMenuProps {
  page?: TutorialPage;
  isOpen: boolean;
  onClose: () => void;
  onSelectTutorial: (tutorialId: string) => void;
}

// Tutorial content configuration
export interface TutorialConfig {
  tutorials: Record<TutorialPage, Tutorial[]>;
  defaultPreferences: TutorialState['userPreferences'];
  storageKeys: {
    completedTutorials: string;
    skippedTutorials: string;
    userPreferences: string;
  };
}

// Animation and styling options
export interface TutorialAnimationConfig {
  duration: number;
  easing: string;
  highlightColor: string;
  overlayColor: string;
  tooltipShadow: string;
}

// Accessibility options
export interface TutorialA11yConfig {
  announceSteps: boolean;
  focusManagement: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

// Error handling
export interface TutorialError {
  type: 'element_not_found' | 'validation_failed' | 'navigation_error' | 'unknown';
  message: string;
  step?: TutorialStep;
  tutorialId?: string;
}

export type TutorialEventType = 
  | 'tutorial_started'
  | 'tutorial_completed'
  | 'tutorial_skipped'
  | 'step_completed'
  | 'step_skipped'
  | 'error_occurred';

export interface TutorialEvent {
  type: TutorialEventType;
  tutorialId: string;
  stepId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}
