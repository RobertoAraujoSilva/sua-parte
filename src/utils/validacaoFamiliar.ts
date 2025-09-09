/**
 * Sistema de Validação de Pares e Relacionamentos Familiares
 * 
 * Este módulo implementa a validação de relacionamentos familiares para o sistema
 * de designações S-38-T, garantindo que pares de gêneros diferentes sejam apenas
 * entre familiares e que menores de idade formem pares do mesmo gênero.
 */

import { supabase } from '@/integrations/supabase/client';
import type { EstudanteRow } from '@/types/estudantes';
import type { FamilyMember } from '@/types/family';

/**
 * Interface para resultado de validação de pareamento
 */
export interface ResultadoValidacaoPar {
  valido: boolean;
  motivo: string;
  tipoRelacionamento?: 'mesmo_genero' | 'familiar_direto' | 'irmaos' | 'pai_filho' | 'family_members';
  detalhes?: string;
}

/**
 * Interface para cache de relacionamentos familiares
 */
interface CacheRelacionamentos {
  familyMembers: Map<string, FamilyMember[]>;
  estudantesData: Map<string, EstudanteRow>;
  ultimaAtualizacao: number;
}

/**
 * Classe principal para validação de relacionamentos familiares
 */
export class ValidadorRelacionamentosFamiliares {
  private static cache: CacheRelacionamentos = {
    familyMembers: new Map(),
    estudantesData: new Map(),
    ultimaAtualizacao: 0
  };

  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Carrega e atualiza o cache de relacionamentos familiares
   */
  private static async atualizarCache(): Promise<void> {
    const agora = Date.now();
    
    // Verificar se o cache ainda é válido
    if (agora - this.cache.ultimaAtualizacao < this.CACHE_DURATION) {
      return;
    }

    try {
      // Carregar family_members
      const { data: familyMembers, error: familyError } = await supabase
        .from('family_members')
        .select('*');

      if (familyError) {
        console.error('Erro ao carregar family_members:', familyError);
        return;
      }

      // Carregar dados dos estudantes
      const { data: estudantes, error: estudantesError } = await supabase
        .from('estudantes')
        .select('*');

      if (estudantesError) {
        console.error('Erro ao carregar estudantes:', estudantesError);
        return;
      }

      // Atualizar cache
      this.cache.familyMembers.clear();
      this.cache.estudantesData.clear();

      // Organizar family_members por student_id
      familyMembers?.forEach(member => {
        if (!this.cache.familyMembers.has(member.student_id)) {
          this.cache.familyMembers.set(member.student_id, []);
        }
        this.cache.familyMembers.get(member.student_id)!.push(member);
      });

      // Organizar estudantes por id
      estudantes?.forEach(estudante => {
        this.cache.estudantesData.set(estudante.id, estudante);
      });

      this.cache.ultimaAtualizacao = agora;
      console.log('Cache de relacionamentos familiares atualizado');
    } catch (error) {
      console.error('Erro ao atualizar cache de relacionamentos:', error);
    }
  }

  /**
   * Verifica se dois estudantes podem formar um par baseado nas regras S-38-T
   */
  static async validarPareamento(
    estudante1Id: string,
    estudante2Id: string
  ): Promise<ResultadoValidacaoPar> {
    await this.atualizarCache();

    const estudante1 = this.cache.estudantesData.get(estudante1Id);
    const estudante2 = this.cache.estudantesData.get(estudante2Id);

    if (!estudante1 || !estudante2) {
      return {
        valido: false,
        motivo: 'Um ou ambos estudantes não foram encontrados'
      };
    }

    // Verificar se ambos estão ativos
    if (!estudante1.ativo || !estudante2.ativo) {
      return {
        valido: false,
        motivo: 'Um ou ambos estudantes estão inativos'
      };
    }

    // REGRA 1: Mesmo gênero - sempre permitido
    if (estudante1.genero === estudante2.genero) {
      return {
        valido: true,
        motivo: 'Mesmo gênero - pareamento permitido',
        tipoRelacionamento: 'mesmo_genero'
      };
    }

    // REGRA 2: Menores de idade com gêneros diferentes - não permitido
    const estudante1Menor = estudante1.idade && estudante1.idade < 18;
    const estudante2Menor = estudante2.idade && estudante2.idade < 18;

    if (estudante1Menor || estudante2Menor) {
      return {
        valido: false,
        motivo: 'Menores de idade devem formar pares do mesmo gênero'
      };
    }

    // REGRA 3: Gêneros diferentes - verificar relacionamentos familiares
    return await this.verificarRelacionamentoFamiliar(estudante1, estudante2);
  }

  /**
   * Verifica relacionamento familiar entre dois estudantes de gêneros diferentes
   */
  private static async verificarRelacionamentoFamiliar(
    estudante1: EstudanteRow,
    estudante2: EstudanteRow
  ): Promise<ResultadoValidacaoPar> {
    // VERIFICAÇÃO 1: Relacionamento pai/mãe e filho(a)
    if (estudante1.id_pai_mae === estudante2.id) {
      return {
        valido: true,
        motivo: `${estudante2.nome} é responsável por ${estudante1.nome}`,
        tipoRelacionamento: 'pai_filho',
        detalhes: 'Relacionamento pai/mãe e filho(a)'
      };
    }

    if (estudante2.id_pai_mae === estudante1.id) {
      return {
        valido: true,
        motivo: `${estudante1.nome} é responsável por ${estudante2.nome}`,
        tipoRelacionamento: 'pai_filho',
        detalhes: 'Relacionamento pai/mãe e filho(a)'
      };
    }

    // VERIFICAÇÃO 2: Irmãos (mesmo responsável)
    if (estudante1.id_pai_mae && estudante2.id_pai_mae && 
        estudante1.id_pai_mae === estudante2.id_pai_mae) {
      return {
        valido: true,
        motivo: 'Irmãos (mesmo responsável)',
        tipoRelacionamento: 'irmaos',
        detalhes: 'Relacionamento entre irmãos'
      };
    }

    // VERIFICAÇÃO 3: Relacionamento via family_members
    const relacionamentoFamilyMembers = await this.verificarFamilyMembers(estudante1, estudante2);
    if (relacionamentoFamilyMembers.valido) {
      return relacionamentoFamilyMembers;
    }

    // Nenhum relacionamento familiar encontrado
    return {
      valido: false,
      motivo: 'Gêneros diferentes sem relacionamento familiar comprovado'
    };
  }

