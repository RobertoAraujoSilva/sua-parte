/**
 * Sistema de Validação de Segurança para Designações
 * 
 * Este módulo implementa validações de segurança rigorosas para o sistema
 * de designações, incluindo RLS, validação de conflitos e transações atômicas.
 */

import { supabase } from '@/integrations/supabase/client';
import type { DesignacaoGerada } from '@/types/designacoes';

/**
 * Interface para resultado de validação de segurança
 */
export interface ResultadoValidacaoSeguranca {
  valido: boolean;
  erros: string[];
  avisos: string[];
  conflitos: ConflitosDetectados[];
}

/**
 * Interface para conflitos detectados
 */
export interface ConflitosDetectados {
  tipo: 'estudante_duplicado' | 'ajudante_duplicado' | 'sobrecarga_estudante' | 'programa_inexistente';
  estudanteId: string;
  numeroParte: number;
  descricao: string;
  detalhes?: any;
}

/**
 * Classe principal para validação de segurança
 */
export class ValidadorSeguranca {
  
  /**
   * Valida se o usuário tem permissão para criar designações
   */
  static async validarPermissaoUsuario(userId: string): Promise<{
    temPermissao: boolean;
    motivo?: string;
  }> {
    try {
      // Verificar se o usuário existe e tem role de instrutor
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        return {
          temPermissao: false,
          motivo: 'Usuário não encontrado no sistema'
        };
      }

      if (profile.role !== 'instrutor') {
        return {
          temPermissao: false,
          motivo: 'Apenas instrutores podem criar designações'
        };
      }

      return { temPermissao: true };
    } catch (error) {
      console.error('Erro ao validar permissão do usuário:', error);
      return {
        temPermissao: false,
        motivo: 'Erro interno ao validar permissões'
      };
    }
  }

  /**
   * Valida se um programa existe e pertence ao usuário
   */
  static async validarPrograma(programaId: string, userId: string): Promise<{
    valido: boolean;
    motivo?: string;
    programa?: any;
  }> {
    try {
      const { data: programa, error } = await supabase
        .from('programas')
        .select('*')
        .eq('id', programaId)
        .eq('user_id', userId) // RLS automático
        .single();

      if (error || !programa) {
        return {
          valido: false,
          motivo: 'Programa não encontrado ou sem permissão de acesso'
        };
      }

      if (programa.status !== 'ativo') {
        return {
          valido: false,
          motivo: 'Programa não está ativo'
        };
      }

      return {
        valido: true,
        programa
      };
    } catch (error) {
      console.error('Erro ao validar programa:', error);
      return {
        valido: false,
        motivo: 'Erro interno ao validar programa'
      };
    }
  }

  /**
   * Valida se todos os estudantes existem e pertencem ao usuário
   */
  static async validarEstudantes(
    estudanteIds: string[], 
    userId: string
  ): Promise<{
    valido: boolean;
    estudantesInvalidos: string[];
    estudantesInativos: string[];
  }> {
    try {
      const { data: estudantes, error } = await supabase
        .from('estudantes')
        .select('id, ativo')
        .in('id', estudanteIds)
        .eq('user_id', userId); // RLS automático

      if (error) {
        console.error('Erro ao validar estudantes:', error);
        return {
          valido: false,
          estudantesInvalidos: estudanteIds,
          estudantesInativos: []
        };
      }

      const estudantesEncontrados = estudantes?.map(e => e.id) || [];
      const estudantesInvalidos = estudanteIds.filter(id => !estudantesEncontrados.includes(id));
      const estudantesInativos = estudantes?.filter(e => !e.ativo).map(e => e.id) || [];

      return {
        valido: estudantesInvalidos.length === 0 && estudantesInativos.length === 0,
        estudantesInvalidos,
        estudantesInativos
      };
    } catch (error) {
      console.error('Erro ao validar estudantes:', error);
      return {
        valido: false,
        estudantesInvalidos: estudanteIds,
        estudantesInativos: []
      };
    }
  }

  /**
   * Detecta conflitos nas designações propostas
   */
  static detectarConflitos(designacoes: DesignacaoGerada[]): ConflitosDetectados[] {
    const conflitos: ConflitosDetectados[] = [];
    const estudantesUsados = new Set<string>();
    const ajudantesUsados = new Set<string>();

    for (const designacao of designacoes) {
      // Verificar estudante duplicado
      if (estudantesUsados.has(designacao.id_estudante)) {
        conflitos.push({
          tipo: 'estudante_duplicado',
          estudanteId: designacao.id_estudante,
          numeroParte: designacao.numero_parte,
          descricao: `Estudante ${designacao.id_estudante} já tem outra designação nesta semana`
        });
      } else {
        estudantesUsados.add(designacao.id_estudante);
      }

      // Verificar ajudante duplicado
      if (designacao.id_ajudante) {
        if (ajudantesUsados.has(designacao.id_ajudante) || estudantesUsados.has(designacao.id_ajudante)) {
          conflitos.push({
            tipo: 'ajudante_duplicado',
            estudanteId: designacao.id_ajudante,
            numeroParte: designacao.numero_parte,
            descricao: `Ajudante ${designacao.id_ajudante} já tem outra designação nesta semana`
          });
        } else {
          ajudantesUsados.add(designacao.id_ajudante);
        }
      }
    }

    return conflitos;
  }

  /**
   * Verifica se já existem designações para o programa
   */
  static async verificarDesignacoesExistentes(
    programaId: string, 
    userId: string
  ): Promise<{
    existem: boolean;
    quantidade: number;
    designacoes?: any[];
  }> {
    try {
      const { data: designacoes, error, count } = await supabase
        .from('designacoes')
        .select('*', { count: 'exact' })
        .eq('id_programa', programaId)
        .eq('user_id', userId); // RLS automático

      if (error) {
        console.error('Erro ao verificar designações existentes:', error);
        return { existem: false, quantidade: 0 };
      }

      return {
        existem: (count || 0) > 0,
        quantidade: count || 0,
        designacoes: designacoes || []
      };
    } catch (error) {
      console.error('Erro ao verificar designações existentes:', error);
      return { existem: false, quantidade: 0 };
    }
  }

  /**
   * Validação completa de segurança antes da gravação
   */
  static async validarCompleto(
    designacoes: DesignacaoGerada[],
    programaId: string,
    userId: string
  ): Promise<ResultadoValidacaoSeguranca> {
    const erros: string[] = [];
    const avisos: string[] = [];
    let conflitos: ConflitosDetectados[] = [];

    try {
      // 1. Validar permissão do usuário
      const permissaoResult = await this.validarPermissaoUsuario(userId);
      if (!permissaoResult.temPermissao) {
        erros.push(permissaoResult.motivo || 'Sem permissão');
      }

      // 2. Validar programa
      const programaResult = await this.validarPrograma(programaId, userId);
      if (!programaResult.valido) {
        erros.push(programaResult.motivo || 'Programa inválido');
      }

      // 3. Extrair IDs de estudantes únicos
      const estudanteIds = Array.from(new Set([
        ...designacoes.map(d => d.id_estudante),
        ...designacoes.filter(d => d.id_ajudante).map(d => d.id_ajudante!)
      ]));

      // 4. Validar estudantes
      const estudantesResult = await this.validarEstudantes(estudanteIds, userId);
      if (!estudantesResult.valido) {
        if (estudantesResult.estudantesInvalidos.length > 0) {
          erros.push(`Estudantes não encontrados: ${estudantesResult.estudantesInvalidos.join(', ')}`);
        }
        if (estudantesResult.estudantesInativos.length > 0) {
          erros.push(`Estudantes inativos: ${estudantesResult.estudantesInativos.join(', ')}`);
        }
      }

      // 5. Detectar conflitos internos
      conflitos = this.detectarConflitos(designacoes);

      // 6. Verificar designações existentes
      const existentesResult = await this.verificarDesignacoesExistentes(programaId, userId);
      if (existentesResult.existem) {
        avisos.push(`Já existem ${existentesResult.quantidade} designação(ões) para este programa. Elas serão substituídas.`);
      }

      // 7. Validações de negócio
      if (designacoes.length === 0) {
        erros.push('Nenhuma designação foi gerada');
      }

      // Verificar se todas as designações têm dados obrigatórios
      for (const designacao of designacoes) {
        if (!designacao.id_estudante) {
          erros.push(`Designação da parte ${designacao.numero_parte} sem estudante`);
        }
        if (!designacao.tipo_parte) {
          erros.push(`Designação da parte ${designacao.numero_parte} sem tipo de parte`);
        }
        if (!designacao.tempo_minutos || designacao.tempo_minutos <= 0) {
          erros.push(`Designação da parte ${designacao.numero_parte} com tempo inválido`);
        }
      }

    } catch (error) {
      console.error('Erro na validação completa:', error);
      erros.push('Erro interno na validação de segurança');
    }

    return {
      valido: erros.length === 0 && conflitos.length === 0,
      erros,
      avisos,
      conflitos
    };
  }

  /**
   * Remove designações existentes de forma segura (para regeneração)
   */
  static async removerDesignacoesSeguro(
    programaId: string,
    userId: string
  ): Promise<{
    sucesso: boolean;
    quantidadeRemovida: number;
    erro?: string;
  }> {
    try {
      // Primeiro verificar se o programa pertence ao usuário
      const programaResult = await this.validarPrograma(programaId, userId);
      if (!programaResult.valido) {
        return {
          sucesso: false,
          quantidadeRemovida: 0,
          erro: programaResult.motivo
        };
      }

      // Remover designações com RLS automático
      const { error, count } = await supabase
        .from('designacoes')
        .delete({ count: 'exact' })
        .eq('id_programa', programaId)
        .eq('user_id', userId); // RLS automático

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
      console.error('Erro ao remover designações:', error);
      return {
        sucesso: false,
        quantidadeRemovida: 0,
        erro: 'Erro interno do sistema'
      };
    }
  }
}
