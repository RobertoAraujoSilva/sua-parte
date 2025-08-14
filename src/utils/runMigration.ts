import { supabase } from '@/integrations/supabase/client';

export const runCongregacaoMigration = async () => {
  try {
    console.log('Executando migração do sistema de congregação...');
    
    // Add congregacao column
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.estudantes 
        ADD COLUMN IF NOT EXISTS congregacao VARCHAR(100),
        ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS status_aprovacao VARCHAR(20) DEFAULT 'pendente';
      `
    });
    
    // Update Franklin's record
    const { error: franklinError } = await supabase
      .from('estudantes')
      .update({ 
        congregacao: 'Market Harborough',
        status_aprovacao: 'aprovado'
      })
      .eq('id', 'd4036a52-2e89-4d79-9e4a-593e7f9fc1af');
    
    if (franklinError) {
      console.error('Erro ao atualizar Franklin:', franklinError);
    } else {
      console.log('✓ Franklin atualizado com congregação Market Harborough');
    }
    
    // Update all existing records to set congregacao from user metadata
    const { data: estudantes, error: fetchError } = await supabase
      .from('estudantes')
      .select('id, user_id, congregacao');
    
    if (fetchError) {
      console.error('Erro ao buscar estudantes:', fetchError);
      return false;
    }
    
    // Update congregacao for existing records
    for (const estudante of estudantes || []) {
      if (!estudante.congregacao) {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(estudante.user_id);
        
        if (!userError && userData?.user?.user_metadata?.congregacao) {
          await supabase
            .from('estudantes')
            .update({ 
              congregacao: userData.user.user_metadata.congregacao,
              status_aprovacao: 'aprovado'
            })
            .eq('id', estudante.id);
          
          console.log(`✓ Atualizado congregação para estudante ${estudante.id}`);
        }
      }
    }
    
    console.log('Migração concluída com sucesso!');
    return true;
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
    return false;
  }
};