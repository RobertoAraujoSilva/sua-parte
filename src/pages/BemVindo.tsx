import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  ArrowRight, 
  Users, 
  Calendar, 
  FileText, 
  Zap,
  BookOpen,
  Clock,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BemVindo = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const welcomeSteps = [
    {
      title: "Bem-vindo ao Sistema Ministerial! 🎉",
      description: "Você está prestes a descobrir como automatizar e otimizar as designações da sua congregação.",
      icon: Target,
      color: "text-jw-blue"
    },
    {
      title: "Como Funciona o Sistema",
      description: "O Sistema Ministerial segue um fluxo simples e intuitivo para gerar designações automaticamente.",
      icon: Zap,
      color: "text-green-600"
    },
    {
      title: "Vamos Começar!",
      description: "Em poucos minutos você terá seu primeiro programa com designações geradas automaticamente.",
      icon: CheckCircle,
      color: "text-jw-gold"
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: "Cadastrar Estudantes",
      description: "Adicione os estudantes da Escola do Ministério Teocrático",
      icon: Users,
      route: "/estudantes",
      estimated: "5-10 min"
    },
    {
      step: 2,
      title: "Importar Programa",
      description: "Faça upload do PDF da apostila ou cole conteúdo do JW.org",
      icon: Calendar,
      route: "/programas",
      estimated: "2-3 min"
    },
    {
      step: 3,
      title: "Gerar Designações",
      description: "O sistema cria automaticamente as 12 designações da reunião",
      icon: FileText,
      route: "/designacoes",
      estimated: "1 min"
    }
  ];

  const benefits = [
    "✅ Economia de 2-3 horas por semana",
    "✅ Designações balanceadas automaticamente",
    "✅ Conformidade total com diretrizes S-38-T",
    "✅ Histórico completo de participações",
    "✅ Exportação em PDF profissional"
  ];

  useEffect(() => {
    // Auto-advance welcome steps
    if (currentStep < welcomeSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, welcomeSteps.length]);

  const handleGetStarted = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Iniciando configuração inicial...');
      
      // Verificar se o usuário está autenticado
      if (!profile) {
        console.log('⚠️ Usuário não autenticado, redirecionando para login...');
        navigate('/auth');
        return;
      }

      // Verificar se o usuário tem perfil de instrutor
      if (profile.role !== 'instrutor') {
        console.log('⚠️ Usuário não é instrutor, redirecionando para portal do estudante...');
        navigate('/estudante/' + profile.id);
        return;
      }

      console.log('✅ Usuário autenticado como instrutor, marcando onboarding como concluído...');
      
      // Marcar o onboarding como concluído para evitar loop de redirecionamento
      localStorage.setItem('onboarding_completed', 'true');
      console.log('✅ Onboarding marcado como concluído');
      
      // Adicionar um pequeno delay para feedback visual
      setTimeout(() => {
        console.log('🚀 Redirecionando para configuração inicial...');
        navigate('/configuracao-inicial');
      }, 100);

    } catch (error) {
      console.error('❌ Erro ao iniciar configuração:', error);
      // Em caso de erro, marcar como concluído mesmo assim e tentar navegar
      localStorage.setItem('onboarding_completed', 'true');
      navigate('/configuracao-inicial');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipOnboarding = async () => {
    try {
      setIsSkipping(true);
      console.log('🚀 Pular onboarding e ir para Dashboard...');
      
      // Verificar se o usuário está autenticado
      if (!profile) {
        console.log('⚠️ Usuário não autenticado, redirecionando para login...');
        navigate('/auth');
        return;
      }

      // Verificar se o usuário tem perfil de instrutor
      if (profile.role !== 'instrutor') {
        console.log('⚠️ Usuário não é instrutor, redirecionando para portal do estudante...');
        navigate('/estudante/' + profile.id);
        return;
      }

      console.log('✅ Usuário autenticado como instrutor, marcando onboarding como concluído...');
      
      // Marcar o onboarding como concluído para evitar loop de redirecionamento
      localStorage.setItem('onboarding_completed', 'true');
      console.log('✅ Onboarding marcado como concluído');
      
      // Adicionar um pequeno delay para feedback visual
      setTimeout(() => {
        console.log('🚀 Redirecionando para Dashboard...');
        navigate('/dashboard');
      }, 100);

    } catch (error) {
      console.error('❌ Erro ao pular onboarding:', error);
      // Em caso de erro, marcar como concluído mesmo assim e tentar navegar
      localStorage.setItem('onboarding_completed', 'true');
      navigate('/dashboard');
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jw-blue/5 to-jw-gold/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              Bem-vindo, {profile?.nome_completo || 'Instrutor'}!
            </Badge>
            <h1 className="text-4xl font-bold text-jw-navy mb-4">
              {welcomeSteps[currentStep].title}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {welcomeSteps[currentStep].description}
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-center items-center gap-2 mb-8">
            {welcomeSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-jw-blue' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Workflow Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-jw-blue" />
                Como Funciona - 3 Passos Simples
              </CardTitle>
              <CardDescription>
                O Sistema Ministerial automatiza todo o processo de geração de designações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {workflowSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.step} className="relative">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-jw-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-8 h-8 text-jw-blue" />
                        </div>
                        <div className="mb-2">
                          <Badge variant="outline" className="mb-2">
                            Passo {step.step}
                          </Badge>
                          <h3 className="font-semibold text-jw-navy mb-2">
                            {step.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {step.description}
                          </p>
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {step.estimated}
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow connector */}
                      {index < workflowSteps.length - 1 && (
                        <div className="hidden md:block absolute top-8 -right-3 text-gray-300">
                          <ArrowRight className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-jw-navy">
                  Benefícios do Sistema
                </CardTitle>
                <CardDescription>
                  Veja como o Sistema Ministerial vai transformar sua rotina
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-jw-navy">
                  Conformidade S-38-T
                </CardTitle>
                <CardDescription>
                  Seguimos rigorosamente as diretrizes organizacionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-jw-blue rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm">Restrições de Gênero</p>
                      <p className="text-xs text-gray-600">Aplicadas automaticamente conforme S-38-T</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-jw-blue rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm">Qualificações</p>
                      <p className="text-xs text-gray-600">Verificação automática de cargos e experiência</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-jw-blue rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm">Relacionamentos Familiares</p>
                      <p className="text-xs text-gray-600">Identificação automática para partes do ministério</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-jw-blue hover:bg-jw-blue/90 text-white px-8"
                onClick={handleGetStarted}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <ArrowRight className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Configurando...' : 'Começar Configuração'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleSkipOnboarding}
                disabled={isSkipping}
              >
                {isSkipping ? (
                  <svg className="animate-spin h-5 w-5 text-jw-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Pular e Ir para Dashboard"
                )}
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              A configuração inicial leva apenas 5-10 minutos
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BemVindo;
