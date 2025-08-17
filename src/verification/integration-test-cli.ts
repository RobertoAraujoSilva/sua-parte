#!/usr/bin/env node

/**
 * CLI for running integration tests
 * 
 * Task 12.2: Integration test CLI interface
 */

import { runIntegrationTestSuite } from './tests/integration-test-runner';

async function main() {
  const args = process.argv.slice(2);
  
  console.log('🧪 Sistema Ministerial - Integration Test CLI');
  console.log('============================================');
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  try {
    const success = await runIntegrationTestSuite();
    
    if (success) {
      console.log('\n🎉 Integration tests completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Integration tests failed!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Integration test execution failed:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Usage: node src/verification/integration-test-cli.ts [options]

Options:
  -h, --help     Show this help message

Description:
  Runs comprehensive integration tests for the verification workflow.
  
  This includes:
  • End-to-end verification workflow testing
  • Real service integration testing  
  • Performance monitoring and benchmarking
  • Auto-fix capability validation
  • Service connection testing
  • Error detection and remediation testing

Examples:
  node src/verification/integration-test-cli.ts
  npm run test:integration
`);
}

// Run the CLI
main().catch(error => {
  console.error('💥 CLI execution failed:', error);
  process.exit(1);
});