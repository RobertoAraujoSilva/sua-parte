import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testBasicAuth() {
  console.log('🔐 Testing basic authentication (without role system)...');
  
  try {
    const testEmail = `test-basic-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    console.log('\n1. Testing sign up...');
    console.log('📧 Email:', testEmail);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nome_completo: 'Test User Basic',
          congregacao: 'Test Congregation',
          cargo: 'publicador_batizado'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Sign up error:', signUpError.message);
      return false;
    }
    
    console.log('✅ Sign up successful');
    console.log('📋 User ID:', signUpData.user?.id);
    console.log('📋 User email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
    
    // Test sign in
    console.log('\n2. Testing sign in...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Sign in error:', signInError.message);
      
      // If email not confirmed, that's expected
      if (signInError.message.includes('Email not confirmed')) {
        console.log('ℹ️ This is expected - email confirmation required');
        console.log('✅ Sign up process is working correctly');
        return true;
      }
      return false;
    }
    
    console.log('✅ Sign in successful');
    
    // Test profile creation/retrieval
    console.log('\n3. Testing profile...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();
    
    if (profileError) {
      console.log('ℹ️ Profile not found (expected if trigger not set up):', profileError.message);
    } else {
      console.log('✅ Profile found:', profile);
    }
    
    // Test session
    console.log('\n4. Testing session...');
    
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
    } else {
      console.log('✅ Session retrieved:', session.session ? 'Active' : 'No session');
    }
    
    // Clean up
    await supabase.auth.signOut();
    console.log('🧹 Signed out');
    
    return true;
    
  } catch (error) {
    console.error('💥 Basic auth test failed:', error);
    return false;
  }
}

async function testDatabaseTables() {
  console.log('\n📊 Testing database table access...');
  
  const tables = ['profiles', 'estudantes', 'programas', 'designacoes', 'notificacoes'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Accessible`);
      }
    } catch (err) {
      console.log(`💥 ${table}: ${err.message}`);
    }
  }
}

async function runBasicTests() {
  console.log('🚀 Starting basic authentication tests...');
  
  await testDatabaseTables();
  
  const authOk = await testBasicAuth();
  
  if (authOk) {
    console.log('\n🎉 Basic authentication is working!');
    console.log('📋 Next steps:');
    console.log('   1. Apply the database migration for role support');
    console.log('   2. Test the full dual-role authentication system');
  } else {
    console.log('\n❌ Basic authentication has issues that need to be resolved');
  }
}

runBasicTests().then(() => {
  console.log('\n🏁 Basic test suite completed');
}).catch(error => {
  console.error('💥 Basic test suite failed:', error);
});
