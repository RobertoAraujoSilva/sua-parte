/**
 * Create sample data for the admin dashboard
 * This script creates sample global programming and workbook data
 */

import { supabase } from '@/integrations/supabase/client';

// Sample global programming data
const SAMPLE_GLOBAL_PROGRAMMING = [
  // Week 1 - Midweek Meeting
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'midweek',
    section_name: 'opening',
    part_number: 1,
    part_title: 'Cântico de Abertura',
    part_duration: 3,
    part_type: 'song',
    source_material: 'mwb_E_202508',
    status: 'published'
  },
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'midweek',
    section_name: 'opening',
    part_number: 2,
    part_title: 'Oração de Abertura',
    part_duration: 2,
    part_type: 'prayer',
    source_material: 'mwb_E_202508',
    status: 'published'
  },
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'midweek',
    section_name: 'treasures',
    part_number: 3,
    part_title: 'Tesouros da Palavra de Deus',
    part_duration: 10,
    part_type: 'bible_study',
    source_material: 'mwb_E_202508',
    content_references: { bible_reading: 'Gênesis 1-3', theme: 'A Criação' },
    status: 'published'
  },
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'midweek',
    section_name: 'treasures',
    part_number: 4,
    part_title: 'Joias Espirituais',
    part_duration: 10,
    part_type: 'spiritual_gems',
    source_material: 'mwb_E_202508',
    content_references: { bible_reading: 'Gênesis 1-3' },
    status: 'published'
  },
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'midweek',
    section_name: 'treasures',
    part_number: 5,
    part_title: 'Leitura da Bíblia',
    part_duration: 4,
    part_type: 'bible_reading',
    source_material: 'mwb_E_202508',
    content_references: { bible_reading: 'Gênesis 1:1-25' },
    requirements: { gender_restriction: 'male' },
    status: 'published'
  },
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'midweek',
    section_name: 'ministry',
    part_number: 6,
    part_title: 'Apresentação Inicial',
    part_duration: 3,
    part_type: 'initial_call',
    source_material: 'mwb_E_202508',
    requirements: { assistant_allowed: true },
    status: 'published'
  },
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'midweek',
    section_name: 'ministry',
    part_number: 7,
    part_title: 'Revisita',
    part_duration: 4,
    part_type: 'return_visit',
    source_material: 'mwb_E_202508',
    requirements: { assistant_allowed: true },
    status: 'published'
  },
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'midweek',
    section_name: 'christian_life',
    part_number: 8,
    part_title: 'Seja Corajoso e Forte',
    part_duration: 15,
    part_type: 'christian_living',
    source_material: 'mwb_E_202508',
    content_references: { theme: 'Coragem na pregação' },
    status: 'published'
  },
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'midweek',
    section_name: 'christian_life',
    part_number: 9,
    part_title: 'Estudo Bíblico da Congregação',
    part_duration: 30,
    part_type: 'congregation_study',
    source_material: 'mwb_E_202508',
    content_references: { publication: 'Estudo Bíblico', chapter: 'Capítulo 1' },
    status: 'published'
  },
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'midweek',
    section_name: 'closing',
    part_number: 10,
    part_title: 'Cântico Final e Oração',
    part_duration: 5,
    part_type: 'closing',
    source_material: 'mwb_E_202508',
    status: 'published'
  },

  // Week 1 - Weekend Meeting
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'weekend',
    section_name: 'opening',
    part_number: 1,
    part_title: 'Cântico de Abertura e Oração',
    part_duration: 5,
    part_type: 'opening',
    source_material: 'mwb_E_202508',
    status: 'published'
  },
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'weekend',
    section_name: 'christian_life',
    part_number: 2,
    part_title: 'Discurso Público: A Importância da Oração',
    part_duration: 30,
    part_type: 'public_talk',
    source_material: 'mwb_E_202508',
    requirements: { experience_level: 'elder' },
    status: 'published'
  },
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'weekend',
    section_name: 'christian_life',
    part_number: 3,
    part_title: 'Estudo de A Sentinela',
    part_duration: 60,
    part_type: 'watchtower_study',
    source_material: 'mwb_E_202508',
    content_references: { publication: 'A Sentinela', article: 'Confie em Jeová' },
    status: 'published'
  },
  {
    week_start_date: '2025-08-04',
    week_end_date: '2025-08-10',
    week_number: 1,
    meeting_type: 'weekend',
    section_name: 'closing',
    part_number: 4,
    part_title: 'Cântico Final e Oração',
    part_duration: 5,
    part_type: 'closing',
    source_material: 'mwb_E_202508',
    status: 'published'
  }
];

