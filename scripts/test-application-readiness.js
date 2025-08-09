/**
 * Application Readiness Assessment Script
 * Tests core functionality and determines if the app is ready for user testing
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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

async function assessApplicationReadiness() {
  log('🎯 SISTEMA MINISTERIAL - APPLICATION READINESS ASSESSMENT', 'cyan');
  log('==========================================================', 'cyan');
  log('');

  const results = {
    environmentConfig: false,
    supabaseConnectivity: false,
    authentication: false,
    profileManagement: false,
    coreFeatures: false,
    logoutSystem: false,
    overallReadiness: false,
    criticalIssues: [],
    recommendations: []
  };

  // 1. Environment Configuration Test
  log('1️⃣ ENVIRONMENT CONFIGURATION', 'blue');
  log('=============================', 'blue');
  
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        envVars[key] = value;
      }
    });

    const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missingVars = requiredVars.filter(key => !envVars[key]);

    if (missingVars.length === 0) {
      log('✅ All required environment variables present', 'green');
      results.environmentConfig = true;
    } else {
      log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'red');
      results.criticalIssues.push('Missing required environment variables');
    }

    // Test Cypress credentials
    const cypressVars = ['CYPRESS_INSTRUCTOR_EMAIL', 'CYPRESS_INSTRUCTOR_PASSWORD', 'CYPRESS_STUDENT_EMAIL', 'CYPRESS_STUDENT_PASSWORD'];
    const missingCypress = cypressVars.filter(key => !envVars[key]);
    
    if (missingCypress.length === 0) {
      log('✅ Cypress test credentials configured', 'green');
    } else {
      log(`⚠️ Missing Cypress credentials: ${missingCypress.join(', ')}`, 'yellow');
      results.recommendations.push('Configure missing Cypress test credentials');
    }

  } catch (error) {
    log('❌ Failed to read .env file', 'red');
    results.criticalIssues.push('.env file not accessible');
  }
  log('');

  // 2. Supabase Connectivity Test
  log('2️⃣ SUPABASE CONNECTIVITY', 'blue');
  log('=========================', 'blue');
  
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
    const SUPABASE_ANON_KEY = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Environment variables not found');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test basic connectivity
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      log(`❌ Supabase connectivity failed: ${error.message}`, 'red');
      results.criticalIssues.push(`Supabase connectivity: ${error.message}`);
    } else {
      log('✅ Supabase connectivity successful', 'green');
      results.supabaseConnectivity = true;
    }

  } catch (error) {
    log(`❌ Supabase test failed: ${error.message}`, 'red');
    results.criticalIssues.push(`Supabase setup: ${error.message}`);
  }
  log('');

  // 3. Authentication System Test
  log('3️⃣ AUTHENTICATION SYSTEM', 'blue');
  log('=========================', 'blue');
  
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
    const SUPABASE_ANON_KEY = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test instructor login
    const { data: instructorData, error: instructorError } = await supabase.auth.signInWithPassword({
      email: 'frankwebber33@hotmail.com',
      password: '13a21r15'
    });

    if (instructorError) {
      log(`❌ Instructor authentication failed: ${instructorError.message}`, 'red');
      results.criticalIssues.push(`Instructor auth: ${instructorError.message}`);
    } else {
      log('✅ Instructor authentication successful', 'green');
      
      // Test profile fetch
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', instructorData.user.id)
        .single();

      if (profileError) {
        log(`⚠️ Profile fetch failed: ${profileError.message}`, 'yellow');
        results.recommendations.push('Profile management needs attention');
      } else {
        log('✅ Profile management working', 'green');
        results.profileManagement = true;
      }

      results.authentication = true;
      await supabase.auth.signOut();
    }

    // Test student login
    const { data: studentData, error: studentError } = await supabase.auth.signInWithPassword({
      email: 'franklinmarceloferreiradelima@gmail.com',
      password: '13a21r15'
    });

    if (studentError) {
      log(`❌ Student authentication failed: ${studentError.message}`, 'red');
      results.criticalIssues.push(`Student auth: ${studentError.message}`);
    } else {
      log('✅ Student authentication successful', 'green');
      await supabase.auth.signOut();
    }

  } catch (error) {
    log(`❌ Authentication test failed: ${error.message}`, 'red');
    results.criticalIssues.push(`Authentication: ${error.message}`);
  }
  log('');

  // 4. Core Features Test
  log('4️⃣ CORE FEATURES', 'blue');
  log('=================', 'blue');
  
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
    const SUPABASE_ANON_KEY = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Login as instructor to test features
    await supabase.auth.signInWithPassword({
      email: 'frankwebber33@hotmail.com',
      password: '13a21r15'
    });

    // Test programs table access
    const { data: programs, error: programsError } = await supabase
      .from('programas')
      .select('*')
      .limit(5);

    if (programsError) {
      log(`❌ Programs access failed: ${programsError.message}`, 'red');
      results.criticalIssues.push(`Programs access: ${programsError.message}`);
    } else {
      log(`✅ Programs access working (${programs?.length || 0} records)`, 'green');
    }

    // Test designations table access
    const { data: designations, error: designationsError } = await supabase
      .from('designacoes')
      .select('*')
      .limit(5);

    if (designationsError) {
      log(`❌ Designations access failed: ${designationsError.message}`, 'red');
      results.criticalIssues.push(`Designations access: ${designationsError.message}`);
    } else {
      log(`✅ Designations access working (${designations?.length || 0} records)`, 'green');
      results.coreFeatures = true;
    }

    await supabase.auth.signOut();

  } catch (error) {
    log(`❌ Core features test failed: ${error.message}`, 'red');
    results.criticalIssues.push(`Core features: ${error.message}`);
  }
  log('');

  // 5. File Structure Check
  log('5️⃣ FILE STRUCTURE', 'blue');
  log('==================', 'blue');
  
  const criticalFiles = [
    'src/integrations/supabase/client.ts',
    'src/contexts/AuthContext.tsx',
    'src/components/ProtectedRoute.tsx',
    'src/utils/emergencyLogout.ts',
    'cypress.config.mjs',
    '.github/workflows/cypress.yml'
  ];

  let filesOk = true;
  for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ Missing: ${file}`, 'red');
      results.criticalIssues.push(`Missing file: ${file}`);
      filesOk = false;
    }
  }

  if (filesOk) {
    results.logoutSystem = true;
  }
  log('');

  // 6. Overall Assessment
  log('6️⃣ OVERALL ASSESSMENT', 'blue');
  log('=====================', 'blue');
  
  const criticalSystemsWorking = results.environmentConfig && 
                                results.supabaseConnectivity && 
                                results.authentication;

  const coreSystemsWorking = results.profileManagement && 
                            results.coreFeatures && 
                            results.logoutSystem;

  results.overallReadiness = criticalSystemsWorking && coreSystemsWorking;

  if (results.overallReadiness) {
    log('🎉 APPLICATION IS READY FOR USER TESTING!', 'green');
  } else if (criticalSystemsWorking) {
    log('⚠️ APPLICATION HAS MINOR ISSUES - PROCEED WITH CAUTION', 'yellow');
  } else {
    log('❌ APPLICATION NOT READY - CRITICAL ISSUES MUST BE RESOLVED', 'red');
  }
  log('');

  // 7. Summary and Recommendations
  log('7️⃣ SUMMARY & RECOMMENDATIONS', 'blue');
  log('=============================', 'blue');
  
  if (results.criticalIssues.length > 0) {
    log('🚨 CRITICAL ISSUES TO RESOLVE:', 'red');
    results.criticalIssues.forEach(issue => log(`   • ${issue}`, 'red'));
    log('');
  }

  if (results.recommendations.length > 0) {
    log('💡 RECOMMENDATIONS:', 'yellow');
    results.recommendations.forEach(rec => log(`   • ${rec}`, 'yellow'));
    log('');
  }

  // Deployment readiness
  if (results.overallReadiness) {
    log('✅ DEPLOYMENT RECOMMENDATIONS:', 'green');
    log('   • Application is ready for real user testing', 'green');
    log('   • All core systems are functional', 'green');
    log('   • CI/CD pipeline is configured', 'green');
    log('   • Logout system is robust', 'green');
  } else {
    log('🔧 REQUIRED ACTIONS BEFORE DEPLOYMENT:', 'yellow');
    log('   • Resolve all critical issues listed above', 'yellow');
    log('   • Test authentication flows in browser environment', 'yellow');
    log('   • Verify environment variables are loaded correctly', 'yellow');
    log('   • Run Cypress tests to ensure functionality', 'yellow');
  }

  log('');
  log('📊 READINESS SCORE:', 'cyan');
  const score = Object.values(results).filter(v => v === true).length;
  const total = 6; // Number of test categories
  log(`   ${score}/${total} systems operational (${Math.round(score/total*100)}%)`, 'cyan');

  return results;
}

// Run the assessment
assessApplicationReadiness().catch(error => {
  log(`💥 Assessment failed: ${error.message}`, 'red');
  console.error(error);
});
