/**
 * Excel Template Generator
 * Creates standardized Excel templates for JW meeting assignments
 */

import * as XLSX from 'xlsx';
import { ParsedJWContent, ParsedMeetingPart } from './jwOrgContentParser';

export interface TemplateOptions {
  includeInstructions: boolean;
  includeValidation: boolean;
  templateVersion: string;
  congregationName?: string;
}

export class ExcelTemplateGenerator {
  /**
   * Generate Excel template from parsed JW content
   */
  static generateTemplate(
    parsed: ParsedJWContent, 
    options: TemplateOptions = {
      includeInstructions: true,
      includeValidation: true,
      templateVersion: '1.0'
    }
  ): ArrayBuffer {
    const workbook = XLSX.utils.book_new();
    
    // Create main assignments sheet
    const assignmentsSheet = this.createAssignmentsSheet(parsed, options);
    XLSX.utils.book_append_sheet(workbook, assignmentsSheet, 'Designações');
    
    // Create instructions sheet if requested
    if (options.includeInstructions) {
      const instructionsSheet = this.createInstructionsSheet(parsed, options);
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instruções');
    }
    
    // Create validation sheet if requested
    if (options.includeValidation) {
      const validationSheet = this.createValidationSheet();
      XLSX.utils.book_append_sheet(workbook, validationSheet, 'Validação');
    }
    
    // Generate buffer
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  }

  /**
   * Create the main assignments sheet
   */
  private static createAssignmentsSheet(parsed: ParsedJWContent, options: TemplateOptions): XLSX.WorkSheet {
    const data: any[][] = [];
    
    // Header information
    data.push(['PROGRAMA DA REUNIÃO - VIDA E MINISTÉRIO CRISTÃO']);
    data.push([`Semana: ${parsed.semana}`]);
    data.push([`Data: ${this.formatDate(parsed.data_inicio)} - ${this.formatDate(parsed.data_fim)}`]);
    if (options.congregationName) {
      data.push([`Congregação: ${options.congregationName}`]);
    }
    data.push([`Leitura Bíblica: ${parsed.leitura_biblica || 'Não especificada'}`]);
    data.push([]); // Empty row
    
    // Songs information
    data.push(['CÂNTICOS']);
    data.push(['Abertura:', parsed.canticos.abertura || '']);
    data.push(['Meio:', parsed.canticos.meio || '']);
    data.push(['Encerramento:', parsed.canticos.encerramento || '']);
    data.push([]); // Empty row
    
    // Column headers
    data.push([
      'Nº',
      'PARTE DO PROGRAMA',
      'TIPO',
      'TEMPO',
      'ESTUDANTE PRINCIPAL',
      'AJUDANTE',
      'SALA',
      'OBSERVAÇÕES'
    ]);
    
    // Add each meeting part
    parsed.partes.forEach((parte, index) => {
      data.push([
        parte.numero_parte,
        parte.titulo_parte,
        this.getPartTypeLabel(parte.tipo_parte),
        `${parte.tempo_minutos} min`,
        '', // To be filled by instructor
        this.requiresHelper(parte.tipo_parte) ? '' : 'N/A',
        'Principal',
        parte.descricao || ''
      ]);
    });
    
    // Add summary row
    data.push([]);
    data.push([
      'TOTAL:',
      `${parsed.partes.length} partes`,
      '',
      `${parsed.metadata.tempo_total_minutos} min`,
      '',
      '',
      '',
      `Gerado em ${this.formatDate(new Date().toISOString().split('T')[0])}`
    ]);
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Apply formatting
    this.applyFormatting(worksheet, data.length);
    
    return worksheet;
  }

  /**
   * Create instructions sheet
   */
  private static createInstructionsSheet(parsed: ParsedJWContent, options: TemplateOptions): XLSX.WorkSheet {
    const instructions = [
      ['INSTRUÇÕES PARA PREENCHIMENTO'],
      [],
      ['1. COMO PREENCHER:'],
      ['   • Preencha apenas as colunas "ESTUDANTE PRINCIPAL" e "AJUDANTE"'],
      ['   • Use nomes completos dos estudantes'],
      ['   • Verifique se o estudante está qualificado para a parte'],
      [],
      ['2. REGRAS S-38-T:'],
      ['   • Partes de ensino: apenas homens qualificados'],
      ['   • Partes do ministério: podem incluir irmãs'],
      ['   • Leitura da Bíblia: apenas homens'],
      ['   • Comentários: apenas homens qualificados'],
      [],
      ['3. TIPOS DE PARTE:'],
      ...this.getPartTypeInstructions(),
      [],
      ['4. APÓS PREENCHER:'],
      ['   • Salve o arquivo'],
      ['   • Faça upload no Sistema Ministerial'],
      ['   • O sistema validará automaticamente as designações'],
      [],
      ['5. SUPORTE:'],
      ['   • Em caso de dúvidas, consulte o manual S-38-T'],
      ['   • Para problemas técnicos, contate o suporte do sistema'],
      [],
      [`Template versão: ${options.templateVersion}`],
      [`Gerado em: ${new Date().toLocaleString('pt-BR')}`]
    ];
    
    return XLSX.utils.aoa_to_sheet(instructions);
  }

