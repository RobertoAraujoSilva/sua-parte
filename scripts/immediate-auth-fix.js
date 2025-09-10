/**
 * CORREÇÃO IMEDIATA PARA ERRO 401 - SUPABASE
 * 
 * Execute este script no console do navegador para corrigir
 * problemas de autenticação que causam erro 401.
 */

console.log('🔧 INICIANDO CORREÇÃO DE ERRO 401...');
console.log('');

// Função para diagnosticar e corrigir problemas de autenticação
async function fixSupabaseAuth() {
  try {
    // 1. Verificar se há dados de autenticação
    console.log('1. 🔍 Verificando dados de autenticação...');
    
    let authDataFound = false;
    const authKeys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
        authKeys.push(key);
        authDataFound = true;
      }
    }
    
    console.log(`   ${authDataFound ? '✅' : '❌'} Dados de auth encontrados: ${authKeys.length} itens`);
    
    // 2. Verificar se o Supabase está disponível
    console.log('2. 🔍 Verificando cliente Supabase...');
    
    if (typeof window.supabase === 'undefined') {
      console.log('   ⚠️ Cliente Supabase não encontrado globalmente');
      console.log('   💡 Tentando acessar via módulo...');
    } else {
      console.log('   ✅ Cliente Supabase encontrado');
    }
    
    // 3. Tentar obter sessão atual
    console.log('3. 🔍 Verificando sessão atual...');
    
    try {
      // Tentar diferentes formas de acessar o Supabase
      let supabaseClient = null;
      
      if (window.supabase) {
        supabaseClient = window.supabase;
      } else if (window.__SUPABASE_CLIENT__) {
        supabaseClient = window.__SUPABASE_CLIENT__;
      } else {
        console.log('   ⚠️ Cliente Supabase não acessível diretamente');
      }
      
      if (supabaseClient) {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.log(`   ❌ Erro na sessão: ${error.message}`);
          
          // Se for erro de token inválido, limpar dados
          if (error.message.includes('Invalid') || error.message.includes('JWT') || error.message.includes('expired')) {
            console.log('   🧹 Token inválido detectado, limpando dados...');
            await clearAuthData();
            return { needsLogin: true, reason: 'invalid_token' };
          }
        } else if (session) {
          console.log('   ✅ Sessão válida encontrada');
          console.log(`   👤 Usuário: ${session.user.email}`);
          
          // Verificar se o token não expirou
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at < now) {
            console.log('   ⏰ Token expirado, tentando refresh...');
            
            const { data: refreshData, error: refreshError } = await supabaseClient.auth.refreshSession();
            
            if (refreshError) {
              console.log(`   ❌ Erro no refresh: ${refreshError.message}`);
              await clearAuthData();
              return { needsLogin: true, reason: 'refresh_failed' };
            } else {
              console.log('   ✅ Token renovado com sucesso');
              return { needsLogin: false, reason: 'token_refreshed' };
            }
          } else {
            return { needsLogin: false, reason: 'session_valid' };
          }
        } else {
          console.log('   ⚠️ Nenhuma sessão encontrada');
          return { needsLogin: true, reason: 'no_session' };
        }
      }
    } catch (sessionError) {
      console.log(`   ❌ Erro verificando sessão: ${sessionError.message}`);
      
      if (sessionError.message.includes('401') || sessionError.message.includes('JWT')) {
        await clearAuthData();
        return { needsLogin: true, reason: 'auth_error' };
      }
    }
    
    // 4. Se chegou até aqui, tentar limpeza preventiva
    console.log('4. 🧹 Executando limpeza preventiva...');
    await clearAuthData();
    return { needsLogin: true, reason: 'preventive_cleanup' };
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
    return { needsLogin: true, reason: 'diagnostic_error' };
  }
}

// Função para limpar dados de autenticação
async function clearAuthData() {
  console.log('   🧹 Limpando dados de autenticação...');
  
  let itemsCleared = 0;
  
  // Limpar localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    itemsCleared++;
  });
  
  // Limpar sessionStorage
  const sessionKeys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
      sessionKeys.push(key);
    }
  }
  
  sessionKeys.forEach(key => {
    sessionStorage.removeItem(key);
    itemsCleared++;
  });
  
  console.log(`   ✅ ${itemsCleared} itens removidos`);
  
  // Tentar logout via Supabase se disponível
  try {
    if (window.supabase || window.__SUPABASE_CLIENT__) {
      const client = window.supabase || window.__SUPABASE_CLIENT__;
      await client.auth.signOut();
      console.log('   ✅ Logout executado via Supabase');
    }
  } catch (logoutError) {
    console.log('   ⚠️ Erro no logout (ignorado):', logoutError.message);
  }
}

// Executar diagnóstico
fixSupabaseAuth().then(result => {
  console.log('');
  console.log('📋 RESULTADO DO DIAGNÓSTICO:');
  console.log(`   Status: ${result.needsLogin ? '❌ Precisa fazer login' : '✅ Autenticado'}`);
  console.log(`   Motivo: ${result.reason}`);
  console.log('');
  
  if (result.needsLogin) {
    console.log('🔄 PRÓXIMOS PASSOS:');
    console.log('1. A página será recarregada automaticamente em 3 segundos');
    console.log('2. Faça login novamente com suas credenciais');
    console.log('3. O erro 401 deve estar resolvido');
    console.log('');
    
    // Countdown para reload
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      console.log(`🔄 Recarregando em ${countdown}...`);
      countdown--;
      
      if (countdown < 0) {
        clearInterval(countdownInterval);
        console.log('🔄 RECARREGANDO PÁGINA...');
        window.location.reload();
      }
    }, 1000);
    
  } else {
    console.log('✅ AUTENTICAÇÃO OK!');
    console.log('   Tente executar a operação novamente.');
  }
}).catch(error => {
  console.error('❌ ERRO CRÍTICO:', error);
  console.log('');
  console.log('🔧 SOLUÇÃO MANUAL:');
  console.log('1. Recarregue a página (F5)');
  console.log('2. Faça login novamente');
  console.log('3. Se o problema persistir, limpe o cache do navegador');
});