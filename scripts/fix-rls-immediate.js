/**
 * CORREÇÃO IMEDIATA PARA ERRO 403 RLS
 * 
 * Execute este comando no terminal para corrigir o problema de RLS:
 * npm run dev:all
 * 
 * Ou execute este script no console do navegador:
 */

console.log('🔧 CORREÇÃO IMEDIATA PARA ERRO 403 RLS');
console.log('');

// Função para corrigir RLS imediatamente
async function fixRLSImmediate() {
  try {
    console.log('1. 🔄 Limpando cache de autenticação...');
    
    // Limpar todos os dados de autenticação
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Limpar sessionStorage também
    const sessionKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
        sessionKeys.push(key);
      }
    }
    
    sessionKeys.forEach(key => sessionStorage.removeItem(key));
    
    console.log(`   ✅ ${keysToRemove.length + sessionKeys.length} itens de cache removidos`);
    
    console.log('2. 🔄 Fazendo logout do Supabase...');
    
    // Tentar logout via Supabase
    try {
      const client = window.supabase || window.__SUPABASE_CLIENT__;
      if (client) {
        await client.auth.signOut();
        console.log('   ✅ Logout realizado');
      }
    } catch (logoutError) {
      console.log('   ⚠️ Erro no logout (ignorado)');
    }
    
    console.log('3. 🔄 Recarregando página...');
    
    // Aguardar um pouco e recarregar
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error);
    return false;
  }
}

// Executar correção
fixRLSImmediate().then(success => {
  if (success) {
    console.log('✅ CORREÇÃO APLICADA COM SUCESSO!');
    console.log('');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('1. A página será recarregada automaticamente');
    console.log('2. Faça login novamente');
    console.log('3. Tente a operação novamente');
    console.log('');
    console.log('💡 Se o problema persistir:');
    console.log('- Feche e abra o navegador completamente');
    console.log('- Limpe o cache do navegador (Ctrl+Shift+Delete)');
    console.log('- Tente em uma aba anônima/privada');
  } else {
    console.log('❌ CORREÇÃO FALHOU');
    console.log('');
    console.log('🔧 SOLUÇÃO MANUAL:');
    console.log('1. Feche completamente o navegador');
    console.log('2. Abra novamente e acesse o sistema');
    console.log('3. Faça login novamente');
    console.log('4. Se ainda não funcionar, limpe o cache do navegador');
  }
}).catch(error => {
  console.error('❌ ERRO CRÍTICO:', error);
  console.log('🔄 Recarregando página em 3 segundos...');
  setTimeout(() => window.location.reload(), 3000);
});