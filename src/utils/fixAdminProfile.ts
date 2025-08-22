/**
 * Fix admin profile issue
 * Creates a profile for the admin user if it doesn't exist
 */

import { supabase } from '@/integrations/supabase/client';

export async function fixAdminProfile(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔧 Fixing admin profile...');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ No authenticated user found:', userError);
      return { success: false, error: 'No authenticated user' };
    }

    console.log('👤 Current user ID:', user.id);

    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError);
      return { success: false, error: profileError.message };
    }

    if (existingProfile) {
      console.log('✅ Profile already exists:', existingProfile);
      return { success: true };
    }

    // Create admin profile
    console.log('📝 Creating admin profile...');
    const adminProfile = {
      id: user.id,
      nome_completo: 'Administrador do Sistema',
      email: user.email || 'admin@sistema.com',
      role: 'admin',
      congregacao: 'Administração Central',
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert(adminProfile)
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating profile:', createError);
      return { success: false, error: createError.message };
    }

    console.log('✅ Admin profile created successfully:', newProfile);
    return { success: true };

  } catch (error: any) {
    console.error('❌ Error in fixAdminProfile:', error);
    return { success: false, error: error.message };
  }
}

// Expose function on window for manual testing
if (typeof window !== 'undefined') {
  (window as any).fixAdminProfile = fixAdminProfile;
  console.log('🔧 Admin profile fix tool available: window.fixAdminProfile()');
}
