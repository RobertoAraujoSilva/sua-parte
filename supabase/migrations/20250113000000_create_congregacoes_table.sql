-- Criar tabela de congregações e adicionar campo congregacao_id aos estudantes
-- Migration: 20250113000000_create_congregacoes_table.sql

-- 1. Criar tabela congregacoes
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

-- 2. Adicionar campo congregacao_id à tabela estudantes
ALTER TABLE estudantes 
ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES congregacoes(id);

-- 3. Inserir congregações existentes
INSERT INTO congregacoes (nome, pais, cidade) VALUES 
('Market Harborough', 'Reino Unido', 'Market Harborough'),
('compensa', 'Brasil', 'Manaus')
ON CONFLICT (nome) DO NOTHING;

-- 4. Atualizar estudantes com congregacao_id baseado no profile do instrutor
UPDATE estudantes 
SET congregacao_id = (
  SELECT c.id 
  FROM congregacoes c 
  JOIN profiles p ON p.congregacao = c.nome 
  WHERE p.id = estudantes.user_id
)
WHERE congregacao_id IS NULL;

-- 5. Criar índices
CREATE INDEX IF NOT EXISTS idx_estudantes_congregacao_id ON estudantes(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_congregacoes_nome ON congregacoes(nome);

-- 6. RLS para congregacoes
ALTER TABLE congregacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view congregacoes" ON congregacoes
FOR SELECT USING (true);

CREATE POLICY "Instructors can manage their congregation" ON congregacoes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'instrutor'
    AND profiles.congregacao = congregacoes.nome
  )
);

-- 7. Trigger para updated_at
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