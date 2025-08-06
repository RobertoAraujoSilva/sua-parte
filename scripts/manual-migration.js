import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCurrentSchema() {
  console.log('🔍 Testing current database schema...');
  
  try {
    // Test 1: Check profiles table structure
    console.log('\n1. Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
      return false;
    }
    
    console.log('✅ Profiles table accessible');
    
    // Test 2: Try to insert a test profile with role to see if column exists
    console.log('\n2. Testing if role column exists...');
    
    // First, let's see what columns exist by trying to select them
    const { data: columnTest, error: columnError } = await supabase
      .from('profiles')
      .select('id, nome_completo, congregacao, cargo, role, created_at, updated_at')
      .limit(1);
    
    if (columnError) {
      if (columnError.message.includes('role')) {
        console.log('❌ Role column does not exist in profiles table');
        console.log('📋 Error:', columnError.message);
        return false;
      } else {
        console.error('❌ Other error:', columnError.message);
        return false;
      }
    } else {
      console.log('✅ Role column exists in profiles table');
      return true;
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return false;
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing authentication system...');
  
  try {
    // Test sign up with role data
    console.log('1. Testing sign up...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nome_completo: 'Test User',
          congregacao: 'Test Congregation',
          cargo: 'publicador_batizado',
          role: 'instrutor'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Sign up error:', signUpError.message);
      return false;
    }
    
    console.log('✅ Sign up successful');
    console.log('📋 User ID:', signUpData.user?.id);
    
    // Test sign in
    console.log('\n2. Testing sign in...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Sign in error:', signInError.message);
      return false;
    }
    
    console.log('✅ Sign in successful');
    
    // Test profile retrieval
    console.log('\n3. Testing profile retrieval...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile retrieval error:', profileError.message);
    } else {
      console.log('✅ Profile retrieved successfully');
      console.log('📋 Profile data:', profile);
    }
    
    // Clean up - sign out
    await supabase.auth.signOut();
    console.log('🧹 Signed out');
    
    return true;
    
  } catch (error) {
    console.error('💥 Authentication test failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting comprehensive authentication system test...');
  
  const schemaOk = await testCurrentSchema();
  
  if (!schemaOk) {
    console.log('\n❌ Database schema is not ready. The migration needs to be applied manually.');
    console.log('📋 Required steps:');
    console.log('   1. Access Supabase dashboard');
    console.log('   2. Go to SQL Editor');
    console.log('   3. Execute the migration SQL from supabase/migrations/20250806120000_add_user_roles.sql');
    return;
  }
  
  console.log('\n✅ Database schema looks good. Testing authentication...');
  
  const authOk = await testAuthentication();
  
  if (authOk) {
    console.log('\n🎉 All tests passed! The authentication system is working correctly.');
  } else {
    console.log('\n❌ Authentication tests failed. Please check the implementation.');
  }
}

// Run the tests
runTests().then(() => {
  console.log('\n🏁 Test suite completed');
}).catch(error => {
  console.error('💥 Test suite failed:', error);
});
