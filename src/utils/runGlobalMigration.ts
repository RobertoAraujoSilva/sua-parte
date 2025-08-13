import { supabase } from '@/integrations/supabase/client';

export const runGlobalCongregationMigration = async () => {
  try {
    console.log('🌍 Executando migração global de congregações...');
    
    // Step 1: Add basic columns to estudantes table
    console.log('📝 Adicionando colunas básicas...');
    
    const addColumnsQueries = [
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS congregacao VARCHAR(100)',
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS pais VARCHAR(50)',
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS cidade VARCHAR(100)',
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS chairman BOOLEAN DEFAULT false',
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS pray BOOLEAN DEFAULT false',
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS tresures BOOLEAN DEFAULT false',
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS gems BOOLEAN DEFAULT false',
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS reading BOOLEAN DEFAULT false',
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS starting BOOLEAN DEFAULT false',
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS following BOOLEAN DEFAULT false',
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS making BOOLEAN DEFAULT false',
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS explaining BOOLEAN DEFAULT false',
      'ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS talk BOOLEAN DEFAULT false'
    ];
    
    for (const query of addColumnsQueries) {
      try {
        await supabase.rpc('exec_sql', { sql: query });
      } catch (error) {
        console.log(`Coluna já existe ou erro esperado: ${error}`);
      }
    }
    
    // Step 2: Update Franklin specifically
    console.log('👤 Atualizando Franklin...');
    const { error: franklinError } = await supabase
      .from('estudantes')
      .update({ 
        congregacao: 'Market Harborough',
        pais: 'Reino Unido',
        cidade: 'Market Harborough'
      })
      .eq('id', 'd4036a52-2e89-4d79-9e4a-593e7f9fc1af');
    
    if (franklinError) {
      console.error('❌ Erro ao atualizar Franklin:', franklinError);
    } else {
      console.log('✅ Franklin atualizado com sucesso');
    }
    
    // Step 3: Update all other students
    console.log('👥 Atualizando outros estudantes...');
    const { error: updateAllError } = await supabase
      .from('estudantes')
      .update({ 
        congregacao: 'Market Harborough',
        pais: 'Reino Unido',
        cidade: 'Market Harborough'
      })
      .neq('id', 'd4036a52-2e89-4d79-9e4a-593e7f9fc1af');
    
    if (updateAllError) {
      console.error('❌ Erro ao atualizar estudantes:', updateAllError);
    } else {
      console.log('✅ Todos os estudantes atualizados');
    }
    
    // Step 4: Set default designation values for different roles
    console.log('🎯 Configurando designações por cargo...');
    
    // Anciãos - todas as designações
    await supabase
      .from('estudantes')
      .update({
        chairman: true,
        pray: true,
        tresures: true,
        gems: true,
        reading: true,
        starting: true,
        following: true,
        making: true,
        explaining: true,
        talk: true
      })
      .eq('cargo', 'anciao');
    
    // Servos ministeriais - maioria das designações
    await supabase
      .from('estudantes')
      .update({
        chairman: false,
        pray: true,
        tresures: true,
        gems: true,
        reading: true,
        starting: true,
        following: true,
        making: true,
        explaining: true,
        talk: true
      })
      .eq('cargo', 'servo_ministerial');
    
    // Publicadores batizados - designações básicas
    await supabase
      .from('estudantes')
      .update({
        chairman: false,
        pray: false,
        tresures: false,
        gems: false,
        reading: true,
        starting: true,
        following: true,
        making: true,
        explaining: true,
        talk: true
      })
      .eq('cargo', 'publicador_batizado');
    
    // Pioneiros - designações intermediárias
    await supabase
      .from('estudantes')
      .update({
        chairman: false,
        pray: false,
        tresures: false,
        gems: false,
        reading: true,
        starting: true,
        following: true,
        making: true,
        explaining: true,
        talk: false
      })
      .in('cargo', ['pioneiro_regular', 'pioneiro_especial']);
    
    // Estudantes novos e não batizados - designações limitadas
    await supabase
      .from('estudantes')
      .update({
        chairman: false,
        pray: false,
        tresures: false,
        gems: false,
        reading: true,
        starting: true,
        following: true,
        making: true,
        explaining: true,
        talk: false
      })
      .in('cargo', ['estudante_novo', 'publicador_nao_batizado']);
    
    console.log('✅ Designações configuradas por cargo');
    
    console.log('🎉 Migração global concluída com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    return false;
  }
};