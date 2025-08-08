/**
 * Funções de carregamento de dados base para o sistema de designações S-38-T
 * 
 * Este módulo contém funções para carregar estudantes ativos, histórico de designações
 * e relacionamentos familiares do Supabase com aplicação de RLS.
 */

import { supabase } from '@/integrations/supabase/client';
import type { EstudanteRow } from '@/types/estudantes';
import type { DesignacaoRow, ProgramaRow, HistoricoDesignacao } from '@/types/designacoes';
import type { FamilyMember } from '@/types/family';

/**
 * Carrega todos os estudantes ativos da congregação do usuário logado
 * Aplica filtro RLS automaticamente através do user_id
 */
export const carregarEstudantesAtivos = async (): Promise<{
  sucesso: boolean;
  estudantes: EstudanteRow[];
  erro?: string;
}> => {
  try {
    const { data: estudantes, error } = await supabase
      .from('estudantes')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('Erro ao carregar estudantes ativos:', error);
      return {
        sucesso: false,
        estudantes: [],
        erro: error.message
      };
    }

    return {
      sucesso: true,
      estudantes: estudantes || []
    };
  } catch (error) {
    console.error('Exceção ao carregar estudantes ativos:', error);
    return {
      sucesso: false,
      estudantes: [],
      erro: 'Erro interno do sistema'
    };
  }
};

/**
 * Carrega histórico de designações das últimas N semanas
 * Usado para balanceamento e evitar sobrecarga de estudantes
 */
export const carregarHistoricoDesignacoes = async (
  semanasAtras: number = 8
): Promise<{
  sucesso: boolean;
  historico: Map<string, HistoricoDesignacao>;
  erro?: string;
}> => {
  try {
    const dataCorte = new Date();
    dataCorte.setDate(dataCorte.getDate() - (semanasAtras * 7));

    // Buscar designações com dados do programa
    const { data: designacoes, error } = await supabase
      .from('designacoes')
      .select(`
        id_estudante,
        id_ajudante,
        numero_parte,
        tipo_parte,
        programas!inner(data_inicio_semana)
      `)
      .gte('programas.data_inicio_semana', dataCorte.toISOString().split('T')[0])
      .order('programas.data_inicio_semana', { ascending: false });

    if (error) {
      console.error('Erro ao carregar histórico de designações:', error);
      return {
        sucesso: false,
        historico: new Map(),
        erro: error.message
      };
    }

    // Processar dados em mapa de histórico
    const historicoMap = new Map<string, HistoricoDesignacao>();

    designacoes?.forEach((designacao: any) => {
      const dataPrograma = designacao.programas.data_inicio_semana;
      
      // Processar estudante principal
      if (!historicoMap.has(designacao.id_estudante)) {
        historicoMap.set(designacao.id_estudante, {
          estudante_id: designacao.id_estudante,
          designacoes_recentes: [],
          total_designacoes_8_semanas: 0
        });
      }
      
      const historicoEstudante = historicoMap.get(designacao.id_estudante)!;
      historicoEstudante.designacoes_recentes.push({
        data_inicio_semana: dataPrograma,
        numero_parte: designacao.numero_parte,
        tipo_parte: designacao.tipo_parte,
        foi_ajudante: false
      });
      historicoEstudante.total_designacoes_8_semanas++;
      
      if (!historicoEstudante.ultima_designacao || dataPrograma > historicoEstudante.ultima_designacao) {
        historicoEstudante.ultima_designacao = dataPrograma;
      }

      // Processar ajudante se existir
      if (designacao.id_ajudante) {
        if (!historicoMap.has(designacao.id_ajudante)) {
          historicoMap.set(designacao.id_ajudante, {
            estudante_id: designacao.id_ajudante,
            designacoes_recentes: [],
            total_designacoes_8_semanas: 0
          });
        }
        
        const historicoAjudante = historicoMap.get(designacao.id_ajudante)!;
        historicoAjudante.designacoes_recentes.push({
          data_inicio_semana: dataPrograma,
          numero_parte: designacao.numero_parte,
          tipo_parte: designacao.tipo_parte,
          foi_ajudante: true
        });
        historicoAjudante.total_designacoes_8_semanas++;
        
        if (!historicoAjudante.ultima_designacao || dataPrograma > historicoAjudante.ultima_designacao) {
          historicoAjudante.ultima_designacao = dataPrograma;
        }
      }
    });

    return {
      sucesso: true,
      historico: historicoMap
    };
  } catch (error) {
    console.error('Exceção ao carregar histórico de designações:', error);
    return {
      sucesso: false,
      historico: new Map(),
      erro: 'Erro interno do sistema'
    };
  }
};

