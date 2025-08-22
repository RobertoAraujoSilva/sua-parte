import React, { useState, useEffect } from 'react';
import { useUserRole, canViewGlobalProgramming } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  Users, 
  Globe, 
  BookOpen,
  Download,
  Eye,
  RefreshCw,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { ConnectionStatusIndicator } from '@/components/ConnectionStatusBanner';
import PageShell from '@/components/layout/PageShell';

interface GlobalProgramming {
  id: string;
  week_start_date: string;
  week_end_date: string;
  meeting_type: 'midweek' | 'weekend';
  section_name: string;
  part_number: number;
  part_title: string;
  part_duration: number;
  part_type: string;
  status: 'draft' | 'published' | 'archived';
  content_references?: any;
  requirements?: any;
  created_at: string;
}

export default function GlobalProgrammingView() {
  const { role, loading: roleLoading, profile } = useUserRole();
  const [globalProgramming, setGlobalProgramming] = useState<GlobalProgramming[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  // Check access
  if (!roleLoading && !canViewGlobalProgramming(role)) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert className="max-w-md">
            <AlertDescription>
              Acesso negado. Esta área é restrita a administradores e instrutores.
            </AlertDescription>
          </Alert>
        </div>
      </PageShell>
    );
  }

  const loadGlobalProgramming = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load published global programming
      const { data, error: programmingError } = await supabase
        .from('global_programming')
        .select('*')
        .eq('status', 'published')
        .order('week_start_date', { ascending: true })
        .order('part_number', { ascending: true })
        .limit(200);

      if (programmingError) {
        console.error('Error loading global programming:', programmingError);
        setError(programmingError.message);
      } else {
        setGlobalProgramming(data || []);
        
        // Auto-select current week
        const today = new Date();
        const currentWeekData = data?.find(p => {
          const weekStart = new Date(p.week_start_date);
          const weekEnd = new Date(p.week_end_date);
          return today >= weekStart && today <= weekEnd;
        });
        
        if (currentWeekData) {
          setSelectedWeek(currentWeekData.week_start_date);
        }
      }

    } catch (err: any) {
      console.error('Error in loadGlobalProgramming:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading && canViewGlobalProgramming(role)) {
      loadGlobalProgramming();
    }
  }, [role, roleLoading]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getMeetingTypeLabel = (type: string) => {
    return type === 'midweek' ? 'Meio da Semana' : 'Fim de Semana';
  };

  const getSectionLabel = (section: string) => {
    const labels: Record<string, string> = {
      'opening': 'Abertura',
      'treasures': 'Tesouros da Palavra de Deus',
      'ministry': 'Faça Seu Melhor no Ministério',
      'christian_life': 'Nossa Vida Cristã',
      'closing': 'Encerramento'
    };
    return labels[section] || section;
  };

  // Group programming by week
  const weeklyProgramming = globalProgramming.reduce((acc, part) => {
    const weekKey = part.week_start_date;
    if (!acc[weekKey]) {
      acc[weekKey] = {
        week_start_date: part.week_start_date,
        week_end_date: part.week_end_date,
        midweek: [],
        weekend: []
      };
    }
    
    if (part.meeting_type === 'midweek') {
      acc[weekKey].midweek.push(part);
    } else {
      acc[weekKey].weekend.push(part);
    }
    
    return acc;
  }, {} as Record<string, any>);

  const weeks = Object.values(weeklyProgramming).sort((a: any, b: any) => 
    new Date(a.week_start_date).getTime() - new Date(b.week_start_date).getTime()
  );

  const selectedWeekData = selectedWeek ? weeklyProgramming[selectedWeek] : null;

  if (roleLoading || loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800">
              <Globe className="inline-block mr-2 h-8 w-8" />
              Programação Global
            </h1>
            <p className="text-muted-foreground mt-1">
              Programação oficial das reuniões para adaptação local
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Users className="h-3 w-3 mr-1" />
              {profile?.nome_completo || 'Instrutor'}
            </Badge>
            <ConnectionStatusIndicator />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Week Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Semanas Disponíveis
                </CardTitle>
                <CardDescription>
                  {weeks.length} semanas de programação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {weeks.map((week: any) => {
                  const isSelected = selectedWeek === week.week_start_date;
                  const isCurrentWeek = (() => {
                    const today = new Date();
                    const weekStart = new Date(week.week_start_date);
                    const weekEnd = new Date(week.week_end_date);
                    return today >= weekStart && today <= weekEnd;
                  })();

                  return (
                    <Button
                      key={week.week_start_date}
                      variant={isSelected ? "default" : "ghost"}
                      className={`w-full justify-start text-left ${isCurrentWeek ? 'ring-2 ring-green-500' : ''}`}
                      onClick={() => setSelectedWeek(week.week_start_date)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">
                            {formatDate(week.week_start_date)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {week.midweek.length + week.weekend.length} partes
                          </div>
                        </div>
                        {isCurrentWeek && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Programming Details */}
          <div className="lg:col-span-3">
            {selectedWeekData ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">
                    Semana de {formatDate(selectedWeekData.week_start_date)}
                  </h2>
                  <div className="flex gap-2">
                    <Button onClick={loadGlobalProgramming} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                    <Button size="sm">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Adaptar para Congregação
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="midweek" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="midweek">
                      Meio da Semana ({selectedWeekData.midweek.length} partes)
                    </TabsTrigger>
                    <TabsTrigger value="weekend">
                      Fim de Semana ({selectedWeekData.weekend.length} partes)
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="midweek" className="space-y-4">
                    {selectedWeekData.midweek.length === 0 ? (
                      <Card>
                        <CardContent className="flex items-center justify-center py-8">
                          <p className="text-muted-foreground">
                            Nenhuma programação de meio da semana disponível.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      selectedWeekData.midweek.map((part: GlobalProgramming) => (
                        <Card key={part.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">
                                {part.part_number}. {part.part_title}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {part.part_duration} min
                                </Badge>
                                <Badge variant={getStatusBadgeVariant(part.status)}>
                                  {part.status}
                                </Badge>
                              </div>
                            </div>
                            <CardDescription>
                              {getSectionLabel(part.section_name)} • {part.part_type}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                {part.content_references && (
                                  <div className="text-sm text-muted-foreground">
                                    <strong>Referências:</strong> {JSON.stringify(part.content_references)}
                                  </div>
                                )}
                                {part.requirements && (
                                  <div className="text-sm text-muted-foreground">
                                    <strong>Requisitos:</strong> {JSON.stringify(part.requirements)}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Detalhes
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Usar Template
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="weekend" className="space-y-4">
                    {selectedWeekData.weekend.length === 0 ? (
                      <Card>
                        <CardContent className="flex items-center justify-center py-8">
                          <p className="text-muted-foreground">
                            Nenhuma programação de fim de semana disponível.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      selectedWeekData.weekend.map((part: GlobalProgramming) => (
                        <Card key={part.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">
                                {part.part_number}. {part.part_title}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {part.part_duration} min
                                </Badge>
                                <Badge variant={getStatusBadgeVariant(part.status)}>
                                  {part.status}
                                </Badge>
                              </div>
                            </div>
                            <CardDescription>
                              {getSectionLabel(part.section_name)} • {part.part_type}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                {part.content_references && (
                                  <div className="text-sm text-muted-foreground">
                                    <strong>Referências:</strong> {JSON.stringify(part.content_references)}
                                  </div>
                                )}
                                {part.requirements && (
                                  <div className="text-sm text-muted-foreground">
                                    <strong>Requisitos:</strong> {JSON.stringify(part.requirements)}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Detalhes
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Usar Template
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione uma semana para ver a programação detalhada.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
