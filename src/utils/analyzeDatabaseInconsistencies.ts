import { supabase } from '@/integrations/supabase/client';

export const analyzeDatabaseInconsistencies = async () => {
  try {
    console.log('🔍 Analisando inconsistências do banco de dados...');
    
    // 1. Buscar todos os profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Erro ao buscar profiles:', profilesError);
      return false;
    }
    
    // 2. Buscar todos os estudantes
    const { data: estudantes, error: estudantesError } = await supabase
      .from('estudantes')
      .select('*');
    
    if (estudantesError) {
      console.error('Erro ao buscar estudantes:', estudantesError);
      return false;
    }
    
    console.log('\n📊 ANÁLISE COMPLETA DO BANCO:');
    console.log('================================');
    
    // Análise de Profiles
    console.log('\n👥 PROFILES:');
    const congregacoes = new Set();
    const instrutores = [];
    const estudantesProfiles = [];
    
    profiles?.forEach(profile => {
      congregacoes.add(profile.congregacao);
      if (profile.role === 'instrutor') {
        instrutores.push(profile);
      } else if (profile.role === 'estudante') {
        estudantesProfiles.push(profile);
      }
      console.log(`- ${profile.nome_completo} | ${profile.role} | ${profile.congregacao} | ${profile.cargo}`);
    });
    
    console.log(`\n🏛️ CONGREGAÇÕES ENCONTRADAS: ${Array.from(congregacoes).join(', ')}`);
    console.log(`👨‍🏫 INSTRUTORES: ${instrutores.length}`);
    console.log(`👨‍🎓 ESTUDANTES EM PROFILES: ${estudantesProfiles.length}`);
    
    // Análise de Estudantes
    console.log('\n📚 ESTUDANTES NA TABELA:');
    const estudantesPorCongregacao = {};
    estudantes?.forEach(estudante => {
      const cong = estudante.congregacao || 'SEM_CONGREGACAO';
      if (!estudantesPorCongregacao[cong]) {
        estudantesPorCongregacao[cong] = [];
      }
      estudantesPorCongregacao[cong].push(estudante);
      console.log(`- ${estudante.nome} | ${estudante.congregacao} | ${estudante.cargo}`);
    });
    
    console.log('\n📈 ESTUDANTES POR CONGREGAÇÃO:');
    Object.entries(estudantesPorCongregacao).forEach(([cong, lista]) => {
      console.log(`${cong}: ${lista.length} estudantes`);
    });
    
    // Identificar inconsistências
    console.log('\n⚠️ INCONSISTÊNCIAS ENCONTRADAS:');
    
    // 1. Estudantes em profiles mas não em estudantes
    const estudantesSemRegistro = estudantesProfiles.filter(profile => 
      !estudantes?.some(est => est.user_id === profile.id)
    );
    
    if (estudantesSemRegistro.length > 0) {
      console.log(`❌ ${estudantesSemRegistro.length} estudantes em profiles mas não em estudantes:`);
      estudantesSemRegistro.forEach(est => {
        console.log(`  - ${est.nome_completo} (${est.congregacao})`);
      });
    }
    
    // 2. Instrutores sem estudantes na mesma congregação
    console.log('\n👨‍🏫 INSTRUTORES E SEUS ESTUDANTES:');
    instrutores.forEach(instrutor => {
      const estudantesDaCongregacao = estudantes?.filter(est => 
        est.congregacao === instrutor.congregacao
      ) || [];
      
      console.log(`${instrutor.nome_completo} (${instrutor.congregacao}): ${estudantesDaCongregacao.length} estudantes`);
      
      if (estudantesDaCongregacao.length === 0) {
        console.log(`  ⚠️ Instrutor sem estudantes na congregação!`);
      }
    });
    
    // 3. Congregações órfãs
    const congregacoesComEstudantes = new Set(estudantes?.map(e => e.congregacao).filter(Boolean));
    const congregacoesSemEstudantes = Array.from(congregacoes).filter(c => !congregacoesComEstudantes.has(c));
    
    if (congregacoesSemEstudantes.length > 0) {
      console.log(`\n🏛️ Congregações sem estudantes: ${congregacoesSemEstudantes.join(', ')}`);
    }
    
    return {
      profiles,
      estudantes,
      congregacoes: Array.from(congregacoes),
      instrutores,
      estudantesProfiles,
      estudantesSemRegistro,
      estudantesPorCongregacao
    };
    
  } catch (error) {
    console.error('❌ Erro durante análise:', error);
    return false;
  }
};

