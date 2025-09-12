import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { UserFlowGuide } from "@/components/UserFlowGuide";
import QuickActions from "@/components/QuickActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LoadingCard, InfoState } from "@/components/shared/LoadingStates";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { currentStep, steps, isComplete, systemData, loading } = useOnboarding();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jw-blue/5 to-jw-gold/5">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <LoadingCard 
            title="Carregando Dashboard"
            description="Verificando sistema e configurações..."
          />
        </div>
        <Footer />
      </div>
    );
  }

  // Se onboarding não está completo, mostrar guia
  if (!isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jw-blue/5 to-jw-gold/5">
        <Header />
        
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-6xl mx-auto">
            {/* Header with progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-jw-navy">
                    Bem-vindo, {profile?.nome_completo || 'Instrutor'}
                  </h1>
                  <p className="text-gray-600">
                    Configure seu sistema para começar a gerenciar designações
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/configuracao-inicial')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso da Configuração</span>
                  <span className="text-sm text-gray-600">
                    {steps.filter(s => s.completed).length} de {steps.length} passos
                  </span>
                </div>
                <Progress 
                  value={(steps.filter(s => s.completed).length / steps.length) * 100} 
                  className="w-full"
                />
              </div>
            </div>

            <UserFlowGuide onNavigate={handleNavigate} />
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // Dashboard completo
  const stats = [
    {
      title: "Estudantes Ativos",
      value: systemData.studentsCount || 0,
      icon: Users,
      route: "/estudantes",
      color: "text-blue-600"
    },
    {
      title: "Programas Importados", 
      value: systemData.programsCount || 0,
      icon: Calendar,
      route: "/programas",
      color: "text-green-600"
    },
    {
      title: "Designações Geradas",
      value: systemData.assignmentsCount || 0,
      icon: FileText,
      route: "/designacoes",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-jw-blue/5 to-jw-gold/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-jw-navy mb-2">
                  Dashboard Principal
                </h1>
                <p className="text-gray-600">
                  {profile?.congregacao} • {profile?.cargo}
                </p>
              </div>
              
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Sistema Configurado
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(stat.route)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      Total cadastrados
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse as funcionalidades mais utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>

          {/* Status Alerts */}
          {systemData.hasPendingPrograms && (
            <InfoState
              title="Programas Pendentes"
              message="Há programas importados aguardando geração de designações."
              onAction={() => navigate('/programas')}
              actionLabel="Gerar Designações"
              className="mb-6"
            />
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Sistema configurado com sucesso</p>
                    <p className="text-sm text-gray-600">Todos os passos foram concluídos</p>
                  </div>
                </div>
                
                {systemData.studentsCount > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">
                        {systemData.studentsCount} estudantes cadastrados
                      </p>
                      <p className="text-sm text-gray-600">
                        Prontos para receber designações
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;