/**
 * Sistema de Geração Automática de Designações S-38-T
 *
 * Este módulo implementa a geração automática de designações para a Escola do Ministério Teocrático
 * seguindo rigorosamente as regras S-38-T e utilizando dados do Supabase.
 */

import { supabase } from '@/integrations/supabase/client';
import { canBePaired, getFamilyRelationship } from '@/types/family';
import type { Database } from '@/integrations/supabase/types';
import { RegrasS38T as MainRegrasS38T } from '@/utils/regrasS38T';

// Tipos baseados no schema do Supabase
type EstudanteRow = Database['public']['Tables']['estudantes']['Row'];
type ProgramaRow = Database['public']['Tables']['programas']['Row'];
type DesignacaoRow = Database['public']['Tables']['designacoes']['Row'];

export interface Estudante {
  id: string;
  nome: string;
  genero: 'masculino' | 'feminino';
  idade?: number;
  cargo: 'anciao' | 'servo_ministerial' | 'pioneiro_regular' | 'publicador_batizado' | 'publicador_nao_batizado' | 'estudante_novo';
  ativo: boolean;
  email?: string;
  id_pai_mae?: string;
}

export interface ParteProgramaS38T {
  numero_parte: number;
  titulo_parte: string;
  tipo_parte: 'leitura_biblica' | 'discurso' | 'demonstracao';
  tempo_minutos: number;
  cena?: string;
  requer_ajudante: boolean;
}

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

export interface OpcoesDegeracao {
  data_inicio_semana: string;
  id_programa: string;
  partes: ParteProgramaS38T[];
  excluir_estudante_ids?: string[];
  preferir_pares_familiares?: boolean;
}

// Helper functions for assignment generation
const podeReceberParte = (estudante: Estudante, parte: ParteProgramaS38T): boolean => {
  // Convert to EstudanteRow format for the main rules
  const estudanteRow = {
    id: estudante.id,
    nome: estudante.nome,
    genero: estudante.genero,
    cargo: estudante.cargo,
    ativo: estudante.ativo,
    idade: estudante.idade,
    email: estudante.email,
    id_pai_mae: estudante.id_pai_mae,
    user_id: '', // Not needed for rule checking
    created_at: '', // Not needed for rule checking
    updated_at: '' // Not needed for rule checking
  };

  return MainRegrasS38T.podeReceberParte(estudanteRow, parte);
};

const precisaAjudante = (parte: ParteProgramaS38T): boolean => {
  return MainRegrasS38T.precisaAjudante(parte);
};

const podemFormarPar = async (estudante1: Estudante, estudante2: Estudante): Promise<boolean> => {
  // Convert to EstudanteRow format for the main rules
  const estudante1Row = {
    id: estudante1.id,
    nome: estudante1.nome,
    genero: estudante1.genero,
    cargo: estudante1.cargo,
    ativo: estudante1.ativo,
    idade: estudante1.idade,
    email: estudante1.email,
    id_pai_mae: estudante1.id_pai_mae,
    user_id: '',
    created_at: '',
    updated_at: ''
  };

  const estudante2Row = {
    id: estudante2.id,
    nome: estudante2.nome,
    genero: estudante2.genero,
    cargo: estudante2.cargo,
    ativo: estudante2.ativo,
    idade: estudante2.idade,
    email: estudante2.email,
    id_pai_mae: estudante2.id_pai_mae,
    user_id: '',
    created_at: '',
    updated_at: ''
  };

  return MainRegrasS38T.podemFormarPar(estudante1Row, estudante2Row);
};

/**
 * Gerador Principal de Designações S-38-T
 */
export class GeradorDesignacoes {
  private estudantes: Estudante[] = [];
  private designacoesRecentes: Map<string, Date[]> = new Map();

  constructor(estudantes: Estudante[]) {
    this.estudantes = estudantes.filter(e => e.ativo);
  }

  /**
   * Carrega designações recentes para evitar sobrecarga de estudantes
   */
  async carregarDesignacoesRecentes(semanasAtras: number = 8): Promise<void> {
    const dataCorte = new Date();
    dataCorte.setDate(dataCorte.getDate() - (semanasAtras * 7));

    try {
      // Buscar designações das últimas 8 semanas
      const { data: designacoes, error } = await supabase
        .from('designacoes')
        .select(`
          id_estudante,
          id_ajudante,
          programas!inner(
            data_inicio_semana
          )
        `)
        .gte('programas.data_inicio_semana', dataCorte.toISOString().split('T')[0]);

      if (error) {
        console.error('Erro ao carregar designações recentes:', error);
        return;
      }

      // Construir mapa de designações recentes
      this.designacoesRecentes.clear();

      designacoes?.forEach(designacao => {
        const data = new Date((designacao as any).programas.data_inicio_semana);

        // Rastrear designações do estudante principal
        if (!this.designacoesRecentes.has(designacao.id_estudante)) {
          this.designacoesRecentes.set(designacao.id_estudante, []);
        }
        this.designacoesRecentes.get(designacao.id_estudante)!.push(data);

        // Rastrear designações do ajudante
        if (designacao.id_ajudante) {
          if (!this.designacoesRecentes.has(designacao.id_ajudante)) {
            this.designacoesRecentes.set(designacao.id_ajudante, []);
          }
          this.designacoesRecentes.get(designacao.id_ajudante)!.push(data);
        }
      });
    } catch (error) {
      console.error('Exceção ao carregar designações recentes:', error);
    }
  }

