import fs from 'fs';

// Ler o arquivo JSON
const studentsData = JSON.parse(fs.readFileSync('estudantes_refinados_converted.json', 'utf8'));

console.log(`📊 Total de estudantes no arquivo: ${studentsData.length}`);

// Executar todos os estudantes de uma vez
const jsonString = JSON.stringify(studentsData);
console.log(`📦 Executando restauração de ${studentsData.length} estudantes...`);

// Gerar comando SQL
console.log(`\\n-- Comando SQL para restaurar todos os estudantes:`);
console.log(`SELECT process_estudantes_batch('${jsonString}'::JSONB);`);

console.log('\\n✅ Comando SQL gerado!');
console.log('💡 Execute este comando no Supabase para restaurar todos os estudantes.');
