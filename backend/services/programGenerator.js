const fs = require('fs-extra');
const path = require('path');

class ProgramGenerator {
  constructor(dataStore, options = {}) {
    this.dataStore = dataStore;
    this.materialsPath = path.join(__dirname, '../../docs/Oficial');
    this.programsPath = path.join(__dirname, '../../docs/Programas');
    
    // Offline mode configuration
    this.offlineMode = options.offlineMode !== false; // Default to true for offline operation
    this.enableLocalStorage = options.enableLocalStorage !== false; // Default to true
    this.enableNotifications = options.enableNotifications !== false; // Default to true
    
    console.log(`🔧 ProgramGenerator initialized in ${this.offlineMode ? 'OFFLINE' : 'ONLINE'} mode`);
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
  async generateWeeklyProgram(materialInfo, congregacaoId = 'default') {
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
        congregacao_id: congregacaoId,
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
      // Ensure material reference is local in offline mode
      const materialReference = this.offlineMode ? 
        this.ensureLocalMaterialReference(program.material_origem) : 
        program.material_origem;

      const programData = {
        semana_inicio: program.periodo_inicio,
        semana_fim: program.periodo_fim,
        material_estudo: materialReference,
        congregacao_id: program.congregacao_id || 'default', // Use default if not provided
        status: program.status === 'rascunho' ? 'rascunho' : 'ativo'
      };

      const savedProgram = await this.dataStore.createPrograma(programData);
      console.log(`✅ Programa salvo no banco: ${savedProgram.id}`);
      return savedProgram;

    } catch (error) {
      console.error('❌ Erro ao salvar programa no banco:', error);
      throw error;
    }
  }

  // Ensure material reference is local (no external URLs)
  ensureLocalMaterialReference(materialReference) {
    try {
      // Remove any external URLs and keep only filename
      if (typeof materialReference === 'string') {
        // Remove http/https URLs
        if (materialReference.includes('http://') || materialReference.includes('https://')) {
          const filename = path.basename(materialReference);
          console.log(`🔒 Converting external reference to local: ${materialReference} -> ${filename}`);
          return filename;
        }
        
        // Remove jw.org references
        if (materialReference.includes('jw.org')) {
          const filename = path.basename(materialReference);
          console.log(`🔒 Converting jw.org reference to local: ${materialReference} -> ${filename}`);
          return filename;
        }
        
        // Already local reference
        return materialReference;
      }
      
      return materialReference;
    } catch (error) {
      console.error('❌ Erro ao processar referência de material:', error);
      return materialReference; // Return original if processing fails
    }
  }

  // Publicar programa para congregações
  async publishProgram(programId) {
    try {
      console.log(`📢 Publicando programa: ${programId}`);
      
      // Atualizar status no banco
      const updatedProgram = await this.dataStore.updatePrograma(programId, { 
        status: 'ativo'
      });

      // Notificar congregações sobre novo programa
      await this.notifyCongregations(updatedProgram);

      console.log(`✅ Programa publicado: ${programId}`);
      return updatedProgram;

    } catch (error) {
      console.error('❌ Erro ao publicar programa:', error);
      throw error;
    }
  }

  // Notificar congregações sobre novo programa
  async notifyCongregations(program) {
    try {
      if (this.offlineMode) {
        // In offline mode, store notifications locally for later processing
        console.log(`📢 [OFFLINE] Programa ${program.id} disponível para congregação ${program.congregacao_id}`);
        
        if (this.enableNotifications) {
          // Store notification locally for future sync or local display
          await this.storeLocalNotification({
            type: 'program_published',
            programId: program.id,
            congregacaoId: program.congregacao_id,
            message: `Novo programa disponível: ${program.material_estudo}`,
            timestamp: new Date().toISOString(),
            status: 'pending'
          });
        }
      } else {
        // Online mode - could implement actual notification system
        console.log(`📢 [ONLINE] Programa ${program.id} disponível para congregação ${program.congregacao_id}`);
        // Future: implement actual notification delivery
      }
    } catch (error) {
      console.error('❌ Erro ao notificar congregações:', error);
      // Don't throw error - notifications are not critical for program functionality
    }
  }

