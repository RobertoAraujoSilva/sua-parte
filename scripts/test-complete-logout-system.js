#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 SISTEMA COMPLETO DE DEBUG - LOGOUT FUNCTIONALITY');
console.log('============================================================');

// Verificar se todos os arquivos foram criados
const filesToCheck = [
  'src/utils/debugLogger.ts',
  'src/components/DebugPanel.tsx',
  'src/components/Header.tsx',
  'src/pages/Dashboard.tsx'
];

console.log('\n📋 Verificando arquivos do sistema de debug...');

let allFilesExist = true;
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ Alguns arquivos estão faltando. Execute o setup completo primeiro.');
  process.exit(1);
}

// Verificar implementação do Header
console.log('\n🔍 Verificando implementação do Header...');
const headerPath = path.join(__dirname, '..', 'src', 'components', 'Header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');

const checks = [
  {
    name: 'Import do debugLogger',
    check: headerContent.includes('import { useDebugLogger }'),
    required: true
  },
  {
    name: 'Uso do debugLogger no componente',
    check: headerContent.includes('const { logLogoutAttempt, logLogoutResult'),
    required: true
  },
  {
    name: 'handleSignOut com parâmetro buttonType',
    check: headerContent.includes('buttonType: \'dropdown\' | \'test\''),
    required: true
  },
  {
    name: 'Log de tentativa de logout',
    check: headerContent.includes('logLogoutAttempt(buttonType, user)'),
    required: true
  },
  {
    name: 'Log de resultado de logout',
    check: headerContent.includes('logLogoutResult('),
    required: true
  },
  {
    name: 'Botão de teste com tipo correto',
    check: headerContent.includes('handleSignOut(\'test\')'),
    required: true
  },
  {
    name: 'Dropdown com tipo correto',
    check: headerContent.includes('handleSignOut(\'dropdown\')'),
    required: true
  },
  {
    name: 'Delay antes da navegação',
    check: headerContent.includes('setTimeout(() => {') && headerContent.includes('navigate(\'/\')'),
    required: true
  }
];

let passedChecks = 0;
checks.forEach(check => {
  const status = check.check ? '✅' : (check.required ? '❌' : '⚠️');
  console.log(`${status} ${check.name}`);
  if (check.check) passedChecks++;
});

console.log(`\n📊 Header: ${passedChecks}/${checks.length} verificações passaram`);

// Verificar Dashboard
console.log('\n🔍 Verificando implementação do Dashboard...');
const dashboardPath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

const dashboardChecks = [
  {
    name: 'Import do DebugPanel',
    check: dashboardContent.includes('import { DebugPanel }')
  },
  {
    name: 'DebugPanel renderizado',
    check: dashboardContent.includes('<DebugPanel')
  },
  {
    name: 'DebugPanel com posição fixed',
    check: dashboardContent.includes('position="fixed"')
  }
];

let dashboardPassed = 0;
dashboardChecks.forEach(check => {
  const status = check.check ? '✅' : '❌';
  console.log(`${status} ${check.name}`);
  if (check.check) dashboardPassed++;
});

console.log(`\n📊 Dashboard: ${dashboardPassed}/${dashboardChecks.length} verificações passaram`);

// Verificar rotas
console.log('\n🔍 Verificando configuração de rotas...');
const appPath = path.join(__dirname, '..', 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

const routeChecks = [
  {
    name: 'Rota home (/)',
    check: appContent.includes('path="/" element={<Index />}')
  },
  {
    name: 'Rota auth (/auth)',
    check: appContent.includes('path="/auth" element={<Auth />}')
  },
  {
    name: 'Rota dashboard (/dashboard)',
    check: appContent.includes('path="/dashboard"')
  }
];

let routePassed = 0;
routeChecks.forEach(check => {
  const status = check.check ? '✅' : '❌';
  console.log(`${status} ${check.name}`);
  if (check.check) routePassed++;
});

console.log(`\n📊 Rotas: ${routePassed}/${routeChecks.length} verificações passaram`);

// Resumo final
console.log('\n==================================================');
console.log('📊 RESUMO FINAL');
console.log('==================================================');

const totalChecks = checks.length + dashboardChecks.length + routeChecks.length;
const totalPassed = passedChecks + dashboardPassed + routePassed;

console.log(`✅ Verificações passaram: ${totalPassed}/${totalChecks}`);
console.log(`📁 Arquivos criados: ${filesToCheck.length}`);

if (totalPassed === totalChecks) {
  console.log('\n🎉 SISTEMA DE DEBUG IMPLEMENTADO COM SUCESSO!');
  
  console.log('\n🧪 INSTRUÇÕES DE TESTE:');
  console.log('1. Acesse: http://localhost:5173/dashboard');
  console.log('2. Procure pelo botão "Debug" no canto inferior direito');
  console.log('3. Clique no botão "Debug" para abrir o painel');
  console.log('4. No painel, você verá:');
  console.log('   - Informações do usuário atual');
  console.log('   - Estatísticas de logs');
  console.log('   - Botão "🧪 Test Direct Logout"');
  console.log('   - Botão "🔽 Test Dropdown Logout"');
  console.log('   - Botão "Download TXT" para baixar logs');
  
  console.log('\n📄 GERAÇÃO DE ARQUIVOS TXT:');
  console.log('- Clique em qualquer botão de logout');
  console.log('- O sistema automaticamente gerará um arquivo .txt');
  console.log('- O arquivo conterá logs detalhados de toda a sessão');
  console.log('- Você pode forçar o download clicando "Download TXT"');
  
  console.log('\n🔧 RESOLUÇÃO DE PROBLEMAS:');
  console.log('- Se a tela de login sumiu, acesse: http://localhost:5173/auth');
  console.log('- Se o logout não funcionar, verifique o console do navegador');
  console.log('- Todos os logs são capturados automaticamente');
  console.log('- O arquivo TXT conterá informações detalhadas para debug');
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Teste o botão "🧪 Test Direct Logout" primeiro');
  console.log('2. Se funcionar, teste o dropdown "Sair"');
  console.log('3. Baixe o arquivo TXT para análise');
  console.log('4. Compartilhe os logs se ainda houver problemas');
  
} else {
  console.log('\n❌ Algumas verificações falharam. Revise a implementação.');
}

console.log('\n============================================================');
console.log('🔗 URLs importantes:');
console.log('- Dashboard: http://localhost:5173/dashboard');
console.log('- Login: http://localhost:5173/auth');
console.log('- Home: http://localhost:5173/');
console.log('============================================================');
