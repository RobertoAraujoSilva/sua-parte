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
      // Step 0: Set program status to generating
      await updateProgramAssignmentStatus(programData.id, 'generating');

      // Step 1: Load students
      updateProgress(10, 'Carregando estudantes ativos...');

      const { data: estudantes, error: estudantesError } = await supabase
        .from('estudantes')
        .select('*')
        .eq('user_id', userId as any)
        .eq('ativo', true as any)
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
        id_programa: programData.id,
        partes: partesPrograma,
        excluir_estudante_ids: [],
        preferir_pares_familiares: false
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

      // Step 6: Update program assignment status
      updateProgress(95, 'Atualizando status do programa...');

      await updateProgramAssignmentStatus(programId, 'generated', designacoes.length);

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

      // Set program status to failed
      try {
        await updateProgramAssignmentStatus(programData.id, 'failed');
      } catch (statusError) {
        console.error('Error updating program status to failed:', statusError);
      }

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

  console.log('📋 Parsing program parts:', partes);

  // Complete JW meeting structure following Watchtower format
  const parteTemplates = [
    // Opening section
    { numero: 1, tipo: 'oracao_abertura', titulo: 'Oração de Abertura', tempo: 1, genero_restricao: 'masculino' },
    { numero: 2, tipo: 'comentarios_iniciais', titulo: 'Comentários Iniciais', tempo: 1, genero_restricao: 'masculino' },

    // Treasures from God's Word section
    { numero: 3, tipo: 'tesouros_palavra', titulo: 'Tesouros da Palavra de Deus', tempo: 10, genero_restricao: 'masculino' },
    { numero: 4, tipo: 'joias_espirituais', titulo: 'Joias Espirituais', tempo: 10, genero_restricao: 'masculino' },
    { numero: 5, tipo: 'leitura_biblica', titulo: 'Leitura da Bíblia', tempo: 4, genero_restricao: 'masculino' },

    // Apply Yourself to Ministry section (3 parts)
    { numero: 6, tipo: 'parte_ministerio', titulo: 'Primeira Conversa', tempo: 3, genero_restricao: null },
    { numero: 7, tipo: 'parte_ministerio', titulo: 'Revisita', tempo: 4, genero_restricao: null },
    { numero: 8, tipo: 'parte_ministerio', titulo: 'Estudo Bíblico', tempo: 5, genero_restricao: null },

    // Our Christian Life section
    { numero: 9, tipo: 'vida_crista', titulo: 'Nossa Vida Cristã', tempo: 15, genero_restricao: 'masculino' },
    { numero: 10, tipo: 'estudo_biblico_congregacao', titulo: 'Estudo Bíblico da Congregação', tempo: 30, genero_restricao: 'masculino' },

    // Closing section
    { numero: 11, tipo: 'comentarios_finais', titulo: 'Comentários Finais', tempo: 3, genero_restricao: 'masculino' },
    { numero: 12, tipo: 'oracao_encerramento', titulo: 'Oração de Encerramento', tempo: 1, genero_restricao: 'masculino' }
  ];

  // Create assignments for all parts of the complete meeting structure
  for (const template of parteTemplates) {
    // Use specific titles from program parts if available, otherwise use template
    let titulo = template.titulo;
    let tempo = template.tempo;

    // Enhanced mapping for parsed content from JW.org
    if (partes.length > 0) {
      // Try to find matching part by content analysis
      const matchingPart = partes.find(parte => {
        const parteLower = parte.toLowerCase();

        // Match by type keywords
        if (template.tipo === 'tesouros_palavra' &&
            (parteLower.includes('tesouros') || parteLower.includes('sábios') || parteLower.includes('princípios'))) {
          return true;
        }
        if (template.tipo === 'joias_espirituais' &&
            (parteLower.includes('joias') || parteLower.includes('espirituais'))) {
          return true;
        }
        if (template.tipo === 'leitura_biblica' &&
            (parteLower.includes('leitura') || parteLower.includes('pro.') || parteLower.includes('prov'))) {
          return true;
        }
        if (template.tipo === 'parte_ministerio' &&
            (parteLower.includes('conversa') || parteLower.includes('interesse') || parteLower.includes('discurso'))) {
          return true;
        }
        if (template.tipo === 'vida_crista' &&
            (parteLower.includes('necessidades') || parteLower.includes('locais'))) {
          return true;
        }
        if (template.tipo === 'estudo_biblico_congregacao' &&
            (parteLower.includes('estudo') && parteLower.includes('congregação'))) {
          return true;
        }

        return false;
      });

      if (matchingPart) {
        // Extract title and timing from matched part
        titulo = matchingPart.replace(/\(\d+\s*min\)/i, '').trim();

        // Extract timing if present
        const timeMatch = matchingPart.match(/\((\d+)\s*min\)/i);
        if (timeMatch) {
          tempo = parseInt(timeMatch[1]);
        }
      } else {
        // Fallback to simple index-based mapping for basic imports
        if (template.tipo === 'tesouros_palavra' && partes[0]) {
          titulo = partes[0];
        } else if (template.tipo === 'parte_ministerio' && partes[1]) {
          titulo = `${partes[1]} - ${template.titulo}`;
        } else if (template.tipo === 'vida_crista' && partes[2]) {
          titulo = partes[2];
        }
      }
    }

    partesPrograma.push({
      numero_parte: template.numero,
      titulo_parte: titulo,
      tipo_parte: template.tipo,
      tempo_minutos: tempo,
      requer_ajudante: template.tipo === 'parte_ministerio',
      restricao_genero: template.genero_restricao
    });
  }

  console.log('✅ Generated program structure:', partesPrograma.map(p => ({
    numero: p.numero_parte,
    titulo: p.titulo_parte,
    tipo: p.tipo_parte,
    tempo: p.tempo_minutos
  })));

  return partesPrograma;
};

// Helper function to ensure program exists in database
const ensureProgramExists = async (programData: ProgramData, userId: string): Promise<string> => {
  // Check if program already exists
  const { data: existingProgram } = await supabase
    .from('programas')
    .select('id')
    .eq('user_id', userId as any)
    .eq('data_inicio_semana', programData.data_inicio_semana as any)
    .single();

  if (existingProgram) {
    return (existingProgram as any).id;
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
    } as any)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Erro ao criar programa: ${error.message}`);
  }

  return (newProgram as any).id;
};

// Helper function to update program assignment status
const updateProgramAssignmentStatus = async (
  programId: string,
  assignmentStatus: 'pending' | 'generating' | 'generated' | 'failed',
  totalAssignments?: number
) => {
  const updateData: any = {
    assignment_status: assignmentStatus,
    updated_at: new Date().toISOString()
  };

  if (assignmentStatus === 'generated') {
    updateData.assignments_generated_at = new Date().toISOString();
    if (totalAssignments) {
      updateData.total_assignments_generated = totalAssignments;
    }
  }

  const { error } = await supabase
    .from('programas')
    .update(updateData)
    .eq('id', programId as any);

  if (error) {
    console.error('Error updating program assignment status:', error);
    throw new Error(`Erro ao atualizar status de designações do programa: ${error.message}`);
  }
};
