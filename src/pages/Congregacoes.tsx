import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, Star } from "lucide-react";

const Congregacoes = () => {
  const testimonials = [
    {
      congregation: "Congregação Central",
      city: "São Paulo, SP",
      members: 120,
      coordinator: "Irmão Silva",
      testimonial: "O Sistema Ministerial revolucionou nossa organização. Reduzimos o tempo de preparação das designações de 3 horas para 15 minutos!",
      rating: 5,
      monthsUsing: 18
    },
    {
      congregation: "Congregação Norte",
      city: "Rio de Janeiro, RJ", 
      members: 85,
      coordinator: "Irmão Santos",
      testimonial: "Excelente ferramenta! Os estudantes agora recebem suas designações automaticamente e podem confirmar participação pelo celular.",
      rating: 5,
      monthsUsing: 12
    },
    {
      congregation: "Congregação Oeste",
      city: "Belo Horizonte, MG",
      members: 95,
      coordinator: "Irmão Oliveira",
      testimonial: "A conformidade com as regras congregacionais é perfeita. Nunca mais tivemos problemas com designações inadequadas.",
      rating: 5,
      monthsUsing: 8
    },
    {
      congregation: "Congregação Sul",
      city: "Porto Alegre, RS",
      members: 110,
      coordinator: "Irmão Costa",
      testimonial: "O portal do estudante é fantástico. Os jovens estão mais engajados e organizados com suas participações ministeriais.",
      rating: 5,
      monthsUsing: 15
    }
  ];

  const stats = [
    { label: "Congregações Ativas", value: "100+", icon: Users },
    { label: "Estudantes Cadastrados", value: "2.500+", icon: Users },
    { label: "Designações Geradas", value: "50.000+", icon: Calendar },
    { label: "Satisfação", value: "98%", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark py-20">
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Congregações <span className="text-jw-gold">Parceiras</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Mais de 100 congregações já experimentam a eficiência da automação ministerial.
              Junte-se a esta comunidade crescente de servos organizados.
            </p>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
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

        {/* Testimonials */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Depoimentos das Congregações</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-2 hover:border-jw-blue/20 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{testimonial.congregation}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4" />
                          {testimonial.city}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          {testimonial.members} membros
                        </Badge>
                        <div className="flex items-center gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-jw-gold text-jw-gold" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-sm mb-4 italic">
                      "{testimonial.testimonial}"
                    </blockquote>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>— {testimonial.coordinator}</span>
                      <span>Usando há {testimonial.monthsUsing} meses</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Histórias de Sucesso</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-2xl text-jw-blue">95%</CardTitle>
                  <CardDescription>Redução no Tempo de Preparação</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Coordenadores relatam que o tempo gasto organizando designações 
                    reduziu drasticamente, permitindo mais foco no desenvolvimento espiritual.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-2xl text-jw-blue">87%</CardTitle>
                  <CardDescription>Aumento no Engajamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Estudantes demonstram maior participação e pontualidade nas 
                    designações após implementação do sistema de notificações.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-2xl text-jw-blue">100%</CardTitle>
                  <CardDescription>Conformidade com Regras</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Zero erros de designação inadequada desde a implementação, 
                    garantindo total conformidade com as diretrizes congregacionais.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-jw-blue to-jw-blue-light">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">
              Sua Congregação Pode Ser a Próxima!
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Junte-se às congregações que já descobriram como a tecnologia pode 
              auxiliar na organização ministerial de forma simples e eficiente.
            </p>
            <Button variant="hero" size="lg" className="text-lg px-8 py-4 bg-white text-jw-blue hover:bg-white/90">
              Começar Gratuitamente
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Congregacoes;