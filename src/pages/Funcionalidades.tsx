import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Features from "@/components/Features";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Users, BarChart, Shield, Smartphone } from "lucide-react";

const Funcionalidades = () => {
  const detailedFeatures = [
    {
      icon: Users,
      title: "Gestão Completa de Estudantes",
      description: "Cadastro detalhado com validação de cargos, parentesco e qualificações congregacionais para designações precisas.",
      benefits: [
        "Controle de qualificações ministeriais",
        "Gestão de relações familiares",
        "Histórico de participações",
        "Validação automática de regras"
      ]
    },
    {
      icon: Clock,
      title: "Importação de Programas Semanais",
      description: "Importação automática a partir de PDFs oficiais da apostila Vida e Ministério Cristão com parsing inteligente.",
      benefits: [
        "Reconhecimento automático de PDFs",
        "Extração inteligente de dados",
        "Sincronização com calendário",
        "Validação de conteúdo"
      ]
    },
    {
      icon: Smartphone,
      title: "Notificações Automáticas",
      description: "Envio por e-mail e WhatsApp com detalhes da designação, cena e instruções específicas para cada estudante.",
      benefits: [
        "E-mail personalizado",
        "Integração WhatsApp",
        "Lembretes automáticos",
        "Confirmação de recebimento"
      ]
    },
    {
      icon: BarChart,
      title: "Relatórios e Análises",
      description: "Dashboard completo com histórico de participação, métricas de engajamento e relatórios para coordenadores.",
      benefits: [
        "Métricas de participação",
        "Relatórios personalizados",
        "Análise de desempenho",
        "Exportação de dados"
      ]
    },
    {
      icon: Shield,
      title: "Conformidade com Regras",
      description: "Algoritmo inteligente que respeita todas as diretrizes da Escola do Ministério Teocrático e regulamentos congregacionais.",
      benefits: [
        "Validação de regras automática",
        "Respeito às diretrizes",
        "Controle de gênero",
        "Gestão de privilégios"
      ]
    },
    {
      icon: CheckCircle,
      title: "Portal do Estudante",
      description: "Interface responsiva para estudantes visualizarem designações, confirmarem participação e contribuírem via doações.",
      benefits: [
        "Acesso móvel otimizado",
        "Confirmação de participação",
        "Histórico pessoal",
        "Sistema de doações"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark py-20">
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Funcionalidades <span className="text-jw-gold">Completas</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Tudo que sua congregação precisa para automatizar e otimizar o processo de 
              designações ministeriais com total conformidade.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {detailedFeatures.map((feature, index) => {
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
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-jw-blue" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Especificações Técnicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Processamento em tempo real</li>
                    <li>• 99.9% de disponibilidade</li>
                    <li>• Backup automático diário</li>
                    <li>• Sincronização instantânea</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Criptografia end-to-end</li>
                    <li>• Autenticação segura</li>
                    <li>• Controle de acesso</li>
                    <li>• Auditoria completa</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Compatibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Acesso web e mobile</li>
                    <li>• Integração WhatsApp</li>
                    <li>• Importação PDF</li>
                    <li>• Exportação de dados</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Funcionalidades;