/**
 * Supabase Authentication Diagnostic Script
 * Tests environment variables, client configuration, and API connectivity
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function diagnoseSupabaseAuth() {
  log('🔍 SUPABASE AUTHENTICATION DIAGNOSTIC', 'cyan');
  log('=====================================', 'cyan');
  log('');

  // 1. Check .env file existence and content
  log('1️⃣ Checking .env file...', 'blue');
  
  const envPath = '.env';
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found!', 'red');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  log('✅ .env file found', 'green');
  log(`📄 Contains ${envLines.length} environment variables`, 'yellow');
  
  // Check for required Supabase variables
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const foundVars = {};
  
  for (const line of envLines) {
    const [key, value] = line.split('=');
    if (requiredVars.includes(key)) {
      foundVars[key] = value;
      log(`✅ Found ${key}`, 'green');
    }
  }
  
  for (const reqVar of requiredVars) {
    if (!foundVars[reqVar]) {
      log(`❌ Missing required variable: ${reqVar}`, 'red');
    }
  }
  
  log('');

  // 2. Test environment variable loading in Node.js context
  log('2️⃣ Testing environment variable access...', 'blue');
  
  // Simulate Vite's import.meta.env behavior
  const SUPABASE_URL = foundVars['VITE_SUPABASE_URL'];
  const SUPABASE_ANON_KEY = foundVars['VITE_SUPABASE_ANON_KEY'];
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    log('❌ Environment variables not properly loaded', 'red');
    log(`VITE_SUPABASE_URL: ${SUPABASE_URL ? '✅ Found' : '❌ Missing'}`, SUPABASE_URL ? 'green' : 'red');
    log(`VITE_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing'}`, SUPABASE_ANON_KEY ? 'green' : 'red');
    return;
  }
  
  log('✅ Environment variables loaded successfully', 'green');
  log(`📍 URL: ${SUPABASE_URL}`, 'yellow');
  log(`🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`, 'yellow');
  log('');

  // 3. Test Supabase client creation
  log('3️⃣ Testing Supabase client creation...', 'blue');
  
  let supabase;
  try {
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
      }
    });
    log('✅ Supabase client created successfully', 'green');
  } catch (error) {
    log(`❌ Failed to create Supabase client: ${error.message}`, 'red');
    return;
  }
  log('');

  // 4. Test basic connectivity
  log('4️⃣ Testing basic connectivity...', 'blue');
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      log(`❌ Connectivity test failed: ${error.message}`, 'red');
      log(`🔍 Error code: ${error.code}`, 'yellow');
      log(`🔍 Error details: ${error.details}`, 'yellow');
      log(`🔍 Error hint: ${error.hint}`, 'yellow');
    } else {
      log('✅ Basic connectivity successful', 'green');
      log(`📊 Response: ${JSON.stringify(data)}`, 'yellow');
    }
  } catch (error) {
    log(`❌ Connectivity test exception: ${error.message}`, 'red');
  }
  log('');

  // 5. Test authentication endpoint
  log('5️⃣ Testing authentication endpoint...', 'blue');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      log(`❌ Auth endpoint test failed: ${error.message}`, 'red');
    } else {
      log('✅ Auth endpoint accessible', 'green');
      log(`📊 Session: ${data.session ? 'Active' : 'None'}`, 'yellow');
    }
  } catch (error) {
    log(`❌ Auth endpoint test exception: ${error.message}`, 'red');
  }
  log('');

  // 6. Test with actual credentials
  log('6️⃣ Testing with test credentials...', 'blue');
  
  const testEmail = 'frankwebber33@hotmail.com';
  const testPassword = '13a21r15';
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (error) {
      log(`❌ Test login failed: ${error.message}`, 'red');
      log(`🔍 Error code: ${error.status}`, 'yellow');
    } else {
      log('✅ Test login successful', 'green');
      log(`👤 User: ${data.user?.email}`, 'yellow');
      log(`🔑 Session: ${data.session ? 'Created' : 'None'}`, 'yellow');
      
      // Test profile fetch
      if (data.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileError) {
            log(`❌ Profile fetch failed: ${profileError.message}`, 'red');
          } else {
            log('✅ Profile fetch successful', 'green');
            log(`📋 Profile: ${JSON.stringify(profile, null, 2)}`, 'yellow');
          }
        } catch (profileError) {
          log(`❌ Profile fetch exception: ${profileError.message}`, 'red');
        }
      }
      
      // Clean up - sign out
      await supabase.auth.signOut();
      log('🧹 Test session cleaned up', 'yellow');
    }
  } catch (error) {
    log(`❌ Test login exception: ${error.message}`, 'red');
  }
  log('');

  // 7. Summary and recommendations
  log('7️⃣ Summary and Recommendations', 'blue');
  log('================================', 'blue');
  
  log('🔍 If you see 401 errors in the browser:', 'yellow');
  log('   • Check browser dev tools for exact error messages', 'yellow');
  log('   • Verify Vite is properly loading environment variables', 'yellow');
  log('   • Ensure the browser has access to the same .env file', 'yellow');
  log('   • Check for CORS issues or network connectivity', 'yellow');
  log('');
  
  log('🛠️ Next steps:', 'yellow');
  log('   1. Run this script: node scripts/diagnose-supabase-auth.js', 'yellow');
  log('   2. Check browser console at http://localhost:8080', 'yellow');
  log('   3. Compare results between Node.js and browser environments', 'yellow');
  log('');
  
  log('✅ Diagnostic complete!', 'green');
}

// Run the diagnostic
diagnoseSupabaseAuth().catch(error => {
  log(`💥 Diagnostic failed: ${error.message}`, 'red');
  console.error(error);
});
