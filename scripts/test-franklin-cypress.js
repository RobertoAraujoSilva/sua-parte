#!/usr/bin/env node

/**
 * Script para executar testes Cypress específicos do Franklin
 * Sistema Ministerial - Teste de Login do Estudante
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Executando Testes Cypress - Login do Franklin\n');

// Configurações
const config = {
  email: 'franklinmarceloferreiradelima@gmail.com',
  userId: '77c99e53-500b-4140-b7fc-a69f96b216e1',
  portalUrl: '/estudante/77c99e53-500b-4140-b7fc-a69f96b216e1',
  baseUrl: 'https://sua-parte.lovable.app'
};

console.log('📋 Configuração do Teste:');
console.log(`   Email: ${config.email}`);
console.log(`   User ID: ${config.userId}`);
console.log(`   Portal URL: ${config.portalUrl}`);
console.log(`   Base URL: ${config.baseUrl}`);
console.log('');

// Função para executar comando
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Executando: ${command} ${args.join(' ')}\n`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

// Função principal
async function runFranklinTests() {
  try {
    console.log('🔍 Verificando se Cypress está instalado...');
    
    // Verificar se cypress está instalado
    try {
      await runCommand('npx', ['cypress', '--version']);
      console.log('✅ Cypress encontrado\n');
    } catch (error) {
      console.log('❌ Cypress não encontrado. Instalando...\n');
      await runCommand('npm', ['install', 'cypress', '--save-dev']);
      console.log('✅ Cypress instalado\n');
    }
    
    // Opções de execução
    const args = process.argv.slice(2);
    const isInteractive = args.includes('--open') || args.includes('-o');
    const isHeadless = args.includes('--headless') || args.includes('-h');
    const specificTest = args.find(arg => arg.startsWith('--spec='));
    
    if (isInteractive) {
      console.log('🖥️ Abrindo Cypress em modo interativo...\n');
      await runCommand('npx', ['cypress', 'open']);
    } else {
      console.log('🤖 Executando testes em modo headless...\n');
      
      const cypressArgs = ['cypress', 'run'];
      
      if (specificTest) {
        const specFile = specificTest.split('=')[1];
        cypressArgs.push('--spec', specFile);
        console.log(`📁 Executando teste específico: ${specFile}\n`);
      } else {
        // Executar apenas testes do Franklin por padrão
        cypressArgs.push('--spec', 'cypress/e2e/franklin-login.cy.ts');
        console.log('📁 Executando teste principal do Franklin\n');
      }
      
      if (isHeadless) {
        cypressArgs.push('--headless');
      }
      
      await runCommand('npx', cypressArgs);
    }
    
    console.log('\n🎉 Testes concluídos com sucesso!');
    console.log('\n📊 Resultados:');
    console.log('   - Vídeos salvos em: cypress/videos/');
    console.log('   - Screenshots (se houver falhas): cypress/screenshots/');
    console.log('\n💡 Comandos úteis:');
    console.log('   npm run test:franklin          # Executar teste do Franklin');
    console.log('   npm run cypress:open           # Modo interativo');
    console.log('   npm run cypress:run            # Todos os testes');
    
  } catch (error) {
    console.error('\n❌ Erro ao executar testes:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Verificar se a aplicação está rodando');
    console.error('   2. Verificar conectividade de rede');
    console.error('   3. Verificar se as credenciais estão corretas');
    console.error('   4. Executar em modo interativo: node scripts/test-franklin-cypress.js --open');
    process.exit(1);
  }
}

// Função para mostrar ajuda
function showHelp() {
  console.log('🧪 Script de Testes Cypress - Franklin Login\n');
  console.log('Uso: node scripts/test-franklin-cypress.js [opções]\n');
  console.log('Opções:');
  console.log('  --open, -o              Abrir Cypress em modo interativo');
  console.log('  --headless, -h          Executar em modo headless');
  console.log('  --spec=<arquivo>        Executar teste específico');
  console.log('  --help                  Mostrar esta ajuda\n');
  console.log('Exemplos:');
  console.log('  node scripts/test-franklin-cypress.js');
  console.log('  node scripts/test-franklin-cypress.js --open');
  console.log('  node scripts/test-franklin-cypress.js --spec=cypress/e2e/franklin-login.cy.ts');
  console.log('  node scripts/test-franklin-cypress.js --spec=cypress/e2e/student-portal-navigation.cy.ts\n');
}

// Verificar argumentos
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Executar testes
runFranklinTests();
