import { supabase } from '@/integrations/supabase/client';

export const syncStudentsToInstructors = async () => {
  console.log('🔄 Sincronizando estudantes com instrutores...');
  
  try {
    // 1. Buscar todos os profiles de estudantes que não têm entrada na tabela estudantes
    const { data: studentProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'estudante');

    if (profilesError) {
      console.error('Erro ao buscar profiles de estudantes:', profilesError);
      return false;
    }

    console.log(`📊 Encontrados ${studentProfiles?.length || 0} profiles de estudantes`);

    // 2. Para cada estudante, verificar se já existe na tabela estudantes
    for (const studentProfile of studentProfiles || []) {
      const { data: existingStudent } = await supabase
        .from('estudantes')
        .select('id')
        .eq('user_id', studentProfile.id)
        .single();

      if (!existingStudent) {
        console.log(`➕ Criando entrada para estudante: ${studentProfile.nome_completo}`);
        
        // 3. Buscar instrutor da mesma congregação
        const { data: instructor } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'instrutor')
          .eq('congregacao', studentProfile.congregacao)
          .single();

        if (instructor) {
          // 4. Criar entrada na tabela estudantes vinculada ao instrutor
          const { error: insertError } = await supabase
            .from('estudantes')
            .insert({
              user_id: instructor.id, // Vincula ao instrutor, não ao próprio estudante
              nome: studentProfile.nome_completo,
              idade: studentProfile.date_of_birth ? 
                new Date().getFullYear() - new Date(studentProfile.date_of_birth).getFullYear() : 
                null,
              genero: 'masculino', // Default, pode ser ajustado depois
              email: studentProfile.id, // Usar ID do profile como referência
              cargo: studentProfile.cargo || 'estudante_novo',
              ativo: true,
              observacoes: `Estudante auto-cadastrado - Profile ID: ${studentProfile.id}`,
              congregacao_id: null // Será preenchido pela migração
            });

          if (insertError) {
            console.error(`Erro ao criar estudante ${studentProfile.nome_completo}:`, insertError);
          } else {
            console.log(`✅ Estudante ${studentProfile.nome_completo} vinculado ao instrutor`);
          }
        } else {
          console.warn(`⚠️ Nenhum instrutor encontrado para congregação: ${studentProfile.congregacao}`);
        }
      }
    }

    console.log('✅ Sincronização concluída!');
    return true;
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return false;
  }
};

// Disponibilizar globalmente
if (typeof window !== 'undefined') {
  (window as any).syncStudentsToInstructors = syncStudentsToInstructors;
  console.log('🔧 Sync tool available: window.syncStudentsToInstructors()');
}