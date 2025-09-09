import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DonationCard from "@/components/DonationCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Shield, 
  Users, 
  Zap, 
  CheckCircle,
  Smartphone,
  Globe,
  Clock
} from "lucide-react";

const Doar = () => {
  const benefits = [
    {
      icon: Globe,
      title: "Sistema Gratuito",
      description: "Mantemos o sistema 100% gratuito para todas as congregações"
    },
    {
      icon: Zap,
      title: "Melhorias Contínuas",
      description: "Desenvolvimento constante de novas funcionalidades"
    },
    {
      icon: Shield,
      title: "Segurança e Confiabilidade",
      description: "Infraestrutura segura e backups automáticos"
    },
    {
      icon: Users,
      title: "Suporte Dedicado",
      description: "Atendimento personalizado para sua congregação"
    }
  ];

  const howItHelps = [
    "Manutenção dos servidores e infraestrutura",
    "Desenvolvimento de novas funcionalidades",
    "Suporte técnico especializado",
    "Backups e segurança dos dados",
    "Melhorias na interface e experiência do usuário"
  ];

  const paymentMethods = [
    {
      icon: Smartphone,
      title: "PIX",
      description: "Instantâneo e sem taxas",
      highlight: true
    },
    {
      icon: Globe,
      title: "Wise",
      description: "Para doações internacionais",
      highlight: false
    },
    {
      icon: CheckCircle,
      title: "Cartão",
      description: "Via Stripe (em breve)",
      highlight: false
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
              <Heart className="w-16 h-16 mx-auto mb-6 text-jw-gold" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Apoie o <span className="text-jw-gold">Sistema Ministerial</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Sua contribuição mantém o sistema gratuito e em constante evolução 
                para todas as congregações ao redor do mundo.
              </p>
              <Badge variant="outline" className="text-jw-gold border-jw-gold text-lg px-4 py-2">
                100% Transparente • 100% Gratuito
              </Badge>
            </div>
          </div>
        </section>

        {/* Donation Card Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <DonationCard 
                title="Faça sua Contribuição"
                description="Escolha o método de pagamento que preferir. Qualquer valor faz a diferença!"
                showRecipientInfo={true}
                showExternalOptions={true}
                qrSize={180}
                className="mb-12"
              />
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Métodos de Pagamento</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paymentMethods.map((method, index) => {
                  const IconComponent = method.icon;
                  return (
                    <Card 
                      key={index} 
                      className={`text-center border-2 transition-all duration-300 ${
                        method.highlight 
                          ? 'border-jw-gold/50 bg-jw-gold/5' 
                          : 'hover:border-jw-blue/20'
                      }`}
                    >
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                          method.highlight 
                            ? 'bg-jw-gold/20' 
                            : 'bg-jw-blue/10'
                        }`}>
                          <IconComponent className={`w-6 h-6 ${
                            method.highlight 
                              ? 'text-jw-gold' 
                              : 'text-jw-blue'
                          }`} />
                        </div>
                        <CardTitle className="text-lg">{method.title}</CardTitle>
                        <CardDescription>{method.description}</CardDescription>
                        {method.highlight && (
                          <Badge variant="outline" className="text-jw-gold border-jw-gold mx-auto">
                            Recomendado
                          </Badge>
                        )}
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* How Your Donation Helps */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Como Sua Doação Ajuda</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-2 border-jw-blue/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-jw-blue" />
                      Investimento Direto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {howItHelps.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-jw-gold/20 bg-jw-gold/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Benefícios para Todos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {benefits.map((benefit, index) => {
                        const IconComponent = benefit.icon;
                        return (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-jw-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <IconComponent className="w-4 h-4 text-jw-blue" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{benefit.title}</h4>
                              <p className="text-xs text-muted-foreground">{benefit.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Como Doar</h2>
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-jw-blue text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">Escaneie o QR Code</h3>
                        <p className="text-sm text-muted-foreground">
                          Use o app do seu banco para escanear o QR Code PIX
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-jw-blue text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">Ou copie a chave PIX</h3>
                        <p className="text-sm text-muted-foreground">
                          Use os botões para copiar a chave ou o código Copia e Cola
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-jw-blue text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">Confirme a doação</h3>
                        <p className="text-sm text-muted-foreground">
                          Escolha o valor e confirme no seu app bancário
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Doar;
