import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  // Simple language management without relying on useTranslation hook
  const toggleLanguage = () => {
    const newLanguage = language === 'pt' ? 'en' : 'pt';
    setLanguageState(newLanguage);
    // Try to change i18n language if available
    try {
      import('../i18n').then(({ default: i18n }) => {
        i18n.changeLanguage(newLanguage);
      });
    } catch (error) {
      console.warn('Could not change i18n language:', error);
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Try to change i18n language if available
    try {
      import('../i18n').then(({ default: i18n }) => {
        i18n.changeLanguage(lang);
      });
    } catch (error) {
      console.warn('Could not change i18n language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};