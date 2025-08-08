/**
 * Sistema de Balanceamento por Histórico de Designações
 * 
 * Este módulo implementa o algoritmo de balanceamento que prioriza estudantes
 * com menos designações nas últimas 8 semanas, incluindo fatores aleatórios
 * para evitar padrões previsíveis.
 */

import type { EstudanteRow } from '@/types/estudantes';
import type { HistoricoDesignacao } from '@/types/designacoes';

/**
 * Interface para pontuação de prioridade de um estudante
 */
export interface PontuacaoPrioridade {
  estudanteId: string;
  pontuacaoBase: number;
  fatorAleatorio: number;
  pontuacaoFinal: number;
  totalDesignacoes8Semanas: number;
  diasDesdeUltima?: number;
  ultimaDesignacao?: string;
  detalhes: {
    bonusTempoSemDesignacao: number;
    penalizacaoFrequencia: number;
    ajusteAleatorio: number;
  };
}

/**
 * Interface para configuração do algoritmo de balanceamento
 */
export interface ConfiguracaoBalanceamento {
  pesoFrequencia: number;          // Peso da penalização por frequência (padrão: 10)
  pesoTempoSemDesignacao: number;  // Peso do bônus por tempo sem designação (padrão: 1)
  fatorAleatorioMax: number;       // Máximo fator aleatório (padrão: 5)
  semanasHistorico: number;        // Semanas de histórico a considerar (padrão: 8)
  bonusMaximoTempo: number;        // Máximo bônus por tempo (padrão: 56 dias = 8 semanas)
}

/**
 * Configuração padrão do algoritmo
 */
const CONFIGURACAO_PADRAO: ConfiguracaoBalanceamento = {
  pesoFrequencia: 10,
  pesoTempoSemDesignacao: 1,
  fatorAleatorioMax: 5,
  semanasHistorico: 8,
  bonusMaximoTempo: 56
};

/**
 * Classe principal para balanceamento por histórico
 */
export class BalanceadorHistorico {
  private configuracao: ConfiguracaoBalanceamento;
  private historicoMap: Map<string, HistoricoDesignacao>;

  constructor(
    historico: Map<string, HistoricoDesignacao>,
    configuracao: Partial<ConfiguracaoBalanceamento> = {}
  ) {
    this.historicoMap = historico;
    this.configuracao = { ...CONFIGURACAO_PADRAO, ...configuracao };
  }

