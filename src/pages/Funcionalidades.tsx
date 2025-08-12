import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Features from "@/components/Features";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Users, BarChart, Shield, Smartphone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Funcionalidades = () => {
  const { t } = useTranslation();
  const detailedFeatures = [
    {
      icon: Users,
      title: t('Gestão Completa de Estudantes'),
      description: t('Cadastro detalhado com validação de cargos, parentesco e qualificações congregacionais para designações precisas.'),
      benefits: [
        t('Controle de qualificações ministeriais'),
        t('Gestão de relações familiares'),
        t('Histórico de participações'),
        t('Validação automática de regras')
      ]
    },
    {
      icon: Clock,
      title: t('Importação de Programas Semanais'),
      description: t('Importação automática a partir de PDFs oficiais da apostila Vida e Ministério Cristão com parsing inteligente.'),
      benefits: [
        t('Reconhecimento automático de PDFs'),
        t('Extração inteligente de dados'),
        t('Sincronização com calendário'),
        t('Validação de conteúdo')
      ]
    },
    {
      icon: Smartphone,
      title: t('Notificações Automáticas'),
      description: t('Envio por e-mail e WhatsApp com detalhes da designação, cena e instruções específicas para cada estudante.'),
      benefits: [
        t('E-mail personalizado'),
        t('Integração WhatsApp'),
        t('Lembretes automáticos'),
        t('Confirmação de recebimento')
      ]
    },
    {
      icon: BarChart,
      title: t('Relatórios e Análises'),
      description: t('Dashboard completo com histórico de participação, métricas de engajamento e relatórios para coordenadores.'),
      benefits: [
        t('Métricas de participação'),
        t('Relatórios personalizados'),
        t('Análise de desempenho'),
        t('Exportação de dados')
      ]
    },
    {
      icon: Shield,
      title: t('Conformidade com Regras'),
      description: t('Algoritmo inteligente que respeita todas as diretrizes da Escola do Ministério Teocrático e regulamentos congregacionais.'),
      benefits: [
        t('Validação de regras automática'),
        t('Respeito às diretrizes'),
        t('Controle de gênero'),
        t('Gestão de privilégios')
      ]
    },
    {
      icon: CheckCircle,
      title: t('Portal do Estudante'),
      description: t('Interface responsiva para estudantes visualizarem designações, confirmarem participação e contribuírem via doações.'),
      benefits: [
        t('Acesso móvel otimizado'),
        t('Confirmação de participação'),
        t('Histórico pessoal'),
        t('Sistema de doações')
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
              {t('Funcionalidades')} <span className="text-jw-gold">{t('Completas')}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              {t('Tudo que sua congregação precisa para automatizar e otimizar o processo de designações ministeriais com total conformidade.')}
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
            <h2 className="text-3xl font-bold text-center mb-12">{t('Especificações Técnicas')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Performance')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• {t('Processamento em tempo real')}</li>
                    <li>• {t('99.9% de disponibilidade')}</li>
                    <li>• {t('Backup automático diário')}</li>
                    <li>• {t('Sincronização instantânea')}</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('Segurança')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• {t('Criptografia end-to-end')}</li>
                    <li>• {t('Autenticação segura')}</li>
                    <li>• {t('Controle de acesso')}</li>
                    <li>• {t('Auditoria completa')}</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('Compatibilidade')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• {t('Acesso web e mobile')}</li>
                    <li>• {t('Integração WhatsApp')}</li>
                    <li>• {t('Importação PDF')}</li>
                    <li>• {t('Exportação de dados')}</li>
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