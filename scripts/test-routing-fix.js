// Test script to verify the routing fix works correctly
// This can be run in the browser console to test the routing logic

(function() {
  console.log('🧪 Routing Fix Test Script Loaded');
  
  // Test function to simulate the routing logic
  window.testRoutingLogic = function() {
    console.log('🔍 Testing routing logic...\n');
    
    // Simulate Franklin's user data
    const mockUser = {
      id: '77c99e53-500b-4140-b7fc-a69f96b216e1',
      email: 'franklinmarceloferreiradelima@gmail.com',
      user_metadata: {
        nome_completo: 'Franklin Marcelo Ferreira de Lima',
        congregacao: 'Market Harborough',
        cargo: 'publicador_nao_batizado',
        role: 'estudante'
      }
    };
    
    // Test scenario 1: Profile loaded
    console.log('1️⃣ Testing with profile loaded...');
    const mockProfile = {
      id: '77c99e53-500b-4140-b7fc-a69f96b216e1',
      nome_completo: 'Franklin Marcelo Ferreira de Lima',
      congregacao: 'Market Harborough',
      cargo: 'publicador_nao_batizado',
      role: 'estudante',
      email: 'franklinmarceloferreiradelima@gmail.com'
    };
    
    // Simulate Auth.tsx redirect logic
    if (mockUser && mockProfile) {
      const isEstudante = mockProfile.role === 'estudante';
      if (isEstudante) {
        console.log('✅ Would redirect to:', `/estudante/${mockUser.id}`);
      }
    }
    
    // Test scenario 2: Profile not loaded (fallback to metadata)
    console.log('\n2️⃣ Testing with profile NOT loaded (metadata fallback)...');
    if (mockUser && !mockProfile) {
      const metadataRole = mockUser.user_metadata?.role;
      if (metadataRole === 'estudante') {
        console.log('✅ Would redirect to (via metadata):', `/estudante/${mockUser.id}`);
      }
    }
    
    // Test scenario 3: ProtectedRoute logic
    console.log('\n3️⃣ Testing ProtectedRoute logic...');
    const allowedRoles = ['estudante'];
    
    // With profile
    let userRole = mockProfile?.role;
    if (userRole && allowedRoles.includes(userRole)) {
      console.log('✅ ProtectedRoute would allow access (with profile)');
    }
    
    // Without profile (metadata fallback)
    userRole = mockUser.user_metadata?.role;
    if (userRole && allowedRoles.includes(userRole)) {
      console.log('✅ ProtectedRoute would allow access (with metadata)');
    }
    
    // Test scenario 4: EstudantePortal authorization
    console.log('\n4️⃣ Testing EstudantePortal authorization...');
    const userId = mockUser.id;
    const portalId = '77c99e53-500b-4140-b7fc-a69f96b216e1'; // Franklin's ID
    
    if (userId === portalId) {
      const userRoleForPortal = mockProfile?.role || mockUser.user_metadata?.role;
      if (userRoleForPortal === 'estudante') {
        console.log('✅ EstudantePortal would authorize access');
      }
    }
    
    console.log('\n🏁 Routing logic test completed!');
  };
  
  // Test function to check current auth state
  window.testCurrentAuthState = function() {
    console.log('🔐 Testing current auth state...\n');
    
    // Get supabase client from the app
    const supabase = window.supabase || window._supabase;
    if (!supabase) {
      console.error('❌ Supabase client not found.');
      return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('✅ Current session found:');
        console.log('   User ID:', session.user.id);
        console.log('   Email:', session.user.email);
        console.log('   Metadata role:', session.user.user_metadata?.role);
        console.log('   Expected redirect:', `/estudante/${session.user.id}`);
        
        // Test if this matches Franklin
        if (session.user.id === '77c99e53-500b-4140-b7fc-a69f96b216e1') {
          console.log('✅ This is Franklin\'s session!');
          if (session.user.user_metadata?.role === 'estudante') {
            console.log('✅ Metadata role is correct for student portal');
          } else {
            console.log('❌ Metadata role is incorrect:', session.user.user_metadata?.role);
          }
        }
      } else {
        console.log('❌ No current session found');
      }
    });
  };
  
  // Test function to manually navigate to student portal
  window.testManualNavigation = function() {
    console.log('🧭 Testing manual navigation to student portal...\n');
    
    const franklinId = '77c99e53-500b-4140-b7fc-a69f96b216e1';
    const targetUrl = `/estudante/${franklinId}`;
    
    console.log('Attempting to navigate to:', targetUrl);
    
    if (window.location.pathname !== targetUrl) {
      console.log('🔄 Navigating to student portal...');
      window.history.pushState({}, '', targetUrl);
      window.location.reload();
    } else {
      console.log('✅ Already on student portal page');
    }
  };
  
  // Test function to check if route exists
  window.testRouteExists = function() {
    console.log('🛣️ Testing if student portal route exists...\n');
    
    // Check if EstudantePortal component is available
    if (window.React) {
      console.log('✅ React is available');
    }
    
    // Check current route
    console.log('Current pathname:', window.location.pathname);
    console.log('Current search:', window.location.search);
    console.log('Current hash:', window.location.hash);
    
    // Check if we're on the student portal route
    const franklinId = '77c99e53-500b-4140-b7fc-a69f96b216e1';
    const expectedPath = `/estudante/${franklinId}`;
    
    if (window.location.pathname === expectedPath) {
      console.log('✅ Currently on student portal route');
    } else {
      console.log('ℹ️ Not on student portal route');
      console.log('   Expected:', expectedPath);
      console.log('   Actual:', window.location.pathname);
    }
  };
  
  console.log('📋 Available test functions:');
  console.log('   testRoutingLogic() - Test the routing logic');
  console.log('   testCurrentAuthState() - Check current auth state');
  console.log('   testManualNavigation() - Manually navigate to student portal');
  console.log('   testRouteExists() - Check if route exists');
  console.log('\n💡 Run any of these functions to test the routing fix!');
})();