  /**
   * Obtém pontuação de frequência de designações (menor é melhor)
   */
  private obterFrequenciaDesignacoes(estudanteId: string): number {
    const designacoes = this.designacoesRecentes.get(estudanteId) || [];
    return designacoes.length;
  }

  /**
   * Calcula score de prioridade para balanceamento (menor score = maior prioridade)
   */
  private calcularScorePrioridade(estudanteId: string): number {
    const frequencia = this.obterFrequenciaDesignacoes(estudanteId);
    const fatorAleatorio = Math.random() * 0.1; // Pequeno fator aleatório para evitar padrões
    return frequencia + fatorAleatorio;
  }

  /**
   * Encontra o melhor estudante para uma parte específica
   */
  private async encontrarMelhorEstudanteParte(
    parte: ParteProgramaS38T,
    excluirIds: string[] = []
  ): Promise<Estudante | null> {
    // Filtrar estudantes elegíveis
    const estudantesElegiveis = this.estudantes.filter(estudante =>
      !excluirIds.includes(estudante.id) &&
      podeReceberParte(estudante, parte)
    );

    if (estudantesElegiveis.length === 0) {
      return null;
    }

    // Ordenar por score de prioridade (menor score = maior prioridade)
    estudantesElegiveis.sort((a, b) => {
      const scoreA = this.calcularScorePrioridade(a.id);
      const scoreB = this.calcularScorePrioridade(b.id);
      return scoreA - scoreB;
    });

    return estudantesElegiveis[0];
  }

  /**
   * Encontra o melhor ajudante para um estudante
   */
  private async encontrarMelhorAjudante(
    estudante: Estudante,
    parte: ParteProgramaS38T,
    excluirIds: string[] = []
  ): Promise<Estudante | null> {
    // Filtrar ajudantes potenciais
    const ajudantesPotenciais = this.estudantes.filter(ajudante =>
      ajudante.id !== estudante.id &&
      !excluirIds.includes(ajudante.id)
    );

    if (ajudantesPotenciais.length === 0) {
      return null;
    }

    // Verificar relacionamentos familiares e regras de pareamento
    const ajudantesValidos: Array<{
      estudante: Estudante;
      ehFamiliar: boolean;
      score: number
    }> = [];

    for (const ajudante of ajudantesPotenciais) {
      // Verificar se podem formar par de acordo com as diretrizes S-38-T
      const podemFormarParResult = await podemFormarPar(estudante, ajudante);

      if (podemFormarParResult) {
        const ehFamiliar = estudante.genero !== ajudante.genero ?
          await getFamilyRelationship(estudante.id, ajudante.id) !== null : false;

        ajudantesValidos.push({
          estudante: ajudante,
          ehFamiliar,
          score: this.calcularScorePrioridade(ajudante.id)
        });
      }
    }

    if (ajudantesValidos.length === 0) {
      return null;
    }

    // Ordenar por preferência: familiares primeiro, depois por score
    ajudantesValidos.sort((a, b) => {
      // Preferir familiares para pares de gêneros diferentes
      if (estudante.genero !== a.estudante.genero && estudante.genero !== b.estudante.genero) {
        if (a.ehFamiliar && !b.ehFamiliar) return -1;
        if (!a.ehFamiliar && b.ehFamiliar) return 1;
      }

      // Depois ordenar por score de prioridade
      return a.score - b.score;
    });

    return ajudantesValidos[0].estudante;
  }

