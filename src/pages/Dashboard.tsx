import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, Settings, Plus, CalendarDays, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEstudantes } from '@/hooks/useEstudantes';
import TemplateDownload from '@/components/TemplateDownload';
import Header from '@/components/Header';
import { DebugPanel } from '@/components/DebugPanel';
import { TutorialButton } from '@/components/tutorial';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getStatistics } = useEstudantes();

  // Get real-time statistics
  const statistics = getStatistics();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const dashboardCards = [
    {
      title: "Estudantes",
      description: "Gerenciar estudantes da escola ministerial",
      icon: Users,
      href: "/estudantes",
      action: "Gerenciar Estudantes"
    },
    {
      title: "Programas",
      description: "Importar e gerenciar programas semanais",
      icon: Calendar,
      href: "/programas",
      action: "Ver Programas"
    },
    {
      title: "Designações",
      description: "Gerar e visualizar designações automáticas",
      icon: FileText,
      href: "/designacoes",
      action: "Ver Designações"
    },
    {
      title: "Reuniões",
      description: "Gerenciar reuniões, eventos especiais e designações administrativas",
      icon: CalendarDays,
      href: "/reunioes",
      action: "Gerenciar Reuniões"
    },
    {
      title: "Relatórios",
      description: "Relatórios de participação e engajamento",
      icon: Settings,
      href: "/relatorios",
      action: "Ver Relatórios"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-jw-navy mb-2">
                Painel de Controle
              </h2>
              <p className="text-muted-foreground">
                Gerencie designações ministeriais de forma inteligente e eficiente
              </p>
            </div>
            <TutorialButton page="dashboard" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8" data-tutorial="quick-actions">
          <h3 className="text-lg font-semibold text-jw-navy mb-4">Ações Rápidas</h3>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="hero"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate('/estudantes')}
            >
              <Plus className="w-4 h-4" />
              Novo Estudante
            </Button>
            <Button
              variant="ministerial"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate('/programas')}
            >
              <Calendar className="w-4 h-4" />
              Importar Programa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate('/designacoes')}
            >
              <FileText className="w-4 h-4" />
              Gerar Designações
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate('/estudantes?tab=import')}
            >
              <Upload className="w-4 h-4" />
              Importar Planilha
            </Button>
            <TemplateDownload
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            />
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tutorial="dashboard-cards">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-jw-blue/10 rounded-lg">
                      <Icon className="w-6 h-6 text-jw-blue" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-jw-navy">
                        {card.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {card.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(card.href)}
                  >
                    {card.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Overview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6" data-tutorial="stats-overview">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Estudantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-jw-navy">{statistics.total}</div>
              <p className="text-xs text-muted-foreground">
                Cadastrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Programas Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-jw-navy">0</div>
              <p className="text-xs text-muted-foreground">
                Semanas programadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Designações Geradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-jw-navy">0</div>
              <p className="text-xs text-muted-foreground">
                Neste mês
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </main>

      {/* Debug Panel - Fixed position */}
      <DebugPanel position="fixed" />
    </div>
  );
};

export default Dashboard;