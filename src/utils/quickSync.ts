import { supabase } from '@/integrations/supabase/client';

export const quickSync = async () => {
  console.log('🚀 Quick sync iniciado...');
  
  try {
    // Buscar Franklin e Mauricio que são estudantes
    const { data: students } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'estudante')
      .in('id', ['77c99e53-500b-4140-b7fc-a69f96b216e1', '5961ba03-bec3-41bd-9fb9-f5e3ef018d2d']);

    console.log('Estudantes encontrados:', students);

    // Buscar instrutor da Market Harborough
    const { data: instructor } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'instrutor')
      .eq('congregacao', 'Market Harborough')
      .single();

    console.log('Instrutor encontrado:', instructor);

    if (instructor && students) {
      for (const student of students) {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('estudantes')
          .select('id')
          .eq('user_id', instructor.id)
          .eq('nome', student.nome_completo)
          .single();

        if (!existing) {
          console.log(`Criando entrada para: ${student.nome_completo}`);
          
          const { error } = await supabase
            .from('estudantes')
            .insert({
              user_id: instructor.id,
              nome: student.nome_completo,
              idade: 20,
              genero: 'masculino',
              cargo: 'publicador_nao_batizado',
              ativo: true,
              observacoes: `Auto-sync: ${student.id}`
            });

          if (error) {
            console.error('Erro ao inserir:', error);
          } else {
            console.log('✅ Inserido com sucesso');
          }
        } else {
          console.log(`${student.nome_completo} já existe`);
        }
      }
    }

    console.log('✅ Quick sync concluído');
    return true;
  } catch (error) {
    console.error('❌ Erro no quick sync:', error);
    return false;
  }
};

if (typeof window !== 'undefined') {
  (window as any).quickSync = quickSync;
  console.log('🔧 Quick sync available: window.quickSync()');
}