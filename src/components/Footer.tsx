import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-jw-navy text-white py-12 safe-bottom">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-jw-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <h3 className="text-xl font-semibold">{t('footer.appName')}</h3>
            </div>
            <p className="text-white/80 mb-4 max-w-md">
              {t('footer.description')}
            </p>
            <p className="text-sm text-white/60">
              {t('footer.dedication')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.features')}</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>{t('footer.studentManagement')}</li>
              <li>{t('footer.programImport')}</li>
              <li>{t('footer.automaticAssignments')}</li>
              <li>{t('footer.notifications')}</li>
              <li>{t('footer.studentPortal')}</li>
              <li>{t('footer.reports')}</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>{t('footer.usageTutorial')}</li>
              <li>{t('footer.documentation')}</li>
              <li>{t('footer.technicalContact')}</li>
              <li>{t('footer.updates')}</li>
              <li>{t('footer.community')}</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-sm text-white/60">
            © 2024 {t('footer.appName')}. {t('footer.developedFor')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;