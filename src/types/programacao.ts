/**
 * Tipos para Programação da Reunião Vida e Ministério Cristão
 */

export type SecaoReuniao = 'ABERTURA' | 'TESOUROS' | 'MINISTERIO' | 'VIDA_CRISTA' | 'ENCERRAMENTO';

export type TipoParte = 
  | 'oracao_abertura'
  | 'comentarios_iniciais'
  | 'tesouros_palavra'
  | 'joias_espirituais'
  | 'leitura_biblica'
  | 'iniciando_conversas'
  | 'cultivando_interesse'
  | 'fazendo_discipulos'
  | 'explicando_crencas'
  | 'discurso'
  | 'video_consideracao'
  | 'estudo_biblico_congregacao'
  | 'necessidades_locais'
  | 'comentarios_finais'
  | 'oracao_encerramento';

export interface RestricoesParte {
  genero?: 'masculino' | 'feminino' | 'todos';
  requirAjudante?: boolean;
  cargoMinimo?: 'anciao' | 'servo_ministerial' | 'publicador_batizado';
  idadeMinima?: number;
}

export interface ParteProgramacao {
  id: string;
  numero: number;
  titulo: string;
  duracaoMin: number;
  tipo: TipoParte;
  secao: SecaoReuniao;
  descricao?: string;
  referencias?: string[];
  materialApoio?: string;
  videoUrl?: string;
  restricoes: RestricoesParte;
}

export interface ProgramacaoSemanal {
  id?: string;
  semana: string; // "13-19 de outubro"
  dataInicio: string; // ISO date
  dataFim: string; // ISO date
  mesAno: string; // "Outubro 2025"
  leituraBiblica: string; // "ECLESIASTES 7-8"
  canticos: {
    abertura: number;
    meio: number;
    encerramento: number;
  };
  partes: ParteProgramacao[];
  metadata?: {
    totalPartes: number;
    tempoTotalMinutos: number;
    fonteDados: 'jw.org' | 'manual';
    dataImportacao?: string;
  };
}

export interface ResultadoParser {
  sucesso: boolean;
  programacao?: ProgramacaoSemanal;
  erros?: string[];
  avisos?: string[];
}
