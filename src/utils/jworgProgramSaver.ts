import { supabase } from '@/integrations/supabase/client';

interface JWorgWeek {
  week: string;
  dateRange: string;
  bibleReading: string;
  songs: { opening: number; middle: number; closing: number };
  parts: any[];
}

interface SaveResult {
  success: boolean;
  saved: number;
  skipped: number;
  errors: string[];
}

/**
 * Parse date range from JW.org format to start date
 * Examples: "11-17 de agosto", "January 13-19"
 */
function parseDateRange(dateRange: string, currentYear: number = new Date().getFullYear()): Date | null {
  try {
    // Portuguese format: "11-17 de agosto"
    const ptMatch = dateRange.match(/(\d{1,2})-\d{1,2}\s+de\s+(\w+)/i);
    if (ptMatch) {
      const day = parseInt(ptMatch[1]);
      const monthName = ptMatch[2].toLowerCase();
      const monthMap: Record<string, number> = {
        'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
        'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
        'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
      };
      const month = monthMap[monthName];
      if (month !== undefined) {
        return new Date(currentYear, month, day);
      }
    }

    // English format: "January 13-19"
    const enMatch = dateRange.match(/(\w+)\s+(\d{1,2})-\d{1,2}/i);
    if (enMatch) {
      const monthName = enMatch[1].toLowerCase();
      const day = parseInt(enMatch[2]);
      const monthMap: Record<string, number> = {
        'january': 0, 'february': 1, 'march': 2, 'april': 3,
        'may': 4, 'june': 5, 'july': 6, 'august': 7,
        'september': 8, 'october': 9, 'november': 10, 'december': 11
      };
      const month = monthMap[monthName];
      if (month !== undefined) {
        return new Date(currentYear, month, day);
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing date range:', error);
    return null;
  }
}

/**
 * Get month name in Portuguese from date
 */
function getMonthYear(date: Date): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Transform JW.org week data to programas table format
 */
function transformWeekToProgram(week: JWorgWeek, userId: string) {
  const startDate = parseDateRange(week.dateRange);
  if (!startDate) {
    throw new Error(`Could not parse date range: ${week.dateRange}`);
  }

  const conteudo = {
    leitura_biblica: week.bibleReading,
    canticos: week.songs,
    partes: week.parts.map((part, index) => ({
      numero: index + 1,
      titulo: part.title,
      duracao_min: part.duration,
      tipo: part.type,
      descricao: part.description,
      referencias: part.references,
      secao: part.section,
    })),
    metadata: {
      total_partes: week.parts.length,
      tempo_total_minutos: week.parts.reduce((sum, p) => sum + (p.duration || 0), 0),
      fonte_dados: 'jw.org',
      data_importacao: new Date().toISOString(),
    },
  };

  return {
    user_id: userId,
    titulo: `Programa: ${week.week}`,
    semana: week.week,
    data_inicio_semana: startDate.toISOString().split('T')[0],
    data: startDate.toISOString().split('T')[0],
    mes_apostila: getMonthYear(startDate),
    conteudo,
    status: 'published',
    assignment_status: 'pending',
  };
}

/**
 * Check if a program already exists for the given week
 */
async function programExists(userId: string, weekStartDate: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('programas')
    .select('id')
    .eq('user_id', userId)
    .eq('data_inicio_semana', weekStartDate)
    .maybeSingle();

  if (error) {
    console.error('Error checking program existence:', error);
    return false;
  }

  return !!data;
}

/**
 * Save multiple JW.org weeks to the programas table
 */
export async function saveJWorgPrograms(weeks: JWorgWeek[], userId: string): Promise<SaveResult> {
  const result: SaveResult = {
    success: true,
    saved: 0,
    skipped: 0,
    errors: [],
  };

  console.log(`💾 Attempting to save ${weeks.length} programs to database...`);

  for (const week of weeks) {
    try {
      // Transform the data
      const programData = transformWeekToProgram(week, userId);

      // Check if already exists
      const exists = await programExists(userId, programData.data_inicio_semana);
      
      if (exists) {
        console.log(`⏭️ Program for ${week.week} already exists, skipping...`);
        result.skipped++;
        continue;
      }

      // Insert into database
      const { error } = await supabase
        .from('programas')
        .insert(programData);

      if (error) {
        console.error(`❌ Error saving program for ${week.week}:`, error);
        result.errors.push(`${week.week}: ${error.message}`);
        result.success = false;
      } else {
        console.log(`✅ Saved program for ${week.week}`);
        result.saved++;
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error processing week ${week.week}:`, errorMsg);
      result.errors.push(`${week.week}: ${errorMsg}`);
      result.success = false;
    }
  }

  console.log(`📊 Save complete: ${result.saved} saved, ${result.skipped} skipped, ${result.errors.length} errors`);
  
  return result;
}

/**
 * Save a single program and return the saved program ID
 */
export async function saveSingleProgram(week: JWorgWeek, userId: string): Promise<{ success: boolean; programId?: string; error?: string }> {
  try {
    const programData = transformWeekToProgram(week, userId);

    // Check if already exists
    const exists = await programExists(userId, programData.data_inicio_semana);
    
    if (exists) {
      return {
        success: false,
        error: 'Program already exists for this week',
      };
    }

    // Insert into database
    const { data, error } = await supabase
      .from('programas')
      .insert(programData)
      .select('id')
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      programId: data.id,
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
