import { supabase } from '@/integrations/supabase/client';

export const safeMCPFix = async () => {
  try {
    console.log('🔌 Usando MCP Supabase para tudo...');
    
    // Executar tudo via MCP em uma única operação
    await supabase.rpc('exec_sql', {
      sql: `
        -- 1. Criar tabela congregacoes
        CREATE TABLE IF NOT EXISTS public.congregacoes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nome VARCHAR(100) NOT NULL UNIQUE,
          pais VARCHAR(50) NOT NULL,
          cidade VARCHAR(100) NOT NULL,
          ativo BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT now()
        );
        
        -- 2. Inserir congregações
        INSERT INTO public.congregacoes (nome, pais, cidade) VALUES
        ('Market Harborough', 'Reino Unido', 'Market Harborough'),
        ('compensa', 'Brasil', 'Manaus'),
        ('Test Congregation', 'Brasil', 'São Paulo'),
        ('Teste', 'Brasil', 'São Paulo')
        ON CONFLICT (nome) DO NOTHING;
        
        -- 3. Adicionar coluna e índice
        ALTER TABLE public.estudantes ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id);
        CREATE INDEX IF NOT EXISTS idx_estudantes_congregacao_id ON public.estudantes(congregacao_id);
        
        -- 4. Atualizar estudantes existentes
        UPDATE public.estudantes e
        SET congregacao_id = c.id
        FROM public.congregacoes c
        WHERE e.congregacao = c.nome;
        
        -- 5. Criar estudantes para profiles faltantes
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
          true, true, true, true, true, false
        FROM public.profiles p
        JOIN public.congregacoes c ON p.congregacao = c.nome
        WHERE p.role = 'estudante'
          AND NOT EXISTS (SELECT 1 FROM public.estudantes e WHERE e.user_id = p.id);
        
        -- 6. Configurar permissões RLS
        GRANT SELECT ON public.congregacoes TO authenticated;
        ALTER TABLE public.congregacoes ENABLE ROW LEVEL SECURITY;
        CREATE POLICY IF NOT EXISTS "Anyone can view congregations" 
        ON public.congregacoes FOR SELECT USING (ativo = true);
        
        -- 7. Atualizar política de estudantes para acesso por congregação
        DROP POLICY IF EXISTS "Users can view their own students" ON public.estudantes;
        CREATE POLICY "Users can view students from same congregation"
        ON public.estudantes FOR SELECT
        USING (
          auth.uid() = user_id OR 
          congregacao IN (
            SELECT p.congregacao 
            FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'instrutor'
          )
        );
        
        DROP POLICY IF EXISTS "Users can update their own students" ON public.estudantes;
        CREATE POLICY "Users can update students from same congregation"
        ON public.estudantes FOR UPDATE
        USING (
          auth.uid() = user_id OR 
          congregacao IN (
            SELECT p.congregacao 
            FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'instrutor'
          )
        );
      `
    });
    
    console.log('🎉 Banco corrigido com políticas de congregação!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro MCP:', error);
    return false;
  }
};