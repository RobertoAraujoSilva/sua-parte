/**
 * Implementação das Regras S-38-T para Designações da Escola do Ministério Teocrático
 * 
 * Este módulo implementa rigorosamente as regras estabelecidas no documento S-38-T
 * para designações ministeriais em congregações das Testemunhas de Jeová.
 */

import type { EstudanteRow } from '@/types/estudantes';
import type { ParteProgramaS38T, TipoParteS38T } from '@/types/designacoes';
import { getFamilyRelationship } from '@/types/family';

// Cargos qualificados para dar discursos
export const CARGOS_QUALIFICADOS_DISCURSOS = [
  'anciao',
  'servo_ministerial', 
  'pioneiro_regular',
  'publicador_batizado'
] as const;

/**
 * Classe principal para aplicação das regras S-38-T
 */
export class RegrasS38T {
  
  /**
   * REGRA 1: Parte 3 (Leitura da Bíblia) - APENAS homens
   * Baseado no documento S-38-T, seção sobre leitura da Bíblia
   */
  static podeReceberLeituraBiblica(estudante: EstudanteRow): boolean {
    return estudante.genero === 'masculino' && estudante.ativo;
  }

  /**
   * REGRA 2: Discursos (partes 4-7) - APENAS homens qualificados
   * Baseado no documento S-38-T, seção sobre discursos ministeriais
   */
  static podedarDiscurso(estudante: EstudanteRow): boolean {
    return (
      estudante.genero === 'masculino' &&
      estudante.ativo &&
      (CARGOS_QUALIFICADOS_DISCURSOS as readonly string[]).includes(estudante.cargo as any)
    );
  }

  /**
   * REGRA 3: Demonstrações (partes 4-7) - Ambos os gêneros
   * Baseado no documento S-38-T, seção sobre demonstrações do ministério
   */
  static podeFazerDemonstracao(estudante: EstudanteRow): boolean {
    return estudante.ativo;
  }

  /**
   * REGRA 4: Orações - APENAS homens qualificados
   * Baseado no documento S-38-T, seção sobre orações públicas
   */
  static podeFazerOracao(estudante: EstudanteRow): boolean {
    return (
      estudante.genero === 'masculino' &&
      estudante.ativo &&
      (CARGOS_QUALIFICADOS_DISCURSOS as readonly string[]).includes(estudante.cargo as any)
    );
  }

  /**
   * REGRA 5: Tesouros da Palavra de Deus - APENAS homens qualificados
   * Baseado no documento S-38-T, seção sobre ensino público
   */
  static podeFazerTesouros(estudante: EstudanteRow): boolean {
    return (
      estudante.genero === 'masculino' &&
      estudante.ativo &&
      (CARGOS_QUALIFICADOS_DISCURSOS as readonly string[]).includes(estudante.cargo as any)
    );
  }

  /**
   * REGRA 6: Joias Espirituais - APENAS homens qualificados
   * Baseado no documento S-38-T, seção sobre ensino público
   */
  static podeFazerJoiasEspirituais(estudante: EstudanteRow): boolean {
    return (
      estudante.genero === 'masculino' &&
      estudante.ativo &&
      (CARGOS_QUALIFICADOS_DISCURSOS as readonly string[]).includes(estudante.cargo as any)
    );
  }

  /**
   * REGRA 7: Nossa Vida Cristã - APENAS homens qualificados
   * Baseado no documento S-38-T, seção sobre ensino público
   */
  static podeFazerVidaCrista(estudante: EstudanteRow): boolean {
    return (
      estudante.genero === 'masculino' &&
      estudante.ativo &&
      (CARGOS_QUALIFICADOS_DISCURSOS as readonly string[]).includes(estudante.cargo as any)
    );
  }

  /**
   * REGRA 8: Estudo Bíblico da Congregação - APENAS homens qualificados
   * Baseado no documento S-38-T, seção sobre condução de estudos
   */
  static podeFazerEstudoBiblico(estudante: EstudanteRow): boolean {
    return (
      estudante.genero === 'masculino' &&
      estudante.ativo &&
      (CARGOS_QUALIFICADOS_DISCURSOS as readonly string[]).includes(estudante.cargo as any)
    );
  }

  /**
   * REGRA 9: Partes do Ministério - Ambos os gêneros
   * Baseado no documento S-38-T, seção sobre demonstrações do ministério
   */
  static podeFazerParteMinisterio(estudante: EstudanteRow): boolean {
    return estudante.ativo;
  }

