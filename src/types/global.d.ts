// Global type definitions for Sistema Ministerial
// This file helps resolve TypeScript compatibility issues

declare global {
  // Extend CSSStyleDeclaration to include webkit properties
  interface CSSStyleDeclaration {
    webkitBackdropFilter?: string;
  }

  // Tutorial types
  interface TutorialContextType {
    currentTutorial?: string;
    currentStep?: number;
    isActive?: boolean;
    startTutorial?: (tutorial: string) => void;
    nextStep?: () => void;
    skipTutorial?: () => void;
  }
}

// Supabase type compatibility helpers
export type SupabaseAny = any;
export type DatabaseRow<T = any> = T;
export type DatabaseInsert<T = any> = T;
export type DatabaseUpdate<T = any> = T;

// Tutorial page types
export type TutorialPage = 
  | "dashboard" 
  | "estudantes" 
  | "programas" 
  | "designacoes" 
  | "reunioes" 
  | "relatorios"
  | "developer-panel"
  | "template-library" 
  | "program-preview";

export {};