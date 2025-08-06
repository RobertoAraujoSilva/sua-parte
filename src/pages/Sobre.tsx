import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Target, 
  Users, 
  Code, 
  Shield, 
  Globe,
  Award,
  Clock
} from "lucide-react";

const Sobre = () => {
  const values = [
    {
      icon: Heart,
      title: "Serviço Dedicado",
      description: "Desenvolvido com amor e dedicação para servir às necessidades das congregações das Testemunhas de Jeová."
    },
    {
      icon: Target,
      title: "Conformidade Total",
      description: "Comprometimento absoluto com as diretrizes e regulamentos da organização teocrática."
    },
    {
      icon: Users,
      title: "Comunidade Unida",
      description: "Fortalecendo os laços entre irmãos através da tecnologia e organização eficiente."
    },
    {
      icon: Shield,
      title: "Confiança e Segurança",
      description: "Proteção máxima dos dados congregacionais com as mais altas normas de segurança."
    }
  ];

  const timeline = [
    {
      year: "2022",
      title: "Concepção",
      description: "Identificação da necessidade de automatizar designações ministeriais"
    },
    {
      year: "2023",
      title: "Desenvolvimento",
      description: "Criação do algoritmo inteligente respeitando todas as regras congregacionais"
    },
    {
      year: "2023",
      title: "Testes Beta",
      description: "Implementação piloto em 5 congregações para validação e aperfeiçoamento"
    },
    {
      year: "2024",
      title: "Lançamento",
      description: "Disponibilização oficial para congregações das Testemunhas de Jeová"
    },
    {
      year: "2024",
      title: "Expansão",
      description: "Mais de 100 congregações ativas e milhares de estudantes beneficiados"
    }
  ];

  const features = [
    {
      icon: Code,
      title: "Tecnologia Moderna",
      items: ["React & TypeScript", "Cloud Computing", "Mobile Responsive", "API Robusta"]
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      items: ["Criptografia End-to-End", "Backup Automático", "Controle de Acesso", "Auditoria Completa"]
    },
    {
      icon: Globe,
      title: "Acessibilidade",
      items: ["Multiplataforma", "Interface Intuitiva", "Suporte 24/7", "Documentação Completa"]
    }
  ];

  const stats = [
    { label: "Congregações Ativas", value: "100+", icon: Users },
    { label: "Anos de Desenvolvimento", value: "2+", icon: Clock },
    { label: "Designações Processadas", value: "50K+", icon: Award },
    { label: "Satisfação dos Usuários", value: "98%", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark py-20">
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sobre o <span className="text-jw-gold">Sistema Ministerial</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Desenvolvido com dedicação para servir às necessidades congregacionais 
              e apoiar o trabalho ministerial das Testemunhas de Jeová.
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Nossa Missão</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Facilitar a organização das designações ministeriais através da tecnologia, 
                permitindo que coordenadores e estudantes se concentrem no que realmente importa: 
                o desenvolvimento espiritual e o progresso no ministério cristão.
              </p>
              <Card className="bg-gradient-to-r from-jw-blue/5 to-jw-blue-light/5 border-jw-blue/20">
                <CardContent className="pt-6">
                  <blockquote className="text-xl italic text-center">
                    "Organizem todas as coisas decentemente e em ordem"
                    <footer className="text-sm text-muted-foreground mt-2">— 1 Coríntios 14:40</footer>
                  </blockquote>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nossos Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="text-center border-2 hover:border-jw-blue/20 transition-all duration-300">
                    <CardHeader>
                      <div className="w-12 h-12 bg-jw-blue/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-6 h-6 text-jw-blue" />
                      </div>
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">{value.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nossa Jornada em Números</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="text-center border-2 hover:border-jw-blue/20 transition-all duration-300">
                    <CardContent className="pt-6">
                      <IconComponent className="w-8 h-8 text-jw-blue mx-auto mb-4" />
                      <div className="text-3xl font-bold text-jw-blue mb-2">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Linha do Tempo</h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="bg-jw-blue text-white border-jw-blue px-4 py-2">
                        {item.year}
                      </Badge>
                    </div>
                    <Card className="flex-1">
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technical Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Características Técnicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="border-2 hover:border-jw-blue/20 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-jw-blue/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-jw-blue" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-jw-blue rounded-full"></div>
                            {item}
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

        {/* Commitment */}
        <section className="py-20 bg-gradient-to-r from-jw-blue to-jw-blue-light">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Nosso Compromisso</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg mb-8 opacity-90">
                Estamos comprometidos em fornecer uma ferramenta que não apenas otimize 
                processos administrativos, mas também fortaleça os laços espirituais 
                dentro da congregação, sempre respeitando os princípios e diretrizes 
                da organização das Testemunhas de Jeová.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold mb-2">Inovação</div>
                  <p className="text-sm opacity-80">Sempre buscando melhorias</p>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-2">Qualidade</div>
                  <p className="text-sm opacity-80">Excelência em cada detalhe</p>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-2">Serviço</div>
                  <p className="text-sm opacity-80">Dedicação total aos usuários</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Sobre;