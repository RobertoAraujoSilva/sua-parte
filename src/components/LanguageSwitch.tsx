import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const LanguageSwitch: React.FC = () => {
  const { language, t } = useTranslation();

  const toggleLanguage = () => {
    // Simple language toggle for now
    console.log('Language toggle clicked');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      {language === 'pt' ? 'PT' : 'EN'}
    </Button>
  );
};

export default LanguageSwitch;