  /**
   * REGRA 10: Verificação de elegibilidade geral para uma parte específica
   */
  static podeReceberParte(estudante: EstudanteRow, parte: ParteProgramaS38T): boolean {
    if (!estudante.ativo) {
      return false;
    }

    // Verificar por tipo de parte ao invés de número
    switch (parte.tipo_parte) {
      case 'leitura_biblica':
        return this.podeReceberLeituraBiblica(estudante);

      case 'discurso':
        return this.podedarDiscurso(estudante);

      case 'demonstracao':
        return this.podeFazerDemonstracao(estudante);

      case 'oracao_abertura':
      case 'oracao_encerramento':
        return this.podeFazerOracao(estudante);

      case 'comentarios_iniciais':
      case 'comentarios_finais':
        return this.podeFazerOracao(estudante); // Mesmas regras das orações

      case 'tesouros_palavra':
        return this.podeFazerTesouros(estudante);

      case 'joias_espirituais':
        return this.podeFazerJoiasEspirituais(estudante);

      case 'parte_ministerio':
        return this.podeFazerParteMinisterio(estudante);

      case 'vida_crista':
        return this.podeFazerVidaCrista(estudante);

      case 'estudo_biblico_congregacao':
        return this.podeFazerEstudoBiblico(estudante);

      default:
        return false;
    }
  }

  /**
   * REGRA 11: Verificação se uma parte requer ajudante
   */
  static precisaAjudante(parte: ParteProgramaS38T): boolean {
    // Partes que precisam de ajudante
    const tiposComAjudante = ['demonstracao', 'parte_ministerio'];
    return tiposComAjudante.includes(parte.tipo_parte);
  }

  /**
   * REGRA 6: Verificação de pares de gêneros diferentes - APENAS familiares
   * Baseado no documento S-38-T, seção sobre pareamento de estudantes
   */
  static async podemFormarPar(
    estudante1: EstudanteRow, 
    estudante2: EstudanteRow
  ): Promise<{
    podem: boolean;
    motivo: string;
    ehFamiliar?: boolean;
  }> {
    // Verificar se ambos estão ativos
    if (!estudante1.ativo || !estudante2.ativo) {
      return {
        podem: false,
        motivo: 'Um ou ambos estudantes estão inativos'
      };
    }

    // REGRA 6.1: Menores de idade (< 18) devem sempre estar em pares do mesmo gênero
    const estudante1Menor = estudante1.idade && estudante1.idade < 18;
    const estudante2Menor = estudante2.idade && estudante2.idade < 18;
    
    if (estudante1Menor || estudante2Menor) {
      if (estudante1.genero !== estudante2.genero) {
        return {
          podem: false,
          motivo: 'Menores de idade devem formar pares do mesmo gênero'
        };
      }
    }

    // REGRA 6.2: Se são do mesmo gênero, sempre podem formar par
    if (estudante1.genero === estudante2.genero) {
      return {
        podem: true,
        motivo: 'Mesmo gênero - pareamento permitido'
      };
    }

    // REGRA 6.3: Gêneros diferentes - verificar relacionamento familiar
    try {
      // Verificar relacionamento via family_members
      const relacionamento = await getFamilyRelationship(estudante1.id, estudante2.id);
      
      if (relacionamento) {
        return {
          podem: true,
          motivo: `Relacionamento familiar: ${relacionamento}`,
          ehFamiliar: true
        };
      }

      // Verificar relacionamento via id_pai_mae (irmãos)
      if (estudante1.id_pai_mae && estudante2.id_pai_mae && 
          estudante1.id_pai_mae === estudante2.id_pai_mae) {
        return {
          podem: true,
          motivo: 'Irmãos (mesmo responsável)',
          ehFamiliar: true
        };
      }

      // Verificar se um é responsável pelo outro
      if (estudante1.id_pai_mae === estudante2.id || estudante2.id_pai_mae === estudante1.id) {
        return {
          podem: true,
          motivo: 'Relacionamento pai/mãe e filho(a)',
          ehFamiliar: true
        };
      }

      return {
        podem: false,
        motivo: 'Gêneros diferentes sem relacionamento familiar comprovado'
      };
    } catch (error) {
      console.error('Erro ao verificar relacionamento familiar:', error);
      return {
        podem: false,
        motivo: 'Erro ao verificar relacionamento familiar'
      };
    }
  }

