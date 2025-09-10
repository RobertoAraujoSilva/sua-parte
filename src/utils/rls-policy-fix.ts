/**
 * Utilitário para corrigir problemas de Row Level Security (RLS)
 * 
 * Este arquivo contém funções para diagnosticar e corrigir problemas
 * de RLS que causam erros 403 Forbidden nas operações do banco.
 */

import { supabase } from '@/integrations/supabase/client';
import logger from '@/utils/logger';

/**
 * Verifica as políticas RLS para uma tabela específica
 */
export const checkRLSPolicies = async (tableName: string) => {
  try {
    logger.debug(`Checking RLS policies for table: ${tableName}`);
    
    // Tentar uma operação de leitura simples para verificar permissões
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      logger.error(`RLS check failed for ${tableName}:`, error);
      return { hasAccess: false, error: error.message };
    }
    
    logger.debug(`RLS check passed for ${tableName}`);
    return { hasAccess: true, data };
    
  } catch (error) {
    logger.error(`Exception checking RLS for ${tableName}:`, error);
    return { hasAccess: false, error: 'Exception during RLS check' };
  }
};

/**
 * Testa inserção em uma tabela para verificar políticas de INSERT
 */
export const testInsertPermissions = async (tableName: string, testData: any) => {
  try {
    logger.debug(`Testing INSERT permissions for table: ${tableName}`);
    
    // Tentar inserir dados de teste
    const { data, error } = await supabase
      .from(tableName)
      .insert(testData)
      .select();
    
    if (error) {
      logger.error(`INSERT test failed for ${tableName}:`, error);
      return { canInsert: false, error: error.message, code: error.code };
    }
    
    // Se a inserção foi bem-sucedida, remover os dados de teste
    if (data && data.length > 0) {
      const deleteResult = await supabase
        .from(tableName)
        .delete()
        .eq('id', data[0].id);
      
      if (deleteResult.error) {
        logger.warn(`Could not clean up test data from ${tableName}:`, deleteResult.error);
      }
    }
    
    logger.debug(`INSERT test passed for ${tableName}`);
    return { canInsert: true, data };
    
  } catch (error) {
    logger.error(`Exception testing INSERT for ${tableName}:`, error);
    return { canInsert: false, error: 'Exception during INSERT test' };
  }
};

/**
 * Diagnóstico completo de RLS para as tabelas principais
 */
export const diagnoseRLSIssues = async (userId: string) => {
  logger.info('Starting RLS diagnosis');
  
  const results = {
    userId,
    timestamp: new Date().toISOString(),
    tables: {} as Record<string, any>
  };
  
  // Tabelas principais para verificar
  const tablesToCheck = [
    'designacoes',
    'programas',
    'estudantes',
    'profiles'
  ];
  
  for (const table of tablesToCheck) {
    logger.info(`Verificando tabela: ${table}`);
    
    // Verificar permissões de leitura
    const readCheck = await checkRLSPolicies(table);
    
    // Preparar dados de teste baseados na tabela
    let testData: any = {};
    switch (table) {
      case 'designacoes':
        // Tentar obter IDs reais para um teste válido; se não houver, pular teste de INSERT
        const { data: prog, error: progErr } = await supabase
          .from('programas')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle();
        const { data: est, error: estErr } = await supabase
          .from('estudantes')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle();

        if (!progErr && !estErr && prog?.id && est?.id) {
          testData = {
            user_id: userId,
            id_programa: prog.id,
            id_estudante: est.id,
            numero_parte: 3,
            titulo_parte: 'Teste RLS',
            tipo_parte: 'discurso',
            tempo_minutos: 5,
            confirmado: false
          };
        } else {
          logger.debug(`Skipping INSERT test for designacoes: missing sample ids`);
          testData = null;
        }
        break;
      case 'programas':
        testData = {
          user_id: userId,
          data_inicio_semana: '2024-01-01',
          mes_apostila: 'Janeiro 2024',
          partes: ['Tesouros da Palavra de Deus', 'Faça Seu Melhor no Ministério', 'Nossa Vida Cristã'],
          semana: 'Semana de 01/01/2024',
          arquivo: 'programa-2024-01-01.pdf',
          status: 'ativo',
          assignment_status: 'pending'
        };
        break;
      case 'estudantes':
        testData = {
          user_id: userId,
          nome: 'Teste RLS',
          genero: 'masculino',
          cargo: 'publicador_batizado',
          ativo: true
        };
        break;
      case 'profiles':
        // Não testar inserção em profiles pois é gerenciado pelo auth
        testData = null;
        break;
    }
    
    // Verificar permissões de inserção (se aplicável)
    let insertCheck = { canInsert: true, error: null };
    if (testData) {
      insertCheck = await testInsertPermissions(table, testData);
    }
    
    results.tables[table] = {
      read: readCheck,
      insert: insertCheck
    };
    
    // Log resultados
    logger.info(`  📖 Leitura: ${readCheck.hasAccess ? '✅' : '❌'}`);
    if (!readCheck.hasAccess) {
      logger.error(`    Erro: ${readCheck.error}`);
    }
    
    if (testData) {
      logger.info(`  ✏️ Inserção: ${insertCheck.canInsert ? '✅' : '❌'}`);
      if (!insertCheck.canInsert) {
        logger.error(`    Erro: ${insertCheck.error}`);
        logger.error(`    Código: ${insertCheck.code}`);
      }
    }
  }
  
  return results;
};

