#!/usr/bin/env node

/**
 * Script para executar testes Cypress específicos da Sarah
 * Sistema Ministerial - Teste de Registro de Estudante com Data de Nascimento
 * ES Module Compatible
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Executando Testes Cypress - Registro da Sarah com Data de Nascimento\n');

// Configurações da Sarah
const config = {
  fullName: 'Sarah Rackel Ferreira Lima',
  email: 'franklima.flm@gmail.com',
  dateOfBirth: '25/09/2009',
  age: calculateAge('2009-09-25'),
  congregation: 'Market Harborough',
  role: 'Publicador Não Batizado',
  baseUrl: 'https://sua-parte.lovable.app'
};

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

console.log('📋 Configuração do Teste da Sarah:');
console.log(`   Nome: ${config.fullName}`);
console.log(`   Email: ${config.email}`);
console.log(`   Data de Nascimento: ${config.dateOfBirth}`);
console.log(`   Idade: ${config.age} anos`);
console.log(`   Congregação: ${config.congregation}`);
console.log(`   Cargo: ${config.role}`);
console.log(`   Base URL: ${config.baseUrl}`);
console.log('');

// Função para executar comando (ES Module compatible)
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Executando: ${command} ${args.join(' ')}\n`);

    const childProcess = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: projectRoot,
      ...options
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });

    childProcess.on('error', (error) => {
      reject(error);
    });
  });
}

// Função principal
async function runSarahTests() {
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
        // Executar apenas testes da Sarah por padrão
        cypressArgs.push('--spec', 'cypress/e2e/sarah-student-registration.cy.ts');
        console.log('📁 Executando teste principal da Sarah\n');
      }
      
      if (isHeadless) {
        cypressArgs.push('--headless');
      }
      
      await runCommand('npx', cypressArgs);
    }
    
    console.log('\n🎉 Testes da Sarah concluídos com sucesso!');
    console.log('\n📊 Resultados:');
    console.log('   - Vídeos salvos em: cypress/videos/');
    console.log('   - Screenshots (se houver falhas): cypress/screenshots/');
    console.log('\n🎂 Funcionalidades Testadas:');
    console.log('   ✅ Registro com data de nascimento');
    console.log('   ✅ Validação de idade (6-100 anos)');
    console.log('   ✅ Cálculo automático da idade');
    console.log('   ✅ Armazenamento no banco de dados');
    console.log('   ✅ Exibição no portal do estudante');
    console.log('   ✅ Login e acesso ao portal');
    console.log('\n💡 Comandos úteis:');
    console.log('   node scripts/test-sarah-cypress.js          # Executar teste da Sarah');
    console.log('   node scripts/test-sarah-cypress.js --open   # Modo interativo');
    console.log('   npm run cypress:run                         # Todos os testes');
    
  } catch (error) {
    console.error('\n❌ Erro ao executar testes:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Verificar se a aplicação está rodando');
    console.error('   2. Verificar conectividade de rede');
    console.error('   3. Verificar se o email da Sarah não está em uso');
    console.error('   4. Executar em modo interativo: node scripts/test-sarah-cypress.js --open');
    console.error('   5. Verificar se a funcionalidade de data de nascimento está implementada');
    process.exit(1);
  }
}

// Função para mostrar ajuda
function showHelp() {
  console.log('🧪 Script de Testes Cypress - Sarah Student Registration\n');
  console.log('Uso: node scripts/test-sarah-cypress.js [opções]\n');
  console.log('Opções:');
  console.log('  --open, -o              Abrir Cypress em modo interativo');
  console.log('  --headless, -h          Executar em modo headless');
  console.log('  --spec=<arquivo>        Executar teste específico');
  console.log('  --help                  Mostrar esta ajuda\n');
  console.log('Exemplos:');
  console.log('  node scripts/test-sarah-cypress.js');
  console.log('  node scripts/test-sarah-cypress.js --open');
  console.log('  node scripts/test-sarah-cypress.js --spec=cypress/e2e/sarah-student-registration.cy.ts\n');
  console.log('🎂 Funcionalidades Testadas:');
  console.log('  • Registro de estudante com data de nascimento');
  console.log('  • Validação de idade para Escola do Ministério (6-100 anos)');
  console.log('  • Cálculo automático da idade em tempo real');
  console.log('  • Armazenamento da data de nascimento no banco de dados');
  console.log('  • Exibição da data de nascimento e idade no portal do estudante');
  console.log('  • Login e acesso ao portal personalizado');
  console.log('  • Validação de casos extremos (muito jovem, muito velho, data futura)\n');
  console.log('👤 Dados de Teste da Sarah:');
  console.log(`  • Nome: ${config.fullName}`);
  console.log(`  • Email: ${config.email}`);
  console.log(`  • Data de Nascimento: ${config.dateOfBirth} (${config.age} anos)`);
  console.log(`  • Congregação: ${config.congregation}`);
  console.log(`  • Cargo: ${config.role}\n`);
}

// Verificar argumentos
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Executar testes
runSarahTests();
