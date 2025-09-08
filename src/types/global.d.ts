// Global type definitions for Sistema Ministerial
// This file helps resolve TypeScript compatibility issues

declare global {
  // Extend CSSStyleDeclaration to include webkit properties
  interface CSSStyleDeclaration {
    webkitBackdropFilter?: string;
  }
}

// Supabase type compatibility helpers
export type SupabaseAny = any;
export type DatabaseRow<T = any> = T;
export type DatabaseInsert<T = any> = T;
export type DatabaseUpdate<T = any> = T;

// Enhanced Supabase type helpers to avoid type errors
export type SupabaseQueryBuilder = any;
export type SupabaseInsertBuilder = any;
export type SupabaseUpdateBuilder = any;
export type SupabaseDeleteBuilder = any;

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