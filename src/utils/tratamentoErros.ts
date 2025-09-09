/**
 * Sistema de Tratamento de Erros e Feedback Específico
 * 
 * Este módulo implementa tratamento robusto de erros para o sistema de designações,
 * fornecendo mensagens específicas e ações sugeridas para diferentes cenários.
 */

import { toast } from '@/components/ui/use-toast';

/**
 * Tipos de erro do sistema de designações
 */
export type TipoErroDesignacao = 
  | 'sem_estudantes_elegiveis'
  | 'conflito_designacao'
  | 'falha_rede'
  | 'permissao_negada'
  | 'programa_inexistente'
  | 'dados_invalidos'
  | 'validacao_s38t'
  | 'relacionamento_familiar'
  | 'estudante_inativo'
  | 'sobrecarga_estudante'
  | 'erro_interno';

/**
 * Interface para erro estruturado
 */
export interface ErroEstruturado {
  tipo: TipoErroDesignacao;
  titulo: string;
  mensagem: string;
  acoesSugeridas: string[];
  detalhes?: any;
  recuperavel: boolean;
}

/**
 * Interface para resultado de operação com tratamento de erro
 */
export interface ResultadoOperacao<T = any> {
  sucesso: boolean;
  dados?: T;
  erro?: ErroEstruturado;
}

/**
 * Classe principal para tratamento de erros
 */
export class TratadorErros {
  
  /**
   * Mapeia erros conhecidos para estruturas padronizadas
   */
  private static mapaErros: Record<string, Partial<ErroEstruturado>> = {
    // Erros de rede
    'NetworkError': {
      tipo: 'falha_rede',
      titulo: 'Erro de Conexão',
      mensagem: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
      acoesSugeridas: [
        'Verifique sua conexão com a internet',
        'Tente novamente em alguns segundos',
        'Se o problema persistir, contate o suporte'
      ],
      recuperavel: true
    },
    
    // Erros de autenticação
    'AuthError': {
      tipo: 'permissao_negada',
      titulo: 'Erro de Autenticação',
      mensagem: 'Sua sessão expirou ou você não tem permissão para esta ação.',
      acoesSugeridas: [
        'Faça login novamente',
        'Verifique se você tem permissão de instrutor',
        'Contate o administrador se necessário'
      ],
      recuperavel: true
    },

    // Erros do Supabase
    'PostgrestError': {
      tipo: 'dados_invalidos',
      titulo: 'Erro de Dados',
      mensagem: 'Os dados fornecidos são inválidos ou não atendem aos requisitos.',
      acoesSugeridas: [
        'Verifique se todos os campos obrigatórios estão preenchidos',
        'Confirme se os dados estão no formato correto',
        'Tente novamente com dados diferentes'
      ],
      recuperavel: true
    }
  };

  /**
   * Processa um erro e retorna estrutura padronizada
   */
  static processarErro(error: any, contexto?: string): ErroEstruturado {
    // Se já é um erro estruturado, retornar como está
    if (error && typeof error === 'object' && error.tipo) {
      return error as ErroEstruturado;
    }

    // Extrair informações do erro
    const mensagemOriginal = error?.message || error?.toString() || 'Erro desconhecido';
    const nomeErro = error?.name || error?.constructor?.name || 'UnknownError';
    
    // Buscar mapeamento conhecido
    const erroMapeado = this.mapaErros[nomeErro];
    
    if (erroMapeado) {
      return {
        ...erroMapeado,
        mensagem: erroMapeado.mensagem || mensagemOriginal,
        detalhes: { original: error, contexto },
        recuperavel: erroMapeado.recuperavel ?? true
      } as ErroEstruturado;
    }

    // Analisar mensagem para identificar tipo específico
    const tipoIdentificado = this.identificarTipoPorMensagem(mensagemOriginal);
    
    return this.criarErroEspecifico(tipoIdentificado, mensagemOriginal, error, contexto);
  }

