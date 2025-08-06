import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-ministerial.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark min-h-[600px] flex items-center">
      <div className="absolute inset-0 bg-black/40"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>
      
      <div className="relative container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Automatização Inteligente de 
            <span className="text-jw-gold"> Designações Ministeriais</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
            Sistema completo para congregações das Testemunhas de Jeová organizarem 
            designações da Reunião Vida e Ministério Cristão com eficiência e conformidade.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="hero"
              size="lg"
              className="text-lg px-8 py-4"
              onClick={() => navigate('/auth')}
            >
              Começar Agora
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate('/demo')}
            >
              Ver Demonstração
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-jw-gold mb-2">100+</h3>
              <p className="text-white/90">Congregações Atendidas</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-jw-gold mb-2">95%</h3>
              <p className="text-white/90">Redução de Tempo Manual</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-jw-gold mb-2">24/7</h3>
              <p className="text-white/90">Disponibilidade Contínua</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;