import { useLanguage } from "@/contexts/LanguageContext";
import { t, Language } from "@/translations";

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const translate = (key: string): string => {
    return t(key, language);
  };
  
  return {
    t: translate,
    language
  };
};