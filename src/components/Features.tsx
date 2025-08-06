import { Card } from "@/components/ui/card";
import { Users, BookOpen, Bell, BarChart3, Shield, Smartphone } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Gestão Completa de Estudantes",
      description: "Cadastro detalhado com validação de cargos, parentesco e qualificações congregacionais para designações precisas."
    },
    {
      icon: BookOpen,
      title: "Importação de Programas Semanais",
      description: "Importação automática a partir de PDFs oficiais da apostila Vida e Ministério Cristão com parsing inteligente."
    },
    {
      icon: Bell,
      title: "Notificações Automáticas",
      description: "Envio por e-mail e WhatsApp com detalhes da designação, cena e instruções específicas para cada estudante."
    },
    {
      icon: BarChart3,
      title: "Relatórios e Análises",
      description: "Dashboard completo com histórico de participação, métricas de engajamento e relatórios para coordenadores."
    },
    {
      icon: Shield,
      title: "Conformidade com Regras",
      description: "Algoritmo inteligente que respeita todas as diretrizes da Escola do Ministério Teocrático e regulamentos congregacionais."
    },
    {
      icon: Smartphone,
      title: "Portal do Estudante",
      description: "Interface responsiva para estudantes visualizarem designações, confirmarem participação e contribuírem via doações."
    }
  ];

  return (
    <section id="funcionalidades" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Funcionalidades Principais
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tudo que sua congregação precisa para automatizar e otimizar o processo 
            de designações ministeriais com total conformidade.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 hover:border-jw-blue/30">
              <div className="flex flex-col items-start space-y-4">
                <div className="p-3 bg-jw-blue/10 rounded-lg">
                  <feature.icon className="w-6 h-6 text-jw-blue" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
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