/**
 * Verifica se o usuário atual tem as permissões necessárias
 */
export const checkUserPermissions = async () => {
  try {
    logger.debug('Checking current user permissions...');
    
    // Verificar usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      logger.error('No authenticated user found:', userError);
      return { hasPermissions: false, error: 'No authenticated user' };
    }
    
    logger.debug('Current user:', user.email, user.id);
    
    // Verificar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      logger.error('Error loading user profile:', profileError);
      return { hasPermissions: false, error: 'Profile not found' };
    }
    
    logger.debug('User profile:', profile);
    
    // Executar diagnóstico completo
    const diagnosis = await diagnoseRLSIssues(user.id);
    
    return {
      hasPermissions: true,
      user,
      profile,
      diagnosis
    };
    
  } catch (error) {
    logger.error('Exception checking user permissions:', error);
    return { hasPermissions: false, error: 'Exception during permission check' };
  }
};

/**
 * Tenta corrigir problemas comuns de RLS
 */
export const attemptRLSFix = async () => {
  try {
    logger.info('Attempting to fix RLS issues...');
    
    // Verificar permissões atuais
    const permissionCheck = await checkUserPermissions();
    
    if (!permissionCheck.hasPermissions) {
      return {
        success: false,
        error: 'Cannot fix RLS: No user permissions',
        details: permissionCheck
      };
    }
    
    // Tentar refresh da sessão para renovar tokens
    logger.debug('Refreshing session...');
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      logger.error('Session refresh failed:', refreshError);
      return {
        success: false,
        error: 'Session refresh failed',
        details: refreshError
      };
    }
    
    logger.debug('Session refreshed successfully');
    
    // Verificar novamente após refresh
    const postRefreshCheck = await checkUserPermissions();
    
    return {
      success: true,
      message: 'RLS fix attempt completed',
      beforeRefresh: permissionCheck.diagnosis,
      afterRefresh: postRefreshCheck.diagnosis
    };
    
  } catch (error) {
    logger.error('Exception during RLS fix attempt:', error);
    return {
      success: false,
      error: 'Exception during RLS fix',
      details: error
    };
  }
};

/**
 * Função para executar diagnóstico completo via console
 */
export const runRLSDiagnostic = async () => {
  logger.info('INICIANDO DIAGNÓSTICO COMPLETO DE RLS...');
  logger.info('');
  
  const result = await attemptRLSFix();
  
  logger.info('');
  logger.info('RESULTADO DO DIAGNÓSTICO:');
  logger.info(`Status: ${result.success ? '✅ Sucesso' : '❌ Falha'}`);
  
  if (result.error) {
    logger.error(`Erro: ${result.error}`);
  }
  
  if (result.message) {
    logger.info(`Mensagem: ${result.message}`);
  }
  
  logger.info('');
  logger.info('💡 RECOMENDAÇÕES:');
  
  if (!result.success) {
    logger.info('1. Verifique se você está logado corretamente');
    logger.info('2. Tente fazer logout e login novamente');
    logger.info('3. Verifique se seu perfil tem as permissões necessárias');
    logger.info('4. Entre em contato com o administrador se o problema persistir');
  } else {
    logger.info('1. Tente executar a operação novamente');
    logger.info('2. Se o problema persistir, pode ser necessário ajustar as políticas RLS no banco');
  }
  
  return result;
};

// Expose quick helpers in development for easier troubleshooting
try {
  if (typeof window !== 'undefined' && (import.meta as any)?.env?.DEV) {
    (window as any).rlsDiagnostic = {
      run: runRLSDiagnostic,
      attemptFix: attemptRLSFix,
      check: checkUserPermissions
    };
    logger.debug('RLS tools available: window.rlsDiagnostic.run(), .attemptFix(), .check()');
  }
} catch {}