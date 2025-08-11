// PDF Parser utility for Vida e Ministério Cristão workbooks
// This utility handles parsing of official JW.org PDF files

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
    
    // Parse JW.org monthly workbook pattern: mwb_T_YYYYMM.pdf
    const jwWorkbookMatch = lowerFilename.match(/mwb_t_(\d{4})(\d{2})\.pdf/);
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
   * Main parsing function
   */
  static async parsePdf(file: File): Promise<ParsedPdfData> {
    // Start with filename parsing
    const filenameData = this.parseFilename(file.name);
    
    // For now, return filename-based parsing
    // In the future, we can add actual PDF content parsing here
    return filenameData as ParsedPdfData;
  }
}
