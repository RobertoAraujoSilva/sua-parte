import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  BookOpen, 
  Video, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from "lucide-react";

const Suporte = () => {
  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Chat Online",
      description: "Suporte em tempo real durante horário comercial",
      availability: "Seg-Sex: 8h às 18h",
      responseTime: "Imediato",
      status: "online"
    },
    {
      icon: Mail,
      title: "E-mail",
      description: "Para dúvidas detalhadas e solicitações específicas",
      availability: "24/7",
      responseTime: "Até 24h",
      status: "available"
    },
    {
      icon: Phone,
      title: "Telefone",
      description: "Suporte direto para casos urgentes",
      availability: "Seg-Sex: 8h às 17h", 
      responseTime: "Imediato",
      status: "limited"
    },
    {
      icon: Video,
      title: "Videochamada",
      description: "Treinamento personalizado para sua congregação",
      availability: "Agendamento",
      responseTime: "Conforme agenda",
      status: "scheduled"
    }
  ];

  const faqItems = [
    {
      question: "Como importar o programa semanal?",
      answer: "Basta fazer upload do PDF oficial da apostila Vida e Ministério Cristão. O sistema reconhece automaticamente e extrai todas as informações necessárias."
    },
    {
      question: "Posso personalizar as regras de designação?",
      answer: "Sim! O sistema permite configurar regras específicas da sua congregação, mantendo sempre a conformidade com as diretrizes da organização."
    },
    {
      question: "Como os estudantes recebem as notificações?",
      answer: "As notificações são enviadas automaticamente por e-mail e podem ser configuradas para WhatsApp, incluindo todos os detalhes da designação."
    },
    {
      question: "O sistema funciona offline?",
      answer: "O acesso principal é online, mas o portal do estudante oferece funcionalidades básicas offline para consulta de designações já baixadas."
    },
    {
      question: "Como garantir a segurança dos dados?",
      answer: "Utilizamos criptografia de ponta a ponta, backups automáticos e todos os dados ficam protegidos em servidores seguros com certificação internacional."
    },
    {
      question: "Existe limite de estudantes?",
      answer: "Não há limite! O sistema suporta congregações de qualquer tamanho, desde pequenos grupos até congregações com centenas de membros."
    }
  ];

  const resources = [
    {
      icon: BookOpen,
      title: "Documentação Completa",
      description: "Guias detalhados para todas as funcionalidades",
      link: "#"
    },
    {
      icon: Video,
      title: "Vídeos Tutoriais",
      description: "Aprenda visualmente como usar cada recurso",
      link: "#"
    },
    {
      icon: HelpCircle,
      title: "Base de Conhecimento",
      description: "Perguntas frequentes e soluções rápidas",
      link: "#"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'available': return 'bg-blue-500';
      case 'limited': return 'bg-yellow-500';
      case 'scheduled': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'available': return 'Disponível';
      case 'limited': return 'Limitado';
      case 'scheduled': return 'Agendado';
      default: return 'Indisponível';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark py-20">
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Central de <span className="text-jw-gold">Suporte</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Estamos aqui para ajudar sua congregação a aproveitar ao máximo 
              todas as funcionalidades do Sistema Ministerial.
            </p>
          </div>
        </section>

        {/* Support Channels */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Canais de Atendimento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportChannels.map((channel, index) => {
                const IconComponent = channel.icon;
                return (
                  <Card key={index} className="border-2 hover:border-jw-blue/20 transition-all duration-300 relative">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-jw-blue/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-6 h-6 text-jw-blue" />
                      </div>
                      <CardTitle className="text-lg">{channel.title}</CardTitle>
                      <div className="absolute top-4 right-4">
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(channel.status)} text-white border-none`}
                        >
                          {getStatusText(channel.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="text-center space-y-2">
                      <CardDescription>{channel.description}</CardDescription>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{channel.availability}</span>
                        </div>
                        <div className="font-medium text-jw-blue">
                          Resposta: {channel.responseTime}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Entre em Contato</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Envie sua Mensagem</CardTitle>
                  <CardDescription>
                    Descreva sua dúvida ou problema e retornaremos o mais breve possível.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nome *</label>
                      <Input placeholder="Seu nome completo" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Congregação</label>
                      <Input placeholder="Nome da congregação" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">E-mail *</label>
                    <Input type="email" placeholder="seu@email.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assunto *</label>
                    <Input placeholder="Resumo da sua dúvida" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mensagem *</label>
                    <Textarea 
                      placeholder="Descreva detalhadamente sua dúvida ou problema..."
                      className="min-h-32"
                    />
                  </div>
                  <Button className="w-full" variant="hero">
                    Enviar Mensagem
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
            <div className="max-w-4xl mx-auto space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index} className="border-2 hover:border-jw-blue/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-jw-blue" />
                      {item.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Recursos de Ajuda</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {resources.map((resource, index) => {
                const IconComponent = resource.icon;
                return (
                  <Card key={index} className="text-center border-2 hover:border-jw-blue/20 transition-all duration-300">
                    <CardHeader>
                      <div className="w-16 h-16 bg-jw-blue/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-jw-blue" />
                      </div>
                      <CardTitle>{resource.title}</CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Acessar Recurso
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Suporte;