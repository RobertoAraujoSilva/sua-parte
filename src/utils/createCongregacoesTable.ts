import { supabase } from '@/integrations/supabase/client';

export const createCongregacoesTable = async () => {
  try {
    console.log('🏛️ Criando tabela congregacoes...');
    
    // 1. Criar tabela congregacoes
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.congregacoes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(100) NOT NULL UNIQUE,
        pais VARCHAR(50) NOT NULL,
        cidade VARCHAR(100) NOT NULL,
        idioma VARCHAR(10) DEFAULT 'pt-BR',
        timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
        codigo_pais VARCHAR(5) DEFAULT '+55',
        formato_telefone VARCHAR(50) DEFAULT '(##) #####-####',
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    
    await supabase.rpc('exec_sql', { sql: createTableSQL });
    console.log('✅ Tabela congregacoes criada');
    
    // 2. Inserir congregações baseadas nos dados existentes
    const congregacoesData = [
      {
        nome: 'Market Harborough',
        pais: 'Reino Unido',
        cidade: 'Market Harborough',
        idioma: 'en-GB',
        timezone: 'Europe/London',
        codigo_pais: '+44',
        formato_telefone: '#### ### ####'
      },
      {
        nome: 'compensa',
        pais: 'Brasil',
        cidade: 'Manaus',
        idioma: 'pt-BR',
        timezone: 'America/Manaus',
        codigo_pais: '+55',
        formato_telefone: '(##) #####-####'
      },
      {
        nome: 'Test Congregation',
        pais: 'Brasil',
        cidade: 'São Paulo',
        idioma: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        codigo_pais: '+55',
        formato_telefone: '(##) #####-####'
      },
      {
        nome: 'Teste',
        pais: 'Brasil',
        cidade: 'São Paulo',
        idioma: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        codigo_pais: '+55',
        formato_telefone: '(##) #####-####'
      }
    ];
    
    for (const cong of congregacoesData) {
      const { error } = await supabase
        .from('congregacoes')
        .insert(cong)
        .select()
        .single();
      
      if (error && !error.message.includes('duplicate key')) {
        console.error(`Erro ao inserir ${cong.nome}:`, error);
      } else {
        console.log(`✅ Congregação inserida: ${cong.nome}`);
      }
    }
    
    // 3. Adicionar coluna congregacao_id à tabela estudantes
    const addColumnSQL = `
      ALTER TABLE public.estudantes 
      ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id) ON DELETE SET NULL;
    `;
    
    await supabase.rpc('exec_sql', { sql: addColumnSQL });
    console.log('✅ Coluna congregacao_id adicionada');
    
    // 4. Atualizar estudantes com congregacao_id
    const { data: congregacoes } = await supabase
      .from('congregacoes')
      .select('id, nome');
    
    if (congregacoes) {
      for (const cong of congregacoes) {
        await supabase
          .from('estudantes')
          .update({ congregacao_id: cong.id })
          .eq('congregacao', cong.nome);
        
        console.log(`✅ Estudantes atualizados para ${cong.nome}`);
      }
    }
    
    // 5. Criar estudantes para profiles sem registro
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'estudante');
    
    const { data: estudantesExistentes } = await supabase
      .from('estudantes')
      .select('user_id');
    
    const userIdsExistentes = new Set(estudantesExistentes?.map(e => e.user_id));
    
    for (const profile of profiles || []) {
      if (!userIdsExistentes.has(profile.id)) {
        console.log(`Criando estudante para: ${profile.nome_completo}`);
        
        // Buscar congregacao_id
        const congregacao = congregacoes?.find(c => c.nome === profile.congregacao);
        
        // Calcular idade
        let idade = 25;
        if (profile.date_of_birth) {
          const birthDate = new Date(profile.date_of_birth);
          const today = new Date();
          idade = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            idade--;
          }
        }
        
        // Determinar gênero
        const nomeCompleto = profile.nome_completo?.toLowerCase() || '';
        const genero = (nomeCompleto.includes('ellen') || nomeCompleto.includes('maria') || 
                       nomeCompleto.includes('ana') || nomeCompleto.includes('julia') ||
                       nomeCompleto.includes('mauricio')) ? 
                       (nomeCompleto.includes('mauricio') ? 'masculino' : 'feminino') : 'masculino';
        
        // Mapear cargo
        const cargoMap = {
          'conselheiro_assistente': 'servo_ministerial',
          'publicador_batizado': 'publicador_batizado',
          'publicador_nao_batizado': 'publicador_nao_batizado'
        };
        const cargo = cargoMap[profile.cargo] || 'estudante_novo';
        
        const { error } = await supabase
          .from('estudantes')
          .insert({
            user_id: profile.id,
            nome: profile.nome_completo || 'Nome não informado',
            idade: idade,
            genero: genero,
            cargo: cargo,
            congregacao: profile.congregacao,
            congregacao_id: congregacao?.id,
            pais: profile.congregacao === 'Market Harborough' ? 'Reino Unido' : 'Brasil',
            cidade: profile.congregacao === 'Market Harborough' ? 'Market Harborough' : 
                    profile.congregacao === 'compensa' ? 'Manaus' : 'São Paulo',
            ativo: true,
            chairman: false,
            pray: cargo === 'servo_ministerial',
            tresures: cargo === 'servo_ministerial',
            gems: cargo === 'servo_ministerial',
            reading: true,
            starting: true,
            following: true,
            making: true,
            explaining: true,
            talk: ['servo_ministerial', 'publicador_batizado'].includes(cargo) && genero === 'masculino'
          });
        
        if (error) {
          console.error(`Erro ao criar ${profile.nome_completo}:`, error);
        } else {
          console.log(`✅ Criado: ${profile.nome_completo}`);
        }
      }
    }
    
    console.log('🎉 Sistema de congregações configurado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao criar sistema de congregações:', error);
    return false;
  }
};