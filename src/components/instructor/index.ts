/**
 * Instructor Dashboard Components
 * Interactive components for managing students in the Theocratic Ministry School
 */

export { default as StudentQualificationCard } from './StudentQualificationCard';
export { default as ProgressBoard } from './ProgressBoard';
export { default as SpeechTypeCategories } from './SpeechTypeCategories';
export { default as InstructorDashboardStats } from './InstructorDashboardStats';

// Re-export types for convenience
export type {
  EstudanteWithProgress,
  StudentQualifications,
  StudentProgress,
  ProgressLevel,
  SpeechType,
  InstructorDashboardData,
  DragDropResult
} from '@/types/estudantes';
