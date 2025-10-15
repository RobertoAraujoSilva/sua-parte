/**
 * Parser de Conteúdo JW.org para Programação da Reunião
 * Converte texto copiado do site JW.org em JSON estruturado
 * Aplica automaticamente regras S-38-T para designações
 */

import type { ProgramacaoSemanal, ParteProgramacao, TipoParte, SecaoReuniao, RestricoesParte, ResultadoParser } from '../types/programacao';

// Mapeamento de tipos de parte para conformidade S-38-T
const TIPO_PARTE_MAPPING: Record<string, { tipo: TipoParte; restricoes: RestricoesParte }> = {
  // Tesouros da Palavra de Deus
  'tesouros': {
    tipo: 'tesouros_palavra',
    restricoes: { genero: 'masculino', cargoMinimo: 'anciao' }
  },
  'joias espirituais': {
    tipo: 'joias_espirituais',
    restricoes: { genero: 'masculino', cargoMinimo: 'anciao' }
  },
  'leitura da bíblia': {
    tipo: 'leitura_biblica',
    restricoes: { genero: 'masculino' }
  },
  
  // Faça seu Melhor no Ministério
  'iniciando conversas': {
    tipo: 'iniciando_conversas',
    restricoes: { genero: 'todos', requirAjudante: true }
  },
  'primeira conversa': {
    tipo: 'iniciando_conversas',
    restricoes: { genero: 'todos', requirAjudante: true }
  },
  'cultivando o interesse': {
    tipo: 'cultivando_interesse',
    restricoes: { genero: 'todos', requirAjudante: true }
  },
  'primeira revisita': {
    tipo: 'cultivando_interesse',
    restricoes: { genero: 'todos', requirAjudante: true }
  },
  'revisita': {
    tipo: 'cultivando_interesse',
    restricoes: { genero: 'todos', requirAjudante: true }
  },
  'fazendo discípulos': {
    tipo: 'fazendo_discipulos',
    restricoes: { genero: 'todos', requirAjudante: true }
  },
  'estudo bíblico': {
    tipo: 'fazendo_discipulos',
    restricoes: { genero: 'todos', requirAjudante: true }
  },
  'explicando suas crenças': {
    tipo: 'explicando_crencas',
    restricoes: { genero: 'todos', requirAjudante: true }
  },
  'demonstração': {
    tipo: 'explicando_crencas',
    restricoes: { genero: 'todos', requirAjudante: true }
  },
  'discurso': {
    tipo: 'discurso',
    restricoes: { genero: 'masculino', cargoMinimo: 'anciao' }
  },
  
  // Nossa Vida Cristã
  'necessidades locais': {
    tipo: 'necessidades_locais',
    restricoes: { genero: 'masculino', cargoMinimo: 'anciao' }
  },
  'estudo bíblico de congregação': {
    tipo: 'estudo_biblico_congregacao',
    restricoes: { genero: 'masculino', cargoMinimo: 'anciao' }
  },
  'consideração': {
    tipo: 'video_consideracao',
    restricoes: { genero: 'masculino', cargoMinimo: 'anciao' }
  }
};

/**
 * Extrai a semana do texto (ex: "13-19 de outubro")
 */
