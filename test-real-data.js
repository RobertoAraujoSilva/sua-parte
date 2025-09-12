// Script para testar dados reais do Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealData() {
  console.log('🔍 Testando dados reais do Supabase...\n');

  try {
    // 1. Testar conexão básica
    console.log('1️⃣ Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError);
      return;
    }
    console.log('✅ Conexão OK\n');

    // 2. Verificar tabelas existentes
    console.log('2️⃣ Verificando dados nas tabelas...');
    
    // Profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    console.log('📊 Profiles encontrados:', profiles?.length || 0);
    if (profiles?.length > 0) {
      console.log('   Exemplo:', profiles[0]);
    }
    if (profilesError) console.log('   Erro:', profilesError.message);

    // Estudantes
    const { data: estudantes, error: estudantesError } = await supabase
      .from('estudantes')
      .select('*')
      .limit(5);
    
    console.log('👥 Estudantes encontrados:', estudantes?.length || 0);
    if (estudantes?.length > 0) {
      console.log('   Exemplo:', estudantes[0]);
    }
    if (estudantesError) console.log('   Erro:', estudantesError.message);

    // Programas
    const { data: programas, error: programasError } = await supabase
      .from('programas')
      .select('*')
      .limit(5);
    
    console.log('📅 Programas encontrados:', programas?.length || 0);
    if (programas?.length > 0) {
      console.log('   Exemplo:', programas[0]);
    }
    if (programasError) console.log('   Erro:', programasError.message);

    // Designações
    const { data: designacoes, error: designacoesError } = await supabase
      .from('designacoes')
      .select('*')
      .limit(5);
    
    console.log('🎯 Designações encontradas:', designacoes?.length || 0);
    if (designacoes?.length > 0) {
      console.log('   Exemplo:', designacoes[0]);
    }
    if (designacoesError) console.log('   Erro:', designacoesError.message);

    // 3. Testar autenticação
    console.log('\n3️⃣ Testando autenticação...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'frankwebber33@hotmail.com',
      password: 'senha123'
    });

    if (authError) {
      console.error('❌ Erro de autenticação:', authError.message);
    } else {
      console.log('✅ Autenticação OK');
      console.log('   User ID:', authData.user?.id);
      console.log('   Email:', authData.user?.email);
      console.log('   Role:', authData.user?.user_metadata?.role);
    }

    // 4. Testar carregamento de perfil
    if (authData?.user?.id) {
      console.log('\n4️⃣ Testando carregamento de perfil...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.log('⚠️ Perfil não encontrado na tabela profiles');
        console.log('   Erro:', profileError.message);
        console.log('   Usando metadata do usuário...');
        console.log('   Metadata:', authData.user.user_metadata);
      } else {
        console.log('✅ Perfil encontrado:', profile);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testRealData();

