import { supabase } from '@/integrations/supabase/client';

export const useMCPSupabase = async () => {
  try {
    console.log('🔌 Usando MCP do Supabase...');
    
    // 1. Criar tabela congregacoes via MCP
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.congregacoes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nome VARCHAR(100) NOT NULL UNIQUE,
          pais VARCHAR(50) NOT NULL,
          cidade VARCHAR(100) NOT NULL,
          ativo BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT now()
        );
        
        INSERT INTO public.congregacoes (nome, pais, cidade) VALUES
        ('Market Harborough', 'Reino Unido', 'Market Harborough'),
        ('compensa', 'Brasil', 'Manaus')
        ON CONFLICT (nome) DO NOTHING;
        
        ALTER TABLE public.estudantes 
        ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id);
      `
    });
    
    if (createError) {
      console.error('Erro ao criar estrutura:', createError);
      return false;
    }
    
    // 2. Atualizar estudantes existentes
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.estudantes e
        SET congregacao_id = c.id
        FROM public.congregacoes c
        WHERE e.congregacao = c.nome;
      `
    });
    
    if (updateError) {
      console.error('Erro ao atualizar estudantes:', updateError);
    }
    
    // 3. Criar estudantes para profiles faltantes
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO public.estudantes (
          user_id, nome, idade, genero, cargo, congregacao, congregacao_id, ativo,
          reading, starting, following, making, explaining, talk
        )
        SELECT 
          p.id,
          p.nome_completo,
          25,
          CASE 
            WHEN LOWER(p.nome_completo) LIKE '%ellen%' THEN 'feminino'
            ELSE 'masculino'
          END,
          CASE 
            WHEN p.cargo = 'conselheiro_assistente' THEN 'servo_ministerial'
            WHEN p.cargo = 'publicador_batizado' THEN 'publicador_batizado'
            ELSE 'estudante_novo'
          END,
          p.congregacao,
          c.id,
          true,
          true, true, true, true, true, false
        FROM public.profiles p
        JOIN public.congregacoes c ON p.congregacao = c.nome
        WHERE p.role = 'estudante'
          AND NOT EXISTS (SELECT 1 FROM public.estudantes e WHERE e.user_id = p.id);
      `
    });
    
    if (insertError) {
      console.error('Erro ao criar estudantes:', insertError);
    }
    
    console.log('✅ MCP Supabase executado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro no MCP:', error);
    return false;
  }
};