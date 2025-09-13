import fs from 'fs';

// Ler o arquivo JSON
const studentsData = JSON.parse(fs.readFileSync('estudantes_refinados_converted.json', 'utf8'));

// Dividir em lotes de 20 estudantes
const batchSize = 20;
const batches = [];

for (let i = 0; i < studentsData.length; i += batchSize) {
  batches.push(studentsData.slice(i, i + batchSize));
}

console.log(`📊 Total de estudantes: ${studentsData.length}`);
console.log(`📦 Número de lotes: ${batches.length}`);
console.log(`📋 Tamanho de cada lote: ${batchSize}`);

// Gerar comandos SQL para cada lote
batches.forEach((batch, index) => {
  const jsonString = JSON.stringify(batch);
  console.log(`\n-- Lote ${index + 1}/${batches.length}`);
  console.log(`SELECT process_estudantes_batch('${jsonString}'::JSONB);`);
});

console.log('\n✅ Comandos SQL gerados!');
console.log('💡 Execute cada comando no Supabase para restaurar os estudantes.');
