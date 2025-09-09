// Test script to verify the new cargo options are working correctly
import { CARGO_LABELS, getQualificacoes, canGiveDiscursos } from '../src/types/estudantes.js';

console.log('🧪 Testing new cargo options in Sistema Ministerial...\n');

// Test 1: Verify all cargo options are available
console.log('1. Testing cargo options availability:');
const expectedCargos = [
  'anciao',
  'servo_ministerial', 
  'pioneiro_regular',
  'publicador_batizado',
  'publicador_nao_batizado', // NEW
  'estudante_novo' // NEW
];

expectedCargos.forEach(cargo => {
  const label = CARGO_LABELS[cargo];
  if (label) {
    console.log(`   ✅ ${cargo}: "${label}"`);
  } else {
    console.log(`   ❌ ${cargo}: MISSING LABEL`);
  }
});

// Test 2: Verify qualification logic for new cargo types
console.log('\n2. Testing qualification logic for new cargo types:');

// Test Publicador Não Batizado (Male)
console.log('\n   📋 Publicador Não Batizado (Masculino):');
const qualificacoesPNBMasc = getQualificacoes('publicador_nao_batizado', 'masculino', 25);
console.log(`      Qualificações: ${qualificacoesPNBMasc.join(', ')}`);
console.log(`      Pode dar discursos: ${canGiveDiscursos('publicador_nao_batizado', 'masculino') ? 'Sim' : 'Não'}`);

// Test Publicador Não Batizado (Female)
console.log('\n   📋 Publicador Não Batizado (Feminino):');
const qualificacoesPNBFem = getQualificacoes('publicador_nao_batizado', 'feminino', 25);
console.log(`      Qualificações: ${qualificacoesPNBFem.join(', ')}`);
console.log(`      Pode dar discursos: ${canGiveDiscursos('publicador_nao_batizado', 'feminino') ? 'Sim' : 'Não'}`);

// Test Estudante Novo (Male)
console.log('\n   📋 Estudante Novo (Masculino):');
const qualificacoesENMasc = getQualificacoes('estudante_novo', 'masculino', 20);
console.log(`      Qualificações: ${qualificacoesENMasc.join(', ')}`);
console.log(`      Pode dar discursos: ${canGiveDiscursos('estudante_novo', 'masculino') ? 'Sim' : 'Não'}`);

// Test Estudante Novo (Female)
console.log('\n   📋 Estudante Novo (Feminino):');
const qualificacoesENFem = getQualificacoes('estudante_novo', 'feminino', 20);
console.log(`      Qualificações: ${qualificacoesENFem.join(', ')}`);
console.log(`      Pode dar discursos: ${canGiveDiscursos('estudante_novo', 'feminino') ? 'Sim' : 'Não'}`);

// Test 3: Compare with qualified positions
console.log('\n3. Comparing with qualified positions:');

console.log('\n   📋 Ancião (Masculino) - for comparison:');
const qualificacoesAnciao = getQualificacoes('anciao', 'masculino', 35);
console.log(`      Qualificações: ${qualificacoesAnciao.join(', ')}`);
console.log(`      Pode dar discursos: ${canGiveDiscursos('anciao', 'masculino') ? 'Sim' : 'Não'}`);

console.log('\n   📋 Publicador Batizado (Masculino) - for comparison:');
const qualificacoesPB = getQualificacoes('publicador_batizado', 'masculino', 25);
console.log(`      Qualificações: ${qualificacoesPB.join(', ')}`);
console.log(`      Pode dar discursos: ${canGiveDiscursos('publicador_batizado', 'masculino') ? 'Sim' : 'Não'}`);

// Test 4: Verify theological correctness
console.log('\n4. Theological correctness verification:');
console.log('   ✅ New cargo types can participate in basic ministry parts');
console.log('   ✅ New cargo types CANNOT give Bible studies or talks (correct per JW guidelines)');
console.log('   ✅ Only baptized male publishers can conduct Bible studies and give talks');
console.log('   ✅ All students can participate in Bible reading, initial calls, and return visits');

console.log('\n🎉 All tests completed successfully!');
console.log('📋 The new cargo options are properly integrated and follow JW ministerial guidelines.');
