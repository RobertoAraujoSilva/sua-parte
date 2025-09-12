/**
 * CORREÇÃO IMEDIATA PARA ERRO 403 - RLS POLICY VIOLATION
 * 
 * Execute este script no console do navegador para diagnosticar
 * e tentar corrigir problemas de Row Level Security (RLS).
 */

console.log('🔒 INICIANDO CORREÇÃO DE ERRO 403 RLS...');
console.log('');

// Função para diagnosticar problemas de RLS
async function diagnoseRLSIssue() {
  try {
    console.log('1. 🔍 Verificando autenticação atual...');
    
    // Verificar se há um cliente Supabase disponível
    let supabaseClient = null;
    
    if (window.supabase) {
      supabaseClient = window.supabase;
    } else if (window.__SUPABASE_CLIENT__) {
      supabaseClient = window.__SUPABASE_CLIENT__;
    } else {
      console.log('   ❌ Cliente Supabase não encontrado');
      return { needsReload: true, reason: 'no_supabase_client' };
    }
    
    // Verificar usuário atual
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.log('   ❌ Usuário não autenticado:', userError?.message);
      return { needsLogin: true, reason: 'not_authenticated' };
    }
    
    console.log('   ✅ Usuário autenticado:', user.email);
    console.log('   👤 User ID:', user.id);
    
    // Verificar sessão atual
    console.log('2. 🔍 Verificando sessão...');
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError) {
      console.log('   ❌ Erro na sessão:', sessionError.message);
      return { needsRefresh: true, reason: 'session_error' };
    }
    
    if (!session) {
      console.log('   ❌ Nenhuma sessão ativa');
      return { needsLogin: true, reason: 'no_session' };
    }
    
    // Verificar se o token não expirou
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('   ⏰ Token expirado, tentando refresh...');
      
      const { data: refreshData, error: refreshError } = await supabaseClient.auth.refreshSession();
      
      if (refreshError) {
        console.log('   ❌ Erro no refresh:', refreshError.message);
        return { needsLogin: true, reason: 'refresh_failed' };
      }
      
      console.log('   ✅ Token renovado com sucesso');
    } else {
      console.log('   ✅ Token válido');
    }
    
    // Testar permissões básicas
    console.log('3. 🔍 Testando permissões RLS...');
    
    // Testar leitura na tabela designacoes
    try {
      const { data: testRead, error: readError } = await supabaseClient
        .from('designacoes')
        .select('id')
        .limit(1);
      
      if (readError) {
        console.log('   ❌ Erro na leitura de designações:', readError.message);
        if (readError.code === '42501') {
          console.log('   🔒 Violação de política RLS detectada');
          return { needsRLSFix: true, reason: 'rls_read_violation' };
        }
      } else {
        console.log('   ✅ Leitura de designações OK');
      }
    } catch (readTestError) {
      console.log('   ❌ Exceção no teste de leitura:', readTestError.message);
    }
    
    // Testar leitura na tabela profiles
    try {
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.log('   ❌ Erro ao carregar perfil:', profileError.message);
        return { needsProfileFix: true, reason: 'profile_error' };
      } else {
        console.log('   ✅ Perfil carregado:', profileData.role || 'sem role');
      }
    } catch (profileTestError) {
      console.log('   ❌ Exceção no teste de perfil:', profileTestError.message);
    }
    
    return { allGood: true, reason: 'permissions_ok' };
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
    return { needsReload: true, reason: 'diagnostic_error' };
  }
}

// Função para tentar corrigir problemas de RLS
async function attemptRLSFix() {
  console.log('🔧 Tentando corrigir problemas de RLS...');
  
  try {
    // Obter cliente Supabase
    const supabaseClient = window.supabase || window.__SUPABASE_CLIENT__;
    
    if (!supabaseClient) {
      console.log('   ❌ Cliente Supabase não disponível');
      return false;
    }
    
    // Tentar refresh da sessão
    console.log('   🔄 Renovando sessão...');
    const { data: refreshData, error: refreshError } = await supabaseClient.auth.refreshSession();
    
    if (refreshError) {
      console.log('   ❌ Erro no refresh:', refreshError.message);
      return false;
    }
    
    console.log('   ✅ Sessão renovada');
    
    // Aguardar um pouco para a sessão se propagar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Testar novamente
    const { data: testData, error: testError } = await supabaseClient
      .from('designacoes')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('   ❌ Ainda há erro após refresh:', testError.message);
      return false;
    }
    
    console.log('   ✅ Teste de permissão passou após refresh');
    return true;
    
  } catch (error) {
    console.error('   ❌ Erro durante tentativa de correção:', error);
    return false;
  }
}

// Executar diagnóstico
diagnoseRLSIssue().then(async result => {
  console.log('');
  console.log('📋 RESULTADO DO DIAGNÓSTICO:');
  console.log(`   Motivo: ${result.reason}`);
  console.log('');
  
  if (result.needsLogin) {
    console.log('🔄 AÇÃO NECESSÁRIA: FAZER LOGIN');
    console.log('1. A página será recarregada em 3 segundos');
    console.log('2. Faça login novamente com suas credenciais');
    console.log('3. Tente a operação novamente');
    
    setTimeout(() => {
      console.log('🔄 RECARREGANDO PÁGINA...');
      window.location.reload();
    }, 3000);
    
  } else if (result.needsRefresh || result.needsRLSFix) {
    console.log('🔧 TENTANDO CORREÇÃO AUTOMÁTICA...');
    
    const fixResult = await attemptRLSFix();
    
    if (fixResult) {
      console.log('✅ CORREÇÃO BEM-SUCEDIDA!');
      console.log('   Tente executar a operação novamente.');
    } else {
      console.log('❌ CORREÇÃO FALHOU');
      console.log('🔄 Recarregando página em 3 segundos...');
      
      setTimeout(() => {
        console.log('🔄 RECARREGANDO PÁGINA...');
        window.location.reload();
      }, 3000);
    }
    
  } else if (result.needsReload) {
    console.log('🔄 RECARREGAMENTO NECESSÁRIO');
    console.log('   A página será recarregada em 3 segundos');
    
    setTimeout(() => {
      console.log('🔄 RECARREGANDO PÁGINA...');
      window.location.reload();
    }, 3000);
    
  } else if (result.allGood) {
    console.log('✅ PERMISSÕES OK!');
    console.log('   O erro 403 pode ter sido temporário.');
    console.log('   Tente executar a operação novamente.');
    
  } else {
    console.log('❓ RESULTADO INESPERADO');
    console.log('   Tente recarregar a página manualmente.');
  }
  
}).catch(error => {
  console.error('❌ ERRO CRÍTICO:', error);
  console.log('');
  console.log('🔧 SOLUÇÃO MANUAL:');
  console.log('1. Recarregue a página (F5)');
  console.log('2. Faça logout e login novamente');
  console.log('3. Limpe o cache do navegador se necessário');
  console.log('4. Entre em contato com o suporte se o problema persistir');
});