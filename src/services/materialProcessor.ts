import { supabase } from '@/integrations/supabase/client';

export interface ProcessedWeek {
  semana_inicio: string;
  semana_fim: string;
  ano: number;
  mes: number;
  numero_semana: number;
  tema_semanal: string;
  leitura_biblica?: string;
  cancao_inicial?: number;
  cancao_intermediaria?: number;
  cancao_final?: number;
  presidente?: string;
  orador_discurso_publico?: string;
  tema_discurso_publico?: string;
  leitor_estudo_biblico?: string;
  dirigente_estudo_biblico?: string;
  partes_emt: any[];
  partes_mwb: any[];
  observacoes?: string;
  status: 'draft' | 'published';
}

export interface ProcessedWorkbook {
  title: string;
  year: number;
  month_start: number;
  month_end: number;
  language: 'pt' | 'en';
  pdf_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  json_content: {
    sections: string[];
    weeks: number;
    processed_at: string;
    weeks_data?: ProcessedWeek[];
  };
}

export class MaterialProcessor {
  private static instance: MaterialProcessor;

  public static getInstance(): MaterialProcessor {
    if (!MaterialProcessor.instance) {
      MaterialProcessor.instance = new MaterialProcessor();
    }
    return MaterialProcessor.instance;
  }

  /**
   * Processa um arquivo de material oficial
   */
  async processFile(file: File, onProgress?: (progress: number) => void): Promise<ProcessedWorkbook> {
    try {
      onProgress?.(10);
      
      const fileType = this.detectFileType(file);
      let processedData: ProcessedWorkbook;

      switch (fileType) {
        case 'pdf':
          processedData = await this.processPDF(file, onProgress);
          break;
        case 'jwpub':
          processedData = await this.processJWPUB(file, onProgress);
          break;
        case 'daisy':
          processedData = await this.processDAISY(file, onProgress);
          break;
        default:
          throw new Error(`Tipo de arquivo não suportado: ${file.name}`);
      }

      onProgress?.(90);

      // Salvar dados processados no Supabase
      await this.saveToDatabase(processedData);

      onProgress?.(100);
      return processedData;

    } catch (error) {
      console.error('Erro no processamento do arquivo:', error);
      throw error;
    }
  }

  /**
   * Detecta o tipo de arquivo baseado no nome e extensão
   */
  private detectFileType(file: File): 'pdf' | 'jwpub' | 'daisy' {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
      return 'pdf';
    } else if (fileName.endsWith('.jwpub')) {
      return 'jwpub';
    } else if (fileName.endsWith('.daisy.zip')) {
      return 'daisy';
    }
    
