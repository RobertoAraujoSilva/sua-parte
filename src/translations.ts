import en from './locales/en.json';
import pt from './locales/pt.json';

export const resources = {
  en: { translation: en || {} },
  'pt-BR': { translation: pt || {} },
  pt: { translation: pt || {} },
} as const;

export type SupportedLng = keyof typeof resources;
export const FALLBACK_LNG: SupportedLng = 'pt-BR';

// Manter compatibilidade com o código existente
export type Language = 'pt' | 'en';
export const translations: Record<Language, Record<string, string>> = {
  pt: pt || {},
  en: en || {}
};

export const t = (key: string, language: Language): string => {
  return translations[language][key] || key;
};