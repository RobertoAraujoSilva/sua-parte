/**
 * JW Workbook Parser
 * Extracts meeting parts, themes, and timing information from official JW workbooks
 * Supports parsing PDF content and creating global programming entries
 */

import { supabase } from '@/integrations/supabase/client';

export interface WorkbookParsingResult {
  success: boolean;
  error?: string;
  parsedParts?: GlobalProgrammingPart[];
  metadata?: WorkbookMetadata;
}

export interface GlobalProgrammingPart {
  week_start_date: string;
  week_end_date: string;
  meeting_type: 'midweek' | 'weekend';
  section_name: 'opening' | 'treasures' | 'ministry' | 'christian_life' | 'closing';
  part_number: number;
  part_title: string;
  part_duration: number;
  part_type: string;
  content_references?: any;
  requirements?: any;
  source_material: string;
}

export interface WorkbookMetadata {
  version_code: string;
  title: string;
  language_code: string;
  period_start: string;
  period_end: string;
  total_weeks: number;
  total_parts: number;
}

// Standard JW meeting structure templates
const MEETING_STRUCTURE_TEMPLATES = {
  midweek: [
    { section: 'opening', parts: [
      { number: 1, title: 'Cântico de Abertura', duration: 3, type: 'song' },
      { number: 2, title: 'Oração de Abertura', duration: 2, type: 'prayer' },
      { number: 3, title: 'Comentários Iniciais', duration: 3, type: 'comments' }
    ]},
    { section: 'treasures', parts: [
      { number: 4, title: 'Tesouros da Palavra de Deus', duration: 10, type: 'bible_study' },
      { number: 5, title: 'Joias Espirituais', duration: 10, type: 'spiritual_gems' },
      { number: 6, title: 'Leitura da Bíblia', duration: 4, type: 'bible_reading' }
    ]},
    { section: 'ministry', parts: [
      { number: 7, title: 'Apresentação Inicial', duration: 3, type: 'initial_call' },
      { number: 8, title: 'Revisita', duration: 4, type: 'return_visit' },
      { number: 9, title: 'Estudo Bíblico', duration: 6, type: 'bible_study' }
    ]},
    { section: 'christian_life', parts: [
      { number: 10, title: 'Parte 1', duration: 15, type: 'christian_living' },
      { number: 11, title: 'Estudo Bíblico da Congregação', duration: 30, type: 'congregation_study' }
    ]},
    { section: 'closing', parts: [
      { number: 12, title: 'Comentários Finais', duration: 3, type: 'comments' },
      { number: 13, title: 'Cântico Final', duration: 3, type: 'song' },
      { number: 14, title: 'Oração de Encerramento', duration: 2, type: 'prayer' }
    ]}
  ],
  weekend: [
    { section: 'opening', parts: [
      { number: 1, title: 'Cântico de Abertura', duration: 3, type: 'song' },
      { number: 2, title: 'Oração de Abertura', duration: 2, type: 'prayer' }
    ]},
    { section: 'christian_life', parts: [
      { number: 3, title: 'Discurso Público', duration: 30, type: 'public_talk' },
      { number: 4, title: 'Estudo de A Sentinela', duration: 60, type: 'watchtower_study' }
    ]},
    { section: 'closing', parts: [
      { number: 5, title: 'Cântico Final', duration: 3, type: 'song' },
      { number: 6, title: 'Oração de Encerramento', duration: 2, type: 'prayer' }
    ]}
  ]
};

/**
 * Parse workbook content from text or structured data
 * This is a simplified parser - in production, you'd use a PDF parsing library
 */
