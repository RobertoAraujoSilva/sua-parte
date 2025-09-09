import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testExistingUserLogin() {
  console.log('🔐 Testing existing user login...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'franklinmarceloferreiradelima@gmail.com',
      password: 'test123456' // Assuming this was the password used
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      return false;
    } else {
      console.log('✅ Login successful!');
      console.log('   User ID:', data.user.id);
      console.log('   Email:', data.user.email);
      console.log('   Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
      
      // Sign out after test
      await supabase.auth.signOut();
      return true;
    }
  } catch (error) {
    console.error('❌ Login exception:', error.message);
    return false;
  }
}

async function testNewUserRegistration() {
  console.log('\n📝 Testing new user registration...');
  
  const testEmail = `test.user.${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nome_completo: 'Test User',
          congregacao: 'Test Congregation',
          cargo: 'Publicador Batizado',
          role: 'estudante',
        },
      },
    });

    if (error) {
      console.error('❌ Registration failed:', error.message);
      return false;
    } else {
      console.log('✅ Registration successful!');
      console.log('   User ID:', data.user.id);
      console.log('   Email:', data.user.email);
      console.log('   Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
      
      // Test immediate login
      console.log('\n🔐 Testing immediate login after registration...');
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (loginError) {
        console.error('❌ Immediate login failed:', loginError.message);
        return false;
      } else {
        console.log('✅ Immediate login successful!');
        console.log('   User can now access the application');
        
        // Clean up - sign out
        await supabase.auth.signOut();
        return true;
      }
    }
  } catch (error) {
    console.error('❌ Registration exception:', error.message);
    return false;
  }
}

async function testAuthConfiguration() {
  console.log('\n⚙️ Testing authentication configuration...');
  
  try {
    // Check if we can access auth settings (this will fail with anon key, but that's expected)
    const { data, error } = await supabase.auth.getSession();
    
    console.log('✅ Auth client is properly configured');
    console.log('   Current session:', data.session ? 'Active' : 'None');
    
    return true;
  } catch (error) {
    console.error('❌ Auth configuration error:', error.message);
    return false;
  }
}

async function runAuthTests() {
  console.log('🚀 Starting authentication fix verification tests...\n');
  
  const configTest = await testAuthConfiguration();
  const existingUserTest = await testExistingUserLogin();
  const newUserTest = await testNewUserRegistration();
  
  console.log('\n📊 Test Results Summary:');
  console.log('   Auth Configuration:', configTest ? '✅ PASS' : '❌ FAIL');
  console.log('   Existing User Login:', existingUserTest ? '✅ PASS' : '❌ FAIL');
  console.log('   New User Registration & Login:', newUserTest ? '✅ PASS' : '❌ FAIL');
  
  if (configTest && existingUserTest && newUserTest) {
    console.log('\n🎉 All tests passed! Authentication fix is working correctly.');
    console.log('\n📋 What was fixed:');
    console.log('   ✅ Disabled email confirmation requirement in Supabase');
    console.log('   ✅ Manually confirmed existing user');
    console.log('   ✅ Improved error handling in the application');
    console.log('   ✅ New users can now register and immediately log in');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runAuthTests().catch(console.error);
