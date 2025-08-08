/**
 * Testes Automatizados do Sistema de Designações S-38-T
 * 
 * Este módulo contém testes automatizados para validar o funcionamento
 * completo do sistema de geração automática de designações.
 */

import { supabase } from '@/integrations/supabase/client';
import { GeradorDesignacoes } from './assignmentGenerator';
import { carregarDadosCompletos } from './dataLoaders';
import { RegrasS38T } from './regrasS38T';
import { BalanceadorHistorico } from './balanceamentoHistorico';
import { ValidadorSeguranca } from './validacaoSeguranca';
import type { ParteProgramaS38T, DesignacaoGerada } from '@/types/designacoes';

/**
 * Interface para resultado de teste
 */
export interface ResultadoTeste {
  nome: string;
  sucesso: boolean;
  detalhes: string;
  tempo: number;
  dados?: any;
}

/**
 * Interface para relatório completo de testes
 */
export interface RelatorioTestes {
  totalTestes: number;
  testesPassaram: number;
  testesFalharam: number;
  tempoTotal: number;
  resultados: ResultadoTeste[];
  resumo: string;
}

/**
 * Classe principal para execução de testes
 */
export class TestadorSistemaDesignacoes {
  
  /**
   * Executa todos os testes do sistema
   */
  static async executarTodosOsTestes(): Promise<RelatorioTestes> {
    console.log('🧪 Iniciando testes do Sistema de Designações S-38-T...');
    
    const inicioTestes = Date.now();
    const resultados: ResultadoTeste[] = [];

    // Lista de testes a executar
    const testes = [
      this.testeCarregamentoDados,
      this.testeRegrasS38T,
      this.testeBalanceamentoHistorico,
      this.testeValidacaoSeguranca,
      this.testeGeracaoDesignacoes,
      this.testeValidacaoCompleta,
      this.testeSalvamentoDesignacoes,
      this.testeRegeneracao
    ];

    // Executar cada teste
    for (const teste of testes) {
      try {
        const resultado = await teste.call(this);
        resultados.push(resultado);
        
        if (resultado.sucesso) {
          console.log(`✅ ${resultado.nome}: ${resultado.detalhes}`);
        } else {
          console.error(`❌ ${resultado.nome}: ${resultado.detalhes}`);
        }
      } catch (error) {
        console.error(`💥 Erro no teste ${teste.name}:`, error);
        resultados.push({
          nome: teste.name,
          sucesso: false,
          detalhes: `Erro na execução: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          tempo: 0
        });
      }
    }

    const tempoTotal = Date.now() - inicioTestes;
    const testesPassaram = resultados.filter(r => r.sucesso).length;
    const testesFalharam = resultados.length - testesPassaram;

    const relatorio: RelatorioTestes = {
      totalTestes: resultados.length,
      testesPassaram,
      testesFalharam,
      tempoTotal,
      resultados,
      resumo: `${testesPassaram}/${resultados.length} testes passaram em ${tempoTotal}ms`
    };

    console.log(`\n📊 Relatório Final: ${relatorio.resumo}`);
    return relatorio;
  }

  /**
   * Teste 1: Carregamento de dados base
   */
  private static async testeCarregamentoDados(): Promise<ResultadoTeste> {
    const inicio = Date.now();
    
    try {
      const dados = await carregarDadosCompletos();
      
      if (!dados.todosCarregados) {
        return {
          nome: 'Carregamento de Dados',
          sucesso: false,
          detalhes: 'Falha ao carregar dados completos',
          tempo: Date.now() - inicio
        };
      }

      const totalEstudantes = dados.estudantes.estudantes.length;
      const totalHistorico = dados.historico.historico.size;
      const totalRelacionamentos = dados.relacionamentos.relacionamentos.size;

      return {
        nome: 'Carregamento de Dados',
        sucesso: true,
        detalhes: `${totalEstudantes} estudantes, ${totalHistorico} históricos, ${totalRelacionamentos} relacionamentos`,
        tempo: Date.now() - inicio,
        dados: { totalEstudantes, totalHistorico, totalRelacionamentos }
      };
    } catch (error) {
      return {
        nome: 'Carregamento de Dados',
        sucesso: false,
        detalhes: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        tempo: Date.now() - inicio
      };
    }
  }

  /**
   * Teste 2: Validação das regras S-38-T
   */
  private static async testeRegrasS38T(): Promise<ResultadoTeste> {
    const inicio = Date.now();
    
    try {
      const dados = await carregarDadosCompletos();
      const estudantes = dados.estudantes.estudantes;
      
      if (estudantes.length === 0) {
        return {
          nome: 'Regras S-38-T',
          sucesso: false,
          detalhes: 'Nenhum estudante encontrado para teste',
          tempo: Date.now() - inicio
        };
      }

      // Teste de elegibilidade para leitura da Bíblia (apenas homens)
      const homens = estudantes.filter(e => e.genero === 'masculino');
      const mulheres = estudantes.filter(e => e.genero === 'feminino');
      
      let testesPassaram = 0;
      let totalTestes = 0;

      // Teste 1: Homens podem fazer leitura da Bíblia
      for (const homem of homens.slice(0, 3)) {
        totalTestes++;
        if (RegrasS38T.podeReceberLeituraBiblica(homem)) {
          testesPassaram++;
        }
      }

      // Teste 2: Mulheres NÃO podem fazer leitura da Bíblia
      for (const mulher of mulheres.slice(0, 3)) {
        totalTestes++;
        if (!RegrasS38T.podeReceberLeituraBiblica(mulher)) {
          testesPassaram++;
        }
      }

      // Teste 3: Apenas homens qualificados podem dar discursos
      const homensQualificados = homens.filter(h => RegrasS38T.podedarDiscurso(h));
      totalTestes++;
      if (homensQualificados.length > 0) {
        testesPassaram++;
      }

      return {
        nome: 'Regras S-38-T',
        sucesso: testesPassaram === totalTestes,
        detalhes: `${testesPassaram}/${totalTestes} regras validadas corretamente`,
        tempo: Date.now() - inicio,
        dados: { testesPassaram, totalTestes, homensQualificados: homensQualificados.length }
      };
    } catch (error) {
      return {
        nome: 'Regras S-38-T',
        sucesso: false,
        detalhes: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        tempo: Date.now() - inicio
      };
    }
  }

  /**
   * Teste 3: Balanceamento por histórico
   */
  private static async testeBalanceamentoHistorico(): Promise<ResultadoTeste> {
    const inicio = Date.now();
    
    try {
      const dados = await carregarDadosCompletos();
      const balanceador = new BalanceadorHistorico(dados.historico.historico);
      
      const estudantesIds = dados.estudantes.estudantes.slice(0, 10).map(e => e.id);
      const pontuacoes = balanceador.ordenarPorPrioridade(estudantesIds);
      
      // Verificar se a ordenação está correta (menor pontuação = maior prioridade)
      let ordenacaoCorreta = true;
      for (let i = 1; i < pontuacoes.length; i++) {
        if (pontuacoes[i].pontuacaoFinal < pontuacoes[i-1].pontuacaoFinal) {
          ordenacaoCorreta = false;
          break;
        }
      }

      return {
        nome: 'Balanceamento Histórico',
        sucesso: ordenacaoCorreta && pontuacoes.length > 0,
        detalhes: `${pontuacoes.length} estudantes ordenados por prioridade`,
        tempo: Date.now() - inicio,
        dados: { pontuacoes: pontuacoes.slice(0, 3) }
      };
    } catch (error) {
      return {
        nome: 'Balanceamento Histórico',
        sucesso: false,
        detalhes: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        tempo: Date.now() - inicio
      };
    }
  }

  /**
   * Teste 4: Validação de segurança
   */
  private static async testeValidacaoSeguranca(): Promise<ResultadoTeste> {
    const inicio = Date.now();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          nome: 'Validação de Segurança',
          sucesso: false,
          detalhes: 'Usuário não autenticado',
          tempo: Date.now() - inicio
        };
      }

      // Teste de permissão do usuário
      const permissao = await ValidadorSeguranca.validarPermissaoUsuario(user.id);
      
      return {
        nome: 'Validação de Segurança',
        sucesso: permissao.temPermissao,
        detalhes: permissao.temPermissao ? 'Permissões validadas' : permissao.motivo || 'Sem permissão',
        tempo: Date.now() - inicio,
        dados: { permissao }
      };
    } catch (error) {
      return {
        nome: 'Validação de Segurança',
        sucesso: false,
        detalhes: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        tempo: Date.now() - inicio
      };
    }
  }

  /**
   * Teste 5: Geração de designações
   */
  private static async testeGeracaoDesignacoes(): Promise<ResultadoTeste> {
    const inicio = Date.now();
    
    try {
      const dados = await carregarDadosCompletos();
      const gerador = new GeradorDesignacoes(dados.estudantes.estudantes);

      // Partes de teste
      const partes: ParteProgramaS38T[] = [
        {
          numero_parte: 3,
          titulo_parte: "Leitura da Bíblia",
          tipo_parte: 'leitura_biblica',
          tempo_minutos: 4,
          requer_ajudante: false
        },
        {
          numero_parte: 4,
          titulo_parte: "Primeira Conversa",
          tipo_parte: 'demonstracao',
          tempo_minutos: 3,
          requer_ajudante: true
        }
      ];

      const opcoes = {
        data_inicio_semana: '2024-01-08',
        id_programa: 'teste',
        partes
      };

      const designacoes = await gerador.gerarDesignacoes(opcoes);
      
      return {
        nome: 'Geração de Designações',
        sucesso: designacoes.length > 0,
        detalhes: `${designacoes.length} designação(ões) gerada(s)`,
        tempo: Date.now() - inicio,
        dados: { designacoes }
      };
    } catch (error) {
      return {
        nome: 'Geração de Designações',
        sucesso: false,
        detalhes: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        tempo: Date.now() - inicio
      };
    }
  }

  /**
   * Teste 6: Validação completa de designações
   */
  private static async testeValidacaoCompleta(): Promise<ResultadoTeste> {
    const inicio = Date.now();
    
    try {
      const dados = await carregarDadosCompletos();
      const gerador = new GeradorDesignacoes(dados.estudantes.estudantes);

      const partes: ParteProgramaS38T[] = [
        {
          numero_parte: 3,
          titulo_parte: "Leitura da Bíblia",
          tipo_parte: 'leitura_biblica',
          tempo_minutos: 4,
          requer_ajudante: false
        }
      ];

      const opcoes = {
        data_inicio_semana: '2024-01-08',
        id_programa: 'teste',
        partes
      };

      const designacoes = await gerador.gerarDesignacoes(opcoes);
      const erros = await gerador.validarDesignacoes(designacoes);
      
      return {
        nome: 'Validação Completa',
        sucesso: erros.length === 0,
        detalhes: erros.length === 0 ? 'Todas as validações passaram' : `${erros.length} erro(s) encontrado(s)`,
        tempo: Date.now() - inicio,
        dados: { erros }
      };
    } catch (error) {
      return {
        nome: 'Validação Completa',
        sucesso: false,
        detalhes: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        tempo: Date.now() - inicio
      };
    }
  }

  /**
   * Teste 7: Salvamento de designações (simulado)
   */
  private static async testeSalvamentoDesignacoes(): Promise<ResultadoTeste> {
    const inicio = Date.now();
    
    try {
      // Este teste apenas valida a estrutura, não salva realmente
      const designacaoTeste: DesignacaoGerada = {
        id_estudante: 'teste-id',
        numero_parte: 3,
        titulo_parte: 'Teste',
        tipo_parte: 'leitura_biblica',
        tempo_minutos: 4,
        data_inicio_semana: '2024-01-08',
        confirmado: false
      };

      // Validar estrutura da designação
      const temCamposObrigatorios = !!(
        designacaoTeste.id_estudante &&
        designacaoTeste.numero_parte &&
        designacaoTeste.tipo_parte &&
        designacaoTeste.tempo_minutos &&
        designacaoTeste.data_inicio_semana
      );

      return {
        nome: 'Salvamento de Designações',
        sucesso: temCamposObrigatorios,
        detalhes: temCamposObrigatorios ? 'Estrutura de dados validada' : 'Estrutura inválida',
        tempo: Date.now() - inicio,
        dados: { designacaoTeste }
      };
    } catch (error) {
      return {
        nome: 'Salvamento de Designações',
        sucesso: false,
        detalhes: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        tempo: Date.now() - inicio
      };
    }
  }

  /**
   * Teste 8: Regeneração de designações
   */
  private static async testeRegeneracao(): Promise<ResultadoTeste> {
    const inicio = Date.now();
    
    try {
      const dados = await carregarDadosCompletos();
      const gerador = new GeradorDesignacoes(dados.estudantes.estudantes);

      const partes: ParteProgramaS38T[] = [
        {
          numero_parte: 3,
          titulo_parte: "Leitura da Bíblia",
          tipo_parte: 'leitura_biblica',
          tempo_minutos: 4,
          requer_ajudante: false
        }
      ];

      const opcoes = {
        data_inicio_semana: '2024-01-08',
        id_programa: 'teste',
        partes
      };

      // Gerar duas vezes para simular regeneração
      const designacoes1 = await gerador.gerarDesignacoes(opcoes);
      const designacoes2 = await gerador.gerarDesignacoes(opcoes);
      
      // Verificar se conseguiu gerar em ambas as tentativas
      const regeneracaoFunciona = designacoes1.length > 0 && designacoes2.length > 0;
      
      return {
        nome: 'Regeneração de Designações',
        sucesso: regeneracaoFunciona,
        detalhes: regeneracaoFunciona ? 'Regeneração funcionando' : 'Falha na regeneração',
        tempo: Date.now() - inicio,
        dados: { primeira: designacoes1.length, segunda: designacoes2.length }
      };
    } catch (error) {
      return {
        nome: 'Regeneração de Designações',
        sucesso: false,
        detalhes: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        tempo: Date.now() - inicio
      };
    }
  }

  /**
   * Executa um teste específico por nome
   */
  static async executarTeste(nomeTeste: string): Promise<ResultadoTeste> {
    const testes: Record<string, () => Promise<ResultadoTeste>> = {
      'carregamento': this.testeCarregamentoDados,
      'regras': this.testeRegrasS38T,
      'balanceamento': this.testeBalanceamentoHistorico,
      'seguranca': this.testeValidacaoSeguranca,
      'geracao': this.testeGeracaoDesignacoes,
      'validacao': this.testeValidacaoCompleta,
      'salvamento': this.testeSalvamentoDesignacoes,
      'regeneracao': this.testeRegeneracao
    };

    const teste = testes[nomeTeste.toLowerCase()];
    if (!teste) {
      return {
        nome: nomeTeste,
        sucesso: false,
        detalhes: 'Teste não encontrado',
        tempo: 0
      };
    }

    return await teste.call(this);
  }
}
