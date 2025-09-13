import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export const LanguageDebug: React.FC = () => {
  const { t, language: hookLanguage } = useTranslation();
  const { language: contextLanguage, toggleLanguage } = useLanguage();

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 border rounded shadow-lg z-50 text-sm max-w-[min(95vw,48rem)]">
      <h3 className="font-bold mb-2">🌐 Language Debug</h3>
      <div className="space-y-2">
        <div>Hook Language: <strong>{hookLanguage}</strong></div>
        <div>Context Language: <strong>{contextLanguage}</strong></div>
        <div>Test PT: <strong>{t('common.welcome')}</strong></div>
        <div>Test EN: <strong>{t('navigation.home')}</strong></div>

        {/* Compact row: Toggle + long path with horizontal scroll */}
        <div className="flex items-center gap-2 overflow-hidden">
          <Button size="sm" variant="outline" onClick={toggleLanguage} className="shrink-0">
            Toggle Language
          </Button>
          <div className="flex-1 overflow-x-auto">
            <code className="block font-mono whitespace-nowrap text-[11px] leading-5">
              C:\\Users\\sharo\\Documents\\GitHub\\sua-parte\\docs\\Oficial\\estudantes_ficticios.xlsx
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
