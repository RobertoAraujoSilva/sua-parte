import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyAdminDashboardMigration() {
  console.log('🚀 Aplicando migração do AdminDashboard...');
  
  try {
    // 1. Verificar se as tabelas existem
    console.log('🔍 Verificando estrutura das tabelas...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro ao acessar tabela profiles:', profilesError);
      return;
    }
    
    console.log('✅ Tabela profiles acessível');
    
    // 2. Verificar se há usuários admin
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('role', 'admin');
    
    if (adminError) {
      console.error('❌ Erro ao buscar usuários admin:', adminError);
      return;
    }
    
    console.log('👥 Usuários admin encontrados:', adminUsers.length);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
    // 3. Verificar tabela estudantes
    const { data: estudantes, error: estudantesError } = await supabase
      .from('estudantes')
      .select('count')
      .limit(1);
    
    if (estudantesError) {
      console.log('⚠️ Tabela estudantes não existe ou não acessível');
    } else {
      console.log('✅ Tabela estudantes acessível');
    }
    
    // 4. Verificar tabela programas
    const { data: programas, error: programasError } = await supabase
      .from('programas')
      .select('count')
      .limit(1);
    
    if (programasError) {
      console.log('⚠️ Tabela programas não existe ou não acessível');
    } else {
      console.log('✅ Tabela programas acessível');
    }
    
    // 5. Testar função is_admin_user se existir
    try {
      const { data: adminCheck, error: adminCheckError } = await supabase
        .rpc('is_admin_user');
      
      if (adminCheckError) {
        console.log('⚠️ Função is_admin_user não existe ainda');
      } else {
        console.log('✅ Função is_admin_user funcionando');
      }
    } catch (error) {
      console.log('⚠️ Função is_admin_user não existe ainda');
    }
    
    // 6. Testar view admin_dashboard_stats se existir
    try {
      const { data: stats, error: statsError } = await supabase
        .from('admin_dashboard_stats')
        .select('*');
      
      if (statsError) {
        console.log('⚠️ View admin_dashboard_stats não existe ainda');
      } else {
        console.log('✅ View admin_dashboard_stats funcionando');
        console.log('📊 Estatísticas:', stats[0]);
      }
    } catch (error) {
      console.log('⚠️ View admin_dashboard_stats não existe ainda');
    }
    
    console.log('\n🎯 Status do AdminDashboard:');
    console.log('   - ✅ Conexão Supabase: Funcionando');
    console.log('   - ✅ Tabela profiles: Acessível');
    console.log('   - ⚠️ Tabelas dependentes: Verificar');
    console.log('   - ⚠️ Funções admin: Não implementadas');
    console.log('   - ⚠️ Views admin: Não implementadas');
    
    console.log('\n💡 Para fazer o AdminDashboard funcionar completamente:');
    console.log('   1. Aplicar migração SQL no Supabase Dashboard');
    console.log('   2. Ou executar: npx supabase db push (se configurado)');
    console.log('   3. Ou aplicar manualmente o SQL da migração');
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
  }
}

// Executar verificação
applyAdminDashboardMigration();
