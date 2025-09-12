// Script para testar o carregamento de perfil corrigido
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileLoading() {
  console.log('🔍 Testando carregamento de perfil corrigido...\n');

  try {
    // 1. Autenticar
    console.log('1️⃣ Autenticando...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'frankwebber33@hotmail.com',
      password: 'senha123'
    });

    if (authError) {
      console.error('❌ Erro de autenticação:', authError.message);
      return;
    }

    console.log('✅ Autenticação OK');
    console.log('   User ID:', authData.user?.id);
    console.log('   Email:', authData.user?.email);
    console.log('   Metadata:', authData.user?.user_metadata);

    // 2. Testar carregamento de perfil (simulando o código corrigido)
    console.log('\n2️⃣ Testando carregamento de perfil...');
    
    const userId = authData.user.id;
    
    // Tentar carregar da tabela profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.log('❌ Erro ao carregar perfil:', profileError.message);
      
      // Se for erro PGRST116 (0 rows), criar a partir dos metadados
      if (profileError.code === 'PGRST116') {
        console.log('ℹ️ Perfil não encontrado na tabela, criando a partir dos metadados...');
        
        const metadata = authData.user.user_metadata;
        const profileFromMetadata = {
          id: userId,
          nome_completo: metadata.nome_completo || authData.user.email?.split('@')[0] || 'Usuário',
          congregacao: metadata.congregacao || 'Não informado',
          cargo: metadata.cargo || 'instrutor',
          role: metadata.role || 'instrutor',
          email: authData.user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('✅ Perfil criado a partir dos metadados:', profileFromMetadata);
        return profileFromMetadata;
      }
    } else if (profileData) {
      console.log('✅ Perfil encontrado na tabela:', profileData);
      
      // Garantir que tenha o campo role
      const profileWithRole = {
        ...profileData,
        role: profileData.role || 'instrutor',
        email: profileData.email || authData.user.email || ''
      };
      
      console.log('✅ Perfil com role garantido:', profileWithRole);
      return profileWithRole;
    } else {
      console.log('⚠️ Nenhum perfil encontrado, criando a partir dos metadados...');
      
      const metadata = authData.user.user_metadata;
      const profileFromMetadata = {
        id: userId,
        nome_completo: metadata.nome_completo || authData.user.email?.split('@')[0] || 'Usuário',
        congregacao: metadata.congregacao || 'Não informado',
        cargo: metadata.cargo || 'instrutor',
        role: metadata.role || 'instrutor',
        email: authData.user.email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ Perfil criado a partir dos metadados:', profileFromMetadata);
      return profileFromMetadata;
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testProfileLoading();

