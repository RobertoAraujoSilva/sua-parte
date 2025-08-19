const fs = require('fs-extra');
const path = require('path');
const { supabase } = require('../config/database');

class ProgramGenerator {
  constructor() {
    this.materialsPath = path.join(__dirname, '../../docs/Oficial');
    this.programsPath = path.join(__dirname, '../../docs/Programas');
  }

  async initialize() {
    try {
      await fs.ensureDir(this.programsPath);
      console.log('✅ ProgramGenerator inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar ProgramGenerator:', error);
      throw error;
    }
  }

  // Gerar programa semanal baseado em material MWB
  async generateWeeklyProgram(materialInfo) {
    try {
      console.log(`📋 Gerando programa para: ${materialInfo.filename}`);
      
      if (materialInfo.materialType !== 'meeting_workbook') {
        throw new Error('Apenas materiais MWB podem gerar programas');
      }

      // Extrair período do nome do arquivo
      const period = materialInfo.period;
      if (!period) {
        throw new Error('Não foi possível extrair o período do material');
      }

      // Criar estrutura do programa
      const program = {
        id: `program_${period}_${materialInfo.language}`,
        semana: this.formatPeriod(period),
        periodo_inicio: this.getPeriodStart(period),
        periodo_fim: this.getPeriodEnd(period),
        idioma: materialInfo.language,
        material_origem: materialInfo.filename,
        material_caminho: materialInfo.localPath,
        status: 'rascunho',
        total_partes: 0,
        partes_geradas: [],
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      };

      // Gerar partes do programa baseado no material
      const parts = await this.generateProgramParts(materialInfo);
      program.partes_geradas = parts;
      program.total_partes = parts.length;

      // Salvar programa no banco de dados
      const savedProgram = await this.saveProgramToDatabase(program);
      
      // Salvar arquivo local
      const programFile = path.join(this.programsPath, `programa_${period}_${materialInfo.language}.json`);
      await fs.writeJson(programFile, program, { spaces: 2 });

      console.log(`✅ Programa gerado: ${savedProgram.id} com ${parts.length} partes`);
      return savedProgram;

    } catch (error) {
      console.error('❌ Erro ao gerar programa:', error);
      throw error;
    }
  }

  // Gerar partes do programa baseado no material
  async generateProgramParts(materialInfo) {
    try {
      const parts = [];
      
      // Estrutura padrão de uma reunião semanal
      const weeklyStructure = [
        {
          tipo: 'abertura',
          titulo: 'Abertura e Cântico',
          duracao: 3,
          ordem: 1,
          observacoes: 'Cântico de abertura e oração'
        },
        {
          tipo: 'estudo',
          titulo: 'Estudo Bíblico da Congregação',
          duracao: 30,
          ordem: 2,
          observacoes: 'Baseado no material da semana',
          material: materialInfo.filename
        },
        {
          tipo: 'vida',
          titulo: 'Vida e Ministério Cristão',
          duracao: 30,
          ordem: 3,
          observacoes: 'Partes práticas e designações',
          material: materialInfo.filename
        },
        {
          tipo: 'fechamento',
          titulo: 'Cântico e Oração',
          duracao: 2,
          ordem: 4,
          observacoes: 'Cântico de encerramento e oração'
        }
      ];

      // Adicionar partes específicas baseadas no material
      if (materialInfo.materialType === 'meeting_workbook') {
        // Adicionar partes específicas do MWB
        const mwbParts = await this.extractMWBParts(materialInfo);
        weeklyStructure.splice(2, 0, ...mwbParts);
      }

      // Gerar IDs únicos para cada parte
      weeklyStructure.forEach((part, index) => {
        part.id = `part_${materialInfo.period}_${index + 1}`;
        part.ordem = index + 1;
      });

      return weeklyStructure;

    } catch (error) {
      console.error('❌ Erro ao gerar partes:', error);
      throw error;
    }
  }

  // Extrair partes específicas do MWB
  async extractMWBParts(materialInfo) {
    try {
      const parts = [];
      
      // Baseado no tipo de material, gerar partes específicas
      if (materialInfo.filename.includes('mwb_E_')) {
        // Material em inglês - estrutura padrão
        parts.push(
          {
            tipo: 'leitura',
            titulo: 'Leitura da Bíblia',
            duracao: 4,
            ordem: 2,
            observacoes: 'Leitura da semana com comentários'
          },
          {
            tipo: 'revisao',
            titulo: 'Revisão da Semana',
            duracao: 10,
            ordem: 3,
            observacoes: 'Revisão das designações da semana anterior'
          },
          {
            tipo: 'designacoes',
            titulo: 'Designações da Semana',
            duracao: 15,
            ordem: 4,
            observacoes: 'Novas designações para a próxima semana'
          }
        );
      } else if (materialInfo.filename.includes('mwb_T_')) {
        // Material em português - estrutura brasileira
        parts.push(
          {
            tipo: 'leitura',
            titulo: 'Leitura da Bíblia',
            duracao: 4,
            ordem: 2,
            observacoes: 'Leitura da semana com comentários'
          },
          {
            tipo: 'revisao',
            titulo: 'Revisão da Semana',
            duracao: 10,
            ordem: 3,
            observacoes: 'Revisão das designações da semana anterior'
          },
          {
            tipo: 'designacoes',
            titulo: 'Designações da Semana',
            duracao: 15,
            ordem: 4,
            observacoes: 'Novas designações para a próxima semana'
          }
        );
      }

      return parts;

    } catch (error) {
      console.error('❌ Erro ao extrair partes MWB:', error);
      return [];
    }
  }

