#!/usr/bin/env node

/**
 * Test script for Cypress setup verification
 * This script tests the TestSuiteVerifier's Cypress setup validation functionality
 */

import { TestSuiteVerifierImpl } from './test-suite-verifier.js';

async function testCypressSetup() {
  console.log('🧪 Testing Cypress Setup Verification...\n');

  const verifier = new TestSuiteVerifierImpl();

  try {
    // Test 1: Validate Cypress Setup
    console.log('📋 Test 1: Validating Cypress Setup');
    console.log('=' .repeat(50));
    
    const setupResult = await verifier.validateCypressSetup();
    
    console.log(`Status: ${setupResult.isValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`Message: ${setupResult.message}`);
    
    if (setupResult.version) {
      console.log(`Cypress Version: ${setupResult.version}`);
    }
    
    if (setupResult.configPath) {
      console.log(`Config File: ${setupResult.configPath}`);
    }
    
    console.log('\nChecks:');
    Object.entries(setupResult.checks).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}`);
    });
    
    if (setupResult.issues.length > 0) {
      console.log('\nIssues Found:');
      setupResult.issues.forEach(issue => {
        console.log(`  ⚠️  ${issue}`);
      });
    }
    
    if (setupResult.fixes.length > 0) {
      console.log('\nFixes Applied:');
      setupResult.fixes.forEach(fix => {
        console.log(`  🔧 ${fix}`);
      });
    }

    // Test 2: Validate Test Environment
    console.log('\n📋 Test 2: Validating Test Environment');
    console.log('=' .repeat(50));
    
    const envResult = await verifier.validateTestEnvironment();
    
    console.log(`Status: ${envResult.isValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`Message: ${envResult.message}`);
    
    console.log('\nEnvironment Variables:');
    Object.entries(envResult.environmentVariables).forEach(([envVar, exists]) => {
      console.log(`  ${exists ? '✅' : '❌'} ${envVar}`);
    });
    
    if (envResult.issues.length > 0) {
      console.log('\nIssues:');
      envResult.issues.forEach(issue => {
        console.log(`  ❌ ${issue}`);
      });
    }
    
    if (envResult.warnings.length > 0) {
      console.log('\nWarnings:');
      envResult.warnings.forEach(warning => {
        console.log(`  ⚠️  ${warning}`);
      });
    }

    // Test 3: Check Browser Compatibility
    console.log('\n📋 Test 3: Checking Browser Compatibility');
    console.log('=' .repeat(50));
    
    const browserResult = await verifier.checkBrowserCompatibility();
    
    console.log(`Status: ${browserResult.isValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`Message: ${browserResult.message}`);
    
    if (browserResult.browsers.length > 0) {
      console.log('\nAvailable Browsers:');
      browserResult.browsers.forEach(browser => {
        console.log(`  🌐 ${browser}`);
      });
    }

    // Test 4: Full Verification
    console.log('\n📋 Test 4: Full Test Suite Verification');
    console.log('=' .repeat(50));
    
    const fullResult = await verifier.verify();
    
    console.log(`Overall Status: ${fullResult.status}`);
    console.log(`Duration: ${fullResult.duration}ms`);
    console.log(`Tests Run: ${fullResult.details.length}`);
    
    console.log('\nDetailed Results:');
    fullResult.details.forEach(detail => {
      const icon = detail.result === 'PASS' ? '✅' : detail.result === 'FAIL' ? '❌' : '⚠️';
      console.log(`  ${icon} ${detail.component} - ${detail.test}: ${detail.message}`);
    });
    
    if (fullResult.errors && fullResult.errors.length > 0) {
      console.log('\nErrors:');
      fullResult.errors.forEach(error => {
        console.log(`  ❌ ${error.message}`);
      });
    }
    
    if (fullResult.warnings && fullResult.warnings.length > 0) {
      console.log('\nWarnings:');
      fullResult.warnings.forEach(warning => {
        console.log(`  ⚠️  ${warning.message}`);
      });
    }

    console.log('\n🎉 Cypress Setup Verification Test Complete!');
    
    // Summary
    const passedTests = fullResult.details.filter(d => d.result === 'PASS').length;
    const failedTests = fullResult.details.filter(d => d.result === 'FAIL').length;
    const warningTests = fullResult.details.filter(d => d.result === 'WARNING').length;
    
    console.log('\n📊 Summary:');
    console.log(`  ✅ Passed: ${passedTests}`);
    console.log(`  ❌ Failed: ${failedTests}`);
    console.log(`  ⚠️  Warnings: ${warningTests}`);
    console.log(`  ⏱️  Total Duration: ${fullResult.duration}ms`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCypressSetup().catch(console.error);
}

export { testCypressSetup };