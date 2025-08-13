import { supabase } from '@/integrations/supabase/client';

export const fixCongregacaoSystem = async () => {
  try {
    console.log('🔧 Corrigindo sistema de congregações...');
    
    // 1. Criar tabela congregacoes se não existir
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.congregacoes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(100) NOT NULL UNIQUE,
        pais VARCHAR(50) NOT NULL,
        cidade VARCHAR(100) NOT NULL,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    
    await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    // 2. Inserir congregações baseadas nos profiles existentes
    const { data: profiles } = await supabase
      .from('profiles')
      .select('congregacao')
      .not('congregacao', 'is', null);
    
    const congregacoesUnicas = [...new Set(profiles?.map(p => p.congregacao))];
    
    for (const nome of congregacoesUnicas) {
      if (nome) {
        const pais = nome === 'Market Harborough' ? 'Reino Unido' : 'Brasil';
        const cidade = nome === 'Market Harborough' ? 'Market Harborough' : 
                      nome === 'compensa' ? 'Manaus' : 'São Paulo';
        
        await supabase
          .from('congregacoes')
          .upsert({ nome, pais, cidade }, { onConflict: 'nome' });
        
        console.log(`✅ Congregação: ${nome}`);
      }
    }
    
    // 3. Adicionar coluna congregacao_id se não existir
    try {
      await supabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id);'
      });
    } catch (e) {
      console.log('Coluna congregacao_id já existe');
    }
    
    // 4. Atualizar estudantes com congregacao_id
    const { data: congregacoes } = await supabase
      .from('congregacoes')
      .select('id, nome');
    
    for (const cong of congregacoes || []) {
      await supabase
        .from('estudantes')
        .update({ congregacao_id: cong.id })
        .eq('congregacao', cong.nome);
    }
    
    // 5. Criar estudantes para profiles que não têm registro na tabela estudantes
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'estudante');
    
    const { data: existingStudents } = await supabase
      .from('estudantes')
      .select('user_id');
    
    const existingUserIds = new Set(existingStudents?.map(s => s.user_id));
    
    for (const profile of allProfiles || []) {
      if (!existingUserIds.has(profile.id)) {
        console.log(`Criando estudante: ${profile.nome_completo}`);
        
        const congregacao = congregacoes?.find(c => c.nome === profile.congregacao);
        
        // Calcular idade da data de nascimento
        let idade = 25;
        if (profile.date_of_birth) {
          const birth = new Date(profile.date_of_birth);
          const today = new Date();
          idade = today.getFullYear() - birth.getFullYear();
          if (today.getMonth() < birth.getMonth() || 
              (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
            idade--;
          }
        }
        
        // Determinar gênero pelo nome
        const nome = profile.nome_completo?.toLowerCase() || '';
        const genero = (nome.includes('ellen') || nome.includes('maria') || 
                       nome.includes('ana') || nome.includes('julia')) ? 'feminino' : 'masculino';
        
        // Mapear cargo
        const cargoMap = {
          'conselheiro_assistente': 'servo_ministerial',
          'publicador_batizado': 'publicador_batizado',
          'publicador_nao_batizado': 'publicador_nao_batizado'
        };
        const cargo = cargoMap[profile.cargo] || 'estudante_novo';
        
        await supabase
          .from('estudantes')
          .insert({
            user_id: profile.id,
            nome: profile.nome_completo,
            idade,
            genero,
            cargo,
            congregacao: profile.congregacao,
            congregacao_id: congregacao?.id,
            ativo: true,
            reading: true,
            starting: true,
            following: true,
            making: true,
            explaining: true,
            talk: cargo === 'publicador_batizado' && genero === 'masculino'
          });
        
        console.log(`✅ Criado: ${profile.nome_completo}`);
      }
    }
    
    console.log('🎉 Sistema de congregações corrigido!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro:', error);
    return false;
  }
};