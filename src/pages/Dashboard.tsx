import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, Settings, Plus, CalendarDays, Upload, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEstudantes } from '@/hooks/useEstudantes';
import { useTranslation } from '@/hooks/useTranslation';
import TemplateDownload from '@/components/TemplateDownload';
import Header from '@/components/Header';
import { DebugPanel } from '@/components/DebugPanel';
import { TutorialButton } from '@/components/tutorial';
import { UserFlowGuide } from '@/components/UserFlowGuide';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getStatistics } = useEstudantes();

  // Get real-time statistics from students
  const statistics = getStatistics();

  // State for dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    programsCount: 0,
    assignmentsCount: 0,
    loadingStats: true
  });

  // Load real dashboard statistics from database
  const loadDashboardStats = async () => {
    if (!user?.id) {
      setDashboardStats(prev => ({ ...prev, loadingStats: false }));
      return;
    }

    try {
      console.log('📊 Loading dashboard statistics for user:', user.id);

      // Load programs and assignments counts in parallel
      const [programsResult, assignmentsResult] = await Promise.all([
        supabase
          .from('programas')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('status', 'ativo'),

        supabase
          .from('designacoes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()) // This month
      ]);

      const programsCount = programsResult.count || 0;
      const assignmentsCount = assignmentsResult.count || 0;

      console.log('✅ Dashboard stats loaded:', { programsCount, assignmentsCount });

      setDashboardStats({
        programsCount,
        assignmentsCount,
        loadingStats: false
      });

    } catch (error) {
      console.error('❌ Error loading dashboard statistics:', error);
      setDashboardStats(prev => ({ ...prev, loadingStats: false }));
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Load dashboard statistics when user is available
  useEffect(() => {
    if (user?.id) {
      loadDashboardStats();
    }
  }, [user?.id]);

  if (!user) {
    return null;
  }

  const dashboardCards = [
    {
      title: t('navigation.students'),
      description: t('dashboard.manageStudentsDesc'),
      icon: Users,
      href: "/estudantes",
      action: t('dashboard.manageStudents')
    },
    {
      title: t('navigation.programs'),
      description: t('dashboard.manageProgramsDesc'),
      icon: Calendar,
      href: "/programas",
      action: t('dashboard.viewPrograms')
    },
    {
      title: t('navigation.assignments'),
      description: t('dashboard.manageAssignmentsDesc'),
      icon: FileText,
      href: "/designacoes",
      action: t('dashboard.viewAssignments')
    },
    {
      title: t('dashboard.meetings'),
      description: t('dashboard.manageMeetingsDesc'),
      icon: CalendarDays,
      href: "/reunioes",
      action: t('dashboard.manageMeetings')
    },
    {
      title: t('navigation.reports'),
      description: t('dashboard.reportsDesc'),
      icon: Settings,
      href: "/relatorios",
      action: t('dashboard.viewReports')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="pt-16">
        <div className="container mx-auto px-2 md:px-6 py-6 md:py-8">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-jw-navy mb-2">{t('dashboard.title')}</h2>
                <p className="text-muted-foreground text-base md:text-lg">{t('dashboard.subtitle')}</p>
              </div>
              <TutorialButton page="dashboard" />
            </div>
          </div>

          {/* User Flow Guide */}
          <div className="mb-8">
            <UserFlowGuide onNavigate={(route) => navigate(route)} />
          </div>

          {/* Quick Actions */}
          <div className="mb-8" data-tutorial="quick-actions">
            <h3 className="text-base md:text-lg font-semibold text-jw-navy mb-4">{t('dashboard.quickActions')}</h3>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <Button
                variant="hero"
                size="sm"
                className="flex items-center gap-2 min-w-[150px] md:min-w-[180px]"
                onClick={() => navigate('/estudantes')}
              >
                <Plus className="w-4 h-4" />
                {t('dashboard.newStudent')}
              </Button>
              <Button
                variant="ministerial"
                size="sm"
                className="flex items-center gap-2 min-w-[150px] md:min-w-[180px]"
                onClick={() => navigate('/programas')}
              >
                <Calendar className="w-4 h-4" />
                {t('dashboard.importProgram')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 min-w-[150px] md:min-w-[180px]"
                onClick={() => navigate('/designacoes')}
              >
                <FileText className="w-4 h-4" />
                {t('dashboard.generateAssignments')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 min-w-[150px] md:min-w-[180px]"
                onClick={() => navigate('/estudantes?tab=import')}
              >
                <Upload className="w-4 h-4" />
                {t('dashboard.importSpreadsheet')}
              </Button>
              <TemplateDownload
                variant="outline"
                size="sm"
                className="flex items-center gap-2 min-w-[150px] md:min-w-[180px]"
              />
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" data-tutorial="dashboard-cards">
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
                        <CardTitle className="text-base md:text-lg text-jw-navy">
                          {card.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-xs md:text-sm">
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
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" data-tutorial="stats-overview">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {t('dashboard.totalStudents')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-jw-navy">{statistics.total}</div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.registeredInSystem')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {t('dashboard.activePrograms')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-jw-navy">
                  {dashboardStats.loadingStats ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                  ) : (
                    dashboardStats.programsCount
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.scheduledWeeks')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {t('dashboard.generatedAssignments')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-jw-navy">
                  {dashboardStats.loadingStats ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                  ) : (
                    dashboardStats.assignmentsCount
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.thisMonth')}
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