  /**
   * Verifica relacionamento via tabela family_members
   */
  private static async verificarFamilyMembers(
    estudante1: EstudanteRow,
    estudante2: EstudanteRow
  ): Promise<ResultadoValidacaoPar> {
    // Verificar se estudante2 está na família de estudante1
    const familia1 = this.cache.familyMembers.get(estudante1.id) || [];
    const estudante2NaFamilia1 = familia1.find(member => 
      member.email === estudante2.email && member.email
    );

    if (estudante2NaFamilia1) {
      return {
        valido: true,
        motivo: `${estudante2.nome} é ${estudante2NaFamilia1.relation} de ${estudante1.nome}`,
        tipoRelacionamento: 'family_members',
        detalhes: `Relacionamento: ${estudante2NaFamilia1.relation}`
      };
    }

    // Verificar se estudante1 está na família de estudante2
    const familia2 = this.cache.familyMembers.get(estudante2.id) || [];
    const estudante1NaFamilia2 = familia2.find(member => 
      member.email === estudante1.email && member.email
    );

    if (estudante1NaFamilia2) {
      return {
        valido: true,
        motivo: `${estudante1.nome} é ${estudante1NaFamilia2.relation} de ${estudante2.nome}`,
        tipoRelacionamento: 'family_members',
        detalhes: `Relacionamento: ${estudante1NaFamilia2.relation}`
      };
    }

    return {
      valido: false,
      motivo: 'Nenhum relacionamento encontrado na tabela family_members'
    };
  }

  /**
   * Obter lista de possíveis ajudantes para um estudante
   */
  static async obterAjudantesPossiveis(
    estudantePrincipalId: string,
    todosEstudantesIds: string[],
    excluirIds: string[] = []
  ): Promise<{
    ajudantesValidos: string[];
    ajudantesFamiliares: string[];
    detalhesValidacao: Map<string, ResultadoValidacaoPar>;
  }> {
    await this.atualizarCache();

    const ajudantesValidos: string[] = [];
    const ajudantesFamiliares: string[] = [];
    const detalhesValidacao = new Map<string, ResultadoValidacaoPar>();

    for (const candidatoId of todosEstudantesIds) {
      // Pular se é o próprio estudante ou está na lista de exclusão
      if (candidatoId === estudantePrincipalId || excluirIds.includes(candidatoId)) {
        continue;
      }

      const resultado = await this.validarPareamento(estudantePrincipalId, candidatoId);
      detalhesValidacao.set(candidatoId, resultado);

      if (resultado.valido) {
        ajudantesValidos.push(candidatoId);

        // Verificar se é relacionamento familiar
        if (resultado.tipoRelacionamento && 
            ['familiar_direto', 'irmaos', 'pai_filho', 'family_members'].includes(resultado.tipoRelacionamento)) {
          ajudantesFamiliares.push(candidatoId);
        }
      }
    }

    return {
      ajudantesValidos,
      ajudantesFamiliares,
      detalhesValidacao
    };
  }

  /**
   * Validar uma lista de pares propostos
   */
  static async validarListaPares(
    pares: Array<{ estudante1Id: string; estudante2Id: string }>
  ): Promise<{
    paresValidos: Array<{ estudante1Id: string; estudante2Id: string; detalhes: ResultadoValidacaoPar }>;
    paresInvalidos: Array<{ estudante1Id: string; estudante2Id: string; detalhes: ResultadoValidacaoPar }>;
  }> {
    const paresValidos: Array<{ estudante1Id: string; estudante2Id: string; detalhes: ResultadoValidacaoPar }> = [];
    const paresInvalidos: Array<{ estudante1Id: string; estudante2Id: string; detalhes: ResultadoValidacaoPar }> = [];

    for (const par of pares) {
      const resultado = await this.validarPareamento(par.estudante1Id, par.estudante2Id);
      
      if (resultado.valido) {
        paresValidos.push({ ...par, detalhes: resultado });
      } else {
        paresInvalidos.push({ ...par, detalhes: resultado });
      }
    }

    return { paresValidos, paresInvalidos };
  }

  /**
   * Limpar cache manualmente (útil para testes ou atualizações forçadas)
   */
  static limparCache(): void {
    this.cache.familyMembers.clear();
    this.cache.estudantesData.clear();
    this.cache.ultimaAtualizacao = 0;
  }

  /**
   * Obter estatísticas do cache
   */
  static obterEstatisticasCache(): {
    totalFamilyMembers: number;
    totalEstudantes: number;
    ultimaAtualizacao: Date | null;
    cacheValido: boolean;
  } {
    const agora = Date.now();
    const cacheValido = agora - this.cache.ultimaAtualizacao < this.CACHE_DURATION;

    return {
      totalFamilyMembers: Array.from(this.cache.familyMembers.values()).reduce((total, familia) => total + familia.length, 0),
      totalEstudantes: this.cache.estudantesData.size,
      ultimaAtualizacao: this.cache.ultimaAtualizacao > 0 ? new Date(this.cache.ultimaAtualizacao) : null,
      cacheValido
    };
  }
}
