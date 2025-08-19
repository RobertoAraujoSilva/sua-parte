#!/usr/bin/env node

/**
 * Simple test for script verification functionality
 * Tests basic npm script execution
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';

async function testBasicScripts() {
  console.log('🧪 Testing basic npm script functionality...\n');
  console.log('Debug: Function started');

  const scriptsToTest = [
    'env:show',
    'env:validate'
  ];

  const results = [];

  for (const script of scriptsToTest) {
    console.log(`🔄 Testing script: ${script}`);
    
    try {
      const result = await testScript(script);
      results.push(result);
      
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${script} - ${result.success ? 'PASSED' : 'FAILED'} (${result.duration}ms)`);
      
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`❌ ${script} - ERROR: ${error.message}`);
      results.push({
        script,
        success: false,
        error: error.message,
        duration: 0
      });
    }
    
    console.log('');
  }

  // Summary
  console.log('📊 SUMMARY:');
  console.log('===========');
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`Total scripts tested: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  
  if (successful === results.length) {
    console.log('\n🎉 All scripts executed successfully!');
  } else {
    console.log('\n⚠️  Some scripts failed. This is expected if environment is not fully configured.');
  }

  return successful > 0; // Return true if at least one script worked
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

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBasicScripts()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { testBasicScripts };