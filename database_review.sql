-- Revisão completa do banco de dados
-- Verificando estrutura e dados das tabelas principais

-- 1. Verificar tabelas existentes
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Estrutura da tabela estudantes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'estudantes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Contar estudantes por congregação
SELECT congregacao, COUNT(*) as total
FROM estudantes 
GROUP BY congregacao
ORDER BY total DESC;

-- 4. Verificar estudantes existentes
SELECT id, nome, congregacao, cargo, genero, ativo, user_id
FROM estudantes 
ORDER BY congregacao, nome
LIMIT 20;

-- 5. Estrutura da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar profiles existentes
SELECT id, nome_completo, email, role, congregacao
FROM profiles 
ORDER BY nome_completo
LIMIT 10;

-- 7. Verificar tabela congregacoes se existir
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'congregacoes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Dados da tabela congregacoes
SELECT * FROM congregacoes ORDER BY nome LIMIT 10;

-- 9. Verificar relacionamento entre profiles e estudantes
SELECT 
  p.nome_completo as instrutor,
  p.congregacao as congregacao_profile,
  COUNT(e.id) as estudantes_count,
  STRING_AGG(DISTINCT e.congregacao, ', ') as congregacoes_estudantes
FROM profiles p
LEFT JOIN estudantes e ON e.user_id = p.id
WHERE p.role = 'instrutor'
GROUP BY p.id, p.nome_completo, p.congregacao;

-- 10. Verificar inconsistências de congregação
SELECT DISTINCT 
  e.congregacao as estudante_congregacao,
  p.congregacao as profile_congregacao,
  COUNT(*) as count
FROM estudantes e
JOIN profiles p ON e.user_id = p.id
GROUP BY e.congregacao, p.congregacao
ORDER BY count DESC;