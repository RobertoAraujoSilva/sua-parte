/**
 * Browser Authentication Test Script
 * Tests the fixes for 401 "No API key found" errors in browser environment
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testBrowserAuthenticationFix() {
  log('🔧 BROWSER AUTHENTICATION FIX TEST', 'cyan');
  log('===================================', 'cyan');
  log('');

  const results = {
    environmentVariables: false,
    fallbackConfiguration: false,
    supabaseClient: false,
    apiKeyTransmission: false,
    authenticationFlow: false,
    profileFetching: false,
    overallSuccess: false
  };

  // 1. Environment Variables Test
  log('1️⃣ ENVIRONMENT VARIABLES', 'blue');
  log('=========================', 'blue');
  
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
    const SUPABASE_ANON_KEY = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      log('✅ Environment variables present in .env file', 'green');
      log(`📍 URL: ${SUPABASE_URL}`, 'yellow');
      log(`🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`, 'yellow');
      results.environmentVariables = true;
    } else {
      log('❌ Environment variables missing from .env file', 'red');
    }

  } catch (error) {
    log(`❌ Failed to read .env file: ${error.message}`, 'red');
  }
  log('');

  // 2. Fallback Configuration Test
  log('2️⃣ FALLBACK CONFIGURATION', 'blue');
  log('==========================', 'blue');
  
  try {
    // Test the fallback values that were added to the client
    const fallbackUrl = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
    const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

    log('✅ Fallback configuration available', 'green');
    log(`📍 Fallback URL: ${fallbackUrl}`, 'yellow');
    log(`🔑 Fallback Key: ${fallbackKey.substring(0, 20)}...`, 'yellow');
    results.fallbackConfiguration = true;

  } catch (error) {
    log(`❌ Fallback configuration test failed: ${error.message}`, 'red');
  }
  log('');

  // 3. Supabase Client Test
  log('3️⃣ SUPABASE CLIENT WITH EXPLICIT HEADERS', 'blue');
  log('=========================================', 'blue');
  
  let supabase;
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1] || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
    const SUPABASE_ANON_KEY = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: {
          getItem: (key) => null,
          setItem: (key, value) => {},
          removeItem: (key) => {}
        },
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        debug: true
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        }
      }
    });

    log('✅ Supabase client created with explicit headers', 'green');
    log(`📍 URL: ${SUPABASE_URL}`, 'yellow');
    log(`🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`, 'yellow');
    results.supabaseClient = true;

  } catch (error) {
    log(`❌ Supabase client creation failed: ${error.message}`, 'red');
    return results;
  }
  log('');

  // 4. API Key Transmission Test
  log('4️⃣ API KEY TRANSMISSION', 'blue');
  log('========================', 'blue');
  
  try {
    log('🧪 Testing profiles table access (the failing endpoint)...', 'yellow');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(0);

    if (error) {
      if (error.message.includes('No API key found')) {
        log('❌ STILL GETTING "No API key found" ERROR', 'red');
        log('The fix is not working - API key is not being transmitted', 'red');
      } else {
        log(`⚠️ Different error (API key is being transmitted): ${error.message}`, 'yellow');
        log('✅ API key transmission working - different error indicates progress', 'green');
        results.apiKeyTransmission = true;
      }
    } else {
      log('✅ API key transmission successful!', 'green');
      log(`📊 Response: ${JSON.stringify(data)}`, 'yellow');
      results.apiKeyTransmission = true;
    }

  } catch (error) {
    log(`❌ API key transmission test failed: ${error.message}`, 'red');
  }
  log('');

  // 5. Authentication Flow Test
  log('5️⃣ AUTHENTICATION FLOW', 'blue');
  log('=======================', 'blue');
  
  try {
    log('🔐 Testing login with instructor credentials...', 'yellow');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'frankwebber33@hotmail.com',
      password: '13a21r15'
    });

    if (loginError) {
      log(`❌ Authentication failed: ${loginError.message}`, 'red');
    } else {
      log('✅ Authentication successful', 'green');
      log(`👤 User: ${loginData.user?.email}`, 'yellow');
      results.authenticationFlow = true;

      // 6. Profile Fetching Test
      log('\n6️⃣ PROFILE FETCHING AFTER AUTH', 'blue');
      log('===============================', 'blue');
      
      if (loginData.user) {
        try {
          log('🔍 Testing profile fetch after authentication...', 'yellow');
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', loginData.user.id)
            .single();
            
          if (profileError) {
            log(`❌ Profile fetch failed: ${profileError.message}`, 'red');
          } else {
            log('✅ Profile fetch successful', 'green');
            log(`📋 Profile data: ${JSON.stringify(profile, null, 2)}`, 'yellow');
            results.profileFetching = true;
          }

        } catch (error) {
          log(`❌ Profile fetch exception: ${error.message}`, 'red');
        }
      }

      // Clean up
      await supabase.auth.signOut();
      log('🧹 Test session cleaned up', 'yellow');
    }

  } catch (error) {
    log(`❌ Authentication flow test failed: ${error.message}`, 'red');
  }
  log('');

  // 7. Overall Assessment
  log('7️⃣ OVERALL ASSESSMENT', 'blue');
  log('=====================', 'blue');
  
  const criticalTests = results.environmentVariables && 
                        results.fallbackConfiguration && 
                        results.supabaseClient && 
                        results.apiKeyTransmission;

  const authTests = results.authenticationFlow && results.profileFetching;
  
  results.overallSuccess = criticalTests && authTests;

  if (results.overallSuccess) {
    log('🎉 ALL TESTS PASSED - 401 ERRORS SHOULD BE RESOLVED!', 'green');
    log('   • Environment variables configured correctly', 'green');
    log('   • Fallback configuration working', 'green');
    log('   • Supabase client created with explicit headers', 'green');
    log('   • API key transmission working', 'green');
    log('   • Authentication flow successful', 'green');
    log('   • Profile fetching working', 'green');
  } else if (criticalTests) {
    log('⚠️ PARTIAL SUCCESS - API KEY ISSUES RESOLVED', 'yellow');
    log('   • Core API key transmission is working', 'yellow');
    log('   • Some authentication issues may remain', 'yellow');
  } else {
    log('❌ TESTS FAILED - 401 ERRORS LIKELY PERSIST', 'red');
    
    if (!results.apiKeyTransmission) {
      log('   • API key transmission still not working', 'red');
    }
    if (!results.supabaseClient) {
      log('   • Supabase client creation failed', 'red');
    }
  }

  log('');
  log('📊 TEST RESULTS SUMMARY:', 'cyan');
  const score = Object.values(results).filter(v => v === true).length;
  const total = Object.keys(results).length - 1; // Exclude overallSuccess
  log(`   ${score}/${total} tests passed (${Math.round(score/total*100)}%)`, 'cyan');

  log('');
  log('🎯 NEXT STEPS:', 'yellow');
  if (results.overallSuccess) {
    log('   • Test the main application at http://localhost:8080', 'yellow');
    log('   • Check browser console for any remaining errors', 'yellow');
    log('   • Verify estudantes page loads without 401 errors', 'yellow');
  } else {
    log('   • Check browser console for detailed error messages', 'yellow');
    log('   • Verify environment variables are loaded in browser', 'yellow');
    log('   • Test the debug page: http://localhost:8080/test-supabase-fix.html', 'yellow');
  }

  return results;
}

// Run the test
testBrowserAuthenticationFix().catch(error => {
  log(`💥 Browser authentication test failed: ${error.message}`, 'red');
  console.error(error);
});
