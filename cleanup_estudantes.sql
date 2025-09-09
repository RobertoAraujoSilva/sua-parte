-- Script de limpeza para a tabela estudantes (OPCIONAL)
-- ⚠️ ATENÇÃO: Este script remove TODOS os dados existentes!
-- Use apenas se quiser começar do zero

-- =====================================================
-- AVISO IMPORTANTE
-- =====================================================
-- Este script irá:
-- 1. Remover TODOS os registros da tabela estudantes
-- 2. Resetar os contadores de ID
-- 3. Limpar dados relacionados (se houver)
-- 
-- ⚠️ FAÇA BACKUP ANTES DE EXECUTAR!
-- ⚠️ EXECUTE APENAS SE TIVER CERTEZA!

-- =====================================================
-- PASSO 1: Verificar dependências
-- =====================================================

-- Verificar tabelas que referenciam estudantes
SELECT 
    tc.table_name,
    kcu.column_name,
    COUNT(*) as total_references
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND kcu.referenced_table_name = 'estudantes'
GROUP BY tc.table_name, kcu.column_name;

-- =====================================================
-- PASSO 2: Backup dos dados atuais (RECOMENDADO)
-- =====================================================

-- Criar backup da tabela atual
CREATE TABLE IF NOT EXISTS estudantes_backup AS 
SELECT * FROM estudantes;

-- Verificar backup criado
SELECT COUNT(*) as total_backup FROM estudantes_backup;

-- =====================================================
-- PASSO 3: Limpeza (EXECUTE COM CUIDADO!)
-- =====================================================

-- Opção 1: Limpeza simples (mantém estrutura)
-- DELETE FROM estudantes;

-- Opção 2: Limpeza completa (reset de IDs)
-- TRUNCATE TABLE estudantes RESTART IDENTITY CASCADE;

-- Opção 3: Limpeza seletiva (apenas registros específicos)
-- DELETE FROM estudantes WHERE nome LIKE '%teste%';

-- =====================================================
-- PASSO 4: Verificar limpeza
-- =====================================================

-- Verificar se a tabela está vazia
SELECT COUNT(*) as total_estudantes FROM estudantes;

-- Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'estudantes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- PASSO 5: Restauração (se necessário)
-- =====================================================

-- Para restaurar dados do backup:
-- INSERT INTO estudantes SELECT * FROM estudantes_backup;

-- Para remover backup:
-- DROP TABLE estudantes_backup;

-- =====================================================
-- PASSO 6: Preparar para novos dados
-- =====================================================

-- Verificar se as funções ainda funcionam
SELECT upsert_estudante_data(
    gen_random_uuid(),
    'Estudante Teste',
    NULL,
    'Teste',
    25,
    'masculino'::app_genero,
    'teste@exemplo.com',
    '(11) 99999-9999',
    NULL,
    'estudante_novo',
    'estudante_novo'::app_cargo,
    NULL,
    true,
    'Estudante de teste após limpeza',
    'solteiro'::estado_civil,
    NULL,
    NULL,
    NULL,
    NULL,
    false,
    false,
    NULL,
    NULL,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    NULL
);

-- Verificar se foi inserido
SELECT COUNT(*) as total_estudantes FROM estudantes;
