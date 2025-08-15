const { supabase } = require('../config/database');

class NotificationService {
  constructor() {
    this.notifications = [];
    this.subscribers = new Map();
  }

  async initialize() {
    try {
      console.log('✅ NotificationService inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar NotificationService:', error);
      throw error;
    }
  }

  // Notificar administradores sobre novos materiais
  async notifyAdmins(message, materials) {
    try {
      console.log(`📢 Notificando admins: ${message}`);
      
      // Buscar todos os usuários admin
      const { data: admins, error } = await supabase
        .from('profiles')
        .select('id, nome_completo, email')
        .eq('role', 'admin');

      if (error) {
        throw error;
      }

      const notification = {
        id: `notif_${Date.now()}`,
        type: 'admin_notification',
        message,
        materials,
        recipients: admins.map(admin => admin.id),
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      // Salvar notificação no banco (se houver tabela)
      try {
        await this.saveNotification(notification);
      } catch (error) {
        console.log('⚠️ Não foi possível salvar notificação no banco:', error.message);
      }

      // Log das notificações
      admins.forEach(admin => {
        console.log(`📢 Admin ${admin.nome_completo} (${admin.email}) notificado sobre ${materials.length} novos materiais`);
      });

      return {
        success: true,
        message: `${admins.length} administradores notificados`,
        notification
      };

    } catch (error) {
      console.error('❌ Erro ao notificar admins:', error);
      throw error;
    }
  }

  // Notificar congregações sobre novo programa
  async notifyCongregations(program) {
    try {
      console.log(`📢 Notificando congregações sobre programa: ${program.semana}`);
      
      // Buscar todas as congregações ativas
      const { data: congregations, error } = await supabase
        .from('profiles')
        .select('id, nome_completo, congregacao, email')
        .eq('role', 'instrutor')
        .not('congregacao', 'is', null);

      if (error) {
        throw error;
      }

      // Agrupar por congregação
      const congregationsByGroup = {};
      congregations.forEach(profile => {
        if (!congregationsByGroup[profile.congregacao]) {
          congregationsByGroup[profile.congregacao] = [];
        }
        congregationsByGroup[profile.congregacao].push(profile);
      });

      const notification = {
        id: `notif_program_${program.id}`,
        type: 'program_available',
        message: `Novo programa disponível: ${program.semana}`,
        program,
        recipients: congregations.map(c => c.id),
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      // Salvar notificação
      try {
        await this.saveNotification(notification);
      } catch (error) {
        console.log('⚠️ Não foi possível salvar notificação no banco:', error.message);
      }

      // Log das notificações
      Object.entries(congregationsByGroup).forEach(([congregation, users]) => {
        console.log(`📢 Congregação ${congregation}: ${users.length} instrutores notificados sobre programa ${program.semana}`);
      });

      return {
        success: true,
        message: `${Object.keys(congregationsByGroup).length} congregações notificadas`,
        notification,
        congregations: Object.keys(congregationsByGroup)
      };

    } catch (error) {
      console.error('❌ Erro ao notificar congregações:', error);
      throw error;
    }
  }

  // Notificar instrutor específico
  async notifyInstructor(instructorId, message, data = {}) {
    try {
      console.log(`📢 Notificando instrutor ${instructorId}: ${message}`);
      
      // Buscar informações do instrutor
      const { data: instructor, error } = await supabase
        .from('profiles')
        .select('id, nome_completo, email, congregacao')
        .eq('id', instructorId)
        .eq('role', 'instrutor')
        .single();

      if (error) {
        throw error;
      }

      const notification = {
        id: `notif_instr_${Date.now()}`,
        type: 'instructor_notification',
        message,
        data,
        recipient: instructorId,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      // Salvar notificação
      try {
        await this.saveNotification(notification);
      } catch (error) {
        console.log('⚠️ Não foi possível salvar notificação no banco:', error.message);
      }

      console.log(`📢 Instrutor ${instructor.nome_completo} (${instructor.congregacao}) notificado: ${message}`);

      return {
        success: true,
        message: 'Instrutor notificado com sucesso',
        notification
      };

    } catch (error) {
      console.error('❌ Erro ao notificar instrutor:', error);
      throw error;
    }
  }

  // Notificar sobre problemas no sistema
  async notifySystemIssue(issue, severity = 'warning') {
    try {
      console.log(`🚨 Notificando sobre problema do sistema: ${issue}`);
      
      // Buscar todos os admins
      const { data: admins, error } = await supabase
        .from('profiles')
        .select('id, nome_completo, email')
        .eq('role', 'admin');

      if (error) {
        throw error;
      }

      const notification = {
        id: `notif_issue_${Date.now()}`,
        type: 'system_issue',
        message: issue,
        severity,
        recipients: admins.map(admin => admin.id),
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      // Salvar notificação
      try {
        await this.saveNotification(notification);
      } catch (error) {
        console.log('⚠️ Não foi possível salvar notificação no banco:', error.message);
      }

      // Log das notificações
      admins.forEach(admin => {
        console.log(`🚨 Admin ${admin.nome_completo} notificado sobre problema: ${issue}`);
      });

      return {
        success: true,
        message: `${admins.length} administradores notificados sobre problema`,
        notification
      };

    } catch (error) {
      console.error('❌ Erro ao notificar sobre problema:', error);
      throw error;
    }
  }

  // Salvar notificação no banco
  async saveNotification(notification) {
    try {
      // Tentar salvar na tabela de notificações (se existir)
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert([{
          id: notification.id,
          type: notification.type,
          message: notification.message,
          data: notification.data || {},
          recipients: notification.recipients || [notification.recipient],
          severity: notification.severity || 'info',
          status: notification.status,
          created_at: notification.timestamp
        }])
        .select();

      if (error) {
        throw error;
      }

      console.log(`✅ Notificação salva no banco: ${notification.id}`);
      return data;

    } catch (error) {
      // Se a tabela não existir, apenas log
      console.log('⚠️ Tabela de notificações não encontrada, salvando apenas em memória');
      
      // Salvar em memória
      this.notifications.push(notification);
      
      // Manter apenas as últimas 100 notificações
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(-100);
      }
      
      return notification;
    }
  }

  // Listar notificações
  async listNotifications(limit = 50, offset = 0) {
    try {
      // Tentar buscar do banco primeiro
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data;

    } catch (error) {
      // Se não conseguir buscar do banco, retornar da memória
      console.log('⚠️ Usando notificações em memória');
      return this.notifications
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(offset, offset + limit);
    }
  }

  // Marcar notificação como lida
  async markAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .select();

      if (error) {
        throw error;
      }

      console.log(`✅ Notificação marcada como lida: ${notificationId}`);
      return data;

    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  // Limpar notificações antigas
  async cleanupOldNotifications(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await supabase
        .from('admin_notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      console.log(`🗑️ Notificações antigas removidas: ${data?.length || 0}`);
      return { deleted: data?.length || 0 };

    } catch (error) {
      console.error('❌ Erro ao limpar notificações antigas:', error);
      throw error;
    }
  }

  // Enviar notificação de teste
  async sendTestNotification() {
    try {
      console.log('🧪 Enviando notificação de teste...');
      
      const testNotification = {
        id: `test_${Date.now()}`,
        type: 'test',
        message: 'Esta é uma notificação de teste do sistema',
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      // Salvar notificação
      await this.saveNotification(testNotification);

      console.log('✅ Notificação de teste enviada');
      return testNotification;

    } catch (error) {
      console.error('❌ Erro ao enviar notificação de teste:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