  /**
   * Gera designações para uma semana específica
   */
  async gerarDesignacoes(opcoes: OpcoesDegeracao): Promise<DesignacaoGerada[]> {
    console.log('🎯 Gerando designações para semana:', opcoes.data_inicio_semana);

    await this.carregarDesignacoesRecentes();

    const designacoes: DesignacaoGerada[] = [];
    const estudantesUsados = new Set<string>(opcoes.excluir_estudante_ids || []);

    for (const parte of opcoes.partes) {
      console.log(`📝 Processando parte ${parte.numero_parte}: ${parte.titulo_parte}`);

      // Encontrar estudante para esta parte
      const estudante = await this.encontrarMelhorEstudanteParte(parte, Array.from(estudantesUsados));

      if (!estudante) {
        console.warn(`⚠️ Nenhum estudante elegível encontrado para parte ${parte.numero_parte}`);
        continue;
      }

      estudantesUsados.add(estudante.id);

      // Criar designação base
      const designacao: DesignacaoGerada = {
        id_estudante: estudante.id,
        numero_parte: parte.numero_parte,
        titulo_parte: parte.titulo_parte,
        tipo_parte: parte.tipo_parte,
        cena: parte.cena,
        tempo_minutos: parte.tempo_minutos,
        data_inicio_semana: opcoes.data_inicio_semana,
        confirmado: false
      };

      // Encontrar ajudante se necessário
      if (precisaAjudante(parte)) {
        const ajudante = await this.encontrarMelhorAjudante(estudante, parte, Array.from(estudantesUsados));

        if (ajudante) {
          designacao.id_ajudante = ajudante.id;
          estudantesUsados.add(ajudante.id);
          console.log(`👥 Pareado ${estudante.nome} com ${ajudante.nome}`);

          // Log relacionamento familiar se aplicável
          const relacionamento = await getFamilyRelationship(estudante.id, ajudante.id);
          if (relacionamento) {
            console.log(`👨‍👩‍👧‍👦 Relacionamento familiar: ${relacionamento}`);
          }
        } else {
          console.warn(`⚠️ Nenhum ajudante adequado encontrado para ${estudante.nome}`);
        }
      }

      designacoes.push(designacao);
      console.log(`✅ Designada parte ${parte.numero_parte} para ${estudante.nome}`);
    }

    console.log(`🎉 Geradas ${designacoes.length} designações`);
    return designacoes;
  }

  /**
   * Valida designações geradas contra as regras S-38-T
   */
  async validarDesignacoes(designacoes: DesignacaoGerada[]): Promise<string[]> {
    const erros: string[] = [];

    for (const designacao of designacoes) {
      const estudante = this.estudantes.find(e => e.id === designacao.id_estudante);
      const ajudante = designacao.id_ajudante ?
        this.estudantes.find(e => e.id === designacao.id_ajudante) : null;

      if (!estudante) {
        erros.push(`Estudante não encontrado para designação ${designacao.numero_parte}`);
        continue;
      }

      // Validar regras de designação da parte
      const parte: ParteProgramaS38T = {
        numero_parte: designacao.numero_parte,
        titulo_parte: designacao.titulo_parte,
        tipo_parte: designacao.tipo_parte as any,
        tempo_minutos: designacao.tempo_minutos,
        cena: designacao.cena,
        requer_ajudante: !!designacao.id_ajudante
      };

      if (!podeReceberParte(estudante, parte)) {
        erros.push(`${estudante.nome} não pode receber parte ${designacao.numero_parte} (${designacao.tipo_parte})`);
      }

      // Validar pareamento de ajudante se aplicável
      if (ajudante) {
        const podemFormarParResult = await podemFormarPar(estudante, ajudante);

        if (!podemFormarParResult) {
          erros.push(`${estudante.nome} e ${ajudante.nome} não podem formar par (diretrizes S-38-T)`);
        }
      }
    }

    return erros;
  }

  /**
   * Gera estatísticas de distribuição das designações
   */
  gerarEstatisticas(designacoes: DesignacaoGerada[]): {
    totalDesignacoes: number;
    distribuicaoPorGenero: { masculino: number; feminino: number };
    distribuicaoPorCargo: Record<string, number>;
    estudantesComAjudante: number;
  } {
    const stats = {
      totalDesignacoes: designacoes.length,
      distribuicaoPorGenero: { masculino: 0, feminino: 0 },
      distribuicaoPorCargo: {} as Record<string, number>,
      estudantesComAjudante: 0
    };

    designacoes.forEach(designacao => {
      const estudante = this.estudantes.find(e => e.id === designacao.id_estudante);
      if (estudante) {
        stats.distribuicaoPorGenero[estudante.genero]++;
        stats.distribuicaoPorCargo[estudante.cargo] = (stats.distribuicaoPorCargo[estudante.cargo] || 0) + 1;
      }

      if (designacao.id_ajudante) {
        stats.estudantesComAjudante++;
      }
    });

    return stats;
  }
}

/**
 * Função utilitária para criar gerador de designações com estudantes atuais
 */