function extrairSemana(texto: string): { semana: string; dataInicio: string; dataFim: string; mesAno: string } | null {
  const regexSemana = /(\d{1,2})[–-](\d{1,2}) de (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i;
  const match = texto.match(regexSemana);
  
  if (!match) return null;
  
  const [, diaInicio, diaFim, mes] = match;
  const semana = `${diaInicio}-${diaFim} de ${mes.toLowerCase()}`;
  
  // Extrair ano (buscar por "2025" ou similar)
  const anoMatch = texto.match(/20\d{2}/);
  const ano = anoMatch ? anoMatch[0] : new Date().getFullYear().toString();
  
  // Mapear mês para número
  const meses: Record<string, number> = {
    'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4,
    'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8,
    'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
  };
  
  const mesNum = meses[mes.toLowerCase()];
  const dataInicio = `${ano}-${String(mesNum).padStart(2, '0')}-${String(diaInicio).padStart(2, '0')}`;
  const dataFim = `${ano}-${String(mesNum).padStart(2, '0')}-${String(diaFim).padStart(2, '0')}`;
  const mesAno = `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${ano}`;
  
  return { semana, dataInicio, dataFim, mesAno };
}

/**
 * Extrai cânticos do texto
 */
function extrairCanticos(texto: string): { abertura: number; meio: number; encerramento: number } | null {
  const regexCantico = /cântico[s]?:?\s*(\d+)(?:,?\s*(\d+))?(?:,?\s*(\d+))?/gi;
  const matches = [...texto.matchAll(regexCantico)];
  
  if (matches.length === 0) return null;
  
  // Primeiro cântico mencionado é abertura, meio e encerramento
  const canticos = matches.flatMap(m => [m[1], m[2], m[3]].filter(Boolean).map(Number));
  
  return {
    abertura: canticos[0] || 0,
    meio: canticos[1] || 0,
    encerramento: canticos[2] || 0
  };
}

/**
 * Extrai leitura bíblica do texto
 */
function extrairLeituraBiblica(texto: string): string {
  const regex = /LEITURA DA BÍBLIA:?\s*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s\d:-]+)/i;
  const match = texto.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Identifica a seção de uma parte
 */
function identificarSecao(contexto: string): SecaoReuniao {
  const upper = contexto.toUpperCase();
  
  if (upper.includes('TESOUROS DA PALAVRA')) return 'TESOUROS';
  if (upper.includes('FAÇA SEU MELHOR') || upper.includes('MINISTÉRIO')) return 'MINISTERIO';
  if (upper.includes('NOSSA VIDA CRISTÃ') || upper.includes('VIDA CRISTÃ')) return 'VIDA_CRISTA';
  
  return 'TESOUROS'; // default
}

/**
 * Mapeia título de parte para tipo
 */
function mapearTipoParte(titulo: string): { tipo: TipoParte; restricoes: RestricoesParte } {
  const tituloLower = titulo.toLowerCase();
  
  // Buscar correspondência exata
  for (const [chave, valor] of Object.entries(TIPO_PARTE_MAPPING)) {
    if (tituloLower.includes(chave)) {
      return valor;
    }
  }
  
  // Default para demonstração (mais comum)
  return {
    tipo: 'iniciando_conversas',
    restricoes: { genero: 'todos', requirAjudante: true }
  };
}

/**
 * Extrai referências bíblicas e materiais de apoio
 */
function extrairReferencias(texto: string): { referencias: string[]; materialApoio?: string } {
  const referencias: string[] = [];
  let materialApoio: string | undefined;
  
  // Extrair referências entre parênteses
  const regexRef = /\(([^)]+)\)/g;
  const matches = [...texto.matchAll(regexRef)];
  
  matches.forEach(match => {
    const conteudo = match[1].trim();
    
    // Verificar se é referência bíblica ou material
    if (conteudo.match(/^[A-Z][a-z]+\.?\s*\d+/)) {
      referencias.push(conteudo);
    } else if (conteudo.includes('lmd') || conteudo.includes('lff') || conteudo.includes('th')) {
      materialApoio = conteudo;
    }
  });
  
  return { referencias, materialApoio };
}

/**
 * Extrai partes individuais do texto
 */
