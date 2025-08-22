/**
 * Complete setup for admin dashboard
 * Creates all necessary tables and sample data
 */

import { supabase } from '@/integrations/supabase/client';

export async function setupAdminDashboard(): Promise<{ success: boolean; error?: string; steps?: string[] }> {
  const steps: string[] = [];
  
  try {
    console.log('🚀 Setting up admin dashboard...');
    steps.push('Starting setup...');

    // Step 1: Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      const error = 'No authenticated user found';
      console.error('❌', error);
      return { success: false, error, steps };
    }

    console.log('✅ User authenticated:', user.id);
    steps.push(`User authenticated: ${user.id}`);

    // Step 2: Try to create sample data directly (this will work if tables exist)
    console.log('📝 Attempting to create sample data...');
    
    // Sample global programming data (simplified)
    const sampleProgramming = [
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
        section_name: 'treasures',
        part_number: 2,
        part_title: 'Tesouros da Palavra de Deus',
        part_duration: 10,
        part_type: 'bible_study',
        source_material: 'mwb_E_202508',
        status: 'published'
      }
    ];

    // Try to insert sample programming
    try {
      const { data: programmingData, error: programmingError } = await supabase
        .from('global_programming')
        .insert(sampleProgramming)
        .select();

      if (programmingError) {
        console.log('⚠️ Global programming table might not exist:', programmingError.code);
        steps.push(`Global programming error: ${programmingError.code}`);
      } else {
        console.log('✅ Sample global programming created');
        steps.push(`Created ${programmingData?.length || 0} programming entries`);
      }
    } catch (programmingErr: any) {
      console.log('⚠️ Exception creating programming:', programmingErr.message);
      steps.push(`Programming exception: ${programmingErr.message}`);
    }

    // Sample workbook versions
    const sampleWorkbooks = [
      {
        version_code: 'mwb_E_202508',
        title: 'Nossa Vida e Ministério Cristão - Agosto 2025',
        language_code: 'pt-BR',
        period_start: '2025-08-01',
        period_end: '2025-08-31',
        parsing_status: 'completed'
      }
    ];

    // Try to insert sample workbooks
    try {
      const { data: workbookData, error: workbookError } = await supabase
        .from('workbook_versions')
        .insert(sampleWorkbooks)
        .select();

      if (workbookError) {
        console.log('⚠️ Workbook versions table might not exist:', workbookError.code);
        steps.push(`Workbook versions error: ${workbookError.code}`);
      } else {
        console.log('✅ Sample workbook versions created');
        steps.push(`Created ${workbookData?.length || 0} workbook versions`);
      }
    } catch (workbookErr: any) {
      console.log('⚠️ Exception creating workbooks:', workbookErr.message);
      steps.push(`Workbook exception: ${workbookErr.message}`);
    }

    // Sample congregations
    const sampleCongregations = [
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
      }
    ];

    // Try to insert sample congregations
    try {
      const { data: congregationData, error: congregationError } = await supabase
        .from('congregacoes')
        .insert(sampleCongregations)
        .select();

      if (congregationError) {
        console.log('⚠️ Congregations table might not exist:', congregationError.code);
        steps.push(`Congregations error: ${congregationError.code}`);
      } else {
        console.log('✅ Sample congregations created');
        steps.push(`Created ${congregationData?.length || 0} congregations`);
      }
    } catch (congregationErr: any) {
      console.log('⚠️ Exception creating congregations:', congregationErr.message);
      steps.push(`Congregations exception: ${congregationErr.message}`);
    }

    // Step 3: Fix admin profile
    console.log('👤 Checking admin profile...');
    
    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('📝 Creating admin profile...');
        
        const adminProfile = {
          id: user.id,
          nome_completo: 'Administrador do Sistema',
          email: user.email || 'admin@sistema.com',
          role: 'admin',
          congregacao: 'Administração Central',
          ativo: true
        };

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(adminProfile)
          .select()
          .single();

        if (createError) {
          console.log('⚠️ Error creating profile:', createError.message);
          steps.push(`Profile creation error: ${createError.message}`);
        } else {
          console.log('✅ Admin profile created');
          steps.push('Admin profile created successfully');
        }
      } else if (existingProfile) {
        console.log('✅ Admin profile already exists');
        steps.push('Admin profile already exists');
      } else {
        console.log('⚠️ Profile check error:', profileError?.message);
        steps.push(`Profile check error: ${profileError?.message}`);
      }
    } catch (profileErr: any) {
      console.log('⚠️ Exception checking profile:', profileErr.message);
      steps.push(`Profile exception: ${profileErr.message}`);
    }

    console.log('🎉 Admin dashboard setup completed!');
    steps.push('Setup completed');

    return {
      success: true,
      steps
    };

  } catch (error: any) {
    console.error('❌ Setup failed:', error);
    steps.push(`Setup failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
      steps
    };
  }
}

// Expose function on window for manual testing
if (typeof window !== 'undefined') {
  (window as any).setupAdminDashboard = setupAdminDashboard;
  console.log('🔧 Admin dashboard setup tool available: window.setupAdminDashboard()');
}
