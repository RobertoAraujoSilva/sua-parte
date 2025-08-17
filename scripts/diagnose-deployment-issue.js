/**
 * Deployment Issue Diagnostic Script
 * Helps identify and fix deployment authorization issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Sistema Ministerial - Deployment Diagnostic');
console.log('==============================================\n');

async function runDiagnostics() {
  const results = {
    buildStatus: false,
    environmentVars: false,
    gitStatus: false,
    dependencies: false,
    deploymentConfig: false,
    recommendations: []
  };

  // 1. Check build status
  console.log('📦 Checking build status...');
  try {
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Build successful');
    results.buildStatus = true;
  } catch (error) {
    console.log('❌ Build failed');
    console.log('   Error:', error.message.split('\n')[0]);
    results.recommendations.push('Fix build errors before deployment');
  }

  // 2. Check environment variables
  console.log('\n🔧 Checking environment variables...');
  const envFile = path.join(process.cwd(), '.env');
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
    
    if (hasSupabaseUrl && hasSupabaseKey) {
      console.log('✅ Environment variables configured');
      results.environmentVars = true;
    } else {
      console.log('❌ Missing environment variables');
      if (!hasSupabaseUrl) console.log('   Missing: VITE_SUPABASE_URL');
      if (!hasSupabaseKey) console.log('   Missing: VITE_SUPABASE_ANON_KEY');
      results.recommendations.push('Configure missing environment variables');
    }
  } else {
    console.log('❌ .env file not found');
    results.recommendations.push('Create .env file with required variables');
  }

  // 3. Check Git status
  console.log('\n📋 Checking Git status...');
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim() === '') {
      console.log('✅ Working directory clean');
      results.gitStatus = true;
    } else {
      console.log('⚠️ Uncommitted changes detected');
      console.log('   Files:', gitStatus.split('\n').filter(line => line.trim()).length);
      results.recommendations.push('Commit changes before deployment');
    }
  } catch (error) {
    console.log('❌ Git not available or not a git repository');
    results.recommendations.push('Initialize git repository for version control');
  }

  // 4. Check dependencies
  console.log('\n📚 Checking dependencies...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasReact = packageJson.dependencies?.react;
    const hasVite = packageJson.devDependencies?.vite;
    const hasSupabase = packageJson.dependencies?.['@supabase/supabase-js'];
    
    if (hasReact && hasVite && hasSupabase) {
      console.log('✅ Core dependencies present');
      results.dependencies = true;
    } else {
      console.log('❌ Missing core dependencies');
      if (!hasReact) console.log('   Missing: react');
      if (!hasVite) console.log('   Missing: vite');
      if (!hasSupabase) console.log('   Missing: @supabase/supabase-js');
      results.recommendations.push('Install missing dependencies');
    }
  } catch (error) {
    console.log('❌ Cannot read package.json');
    results.recommendations.push('Ensure package.json is valid');
  }

  // 5. Check deployment configuration
  console.log('\n🚀 Checking deployment configuration...');
  const deploymentFiles = [
    'vercel.json',
    'netlify.toml',
    'render.yaml',
    'public/_redirects'
  ];
  
  const foundConfigs = deploymentFiles.filter(file => fs.existsSync(file));
  
  if (foundConfigs.length > 0) {
    console.log('✅ Deployment configuration found:', foundConfigs.join(', '));
    results.deploymentConfig = true;
  } else {
    console.log('⚠️ No deployment configuration files found');
    console.log('   This is OK for Lovable deployment');
    results.deploymentConfig = true; // Lovable doesn't need config files
  }

  // 6. Check for common deployment blockers
  console.log('\n🔒 Checking for deployment blockers...');
  
  // Check for large files
  try {
    const distSize = execSync('du -sh dist 2>/dev/null || echo "0"', { encoding: 'utf8' });
    console.log('   Build size:', distSize.trim() || 'Unknown');
  } catch (error) {
    console.log('   Build size: Cannot determine');
  }

  // Check for sensitive files
  const sensitiveFiles = ['.env', '.env.local', '.env.production'];
  const foundSensitive = sensitiveFiles.filter(file => fs.existsSync(file));
  
  if (foundSensitive.length > 0) {
    console.log('⚠️ Sensitive files detected:', foundSensitive.join(', '));
    console.log('   Ensure these are in .gitignore');
    
    // Check .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      const ignoresEnv = gitignore.includes('.env');
      if (!ignoresEnv) {
        results.recommendations.push('Add .env files to .gitignore');
      }
    }
  }

  // Generate report
  console.log('\n📊 Diagnostic Summary');
  console.log('=====================');
  
  const totalChecks = Object.keys(results).filter(key => key !== 'recommendations').length;
  const passedChecks = Object.values(results).filter((value, index) => 
    index < totalChecks && value === true
  ).length;
  
  console.log(`Overall Status: ${passedChecks}/${totalChecks} checks passed`);
  console.log(`Build Status: ${results.buildStatus ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Environment: ${results.environmentVars ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Git Status: ${results.gitStatus ? '✅ PASS' : '⚠️ WARNING'}`);
  console.log(`Dependencies: ${results.dependencies ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Deployment Config: ${results.deploymentConfig ? '✅ PASS' : '⚠️ WARNING'}`);

  // Recommendations
  if (results.recommendations.length > 0) {
    console.log('\n🔧 Recommended Actions:');
    results.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  // Deployment readiness
  const isReady = results.buildStatus && results.environmentVars && results.dependencies;
  
  console.log('\n🚀 Deployment Readiness');
  console.log('=======================');
  
  if (isReady) {
    console.log('✅ READY FOR DEPLOYMENT');
    console.log('\n💡 Suggested deployment methods:');
    console.log('   1. Lovable (original): Try re-authentication');
    console.log('   2. Vercel (alternative): npx vercel --prod');
    console.log('   3. Netlify (alternative): npx netlify deploy --prod --dir=dist');
    
    console.log('\n🔧 If Lovable authorization fails:');
    console.log('   1. Clear browser cache for lovable.dev');
    console.log('   2. Sign out and sign back in');
    console.log('   3. Check project permissions');
    console.log('   4. Try alternative deployment platform');
    
  } else {
    console.log('❌ NOT READY FOR DEPLOYMENT');
    console.log('\n🚨 Critical issues must be resolved first:');
    if (!results.buildStatus) console.log('   • Fix build errors');
    if (!results.environmentVars) console.log('   • Configure environment variables');
    if (!results.dependencies) console.log('   • Install missing dependencies');
  }

  // Quick fix commands
  console.log('\n⚡ Quick Fix Commands:');
  console.log('   npm install                    # Install dependencies');
  console.log('   npm run build                  # Test build');
  console.log('   npm run verify:system          # Run verification');
  console.log('   git add . && git commit -m "fix: deployment prep"  # Commit changes');

  return isReady;
}

// Run diagnostics
runDiagnostics()
  .then(isReady => {
    console.log('\n' + '='.repeat(50));
    if (isReady) {
      console.log('🎉 Diagnostic completed - Ready for deployment!');
      process.exit(0);
    } else {
      console.log('🔧 Diagnostic completed - Issues found, please fix before deployment');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Diagnostic failed:', error.message);
    process.exit(1);
  });