  /**
   * Identifica tipo de erro pela mensagem
   */
  private static identificarTipoPorMensagem(mensagem: string): TipoErroDesignacao {
    const mensagemLower = mensagem.toLowerCase();

    if (mensagemLower.includes('estudante') && mensagemLower.includes('elegível')) {
      return 'sem_estudantes_elegiveis';
    }
    
    if (mensagemLower.includes('conflito') || mensagemLower.includes('duplicado')) {
      return 'conflito_designacao';
    }
    
    if (mensagemLower.includes('rede') || mensagemLower.includes('network') || mensagemLower.includes('timeout')) {
      return 'falha_rede';
    }
    
    if (mensagemLower.includes('permissão') || mensagemLower.includes('autorização') || mensagemLower.includes('unauthorized')) {
      return 'permissao_negada';
    }
    
    if (mensagemLower.includes('programa') && mensagemLower.includes('não encontrado')) {
      return 'programa_inexistente';
    }
    
    if (mensagemLower.includes('s-38-t') || mensagemLower.includes('regra')) {
      return 'validacao_s38t';
    }
    
    if (mensagemLower.includes('familiar') || mensagemLower.includes('parentesco')) {
      return 'relacionamento_familiar';
    }
    
    if (mensagemLower.includes('inativo')) {
      return 'estudante_inativo';
    }
    
    if (mensagemLower.includes('sobrecarga') || mensagemLower.includes('múltiplas designações')) {
      return 'sobrecarga_estudante';
    }

    return 'erro_interno';
  }

  /**
   * Cria erro específico baseado no tipo identificado
   */
  private static criarErroEspecifico(
    tipo: TipoErroDesignacao, 
    mensagemOriginal: string, 
    error: any, 
    contexto?: string
  ): ErroEstruturado {
    const definicoes: Record<TipoErroDesignacao, Omit<ErroEstruturado, 'detalhes'>> = {
      sem_estudantes_elegiveis: {
        tipo: 'sem_estudantes_elegiveis',
        titulo: 'Nenhum Estudante Elegível',
        mensagem: 'Não há estudantes elegíveis para uma ou mais partes do programa.',
        acoesSugeridas: [
          'Verifique se há estudantes ativos cadastrados',
          'Confirme se os estudantes têm as qualificações necessárias',
          'Considere ajustar as regras de elegibilidade temporariamente',
          'Adicione mais estudantes ao sistema'
        ],
        recuperavel: true
      },

      conflito_designacao: {
        tipo: 'conflito_designacao',
        titulo: 'Conflito de Designações',
        mensagem: 'Foram detectados conflitos nas designações propostas.',
        acoesSugeridas: [
          'Revise as designações na prévia',
          'Verifique se algum estudante foi designado múltiplas vezes',
          'Considere regenerar as designações',
          'Ajuste manualmente as designações conflitantes'
        ],
        recuperavel: true
      },

      falha_rede: {
        tipo: 'falha_rede',
        titulo: 'Falha de Conexão',
        mensagem: 'Não foi possível conectar ao servidor.',
        acoesSugeridas: [
          'Verifique sua conexão com a internet',
          'Tente novamente em alguns segundos',
          'Recarregue a página se necessário',
          'Contate o suporte se o problema persistir'
        ],
        recuperavel: true
      },

      permissao_negada: {
        tipo: 'permissao_negada',
        titulo: 'Permissão Negada',
        mensagem: 'Você não tem permissão para realizar esta ação.',
        acoesSugeridas: [
          'Verifique se você está logado como instrutor',
          'Faça login novamente se necessário',
          'Contate o administrador para verificar suas permissões',
          'Certifique-se de que sua conta está ativa'
        ],
        recuperavel: true
      },

      programa_inexistente: {
        tipo: 'programa_inexistente',
        titulo: 'Programa Não Encontrado',
        mensagem: 'O programa selecionado não foi encontrado ou não está acessível.',
        acoesSugeridas: [
          'Verifique se o programa ainda existe',
          'Confirme se você tem acesso ao programa',
          'Tente selecionar outro programa',
          'Crie um novo programa se necessário'
        ],
        recuperavel: true
      },

      dados_invalidos: {
        tipo: 'dados_invalidos',
        titulo: 'Dados Inválidos',
        mensagem: 'Os dados fornecidos são inválidos ou estão incompletos.',
        acoesSugeridas: [
          'Verifique se todos os campos obrigatórios estão preenchidos',
          'Confirme se os dados estão no formato correto',
          'Revise as informações inseridas',
          'Tente novamente com dados válidos'
        ],
        recuperavel: true
      },

      validacao_s38t: {
        tipo: 'validacao_s38t',
        titulo: 'Violação das Regras S-38-T',
        mensagem: 'As designações propostas violam uma ou mais regras da Escola do Ministério Teocrático.',
        acoesSugeridas: [
          'Revise as regras S-38-T aplicáveis',
          'Verifique os relacionamentos familiares cadastrados',
          'Confirme as qualificações dos estudantes',
          'Ajuste manualmente as designações problemáticas'
        ],
        recuperavel: true
      },

      relacionamento_familiar: {
        tipo: 'relacionamento_familiar',
        titulo: 'Erro de Relacionamento Familiar',
        mensagem: 'Não foi possível validar os relacionamentos familiares necessários.',
        acoesSugeridas: [
          'Verifique se os relacionamentos familiares estão cadastrados',
          'Confirme os emails dos familiares',
          'Atualize as informações de família se necessário',
          'Use apenas pares do mesmo gênero se houver dúvidas'
        ],
        recuperavel: true
      },

      estudante_inativo: {
        tipo: 'estudante_inativo',
        titulo: 'Estudante Inativo',
        mensagem: 'Um ou mais estudantes selecionados estão inativos.',
        acoesSugeridas: [
          'Ative os estudantes necessários',
          'Verifique o status dos estudantes no cadastro',
          'Remova estudantes inativos das designações',
          'Atualize a lista de estudantes ativos'
        ],
        recuperavel: true
      },

      sobrecarga_estudante: {
        tipo: 'sobrecarga_estudante',
        titulo: 'Sobrecarga de Estudante',
        mensagem: 'Um estudante foi designado para múltiplas partes na mesma semana.',
        acoesSugeridas: [
          'Revise a distribuição de designações',
          'Considere usar mais estudantes diferentes',
          'Verifique se há estudantes suficientes cadastrados',
          'Ajuste manualmente para balancear melhor'
        ],
        recuperavel: true
      },

      erro_interno: {
        tipo: 'erro_interno',
        titulo: 'Erro Interno do Sistema',
        mensagem: mensagemOriginal || 'Ocorreu um erro interno inesperado.',
        acoesSugeridas: [
          'Tente novamente em alguns segundos',
          'Recarregue a página se necessário',
          'Verifique se todos os dados estão corretos',
          'Contate o suporte técnico se o problema persistir'
        ],
        recuperavel: false
      }
    };

    const definicao = definicoes[tipo];
    
    return {
      ...definicao,
      detalhes: { original: error, contexto, mensagemOriginal }
    };
  }

