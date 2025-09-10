// scripts/extrai_mwb.js
// Script para extração automática dos PDFs MWB e geração de JSONs estruturados

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfDir = path.resolve(__dirname, '../docs/Oficial');
const outputDir = pdfDir; // Salva os JSONs na mesma pasta

function getPdfFiles(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));
}

function parseProgramacao(text) {
  // Parser inicial: separa blocos por datas (ex: "6–12 de janeiro") e tenta identificar partes principais
  // Ajuste conforme o padrão real do texto extraído do PDF MWB
  const semanas = {};
  // Regex para datas no formato "6–12 de janeiro" ou "13–19 de janeiro"
  const semanaRegex = /(\d{1,2}–\d{1,2} de [a-zç]+)([\s\S]*?)(?=\d{1,2}–\d{1,2} de [a-zç]+|$)/gi;
  let match;
  while ((match = semanaRegex.exec(text)) !== null) {
    const dataBruta = match[1].trim();
    const bloco = match[2].trim();
    // Extrai partes principais (exemplo simplificado)
    const partes = bloco.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    semanas[dataBruta] = { partes };
  }
  return semanas;
}

async function processPdf(file) {
  const filePath = path.join(pdfDir, file);
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  const programacao = parseProgramacao(data.text);
  const jsonFile = file.replace(/\.pdf$/i, '.json');
  fs.writeFileSync(path.join(outputDir, jsonFile), JSON.stringify(programacao, null, 2));
  console.log(`Extraído: ${jsonFile}`);
}

async function main() {
  const pdfs = getPdfFiles(pdfDir);
  for (const pdfFile of pdfs) {
    await processPdf(pdfFile);
  }
  console.log('Extração concluída.');
}

main();
