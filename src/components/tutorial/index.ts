/**
 * Tutorial system components
 * Interactive guided tutorials for Sistema Ministerial
 */

export { TutorialOverlay } from './TutorialOverlay';
export { TutorialTooltip } from './TutorialTooltip';
export { TutorialButton } from './TutorialButton';

// Re-export types for convenience
export type {
  Tutorial,
  TutorialStep,
  TutorialState,
  TutorialPage,
  TutorialButtonProps,
  TutorialTooltipProps,
  TutorialOverlayProps
} from '@/types/tutorial';

// Re-export context and hooks
export { TutorialProvider, useTutorial } from '@/contexts/TutorialContext';

// Re-export configuration utilities
export {
  tutorialConfig,
  getTutorialById,
  getTutorialsForPage,
  getBasicTutorials,
  getAdvancedTutorials,
  getWorkflowTutorials
} from '@/config/tutorials';
