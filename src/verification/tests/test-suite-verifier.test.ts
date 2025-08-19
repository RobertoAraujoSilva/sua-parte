/**
 * Unit tests for Test Suite Verifier
 * Tests Cypress setup, test execution, coverage analysis, and test environment
 */

import { testFramework } from './test-framework';
import { TestSuiteVerifierImpl } from '../test-suite-verifier';
import { VerificationModule } from '../interfaces';
import { exec } from 'child_process';
import { promisify } from 'util';

testFramework.describe('TestSuiteVerifier', () => {
  let verifier: TestSuiteVerifierImpl;

  function setup() {
    verifier = new TestSuiteVerifierImpl();
  }

  testFramework.test('should initialize with correct module name', () => {
    setup();
    testFramework.expect(verifier.moduleName).toBe(VerificationModule.TEST_SUITE);
  });

  testFramework.test('should validate Cypress setup successfully', async () => {
    setup();
    
    // Mock successful Cypress setup validation by mocking the actual execAsync calls
    const originalExec = global.execAsync;
    global.execAsync = async () => ({
      stdout: 'Cypress package version: 13.17.0\nCypress binary version: 13.17.0',
      stderr: ''
    });

    const result = await verifier.validateCypressSetup();
    
    testFramework.expect(result.isValid).toBeTruthy();
    testFramework.expect(result.version).toBeTruthy();
    testFramework.expect(result.configPath).toBeTruthy();
    
    // Restore
    global.execAsync = originalExec;
  });

  testFramework.test('should detect missing Cypress installation', async () => {
    setup();
    
    const originalExec = global.execAsync;
    global.execAsync = async () => {
      throw new Error('cypress: command not found');
    };

    const result = await verifier.validateCypressSetup();
    
    testFramework.expect(result.isValid).toBeFalsy();
    testFramework.expect(result.issues.length).toBeGreaterThan(0);
    
    // Restore
    global.execAsync = originalExec;
  });

  testFramework.test('should run all tests successfully', async () => {
    setup();
    
    // Mock successful test execution
    const originalExec = global.execAsync;
    global.execAsync = async () => ({
      stdout: JSON.stringify({
        runs: [
          {
            spec: { name: 'admin-dashboard-integration.cy.ts' },
            stats: { passes: 5, failures: 0, pending: 0, skipped: 0 },
            tests: [
              { title: 'should load admin dashboard', state: 'passed' },
              { title: 'should authenticate admin user', state: 'passed' }
            ]
          },
          {
            spec: { name: 'authentication-roles.cy.ts' },
            stats: { passes: 3, failures: 0, pending: 0, skipped: 0 },
            tests: [
              { title: 'should test role-based access', state: 'passed' }
            ]
          }
        ],
        totalPassed: 8,
        totalFailed: 0,
        totalPending: 0,
        totalSkipped: 0
      }),
      stderr: ''
    });

    const result = await verifier.runAllTests();
    
    testFramework.expect(result).toBeInstanceOf(Array);
    testFramework.expect(result.length).toBeGreaterThan(0);
    
    // Check that all tests passed
    const allPassed = result.every(testResult => testResult.passed);
    testFramework.expect(allPassed).toBeTruthy();
    
    // Restore
    global.execAsync = originalExec;
  });

  testFramework.test('should handle test failures', async () => {
    setup();
    
    const mockExec = testFramework.createMock<typeof exec>();
    mockExec.mockResolvedValue({
      stdout: JSON.stringify({
        runs: [
          {
            spec: { name: 'failing-test.cy.ts' },
            stats: { passes: 2, failures: 1, pending: 0, skipped: 0 },
            tests: [
              { title: 'should pass', state: 'passed' },
              { title: 'should fail', state: 'failed', err: { message: 'Test failed' } }
            ]
          }
        ],
        totalPassed: 2,
        totalFailed: 1,
        totalPending: 0,
        totalSkipped: 0
      }),
      stderr: ''
    } as any);

    const result = await verifier.runAllTests();
    
    testFramework.expect(result).toBeInstanceOf(Array);
    
    // Check that some tests failed
    const someFailed = result.some(testResult => !testResult.passed);
    testFramework.expect(someFailed).toBeTruthy();
  });

  testFramework.test('should analyze test coverage successfully', async () => {
    setup();
    
    // Mock coverage analysis
    const mockExec = testFramework.createMock<typeof exec>();
    mockExec.mockResolvedValue({
      stdout: JSON.stringify({
        coverage: {
          total: {
            lines: { pct: 85.5 },
            functions: { pct: 90.2 },
            branches: { pct: 78.3 },
            statements: { pct: 86.1 }
          },
          uncoveredFiles: [
            'src/utils/legacy-helper.ts',
            'src/components/unused-component.tsx'
          ]
        }
      }),
      stderr: ''
    } as any);

    const result = await verifier.analyzeTestCoverage();
    
    testFramework.expect(result.status).toBe('PASS');
    testFramework.expect(result.percentage).toBeGreaterThan(0);
    testFramework.expect(result.uncoveredComponents).toBeInstanceOf(Array);
  });

  testFramework.test('should detect low test coverage', async () => {
    setup();
    
    const mockExec = testFramework.createMock<typeof exec>();
    mockExec.mockResolvedValue({
      stdout: JSON.stringify({
        coverage: {
          total: {
            lines: { pct: 45.2 },
            functions: { pct: 50.1 },
            branches: { pct: 35.8 },
            statements: { pct: 48.3 }
          },
          uncoveredFiles: [
            'src/components/component1.tsx',
            'src/components/component2.tsx',
            'src/utils/util1.ts'
          ]
        }
      }),
      stderr: ''
    } as any);

    const result = await verifier.analyzeTestCoverage();
    
    testFramework.expect(result.status).toBe('WARNING');
    testFramework.expect(result.percentage).toBeLessThan(60);
    testFramework.expect(result.uncoveredComponents.length).toBeGreaterThan(0);
  });

  testFramework.test('should validate test environment successfully', async () => {
    setup();
    
    // Mock successful environment validation
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      CYPRESS_baseUrl: 'http://localhost:8080',
      CYPRESS_video: 'false',
      CYPRESS_screenshotOnRunFailure: 'true'
    };

    const result = await verifier.validateTestEnvironment();
    
    testFramework.expect(result.isValid).toBeTruthy();
    testFramework.expect(result.checks).toBeTruthy();
    
    // Restore environment
    process.env = originalEnv;
  });

  testFramework.test('should detect missing test environment variables', async () => {
    setup();
    
    const originalEnv = process.env;
    process.env = {}; // Empty environment

    const result = await verifier.validateTestEnvironment();
    
    testFramework.expect(result.isValid).toBeFalsy();
    testFramework.expect(result.issues.length).toBeGreaterThan(0);
    
    // Restore environment
    process.env = originalEnv;
  });

  testFramework.test('should run full test suite verification', async () => {
    setup();
    
    // Mock all test suite components as working
    const mockExec = testFramework.createMock<typeof exec>();
    mockExec.mockResolvedValue({
      stdout: 'All tests passed',
      stderr: ''
    } as any);

    const result = await verifier.verify();
    
    testFramework.expect(result.status).toBe('PASS');
    testFramework.expect(result.module).toBe('test_suite');
    testFramework.expect(result.details.length).toBeGreaterThan(0);
  });

  testFramework.test('should handle Cypress configuration errors', async () => {
    setup();
    
    const mockExec = testFramework.createMock<typeof exec>();
    mockExec.mockRejectedValue(new Error('Configuration file not found'));

    const result = await verifier.validateCypressSetup();
    
    testFramework.expect(result.isValid).toBeFalsy();
    testFramework.expect(result.issues).toContain('Configuration file not found');
  });

  testFramework.test('should validate specific test files', async () => {
    setup();
    
    const mockExec = testFramework.createMock<typeof exec>();
    mockExec.mockResolvedValue({
      stdout: JSON.stringify({
        runs: [
          {
            spec: { name: 'admin-dashboard-integration.cy.ts' },
            stats: { passes: 5, failures: 0 }
          },
          {
            spec: { name: 'authentication-roles.cy.ts' },
            stats: { passes: 3, failures: 0 }
          },
          {
            spec: { name: 'sistema-ministerial-e2e.cy.ts' },
            stats: { passes: 8, failures: 0 }
          },
          {
            spec: { name: 'pdf-upload-functionality.cy.ts' },
            stats: { passes: 4, failures: 0 }
          }
        ]
      }),
      stderr: ''
    } as any);

    const result = await verifier.runAllTests();
    
    testFramework.expect(result).toBeInstanceOf(Array);
    
    // Check that specific test files are included
    const testFiles = result.map(r => r.testFile);
    const expectedFiles = [
      'admin-dashboard-integration.cy.ts',
      'authentication-roles.cy.ts',
      'sistema-ministerial-e2e.cy.ts',
      'pdf-upload-functionality.cy.ts'
    ];
    
    expectedFiles.forEach(file => {
      const fileIncluded = testFiles.some(tf => tf.includes(file));
      testFramework.expect(fileIncluded).toBeTruthy();
    });
  });

  testFramework.test('should handle test execution timeout', async () => {
    setup();
    
    const originalExec = global.execAsync;
    global.execAsync = async () => {
      await new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test execution timeout')), 100)
      );
      return { stdout: '', stderr: '' };
    };

    const result = await verifier.runAllTests();
    
    testFramework.expect(result).toBeInstanceOf(Array);
    
    // Should handle timeout gracefully
    const timeoutErrors = result.filter(r => 
      r.errors && r.errors.some(e => e.message.includes('timeout'))
    );
    testFramework.expect(timeoutErrors.length).toBeGreaterThan(0);
  });

  testFramework.test('should validate browser compatibility', async () => {
    setup();
    
    const mockExec = testFramework.createMock<typeof exec>();
    mockExec.mockResolvedValue({
      stdout: JSON.stringify({
        browsers: [
          { name: 'chrome', version: '120.0.0', path: '/usr/bin/chrome' },
          { name: 'firefox', version: '119.0.0', path: '/usr/bin/firefox' }
        ]
      }),
      stderr: ''
    } as any);

    const result = await verifier.validateTestEnvironment();
    
    testFramework.expect(result.isValid).toBeTruthy();
    testFramework.expect(result.checks).toBeTruthy();
  });

  testFramework.test('should generate test performance metrics', async () => {
    setup();
    
    const mockExec = testFramework.createMock<typeof exec>();
    mockExec.mockResolvedValue({
      stdout: JSON.stringify({
        runs: [
          {
            spec: { name: 'performance-test.cy.ts' },
            stats: { 
              passes: 3, 
              failures: 0,
              duration: 15000,
              wallClockDuration: 18000
            }
          }
        ]
      }),
      stderr: ''
    } as any);

    const result = await verifier.runAllTests();
    
    testFramework.expect(result).toBeInstanceOf(Array);
    
    // Check that performance metrics are captured
    const performanceTests = result.filter(r => r.duration && r.duration > 0);
    testFramework.expect(performanceTests.length).toBeGreaterThan(0);
  });
});

// Export test runner function
export async function runTestSuiteVerifierTests(): Promise<boolean> {
  console.log('🧪 Running Test Suite Verifier Tests...');
  
  try {
    const results = testFramework.getResults();
    const suiteResult = results.get('TestSuiteVerifier');
    
    if (suiteResult) {
      return suiteResult.failed === 0;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Test suite verifier tests failed:', error);
    return false;
  }
}