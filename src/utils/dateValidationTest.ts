/**
 * Test utility to verify the date validation fix
 * This can be run in the browser console to test the formatarDataSegura function
 */

import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Same function as implemented in ModalPreviaDesignacoes.tsx
 */
export const formatarDataSegura = (dataString: string): string => {
  if (!dataString || dataString.trim() === '') {
    return 'Data não informada';
  }

  try {
    // Try to parse the date string
    const data = parseISO(dataString);
    
    // Check if the parsed date is valid
    if (!isValid(data)) {
      console.warn(`Data inválida recebida: "${dataString}"`);
      return 'Data inválida';
    }

    // Format the valid date
    return format(data, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error, 'Data recebida:', dataString);
    return 'Erro na data';
  }
};

/**
 * Test cases for the date validation fix
 */
export const testDateValidation = () => {
  console.log('🧪 Testando correção de validação de data...\n');

  const testCases = [
    { input: '', expected: 'Data não informada', description: 'String vazia' },
    { input: '   ', expected: 'Data não informada', description: 'String com espaços' },
    { input: 'invalid-date', expected: 'Data inválida', description: 'Data inválida' },
    { input: '2024-08-12', expected: '12/08/2024', description: 'Data válida ISO' },
    { input: '2024-12-25', expected: '25/12/2024', description: 'Data de Natal' },
    { input: '2024-02-29', expected: '29/02/2024', description: 'Ano bissexto' },
    { input: '2023-02-29', expected: 'Data inválida', description: 'Ano não bissexto' },
    { input: 'abc123', expected: 'Data inválida', description: 'String aleatória' },
    { input: '2024-13-01', expected: 'Data inválida', description: 'Mês inválido' },
    { input: '2024-01-32', expected: 'Data inválida', description: 'Dia inválido' }
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    const result = formatarDataSegura(testCase.input);
    const success = result === testCase.expected;
    
    if (success) {
      console.log(`✅ Teste ${index + 1}: ${testCase.description}`);
      console.log(`   Input: "${testCase.input}" → Output: "${result}"`);
      passed++;
    } else {
      console.log(`❌ Teste ${index + 1}: ${testCase.description}`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   Esperado: "${testCase.expected}"`);
      console.log(`   Recebido: "${result}"`);
      failed++;
    }
    console.log('');
  });

  console.log(`📊 Resultados: ${passed} passou(ram), ${failed} falhou(ram)`);
  
  if (failed === 0) {
    console.log('🎉 Todos os testes passaram! A correção está funcionando corretamente.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique a implementação.');
  }

  return { passed, failed, total: testCases.length };
};

/**
 * Test the original problematic scenario
 */
export const testOriginalError = () => {
  console.log('🔍 Testando cenário original do erro...\n');

  // This would have caused "Invalid time value" error before the fix
  const problematicInput = '';
  
  console.log('Cenário que causava o erro:');
  console.log(`dataInicioSemana = "${problematicInput}"`);
  console.log('new Date(dataInicioSemana) =', new Date(problematicInput));
  console.log('isValid(new Date(dataInicioSemana)) =', isValid(new Date(problematicInput)));
  
  console.log('\nCom a correção:');
  const result = formatarDataSegura(problematicInput);
  console.log(`formatarDataSegura("${problematicInput}") = "${result}"`);
  
  console.log('\n✅ Erro "Invalid time value" foi prevenido!');
  
  return result;
};

// Export for use in browser console or tests
if (typeof window !== 'undefined') {
  (window as any).testDateValidation = testDateValidation;
  (window as any).testOriginalError = testOriginalError;
  (window as any).formatarDataSegura = formatarDataSegura;
}
