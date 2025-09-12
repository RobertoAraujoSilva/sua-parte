/**
 * CORREÇÃO IMEDIATA DE TOKENS DE AUTENTICAÇÃO
 * 
 * Cole este código no console do navegador (F12 > Console) e pressione Enter
 * para corrigir imediatamente problemas de "Invalid Refresh Token"
 */

(function() {
  console.log('🔧 INICIANDO CORREÇÃO DE AUTENTICAÇÃO...');
  console.log('');
  
  let itemsRemoved = 0;
  
  // Limpar localStorage
  console.log('🧹 Limpando localStorage...');
  const localStorageKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
      localStorageKeys.push(key);
    }
  }
  
  localStorageKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`  ✅ Removido: ${key}`);
    itemsRemoved++;
  });
  
  // Limpar sessionStorage
  console.log('🧹 Limpando sessionStorage...');
  const sessionStorageKeys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
      sessionStorageKeys.push(key);
    }
  }
  
  sessionStorageKeys.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`  ✅ Removido: ${key}`);
    itemsRemoved++;
  });
  
  // Limpar cookies
  console.log('🧹 Limpando cookies de autenticação...');
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    if (name.includes('supabase') || name.includes('auth') || name.includes('sb-')) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      console.log(`  ✅ Cookie removido: ${name}`);
      itemsRemoved++;
    }
  });
  
  console.log('');
  console.log(`✅ CORREÇÃO CONCLUÍDA! ${itemsRemoved} itens removidos.`);
  console.log('');
  console.log('🔄 PRÓXIMOS PASSOS:');
  console.log('1. A página será recarregada automaticamente em 3 segundos');
  console.log('2. Após o reload, faça login novamente');
  console.log('3. O erro de "Invalid Refresh Token" deve estar resolvido');
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
  
  // Permitir cancelar o reload
  console.log('💡 Para cancelar o reload automático, execute: clearInterval(' + countdownInterval + ')');
  
})();