/**
 * Script para corrigir problemas de tokens de autenticação inválidos
 * 
 * Execute este script quando encontrar erros como:
 * - "Invalid Refresh Token: Refresh Token Not Found"
 * - "AuthApiError: Invalid Refresh Token"
 * - Problemas de sessão expirada
 */

console.log('🔧 Iniciando correção de tokens de autenticação...');

// Função para limpar todos os dados de autenticação
function clearAllAuthData() {
  console.log('🧹 Limpando dados de autenticação...');
  
  let clearedItems = 0;
  
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
    console.log(`🗑️ Removido localStorage: ${key}`);
    clearedItems++;
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
    console.log(`🗑️ Removido sessionStorage: ${key}`);
    clearedItems++;
  });
  
  // Limpar cookies relacionados à autenticação
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    if (name.includes('supabase') || name.includes('auth') || name.includes('sb-')) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      console.log(`🍪 Removido cookie: ${name}`);
      clearedItems++;
    }
  });
  
  return clearedItems;
}

// Função para verificar se há dados de autenticação restantes
function checkRemainingAuthData() {
  console.log('🔍 Verificando dados de autenticação restantes...');
  
  const remainingItems = [];
  
  // Verificar localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
      remainingItems.push(`localStorage: ${key}`);
    }
  }
  
  // Verificar sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
      remainingItems.push(`sessionStorage: ${key}`);
    }
  }
  
  return remainingItems;
}

// Executar limpeza
try {
  const clearedCount = clearAllAuthData();
  console.log(`✅ Limpeza concluída! ${clearedCount} itens removidos.`);
  
  const remaining = checkRemainingAuthData();
  if (remaining.length > 0) {
    console.log('⚠️ Alguns itens ainda permanecem:');
    remaining.forEach(item => console.log(`  - ${item}`));
  } else {
    console.log('✅ Todos os dados de autenticação foram removidos com sucesso!');
  }
  
  console.log('');
  console.log('🔄 Próximos passos:');
  console.log('1. Recarregue a página (F5 ou Ctrl+R)');
  console.log('2. Faça login novamente com suas credenciais');
  console.log('3. Se o problema persistir, entre em contato com o suporte');
  
  // Oferecer recarregar automaticamente
  if (confirm('Deseja recarregar a página agora para aplicar as mudanças?')) {
    window.location.reload();
  }
  
} catch (error) {
  console.error('❌ Erro durante a limpeza:', error);
  console.log('');
  console.log('🔧 Solução manual:');
  console.log('1. Abra as Ferramentas do Desenvolvedor (F12)');
  console.log('2. Vá para a aba Application/Storage');
  console.log('3. Limpe manualmente localStorage e sessionStorage');
  console.log('4. Recarregue a página');
}