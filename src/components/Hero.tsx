import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import heroImage from "@/assets/hero-ministerial.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark min-h-[600px] flex items-center overflow-x-hidden">
      <div className="absolute inset-0 bg-black/40"></div>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>
      
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-balance font-extrabold leading-tight text-[clamp(1.8rem,5vw,3rem)] mb-6">
            {t('Automatização Inteligente de')} <span className="text-jw-gold">{t('Designações Ministeriais')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
            {t('Sistema completo para congregações das Testemunhas de Jeová organizarem designações da Reunião Vida e Ministério Cristão com eficiência e conformidade.')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="hero"
              size="lg"
              className="text-lg px-8 py-4"
              onClick={() => navigate('/auth')}
            >
              {t('Começar Agora')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate('/demo')}
            >
              {t('Ver Demonstração')}
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-center max-w-full">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 min-w-0">
              <h3 className="text-2xl font-bold text-jw-gold mb-2">100+</h3>
              <p className="text-white/90 text-sm sm:text-base">{t('Congregações Atendidas')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 min-w-0">
              <h3 className="text-2xl font-bold text-jw-gold mb-2">95%</h3>
              <p className="text-white/90 text-sm sm:text-base">{t('Redução de Tempo Manual')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 min-w-0">
              <h3 className="text-2xl font-bold text-jw-gold mb-2">24/7</h3>
              <p className="text-white/90 text-sm sm:text-base">{t('Disponibilidade Contínua')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;