export const fixAllInconsistencies = async () => {
  try {
    console.log('🔧 Corrigindo todas as inconsistências...');
    
    const analysis = await analyzeDatabaseInconsistencies();
    if (!analysis) return false;
    
    // 1. Criar estudantes para profiles que não têm registro
    for (const profile of analysis.estudantesSemRegistro) {
      console.log(`Criando estudante para: ${profile.nome_completo}`);
      
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
      
      // Determinar gênero pelo nome
      const nomeCompleto = profile.nome_completo?.toLowerCase() || '';
      const genero = (nomeCompleto.includes('ellen') || nomeCompleto.includes('maria') || 
                     nomeCompleto.includes('ana') || nomeCompleto.includes('julia')) ? 'feminino' : 'masculino';
      
      // Mapear cargo
      const cargoMap = {
        'conselheiro_assistente': 'servo_ministerial',
        'publicador_batizado': 'publicador_batizado',
        'estudante_novo': 'estudante_novo'
      };
      const cargo = cargoMap[profile.cargo] || 'estudante_novo';
      
      // Definir designações baseadas no cargo
      const designacoes = {
        chairman: cargo === 'anciao',
        pray: ['anciao', 'servo_ministerial'].includes(cargo),
        tresures: ['anciao', 'servo_ministerial'].includes(cargo),
        gems: ['anciao', 'servo_ministerial'].includes(cargo),
        reading: true,
        starting: true,
        following: true,
        making: true,
        explaining: true,
        talk: ['anciao', 'servo_ministerial', 'publicador_batizado'].includes(cargo) && genero === 'masculino'
      };
      
      const { error } = await supabase
        .from('estudantes')
        .insert({
          user_id: profile.id,
          nome: profile.nome_completo || 'Nome não informado',
          idade: idade,
          genero: genero,
          cargo: cargo,
          congregacao: profile.congregacao,
          pais: profile.congregacao === 'Market Harborough' ? 'Reino Unido' : 'Brasil',
          cidade: profile.congregacao === 'Market Harborough' ? 'Market Harborough' : 
                  profile.congregacao === 'compensa' ? 'Manaus' : 'São Paulo',
          ativo: true,
          ...designacoes
        });
      
      if (error) {
        console.error(`Erro ao criar ${profile.nome_completo}:`, error);
      } else {
        console.log(`✅ Criado: ${profile.nome_completo}`);
      }
    }
    
    // 2. Atualizar estudantes existentes com congregação correta
    console.log('\n🔄 Atualizando congregações dos estudantes existentes...');
    
    for (const estudante of analysis.estudantes) {
      // Buscar profile correspondente
      const profile = analysis.profiles.find(p => p.id === estudante.user_id);
      
      if (profile && profile.congregacao !== estudante.congregacao) {
        console.log(`Atualizando congregação de ${estudante.nome}: ${estudante.congregacao} → ${profile.congregacao}`);
        
        await supabase
          .from('estudantes')
          .update({
            congregacao: profile.congregacao,
            pais: profile.congregacao === 'Market Harborough' ? 'Reino Unido' : 'Brasil',
            cidade: profile.congregacao === 'Market Harborough' ? 'Market Harborough' : 
                    profile.congregacao === 'compensa' ? 'Manaus' : 'São Paulo'
          })
          .eq('id', estudante.id);
      }
    }
    
    console.log('✅ Todas as inconsistências foram corrigidas!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao corrigir inconsistências:', error);
    return false;
  }
};