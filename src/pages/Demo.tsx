import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Play, Users, Calendar, FileText, Bell, BarChart3, Smartphone } from "lucide-react";

const Demo = () => {
  const navigate = useNavigate();

  const demoFeatures = [
    {
      icon: Users,
      title: "Gestão de Estudantes",
      description: "Veja como cadastrar e gerenciar estudantes com validação automática de regras",
      demoImage: "/demo-estudantes.jpg",
      highlights: ["Cadastro com validação", "Controle de qualificações", "Gestão de parentesco"]
    },
    {
      icon: Calendar,
      title: "Importação de Programas",
      description: "Demonstração da importação automática de PDFs da apostila Vida e Ministério",
      demoImage: "/demo-programas.jpg",
      highlights: ["Upload de PDF", "Parsing inteligente", "Validação automática"]
    },
    {
      icon: FileText,
      title: "Geração de Designações",
      description: "Veja o algoritmo em ação criando designações que respeitam todas as regras",
      demoImage: "/demo-designacoes.jpg",
      highlights: ["Algoritmo inteligente", "Conformidade total", "Distribuição equilibrada"]
    },
    {
      icon: Bell,
      title: "Notificações Automáticas",
      description: "Sistema completo de notificações por e-mail e WhatsApp",
      demoImage: "/demo-notificacoes.jpg",
      highlights: ["E-mail personalizado", "WhatsApp integrado", "Confirmação automática"]
    },
    {
      icon: Smartphone,
      title: "Portal do Estudante",
      description: "Interface móvel para estudantes visualizarem e confirmarem designações",
      demoImage: "/demo-portal.jpg",
      highlights: ["Acesso móvel", "Confirmação fácil", "Histórico pessoal"]
    },
    {
      icon: BarChart3,
      title: "Relatórios e Análises",
      description: "Dashboard completo com métricas e relatórios detalhados",
      demoImage: "/demo-relatorios.jpg",
      highlights: ["Métricas em tempo real", "Relatórios personalizados", "Análise de participação"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark py-20">
          <div className="container mx-auto px-4 text-center text-white">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Demonstração <span className="text-jw-gold">Interativa</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Explore todas as funcionalidades do Sistema Ministerial através de exemplos práticos 
                e veja como pode transformar a organização da sua congregação.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="text-lg px-8 py-4"
                  onClick={() => navigate('/auth')}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Começar Teste Gratuito
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => navigate('/funcionalidades')}
                >
                  Ver Todas as Funcionalidades
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-jw-navy mb-4">
                Funcionalidades em Ação
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Cada funcionalidade foi desenvolvida pensando na praticidade e conformidade 
                com as diretrizes congregacionais.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {demoFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="border-2 hover:border-jw-blue/20 transition-all duration-300 hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-jw-blue/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-jw-blue" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                        </div>
                      </div>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Demo Image Placeholder */}
                      <div className="w-full h-48 bg-gradient-to-br from-jw-blue/10 to-jw-blue/5 rounded-lg mb-4 flex items-center justify-center border-2 border-dashed border-jw-blue/20">
                        <div className="text-center">
                          <IconComponent className="w-12 h-12 text-jw-blue/40 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Demonstração Interativa</p>
                        </div>
                      </div>
                      
                      <ul className="space-y-2 mb-4">
                        {feature.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-jw-gold rounded-full mr-3"></div>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/auth')}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Testar Esta Funcionalidade
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Video Demo Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-jw-navy mb-6">
              Vídeo Demonstrativo
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Assista a uma demonstração completa do sistema em funcionamento
            </p>
            
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-jw-navy to-jw-blue rounded-xl flex items-center justify-center border-4 border-white shadow-2xl">
                <div className="text-center text-white">
                  <Play className="w-20 h-20 mx-auto mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold mb-2">Demonstração Completa</h3>
                  <p className="text-lg opacity-90">Vídeo em desenvolvimento</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-jw-blue to-jw-blue-light">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">
              Pronto para Começar?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Junte-se às congregações que já descobriram como a tecnologia pode 
              auxiliar na organização ministerial de forma simples e eficiente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="hero" 
                size="lg" 
                className="text-lg px-8 py-4 bg-white text-jw-blue hover:bg-white/90"
                onClick={() => navigate('/auth')}
              >
                Começar Gratuitamente
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate('/suporte')}
              >
                Falar com Suporte
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Demo;