export const criarGeradorDesignacoes = async (userId: string): Promise<GeradorDesignacoes> => {
  try {
    console.log('🔧 Creating assignment generator for user:', userId);

    const { data: estudantes, error } = await supabase
      .from('estudantes')
      .select('*')
      .eq('user_id', userId)
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('❌ Error loading students for assignment generator:', error);
      throw new Error(`Erro ao carregar estudantes: ${error.message}`);
    }

    if (!estudantes || estudantes.length === 0) {
      console.warn('⚠️ No active students found for user:', userId);
      throw new Error('Nenhum estudante ativo encontrado. Cadastre estudantes antes de gerar designações.');
    }

    console.log(`✅ Loaded ${estudantes.length} active students for assignment generation`);

    const estudantesMapeados: Estudante[] = estudantes.map(estudante => ({
      id: estudante.id,
      nome: estudante.nome,
      genero: estudante.genero,
      idade: estudante.idade || undefined,
      cargo: estudante.cargo,
      ativo: estudante.ativo,
      email: estudante.email || undefined,
      id_pai_mae: estudante.id_pai_mae || undefined,
    }));

    return new GeradorDesignacoes(estudantesMapeados);
  } catch (error) {
    console.error('❌ Exception creating assignment generator:', error);
    if (error instanceof Error) {
      throw error; // Re-throw known errors
    }
    throw new Error('Erro inesperado ao criar gerador de designações');
  }
};

/**
 * Função para carregar programa da semana específica
 */
export const carregarProgramaSemana = async (dataInicioSemana: string): Promise<ProgramaRow | null> => {
  try {
    const { data: programa, error } = await supabase
      .from('programas')
      .select('*')
      .eq('data_inicio_semana', dataInicioSemana)
      .single();

    if (error) {
      console.error('Erro ao carregar programa da semana:', error);
      return null;
    }

    return programa;
  } catch (error) {
    console.error('Exceção ao carregar programa da semana:', error);
    return null;
  }
};

/**
 * Função para salvar designações no banco de dados com validações de segurança
 */
export const salvarDesignacoes = async (
  designacoes: DesignacaoGerada[],
  idPrograma: string,
  userId: string
): Promise<{ sucesso: boolean; erro?: string; detalhes?: any }> => {
  try {
    // Importar validador de segurança
    const { ValidadorSeguranca } = await import('./validacaoSeguranca');

    // Validação completa de segurança
    const validacao = await ValidadorSeguranca.validarCompleto(designacoes, idPrograma, userId);

    if (!validacao.valido) {
      const errosCompletos = [
        ...validacao.erros,
        ...validacao.conflitos.map(c => c.descricao)
      ];

      return {
        sucesso: false,
        erro: errosCompletos.join('; '),
        detalhes: validacao
      };
    }

    // Verificar se já existem designações e removê-las (transação implícita)
    const existentesResult = await ValidadorSeguranca.verificarDesignacoesExistentes(idPrograma, userId);
    if (existentesResult.existem) {
      const remocaoResult = await ValidadorSeguranca.removerDesignacoesSeguro(idPrograma, userId);
      if (!remocaoResult.sucesso) {
        return {
          sucesso: false,
          erro: `Erro ao remover designações existentes: ${remocaoResult.erro}`
        };
      }
    }

    // Preparar dados para inserção com validação de tipos
    const designacoesParaSalvar = designacoes.map(designacao => ({
      user_id: userId,
      id_programa: idPrograma,
      id_estudante: designacao.id_estudante,
      id_ajudante: designacao.id_ajudante || null,
      numero_parte: designacao.numero_parte,
      titulo_parte: designacao.titulo_parte,
      tipo_parte: designacao.tipo_parte,
      cena: designacao.cena || null,
      tempo_minutos: designacao.tempo_minutos,
      confirmado: designacao.confirmado || false
    }));

    // Log data being inserted for debugging
    console.log('📝 Inserindo designações:', {
      quantidade: designacoesParaSalvar.length,
      partes: designacoesParaSalvar.map(d => ({ numero: d.numero_parte, tipo: d.tipo_parte, titulo: d.titulo_parte })),
      userId,
      idPrograma
    });

    // Inserção em lote com RLS automático
    const { error } = await supabase
      .from('designacoes')
      .insert(designacoesParaSalvar);

    if (error) {
      console.error('❌ Erro ao salvar designações:', {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        dadosInseridos: designacoesParaSalvar
      });

      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('designacoes_numero_parte_check')) {
        errorMessage = 'Erro: Número de parte inválido. Execute a migração do banco de dados para suportar partes 1-12.';
      } else if (error.message.includes('designacoes_tipo_parte_check')) {
        errorMessage = 'Erro: Tipo de parte inválido. Execute a migração do banco de dados para suportar novos tipos de designação.';
      }

      return {
        sucesso: false,
        erro: `Erro na gravação: ${errorMessage}`,
        detalhes: { supabaseError: error, dadosInseridos: designacoesParaSalvar }
      };
    }

    return {
      sucesso: true,
      detalhes: {
        quantidadeSalva: designacoes.length,
        avisos: validacao.avisos
      }
    };
  } catch (error) {
    console.error('Exceção ao salvar designações:', error);
    return {
      sucesso: false,
      erro: 'Erro interno do sistema',
      detalhes: { exception: error }
    };
  }
};