  /**
   * Create validation sheet with dropdown lists
   */
  private static createValidationSheet(): XLSX.WorkSheet {
    const validationData = [
      ['LISTAS DE VALIDAÇÃO'],
      [],
      ['Tipos de Parte Válidos:'],
      ['comentarios_iniciais'],
      ['tesouros_palavra'],
      ['joias_espirituais'],
      ['leitura_biblica'],
      ['parte_ministerio'],
      ['discurso'],
      ['vida_crista'],
      ['estudo_biblico_congregacao'],
      ['comentarios_finais'],
      [],
      ['Salas Disponíveis:'],
      ['Principal'],
      ['Auxiliar 1'],
      ['Auxiliar 2'],
      ['Auxiliar 3']
    ];
    
    return XLSX.utils.aoa_to_sheet(validationData);
  }

  /**
   * Apply formatting to the worksheet
   */
  private static applyFormatting(worksheet: XLSX.WorkSheet, totalRows: number): void {
    // Set column widths
    const colWidths = [
      { wch: 5 },  // Nº
      { wch: 40 }, // PARTE DO PROGRAMA
      { wch: 20 }, // TIPO
      { wch: 10 }, // TEMPO
      { wch: 25 }, // ESTUDANTE PRINCIPAL
      { wch: 25 }, // AJUDANTE
      { wch: 12 }, // SALA
      { wch: 30 }  // OBSERVAÇÕES
    ];
    
    worksheet['!cols'] = colWidths;
    
    // Set row heights for header rows
    const rowHeights = [];
    for (let i = 0; i < totalRows; i++) {
      rowHeights.push({ hpt: i < 6 ? 20 : 15 });
    }
    worksheet['!rows'] = rowHeights;
  }

  /**
   * Get human-readable label for part type
   */
  private static getPartTypeLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      'comentarios_iniciais': 'Comentários Iniciais',
      'tesouros_palavra': 'Tesouros da Palavra',
      'joias_espirituais': 'Joias Espirituais',
      'leitura_biblica': 'Leitura da Bíblia',
      'parte_ministerio': 'Ministério',
      'discurso': 'Discurso',
      'vida_crista': 'Vida Cristã',
      'estudo_biblico_congregacao': 'Estudo Bíblico',
      'comentarios_finais': 'Comentários Finais',
      'parte_geral': 'Parte Geral'
    };
    
    return labels[tipo] || tipo;
  }

  /**
   * Check if part type requires a helper
   */
  private static requiresHelper(tipo: string): boolean {
    const helperRequired = [
      'parte_ministerio'
    ];
    
    return helperRequired.includes(tipo);
  }

  /**
   * Get part type instructions
   */
  private static getPartTypeInstructions(): string[][] {
    return [
      ['   • Comentários Iniciais: Ancião ou servo ministerial'],
      ['   • Tesouros da Palavra: Ancião ou servo ministerial'],
      ['   • Joias Espirituais: Ancião ou servo ministerial'],
      ['   • Leitura da Bíblia: Homem qualificado'],
      ['   • Ministério: Qualquer estudante (pode ter ajudante)'],
      ['   • Discurso: Conforme qualificação'],
      ['   • Vida Cristã: Ancião ou servo ministerial'],
      ['   • Estudo Bíblico: Ancião ou servo ministerial'],
      ['   • Comentários Finais: Ancião ou servo ministerial']
    ];
  }

  /**
   * Format date for display
   */
  private static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  }

  /**
   * Generate CSV template (alternative format)
   */
  static generateCSVTemplate(parsed: ParsedJWContent): string {
    const rows = [
      // Header
      'Número,Título da Parte,Tipo,Tempo (min),Estudante Principal,Ajudante,Sala,Observações'
    ];
    
    // Add each part
    parsed.partes.forEach(parte => {
      rows.push([
        parte.numero_parte,
        `"${parte.titulo_parte}"`,
        parte.tipo_parte,
        parte.tempo_minutos,
        '""', // Empty for instructor to fill
        this.requiresHelper(parte.tipo_parte) ? '""' : '"N/A"',
        '"Principal"',
        `"${parte.descricao || ''}"`
      ].join(','));
    });
    
    return rows.join('\n');
  }

  /**
   * Validate template data before generation
   */
  static validateTemplateData(parsed: ParsedJWContent): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!parsed.partes || parsed.partes.length === 0) {
      errors.push('Nenhuma parte encontrada para gerar template');
    }
    
    if (!parsed.semana) {
      errors.push('Informação da semana não encontrada');
    }
    
    if (!parsed.data_inicio || !parsed.data_fim) {
      errors.push('Datas de início e fim não encontradas');
    }
    
    // Check for duplicate part numbers
    const partNumbers = parsed.partes.map(p => p.numero_parte);
    const duplicates = partNumbers.filter((num, index) => partNumbers.indexOf(num) !== index);
    
    if (duplicates.length > 0) {
      errors.push(`Números de parte duplicados: ${duplicates.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
