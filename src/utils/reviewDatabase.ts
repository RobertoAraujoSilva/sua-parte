import { supabase } from '@/integrations/supabase/client';

export const reviewDatabase = async () => {
  console.log('🔍 Starting database review...');
  
  try {
    // 1. Check estudantes table
    console.log('\n📊 ESTUDANTES TABLE:');
    const { data: estudantes, error: estudantesError } = await supabase
      .from('estudantes')
      .select('*')
      .order('nome');
    
    if (estudantesError) {
      console.error('❌ Error fetching estudantes:', estudantesError);
    } else {
      console.log(`✅ Total estudantes: ${estudantes?.length || 0}`);
      
      // Group by congregation
      const congregacoes = estudantes?.reduce((acc, e) => {
        acc[e.congregacao] = (acc[e.congregacao] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      console.log('📍 Estudantes por congregação:', congregacoes);
      
      // Show first 5 students
      console.log('👥 Primeiros estudantes:');
      estudantes?.slice(0, 5).forEach(e => {
        console.log(`  - ${e.nome} (${e.congregacao}) - ${e.cargo} - User: ${e.user_id}`);
      });
    }

    // 2. Check profiles table
    console.log('\n👤 PROFILES TABLE:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('nome_completo');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`✅ Total profiles: ${profiles?.length || 0}`);
      
      profiles?.forEach(p => {
        console.log(`  - ${p.nome_completo} (${p.email}) - ${p.role} - ${p.congregacao}`);
      });
    }

    // 3. Check congregacoes table if exists
    console.log('\n🏛️ CONGREGACOES TABLE:');
    const { data: congregacoesData, error: congregacoesError } = await supabase
      .from('congregacoes')
      .select('*')
      .order('nome');
    
    if (congregacoesError) {
      console.log('⚠️ Congregacoes table might not exist:', congregacoesError.message);
    } else {
      console.log(`✅ Total congregações: ${congregacoesData?.length || 0}`);
      congregacoesData?.forEach(c => {
        console.log(`  - ${c.nome} (${c.pais}) - ID: ${c.id}`);
      });
    }

    // 4. Check data consistency
    console.log('\n🔍 DATA CONSISTENCY CHECK:');
    
    // Find orphaned students (no matching profile)
    const orphanedStudents = estudantes?.filter(e => 
      !profiles?.some(p => p.id === e.user_id)
    ) || [];
    
    if (orphanedStudents.length > 0) {
      console.log(`⚠️ Found ${orphanedStudents.length} orphaned students (no matching profile):`);
      orphanedStudents.forEach(s => {
        console.log(`  - ${s.nome} (User ID: ${s.user_id})`);
      });
    } else {
      console.log('✅ No orphaned students found');
    }

    // Find profiles without students
    const profilesWithoutStudents = profiles?.filter(p => 
      p.role === 'instrutor' && !estudantes?.some(e => e.user_id === p.id)
    ) || [];
    
    if (profilesWithoutStudents.length > 0) {
      console.log(`⚠️ Found ${profilesWithoutStudents.length} instructor profiles without students:`);
      profilesWithoutStudents.forEach(p => {
        console.log(`  - ${p.nome_completo} (${p.email})`);
      });
    } else {
      console.log('✅ All instructor profiles have students');
    }

    // Check congregation mismatches
    const mismatches = estudantes?.filter(e => {
      const profile = profiles?.find(p => p.id === e.user_id);
      return profile && profile.congregacao !== e.congregacao;
    }) || [];
    
    if (mismatches.length > 0) {
      console.log(`⚠️ Found ${mismatches.length} congregation mismatches:`);
      mismatches.forEach(e => {
        const profile = profiles?.find(p => p.id === e.user_id);
        console.log(`  - Student: ${e.nome} (${e.congregacao}) vs Profile: ${profile?.congregacao}`);
      });
    } else {
      console.log('✅ No congregation mismatches found');
    }

    console.log('\n✅ Database review completed!');
    
    return {
      estudantes: estudantes?.length || 0,
      profiles: profiles?.length || 0,
      congregacoes: congregacoesData?.length || 0,
      orphanedStudents: orphanedStudents.length,
      profilesWithoutStudents: profilesWithoutStudents.length,
      congregationMismatches: mismatches.length
    };

  } catch (error) {
    console.error('❌ Database review failed:', error);
    throw error;
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).reviewDatabase = reviewDatabase;
  console.log('🔧 Database review tool available: window.reviewDatabase()');
}