import fs from 'fs';

// Ler o arquivo JSON
const studentsData = JSON.parse(fs.readFileSync('estudantes_refinados_converted.json', 'utf8'));

console.log(`📊 Total de estudantes no arquivo: ${studentsData.length}`);

// Dividir em lotes de 10 para evitar problemas de tamanho
const batchSize = 10;
const batches = [];

for (let i = 0; i < studentsData.length; i += batchSize) {
  batches.push(studentsData.slice(i, i + batchSize));
}

console.log(`📦 Número de lotes: ${batches.length}`);

// Executar cada lote
let totalProcessed = 0;
let totalErrors = 0;

for (let i = 0; i < batches.length; i++) {
  const batch = batches[i];
  const jsonString = JSON.stringify(batch);
  
  console.log(`\n🔄 Executando lote ${i + 1}/${batches.length} (${batch.length} estudantes)...`);
  
  // Aqui você executaria o comando SQL
  console.log(`SELECT process_estudantes_batch('${jsonString}'::JSONB);`);
  
  totalProcessed += batch.length;
}

console.log(`\n✅ Processamento concluído!`);
console.log(`📊 Total de estudantes processados: ${totalProcessed}`);
console.log(`💡 Execute os comandos SQL acima no Supabase para restaurar todos os estudantes.`);
