import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources, FALLBACK_LNG } from './translations';

const startLng = (localStorage.getItem('language') as keyof typeof resources) || FALLBACK_LNG;

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources, // <- nunca undefined
      lng: startLng,
      fallbackLng: FALLBACK_LNG,
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      
      // Evita suspense se você não estiver usando <Suspense> para i18n:
      react: {
        useSuspense: false
      },
      
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'language',
      }
    })
    .catch(console.error);
}

export default i18n;