const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurações do Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

// Criar cliente Supabase com service key para operações do backend
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Log da configuração (sem expor a chave)
console.log('🔧 Supabase configurado:', {
  url: supabaseUrl,
  keyType: supabaseServiceKey.includes('service_role') ? 'SERVICE_ROLE' : 'ANON_KEY',
  keyLength: supabaseServiceKey.length
});

// Função para testar conexão
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('✅ Conexão com Supabase estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com Supabase:', error);
    return false;
  }
}

// Função para obter estatísticas do banco
async function getDatabaseStats() {
  try {
    const stats = {};

    // Contar perfis
    const { count: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    stats.profiles = profilesCount;

    // Contar estudantes
    const { count: estudantesCount } = await supabase
      .from('estudantes')
      .select('*', { count: 'exact', head: true });
    stats.estudantes = estudantesCount;

    // Contar programas
    const { count: programasCount } = await supabase
      .from('programas')
      .select('*', { count: 'exact', head: true });
    stats.programas = programasCount;

    // Contar designações
    const { count: designacoesCount } = await supabase
      .from('designacoes')
      .select('*', { count: 'exact', head: true });
    stats.designacoes = designacoesCount;

    return stats;
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    return {};
  }
}

// Função para verificar tabelas existentes
async function checkTables() {
  try {
    const tables = [
      'profiles',
      'estudantes', 
      'programas',
      'designacoes',
      'fairness_policy',
      'assignment_history',
      'fairness_queue'
    ];

    const existingTables = [];
    const missingTables = [];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          missingTables.push(table);
        } else {
          existingTables.push(table);
        }
      } catch (error) {
        missingTables.push(table);
      }
    }

    return {
      existing: existingTables,
      missing: missingTables,
      total: tables.length
    };
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    return { existing: [], missing: [], total: 0 };
  }
}

// Função para executar query personalizada
async function executeQuery(query, params = []) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: query,
      sql_params: params
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Erro na execução da query:', error);
    throw error;
  }
}

// Função para inserir dados
async function insertData(table, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) {
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`❌ Erro ao inserir em ${table}:`, error);
    throw error;
  }
}

// Função para atualizar dados
async function updateData(table, data, conditions) {
  try {
    let query = supabase
      .from(table)
      .update(data);

    // Aplicar condições WHERE
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: result, error } = await query.select();

    if (error) {
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`❌ Erro ao atualizar em ${table}:`, error);
    throw error;
  }
}

// Função para buscar dados
async function selectData(table, columns = '*', conditions = {}) {
  try {
    let query = supabase
      .from(table)
      .select(columns);

    // Aplicar condições WHERE
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`❌ Erro ao buscar em ${table}:`, error);
    throw error;
  }
}

// Função para deletar dados
async function deleteData(table, conditions) {
  try {
    let query = supabase
      .from(table)
      .delete();

    // Aplicar condições WHERE
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: result, error } = await query.select();

    if (error) {
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`❌ Erro ao deletar de ${table}:`, error);
    throw error;
  }
}

// Exportar funções e cliente
module.exports = {
  supabase,
  testConnection,
  getDatabaseStats,
  checkTables,
  executeQuery,
  insertData,
  updateData,
  selectData,
  deleteData
};
