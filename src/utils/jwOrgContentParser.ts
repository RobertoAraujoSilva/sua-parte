/**
 * JW.org Content Parser
 * Parses content from JW.org apostila pages and extracts meeting parts
 */

export interface ParsedMeetingPart {
  numero_parte: number;
  titulo_parte: string;
  tipo_parte: string;
  tempo_minutos: number;
  cena?: string;
  descricao?: string;
  referencias?: string[];
}

export interface ParsedJWContent {
  semana: string;
  data_inicio: string;
  data_fim: string;
  tema_semanal?: string;
  leitura_biblica?: string;
  canticos: {
    abertura?: number;
    meio?: number;
    encerramento?: number;
  };
  partes: ParsedMeetingPart[];
  metadata: {
    url_origem?: string;
    data_processamento: string;
    total_partes: number;
    tempo_total_minutos: number;
  };
}

export class JWOrgContentParser {
  /**
   * Parse JW.org apostila content from text
   */
  static parseContent(content: string, weekInfo?: { start: string; end: string }): ParsedJWContent {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract week information
    const weekMatch = content.match(/(\d{1,2})-(\d{1,2}) de (\w+)/);
    const yearMatch = content.match(/20\d{4}/);
    
    let semana = 'Semana não identificada';
    let data_inicio = new Date().toISOString().split('T')[0];
    let data_fim = new Date().toISOString().split('T')[0];
    
    if (weekMatch && yearMatch) {
      const [, startDay, endDay, month] = weekMatch;
      const year = yearMatch[0];
      semana = `${startDay}-${endDay} de ${month}`;
      
      // Convert Portuguese month to number
      const monthMap: { [key: string]: string } = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
      };
      
      const monthNum = monthMap[month.toLowerCase()] || '01';
      data_inicio = `${year}-${monthNum}-${startDay.padStart(2, '0')}`;
      data_fim = `${year}-${monthNum}-${endDay.padStart(2, '0')}`;
    }
    
    // Extract biblical reading
    const leitura_biblica = this.extractBiblicalReading(content);
    
    // Extract songs
    const canticos = this.extractSongs(content);
    
    // Extract meeting parts
    const partes = this.extractMeetingParts(content);
    
