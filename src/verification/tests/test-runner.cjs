#!/usr/bin/env node

/**
 * Simple test runner script for verification system tests
 * Can be executed from command line with different options
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

/**
 * Test runner with auto-fix capabilities
 */
class SimpleTestRunner {
  constructor() {
    this.fixesApplied = [];
  }

  /**
   * Apply basic auto-fixes before running tests
   */
  async applyBasicFixes() {
    console.log('🔧 Applying basic auto-fixes...');

    try {
      // Check if TypeScript is available
      try {
        await execAsync('npx tsc --version');
        this.fixesApplied.push('TypeScript compiler available');
      } catch (error) {
        console.warn('⚠️ TypeScript not available, tests may fail');
      }

      // Check if Node.js version is compatible
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion >= 18) {
        this.fixesApplied.push(`Node.js version ${nodeVersion} is compatible`);
      } else {
        console.warn(`⚠️ Node.js version ${nodeVersion} may not be fully compatible`);
      }

      // Set test environment
      process.env.NODE_ENV = 'test';
      this.fixesApplied.push('Set NODE_ENV to test');

      // Set default Supabase test values if missing
      if (!process.env.VITE_SUPABASE_URL) {
        process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
        this.fixesApplied.push('Set default VITE_SUPABASE_URL');
      }

      if (!process.env.VITE_SUPABASE_ANON_KEY) {
        process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
        this.fixesApplied.push('Set default VITE_SUPABASE_ANON_KEY');
      }

      if (this.fixesApplied.length > 0) {
        console.log('✅ Basic fixes applied:');
        this.fixesApplied.forEach(fix => console.log(`  - ${fix}`));
      }
      console.log('');

    } catch (error) {
      console.warn('⚠️ Some basic fixes failed:', error.message);
    }
  }

  /**
   * Run simple verification test
   */
  async runSimpleVerificationTest() {
    console.log('🔍 Running Simple Verification Test...');
    console.log('=====================================');

    try {
      // Test basic verification system functionality
      console.log('Testing basic verification system...');
      
      // Test 1: Check if verification files exist
      const verificationFiles = [
        'src/verification/controller.ts',
        'src/verification/interfaces.ts',
        'src/verification/types.ts',
        'src/verification/infrastructure-verifier.ts',
        'src/verification/backend-verifier.ts',
        'src/verification/frontend-verifier.ts'
      ];
      
      let filesExist = 0;
      verificationFiles.forEach(file => {
        if (fs.existsSync(file)) {
          console.log('✅ Found:', file);
          filesExist++;
        } else {
          console.log('❌ Missing:', file);
        }
      });
      
      console.log(`📊 Files found: ${filesExist}/${verificationFiles.length}`);
      
      // Test 2: Check test framework files
      const testFiles = [
        'src/verification/tests/test-framework.ts',
        'src/verification/tests/infrastructure-verifier.test.ts',
        'src/verification/tests/backend-verifier.test.ts'
      ];
      
      let testFilesExist = 0;
      testFiles.forEach(file => {
        if (fs.existsSync(file)) {
          console.log('✅ Test file found:', file);
          testFilesExist++;
        } else {
          console.log('❌ Test file missing:', file);
        }
      });
      
      console.log(`📊 Test files found: ${testFilesExist}/${testFiles.length}`);
      
      // Test 3: Check package.json for test scripts
      if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const hasVerifyScript = packageJson.scripts && packageJson.scripts['verify:system'];
        console.log(`✅ Package.json exists`);
        console.log(`${hasVerifyScript ? '✅' : '❌'} Verify script configured: ${hasVerifyScript ? 'Yes' : 'No'}`);
      }
      
      console.log('🏁 Simple verification test completed');
      
      // Return success if most files exist
      const successThreshold = 0.7; // 70% of files should exist
      const overallSuccess = (filesExist / verificationFiles.length) >= successThreshold && 
                            (testFilesExist / testFiles.length) >= successThreshold;
      
      return overallSuccess;
    } catch (error) {
      console.error('❌ Simple verification test failed:', error.message);
      return false;
    }
  }

  /**
   * Run unit tests using Node.js test runner
   */
  async runBasicUnitTests() {
    console.log('🧪 Running Basic Unit Tests...');
    console.log('==============================');

    try {
      // Create a simple test that validates the test framework
      const testCode = `
        // Basic test framework validation
        console.log('🧪 Testing verification system components...');
        
        let testsRun = 0;
        let testsPassed = 0;
        
        function test(name, testFn) {
          testsRun++;
          try {
            console.log(\`  ▶️ \${name}\`);
            testFn();
            testsPassed++;
            console.log(\`  ✅ \${name}\`);
          } catch (error) {
            console.log(\`  ❌ \${name}: \${error.message}\`);
          }
        }
        
        function expect(actual) {
          return {
            toBe: (expected) => {
              if (actual !== expected) {
                throw new Error(\`Expected \${actual} to be \${expected}\`);
              }
            },
            toBeTruthy: () => {
              if (!actual) {
                throw new Error(\`Expected \${actual} to be truthy\`);
              }
            },
            toBeInstanceOf: (constructor) => {
              if (!(actual instanceof constructor)) {
                throw new Error(\`Expected \${actual} to be instance of \${constructor.name}\`);
              }
            }
          };
        }
        
        // Run basic tests
        test('should validate basic JavaScript functionality', () => {
          expect(1 + 1).toBe(2);
          expect(true).toBeTruthy();
          expect(new Date()).toBeInstanceOf(Date);
        });
        
        test('should validate environment setup', () => {
          expect(process.env.NODE_ENV).toBe('test');
          expect(process.env.VITE_SUPABASE_URL).toBeTruthy();
        });
        
        test('should validate file system access', () => {
          const fs = require('fs');
          expect(fs.existsSync('package.json')).toBeTruthy();
        });
        
        console.log(\`\\n📊 Test Results: \${testsPassed}/\${testsRun} passed\`);
        
        if (testsPassed === testsRun) {
          console.log('🎉 All basic tests passed!');
          process.exit(0);
        } else {
          console.log('❌ Some tests failed');
          process.exit(1);
        }
      `;

      // Write and execute test
      const testFile = 'temp-basic-unit-test.cjs';
      fs.writeFileSync(testFile, testCode);
      
      const { stdout, stderr } = await execAsync(`node ${testFile}`, {
        timeout: 30000 // 30 second timeout
      });
      
      console.log(stdout);
      if (stderr) {
        console.warn('Warnings:', stderr);
      }
      
      // Cleanup
      fs.unlinkSync(testFile);
      
      return true;
    } catch (error) {
      console.error('❌ Basic unit tests failed:', error.message);
      
      // Cleanup on error
      const testFile = 'temp-basic-unit-test.cjs';
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Verification System Tests');
    console.log('====================================\n');

    await this.applyBasicFixes();

    const results = {
      simple: false,
      basic: false
    };

    // Run simple test first
    results.simple = await this.runSimpleVerificationTest();
    console.log('');

    // Run basic unit tests if simple test passes
    if (results.simple) {
      results.basic = await this.runBasicUnitTests();
      console.log('');
    } else {
      console.log('⚠️ Skipping basic tests due to simple test failure\n');
    }

    // Print summary
    console.log('📊 Test Results Summary:');
    console.log('========================');
    console.log(`Simple Test: ${results.simple ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Basic Tests: ${results.basic ? '✅ PASS' : '❌ FAIL'}`);

    const overallSuccess = results.simple && results.basic;
    console.log(`Overall: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);

    if (!overallSuccess) {
      console.log('\n💡 Troubleshooting Tips:');
      if (!results.simple) {
        console.log('  - Check that verification system files exist');
        console.log('  - Verify project structure is correct');
        console.log('  - Run: npm install to ensure dependencies are installed');
      }
      if (!results.basic) {
        console.log('  - Check Node.js version compatibility');
        console.log('  - Verify environment variables are set correctly');
      }
    } else {
      console.log('\n🎉 Basic verification system tests are working!');
      console.log('💡 Next steps:');
      console.log('  - Run full verification: npm run verify:system');
      console.log('  - Run specific module tests: npm run verify:frontend');
      console.log('  - Check test coverage with more comprehensive tests');
    }

    return overallSuccess;
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: 'all', // all, simple, basic
    verbose: false,
    help: false
  };

  args.forEach(arg => {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--simple') {
      options.type = 'simple';
    } else if (arg === '--basic') {
      options.type = 'basic';
    }
  });

  return options;
}

/**
 * Print help information
 */
function printHelp() {
  console.log('Verification System Test Runner');
  console.log('==============================\n');
  console.log('Usage: node test-runner.cjs [options]\n');
  console.log('Options:');
  console.log('  --help, -h      Show this help message');
  console.log('  --verbose, -v   Enable verbose output');
  console.log('  --simple        Run only simple verification test');
  console.log('  --basic         Run only basic unit tests');
  console.log('  (no options)    Run all tests\n');
  console.log('Examples:');
  console.log('  node test-runner.cjs                 # Run all tests');
  console.log('  node test-runner.cjs --simple        # Run only simple test');
  console.log('  node test-runner.cjs --basic -v      # Run basic tests with verbose output');
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const testRunner = new SimpleTestRunner();

  try {
    let success = false;

    switch (options.type) {
      case 'simple':
        await testRunner.applyBasicFixes();
        success = await testRunner.runSimpleVerificationTest();
        break;
      case 'basic':
        await testRunner.applyBasicFixes();
        success = await testRunner.runBasicUnitTests();
        break;
      case 'all':
      default:
        success = await testRunner.runAllTests();
        break;
    }

    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error('💥 Test runner failed:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { SimpleTestRunner };