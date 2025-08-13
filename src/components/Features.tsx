import { Card } from "@/components/ui/card";
import { Users, BookOpen, Bell, BarChart3, Shield, Smartphone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Features = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: Users,
      title: t('Gestão Completa de Estudantes'),
      description: t('Cadastro detalhado com validação de cargos, parentesco e qualificações congregacionais para designações precisas.')
    },
    {
      icon: BookOpen,
      title: t('Importação de Programas Semanais'),
      description: t('Importação automática a partir de PDFs oficiais da apostila Vida e Ministério Cristão com parsing inteligente.')
    },
    {
      icon: Bell,
      title: t('Notificações Automáticas'),
      description: t('Envio por e-mail e WhatsApp com detalhes da designação, cena e instruções específicas para cada estudante.')
    },
    {
      icon: BarChart3,
      title: t('Relatórios e Análises'),
      description: t('Dashboard completo com histórico de participação, métricas de engajamento e relatórios para coordenadores.')
    },
    {
      icon: Shield,
      title: t('Conformidade com Regras'),
      description: t('Algoritmo inteligente que respeita todas as diretrizes da Escola do Ministério Teocrático e regulamentos congregacionais.')
    },
    {
      icon: Smartphone,
      title: t('Portal do Estudante'),
      description: t('Interface responsiva para estudantes visualizarem designações, confirmarem participação e contribuírem via doações.')
    }
  ];

  return (
    <section id="funcionalidades" className="py-20 bg-background overflow-x-hidden">
      <div className="responsive-container">
        <div className="text-center mb-16">
          <h2 className="text-balance text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-foreground mb-4">
            {t('Funcionalidades Principais')}
          </h2>
          <p className="text-balance text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('Tudo que sua congregação precisa para automatizar e otimizar o processo de designações ministeriais com total conformidade.')}
          </p>
        </div>
        
        <div className="responsive-grid">
          {features.map((feature, index) => (
            <Card key={index} className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-border/50 hover:border-jw-blue/30 min-w-0">
              <div className="flex flex-col items-start space-y-4">
                <div className="p-3 bg-jw-blue/10 rounded-lg">
                  <feature.icon className="w-6 h-6 text-jw-blue" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;