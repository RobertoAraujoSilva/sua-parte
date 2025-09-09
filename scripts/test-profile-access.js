// Test script to debug profile access issues
// Run this in the browser console after logging in

async function testProfileAccess() {
  console.log('🧪 Testing Profile Access...\n');
  
  // Get the global supabase client (should be available in the app)
  const supabase = window.supabase || window._supabase;
  
  if (!supabase) {
    console.error('❌ Supabase client not found. Make sure you are on the app page.');
    return;
  }
  
  try {
    // Step 1: Check current session
    console.log('1️⃣ Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return;
    }
    
    if (!session) {
      console.error('❌ No active session. Please log in first.');
      return;
    }
    
    console.log('✅ Session found:', {
      userId: session.user.id,
      email: session.user.email,
      expiresAt: new Date(session.expires_at * 1000).toLocaleString()
    });
    
    const userId = session.user.id;
    
    // Step 2: Test debug function
    console.log('\n2️⃣ Testing debug function...');
    try {
      const { data: debugData, error: debugError } = await supabase
        .rpc('debug_auth_access');
      
      if (debugError) {
        console.error('❌ Debug function error:', debugError);
      } else {
        console.log('✅ Debug function result:', debugData);
      }
    } catch (debugErr) {
      console.log('⚠️ Debug function not available:', debugErr.message);
    }
    
    // Step 3: Test direct profiles table access
    console.log('\n3️⃣ Testing direct profiles table access...');
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);
      
      if (profilesError) {
        console.error('❌ Profiles table error:', profilesError);
      } else {
        console.log('✅ Profiles table result:', profilesData);
      }
    } catch (profilesErr) {
      console.error('❌ Profiles table exception:', profilesErr);
    }
    
    // Step 4: Test user_profiles view access
    console.log('\n4️⃣ Testing user_profiles view access...');
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId);
      
      if (viewError) {
        console.error('❌ User_profiles view error:', viewError);
      } else {
        console.log('✅ User_profiles view result:', viewData);
      }
    } catch (viewErr) {
      console.error('❌ User_profiles view exception:', viewErr);
    }
    
    // Step 5: Test single record fetch (what the app does)
    console.log('\n5️⃣ Testing single record fetch...');
    try {
      const { data: singleData, error: singleError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (singleError) {
        console.error('❌ Single record error:', singleError);
      } else {
        console.log('✅ Single record result:', singleData);
      }
    } catch (singleErr) {
      console.error('❌ Single record exception:', singleErr);
    }
    
    // Step 6: Test secure function
    console.log('\n6️⃣ Testing secure function...');
    try {
      const { data: funcData, error: funcError } = await supabase
        .rpc('get_user_profile', { user_id: userId });
      
      if (funcError) {
        console.error('❌ Secure function error:', funcError);
      } else {
        console.log('✅ Secure function result:', funcData);
      }
    } catch (funcErr) {
      console.error('❌ Secure function exception:', funcErr);
    }
    
    console.log('\n🏁 Profile access test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
}

// Auto-run if this script is executed
if (typeof window !== 'undefined') {
  console.log('🔧 Profile access test script loaded.');
  console.log('📋 To run the test, call: testProfileAccess()');
  
  // Make function available globally
  window.testProfileAccess = testProfileAccess;
} else {
  // If running in Node.js context
  testProfileAccess();
}
