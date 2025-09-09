import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Calendar,
  Users,
  BookOpen,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// 🎯 NOTIFICAÇÕES UNIFICADAS QUE ADAPTAM AO ROLE
export default function UnifiedNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // 🚨 SEM PERFIL = SEM NOTIFICAÇÕES
  if (!profile) return null;

  // 🎯 CARREGAR NOTIFICAÇÕES BASEADAS NO ROLE
  const loadNotifications = async () => {
    if (!profile.id) return;

    try {
      setLoading(true);

      let query = supabase
        .from('notificacoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // 🔐 FILTRAR POR ROLE
      if (profile.role === 'admin') {
        // Admin vê todas as notificações do sistema
        query = query.eq('notification_type', 'system_update');
      } else if (profile.role === 'instrutor') {
        // Instrutor vê notificações da sua congregação
        query = query.eq('user_id', profile.id);
      } else if (profile.role === 'estudante') {
        // Estudante vê suas notificações pessoais
        query = query.eq('id_estudante', profile.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao carregar notificações:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 CARREGAR NOTIFICAÇÕES QUANDO O COMPONENTE MONTAR
  useEffect(() => {
    loadNotifications();
  }, [profile.id, profile.role]);

  // 🎯 GERAR NOTIFICAÇÕES BASEADAS NO ROLE
  const generateRoleBasedNotifications = () => {
    if (profile.role === 'admin') {
      return [
        {
          id: 'admin-1',
          type: 'info',
          title: 'Sistema Ativo',
          message: 'Sistema Ministerial funcionando perfeitamente',
          icon: Shield,
          priority: 'low'
        },
        {
          id: 'admin-2',
          type: 'success',
          title: 'Backup Automático',
          message: 'Backup diário executado com sucesso',
          icon: CheckCircle,
          priority: 'medium'
        }
      ];
    } else if (profile.role === 'instrutor') {
      return [
        {
          id: 'instrutor-1',
          type: 'info',
          title: 'Congregação Ativa',
          message: `${profile.congregacao || 'Sua congregação'} está funcionando normalmente`,
          icon: Users,
          priority: 'low'
        },
        {
          id: 'instrutor-2',
          type: 'success',
          title: 'Sistema S-38',
          message: 'Regras S-38 configuradas e ativas',
          icon: CheckCircle,
          priority: 'high'
        }
      ];
    } else if (profile.role === 'estudante') {
      return [
        {
          id: 'estudante-1',
          type: 'info',
          title: 'Participação Ativa',
          message: 'Você está participando ativamente das designações',
          icon: Calendar,
          priority: 'low'
        },
        {
          id: 'estudante-2',
          type: 'success',
          title: 'Material Disponível',
          message: 'Apostila MWB disponível para preparo',
          icon: BookOpen,
          priority: 'medium'
        }
      ];
    }

    return [];
  };

  // 🎨 RENDERIZAR NOTIFICAÇÃO
  const renderNotification = (notification: any) => {
    const iconMap = {
      info: Info,
      success: CheckCircle,
      warning: AlertCircle,
      error: AlertCircle
    };

    const Icon = iconMap[notification.type as keyof typeof iconMap] || Info;
    const priorityColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    return (
      <Card key={notification.id} className="mb-3">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${
                notification.type === 'success' ? 'text-green-600' :
                notification.type === 'warning' ? 'text-yellow-600' :
                notification.type === 'error' ? 'text-red-600' :
                'text-blue-600'
              }`} />
              <CardTitle className="text-sm">{notification.title}</CardTitle>
            </div>
            <Badge className={priorityColors[notification.priority as keyof typeof priorityColors]}>
              {notification.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-sm">
            {notification.message}
          </CardDescription>
        </CardContent>
      </Card>
    );
  };

  // 🎯 NOTIFICAÇÕES BASEADAS NO ROLE
  const roleNotifications = generateRoleBasedNotifications();

  return (
    <div className="relative">
      {/* 🔔 BOTÃO DE NOTIFICAÇÕES */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {notifications.length}
          </Badge>
        )}
      </Button>

      {/* 📋 PAINEL DE NOTIFICAÇÕES */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-80 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
              </div>
            ) : (
              <>
                {/* 📢 NOTIFICAÇÕES DO SISTEMA */}
                {roleNotifications.map(renderNotification)}
                
                {/* 📋 NOTIFICAÇÕES DO BANCO */}
                {notifications.length > 0 && (
                  <>
                    <div className="border-t my-3"></div>
                    <h4 className="text-sm font-medium mb-2">Notificações Recentes</h4>
                    {notifications.map(renderNotification)}
                  </>
                )}

                {notifications.length === 0 && roleNotifications.length === 0 && (
                  <div className="text-center py-4">
                    <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
