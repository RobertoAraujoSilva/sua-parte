import React, { createContext, useContext, useState, useEffect } from 'react';
import '../i18n';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  const toggleLanguage = () => {
    const newLanguage = language === 'pt' ? 'en' : 'pt';
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Mudança segura do i18n
    try {
      import('../i18n').then(({ default: i18n }) => {
        if (i18n.isInitialized) {
          i18n.changeLanguage(newLanguage);
        }
      });
    } catch (error) {
      console.warn('Could not change i18n language:', error);
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    try {
      import('../i18n').then(({ default: i18n }) => {
        if (i18n.isInitialized) {
          i18n.changeLanguage(lang);
        }
      });
    } catch (error) {
      console.warn('Could not change i18n language:', error);
    }
  };

  // Carregar idioma do localStorage na inicialização
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

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