  /**
   * REGRA 7: Validação completa de uma designação proposta
   */
  static async validarDesignacao(
    estudante: EstudanteRow,
    ajudante: EstudanteRow | null,
    parte: ParteProgramaS38T
  ): Promise<{
    valida: boolean;
    erros: string[];
    avisos: string[];
  }> {
    const erros: string[] = [];
    const avisos: string[] = [];

    // Validar elegibilidade do estudante principal
    if (!this.podeReceberParte(estudante, parte)) {
      erros.push(`${estudante.nome} não está qualificado para a parte ${parte.numero_parte} (${parte.tipo_parte})`);
    }

    // Validar necessidade de ajudante
    const precisaAjudante = this.precisaAjudante(parte);
    
    if (precisaAjudante && !ajudante) {
      erros.push(`Parte ${parte.numero_parte} (${parte.tipo_parte}) requer ajudante`);
    }

    if (!precisaAjudante && ajudante) {
      avisos.push(`Parte ${parte.numero_parte} (${parte.tipo_parte}) não requer ajudante, mas um foi designado`);
    }

    // Validar pareamento se há ajudante
    if (ajudante) {
      if (estudante.id === ajudante.id) {
        erros.push('Estudante não pode ser ajudante de si mesmo');
      } else {
        const resultadoPareamento = await this.podemFormarPar(estudante, ajudante);
        if (!resultadoPareamento.podem) {
          erros.push(`Pareamento inválido: ${resultadoPareamento.motivo}`);
        } else if (resultadoPareamento.ehFamiliar) {
          avisos.push(`Pareamento familiar: ${resultadoPareamento.motivo}`);
        }
      }
    }

    return {
      valida: erros.length === 0,
      erros,
      avisos
    };
  }

  /**
   * REGRA 8: Obter lista de estudantes elegíveis para uma parte específica
   */
  static obterEstudantesElegiveis(
    estudantes: EstudanteRow[],
    parte: ParteProgramaS38T,
    excluirIds: string[] = []
  ): EstudanteRow[] {
    return estudantes.filter(estudante => 
      !excluirIds.includes(estudante.id) &&
      this.podeReceberParte(estudante, parte)
    );
  }

  /**
   * REGRA 9: Obter lista de ajudantes elegíveis para um estudante
   */
  static async obterAjudantesElegiveis(
    estudantePrincipal: EstudanteRow,
    todosEstudantes: EstudanteRow[],
    excluirIds: string[] = []
  ): Promise<{
    ajudantesElegiveis: EstudanteRow[];
    ajudantesFamiliares: EstudanteRow[];
  }> {
    const ajudantesElegiveis: EstudanteRow[] = [];
    const ajudantesFamiliares: EstudanteRow[] = [];

    for (const candidato of todosEstudantes) {
      // Pular se é o próprio estudante ou está na lista de exclusão
      if (candidato.id === estudantePrincipal.id || excluirIds.includes(candidato.id)) {
        continue;
      }

      // Verificar se podem formar par
      const resultadoPareamento = await this.podemFormarPar(estudantePrincipal, candidato);
      
      if (resultadoPareamento.podem) {
        ajudantesElegiveis.push(candidato);
        
        if (resultadoPareamento.ehFamiliar) {
          ajudantesFamiliares.push(candidato);
        }
      }
    }

    return {
      ajudantesElegiveis,
      ajudantesFamiliares
    };
  }

  /**
   * REGRA 10: Verificar se um estudante pode receber múltiplas designações na mesma semana
   * Baseado no documento S-38-T - um estudante por semana
   */
  static podeReceberMultiplasDesignacoes(): boolean {
    // Regra S-38-T: Um estudante máximo por semana
    return false;
  }

  /**
   * Função utilitária para obter descrição das qualificações de um estudante
   */
  static obterQualificacoes(estudante: EstudanteRow): string[] {
    const qualificacoes: string[] = [];

    if (!estudante.ativo) {
      qualificacoes.push('Inativo');
      return qualificacoes;
    }

    if (this.podeReceberLeituraBiblica(estudante)) {
      qualificacoes.push('Leitura da Bíblia');
    }

    if (this.podedarDiscurso(estudante)) {
      qualificacoes.push('Discursos');
    }

    if (this.podeFazerDemonstracao(estudante)) {
      qualificacoes.push('Demonstrações');
    }

    return qualificacoes;
  }
}
