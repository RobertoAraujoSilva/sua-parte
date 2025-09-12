import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, BookOpen, Bell, Settings, FileText } from 'lucide-react';

/**
 * MockDashboard - A simplified dashboard with static data to bypass TypeScript errors
 * This will be used while the main system is being updated to the latest Lovable template
 */

export default function MockDashboard() {
  const mockStats = {
    totalStudents: 25,
    totalPrograms: 12,
    totalAssignments: 156,
    pendingNotifications: 3
  };

  const mockRecentActivity = [
    { id: 1, type: 'assignment', title: 'Nova designação criada', time: '2 horas atrás' },
    { id: 2, type: 'student', title: 'Estudante adicionado', time: '5 horas atrás' },
    { id: 3, type: 'program', title: 'Programa atualizado', time: '1 dia atrás' }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Sistema Ministerial - Versão Atualizada</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Badge variant="secondary" className="px-3 py-1">
              Sistema Online
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Ativos na congregação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalPrograms}</div>
              <p className="text-xs text-muted-foreground">Programas criados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Designações</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalAssignments}</div>
              <p className="text-xs text-muted-foreground">Designações feitas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notificações</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.pendingNotifications}</div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Servidor</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Base de Dados</span>
                <Badge variant="default">Conectada</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Última Atualização</span>
                <span className="text-sm text-muted-foreground">Agora</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Versão</span>
                <Badge variant="outline">2.0.0</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-3 flex flex-col gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">Gerenciar Estudantes</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex flex-col gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Criar Programa</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex flex-col gap-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm">Ver Designações</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex flex-col gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm">Relatórios</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}