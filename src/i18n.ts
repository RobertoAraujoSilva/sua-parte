import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import ptTranslations from './locales/pt.json';
import enTranslations from './locales/en.json';

// Garantir que os recursos existam e sejam objetos válidos
const resources = {
  pt: {
    translation: ptTranslations || {}
  },
  en: {
    translation: enTranslations || {}
  }
};

// Inicialização com tratamento de erro
const initI18n = async () => {
  try {
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: 'pt',
        lng: 'pt', // Set default language explicitly
        debug: import.meta.env.DEV, // Enable debug only in development
        
        interpolation: {
          escapeValue: false, // React already escapes values
        },
        
        returnObjects: true, // Enable returning objects for complex translations
        
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag'],
          caches: ['localStorage'],
          lookupLocalStorage: 'language',
        },
        
        react: {
          useSuspense: false,
        }
      });
    
    console.log('🌐 i18n initialized successfully');
  } catch (error) {
    console.error('🌐 Error initializing i18n:', error);
    
    // Fallback initialization with minimal configuration
    await i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: 'pt',
        fallbackLng: 'pt',
        debug: false,
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        }
      });
  }
};

// Inicializar i18n
initI18n();

export default i18n;