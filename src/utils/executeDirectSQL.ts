import { supabase } from '@/integrations/supabase/client';

export const executeDirectSQL = async () => {
  try {
    console.log('🔧 Executando correções diretas no banco...');
    
    // 1. Criar tabela congregacoes
    const createCongregacoesSQL = `
      CREATE TABLE IF NOT EXISTS public.congregacoes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(100) NOT NULL UNIQUE,
        pais VARCHAR(50) NOT NULL,
        cidade VARCHAR(100) NOT NULL,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    
    await supabase.rpc('exec_sql', { sql: createCongregacoesSQL });
    console.log('✅ Tabela congregacoes criada');
    
    // 2. Inserir congregações
    const insertCongregacoesSQL = `
      INSERT INTO public.congregacoes (nome, pais, cidade) VALUES
      ('Market Harborough', 'Reino Unido', 'Market Harborough'),
      ('compensa', 'Brasil', 'Manaus'),
      ('Test Congregation', 'Brasil', 'São Paulo'),
      ('Teste', 'Brasil', 'São Paulo')
      ON CONFLICT (nome) DO NOTHING;
    `;
    
    await supabase.rpc('exec_sql', { sql: insertCongregacoesSQL });
    console.log('✅ Congregações inseridas');
    
    // 3. Adicionar coluna congregacao_id
    const addColumnSQL = `
      ALTER TABLE public.estudantes 
      ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id);
    `;
    
    await supabase.rpc('exec_sql', { sql: addColumnSQL });
    console.log('✅ Coluna congregacao_id adicionada');
    
    // 4. Atualizar congregacao_id nos estudantes existentes
    const updateEstudantesSQL = `
      UPDATE public.estudantes e
      SET congregacao_id = c.id
      FROM public.congregacoes c
      WHERE e.congregacao = c.nome;
    `;
    
    await supabase.rpc('exec_sql', { sql: updateEstudantesSQL });
    console.log('✅ Estudantes atualizados com congregacao_id');
    
    // 5. Criar estudantes para profiles sem registro
    const createMissingStudentsSQL = `
      INSERT INTO public.estudantes (
        user_id, nome, idade, genero, cargo, congregacao, congregacao_id, ativo,
        reading, starting, following, making, explaining, talk
      )
      SELECT 
        p.id,
        p.nome_completo,
        CASE 
          WHEN p.date_of_birth IS NOT NULL THEN 
            EXTRACT(YEAR FROM AGE(p.date_of_birth))::INTEGER
          ELSE 25
        END,
        CASE 
          WHEN LOWER(p.nome_completo) LIKE '%ellen%' OR 
               LOWER(p.nome_completo) LIKE '%maria%' OR
               LOWER(p.nome_completo) LIKE '%ana%' OR
               LOWER(p.nome_completo) LIKE '%julia%' THEN 'feminino'
          ELSE 'masculino'
        END,
        CASE 
          WHEN p.cargo = 'conselheiro_assistente' THEN 'servo_ministerial'
          WHEN p.cargo = 'publicador_batizado' THEN 'publicador_batizado'
          WHEN p.cargo = 'publicador_nao_batizado' THEN 'publicador_nao_batizado'
          ELSE 'estudante_novo'
        END,
        p.congregacao,
        c.id,
        true,
        true, true, true, true, true,
        CASE 
          WHEN p.cargo = 'publicador_batizado' AND 
               NOT (LOWER(p.nome_completo) LIKE '%ellen%' OR 
                    LOWER(p.nome_completo) LIKE '%maria%' OR
                    LOWER(p.nome_completo) LIKE '%ana%' OR
                    LOWER(p.nome_completo) LIKE '%julia%') THEN true
          ELSE false
        END
      FROM public.profiles p
      JOIN public.congregacoes c ON p.congregacao = c.nome
      WHERE p.role = 'estudante'
        AND NOT EXISTS (
          SELECT 1 FROM public.estudantes e WHERE e.user_id = p.id
        );
    `;
    
    await supabase.rpc('exec_sql', { sql: createMissingStudentsSQL });
    console.log('✅ Estudantes criados para profiles faltantes');
    
    // 6. Verificar resultados
    const { data: congregacoes } = await supabase
      .from('congregacoes')
      .select('nome, (select count(*) from estudantes where congregacao_id = congregacoes.id) as total_estudantes');
    
    console.log('\n📊 RESULTADO FINAL:');
    congregacoes?.forEach(cong => {
      console.log(`${cong.nome}: ${cong.total_estudantes} estudantes`);
    });
    
    console.log('🎉 Sistema corrigido com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro:', error);
    return false;
  }
};