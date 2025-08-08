import { Database } from "@/integrations/supabase/types";
import type { EstudanteRow } from "./estudantes";

// Database types
export type DesignacaoRow = Database["public"]["Tables"]["designacoes"]["Row"];
export type DesignacaoInsert = Database["public"]["Tables"]["designacoes"]["Insert"];
export type DesignacaoUpdate = Database["public"]["Tables"]["designacoes"]["Update"];
export type ProgramaRow = Database["public"]["Tables"]["programas"]["Row"];
export type ProgramaInsert = Database["public"]["Tables"]["programas"]["Insert"];
export type ProgramaUpdate = Database["public"]["Tables"]["programas"]["Update"];

// Tipos específicos para o sistema de designações S-38-T
export type TipoParteS38T = 'leitura_biblica' | 'discurso' | 'demonstracao';
export type StatusDesignacao = 'pendente' | 'gerada' | 'enviada' | 'confirmada';

// Interface para parte do programa seguindo S-38-T
export interface ParteProgramaS38T {
  numero_parte: number;
  titulo_parte: string;
  tipo_parte: TipoParteS38T;
  tempo_minutos: number;
  cena?: string;
  requer_ajudante: boolean;
  restricao_genero?: 'masculino' | 'feminino';
}

// Interface para designação gerada
export interface DesignacaoGerada {
  id_estudante: string;
  id_ajudante?: string;
  numero_parte: number;
  titulo_parte: string;
  tipo_parte: string;
  cena?: string;
  tempo_minutos: number;
  data_inicio_semana: string;
  confirmado: boolean;
}

// Interface para designação com dados dos estudantes
export interface DesignacaoComEstudantes extends DesignacaoRow {
  estudante?: EstudanteRow;
  ajudante?: EstudanteRow;
  programa?: ProgramaRow;
}

// Interface para opções de geração
export interface OpcoesDegeracao {
  data_inicio_semana: string;
  id_programa: string;
  partes: ParteProgramaS38T[];
  excluir_estudante_ids?: string[];
  preferir_pares_familiares?: boolean;
}

// Interface para resultado da geração
export interface ResultadoGeracao {
  sucesso: boolean;
  designacoes: DesignacaoGerada[];
  erros: string[];
  avisos: string[];
  estatisticas: EstatisticasDesignacao;
}

// Interface para estatísticas de designação
export interface EstatisticasDesignacao {
  totalDesignacoes: number;
  distribuicaoPorGenero: {
    masculino: number;
    feminino: number;
  };
  distribuicaoPorCargo: Record<string, number>;
  estudantesComAjudante: number;
  paresFormados: number;
  paresFamiliares: number;
}

// Interface para prévia de designações
export interface PreviaDesignacao {
  designacoes: DesignacaoGerada[];
  estatisticas: EstatisticasDesignacao;
  conflitos: ConflitosDesignacao[];
  recomendacoes: string[];
}

// Interface para conflitos detectados
export interface ConflitosDesignacao {
  tipo: 'sobrecarga' | 'inelegibilidade' | 'pareamento_invalido' | 'falta_ajudante';
  estudante_id: string;
  numero_parte: number;
  descricao: string;
  sugestao?: string;
}

// Interface para histórico de designações
export interface HistoricoDesignacao {
  estudante_id: string;
  designacoes_recentes: {
    data_inicio_semana: string;
    numero_parte: number;
    tipo_parte: string;
    foi_ajudante: boolean;
  }[];
  total_designacoes_8_semanas: number;
  ultima_designacao?: string;
}

// Interface para validação S-38-T
export interface ValidacaoS38T {
  valida: boolean;
  violacoes: {
    regra: string;
    descricao: string;
    estudante_id?: string;
    numero_parte?: number;
  }[];
}