  // Salvar programa no banco de dados
  async saveProgramToDatabase(program) {
    try {
      const { data, error } = await supabase
        .from('programas')
        .insert([{
          semana: program.semana,
          periodo_inicio: program.periodo_inicio,
          periodo_fim: program.periodo_fim,
          idioma: program.idioma,
          material_origem: program.material_origem,
          material_caminho: program.material_caminho,
          status: program.status,
          total_partes: program.total_partes,
          criado_em: program.criado_em,
          atualizado_em: program.atualizado_em
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao salvar programa: ${error.message}`);
      }

      console.log(`✅ Programa salvo no banco: ${data.id}`);
      return data;

    } catch (error) {
      console.error('❌ Erro ao salvar programa no banco:', error);
      throw error;
    }
  }

  // Publicar programa para congregações
  async publishProgram(programId) {
    try {
      console.log(`📢 Publicando programa: ${programId}`);
      
      // Atualizar status no banco
      const { data, error } = await supabase
        .from('programas')
        .update({ 
          status: 'ativo',
          publicado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        })
        .eq('id', programId)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao publicar programa: ${error.message}`);
      }

      // Notificar congregações sobre novo programa
      await this.notifyCongregations(data);

      console.log(`✅ Programa publicado: ${programId}`);
      return data;

    } catch (error) {
      console.error('❌ Erro ao publicar programa:', error);
      throw error;
    }
  }

  // Notificar congregações sobre novo programa
  async notifyCongregations(program) {
    try {
      // Buscar todas as congregações ativas
      const { data: congregations, error } = await supabase
        .from('profiles')
        .select('id, congregacao')
        .eq('role', 'instrutor')
        .not('congregacao', 'is', null);

      if (error) {
        console.error('❌ Erro ao buscar congregações:', error);
        return;
      }

      // Agrupar por congregação
      const congregationsByGroup = {};
      congregations.forEach(profile => {
        if (!congregationsByGroup[profile.congregacao]) {
          congregationsByGroup[profile.congregacao] = [];
        }
        congregationsByGroup[profile.congregacao].push(profile.id);
      });

      console.log(`📢 Notificando ${Object.keys(congregationsByGroup).length} congregações`);
      
      // Aqui você pode implementar notificações por email, push, etc.
      // Por enquanto, apenas log
      Object.entries(congregationsByGroup).forEach(([congregation, userIds]) => {
        console.log(`📢 Congregação ${congregation}: ${userIds.length} instrutores notificados`);
      });

    } catch (error) {
      console.error('❌ Erro ao notificar congregações:', error);
    }
  }

  // Listar programas disponíveis
  async listPrograms(status = null) {
    try {
      let query = supabase
        .from('programas')
        .select('*')
        .order('criado_em', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao listar programas: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error('❌ Erro ao listar programas:', error);
      throw error;
    }
  }

  // Formatar período para exibição
  formatPeriod(period) {
    try {
      const year = period.substring(0, 4);
      const month = period.substring(4, 6);
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    } catch (error) {
      return period;
    }
  }

  // Obter data de início do período
  getPeriodStart(period) {
    try {
      const year = period.substring(0, 4);
      const month = period.substring(4, 6);
      return new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  // Obter data de fim do período
  getPeriodEnd(period) {
    try {
      const year = period.substring(0, 4);
      const month = period.substring(4, 6);
      return new Date(parseInt(year), parseInt(month), 0).toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  // Gerar programa de teste
  async generateTestProgram() {
    try {
      const testMaterial = {
        filename: 'mwb_T_202509.pdf',
        materialType: 'meeting_workbook',
        period: '202509',
        language: 'pt-BR',
        localPath: '/test/path'
      };

      return await this.generateWeeklyProgram(testMaterial);
    } catch (error) {
      console.error('❌ Erro ao gerar programa de teste:', error);
      throw error;
    }
  }
}

module.exports = ProgramGenerator;
