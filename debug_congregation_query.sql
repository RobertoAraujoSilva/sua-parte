-- Quick fix for congregation query issues
-- This script helps debug and fix the 400 error when querying students by congregation

-- Check if estudantes table exists and has the right structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'estudantes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check congregation values in the table
SELECT DISTINCT congregacao, COUNT(*) as student_count
FROM estudantes 
GROUP BY congregacao
ORDER BY congregacao;

-- Check for any students with congregation containing 'Market'
SELECT id, nome, congregacao
FROM estudantes 
WHERE congregacao ILIKE '%Market%'
LIMIT 10;

-- Alternative query approach for congregation with spaces
SELECT id, nome, congregacao
FROM estudantes 
WHERE congregacao = 'Market Harborough'
LIMIT 10;