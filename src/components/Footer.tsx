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
              <h3 className="text-xl font-semibold">{t('Sistema Ministerial')}</h3>
            </div>
            <p className="text-white/80 mb-4 max-w-md">
              {t('Automatização inteligente de designações ministeriais para congregações das Testemunhas de Jeová, com foco em eficiência e conformidade.')}
            </p>
            <p className="text-sm text-white/60">
              {t('Desenvolvido com dedicação para servir às necessidades congregacionais e apoiar o trabalho ministerial.')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('Funcionalidades')}</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>{t('Gestão de Estudantes')}</li>
              <li>{t('Importação de Programas')}</li>
              <li>{t('Designações Automáticas')}</li>
              <li>{t('Notificações')}</li>
              <li>{t('Portal do Estudante')}</li>
              <li>{t('Relatórios')}</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('Suporte')}</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>{t('Tutorial de Uso')}</li>
              <li>{t('Documentação')}</li>
              <li>{t('Contato Técnico')}</li>
              <li>{t('Atualizações')}</li>
              <li>{t('Comunidade')}</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-sm text-white/60">
            © 2024 {t('Sistema Ministerial')}. {t('Desenvolvido para servir congregações das Testemunhas de Jeová.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;