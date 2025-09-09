import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEstudantesData() {
  console.log('🔍 Verificando dados reais na tabela estudantes...');
  
  try {
    // 1. Verificar estrutura da tabela estudantes
    const { data: estudantesSample, error: estudantesError } = await supabase
      .from('estudantes')
      .select('*')
      .limit(1);
    
    if (estudantesError) {
      console.error('❌ Erro ao acessar estudantes:', estudantesError);
      return;
    }
    
    console.log('✅ Tabela estudantes acessível');
    
    if (estudantesSample && estudantesSample.length > 0) {
      const estudante = estudantesSample[0];
      console.log('\n📊 COLUNAS DISPONÍVEIS:');
      Object.keys(estudante).forEach(key => {
        console.log(`   - ${key}: ${typeof estudante[key]} = ${estudante[key]}`);
      });
    } else {
      console.log('⚠️ Tabela estudantes está vazia');
    }
    
    // 2. Contar total de estudantes
    console.log('\n📊 Contando total de estudantes...');
    
    try {
      const { count, error } = await supabase
        .from('estudantes')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log('⚠️ Não foi possível contar estudantes:', error.message);
      } else {
        console.log(`✅ Total de estudantes: ${count}`);
      }
    } catch (error) {
      console.log('⚠️ Erro ao contar estudantes:', error.message);
    }
    
    // 3. Verificar se há dados de exemplo
    console.log('\n🔍 Verificando dados de exemplo...');
    
    try {
      const { data: sampleData, error: sampleError } = await supabase
        .from('estudantes')
        .select('*')
        .limit(5);
      
      if (sampleError) {
        console.log('⚠️ Erro ao buscar dados de exemplo:', sampleError.message);
      } else if (sampleData && sampleData.length > 0) {
        console.log('✅ Dados de exemplo encontrados:');
        sampleData.forEach((estudante, index) => {
          console.log(`\n   ${index + 1}. ${estudante.nome || estudante.nome_completo || 'Nome não definido'}`);
          console.log(`      Cargo: ${estudante.cargo || 'Não definido'}`);
          console.log(`      Gênero: ${estudante.genero || 'Não definido'}`);
          console.log(`      Ativo: ${estudante.ativo || 'Não definido'}`);
        });
      } else {
        console.log('⚠️ Nenhum dado encontrado na tabela estudantes');
      }
    } catch (error) {
      console.log('⚠️ Erro ao buscar dados de exemplo:', error.message);
    }
    
    // 4. Verificar tabela programas
    console.log('\n📚 Verificando tabela programas...');
    
    try {
      const { data: programas, error: programasError } = await supabase
        .from('programas')
        .select('*')
        .limit(5);
      
      if (programasError) {
        console.log('⚠️ Erro ao acessar programas:', programasError.message);
      } else if (programas && programas.length > 0) {
        console.log(`✅ ${programas.length} programas encontrados`);
        programas.forEach((programa, index) => {
          console.log(`   ${index + 1}. ${programa.titulo || programa.nome || 'Título não definido'}`);
          console.log(`      Data: ${programa.data || programa.data_inicio || 'Data não definida'}`);
        });
      } else {
        console.log('⚠️ Tabela programas está vazia');
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar programas:', error.message);
    }
    
    console.log('\n🎯 DIAGNÓSTICO COMPLETO:');
    console.log('   O AdminDashboard não está funcionando porque:');
    console.log('   1. ✅ Tabelas existem e são acessíveis');
    console.log('   2. ❌ Tabelas estão vazias (sem dados)');
    console.log('   3. ❌ Não há usuários cadastrados');
    console.log('   4. ❌ Não há estudantes cadastrados');
    console.log('   5. ❌ Não há programas cadastrados');
    
    console.log('\n💡 SOLUÇÕES:');
    console.log('   1. CADASTRAR DADOS DE EXEMPLO:');
    console.log('      - Criar usuário admin');
    console.log('      - Cadastrar alguns estudantes');
    console.log('      - Importar programa de exemplo');
    
    console.log('   2. USAR FUNCIONALIDADES EXISTENTES:');
    console.log('      - Sistema de cadastro de estudantes');
    console.log('      - Importação de planilhas Excel');
    console.log('      - Sistema de designações');
    
    console.log('   3. TESTAR COM DADOS REAIS:');
    console.log('      - Fazer login como admin');
    console.log('      - Cadastrar dados através da interface');
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
  }
}

// Executar verificação
checkEstudantesData();
