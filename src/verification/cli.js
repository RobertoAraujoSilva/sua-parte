#!/usr/bin/env node

/**
 * JavaScript CLI wrapper for the TypeScript verification system
 * This allows running the verification system without TypeScript compilation
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';

console.log('🔍 Sistema Ministerial Verification System');
console.log('==========================================');

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// For now, let's implement a simple script verification test
if (args.includes('--module=scripts') || args.includes('--full')) {
  console.log('🔧 Running Script Verification...\n');
  await runScriptVerification();
} else {
  console.log('⚠️  Full TypeScript verification system requires compilation.');
  console.log('For now, running basic script verification...\n');
  await runScriptVerification();
}

function showHelp() {
  console.log(`
Usage: node src/verification/cli.js [options]

Options:
  --full                    Run full system verification
  --module=<module>         Run verification for specific module
  --help, -h               Show this help message

Available modules:
  - scripts               Test npm scripts (implemented)
  - infrastructure        Check dependencies and environment (requires TS)
  - backend               Verify backend server and APIs (requires TS)
  - frontend              Verify React application (requires TS)
  - authentication        Test authentication system (requires TS)
  - download_system       Verify JW.org integration (requires TS)
  - database              Test database operations (requires TS)
  - test_suite            Run Cypress tests (requires TS)

Examples:
  node src/verification/cli.js --module=scripts
  node src/verification/cli.js --full
`);
}

async function runScriptVerification() {
  console.log('📋 Testing npm scripts...');
  
  const scriptsToTest = [
    { name: 'env:show', category: 'Environment', timeout: 5000 },
    { name: 'env:validate', category: 'Environment', timeout: 10000 },
    { name: 'typecheck', category: 'Build', timeout: 15000 },
    { name: 'lint', category: 'Build', timeout: 15000 }
  ];

  const results = [];
  
  for (const script of scriptsToTest) {
    console.log(`\n🔄 Testing ${script.category}: ${script.name}`);
    
    try {
      const result = await testScript(script.name, script.timeout);
      results.push({ ...result, category: script.category });
      
      const status = result.success ? '✅' : '❌';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${script.name} - ${result.success ? 'PASSED' : 'FAILED'} (${duration})`);
      
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error.substring(0, 150)}...`);
      }
      
    } catch (error) {
      console.log(`❌ ${script.name} - ERROR: ${error.message}`);
      results.push({
        script: script.name,
        category: script.category,
        success: false,
        error: error.message,
        duration: 0
      });
    }
  }

  // Summary
  console.log('\n📊 SCRIPT VERIFICATION SUMMARY:');
  console.log('================================');
  
  const categories = [...new Set(results.map(r => r.category))];
  
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const successful = categoryResults.filter(r => r.success).length;
    const total = categoryResults.length;
    
    console.log(`\n${category} Scripts: ${successful}/${total} passed`);
    categoryResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${result.script}`);
    });
  }
  
  const totalSuccessful = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`\n📈 Overall: ${totalSuccessful}/${totalTests} scripts passed`);
  
  if (totalSuccessful === totalTests) {
    console.log('\n🎉 All tested scripts are working correctly!');
  } else if (totalSuccessful > 0) {
    console.log('\n⚠️  Some scripts failed, but core functionality appears to work.');
    console.log('This may be due to missing environment configuration.');
  } else {
    console.log('\n❌ Multiple script failures detected. Please check your environment setup.');
  }

  // Auto-fix suggestions
  if (totalSuccessful < totalTests) {
    console.log('\n🔧 AUTO-FIX SUGGESTIONS:');
    console.log('========================');
    
    const failedResults = results.filter(r => !r.success);
    
    for (const failed of failedResults) {
      if (failed.error && failed.error.includes('env')) {
        console.log(`• ${failed.script}: Check environment variables in .env file`);
      } else if (failed.error && failed.error.includes('module')) {
        console.log(`• ${failed.script}: Run 'npm install' to install missing dependencies`);
      } else if (failed.error && failed.error.includes('typescript')) {
        console.log(`• ${failed.script}: TypeScript compilation issues - check tsconfig.json`);
      } else {
        console.log(`• ${failed.script}: Check script definition in package.json`);
      }
    }
  }

  return totalSuccessful > 0;
}

function testScript(scriptName, timeout = 10000) {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';
    let resolved = false;
    
    const child = spawn('npm', ['run', scriptName], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });
    
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        resolve({
          script: scriptName,
          success: code === 0,
          exitCode: code,
          duration: Date.now() - startTime,
          output,
          error: errorOutput || undefined
        });
      }
    });
    
    child.on('error', (error) => {
      if (!resolved) {
        resolved = true;
        resolve({
          script: scriptName,
          success: false,
          exitCode: null,
          duration: Date.now() - startTime,
          output,
          error: error.message
        });
      }
    });
    
    // Timeout handling
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        child.kill('SIGTERM');
        resolve({
          script: scriptName,
          success: false,
          exitCode: null,
          duration: Date.now() - startTime,
          output,
          error: `Script timeout after ${timeout}ms`
        });
      }
    }, timeout);
  });
}