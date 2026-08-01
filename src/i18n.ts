import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import ptTranslations from './locales/pt.json';
import enTranslations from './locales/en.json';

// Connect module translations (EN / PT / IT / ES)
import connectPt from './locales/connect/pt.json';
import connectEn from './locales/connect/en.json';
import connectIt from './locales/connect/it.json';
import connectEs from './locales/connect/es.json';

// Garantir que os recursos existam e sejam objetos válidos
const resources = {
  pt: {
    translation: ptTranslations || {},
    connect: connectPt
  },
  en: {
    translation: enTranslations || {},
    connect: connectEn
  },
  it: {
    // O Sistema Ministerial ainda não tem tradução completa em italiano;
    // o fallback para inglês cobre esse namespace.
    connect: connectIt
  },
  es: {
    // Idem para espanhol.
    connect: connectEs
  }
};

export const SUPPORTED_LANGUAGES = [
  { code: 'pt', label: 'Português', short: 'PT' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'it', label: 'Italiano', short: 'IT' },
  { code: 'es', label: 'Español', short: 'ES' }
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const commonConfig = {
  resources,
  ns: ['translation', 'connect'],
  defaultNS: 'translation',
  fallbackLng: {
    it: ['en', 'pt'],
    es: ['en', 'pt'],
    en: ['pt'],
    default: ['pt']
  },
  supportedLngs: ['pt', 'en', 'it', 'es'],
  nonExplicitSupportedLngs: true,
  interpolation: {
    escapeValue: false
  },
  returnObjects: true,
  react: {
    useSuspense: false
  }
};

// Inicialização com tratamento de erro
const initI18n = async () => {
  try {
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        ...commonConfig,
        debug: import.meta.env.DEV,
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag'],
          caches: ['localStorage'],
          lookupLocalStorage: 'language'
        }
      });

    console.log('🌐 i18n initialized successfully');
  } catch (error) {
    console.error('🌐 Error initializing i18n:', error);

    // Fallback initialization with minimal configuration
    await i18n
      .use(initReactI18next)
      .init({
        ...commonConfig,
        lng: 'pt',
        debug: false
      });
  }
};

// Inicializar i18n
initI18n();

export default i18n;
