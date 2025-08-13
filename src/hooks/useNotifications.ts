/**
 * Notifications Hook
 * 
 * Hook for managing user notifications including new student registrations
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  tipo_envio: string;
  status_envio: string;
  data_envio: string;
  notification_type: 'new_student_registration' | 'student_approved' | 'student_rejected' | 'assignment_notification' | 'system_update';
  status: 'pending' | 'read' | 'dismissed' | 'archived';
  metadata: {
    title?: string;
    message?: string;
    student_id?: string;
    student_name?: string;
    student_email?: string;
    congregacao?: string;
    registration_date?: string;
    [key: string]: any;
  };
  action_url?: string;
  action_label?: string;
  expires_at?: string;
  created_at: string;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: queryError } = await (supabase as any)
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .limit(50);

      if (queryError) {
        throw queryError;
      }

      setNotifications((data as Notification[]) || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to load notifications'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new as Notification;
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for new notifications
          if (newNotification.metadata?.title && newNotification.metadata?.message) {
            toast.info(newNotification.metadata.title, {
              description: newNotification.metadata.message,
              action: newNotification.action_url ? {
                label: newNotification.action_label || 'Ver',
                onClick: () => window.location.href = newNotification.action_url!
              } : undefined
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('notificacoes')
        .update({ status: 'read' })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, status: 'read' as const }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Erro ao marcar notificação como lida');
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    try {
      const { error } = await (supabase as any)
        .from('notificacoes')
        .update({ status: 'read' })
        .eq('user_id', user?.id)
        .neq('status', 'read');

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, status: 'read' as const }))
      );

      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Erro ao marcar todas as notificações como lidas');
    }
  }, [user?.id]);

  const dismissNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('notificacoes')
        .update({ status: 'dismissed' })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );

      toast.success('Notificação removida');
    } catch (err) {
      console.error('Error dismissing notification:', err);
      toast.error('Erro ao remover notificação');
    }
  }, [user?.id]);

  const unreadCount = notifications.filter(n => n.status === 'pending').length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refetch: loadNotifications
  };
}