import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthStatus() {
  console.log('🔐 Testing authentication status...');
  
  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
      return;
    }
    
    if (session?.user) {
      console.log('✅ User is authenticated');
      console.log('📧 Email:', session.user.email);
      console.log('🆔 User ID:', session.user.id);
      
      // Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Profile error:', profileError.message);
        console.log('ℹ️ This might be why the Estudantes page is not accessible');
      } else {
        console.log('✅ Profile found:');
        console.log('   Nome:', profile.nome_completo);
        console.log('   Congregação:', profile.congregacao);
        console.log('   Cargo:', profile.cargo);
        console.log('   Role:', profile.role || 'NOT SET (migration needed)');
      }
    } else {
      console.log('❌ No authenticated user');
      console.log('ℹ️ You need to log in to access the Estudantes page');
      console.log('🔗 Go to: http://localhost:5174/auth');
    }
    
  } catch (error) {
    console.error('💥 Error testing auth status:', error);
  }
}

testAuthStatus().then(() => {
  console.log('\n🏁 Auth status test completed');
}).catch(error => {
  console.error('💥 Auth status test failed:', error);
});
