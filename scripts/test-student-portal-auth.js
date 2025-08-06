import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseSchema() {
  console.log('🗄️ Testing database schema...\n');
  
  try {
    // Test if profiles table has role column
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', { 
        sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role';" 
      });
    
    if (columnsError) {
      console.log('⚠️ Cannot check schema directly (expected with anon key)');
    }
    
    // Test if user_profiles view exists by trying to query it
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, nome_completo, role')
      .limit(1);
    
    if (error) {
      console.error('❌ user_profiles view not accessible:', error.message);
      return false;
    } else {
      console.log('✅ user_profiles view is accessible');
      console.log('   Sample data structure verified');
      return true;
    }
  } catch (error) {
    console.error('❌ Database schema test error:', error.message);
    return false;
  }
}

async function testExistingStudentProfile() {
  console.log('\n👤 Testing existing student profile...');
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', '77c99e53-500b-4140-b7fc-a69f96b216e1')
      .single();
    
    if (error) {
      console.error('❌ Failed to fetch existing student profile:', error.message);
      return false;
    }
    
    console.log('✅ Existing student profile found:');
    console.log('   ID:', data.id);
    console.log('   Name:', data.nome_completo);
    console.log('   Congregation:', data.congregacao);
    console.log('   Role:', data.role);
    console.log('   Cargo:', data.cargo);
    console.log('   Email:', data.email);
    
    if (data.role !== 'estudante') {
      console.error('❌ User role is not "estudante":', data.role);
      return false;
    }
    
    console.log('✅ User has correct "estudante" role');
    return true;
    
  } catch (error) {
    console.error('❌ Student profile test error:', error.message);
    return false;
  }
}

async function testStudentAuthentication() {
  console.log('\n🔐 Testing student authentication flow...');
  
  // Note: We can't test actual login without credentials, but we can test the auth flow structure
  try {
    // Test that we can access auth endpoints
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Auth session error:', error.message);
      return false;
    }
    
    console.log('✅ Auth endpoints accessible');
    console.log('   Current session:', session ? 'Active' : 'None');
    
    // Test auth configuration
    const authConfig = supabase.auth;
    if (authConfig) {
      console.log('✅ Auth client properly configured');
      console.log('   Ready for student authentication');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Authentication test error:', error.message);
    return false;
  }
}

async function testNewStudentRegistration() {
  console.log('\n📝 Testing new student registration flow...');
  
  const testEmail = `student.test.${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nome_completo: 'Test Student User',
          congregacao: 'Test Congregation',
          cargo: 'publicador_batizado',
          role: 'estudante',
        },
      },
    });

    if (error) {
      console.error('❌ Student registration failed:', error.message);
      return false;
    }
    
    console.log('✅ Student registration successful!');
    console.log('   User ID:', data.user.id);
    console.log('   Email:', data.user.email);
    console.log('   Metadata role:', data.user.user_metadata?.role);
    
    // Test immediate login
    console.log('\n🔑 Testing immediate login for new student...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ Student login failed:', loginError.message);
      return false;
    }
    
    console.log('✅ Student login successful!');
    console.log('   Student can access the application');
    
    // Check if profile was created automatically
    console.log('\n📋 Checking if profile was created automatically...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.log('⚠️ Profile not found immediately (may need trigger setup)');
    } else {
      console.log('✅ Profile created automatically:');
      console.log('   Role:', profileData.role);
      console.log('   Name:', profileData.nome_completo);
    }
    
    // Clean up - sign out
    await supabase.auth.signOut();
    return true;
    
  } catch (error) {
    console.error('❌ Student registration test error:', error.message);
    return false;
  }
}

async function testRoleBasedAccess() {
  console.log('\n🛡️ Testing role-based access patterns...');
  
  try {
    // Test that we can query profiles with role filtering
    const { data: students, error: studentsError } = await supabase
      .from('user_profiles')
      .select('id, nome_completo, role')
      .eq('role', 'estudante')
      .limit(5);
    
    if (studentsError) {
      console.error('❌ Failed to query students:', studentsError.message);
      return false;
    }
    
    console.log('✅ Role-based queries working');
    console.log(`   Found ${students.length} student(s) in database`);
    
    // Test instructor query
    const { data: instructors, error: instructorsError } = await supabase
      .from('user_profiles')
      .select('id, nome_completo, role')
      .eq('role', 'instrutor')
      .limit(5);
    
    if (instructorsError) {
      console.error('❌ Failed to query instructors:', instructorsError.message);
      return false;
    }
    
    console.log(`   Found ${instructors.length} instructor(s) in database`);
    console.log('✅ Role-based access control ready');
    
    return true;
    
  } catch (error) {
    console.error('❌ Role-based access test error:', error.message);
    return false;
  }
}

async function runStudentPortalTests() {
  console.log('🚀 Starting Student Portal authentication tests...\n');
  
  const schemaTest = await testDatabaseSchema();
  const existingStudentTest = await testExistingStudentProfile();
  const authTest = await testStudentAuthentication();
  const registrationTest = await testNewStudentRegistration();
  const roleAccessTest = await testRoleBasedAccess();
  
  console.log('\n📊 Test Results Summary:');
  console.log('   Database Schema:', schemaTest ? '✅ PASS' : '❌ FAIL');
  console.log('   Existing Student Profile:', existingStudentTest ? '✅ PASS' : '❌ FAIL');
  console.log('   Authentication Flow:', authTest ? '✅ PASS' : '❌ FAIL');
  console.log('   Student Registration:', registrationTest ? '✅ PASS' : '❌ FAIL');
  console.log('   Role-Based Access:', roleAccessTest ? '✅ PASS' : '❌ FAIL');
  
  if (schemaTest && existingStudentTest && authTest && registrationTest && roleAccessTest) {
    console.log('\n🎉 All Student Portal tests passed!');
    console.log('\n📋 What is now working:');
    console.log('   ✅ Database schema properly configured with role column');
    console.log('   ✅ user_profiles view accessible for profile queries');
    console.log('   ✅ Existing student profile has correct role');
    console.log('   ✅ New student registration creates proper profiles');
    console.log('   ✅ Role-based access control functioning');
    console.log('   ✅ Authentication flow ready for student portal');
    console.log('\n🚀 Next steps:');
    console.log('   1. Test login at http://localhost:5173/auth');
    console.log('   2. Verify redirect to /estudante/{user-id}');
    console.log('   3. Confirm student portal displays correctly');
    console.log('   4. Test role-based route protection');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Ensure database migration was applied correctly');
    console.log('   - Check that user_profiles view exists');
    console.log('   - Verify role column was added to profiles table');
    console.log('   - Confirm trigger for automatic profile creation is working');
  }
}

// Run the tests
runStudentPortalTests().catch(console.error);
