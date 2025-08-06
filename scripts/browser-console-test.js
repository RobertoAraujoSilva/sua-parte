// Browser Console Test for Profile Fetching
// Copy and paste this into the browser console while logged in to test profile access

(function() {
  console.log('🧪 Browser Console Profile Test Loaded');
  
  // Test function that can be called from console
  window.testProfileFetch = async function() {
    console.log('🔍 Testing profile fetch in browser console...\n');
    
    // Get supabase client from the app
    const supabase = window.supabase || window._supabase;
    if (!supabase) {
      console.error('❌ Supabase client not found. Make sure you are on the app page.');
      return;
    }
    
    try {
      // Step 1: Check session
      console.log('1️⃣ Checking session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        return;
      }
      
      if (!session) {
        console.error('❌ No session found. Please log in first.');
        return;
      }
      
      console.log('✅ Session found:', session.user.id, session.user.email);
      const userId = session.user.id;
      
      // Step 2: Test user_profiles view
      console.log('\n2️⃣ Testing user_profiles view...');
      try {
        const startTime = Date.now();
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        const endTime = Date.now();
        
        console.log(`⏱️ Query took ${endTime - startTime}ms`);
        
        if (error) {
          console.error('❌ View query error:', error);
        } else {
          console.log('✅ View query success:', data);
        }
      } catch (viewErr) {
        console.error('❌ View query exception:', viewErr);
      }
      
      // Step 3: Test profiles table directly
      console.log('\n3️⃣ Testing profiles table directly...');
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileError) {
          console.error('❌ Profiles table error:', profileError);
        } else {
          console.log('✅ Profiles table success:', profileData);
        }
      } catch (profileErr) {
        console.error('❌ Profiles table exception:', profileErr);
      }
      
      // Step 4: Test secure function
      console.log('\n4️⃣ Testing secure function...');
      try {
        const { data: funcData, error: funcError } = await supabase
          .rpc('get_user_profile', { user_id: userId });
        
        if (funcError) {
          console.error('❌ Function error:', funcError);
        } else {
          console.log('✅ Function success:', funcData);
        }
      } catch (funcErr) {
        console.error('❌ Function exception:', funcErr);
      }
      
      console.log('\n🏁 Profile fetch test completed!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  };
  
  // Test auth state
  window.testAuthState = async function() {
    console.log('🔐 Testing auth state...\n');
    
    const supabase = window.supabase || window._supabase;
    if (!supabase) {
      console.error('❌ Supabase client not found.');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session);
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User:', user);
      
    } catch (error) {
      console.error('❌ Auth state test failed:', error);
    }
  };
  
  // Quick test for Franklin specifically
  window.testFranklinProfile = async function() {
    console.log('👨‍🎓 Testing Franklin\'s profile specifically...\n');
    
    const supabase = window.supabase || window._supabase;
    if (!supabase) {
      console.error('❌ Supabase client not found.');
      return;
    }
    
    const franklinId = '77c99e53-500b-4140-b7fc-a69f96b216e1';
    
    try {
      // Check if we're logged in as Franklin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id !== franklinId) {
        console.error('❌ Not logged in as Franklin. Current user:', session?.user?.id);
        return;
      }
      
      console.log('✅ Logged in as Franklin, testing profile access...');
      
      // Test the exact query the app uses
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', franklinId)
        .single();
      
      if (error) {
        console.error('❌ Franklin profile fetch failed:', error);
      } else {
        console.log('✅ Franklin profile fetched successfully:', data);
        console.log('   Role:', data.role);
        console.log('   Should redirect to:', `/estudante/${franklinId}`);
      }
      
    } catch (error) {
      console.error('❌ Franklin test failed:', error);
    }
  };
  
  console.log('📋 Available test functions:');
  console.log('   testProfileFetch() - Test profile fetching');
  console.log('   testAuthState() - Test auth state');
  console.log('   testFranklinProfile() - Test Franklin specifically');
  console.log('\n💡 Run any of these functions to debug the issue!');
})();