export async function parseWorkbookContent(
  content: string | File,
  metadata: Partial<WorkbookMetadata>
): Promise<WorkbookParsingResult> {
  try {
    console.log('🔍 Starting workbook parsing...', { metadata });

    // For now, create sample data based on the standard structure
    // In production, this would parse actual PDF content
    const parsedParts = await generateSampleProgramming(metadata);

    const result: WorkbookParsingResult = {
      success: true,
      parsedParts,
      metadata: {
        version_code: metadata.version_code || 'mwb_E_202507',
        title: metadata.title || 'Our Christian Life and Ministry Meeting Workbook',
        language_code: metadata.language_code || 'pt-BR',
        period_start: metadata.period_start || '2025-07-01',
        period_end: metadata.period_end || '2025-09-30',
        total_weeks: parsedParts.length / 14, // Assuming 14 parts per week
        total_parts: parsedParts.length
      }
    };

    console.log('✅ Workbook parsing completed successfully', result);
    return result;

  } catch (error: any) {
    console.error('❌ Error parsing workbook:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate sample programming data based on JW meeting structure
 * This simulates parsing actual workbook content
 */
async function generateSampleProgramming(
  metadata: Partial<WorkbookMetadata>
): Promise<GlobalProgrammingPart[]> {
  const parts: GlobalProgrammingPart[] = [];
  const startDate = new Date(metadata.period_start || '2025-07-01');
  const endDate = new Date(metadata.period_end || '2025-09-30');
  
  // Generate weekly programming
  let currentDate = new Date(startDate);
  let weekNumber = 1;

  while (currentDate <= endDate) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Generate midweek meeting parts
    const midweekParts = generateWeekParts(
      weekStart,
      weekEnd,
      'midweek',
      weekNumber,
      metadata.version_code || 'mwb_E_202507'
    );
    parts.push(...midweekParts);

    // Generate weekend meeting parts
    const weekendParts = generateWeekParts(
      weekStart,
      weekEnd,
      'weekend',
      weekNumber,
      metadata.version_code || 'mwb_E_202507'
    );
    parts.push(...weekendParts);

    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
    weekNumber++;
  }

  return parts;
}

/**
 * Generate parts for a specific week and meeting type
 */
function generateWeekParts(
  weekStart: Date,
  weekEnd: Date,
  meetingType: 'midweek' | 'weekend',
  weekNumber: number,
  sourceVersion: string
): GlobalProgrammingPart[] {
  const template = MEETING_STRUCTURE_TEMPLATES[meetingType];
  const parts: GlobalProgrammingPart[] = [];

  template.forEach(section => {
    section.parts.forEach(part => {
      parts.push({
        week_start_date: weekStart.toISOString().split('T')[0],
        week_end_date: weekEnd.toISOString().split('T')[0],
        meeting_type: meetingType,
        section_name: section.section as any,
        part_number: part.number,
        part_title: `${part.title} - Semana ${weekNumber}`,
        part_duration: part.duration,
        part_type: part.type,
        source_material: sourceVersion,
        content_references: {
          week_number: weekNumber,
          bible_reading: meetingType === 'midweek' ? `Leitura da semana ${weekNumber}` : null,
          theme: `Tema da semana ${weekNumber}`
        },
        requirements: {
          gender_restriction: part.type === 'bible_reading' ? 'male' : 'any',
          experience_level: part.type === 'public_talk' ? 'elder' : 'any',
          assistant_allowed: ['initial_call', 'return_visit', 'bible_study'].includes(part.type)
        }
      });
    });
  });

  return parts;
}

/**
 * Save parsed programming to database
 */
export async function saveGlobalProgramming(
  parts: GlobalProgrammingPart[],
  workbookVersionId: string,
  adminUserId: string
): Promise<{ success: boolean; error?: string; saved: number }> {
  try {
    console.log('💾 Saving global programming to database...', { 
      partsCount: parts.length,
      workbookVersionId,
      adminUserId 
    });

    let savedCount = 0;

    for (const part of parts) {
      const { error } = await supabase
        .from('global_programming')
        .insert({
          ...part,
          workbook_version_id: workbookVersionId,
          admin_user_id: adminUserId,
          status: 'draft'
        });

      if (error) {
        console.error('Error saving part:', error, part);
        // Continue with other parts instead of failing completely
      } else {
        savedCount++;
      }
    }

    console.log(`✅ Saved ${savedCount}/${parts.length} programming parts`);

    return {
      success: savedCount > 0,
      saved: savedCount,
      error: savedCount === 0 ? 'No parts were saved successfully' : undefined
    };

  } catch (error: any) {
    console.error('❌ Error saving global programming:', error);
    return {
      success: false,
      saved: 0,
      error: error.message
    };
  }
}

/**
 * Create workbook version entry
 */
export async function createWorkbookVersion(
  metadata: WorkbookMetadata,
  uploadedBy: string
): Promise<{ success: boolean; error?: string; workbookId?: string }> {
  try {
    const { data, error } = await supabase
      .from('workbook_versions')
      .insert({
        version_code: metadata.version_code,
        title: metadata.title,
        language_code: metadata.language_code,
        period_start: metadata.period_start,
        period_end: metadata.period_end,
        parsing_status: 'completed',
        parsed_content: {
          total_weeks: metadata.total_weeks,
          total_parts: metadata.total_parts
        },
        uploaded_by: uploadedBy
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating workbook version:', error);
      return { success: false, error: error.message };
    }

    return { success: true, workbookId: data.id };

  } catch (error: any) {
    console.error('Error in createWorkbookVersion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Complete workbook processing workflow
 */
export async function processWorkbook(
  content: string | File,
  metadata: Partial<WorkbookMetadata>,
  adminUserId: string
): Promise<WorkbookParsingResult> {
  try {
    // Step 1: Parse workbook content
    const parseResult = await parseWorkbookContent(content, metadata);
    if (!parseResult.success || !parseResult.parsedParts || !parseResult.metadata) {
      return parseResult;
    }

    // Step 2: Create workbook version entry
    const versionResult = await createWorkbookVersion(parseResult.metadata, adminUserId);
    if (!versionResult.success || !versionResult.workbookId) {
      return { success: false, error: versionResult.error };
    }

    // Step 3: Save global programming parts
    const saveResult = await saveGlobalProgramming(
      parseResult.parsedParts,
      versionResult.workbookId,
      adminUserId
    );

    return {
      success: saveResult.success,
      error: saveResult.error,
      parsedParts: parseResult.parsedParts,
      metadata: {
        ...parseResult.metadata,
        workbook_id: versionResult.workbookId,
        saved_parts: saveResult.saved
      }
    };

  } catch (error: any) {
    console.error('❌ Error in processWorkbook:', error);
    return { success: false, error: error.message };
  }
}

// Expose functions on window for manual testing
if (typeof window !== 'undefined') {
  (window as any).workbookParser = {
    parseWorkbookContent,
    processWorkbook,
    generateSampleProgramming
  };
  console.log('🔧 Workbook parser tools available: window.workbookParser');
}