  // Listar programas disponíveis
  async listPrograms(status = null) {
    try {
      const filters = {};
      if (status) {
        filters.status = status;
      }

      const programs = await this.dataStore.getProgramas(filters);
      return programs;

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

  // Criar designações para um programa
  async createAssignmentsForProgram(programId, assignments) {
    try {
      console.log(`📝 Criando designações para programa: ${programId}`);
      
      const createdAssignments = [];
      
      for (const assignment of assignments) {
        const designacaoData = {
          programa_id: programId,
          estudante_id: assignment.estudante_id,
          ajudante_id: assignment.ajudante_id,
          parte: assignment.parte,
          tema: assignment.tema,
          tempo_minutos: assignment.tempo_minutos,
          observacoes: assignment.observacoes,
          status: 'agendada'
        };

        const createdAssignment = await this.dataStore.createDesignacao(designacaoData);
        createdAssignments.push(createdAssignment);
      }

      console.log(`✅ ${createdAssignments.length} designações criadas`);
      return createdAssignments;

    } catch (error) {
      console.error('❌ Erro ao criar designações:', error);
      throw error;
    }
  }

  // Obter designações de um programa
  async getAssignmentsForProgram(programId) {
    try {
      const assignments = await this.dataStore.getDesignacoesByPrograma(programId);
      return assignments;
    } catch (error) {
      console.error('❌ Erro ao obter designações:', error);
      throw error;
    }
  }

  // Obter histórico de designações de um estudante
  async getStudentAssignmentHistory(estudanteId, weeks = 8) {
    try {
      const history = await this.dataStore.getHistoricoDesignacoes(estudanteId, weeks);
      return history;
    } catch (error) {
      console.error('❌ Erro ao obter histórico de designações:', error);
      throw error;
    }
  }

  // Store local notification for offline mode
  async storeLocalNotification(notification) {
    try {
      if (!this.enableLocalStorage) return;

      const notificationsFile = path.join(this.programsPath, 'notifications.json');
      let notifications = [];

      // Read existing notifications
      if (await fs.pathExists(notificationsFile)) {
        try {
          notifications = await fs.readJson(notificationsFile);
        } catch (error) {
          console.warn('⚠️ Erro ao ler notificações existentes, criando novo arquivo');
          notifications = [];
        }
      }

      // Add new notification
      notification.id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      notifications.push(notification);

      // Keep only last 100 notifications to prevent file from growing too large
      if (notifications.length > 100) {
        notifications = notifications.slice(-100);
      }

      // Save updated notifications
      await fs.writeJson(notificationsFile, notifications, { spaces: 2 });
      console.log(`📝 Notificação local armazenada: ${notification.id}`);

    } catch (error) {
      console.error('❌ Erro ao armazenar notificação local:', error);
      // Don't throw - this is not critical functionality
    }
  }

  // Obter estudantes disponíveis para designações
  async getAvailableStudents(congregacaoId, filters = {}) {
    try {
      const estudanteFilters = {
        congregacao_id: congregacaoId,
        ativo: true,
        ...filters
      };

      const students = await this.dataStore.getEstudantes(estudanteFilters);
      return students;
    } catch (error) {
      console.error('❌ Erro ao obter estudantes:', error);
      throw error;
    }
  }

  // Validate offline functionality - ensure no external dependencies
  async validateOfflineMode() {
    try {
      console.log('🔍 Validating offline mode functionality...');
      
      const validationResults = {
        dataStore: false,
        localStorage: false,
        materialsPath: false,
        programsPath: false,
        offlineMode: this.offlineMode
      };

      // Test data store connection
      try {
        await this.dataStore.healthCheck();
        validationResults.dataStore = true;
        console.log('✅ Data store connection validated');
      } catch (error) {
        console.error('❌ Data store validation failed:', error.message);
      }

      // Test local storage paths
      try {
        await fs.ensureDir(this.materialsPath);
        await fs.ensureDir(this.programsPath);
        validationResults.localStorage = true;
        validationResults.materialsPath = await fs.pathExists(this.materialsPath);
        validationResults.programsPath = await fs.pathExists(this.programsPath);
        console.log('✅ Local storage paths validated');
      } catch (error) {
        console.error('❌ Local storage validation failed:', error.message);
      }

      const isFullyOffline = Object.values(validationResults).every(result => result === true);
      
      console.log(`${isFullyOffline ? '✅' : '⚠️'} Offline mode validation ${isFullyOffline ? 'passed' : 'has issues'}`);
      
      return {
        isValid: isFullyOffline,
        results: validationResults,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Offline mode validation failed:', error);
      return {
        isValid: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = ProgramGenerator;
