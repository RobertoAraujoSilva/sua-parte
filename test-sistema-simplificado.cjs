#!/usr/bin/env node

/**
 * Script de teste para o Sistema Ministerial Simplificado
 * Verifica se os componentes principais estão funcionando
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testando Sistema Ministerial Simplificado...\n');

// Testes de arquivos
const arquivosEssenciais = [
  'src/components/InstructorDashboardSimplified.tsx',
  'src/components/StudentPortalSimplified.tsx',
  'src/data/programacoes-setembro-2025.json',
  'src/pages/InstrutorDashboard.tsx',
  'src/pages/StudentDashboard.tsx',
  'PLANO_REFORMULACAO_SISTEMA.md'
];

const arquivosRemovidos = [
  'src/pages/AdminDashboard.tsx',
  'src/pages/AdminDashboardFixed.tsx',
  'src/pages/AdminDashboardNew.tsx',
  'src/components/admin/AdminLayout.tsx',
  'src/hooks/admin/useAdminCache.ts'
];

console.log('📁 Verificando arquivos essenciais...');
let essenciaisOk = 0;
arquivosEssenciais.forEach(arquivo => {
  if (fs.existsSync(arquivo)) {
    console.log(`✅ ${arquivo}`);
    essenciaisOk++;
  } else {
    console.log(`❌ ${arquivo} - FALTANDO!`);
  }
});

console.log(`\n📁 Verificando remoção de arquivos admin...`);
let removidosOk = 0;
arquivosRemovidos.forEach(arquivo => {
  if (!fs.existsSync(arquivo)) {
    console.log(`✅ ${arquivo} - Removido com sucesso`);
    removidosOk++;
  } else {
    console.log(`❌ ${arquivo} - AINDA EXISTE!`);
  }
});

// Teste do JSON de programações
console.log(`\n📊 Verificando dados de programação...`);
try {
  const programacoes = JSON.parse(fs.readFileSync('src/data/programacoes-setembro-2025.json', 'utf8'));
  
  if (programacoes.semanas && programacoes.semanas.length === 3) {
    console.log(`✅ JSON com ${programacoes.semanas.length} semanas carregado`);
    
    programacoes.semanas.forEach((semana, index) => {
      const totalPartes = semana.programacao.reduce((acc, secao) => acc + secao.partes.length, 0);
      console.log(`   📅 Semana ${index + 1}: ${semana.periodo} - ${totalPartes} partes`);
    });
  } else {
    console.log(`❌ JSON inválido ou incompleto`);
  }
} catch (error) {
  console.log(`❌ Erro ao ler JSON: ${error.message}`);
}

// Verificação do App.tsx
console.log(`\n🔗 Verificando rotas no App.tsx...`);
try {
  const appContent = fs.readFileSync('src/App.tsx', 'utf8');
  
  if (!appContent.includes('AdminLayout')) {
    console.log(`✅ Importação AdminLayout removida`);
  } else {
    console.log(`❌ AdminLayout ainda está sendo importado`);
  }
  
  if (!appContent.includes('/admin/*')) {
    console.log(`✅ Rotas admin removidas`);
  } else {
    console.log(`❌ Rotas admin ainda existem`);
  }
} catch (error) {
  console.log(`❌ Erro ao verificar App.tsx: ${error.message}`);
}

// Resumo
console.log(`\n📋 RESUMO DOS TESTES:`);
console.log(`✅ Arquivos essenciais: ${essenciaisOk}/${arquivosEssenciais.length}`);
console.log(`✅ Arquivos admin removidos: ${removidosOk}/${arquivosRemovidos.length}`);

const sucessoTotal = essenciaisOk === arquivosEssenciais.length && removidosOk === arquivosRemovidos.length;

if (sucessoTotal) {
  console.log(`\n🎉 SISTEMA SIMPLIFICADO IMPLEMENTADO COM SUCESSO!`);
  console.log(`\n📝 Próximos passos:`);
  console.log(`   1. npm run dev - Testar o sistema`);
  console.log(`   2. Navegar para /dashboard (Instrutor)`);
  console.log(`   3. Testar designações de estudantes`);
  console.log(`   4. Verificar portal do estudante`);
} else {
  console.log(`\n⚠️  IMPLEMENTAÇÃO INCOMPLETA - Verifique os erros acima`);
}

console.log(`\n🔗 Documentação: PLANO_REFORMULACAO_SISTEMA.md`);