import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseSchema() {
  console.log('🔍 Testing database schema...');
  
  try {
    // Test 1: Check if profiles table exists and has role column
    console.log('\n1. Testing profiles table structure...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
      if (profiles && profiles.length > 0) {
        console.log('📋 Sample profile structure:', Object.keys(profiles[0]));
        if (profiles[0].role !== undefined) {
          console.log('✅ Role column exists in profiles table');
        } else {
          console.log('❌ Role column missing from profiles table');
        }
      } else {
        console.log('ℹ️ No profiles found (table is empty)');
      }
    }

    // Test 2: Check if user_profiles view exists
    console.log('\n2. Testing user_profiles view...');
    const { data: userProfiles, error: viewError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (viewError) {
      console.error('❌ User profiles view error:', viewError.message);
    } else {
      console.log('✅ User profiles view accessible');
    }

    // Test 3: Test authentication
    console.log('\n3. Testing authentication...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
    } else {
      console.log('✅ Authentication system accessible');
      console.log('📋 Current session:', session.session ? 'Active' : 'No active session');
    }

    // Test 4: Check estudantes table
    console.log('\n4. Testing estudantes table...');
    const { data: estudantes, error: estudantesError } = await supabase
      .from('estudantes')
      .select('*')
      .limit(1);
    
    if (estudantesError) {
      console.error('❌ Estudantes table error:', estudantesError.message);
    } else {
      console.log('✅ Estudantes table accessible');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the test
testDatabaseSchema().then(() => {
  console.log('\n🏁 Database schema test completed');
}).catch(error => {
  console.error('💥 Test failed:', error);
});
