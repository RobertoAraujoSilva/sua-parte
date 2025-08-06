import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, Settings, Plus, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao sair. Tente novamente.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sessão encerrada",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/');
    }
  };

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
      {/* Header */}
      <header className="bg-jw-navy text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-jw-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <h1 className="text-xl font-semibold">Sistema Ministerial</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-jw-gold">
                Olá, {user.user_metadata?.nome_completo || user.email}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-white hover:text-jw-gold"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-jw-navy mb-2">
            Painel de Controle
          </h2>
          <p className="text-muted-foreground">
            Gerencie designações ministeriais de forma inteligente e eficiente
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
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
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Estudantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-jw-navy">0</div>
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
      </main>
    </div>
  );
};

export default Dashboard;