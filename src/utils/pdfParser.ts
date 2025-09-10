// PDF Parser utility for Vida e Ministério Cristão workbooks
// This utility handles parsing of official JW.org PDF files

import logger from '@/utils/logger';

export interface ParsedPdfData {
  semana: string;
  mes_ano: string;
  tipo_documento: 'apostila_mensal' | 'programa_semanal' | 'formulario_designacao';
  partes: string[];
  data_inicio: string;
  detalhes_extras: {
    semanas_incluidas?: string[];
    total_semanas?: number;
    mes_numerico?: number;
    ano?: number;
    conteudo_extraido?: string[];
  };
}

export class JWPdfParser {
  private static monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  private static monthNamesLower = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  /**
   * Parse filename to extract basic information
   */
  static parseFilename(filename: string): Partial<ParsedPdfData> {
    const lowerFilename = filename.toLowerCase();
    
    // Parse JW.org monthly workbook pattern: mwb_<lang>_YYYYMM.pdf
    // Accepts any 1-3 letter language code (e.g., mwb_e_202511.pdf, mwb_t_202511.pdf)
    const jwWorkbookMatch = lowerFilename.match(/mwb_[a-z]{1,3}_(\d{4})(\d{2})\.pdf/);
    if (jwWorkbookMatch) {
      return this.parseMonthlyWorkbook(jwWorkbookMatch[1], jwWorkbookMatch[2]);
    }

    // Parse assignment form: S-38_T.pdf
    const assignmentFormMatch = lowerFilename.match(/s-38_t\.pdf/);
    if (assignmentFormMatch) {
      return this.parseAssignmentForm();
    }

    // Parse weekly program with date range: programa-12-18-agosto-2024.pdf
    const weeklyProgramMatch = lowerFilename.match(/(\d{1,2})-(\d{1,2})-(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)-(\d{4})/);
    if (weeklyProgramMatch) {
      return this.parseWeeklyProgram(
        weeklyProgramMatch[1], 
        weeklyProgramMatch[2], 
        weeklyProgramMatch[3], 
        weeklyProgramMatch[4]
      );
    }

    // Parse general date patterns
    const dateMatch = lowerFilename.match(/(\d{1,2})-(\d{1,2})/);
    if (dateMatch) {
      return this.parseGeneralDatePattern(dateMatch[1], dateMatch[2], lowerFilename);
    }

    return this.parseUnknownFormat(filename);
  }

  /**
   * Parse monthly workbook (mwb_T_YYYYMM.pdf)
   */
  private static parseMonthlyWorkbook(year: string, month: string): ParsedPdfData {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const monthName = this.monthNames[monthNum - 1];
    
    const weeksInMonth = this.generateWeeksInMonth(yearNum, monthNum);
    
    return {
      semana: `Apostila ${monthName} ${yearNum}`,
      mes_ano: `${monthName} de ${yearNum}`,
      tipo_documento: 'apostila_mensal',
      partes: [
        'Tesouros da Palavra de Deus',
        'Faça Seu Melhor no Ministério',
        'Nossa Vida Cristã',
        'Cânticos e Orações',
        'Leitura da Bíblia'
      ],
      data_inicio: `${yearNum}-${month.padStart(2, '0')}-01`,
      detalhes_extras: {
        semanas_incluidas: weeksInMonth,
        total_semanas: weeksInMonth.length,
        mes_numerico: monthNum,
        ano: yearNum
      }
    };
  }

  /**
   * Parse assignment form (S-38_T.pdf)
   */
  private static parseAssignmentForm(): ParsedPdfData {
    return {
      semana: 'Formulário de Designação S-38',
      mes_ano: '',
      tipo_documento: 'formulario_designacao',
      partes: [
        'Formulário de Designação para Estudantes',
        'Registro de Participação',
        'Avaliação de Desempenho',
        'Instruções para Preenchimento'
      ],
      data_inicio: new Date().toISOString().split('T')[0],
      detalhes_extras: {}
    };
  }

  /**
   * Parse weekly program with specific date range
   */
  private static parseWeeklyProgram(startDay: string, endDay: string, month: string, year: string): ParsedPdfData {
    const monthName = month.charAt(0).toUpperCase() + month.slice(1);
    const yearNum = parseInt(year);
    const monthNum = this.monthNamesLower.indexOf(month) + 1;
    
    return {
      semana: `${startDay}-${endDay} de ${monthName} de ${year}`,
      mes_ano: `${monthName} de ${year}`,
      tipo_documento: 'programa_semanal',
      partes: [
        'Tesouros da Palavra de Deus',
        'Faça Seu Melhor no Ministério',
        'Nossa Vida Cristã'
      ],
      data_inicio: `${year}-${monthNum.toString().padStart(2, '0')}-${startDay.padStart(2, '0')}`,
      detalhes_extras: {
        mes_numerico: monthNum,
        ano: yearNum
      }
    };
  }