// Sample workbook versions
const SAMPLE_WORKBOOK_VERSIONS = [
  {
    version_code: 'mwb_E_202508',
    title: 'Nossa Vida e Ministério Cristão - Agosto 2025',
    language_code: 'pt-BR',
    period_start: '2025-08-01',
    period_end: '2025-08-31',
    parsing_status: 'completed',
    parsed_content: {
      total_weeks: 4,
      total_parts: 56
    }
  },
  {
    version_code: 'mwb_E_202509',
    title: 'Nossa Vida e Ministério Cristão - Setembro 2025',
    language_code: 'pt-BR',
    period_start: '2025-09-01',
    period_end: '2025-09-30',
    parsing_status: 'pending',
    parsed_content: {
      total_weeks: 4,
      total_parts: 56
    }
  }
];

// Sample congregations
const SAMPLE_CONGREGACOES = [
  {
    nome: 'Congregação Central',
    pais: 'Brasil',
    cidade: 'São Paulo',
    ativo: true
  },
  {
    nome: 'Congregação Norte',
    pais: 'Brasil',
    cidade: 'Rio de Janeiro',
    ativo: true
  },
  {
    nome: 'Congregação Sul',
    pais: 'Brasil',
    cidade: 'Belo Horizonte',
    ativo: true
  }
];

export async function createSampleData(): Promise<{ success: boolean; error?: string; created?: any }> {
  try {
    console.log('🚀 Creating sample data for admin dashboard...');

    const results = {
      global_programming: 0,
      workbook_versions: 0,
      congregacoes: 0
    };

    // Create sample global programming data
    console.log('📝 Creating global programming data...');
    try {
      const { data: programmingData, error: programmingError } = await supabase
        .from('global_programming')
        .insert(SAMPLE_GLOBAL_PROGRAMMING)
        .select();

      if (programmingError) {
        console.error('❌ Error creating global programming:', programmingError);
      } else {
        results.global_programming = programmingData?.length || 0;
        console.log(`✅ Created ${results.global_programming} global programming entries`);
      }
    } catch (programmingErr) {
      console.error('❌ Exception creating global programming:', programmingErr);
    }

    // Create sample workbook versions
    console.log('📚 Creating workbook versions...');
    try {
      const { data: workbookData, error: workbookError } = await supabase
        .from('workbook_versions')
        .insert(SAMPLE_WORKBOOK_VERSIONS)
        .select();

      if (workbookError) {
        console.error('❌ Error creating workbook versions:', workbookError);
      } else {
        results.workbook_versions = workbookData?.length || 0;
        console.log(`✅ Created ${results.workbook_versions} workbook versions`);
      }
    } catch (workbookErr) {
      console.error('❌ Exception creating workbook versions:', workbookErr);
    }

    // Create sample congregations
    console.log('🏛️ Creating congregations...');
    try {
      const { data: congregacoesData, error: congregacoesError } = await supabase
        .from('congregacoes')
        .insert(SAMPLE_CONGREGACOES)
        .select();

      if (congregacoesError) {
        console.error('❌ Error creating congregations:', congregacoesError);
      } else {
        results.congregacoes = congregacoesData?.length || 0;
        console.log(`✅ Created ${results.congregacoes} congregations`);
      }
    } catch (congregacoesErr) {
      console.error('❌ Exception creating congregations:', congregacoesErr);
    }

    console.log('🎉 Sample data creation completed!');
    console.log('📊 Results:', results);

    return {
      success: true,
      created: results
    };

  } catch (error: any) {
    console.error('❌ Sample data creation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Expose function on window for manual testing
if (typeof window !== 'undefined') {
  (window as any).createSampleData = createSampleData;
  console.log('🔧 Sample data creation tool available: window.createSampleData()');
}
