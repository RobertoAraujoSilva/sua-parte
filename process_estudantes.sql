-- Script para processar dados dos estudantes no Supabase
-- Use este script após converter o Excel para JSON

-- =====================================================
-- PASSO 1: Verificar dados atuais
-- =====================================================

-- Verificar total de estudantes existentes
SELECT 
    COUNT(*) as total_estudantes,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
FROM estudantes;

-- Verificar alguns registros existentes
SELECT 
    id, 
    nome, 
    cargo, 
    ativo, 
    created_at
FROM estudantes 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- PASSO 2: Processar dados do Excel (substitua o JSON)
-- =====================================================

-- EXEMPLO: Processar dados em lote
-- Substitua o JSON abaixo pelos dados reais do seu arquivo
SELECT process_estudantes_batch(
    '[
        {
            "id": "exemplo-uuid-1",
            "nome": "Nome Exemplo 1",
            "sobrenome": "Sobrenome 1",
            "idade": 25,
            "genero": "masculino",
            "email": "exemplo1@email.com",
            "telefone": "(11) 11111-1111",
            "cargo": "estudante_novo",
            "ativo": true
        }
    ]'::JSONB
);

-- =====================================================
-- PASSO 3: Verificar resultados do processamento
-- =====================================================

-- Verificar total após processamento
SELECT 
    COUNT(*) as total_estudantes,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
FROM estudantes;

-- Verificar registros mais recentes
SELECT 
    id, 
    nome, 
    sobrenome,
    cargo, 
    ativo, 
    created_at,
    updated_at
FROM estudantes 
ORDER BY created_at DESC 
LIMIT 10;

-- =====================================================
-- PASSO 4: Limpeza e manutenção (opcional)
-- =====================================================

-- Remover registros duplicados (se necessário)
-- DELETE FROM estudantes WHERE id IN (
--     SELECT id FROM (
--         SELECT id, ROW_NUMBER() OVER (PARTITION BY nome, email ORDER BY created_at) as rn
--         FROM estudantes
--     ) t WHERE t.rn > 1
-- );

-- Verificar campos vazios ou inválidos
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN nome IS NULL OR nome = '' THEN 1 END) as sem_nome,
    COUNT(CASE WHEN email IS NULL OR email = '' THEN 1 END) as sem_email,
    COUNT(CASE WHEN telefone IS NULL OR telefone = '' THEN 1 END) as sem_telefone
FROM estudantes;

-- =====================================================
-- PASSO 5: Estatísticas finais
-- =====================================================

-- Estatísticas por cargo
SELECT 
    cargo,
    COUNT(*) as total,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos
FROM estudantes 
GROUP BY cargo 
ORDER BY total DESC;

-- Estatísticas por gênero
SELECT 
    genero,
    COUNT(*) as total,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos
FROM estudantes 
GROUP BY genero 
ORDER BY total DESC;

-- Estatísticas por faixa etária
SELECT 
    CASE 
        WHEN idade < 18 THEN 'Menor de 18'
        WHEN idade BETWEEN 18 AND 25 THEN '18-25 anos'
        WHEN idade BETWEEN 26 AND 35 THEN '26-35 anos'
        WHEN idade BETWEEN 36 AND 50 THEN '36-50 anos'
        WHEN idade > 50 THEN 'Acima de 50'
        ELSE 'Idade não informada'
    END as faixa_etaria,
    COUNT(*) as total
FROM estudantes 
GROUP BY 
    CASE 
        WHEN idade < 18 THEN 'Menor de 18'
        WHEN idade BETWEEN 18 AND 25 THEN '18-25 anos'
        WHEN idade BETWEEN 26 AND 35 THEN '26-35 anos'
        WHEN idade BETWEEN 36 AND 50 THEN '36-50 anos'
        WHEN idade > 50 THEN 'Acima de 50'
        ELSE 'Idade não informada'
    END
ORDER BY total DESC;