  /**
   * Calcula a pontuação de prioridade para um estudante
   * Menor pontuação = maior prioridade
   */
  calcularPontuacao(estudanteId: string): PontuacaoPrioridade {
    const historico = this.historicoMap.get(estudanteId);
    const totalDesignacoes = historico?.total_designacoes_8_semanas || 0;
    const ultimaDesignacao = historico?.ultima_designacao;

    // 1. Penalização por frequência (mais designações = maior penalização)
    const penalizacaoFrequencia = totalDesignacoes * this.configuracao.pesoFrequencia;

    // 2. Bônus por tempo sem designação
    let bonusTempoSemDesignacao = 0;
    let diasDesdeUltima: number | undefined;

    if (ultimaDesignacao) {
      diasDesdeUltima = Math.floor(
        (Date.now() - new Date(ultimaDesignacao).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Aplicar bônus limitado ao máximo configurado
      const bonusBruto = Math.min(diasDesdeUltima, this.configuracao.bonusMaximoTempo);
      bonusTempoSemDesignacao = bonusBruto * this.configuracao.pesoTempoSemDesignacao;
    } else {
      // Se nunca teve designação, dar bônus máximo
      bonusTempoSemDesignacao = this.configuracao.bonusMaximoTempo * this.configuracao.pesoTempoSemDesignacao;
    }

    // 3. Fator aleatório para evitar padrões previsíveis
    const fatorAleatorio = Math.random() * this.configuracao.fatorAleatorioMax;

    // 4. Cálculo da pontuação base e final
    const pontuacaoBase = 100; // Base neutra
    const ajusteAleatorio = fatorAleatorio - (this.configuracao.fatorAleatorioMax / 2); // Centrado em 0
    
    const pontuacaoFinal = pontuacaoBase + penalizacaoFrequencia - bonusTempoSemDesignacao + ajusteAleatorio;

    return {
      estudanteId,
      pontuacaoBase,
      fatorAleatorio,
      pontuacaoFinal: Math.max(0, pontuacaoFinal), // Não permitir pontuação negativa
      totalDesignacoes8Semanas: totalDesignacoes,
      diasDesdeUltima,
      ultimaDesignacao,
      detalhes: {
        bonusTempoSemDesignacao,
        penalizacaoFrequencia,
        ajusteAleatorio
      }
    };
  }

  /**
   * Ordena uma lista de estudantes por prioridade (menor pontuação primeiro)
   */
  ordenarPorPrioridade(estudantesIds: string[]): PontuacaoPrioridade[] {
    const pontuacoes = estudantesIds.map(id => this.calcularPontuacao(id));
    
    return pontuacoes.sort((a, b) => {
      // Ordenar por pontuação final (menor = maior prioridade)
      if (a.pontuacaoFinal !== b.pontuacaoFinal) {
        return a.pontuacaoFinal - b.pontuacaoFinal;
      }
      
      // Em caso de empate, priorizar quem tem menos designações
      if (a.totalDesignacoes8Semanas !== b.totalDesignacoes8Semanas) {
        return a.totalDesignacoes8Semanas - b.totalDesignacoes8Semanas;
      }
      
      // Em caso de empate total, manter ordem aleatória
      return Math.random() - 0.5;
    });
  }

  /**
   * Seleciona o melhor estudante de uma lista baseado na prioridade
   */
  selecionarMelhorEstudante(estudantesIds: string[]): PontuacaoPrioridade | null {
    if (estudantesIds.length === 0) {
      return null;
    }

    const ordenados = this.ordenarPorPrioridade(estudantesIds);
    return ordenados[0];
  }

  /**
   * Seleciona os N melhores estudantes de uma lista
   */
  selecionarMelhoresEstudantes(estudantesIds: string[], quantidade: number): PontuacaoPrioridade[] {
    const ordenados = this.ordenarPorPrioridade(estudantesIds);
    return ordenados.slice(0, quantidade);
  }

  /**
   * Gera relatório de distribuição de designações
   */
  gerarRelatorioDistribuicao(estudantesIds: string[]): {
    pontuacoes: PontuacaoPrioridade[];
    estatisticas: {
      mediaDesignacoes: number;
      medianaDesignacoes: number;
      estudantesSemDesignacao: number;
      estudantesComMaisDesignacoes: string[];
      estudantesComMenosDesignacoes: string[];
      distribuicaoFrequencia: Map<number, number>;
    };
  } {
    const pontuacoes = estudantesIds.map(id => this.calcularPontuacao(id));
    
    // Calcular estatísticas
    const designacoes = pontuacoes.map(p => p.totalDesignacoes8Semanas);
    const mediaDesignacoes = designacoes.reduce((sum, val) => sum + val, 0) / designacoes.length;
    
    const designacoesOrdenadas = [...designacoes].sort((a, b) => a - b);
    const medianaDesignacoes = designacoesOrdenadas.length % 2 === 0
      ? (designacoesOrdenadas[designacoesOrdenadas.length / 2 - 1] + designacoesOrdenadas[designacoesOrdenadas.length / 2]) / 2
      : designacoesOrdenadas[Math.floor(designacoesOrdenadas.length / 2)];

    const estudantesSemDesignacao = pontuacoes.filter(p => p.totalDesignacoes8Semanas === 0).length;
    
    const maxDesignacoes = Math.max(...designacoes);
    const minDesignacoes = Math.min(...designacoes);
    
    const estudantesComMaisDesignacoes = pontuacoes
      .filter(p => p.totalDesignacoes8Semanas === maxDesignacoes)
      .map(p => p.estudanteId);
    
    const estudantesComMenosDesignacoes = pontuacoes
      .filter(p => p.totalDesignacoes8Semanas === minDesignacoes)
      .map(p => p.estudanteId);

    // Distribuição de frequência
    const distribuicaoFrequencia = new Map<number, number>();
    designacoes.forEach(count => {
      distribuicaoFrequencia.set(count, (distribuicaoFrequencia.get(count) || 0) + 1);
    });

    return {
      pontuacoes: pontuacoes.sort((a, b) => a.pontuacaoFinal - b.pontuacaoFinal),
      estatisticas: {
        mediaDesignacoes,
        medianaDesignacoes,
        estudantesSemDesignacao,
        estudantesComMaisDesignacoes,
        estudantesComMenosDesignacoes,
        distribuicaoFrequencia
      }
    };
  }

  /**
   * Simula múltiplas gerações para testar balanceamento
   */
  simularBalanceamento(
    estudantesIds: string[],
    numeroSimulacoes: number = 100
  ): {
    frequenciaSelecao: Map<string, number>;
    distribuicaoEquitativa: boolean;
    coeficienteVariacao: number;
  } {
    const frequenciaSelecao = new Map<string, number>();
    
    // Inicializar contadores
    estudantesIds.forEach(id => frequenciaSelecao.set(id, 0));

    // Executar simulações
    for (let i = 0; i < numeroSimulacoes; i++) {
      const melhor = this.selecionarMelhorEstudante(estudantesIds);
      if (melhor) {
        frequenciaSelecao.set(melhor.estudanteId, frequenciaSelecao.get(melhor.estudanteId)! + 1);
      }
    }

    // Calcular estatísticas de distribuição
    const frequencias = Array.from(frequenciaSelecao.values());
    const media = frequencias.reduce((sum, val) => sum + val, 0) / frequencias.length;
    const variancia = frequencias.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / frequencias.length;
    const desvioPadrao = Math.sqrt(variancia);
    const coeficienteVariacao = media > 0 ? desvioPadrao / media : 0;

    // Considerar distribuição equitativa se CV < 0.3 (30%)
    const distribuicaoEquitativa = coeficienteVariacao < 0.3;

    return {
      frequenciaSelecao,
      distribuicaoEquitativa,
      coeficienteVariacao
    };
  }

  /**
   * Atualiza a configuração do balanceador
   */
  atualizarConfiguracao(novaConfiguracao: Partial<ConfiguracaoBalanceamento>): void {
    this.configuracao = { ...this.configuracao, ...novaConfiguracao };
  }

  /**
   * Obtém a configuração atual
   */
  obterConfiguracao(): ConfiguracaoBalanceamento {
    return { ...this.configuracao };
  }

  /**
   * Obtém estatísticas do histórico carregado
   */
  obterEstatisticasHistorico(): {
    totalEstudantesComHistorico: number;
    totalDesignacoes: number;
    periodoCobertura: { inicio?: string; fim?: string };
  } {
    let totalDesignacoes = 0;
    let dataInicio: string | undefined;
    let dataFim: string | undefined;

    this.historicoMap.forEach(historico => {
      totalDesignacoes += historico.total_designacoes_8_semanas;
      
      historico.designacoes_recentes.forEach(designacao => {
        if (!dataInicio || designacao.data_inicio_semana < dataInicio) {
          dataInicio = designacao.data_inicio_semana;
        }
        if (!dataFim || designacao.data_inicio_semana > dataFim) {
          dataFim = designacao.data_inicio_semana;
        }
      });
    });

    return {
      totalEstudantesComHistorico: this.historicoMap.size,
      totalDesignacoes,
      periodoCobertura: {
        inicio: dataInicio,
        fim: dataFim
      }
    };
  }
}