function extrairPartes(texto: string): ParteProgramacao[] {
  const partes: ParteProgramacao[] = [];
  const linhas = texto.split('\n');
  
  let secaoAtual: SecaoReuniao = 'TESOUROS';
  let numeroParteSequencial = 1;
  
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    
    // Atualizar seção atual
    if (linha.includes('TESOUROS DA PALAVRA')) {
      secaoAtual = 'TESOUROS';
      continue;
    }
    if (linha.includes('FAÇA SEU MELHOR') || linha.includes('MINISTÉRIO')) {
      secaoAtual = 'MINISTERIO';
      continue;
    }
    if (linha.includes('NOSSA VIDA CRISTÃ')) {
      secaoAtual = 'VIDA_CRISTA';
      continue;
    }
    
    // Buscar partes numeradas com duração
    const regexParte = /^(\d+)\.\s*(.+?)\s*\((\d+)\s*min/i;
    const match = linha.match(regexParte);
    
    if (match) {
      const [, numero, tituloCompleto, duracao] = match;
      
      // Limpar título (remover conteúdo após parênteses)
      const titulo = tituloCompleto.split('(')[0].trim();
      
      // Buscar descrição (próxima linha sem número)
      let descricao = '';
      if (i + 1 < linhas.length && !linhas[i + 1].match(/^\d+\./)) {
        descricao = linhas[i + 1].trim();
      }
      
      // Mapear tipo e restrições
      const { tipo, restricoes } = mapearTipoParte(titulo);
      
      // Extrair referências
      const { referencias, materialApoio } = extrairReferencias(linha);
      
      partes.push({
        id: `parte-${numeroParteSequencial}`,
        numero: parseInt(numero),
        titulo,
        duracaoMin: parseInt(duracao),
        tipo,
        secao: secaoAtual,
        descricao: descricao || undefined,
        referencias: referencias.length > 0 ? referencias : undefined,
        materialApoio,
        restricoes
      });
      
      numeroParteSequencial++;
    }
  }
  
  return partes;
}

/**
 * Parser principal
 */
export function parseJWOrgContent(textoJWOrg: string): ResultadoParser {
  const erros: string[] = [];
  const avisos: string[] = [];
  
  try {
    // 1. Extrair informações da semana
    const infoSemana = extrairSemana(textoJWOrg);
    if (!infoSemana) {
      erros.push('Não foi possível identificar a semana no texto');
      return { sucesso: false, erros };
    }
    
    // 2. Extrair cânticos
    const canticos = extrairCanticos(textoJWOrg);
    if (!canticos) {
      avisos.push('Não foi possível identificar os cânticos. Use valores padrão.');
    }
    
    // 3. Extrair leitura bíblica
    const leituraBiblica = extrairLeituraBiblica(textoJWOrg);
    if (!leituraBiblica) {
      avisos.push('Não foi possível identificar a leitura bíblica');
    }
    
    // 4. Extrair partes
    const partes = extrairPartes(textoJWOrg);
    if (partes.length === 0) {
      erros.push('Nenhuma parte da reunião foi identificada');
      return { sucesso: false, erros };
    }
    
    // 5. Calcular metadata
    const tempoTotal = partes.reduce((sum, p) => sum + p.duracaoMin, 0);
    
    // 6. Construir programação
    const programacao: ProgramacaoSemanal = {
      semana: infoSemana.semana,
      dataInicio: infoSemana.dataInicio,
      dataFim: infoSemana.dataFim,
      mesAno: infoSemana.mesAno,
      leituraBiblica,
      canticos: canticos || { abertura: 0, meio: 0, encerramento: 0 },
      partes,
      metadata: {
        totalPartes: partes.length,
        tempoTotalMinutos: tempoTotal,
        fonteDados: 'jw.org',
        dataImportacao: new Date().toISOString()
      }
    };
    
    return {
      sucesso: true,
      programacao,
      avisos: avisos.length > 0 ? avisos : undefined
    };
    
  } catch (error) {
    erros.push(error instanceof Error ? error.message : 'Erro desconhecido ao processar texto');
    return { sucesso: false, erros };
  }
}

/**
 * Valida programação parseada
 */
export function validarProgramacao(programacao: ProgramacaoSemanal): { valido: boolean; erros: string[] } {
  const erros: string[] = [];
  
  // Validar campos obrigatórios
  if (!programacao.semana) erros.push('Semana não definida');
  if (!programacao.dataInicio) erros.push('Data de início não definida');
  if (!programacao.dataFim) erros.push('Data de fim não definida');
  if (!programacao.partes || programacao.partes.length === 0) {
    erros.push('Nenhuma parte definida');
  }
  
  // Validar partes
  programacao.partes.forEach((parte, index) => {
    if (!parte.titulo) erros.push(`Parte ${index + 1}: Título vazio`);
    if (!parte.duracaoMin || parte.duracaoMin <= 0) {
      erros.push(`Parte ${index + 1}: Duração inválida`);
    }
    if (!parte.tipo) erros.push(`Parte ${index + 1}: Tipo não definido`);
  });
  
  return {
    valido: erros.length === 0,
    erros
  };
}
