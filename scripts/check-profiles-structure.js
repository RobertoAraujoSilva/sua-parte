import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfilesStructure() {
  console.log('🔍 Verificando estrutura real da tabela profiles...');
  
  try {
    // 1. Verificar estrutura da tabela profiles
    const { data: profilesSample, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro ao acessar profiles:', profilesError);
      return;
    }
    
    console.log('✅ Tabela profiles acessível');
    
    if (profilesSample && profilesSample.length > 0) {
      const profile = profilesSample[0];
      console.log('\n📊 COLUNAS DISPONÍVEIS:');
      Object.keys(profile).forEach(key => {
        console.log(`   - ${key}: ${typeof profile[key]} = ${profile[key]}`);
      });
      
      console.log('\n📝 EXEMPLO DE DADOS:');
      console.log(JSON.stringify(profile, null, 2));
    } else {
      console.log('⚠️ Tabela profiles está vazia');
    }
    
    // 2. Verificar se há usuários admin
    console.log('\n👑 Verificando usuários admin...');
    
    // Tentar diferentes campos possíveis para role
    const possibleRoleFields = ['role', 'cargo', 'tipo', 'user_role', 'role_type'];
    
    for (const field of possibleRoleFields) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`id, ${field}`)
          .limit(5);
        
        if (!error && data && data.length > 0) {
          console.log(`✅ Campo '${field}' encontrado!`);
          console.log('   Valores únicos:', [...new Set(data.map(item => item[field]))]);
          break;
        }
      } catch (error) {
        // Campo não existe, continuar
      }
    }
    
    // 3. Verificar se há campo congregacao
    console.log('\n🏢 Verificando campo congregacao...');
    
    try {
      const { data: congregacoes, error: congregacoesError } = await supabase
        .from('profiles')
        .select('congregacao')
        .not('congregacao', 'is', null)
        .limit(5);
      
      if (congregacoesError) {
        console.log('⚠️ Campo congregacao não existe ou não acessível');
      } else {
        console.log('✅ Campo congregacao encontrado!');
        console.log('   Valores únicos:', [...new Set(congregacoes.map(item => item.congregacao))]);
      }
    } catch (error) {
      console.log('⚠️ Campo congregacao não existe');
    }
    
    // 4. Contar total de usuários
    console.log('\n📊 Contando total de usuários...');
    
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log('⚠️ Não foi possível contar usuários:', error.message);
      } else {
        console.log(`✅ Total de usuários: ${count}`);
      }
    } catch (error) {
      console.log('⚠️ Erro ao contar usuários:', error.message);
    }
    
    console.log('\n🎯 PROBLEMA IDENTIFICADO:');
    console.log('   O AdminDashboard não está funcionando porque:');
    console.log('   1. A tabela profiles tem estrutura diferente do esperado');
    console.log('   2. Campos como "email" e "role" podem não existir');
    console.log('   3. O sistema está tentando acessar colunas inexistentes');
    
    console.log('\n💡 SOLUÇÃO IMEDIATA:');
    console.log('   Modificar o AdminDashboard para usar a estrutura real da tabela');
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
  }
}

// Executar verificação
checkProfilesStructure();
