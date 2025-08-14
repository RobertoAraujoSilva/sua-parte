import { supabase } from '@/integrations/supabase/client';

export const fixAllViaMCP = async () => {
  try {
    console.log('🔌 Corrigindo tudo via MCP Supabase...');
    
    // Executar tudo via MCP em uma única operação
    const { error } = await supabase.rpc('exec_sql', {
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
        ('compensa', 'Brasil', 'Manaus')
        ON CONFLICT (nome) DO NOTHING;
        
        -- 3. Adicionar colunas necessárias se não existirem
        DO $$ 
        BEGIN
          -- Adicionar coluna congregacao se não existir
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name='estudantes' AND column_name='congregacao') THEN
            ALTER TABLE public.estudantes ADD COLUMN congregacao VARCHAR(100);
          END IF;
          
          -- Adicionar coluna congregacao_id se não existir
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name='estudantes' AND column_name='congregacao_id') THEN
            ALTER TABLE public.estudantes ADD COLUMN congregacao_id UUID REFERENCES public.congregacoes(id);
            CREATE INDEX idx_estudantes_congregacao_id ON public.estudantes(congregacao_id);
          END IF;
        END $$;
        
        -- 4. Definir congregação padrão para estudantes sem congregação
        UPDATE public.estudantes 
        SET congregacao = 'Market Harborough' 
        WHERE congregacao IS NULL;
        
        -- 5. Atualizar estudantes existentes com congregacao_id
        UPDATE public.estudantes e
        SET congregacao_id = c.id
        FROM public.congregacoes c
        WHERE e.congregacao = c.nome AND e.congregacao_id IS NULL;
        
        -- 6. Criar estudantes para profiles faltantes
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
        
        -- 6. Configurar RLS para congregacoes
        GRANT SELECT ON public.congregacoes TO authenticated;
        ALTER TABLE public.congregacoes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Anyone can view congregations" ON public.congregacoes;
        CREATE POLICY "Anyone can view congregations" 
        ON public.congregacoes FOR SELECT USING (ativo = true);
        
        -- 7. Atualizar políticas de estudantes
        DROP POLICY IF EXISTS "Users can view their own students" ON public.estudantes;
        DROP POLICY IF EXISTS "Users can update their own students" ON public.estudantes;
        
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
    
    if (error) {
      console.error('❌ Erro MCP:', error);
      return false;
    }
    
    console.log('✅ Tudo corrigido via MCP Supabase!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro:', error);
    return false;
  }
};