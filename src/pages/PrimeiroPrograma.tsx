import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Calendar, 
  FileText, 
  Play,
  BookOpen,
  Lightbulb,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrimeiroPrograma = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [currentDemo, setCurrentDemo] = useState(0);

  const demoSteps = [
    {
      title: "1. Cadastre os Estudantes",
      description: "Primeiro, vamos adicionar os estudantes da Escola do Ministério Teocrático",
      icon: Users,
      action: "Ir para Estudantes",
      route: "/estudantes",
      tips: [
        "Adicione nome completo e cargo de cada estudante",
        "Marque relacionamentos familiares para partes do ministério",
        "Configure qualificações conforme diretrizes S-38-T"
      ]
    },
    {
      title: "2. Importe um Programa",
      description: "Agora vamos importar o programa da apostila Vida e Ministério Cristão",
      icon: Calendar,
      action: "Ir para Programas",
      route: "/programas",
      tips: [
        "Faça upload do PDF oficial da apostila",
        "Ou cole o conteúdo diretamente do JW.org",
        "O sistema identifica automaticamente as 12 partes da reunião"
      ]
    },
    {
      title: "3. Gere as Designações",
      description: "Por fim, o sistema criará automaticamente todas as designações",
      icon: FileText,
      action: "Ver Como Funciona",
      route: "/programas",
      tips: [
        "Clique em 'Gerar Designações' no programa importado",
        "Revise as designações na página de preview",
        "Aprove quando estiver satisfeito com o resultado"
      ]
    }
  ];

  const features = [
    {
      icon: Target,
      title: "Conformidade S-38-T",
      description: "Todas as designações seguem rigorosamente as diretrizes organizacionais"
    },
    {
      icon: Lightbulb,
      title: "Inteligência Artificial",
      description: "Algoritmo inteligente distribui designações de forma balanceada"
    },
    {
      icon: BookOpen,
      title: "Estrutura Completa",
      description: "Suporte total à estrutura de 12 partes da reunião semanal"
    }
  ];

  const handleStartDemo = (route: string) => {
    navigate(route);
  };

  const handleFinishOnboarding = () => {
    // Mark onboarding as completed
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('first_time_user', 'false');
    
    navigate('/dashboard');
  };

  const handleSkipToStudents = () => {
    navigate('/estudantes');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jw-blue/5 to-jw-gold/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Último Passo - Tutorial Prático
            </Badge>
            <h1 className="text-4xl font-bold text-jw-navy mb-4">
              Vamos Criar Seu Primeiro Programa! 🎯
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Siga este tutorial prático para criar seu primeiro programa com designações automáticas
            </p>
          </div>

          {/* Demo Steps */}
          <div className="space-y-6 mb-12">
            {demoSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentDemo;
              
              return (
                <Card key={index} className={`transition-all ${
                  isActive ? 'ring-2 ring-jw-blue shadow-lg' : 'hover:shadow-md'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-jw-blue text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-jw-navy">
                            {step.title}
                          </CardTitle>
                          <CardDescription>
                            {step.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleStartDemo(step.route)}
                        className={isActive ? 'bg-jw-blue hover:bg-jw-blue/90' : ''}
                        variant={isActive ? 'default' : 'outline'}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {step.action}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {isActive && (
                    <CardContent>
                      <div className="bg-jw-blue/5 rounded-lg p-4">
                        <h4 className="font-medium text-jw-navy mb-3">Dicas importantes:</h4>
                        <ul className="space-y-2">
                          {step.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Features Highlight */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-jw-navy">
                Por que o Sistema Ministerial é Especial?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 bg-jw-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-jw-blue" />
                      </div>
                      <h3 className="font-semibold text-jw-navy mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Start Alert */}
          <Alert className="mb-8">
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> Se você já tem estudantes cadastrados, pode começar diretamente 
              importando um programa. O sistema funciona melhor com pelo menos 8-10 estudantes cadastrados.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
                onClick={handleSkipToStudents}
              >
                <Users className="w-5 h-5 mr-2" />
                Começar com Estudantes
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleFinishOnboarding}
              >
                Ir para Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Você pode acessar este tutorial novamente a qualquer momento no menu Ajuda
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrimeiroPrograma;
