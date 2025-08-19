#!/usr/bin/env node

/**
 * Test script for ScriptVerifier implementation
 * Tests the script verification functionality
 */

import { ScriptVerifierImpl } from './script-verifier.ts';

async function testScriptVerifier() {
  console.log('🧪 Testing ScriptVerifier implementation...\n');

  try {
    const verifier = new ScriptVerifierImpl();
    
    console.log('📋 Starting script verification test...');
    const startTime = Date.now();
    
    // Run the verification
    const result = await verifier.verify();
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  Verification completed in ${duration}ms\n`);

    // Display results
    console.log('📊 VERIFICATION RESULTS:');
    console.log('========================');
    console.log(`Module: ${result.module}`);
    console.log(`Status: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Auto-fixes applied: ${result.autoFixesApplied || 0}`);
    
    if (result.portConflicts && result.portConflicts.length > 0) {
      console.log(`\n⚠️  Port conflicts detected:`);
      result.portConflicts.forEach(conflict => console.log(`   - ${conflict}`));
    }
    
    if (result.dependencyIssues && result.dependencyIssues.length > 0) {
      console.log(`\n⚠️  Dependency issues detected:`);
      result.dependencyIssues.forEach(issue => console.log(`   - ${issue}`));
    }

    console.log('\n📝 DETAILED RESULTS:');
    console.log('====================');
    
    if (result.details && result.details.length > 0) {
      result.details.forEach((detail, index) => {
        const status = detail.success ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${detail.test}`);
        console.log(`   Component: ${detail.component}`);
        console.log(`   Message: ${detail.message}`);
        
        if (detail.data) {
          if (detail.data.exitCode !== undefined) {
            console.log(`   Exit Code: ${detail.data.exitCode}`);
          }
          if (detail.data.duration !== undefined) {
            console.log(`   Duration: ${detail.data.duration}ms`);
          }
          if (detail.data.autoFixed) {
            console.log(`   🔧 Auto-fixed: ${detail.data.fixApplied}`);
          }
          if (detail.data.output && detail.data.output.length > 0) {
            console.log(`   Output: ${detail.data.output.substring(0, 100)}${detail.data.output.length > 100 ? '...' : ''}`);
          }
        }
        console.log('');
      });
    }

    // Script-specific results
    if (result.scriptResults && result.scriptResults.length > 0) {
      console.log('🔧 SCRIPT EXECUTION RESULTS:');
      console.log('============================');
      
      const devScripts = result.scriptResults.filter(r => r.script.includes('dev'));
      const buildScripts = result.scriptResults.filter(r => r.script.includes('build') || r.script === 'preview' || r.script === 'start');
      const envScripts = result.scriptResults.filter(r => r.script.includes('env'));
      
      if (devScripts.length > 0) {
        console.log('\n📱 Development Scripts:');
        devScripts.forEach(script => {
          const status = script.success ? '✅' : '❌';
          console.log(`   ${status} ${script.script} (${script.duration}ms)`);
          if (script.autoFixed) {
            console.log(`      🔧 Auto-fixed: ${script.fixApplied}`);
          }
          if (!script.success && script.error) {
            console.log(`      Error: ${script.error.substring(0, 100)}...`);
          }
        });
      }
      
      if (buildScripts.length > 0) {
        console.log('\n🏗️  Build Scripts:');
        buildScripts.forEach(script => {
          const status = script.success ? '✅' : '❌';
          console.log(`   ${status} ${script.script} (${script.duration}ms)`);
          if (script.autoFixed) {
            console.log(`      🔧 Auto-fixed: ${script.fixApplied}`);
          }
          if (!script.success && script.error) {
            console.log(`      Error: ${script.error.substring(0, 100)}...`);
          }
        });
      }
      
      if (envScripts.length > 0) {
        console.log('\n🌍 Environment Scripts:');
        envScripts.forEach(script => {
          const status = script.success ? '✅' : '❌';
          console.log(`   ${status} ${script.script} (${script.duration}ms)`);
          if (script.autoFixed) {
            console.log(`      🔧 Auto-fixed: ${script.fixApplied}`);
          }
          if (!script.success && script.error) {
            console.log(`      Error: ${script.error.substring(0, 100)}...`);
          }
        });
      }
    }

    // Summary
    console.log('\n📈 SUMMARY:');
    console.log('===========');
    const totalScripts = result.scriptResults ? result.scriptResults.length : 0;
    const successfulScripts = result.scriptResults ? result.scriptResults.filter(r => r.success).length : 0;
    const failedScripts = totalScripts - successfulScripts;
    
    console.log(`Total scripts tested: ${totalScripts}`);
    console.log(`Successful: ${successfulScripts}`);
    console.log(`Failed: ${failedScripts}`);
    console.log(`Auto-fixes applied: ${result.autoFixesApplied || 0}`);
    
    if (result.success) {
      console.log('\n🎉 Script verification completed successfully!');
    } else {
      console.log('\n⚠️  Script verification completed with issues. Check the details above.');
    }

    return result.success;

  } catch (error) {
    console.error('❌ Script verifier test failed:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testScriptVerifier()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { testScriptVerifier };