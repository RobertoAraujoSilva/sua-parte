import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { criarGeradorDesignacoes, salvarDesignacoes } from '@/utils/assignmentGenerator';
import type { DesignacaoGerada } from '@/types/designacoes';

export interface AssignmentGenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  generatedAssignments: DesignacaoGerada[];
  error: string | null;
}

export interface ProgramData {
  id: string;
  semana: string;
  arquivo: string;
  partes: string[];
  data_inicio_semana: string;
  mes_apostila?: string;
}

export const useAssignmentGeneration = () => {
  const [state, setState] = useState<AssignmentGenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: '',
    generatedAssignments: [],
    error: null,
  });

  const updateProgress = useCallback((progress: number, step: string) => {
    setState(prev => ({
      ...prev,
      progress,
      currentStep: step
    }));
  }, []);

  const generateAssignments = useCallback(async (
    programData: ProgramData,
    userId: string
  ): Promise<{ success: boolean; assignments?: DesignacaoGerada[]; error?: string }> => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      currentStep: 'Iniciando geração de designações...',
      error: null,
      generatedAssignments: []
    }));

    try {
      // Step 1: Load students
      updateProgress(10, 'Carregando estudantes ativos...');
      
      const { data: estudantes, error: estudantesError } = await supabase
        .from('estudantes')
        .select('*')
        .eq('user_id', userId)
        .eq('ativo', true)
        .order('nome');

      if (estudantesError) {
        throw new Error(`Erro ao carregar estudantes: ${estudantesError.message}`);
      }

      if (!estudantes || estudantes.length === 0) {
        throw new Error('Nenhum estudante ativo encontrado. Cadastre estudantes antes de gerar designações.');
      }

      console.log(`📚 Carregados ${estudantes.length} estudantes ativos`);

      // Step 2: Create assignment generator
      updateProgress(25, 'Configurando gerador de designações...');
      
      const gerador = await criarGeradorDesignacoes(userId);
      
      // Step 3: Parse program parts
      updateProgress(40, 'Analisando partes do programa...');
      
      const partesPrograma = await parsePartesPrograma(programData.partes);
      console.log('📋 Partes do programa:', partesPrograma);

      // Step 4: Generate assignments
      updateProgress(60, 'Gerando designações inteligentes...');
      
      const designacoes = await gerador.gerarDesignacoes({
        data_inicio_semana: programData.data_inicio_semana,
        partes_programa: partesPrograma,
        excluir_estudante_ids: [],
        priorizar_novos: true,
        permitir_consecutivas: false
      });

      if (designacoes.length === 0) {
        throw new Error('Não foi possível gerar designações. Verifique se há estudantes qualificados suficientes.');
      }

      console.log(`✅ Geradas ${designacoes.length} designações`);

      // Step 5: Save to database
      updateProgress(80, 'Salvando designações no banco de dados...');
      
      // First, save the program to database if it doesn't exist
      const programId = await ensureProgramExists(programData, userId);
      
      const resultadoSalvar = await salvarDesignacoes(designacoes, programId, userId);
      
      if (!resultadoSalvar.sucesso) {
        throw new Error(resultadoSalvar.erro || 'Erro ao salvar designações');
      }

      // Step 6: Update program status
      updateProgress(95, 'Atualizando status do programa...');
      
      await updateProgramStatus(programId, 'ativo');

      // Step 7: Complete
      updateProgress(100, 'Designações geradas com sucesso!');

      setState(prev => ({
        ...prev,
        isGenerating: false,
        generatedAssignments: designacoes
      }));

      toast({
        title: 'Designações Geradas!',
        description: `${designacoes.length} designações foram criadas com sucesso para "${programData.semana}".`,
      });

      return { success: true, assignments: designacoes };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }));

      toast({
        title: 'Erro ao Gerar Designações',
        description: errorMessage,
        variant: 'destructive'
      });

      return { success: false, error: errorMessage };
    }
  }, [updateProgress]);

  const resetState = useCallback(() => {
    setState({
      isGenerating: false,
      progress: 0,
      currentStep: '',
      generatedAssignments: [],
      error: null,
    });
  }, []);

  return {
    ...state,
    generateAssignments,
    resetState
  };
};

// Helper function to parse program parts into assignment format
const parsePartesPrograma = async (partes: string[]) => {
  const partesPrograma = [];
  
  // Standard JW meeting structure
  const parteTemplates = [
    { numero: 3, tipo: 'leitura_biblica', titulo: 'Leitura da Bíblia', tempo: 4, genero_restricao: 'masculino' },
    { numero: 4, tipo: 'demonstracao', titulo: 'Primeira Conversa', tempo: 3, genero_restricao: null },
    { numero: 5, tipo: 'demonstracao', titulo: 'Revisita', tempo: 4, genero_restricao: null },
    { numero: 6, tipo: 'demonstracao', titulo: 'Estudo Bíblico', tempo: 6, genero_restricao: null },
    { numero: 7, tipo: 'discurso', titulo: 'Discurso', tempo: 5, genero_restricao: 'masculino' }
  ];

  // Map program parts to assignment parts
  for (let i = 0; i < Math.min(partes.length, parteTemplates.length); i++) {
    const template = parteTemplates[i];
    const parteNome = partes[i];
    
    partesPrograma.push({
      numero_parte: template.numero,
      titulo_parte: parteNome || template.titulo,
      tipo_parte: template.tipo,
      tempo_minutos: template.tempo,
      requer_ajudante: template.tipo === 'demonstracao',
      restricao_genero: template.genero_restricao
    });
  }

  return partesPrograma;
};

// Helper function to ensure program exists in database
const ensureProgramExists = async (programData: ProgramData, userId: string): Promise<string> => {
  // Check if program already exists
  const { data: existingProgram } = await supabase
    .from('programas')
    .select('id')
    .eq('user_id', userId)
    .eq('data_inicio_semana', programData.data_inicio_semana)
    .single();

  if (existingProgram) {
    return existingProgram.id;
  }

  // Create new program
  const { data: newProgram, error } = await supabase
    .from('programas')
    .insert({
      user_id: userId,
      data_inicio_semana: programData.data_inicio_semana,
      mes_apostila: programData.mes_apostila || null,
      partes: programData.partes,
      status: 'ativo'
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Erro ao criar programa: ${error.message}`);
  }

  return newProgram.id;
};

// Helper function to update program status
const updateProgramStatus = async (programId: string, status: 'ativo' | 'inativo' | 'arquivado') => {
  const { error } = await supabase
    .from('programas')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', programId);

  if (error) {
    console.error('Erro ao atualizar status do programa:', error);
  }
};
