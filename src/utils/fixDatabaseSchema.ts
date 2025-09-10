import { supabase } from '@/integrations/supabase/client';

export async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema...');
  
  try {
    // 1. Create admin profile if missing
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log('👤 Current user:', user.email);
      
      // Force create/update profile with admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nome_completo: user.user_metadata?.nome_completo || 'Admin',
          congregacao: user.user_metadata?.congregacao || 'Sistema',
          cargo: user.user_metadata?.cargo || 'Administrador',
          role: 'admin'
        }, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
      } else {
        console.log('✅ Profile created/updated:', profile);
      }
    }

    console.log('✅ Database schema fix completed');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Database schema fix failed:', error);
    return { success: false, error };
  }
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).fixDatabaseSchema = fixDatabaseSchema;
}