import { supabase } from '@/integrations/supabase/client';

export const syncProfilestoEstudantes = async () => {
  try {
    console.log('🔄 Sincronizando profiles para estudantes...');
    
    // Buscar todos os profiles que são estudantes
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'estudante');
    
    if (profilesError) {
      console.error('Erro ao buscar profiles:', profilesError);
      return false;
    }
    
    console.log(`Encontrados ${profiles?.length || 0} profiles de estudantes`);
    
    for (const profile of profiles || []) {
      // Verificar se já existe na tabela estudantes
      const { data: existingStudent } = await supabase
        .from('estudantes')
        .select('id')
        .eq('user_id', profile.id)
        .single();
      
      if (!existingStudent) {
        console.log(`Criando estudante para: ${profile.nome_completo}`);
        
        // Calcular idade a partir da data de nascimento
        let idade = 25; // Default
        if (profile.date_of_birth) {
          const birthDate = new Date(profile.date_of_birth);
          const today = new Date();
          idade = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            idade--;
          }
        }
        
        // Determinar gênero pelo nome (simplificado)
        const genero = profile.nome_completo?.toLowerCase().includes('mauricio') ? 'masculino' : 'masculino';
        
        // Criar estudante
        const { error: insertError } = await supabase
          .from('estudantes')
          .insert({
            user_id: profile.id,
            nome: profile.nome_completo || 'Nome não informado',
            idade: idade,
            genero: genero,
            cargo: profile.cargo || 'estudante_novo',
            congregacao: profile.congregacao || 'Market Harborough',
            pais: profile.congregacao === 'Market Harborough' ? 'Reino Unido' : 'Brasil',
            cidade: profile.congregacao === 'Market Harborough' ? 'Market Harborough' : 'São Paulo',
            ativo: true,
            // Designações baseadas no cargo
            chairman: false,
            pray: false,
            tresures: false,
            gems: false,
            reading: true,
            starting: true,
            following: true,
            making: true,
            explaining: true,
            talk: profile.cargo === 'publicador_batizado'
          });
        
        if (insertError) {
          console.error(`Erro ao criar estudante ${profile.nome_completo}:`, insertError);
        } else {
          console.log(`✅ Estudante criado: ${profile.nome_completo}`);
        }
      } else {
        console.log(`- Estudante já existe: ${profile.nome_completo}`);
      }
    }
    
    console.log('✅ Sincronização concluída!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante sincronização:', error);
    return false;
  }
};