/**
 * Carrega relacionamentos familiares para validação de pares
 * Usado para verificar se estudantes de gêneros diferentes podem formar pares
 */
export const carregarRelacionamentosFamiliares = async (): Promise<{
  sucesso: boolean;
  relacionamentos: Map<string, FamilyMember[]>;
  erro?: string;
}> => {
  try {
    const { data: familyMembers, error } = await supabase
      .from('family_members')
      .select('*')
      .order('student_id');

    if (error) {
      console.error('Erro ao carregar relacionamentos familiares:', error);
      return {
        sucesso: false,
        relacionamentos: new Map(),
        erro: error.message
      };
    }

    // Organizar relacionamentos por student_id
    const relacionamentosMap = new Map<string, FamilyMember[]>();
    
    familyMembers?.forEach(member => {
      if (!relacionamentosMap.has(member.student_id)) {
        relacionamentosMap.set(member.student_id, []);
      }
      relacionamentosMap.get(member.student_id)!.push(member);
    });

    return {
      sucesso: true,
      relacionamentos: relacionamentosMap
    };
  } catch (error) {
    console.error('Exceção ao carregar relacionamentos familiares:', error);
    return {
      sucesso: false,
      relacionamentos: new Map(),
      erro: 'Erro interno do sistema'
    };
  }
};

/**
 * Carrega programa específico por data de início da semana
 */
export const carregarProgramaPorData = async (
  dataInicioSemana: string
): Promise<{
  sucesso: boolean;
  programa?: ProgramaRow;
  erro?: string;
}> => {
  try {
    const { data: programa, error } = await supabase
      .from('programas')
      .select('*')
      .eq('data_inicio_semana', dataInicioSemana)
      .single();

    if (error) {
      console.error('Erro ao carregar programa:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }

    return {
      sucesso: true,
      programa
    };
  } catch (error) {
    console.error('Exceção ao carregar programa:', error);
    return {
      sucesso: false,
      erro: 'Erro interno do sistema'
    };
  }
};

/**
 * Verifica se já existem designações para uma semana específica
 */
export const verificarDesignacoesExistentes = async (
  idPrograma: string
): Promise<{
  sucesso: boolean;
  existem: boolean;
  quantidade: number;
  erro?: string;
}> => {
  try {
    const { data: designacoes, error, count } = await supabase
      .from('designacoes')
      .select('*', { count: 'exact' })
      .eq('id_programa', idPrograma);

    if (error) {
      console.error('Erro ao verificar designações existentes:', error);
      return {
        sucesso: false,
        existem: false,
        quantidade: 0,
        erro: error.message
      };
    }

    return {
      sucesso: true,
      existem: (count || 0) > 0,
      quantidade: count || 0
    };
  } catch (error) {
    console.error('Exceção ao verificar designações existentes:', error);
    return {
      sucesso: false,
      existem: false,
      quantidade: 0,
      erro: 'Erro interno do sistema'
    };
  }
};

/**
 * Remove designações existentes de um programa (para regeneração)
 */
export const removerDesignacoesPrograma = async (
  idPrograma: string
): Promise<{
  sucesso: boolean;
  quantidadeRemovida: number;
  erro?: string;
}> => {
  try {
    const { data, error, count } = await supabase
      .from('designacoes')
      .delete({ count: 'exact' })
      .eq('id_programa', idPrograma);

    if (error) {
      console.error('Erro ao remover designações:', error);
      return {
        sucesso: false,
        quantidadeRemovida: 0,
        erro: error.message
      };
    }

    return {
      sucesso: true,
      quantidadeRemovida: count || 0
    };
  } catch (error) {
    console.error('Exceção ao remover designações:', error);
    return {
      sucesso: false,
      quantidadeRemovida: 0,
      erro: 'Erro interno do sistema'
    };
  }
};

/**
 * Carrega todos os dados necessários para geração de designações
 * Função de conveniência que carrega tudo de uma vez
 */
export const carregarDadosCompletos = async (semanasHistorico: number = 8) => {
  const [estudantesResult, historicoResult, relacionamentosResult] = await Promise.all([
    carregarEstudantesAtivos(),
    carregarHistoricoDesignacoes(semanasHistorico),
    carregarRelacionamentosFamiliares()
  ]);

  return {
    estudantes: estudantesResult,
    historico: historicoResult,
    relacionamentos: relacionamentosResult,
    todosCarregados: estudantesResult.sucesso && historicoResult.sucesso && relacionamentosResult.sucesso
  };
};
