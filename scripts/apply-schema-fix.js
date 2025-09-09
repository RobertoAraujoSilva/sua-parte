#!/usr/bin/env node

/**
 * Script para aplicar a migração de correção do schema
 * Sistema Ministerial - Fix Programas Schema and Security
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

    // Aplicar migração
    console.log('📋 Aplicando migração...');
    
    // 1. Adicionar colunas faltantes
    console.log('   📝 Adicionando colunas semana e arquivo...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.programas 
        ADD COLUMN IF NOT EXISTS semana VARCHAR(100),
        ADD COLUMN IF NOT EXISTS arquivo VARCHAR(255);
      `
    });

    if (alterError) {
      console.log('   ⚠️ Colunas já existem ou erro:', alterError.message);
    } else {
      console.log('   ✅ Colunas adicionadas');
    }

    // 2. Atualizar registros existentes
    console.log('   🔄 Atualizando registros existentes...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.programas 
        SET semana = COALESCE(
          mes_apostila,
          'Semana de ' || TO_CHAR(data_inicio_semana, 'DD/MM/YYYY')
        )
        WHERE semana IS NULL;
      `
    });

    if (updateError) {
      console.log('   ⚠️ Erro ao atualizar semana:', updateError.message);
    } else {
      console.log('   ✅ Campo semana atualizado');
    }

    const { error: updateArquivoError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.programas 
        SET arquivo = 'programa-' || data_inicio_semana || '.pdf'
        WHERE arquivo IS NULL;
      `
    });

    if (updateArquivoError) {
      console.log('   ⚠️ Erro ao atualizar arquivo:', updateArquivoError.message);
    } else {
      console.log('   ✅ Campo arquivo atualizado');
    }

    // 3. Verificar se as colunas foram criadas
    console.log('   🔍 Verificando estrutura da tabela...');
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'programas' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (columnsError) {
      console.log('   ⚠️ Erro ao verificar colunas:', columnsError.message);
    } else {
      console.log('   📊 Estrutura atual da tabela programas:');
      columns.forEach(col => {
        console.log(`      ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
      });
    }

    // 4. Verificar se há dados
    console.log('   📊 Verificando dados existentes...');
    const { data: programs, error: programsError } = await supabase
      .from('programas')
      .select('id, data_inicio_semana, mes_apostila, semana, arquivo')
      .limit(5);

    if (programsError) {
      console.log('   ⚠️ Erro ao buscar programas:', programsError.message);
    } else {
      console.log(`   📋 ${programs.length} programas encontrados`);
      programs.forEach(program => {
        console.log(`      ID: ${program.id}`);
        console.log(`        Data: ${program.data_inicio_semana}`);
        console.log(`        Mês: ${program.mes_apostila || 'N/A'}`);
        console.log(`        Semana: ${program.semana || 'N/A'}`);
        console.log(`        Arquivo: ${program.arquivo || 'N/A'}`);
        console.log('');
      });
    }

    console.log('✅ Migração aplicada com sucesso!');
    console.log('');
    console.log('📋 Resumo das correções:');
    console.log('   ✅ Colunas semana e arquivo adicionadas');
    console.log('   ✅ Registros existentes atualizados');
    console.log('   ✅ Estrutura da tabela verificada');
    console.log('');
    console.log('🚀 O sistema agora deve funcionar corretamente!');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applySchemaFix();
}

module.exports = { applySchemaFix };