  /**
   * Parse general date pattern (fallback)
   */
  private static parseGeneralDatePattern(startDay: string, endDay: string, filename: string): ParsedPdfData {
    // Try to extract month and year from filename
    const monthMatch = filename.match(/(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/);
    const yearMatch = filename.match(/(\d{4})/);
    
    const currentDate = new Date();
    let monthName = this.monthNames[currentDate.getMonth()];
    let year = currentDate.getFullYear();
    let monthNum = currentDate.getMonth() + 1;
    
    if (monthMatch) {
      monthName = monthMatch[1].charAt(0).toUpperCase() + monthMatch[1].slice(1);
      monthNum = this.monthNamesLower.indexOf(monthMatch[1]) + 1;
    }
    if (yearMatch) {
      year = parseInt(yearMatch[1]);
    }
    
    return {
      semana: `${startDay}-${endDay} de ${monthName} de ${year}`,
      mes_ano: `${monthName} de ${year}`,
      tipo_documento: 'programa_semanal',
      partes: [
        'Tesouros da Palavra de Deus',
        'Faça Seu Melhor no Ministério',
        'Nossa Vida Cristã'
      ],
      data_inicio: `${year}-${monthNum.toString().padStart(2, '0')}-${startDay.padStart(2, '0')}`,
      detalhes_extras: {
        mes_numerico: monthNum,
        ano: year
      }
    };
  }

  /**
   * Parse unknown format (fallback)
   */
  private static parseUnknownFormat(filename: string): ParsedPdfData {
    return {
      semana: `Programa Importado - ${filename}`,
      mes_ano: '',
      tipo_documento: 'programa_semanal',
      partes: [
        'Tesouros da Palavra de Deus',
        'Faça Seu Melhor no Ministério',
        'Nossa Vida Cristã'
      ],
      data_inicio: new Date().toISOString().split('T')[0],
      detalhes_extras: {}
    };
  }

  /**
   * Generate weeks for a given month
   */
  private static generateWeeksInMonth(year: number, month: number): string[] {
    const weeks: string[] = [];
    const lastDay = new Date(year, month, 0).getDate();
    const monthName = this.monthNames[month - 1];
    
    let currentWeekStart = 1;
    
    while (currentWeekStart <= lastDay) {
      const weekEnd = Math.min(currentWeekStart + 6, lastDay);
      weeks.push(`${currentWeekStart}-${weekEnd} de ${monthName} de ${year}`);
      currentWeekStart = weekEnd + 1;
    }
    
    return weeks;
  }

  /**
   * Extract content patterns from PDF text (for future real PDF parsing)
   */
  static extractContentPatterns(text: string): string[] {
    const patterns: string[] = [];
    
    // Look for common JW meeting patterns
    const meetingPatterns = [
      /tesouros da palavra de deus/gi,
      /faça seu melhor no ministério/gi,
      /nossa vida cristã/gi,
      /cântico \d+/gi,
      /oração/gi,
      /leitura da bíblia/gi,
      /apresentação inicial/gi,
      /revisita/gi,
      /estudo bíblico/gi,
      /discurso/gi
    ];
    
    meetingPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        patterns.push(...matches);
      }
    });
    
    return [...new Set(patterns)]; // Remove duplicates
  }

  /**
   * Validate date for future date prevention and reasonable limits
   */
  private static validateDate(dateStr: string): { isValid: boolean; error?: string } {
    try {
      const date = new Date(dateStr);
      const now = new Date();

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return { isValid: false, error: 'Data inválida' };
      }

      // Check if date is too far in the future (max 2 years ahead)
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);

      if (date > maxFutureDate) {
        return { isValid: false, error: 'Data muito distante no futuro' };
      }

      // Check if date is too far in the past (max 5 years ago)
      const minPastDate = new Date();
      minPastDate.setFullYear(minPastDate.getFullYear() - 5);

      if (date < minPastDate) {
        return { isValid: false, error: 'Data muito antiga' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Erro ao validar data' };
    }
  }

  /**
   * Enhanced main parsing function with validation and error handling
   */
  static async parsePdf(file: File): Promise<ParsedPdfData> {
    try {
      // Validate file integrity
      if (!file || file.size === 0) {
        throw new Error('Arquivo PDF vazio ou corrompido');
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('Arquivo PDF muito grande (limite: 50MB)');
      }

      // Start with filename parsing
      const filenameData = this.parseFilename(file.name);

      // Validate extracted date if present
      if (filenameData.data_inicio) {
        const dateValidation = this.validateDate(filenameData.data_inicio);
        if (!dateValidation.isValid) {
          logger.warn(`Date validation failed for ${file.name}:`, dateValidation.error);
          // Use current date as fallback
          filenameData.data_inicio = new Date().toISOString().split('T')[0];
          filenameData.detalhes_extras = {
            ...filenameData.detalhes_extras,
            date_validation_warning: dateValidation.error,
            date_corrected: true
          };
        }
      }

      // Add file integrity info
      filenameData.detalhes_extras = {
        ...filenameData.detalhes_extras,
        file_size_mb: (file.size / 1024 / 1024).toFixed(2),
        file_validated: true,
        parsing_timestamp: new Date().toISOString()
      };

      return filenameData as ParsedPdfData;

    } catch (error) {
      logger.error('Critical PDF parsing error:', error);

      // Return safe fallback with error information
      return {
        semana: `Erro - ${file.name}`,
        mes_ano: '',
        tipo_documento: 'programa_semanal',
        partes: [
          'Tesouros da Palavra de Deus',
          'Faça Seu Melhor no Ministério',
          'Nossa Vida Cristã'
        ],
        data_inicio: new Date().toISOString().split('T')[0],
        detalhes_extras: {
          parsing_method: 'error_fallback',
          error_message: error instanceof Error ? error.message : 'Erro desconhecido',
          file_corrupted: true,
          manual_review_required: true,
          parsing_timestamp: new Date().toISOString()
        }
      };
    }
  }
}
