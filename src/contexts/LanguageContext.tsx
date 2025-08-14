import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  
  const language = (i18n.language || 'pt') as Language;

  const toggleLanguage = () => {
    const newLanguage = language === 'pt' ? 'en' : 'pt';
    console.log('🌐 LanguageContext: Changing from', language, 'to', newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const setLanguage = (lang: Language) => {
    console.log('🌐 LanguageContext: Setting language to', lang);
    i18n.changeLanguage(lang);
  };

  // Debug current language
  React.useEffect(() => {
    console.log('🌐 LanguageContext: Current language is', language);
    console.log('🌐 LanguageContext: Available resources:', Object.keys(i18n.options.resources || {}));
  }, [language, i18n]);

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