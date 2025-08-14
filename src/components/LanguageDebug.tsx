import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export const LanguageDebug: React.FC = () => {
  const { t, language: hookLanguage } = useTranslation();
  const { language: contextLanguage, toggleLanguage } = useLanguage();

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 border rounded shadow-lg z-50 text-sm">
      <h3 className="font-bold mb-2">🌐 Language Debug</h3>
      <div className="space-y-1">
        <div>Hook Language: <strong>{hookLanguage}</strong></div>
        <div>Context Language: <strong>{contextLanguage}</strong></div>
        <div>Test PT: <strong>{t('common.welcome')}</strong></div>
        <div>Test EN: <strong>{t('navigation.home')}</strong></div>
        <Button size="sm" onClick={toggleLanguage} className="mt-2">
          Toggle Language
        </Button>
      </div>
    </div>
  );
};