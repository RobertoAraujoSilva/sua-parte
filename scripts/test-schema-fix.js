const { createClient } = require('@supabase/supabase-js');

async function testSchemaFix() {
  console.log('🧪 Testando se o schema foi corrigido...');
  
  // Usar as credenciais do seu projeto
  const supabaseUrl = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwMTczNTAsImV4cCI6MjA1MDU5MzM1MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Testar se as colunas semana e arquivo existem
    console.log('🔍 Verificando estrutura da tabela programas...');
    
    const { data: programs, error } = await supabase
      .from('programas')
      .select('id, data_inicio_semana, mes_apostila, semana, arquivo')
      .limit(3);

    if (error) {
      console.log('❌ Erro:', error.message);
      return;
    }

    console.log('✅ Sucesso! Colunas semana e arquivo existem!');
    console.log(`📋 ${programs.length} programas encontrados:`);
    
    programs.forEach(program => {
      console.log(`   ID: ${program.id}`);
      console.log(`   Data: ${program.data_inicio_semana}`);
      console.log(`   Semana: ${program.semana || 'N/A'}`);
      console.log(`   Arquivo: ${program.arquivo || 'N/A'}`);
      console.log('');
    });

    console.log('🎉 Schema corrigido com sucesso!');
    console.log('🚀 O sistema deve funcionar agora!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testSchemaFix();
