const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  console.log('🚀 Executando migração...');
  
  const migrationSQL = `
-- Criar tabela congregacoes
CREATE TABLE IF NOT EXISTS congregacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  pais VARCHAR(100) NOT NULL DEFAULT 'Brasil',
  cidade VARCHAR(100),
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campo congregacao_id à tabela estudantes
ALTER TABLE estudantes 
ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES congregacoes(id);

-- Inserir congregações existentes
INSERT INTO congregacoes (nome, pais, cidade) VALUES 
('Market Harborough', 'Reino Unido', 'Market Harborough'),
('compensa', 'Brasil', 'Manaus')
ON CONFLICT (nome) DO NOTHING;

-- Atualizar estudantes com congregacao_id baseado no profile do instrutor
UPDATE estudantes 
SET congregacao_id = (
  SELECT c.id 
  FROM congregacoes c 
  JOIN profiles p ON p.congregacao = c.nome 
  WHERE p.id = estudantes.user_id
)
WHERE congregacao_id IS NULL;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_estudantes_congregacao_id ON estudantes(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_congregacoes_nome ON congregacoes(nome);

-- RLS para congregacoes
ALTER TABLE congregacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view congregacoes" ON congregacoes
FOR SELECT USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_congregacoes_updated_at 
BEFORE UPDATE ON congregacoes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    // Execute each statement separately
    const statements = migrationSQL.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executando:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' });
        if (error) {
          console.error('Erro:', error);
        }
      }
    }
    
    console.log('✅ Migração concluída!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

executeMigration();