import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
  console.log('🔍 Verificando estrutura real do banco de dados...');
  
  try {
    // 1. Verificar estrutura da tabela profiles
    console.log('\n📋 Verificando tabela profiles...');
    
    const { data: profilesSample, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro ao acessar profiles:', profilesError);
    } else {
      console.log('✅ Tabela profiles acessível');
      if (profilesSample && profilesSample.length > 0) {
        console.log('📊 Colunas disponíveis:', Object.keys(profilesSample[0]));
        console.log('📝 Exemplo de dados:', profilesSample[0]);
      }
    }
    
    // 2. Verificar se existe tabela auth.users
    console.log('\n🔐 Verificando tabela auth.users...');
    
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.log('⚠️ Não é possível acessar auth.users (normal para usuários não-admin)');
      } else {
        console.log('✅ Tabela auth.users acessível');
        console.log('👥 Total de usuários:', authUsers.users.length);
      }
    } catch (error) {
      console.log('⚠️ Não é possível acessar auth.users (normal para usuários não-admin)');
    }
    
    // 3. Verificar tabela estudantes
    console.log('\n👥 Verificando tabela estudantes...');
    
    try {
      const { data: estudantes, error: estudantesError } = await supabase
        .from('estudantes')
        .select('*')
        .limit(1);
      
      if (estudantesError) {
        console.log('⚠️ Tabela estudantes não existe ou não acessível:', estudantesError.message);
      } else {
        console.log('✅ Tabela estudantes acessível');
        if (estudantes && estudantes.length > 0) {
          console.log('📊 Colunas disponíveis:', Object.keys(estudantes[0]));
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar estudantes:', error.message);
    }
    
    // 4. Verificar tabela programas
    console.log('\n📚 Verificando tabela programas...');
    
    try {
      const { data: programas, error: programasError } = await supabase
        .from('programas')
        .select('*')
        .limit(1);
      
      if (programasError) {
        console.log('⚠️ Tabela programas não existe ou não acessível:', programasError.message);
      } else {
        console.log('✅ Tabela programas acessível');
        if (programas && programas.length > 0) {
          console.log('📊 Colunas disponíveis:', Object.keys(programas[0]));
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar programas:', error.message);
    }
    
    // 5. Listar todas as tabelas disponíveis
    console.log('\n🗄️ Verificando tabelas disponíveis...');
    
    try {
      // Tentar acessar algumas tabelas comuns
      const commonTables = ['congregacoes', 'family_members', 'invitations_log', 'meetings', 'designacoes'];
      
      for (const tableName of commonTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('count')
            .limit(1);
          
          if (error) {
            console.log(`   ⚠️ ${tableName}: ${error.message}`);
          } else {
            console.log(`   ✅ ${tableName}: Acessível`);
          }
        } catch (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`);
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar tabelas:', error.message);
    }
    
    console.log('\n🎯 RESUMO DO STATUS:');
    console.log('   - O AdminDashboard não está funcionando porque:');
    console.log('     1. As tabelas esperadas não existem ou têm estrutura diferente');
    console.log('     2. As migrações não foram aplicadas');
    console.log('     3. O banco está em estado inicial');
    
    console.log('\n💡 SOLUÇÕES:');
    console.log('   1. Aplicar todas as migrações SQL no Supabase Dashboard');
    console.log('   2. Ou criar as tabelas manualmente');
    console.log('   3. Ou usar o sistema como está (funcionalidades limitadas)');
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
  }
}

// Executar verificação
checkDatabaseStructure();
