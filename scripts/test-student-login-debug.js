import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testStudentLogin() {
  console.log('🧪 Testing student login flow for Franklin...\n');
  
  const studentEmail = 'franklinmarceloferreiradelima@gmail.com';
  const studentPassword = 'test123456'; // You'll need to provide the actual password
  
  try {
    console.log('1️⃣ Attempting to sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: studentEmail,
      password: studentPassword
    });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      return;
    }

    console.log('✅ Sign in successful!');
    console.log('   User ID:', signInData.user.id);
    console.log('   Email:', signInData.user.email);
    console.log('   Email confirmed:', signInData.user.email_confirmed_at ? 'Yes' : 'No');

    console.log('\n2️⃣ Testing profile fetch...');
    
    // Test fetching profile using the same method as AuthContext
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError);
      console.error('   Error code:', profileError.code);
      console.error('   Error details:', profileError.details);
      console.error('   Error hint:', profileError.hint);
    } else {
      console.log('✅ Profile fetch successful!');
      console.log('   Profile data:', profileData);
      console.log('   Role:', profileData.role);
      console.log('   Name:', profileData.nome_completo);
    }

    console.log('\n3️⃣ Testing role-based logic...');
    const isEstudante = profileData?.role === 'estudante';
    const isInstrutor = profileData?.role === 'instrutor';
    
    console.log('   isEstudante:', isEstudante);
    console.log('   isInstrutor:', isInstrutor);
    
    if (isEstudante) {
      console.log('✅ Student role detected - should redirect to:', `/estudante/${signInData.user.id}`);
    } else {
      console.log('⚠️ Student role NOT detected - role is:', profileData?.role);
    }

    console.log('\n4️⃣ Testing auth.uid() function...');
    const { data: uidTest, error: uidError } = await supabase
      .rpc('exec_sql', { sql: 'SELECT auth.uid() as current_user_id;' });
    
    if (uidError) {
      console.log('⚠️ Cannot test auth.uid() directly (expected with client)');
    } else {
      console.log('   auth.uid():', uidTest);
    }

    // Clean up - sign out
    await supabase.auth.signOut();
    console.log('\n🚪 Signed out successfully');

  } catch (error) {
    console.error('❌ Test failed with exception:', error.message);
  }
}

async function testProfileAccessWithoutAuth() {
  console.log('\n🔒 Testing profile access without authentication...');
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', '77c99e53-500b-4140-b7fc-a69f96b216e1')
      .single();

    if (error) {
      console.log('✅ Unauthenticated access properly blocked:', error.message);
    } else {
      console.error('❌ SECURITY ISSUE: Unauthenticated access allowed!', data);
    }
  } catch (error) {
    console.log('✅ Unauthenticated access blocked by exception:', error.message);
  }
}

async function runDebugTests() {
  console.log('🔍 Student Login Debug Tests\n');
  console.log('Testing authentication flow for Franklin Marcelo Ferreira de Lima');
  console.log('Expected user ID: 77c99e53-500b-4140-b7fc-a69f96b216e1\n');
  
  await testProfileAccessWithoutAuth();
  
  console.log('\n' + '='.repeat(60));
  console.log('⚠️  MANUAL TEST REQUIRED');
  console.log('='.repeat(60));
  console.log('To test the actual login, you need to:');
  console.log('1. Update the password in this script');
  console.log('2. Run: testStudentLogin()');
  console.log('3. Check the console output for debugging info');
  console.log('='.repeat(60));
}

// Run the debug tests
runDebugTests().catch(console.error);
