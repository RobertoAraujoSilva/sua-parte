#!/usr/bin/env node

/**
 * Build Verification Script for Sistema Ministerial
 * 
 * This script verifies that the application can be built successfully
 * and checks for critical issues that could prevent deployment.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Sistema Ministerial - Build Verification');
console.log('==========================================\n');

let hasErrors = false;
let hasWarnings = false;

function runCommand(command, description, allowFailure = false) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    console.log(`✅ ${description} - SUCCESS`);
    if (output.trim()) {
      console.log(`   Output: ${output.trim().split('\n').slice(-3).join('\n   ')}`);
    }
    return { success: true, output };
  } catch (error) {
    if (allowFailure) {
      console.log(`⚠️  ${description} - WARNINGS FOUND`);
      console.log(`   ${error.stdout || error.message}`);
      hasWarnings = true;
      return { success: false, output: error.stdout || error.message };
    } else {
      console.log(`❌ ${description} - FAILED`);
      console.log(`   ${error.stdout || error.message}`);
      hasErrors = true;
      return { success: false, output: error.stdout || error.message };
    }
  }
}

function checkFileExists(filePath, description) {
  console.log(`📁 Checking ${description}...`);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} - EXISTS`);
    return true;
  } else {
    console.log(`❌ ${description} - MISSING`);
    hasErrors = true;
    return false;
  }
}

function checkBuildOutput() {
  console.log('📦 Checking build output...');
  const projectRoot = path.join(__dirname, '..');
  const distPath = path.join(projectRoot, 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Build output directory missing');
    hasErrors = true;
    return false;
  }
  
  if (!fs.existsSync(indexPath)) {
    console.log('❌ Build index.html missing');
    hasErrors = true;
    return false;
  }
  
  const stats = fs.statSync(indexPath);
  console.log(`✅ Build output - EXISTS (${stats.size} bytes)`);
  
  // Check for assets
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assets = fs.readdirSync(assetsPath);
    console.log(`   Assets: ${assets.length} files`);
  }
  
  return true;
}

// Main verification process
async function main() {
  console.log('🚀 Starting build verification...\n');
  
  // 1. Check critical files
  checkFileExists('package.json', 'package.json');
  checkFileExists('src/App.tsx', 'Main App component');
  checkFileExists('src/contexts/AuthContext.tsx', 'Auth Context');
  checkFileExists('src/components/ProtectedRoute.tsx', 'Protected Route');
  checkFileExists('src/components/ErrorBoundary.tsx', 'Error Boundary');
  
  console.log('');
  
  // 2. TypeScript compilation check
  runCommand('npx tsc --noEmit', 'TypeScript compilation check');
  
  // 3. Build process
  runCommand('npm run build', 'Production build');
  
  // 4. Check build output
  checkBuildOutput();
  
  // 5. Linting (allow warnings)
  runCommand('npm run lint', 'ESLint check', true);
  
  console.log('\n==========================================');
  console.log('🎯 Build Verification Summary');
  console.log('==========================================');
  
  if (hasErrors) {
    console.log('❌ BUILD VERIFICATION FAILED');
    console.log('   Critical errors found that prevent deployment.');
    console.log('   Please fix the errors above and run verification again.');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  BUILD VERIFICATION PASSED WITH WARNINGS');
    console.log('   Build is successful but has linting warnings.');
    console.log('   Application can be deployed but consider fixing warnings.');
    console.log('   ✅ Ready for deployment');
  } else {
    console.log('✅ BUILD VERIFICATION PASSED');
    console.log('   No critical errors found.');
    console.log('   ✅ Ready for deployment');
  }
  
  console.log('\n📊 Verification Results:');
  console.log(`   Errors: ${hasErrors ? 'YES' : 'NO'}`);
  console.log(`   Warnings: ${hasWarnings ? 'YES' : 'NO'}`);
  console.log(`   Deployment Ready: ${!hasErrors ? 'YES' : 'NO'}`);
  
  if (!hasErrors) {
    console.log('\n🚀 Next Steps:');
    console.log('   1. Deploy the dist/ folder to your hosting provider');
    console.log('   2. Ensure environment variables are set correctly');
    console.log('   3. Test the deployed application');
    console.log('   4. Monitor for any runtime errors');
  }
}

// Run the verification
main().catch(error => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});
