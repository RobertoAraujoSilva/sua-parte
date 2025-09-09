import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  console.log('🚀 Executando migração...');
  
  try {
    // 1. Criar tabela congregacoes
    console.log('1. Criando tabela congregacoes...');
    await supabase.rpc('exec_sql', { 
      sql: `CREATE TABLE IF NOT EXISTS congregacoes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        nome VARCHAR(255) NOT NULL UNIQUE,
        pais VARCHAR(100) NOT NULL DEFAULT 'Brasil',
        cidade VARCHAR(100),
        endereco TEXT,
        telefone VARCHAR(20),
        email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    });

    // 2. Adicionar coluna congregacao_id
    console.log('2. Adicionando coluna congregacao_id...');
    await supabase.rpc('exec_sql', { 
      sql: `ALTER TABLE estudantes ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES congregacoes(id);`
    });

    // 3. Inserir congregações
    console.log('3. Inserindo congregações...');
    await supabase.rpc('exec_sql', { 
      sql: `INSERT INTO congregacoes (nome, pais, cidade) VALUES 
        ('Market Harborough', 'Reino Unido', 'Market Harborough'),
        ('compensa', 'Brasil', 'Manaus')
        ON CONFLICT (nome) DO NOTHING;`
    });

    // 4. Atualizar estudantes
    console.log('4. Atualizando estudantes...');
    await supabase.rpc('exec_sql', { 
      sql: `UPDATE estudantes 
        SET congregacao_id = (
          SELECT c.id 
          FROM congregacoes c 
          JOIN profiles p ON p.congregacao = c.nome 
          WHERE p.id = estudantes.user_id
        )
        WHERE congregacao_id IS NULL;`
    });

    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

executeMigration();