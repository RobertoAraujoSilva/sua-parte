/**
 * Test script for Database Verifier
 * Quick test to verify the database verification module works correctly
 */

import { DatabaseVerifierImpl } from './database-verifier';

async function testDatabaseVerifier() {
  console.log('🧪 Testing Database Verifier...');
  
  try {
    const verifier = new DatabaseVerifierImpl();
    
    console.log('📋 Running database verification...');
    const result = await verifier.verify();
    
    console.log('✅ Database verification completed!');
    console.log('📊 Results:', {
      module: result.module,
      status: result.status,
      duration: `${result.duration}ms`,
      detailsCount: result.details?.length || 0,
      errorsCount: result.errors?.length || 0,
      warningsCount: result.warnings?.length || 0
    });

    if (result.details && result.details.length > 0) {
      console.log('📝 Test Details:');
      result.details.forEach((detail, index) => {
        console.log(`  ${index + 1}. ${detail.component}/${detail.test}: ${detail.result}`);
        console.log(`     ${detail.message}`);
      });
    }

    if (result.errors && result.errors.length > 0) {
      console.log('❌ Errors:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.message}`);
      });
    }

    if (result.warnings && result.warnings.length > 0) {
      console.log('⚠️ Warnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    return result.status === 'PASS';

  } catch (error) {
    console.error('❌ Database verifier test failed:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseVerifier()
    .then(success => {
      console.log(`🏁 Test ${success ? 'PASSED' : 'FAILED'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { testDatabaseVerifier };