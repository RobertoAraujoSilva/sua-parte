#!/usr/bin/env node

/**
 * Script para aplicar a migração de correção do schema
 * Sistema Ministerial - Fix Programas Schema and Security
 * Versão simplificada que usa métodos disponíveis do cliente Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function applySchemaFix() {
  console.log('🔧 Aplicando correção do schema...');
  
  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas:');
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
    console.log('');
    console.log('💡 Crie um arquivo .env na raiz do projeto com:');
    console.log('VITE_SUPABASE_URL=sua_url_do_supabase');
    console.log('VITE_SUPABASE_ANON_KEY=sua_chave_anonima');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Testar conexão
    console.log('🔌 Testando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Erro na conexão:', testError);
      process.exit(1);
    }

    console.log('✅ Conexão estabelecida com sucesso');
    console.log('');

    // Verificar estrutura atual
    console.log('🔍 Verificando estrutura atual da tabela programas...');
    const { data: currentPrograms, error: programsError } = await supabase
      .from('programas')
      .select('*')
      .limit(1);

    if (programsError) {
      console.error('❌ Erro ao acessar tabela programas:', programsError);
      process.exit(1);
    }

    console.log('✅ Tabela programas acessível');
    console.log('');

    // Verificar se as colunas já existem
    console.log('📋 Verificando se as colunas semana e arquivo já existem...');
    
    // Tentar inserir um registro de teste para ver a estrutura
    const testProgram = {
      data_inicio_semana: '2025-01-01',
      mes_apostila: 'Janeiro 2025',
      partes: {},
      status: 'rascunho',
      user_id: testData[0].id
    };

    // Tentar adicionar as colunas se não existirem
    try {
      testProgram.semana = 'Semana de teste';
      testProgram.arquivo = 'teste.pdf';
      
      const { data: insertData, error: insertError } = await supabase
        .from('programas')
        .insert(testProgram)
        .select();

      if (insertError) {
        if (insertError.message.includes('semana') || insertError.message.includes('arquivo')) {
          console.log('⚠️ As colunas semana e arquivo ainda não existem');
          console.log('   Erro:', insertError.message);
          console.log('');
          console.log('💡 Para resolver isso, você precisa:');
          console.log('   1. Acessar o Supabase Dashboard');
          console.log('   2. Ir para SQL Editor');
          console.log('   3. Executar o seguinte SQL:');
          console.log('');
          console.log('   ALTER TABLE public.programas ADD COLUMN IF NOT EXISTS semana VARCHAR(100);');
          console.log('   ALTER TABLE public.programas ADD COLUMN IF NOT EXISTS arquivo VARCHAR(255);');
          console.log('');
          console.log('   4. Depois executar:');
          console.log('');
          console.log('   UPDATE public.programas SET semana = COALESCE(mes_apostila, \'Semana de \' || TO_CHAR(data_inicio_semana, \'DD/MM/YYYY\')) WHERE semana IS NULL;');
          console.log('   UPDATE public.programas SET arquivo = \'programa-\' || data_inicio_semana || \'.pdf\' WHERE arquivo IS NULL;');
          console.log('');
          console.log('   5. E finalmente:');
          console.log('');
          console.log('   ALTER TABLE public.programas ALTER COLUMN semana SET NOT NULL;');
          console.log('   ALTER TABLE public.programas ALTER COLUMN arquivo SET NOT NULL;');
          console.log('');
        } else {
          console.log('❌ Erro inesperado:', insertError.message);
        }
      } else {
        console.log('✅ As colunas semana e arquivo já existem!');
        console.log('   Registro de teste inserido com ID:', insertData[0].id);
        
        // Remover o registro de teste
        await supabase
          .from('programas')
          .delete()
          .eq('id', insertData[0].id);
        
        console.log('   Registro de teste removido');
      }
    } catch (error) {
      console.log('⚠️ Erro ao testar estrutura:', error.message);
    }

    console.log('');
    console.log('📊 Verificando dados existentes...');
    const { data: existingPrograms, error: fetchError } = await supabase
      .from('programas')
      .select('id, data_inicio_semana, mes_apostila, semana, arquivo')
      .limit(5);

    if (fetchError) {
      console.log('⚠️ Erro ao buscar programas:', fetchError.message);
    } else {
      console.log(`   📋 ${existingPrograms.length} programas encontrados`);
      existingPrograms.forEach(program => {
        console.log(`      ID: ${program.id}`);
        console.log(`        Data: ${program.data_inicio_semana}`);
        console.log(`        Mês: ${program.mes_apostila || 'N/A'}`);
        console.log(`        Semana: ${program.semana || 'N/A'}`);
        console.log(`        Arquivo: ${program.arquivo || 'N/A'}`);
        console.log('');
      });
    }

    console.log('✅ Verificação concluída!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('   1. Execute o SQL fornecido no Supabase Dashboard');
    console.log('   2. Execute este script novamente para verificar');
    console.log('   3. Teste o sistema no frontend');
    console.log('');

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applySchemaFix();
}

module.exports = { applySchemaFix };