    throw new Error(`Tipo de arquivo não reconhecido: ${file.name}`);
  }

  /**
   * Processa arquivo PDF da apostila
   */
  private async processPDF(file: File, onProgress?: (progress: number) => void): Promise<ProcessedWorkbook> {
    onProgress?.(30);

    // TODO: Implementar parsing real do PDF
    // Por enquanto, vamos simular o processamento baseado no nome do arquivo
    const fileName = file.name;
    const language = fileName.includes('_E_') ? 'en' : 'pt';
    const yearMatch = fileName.match(/(\d{4})/);
    const monthMatch = fileName.match(/(\d{2})(?=\.pdf)/);

    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
    const startMonth = monthMatch ? parseInt(monthMatch[1]) : new Date().getMonth() + 1;
    
    onProgress?.(60);

    // Simular extração de dados estruturados
    const mockWeeks = this.generateMockWeeks(year, startMonth, language);

    onProgress?.(80);

    return {
      title: this.generateTitle(fileName, language),
      year,
      month_start: startMonth,
      month_end: startMonth + 1,
      language,
      status: 'completed',
      json_content: {
        sections: language === 'pt' 
          ? ['Tesouros da Palavra de Deus', 'Faça Seu Melhor no Ministério', 'Nossa Vida Cristã']
          : ['Treasures From Gods Word', 'Apply Yourself to the Field Ministry', 'Our Christian Life and Ministry'],
        weeks: mockWeeks.length,
        processed_at: new Date().toISOString(),
        weeks_data: mockWeeks
      }
    };
  }

  /**
   * Processa arquivo JWPUB
   */
  private async processJWPUB(file: File, onProgress?: (progress: number) => void): Promise<ProcessedWorkbook> {
    onProgress?.(30);

    // TODO: Implementar descompressão e parsing do JWPUB
    // JWPUB é um arquivo ZIP com estrutura XML específica
    
    const fileName = file.name;
    const language = fileName.includes('_E_') ? 'en' : 'pt';
    const yearMatch = fileName.match(/(\d{4})/);
    const monthMatch = fileName.match(/(\d{2})/);

    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
    const startMonth = monthMatch ? parseInt(monthMatch[1]) : new Date().getMonth() + 1;

    onProgress?.(70);

    const mockWeeks = this.generateMockWeeks(year, startMonth, language);

    return {
      title: this.generateTitle(fileName, language),
      year,
      month_start: startMonth,
      month_end: startMonth + 1,
      language,
      status: 'completed',
      json_content: {
        sections: language === 'pt' 
          ? ['Tesouros da Palavra de Deus', 'Faça Seu Melhor no Ministério', 'Nossa Vida Cristã']
          : ['Treasures From Gods Word', 'Apply Yourself to the Field Ministry', 'Our Christian Life and Ministry'],
        weeks: mockWeeks.length,
        processed_at: new Date().toISOString(),
        weeks_data: mockWeeks
      }
    };
  }

  /**
   * Processa arquivo DAISY (acessibilidade)
   */
  private async processDAISY(file: File, onProgress?: (progress: number) => void): Promise<ProcessedWorkbook> {
    onProgress?.(30);

    // TODO: Implementar parsing do formato DAISY
    const fileName = file.name;
    const language = fileName.includes('_E_') ? 'en' : 'pt';
    const yearMatch = fileName.match(/(\d{4})/);
    const monthMatch = fileName.match(/(\d{2})/);

    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
    const startMonth = monthMatch ? parseInt(monthMatch[1]) : new Date().getMonth() + 1;

    onProgress?.(70);

    const mockWeeks = this.generateMockWeeks(year, startMonth, language);

    return {
      title: this.generateTitle(fileName, language),
      year,
      month_start: startMonth,
      month_end: startMonth + 1,
      language,
      status: 'completed',
      json_content: {
        sections: language === 'pt' 
          ? ['Tesouros da Palavra de Deus', 'Faça Seu Melhor no Ministério', 'Nossa Vida Cristã']
          : ['Treasures From Gods Word', 'Apply Yourself to the Field Ministry', 'Our Christian Life and Ministry'],
        weeks: mockWeeks.length,
        processed_at: new Date().toISOString(),
        weeks_data: mockWeeks
      }
    };
  }

  /**
   * Gera título baseado no nome do arquivo
   */
  private generateTitle(fileName: string, language: 'pt' | 'en'): string {
    const yearMatch = fileName.match(/(\d{4})/);
    const monthMatch = fileName.match(/(\d{2})/);
    
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear();
    const month = monthMatch ? parseInt(monthMatch[1]) : new Date().getMonth() + 1;
    
    const monthNames = {
      pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      en: ['January', 'February', 'March', 'April', 'May', 'June',
           'July', 'August', 'September', 'October', 'November', 'December']
    };

    const monthName = monthNames[language][month - 1];
    const nextMonthName = monthNames[language][month % 12];

    if (language === 'pt') {
      return `Apostila MWB ${monthName}-${nextMonthName} ${year}`;
    } else {
      return `Meeting Workbook ${monthName}-${nextMonthName} ${year}`;
    }
  }

  /**
   * Gera dados mock das semanas para teste
   */
  private generateMockWeeks(year: number, startMonth: number, language: 'pt' | 'en'): ProcessedWeek[] {
    const weeks: ProcessedWeek[] = [];
    const startDate = new Date(year, startMonth - 1, 1);
    
    // Gerar 8 semanas de programação
    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekNumber = this.getWeekNumber(weekStart);

      weeks.push({
        semana_inicio: weekStart.toISOString().split('T')[0],
        semana_fim: weekEnd.toISOString().split('T')[0],
        ano: year,
        mes: weekStart.getMonth() + 1,
        numero_semana: weekNumber,
        tema_semanal: language === 'pt' 
          ? `Tema da Semana ${i + 1}` 
          : `Week Theme ${i + 1}`,
        leitura_biblica: `Gênesis ${i + 1}:1-20`,
        cancao_inicial: 130 + i,
        cancao_intermediaria: 140 + i,
        cancao_final: 150 + i,
        partes_emt: [
          {
            titulo: language === 'pt' ? 'Tesouros da Palavra de Deus' : 'Treasures From Gods Word',
            duracao: 10,
            tipo: 'tesouros',
            referencias: `Gen. ${i + 1}:1-5`
          }
        ],
        partes_mwb: [
          {
            titulo: language === 'pt' ? 'Joias espirituais' : 'Spiritual Gems',
            duracao: 10,
            tipo: 'joias',
            referencias: `Gen. ${i + 1}:10-15`
          },
          {
            titulo: language === 'pt' ? 'Leitura da Bíblia' : 'Bible Reading',
            duracao: 4,
            tipo: 'leitura',
            referencias: `Gen. ${i + 1}:1-20`
          }
        ],
        status: 'published'
      });
    }

    return weeks;
  }

  /**
   * Calcula o número da semana no ano
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Salva dados processados no banco Supabase
   */
  private async saveToDatabase(workbook: ProcessedWorkbook): Promise<void> {
    try {
      // Salvar workbook_version
      const { data: workbookData, error: workbookError } = await supabase
        .from('workbook_versions')
        .insert([{
          title: workbook.title,
          year: workbook.year,
          month_start: workbook.month_start,
          month_end: workbook.month_end,
          language: workbook.language,
          status: workbook.status,
          json_content: workbook.json_content
        }])
        .select()
        .single();

      if (workbookError) {
        throw new Error(`Erro ao salvar workbook: ${workbookError.message}`);
      }

      // Salvar semanas individuais na global_programming
      if (workbook.json_content.weeks_data) {
        const { error: programmingError } = await supabase
          .from('global_programming')
          .insert(workbook.json_content.weeks_data);

        if (programmingError) {
          console.warn('Erro ao salvar programação global:', programmingError.message);
          // Não falhar se não conseguir salvar as semanas individuais
        }
      }

      console.log('✅ Dados salvos com sucesso no Supabase');
    } catch (error) {
      console.error('❌ Erro ao salvar no banco:', error);
      throw error;
    }
  }
}

// Instância singleton
export const materialProcessor = MaterialProcessor.getInstance();