// Constantes para regras S-38-T
export const REGRAS_S38T = {
  PARTE_3_APENAS_HOMENS: 'Parte 3 (Leitura da Bíblia) - apenas homens',
  DISCURSOS_HOMENS_QUALIFICADOS: 'Discursos (partes 4-7) - apenas homens qualificados',
  DEMONSTRACOES_AMBOS_GENEROS: 'Demonstrações - ambos os gêneros',
  PARES_DIFERENTES_GENEROS_FAMILIARES: 'Pares de gêneros diferentes - apenas familiares',
  MENORES_MESMO_GENERO: 'Menores de idade - sempre mesmo gênero',
  BALANCEAMENTO_8_SEMANAS: 'Balanceamento baseado nas últimas 8 semanas',
  ESTUDANTES_ATIVOS_APENAS: 'Apenas estudantes ativos'
} as const;

// Tipos para cargos qualificados
export const CARGOS_QUALIFICADOS_DISCURSOS = [
  'anciao',
  'servo_ministerial', 
  'pioneiro_regular',
  'publicador_batizado'
] as const;

// Labels para tipos de parte
export const TIPO_PARTE_LABELS: Record<TipoParteS38T, string> = {
  leitura_biblica: 'Leitura da Bíblia',
  discurso: 'Discurso',
  demonstracao: 'Demonstração'
};

// Labels para status de designação
export const STATUS_DESIGNACAO_LABELS: Record<StatusDesignacao, string> = {
  pendente: 'Pendente',
  gerada: 'Gerada',
  enviada: 'Enviada',
  confirmada: 'Confirmada'
};

// Funções utilitárias
export const getTipoParteLabel = (tipo: TipoParteS38T): string => TIPO_PARTE_LABELS[tipo];
export const getStatusLabel = (status: StatusDesignacao): string => STATUS_DESIGNACAO_LABELS[status];

// Função para validar se um cargo pode dar discursos
export const podedarDiscursos = (cargo: string, genero: string): boolean => {
  return genero === 'masculino' && CARGOS_QUALIFICADOS_DISCURSOS.includes(cargo as any);
};

// Função para verificar se uma parte requer ajudante
export const requerAjudante = (tipo_parte: TipoParteS38T): boolean => {
  return tipo_parte === 'demonstracao';
};

// Função para calcular prioridade de designação
export const calcularPrioridadeEstudante = (
  totalDesignacoes8Semanas: number,
  ultimaDesignacao?: string
): number => {
  let prioridade = 100 - totalDesignacoes8Semanas * 10; // Menos designações = maior prioridade
  
  if (ultimaDesignacao) {
    const diasDesdeUltima = Math.floor(
      (Date.now() - new Date(ultimaDesignacao).getTime()) / (1000 * 60 * 60 * 24)
    );
    prioridade += Math.min(diasDesdeUltima, 56); // Máximo 8 semanas de bônus
  }
  
  return Math.max(0, prioridade);
};

// Interface para formulário de designação manual
export interface DesignacaoFormData {
  id_programa: string;
  id_estudante: string;
  id_ajudante?: string;
  numero_parte: number;
  tipo_parte: TipoParteS38T;
  cena?: string;
  tempo_minutos: number;
  observacoes?: string;
}

// Validação de formulário de designação
export const validarDesignacaoForm = (data: DesignacaoFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.id_programa) {
    errors.id_programa = 'Programa é obrigatório';
  }
  
  if (!data.id_estudante) {
    errors.id_estudante = 'Estudante é obrigatório';
  }
  
  if (!data.numero_parte || data.numero_parte < 3 || data.numero_parte > 7) {
    errors.numero_parte = 'Número da parte deve estar entre 3 e 7';
  }
  
  if (!data.tempo_minutos || data.tempo_minutos <= 0) {
    errors.tempo_minutos = 'Tempo deve ser maior que zero';
  }
  
  if (requerAjudante(data.tipo_parte) && !data.id_ajudante) {
    errors.id_ajudante = 'Ajudante é obrigatório para demonstrações';
  }
  
  return errors;
};
