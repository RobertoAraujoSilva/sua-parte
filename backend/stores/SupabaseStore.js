const { createClient } = require('@supabase/supabase-js');

/**
 * Supabase implementation of IDataStore interface
 * Provides compatibility with existing web-based functionality
 */
class SupabaseStore {
  constructor(url, key) {
    this.client = createClient(url, key);
    this.initialized = false;
  }

  /**
   * Initialize the store
   */
  async initialize() {
    try {
      // Test connection
      const { data, error } = await this.client
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      this.initialized = true;
      console.log('✅ SupabaseStore initialized');
    } catch (error) {
      console.error('❌ SupabaseStore initialization failed:', error);
      throw error;
    }
  }

  /**
   * Close the store (no-op for Supabase)
   */
  async close() {
    this.initialized = false;
    console.log('✅ SupabaseStore closed');
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('count')
        .limit(1);

      return {
        status: error ? 'unhealthy' : 'healthy',
        error: error?.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // =====================================================
  // STUDENT MANAGEMENT
  // =====================================================

  async getEstudantes(congregacaoId = null) {
    try {
      let query = this.client
        .from('estudantes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (congregacaoId) {
        query = query.eq('congregacao_id', congregacaoId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting students:', error);
      throw error;
    }
  }

  async getEstudante(id) {
    try {
      const { data, error } = await this.client
        .from('estudantes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting student:', error);
      throw error;
    }
  }

  async createEstudante(estudante) {
    try {
      const { data, error } = await this.client
        .from('estudantes')
        .insert({
          ...estudante,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error creating student:', error);
      throw error;
    }
  }

  async updateEstudante(id, updates) {
    try {
      const { data, error } = await this.client
        .from('estudantes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error updating student:', error);
      throw error;
    }
  }

  async deleteEstudante(id) {
    try {
      const { error } = await this.client
        .from('estudantes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('❌ Error deleting student:', error);
      throw error;
    }
  }

  // =====================================================
  // PROGRAM MANAGEMENT
  // =====================================================

  async getProgramas(filters = {}) {
    try {
      let query = this.client
        .from('programas')
        .select('*')
        .order('semana_inicio', { ascending: false });

      if (filters.congregacaoId) {
        query = query.eq('congregacao_id', filters.congregacaoId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.startDate) {
        query = query.gte('semana_inicio', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('semana_fim', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting programs:', error);
      throw error;
    }
  }

  async getPrograma(id) {
    try {
      const { data, error } = await this.client
        .from('programas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting program:', error);
      throw error;
    }
  }

  async createPrograma(programa) {
    try {
      const { data, error } = await this.client
        .from('programas')
        .insert({
          ...programa,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error creating program:', error);
      throw error;
    }
  }

  async updatePrograma(id, updates) {
    try {
      const { data, error } = await this.client
        .from('programas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error updating program:', error);
      throw error;
    }
  }

  async deletePrograma(id) {
    try {
      const { error } = await this.client
        .from('programas')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('❌ Error deleting program:', error);
      throw error;
    }
  }

  // =====================================================
  // ASSIGNMENT MANAGEMENT
  // =====================================================

  async getDesignacoes(filters = {}) {
    try {
      let query = this.client
        .from('designacoes')
        .select(`
          *,
          estudante:estudantes(id, nome, sobrenome, cargo),
          ajudante:estudantes!ajudante_id(id, nome, sobrenome, cargo),
          programa:programas(id, semana_inicio, semana_fim, material_estudo)
        `)
        .order('created_at', { ascending: false });

      if (filters.programaId) {
        query = query.eq('programa_id', filters.programaId);
      }

      if (filters.estudanteId) {
        query = query.eq('estudante_id', filters.estudanteId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting assignments:', error);
      throw error;
    }
  }

  async getDesignacao(id) {
    try {
      const { data, error } = await this.client
        .from('designacoes')
        .select(`
          *,
          estudante:estudantes(id, nome, sobrenome, cargo),
          ajudante:estudantes!ajudante_id(id, nome, sobrenome, cargo),
          programa:programas(id, semana_inicio, semana_fim, material_estudo)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting assignment:', error);
      throw error;
    }
  }

  async createDesignacao(designacao) {
    try {
      const { data, error } = await this.client
        .from('designacoes')
        .insert({
          ...designacao,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error creating assignment:', error);
      throw error;
    }
  }

  async updateDesignacao(id, updates) {
    try {
      const { data, error } = await this.client
        .from('designacoes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error updating assignment:', error);
      throw error;
    }
  }

  async deleteDesignacao(id) {
    try {
      const { error } = await this.client
        .from('designacoes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('❌ Error deleting assignment:', error);
      throw error;
    }
  }

  async getHistoricoDesignacoes(estudanteId, weeks = 12) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7));

      const { data, error } = await this.client
        .from('designacoes')
        .select(`
          *,
          programa:programas(id, semana_inicio, semana_fim, material_estudo)
        `)
        .eq('estudante_id', estudanteId)
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting assignment history:', error);
      throw error;
    }
  }

  // =====================================================
  // USER MANAGEMENT
  // =====================================================

  async getProfile(userId) {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting profile:', error);
      throw error;
    }
  }

  async updateProfile(userId, updates) {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  }

  // =====================================================
  // SYSTEM OPERATIONS
  // =====================================================

  async backup() {
    // Supabase doesn't support direct backup operations
    // This would need to be implemented differently
    throw new Error('Backup not supported for SupabaseStore');
  }

  async restore(backupPath) {
    // Supabase doesn't support direct restore operations
    // This would need to be implemented differently
    throw new Error('Restore not supported for SupabaseStore');
  }

  // =====================================================
  // STATISTICS AND REPORTING
  // =====================================================

  async getStats() {
    try {
      const stats = {};

      // Count profiles
      const { count: profilesCount } = await this.client
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      stats.profiles = profilesCount || 0;

      // Count students
      const { count: estudantesCount } = await this.client
        .from('estudantes')
        .select('*', { count: 'exact', head: true });
      stats.estudantes = estudantesCount || 0;

      // Count programs
      const { count: programasCount } = await this.client
        .from('programas')
        .select('*', { count: 'exact', head: true });
      stats.programas = programasCount || 0;

      // Count assignments
      const { count: designacoesCount } = await this.client
        .from('designacoes')
        .select('*', { count: 'exact', head: true });
      stats.designacoes = designacoesCount || 0;

      return stats;
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }
}

module.exports = { SupabaseStore };