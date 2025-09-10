-- Verificar usuários de teste no banco de dados
-- Execute este SQL no Supabase Dashboard

-- 1. Verificar usuários de auth cadastrados
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users 
WHERE email IN (
    'amazonwebber007@gmail.com',  -- Admin
    'frankwebber33@hotmail.com',  -- Instrutor
    'franklinmarceloferreiradelima@gmail.com',  -- Estudante/Franklin
    'franklima.flm@gmail.com'     -- Sarah
)
ORDER BY email;

-- 2. Verificar profiles correspondentes
SELECT 
    id,
    nome_completo,
    congregacao,
    cargo,
    role,
    created_at
FROM public.profiles 
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email IN (
        'amazonwebber007@gmail.com',
        'frankwebber33@hotmail.com',
        'franklinmarceloferreiradelima@gmail.com',
        'franklima.flm@gmail.com'
    )
)
ORDER BY role, nome_completo;

-- 3. Verificar se há dados de estudantes
SELECT 
    e.id,
    e.nome,
    e.cargo,
    e.genero,
    p.email,
    p.role
FROM public.estudantes e
JOIN public.profiles p ON e.user_id = p.id
WHERE p.id IN (
    SELECT id FROM auth.users 
    WHERE email IN (
        'amazonwebber007@gmail.com',
        'frankwebber33@hotmail.com',
        'franklinmarceloferreiradelima@gmail.com',
        'franklima.flm@gmail.com'
    )
)
ORDER BY p.email;

-- 4. Verificar programas criados por esses usuários
SELECT 
    prog.id,
    prog.data_inicio_semana,
    prog.mes_apostila,
    prog.status,
    p.email
FROM public.programas prog
JOIN public.profiles p ON prog.user_id = p.id
WHERE p.id IN (
    SELECT id FROM auth.users 
    WHERE email IN (
        'amazonwebber007@gmail.com',
        'frankwebber33@hotmail.com',
        'franklinmarceloferreiradelima@gmail.com',
        'franklima.flm@gmail.com'
    )
)
ORDER BY p.email, prog.data_inicio_semana DESC;

-- 5. Resumo dos usuários para testes
SELECT 
    'Test User Summary' as category,
    email,
    CASE 
        WHEN email = 'amazonwebber007@gmail.com' THEN 'ADMIN'
        WHEN email = 'frankwebber33@hotmail.com' THEN 'INSTRUCTOR' 
        WHEN email = 'franklinmarceloferreiradelima@gmail.com' THEN 'STUDENT'
        WHEN email = 'franklima.flm@gmail.com' THEN 'STUDENT (Sarah)'
        ELSE 'UNKNOWN'
    END as expected_role,
    COALESCE(p.role, 'NO_PROFILE') as actual_role,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMED'
        ELSE 'NOT_CONFIRMED'
    END as email_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE email IN (
    'amazonwebber007@gmail.com',
    'frankwebber33@hotmail.com', 
    'franklinmarceloferreiradelima@gmail.com',
    'franklima.flm@gmail.com'
)
ORDER BY email;