  /**
   * Exibe toast com erro formatado
   */
  static exibirErro(erro: ErroEstruturado): void {
    toast({
      title: erro.titulo,
      description: erro.mensagem,
      variant: "destructive",
    });
  }

  /**
   * Exibe toast com ações sugeridas
   */
  static exibirAcoesSugeridas(erro: ErroEstruturado): void {
    const acoes = erro.acoesSugeridas.slice(0, 3).join(' • ');
    
    toast({
      title: "Ações Sugeridas",
      description: acoes,
      duration: 8000,
    });
  }

  /**
   * Wrapper para operações que podem falhar
   */
  static async executarComTratamento<T>(
    operacao: () => Promise<T>,
    contexto?: string
  ): Promise<ResultadoOperacao<T>> {
    try {
      const dados = await operacao();
      return { sucesso: true, dados };
    } catch (error) {
      const erroProcessado = this.processarErro(error, contexto);
      return { sucesso: false, erro: erroProcessado };
    }
  }

  /**
   * Log estruturado de erros para debugging
   */
  static logErro(erro: ErroEstruturado, contexto?: string): void {
    console.group(`🚨 Erro: ${erro.titulo}`);
    console.error('Tipo:', erro.tipo);
    console.error('Mensagem:', erro.mensagem);
    console.error('Recuperável:', erro.recuperavel);
    console.error('Contexto:', contexto);
    console.error('Detalhes:', erro.detalhes);
    console.error('Ações Sugeridas:', erro.acoesSugeridas);
    console.groupEnd();
  }
}