    return {
      semana,
      data_inicio,
      data_fim,
      leitura_biblica,
      canticos,
      partes,
      metadata: {
        data_processamento: new Date().toISOString(),
        total_partes: partes.length,
        tempo_total_minutos: partes.reduce((total, parte) => total + parte.tempo_minutos, 0)
      }
    };
  }

  /**
   * Extract biblical reading from content
   */
  private static extractBiblicalReading(content: string): string | undefined {
    // Look for patterns like "PROVÉRBIOS 26", "Pro. 26:1-20", etc.
    const patterns = [
      /([A-ZÁÊÇÕ\s]+\s+\d+)/g,
      /(Pro\.\s+\d+:\d+-\d+)/g,
      /Leitura da Bíblia[^\n]*([A-Z][a-z]+\s+\d+)/g
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    
    return undefined;
  }

  /**
   * Extract song numbers from content
   */
  private static extractSongs(content: string): { abertura?: number; meio?: number; encerramento?: number } {
    const canticos: { abertura?: number; meio?: number; encerramento?: number } = {};
    
    // Look for song patterns
    const songMatches = content.match(/Cântico\s+(\d+)/g);
    
    if (songMatches) {
      const numbers = songMatches.map(match => {
        const num = match.match(/\d+/);
        return num ? parseInt(num[0]) : 0;
      }).filter(num => num > 0);
      
      if (numbers.length >= 1) canticos.abertura = numbers[0];
      if (numbers.length >= 2) canticos.meio = numbers[1];
      if (numbers.length >= 3) canticos.encerramento = numbers[2];
    }
    
    return canticos;
  }

  /**
   * Extract meeting parts from content
   */
  private static extractMeetingParts(content: string): ParsedMeetingPart[] {
    const partes: ParsedMeetingPart[] = [];
    let numeroParteAtual = 1;
    
    // Define part patterns and their types
    const partPatterns = [
      {
        pattern: /Comentários iniciais\s*\((\d+)\s*min\)/i,
        tipo: 'comentarios_iniciais',
        titulo: 'Comentários iniciais'
      },
      {
        pattern: /(\d+)\.\s*([^(]+)\s*\((\d+)\s*min\)/g,
        tipo: 'parte_numerada',
        titulo: null // Will be extracted from match
      },
      {
        pattern: /Leitura da Bíblia[^(]*\((\d+)\s*min\)/i,
        tipo: 'leitura_biblica',
        titulo: 'Leitura da Bíblia'
      },
      {
        pattern: /Estudo bíblico de congregação[^(]*\((\d+)\s*min\)/i,
        tipo: 'estudo_biblico_congregacao',
        titulo: 'Estudo bíblico de congregação'
      },
      {
        pattern: /Comentários finais\s*\((\d+)\s*min\)/i,
        tipo: 'comentarios_finais',
        titulo: 'Comentários finais'
      }
    ];
    
    // Extract numbered parts (1., 2., 3., etc.)
    const numberedPartRegex = /(\d+)\.\s*([^(]+?)\s*\((\d+)\s*min\)/g;
    let match;
    
    while ((match = numberedPartRegex.exec(content)) !== null) {
      const [, partNum, titulo, tempo] = match;
      
      // Determine part type based on content
      let tipo_parte = 'parte_geral';
      const tituloLower = titulo.toLowerCase().trim();
      
      if (tituloLower.includes('tesouro') || tituloLower.includes('palavra de deus')) {
        tipo_parte = 'tesouros_palavra';
      } else if (tituloLower.includes('joia') || tituloLower.includes('espiritual')) {
        tipo_parte = 'joias_espirituais';
      } else if (tituloLower.includes('leitura')) {
        tipo_parte = 'leitura_biblica';
      } else if (tituloLower.includes('conversa') || tituloLower.includes('ministério')) {
        tipo_parte = 'parte_ministerio';
      } else if (tituloLower.includes('discurso')) {
        tipo_parte = 'discurso';
      } else if (tituloLower.includes('vida cristã')) {
        tipo_parte = 'vida_crista';
      } else if (tituloLower.includes('estudo bíblico')) {
        tipo_parte = 'estudo_biblico_congregacao';
      }
      
      partes.push({
        numero_parte: parseInt(partNum),
        titulo_parte: titulo.trim(),
        tipo_parte,
        tempo_minutos: parseInt(tempo),
        descricao: this.extractPartDescription(content, titulo)
      });
    }
    
    // Add standard parts that might not be numbered
    const standardParts = [
      { pattern: /Comentários iniciais\s*\((\d+)\s*min\)/i, tipo: 'comentarios_iniciais', titulo: 'Comentários iniciais' },
      { pattern: /Comentários finais\s*\((\d+)\s*min\)/i, tipo: 'comentarios_finais', titulo: 'Comentários finais' }
    ];
    
    for (const part of standardParts) {
      const match = content.match(part.pattern);
      if (match) {
        const tempo = parseInt(match[1]);
        
        // Check if this part is already added
        const exists = partes.some(p => p.tipo_parte === part.tipo);
        if (!exists) {
          partes.push({
            numero_parte: part.tipo === 'comentarios_iniciais' ? 0 : 99,
            titulo_parte: part.titulo,
            tipo_parte: part.tipo,
            tempo_minutos: tempo
          });
        }
      }
    }
    
    // Sort parts by number
    return partes.sort((a, b) => a.numero_parte - b.numero_parte);
  }

  /**
   * Extract description for a specific part
   */
  private static extractPartDescription(content: string, titulo: string): string | undefined {
    // Look for content after the part title
    const titleIndex = content.indexOf(titulo);
    if (titleIndex === -1) return undefined;
    
    const afterTitle = content.substring(titleIndex + titulo.length);
    const nextPartMatch = afterTitle.match(/\n\d+\./);
    
    if (nextPartMatch) {
      const description = afterTitle.substring(0, nextPartMatch.index).trim();
      return description.length > 10 ? description : undefined;
    }
    
    return undefined;
  }

  /**
   * Validate parsed content
   */
  static validateParsedContent(parsed: ParsedJWContent): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!parsed.semana || parsed.semana === 'Semana não identificada') {
      errors.push('Semana não foi identificada corretamente');
    }
    
    if (parsed.partes.length < 3) {
      errors.push('Número insuficiente de partes identificadas (mínimo 3)');
    }
    
    if (parsed.metadata.tempo_total_minutos < 60) {
      errors.push('Tempo total muito baixo (mínimo 60 minutos)');
    }
    
    // Check for required part types
    const requiredTypes = ['tesouros_palavra', 'parte_ministerio', 'vida_crista'];
    const foundTypes = parsed.partes.map(p => p.tipo_parte);
    
    for (const requiredType of requiredTypes) {
      if (!foundTypes.includes(requiredType)) {
        errors.push(`Tipo de parte obrigatória não encontrada: ${requiredType}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate Excel template from parsed content
   */
  static generateTemplateData(parsed: ParsedJWContent): any[] {
    const templateData = [
      // Header row
      [
        'Número da Parte',
        'Título da Parte',
        'Tipo de Parte',
        'Tempo (min)',
        'Estudante Principal',
        'Ajudante',
        'Sala',
        'Observações'
      ]
    ];
    
    // Add each part as a row
    parsed.partes.forEach(parte => {
      templateData.push([
        parte.numero_parte,
        parte.titulo_parte,
        parte.tipo_parte,
        parte.tempo_minutos,
        '', // Estudante Principal - to be filled by instructor
        '', // Ajudante - to be filled by instructor
        'Principal', // Default room
        parte.descricao || '' // Observações
      ]);
    });
    
    return templateData;
  }
}
