/**
 * Unit tests for Verification Controller
 * Tests orchestration, module registration, report generation, and error handling
 */

import { testFramework } from './test-framework';
import { SystemVerificationController } from '../controller';
import { VerificationModule, BaseVerifier } from '../interfaces';
import { VerificationResult } from '../types';

// Mock verifier implementation for testing
class MockVerifier implements BaseVerifier {
  constructor(
    public readonly moduleName: string,
    private shouldFail: boolean = false,
    private duration: number = 100
  ) {}

  async verify(): Promise<VerificationResult> {
    // Simulate verification time
    await new Promise(resolve => setTimeout(resolve, this.duration));

    if (this.shouldFail) {
      return {
        module: this.moduleName,
        status: 'FAIL',
        timestamp: new Date(),
        duration: this.duration,
        details: [
          {
            component: 'test-component',
            test: 'test-operation',
            result: 'FAIL',
            message: 'Mock verification failed'
          }
        ],
        errors: [new Error('Mock verification error')]
      };
    }

    return {
      module: this.moduleName,
      status: 'PASS',
      timestamp: new Date(),
      duration: this.duration,
      details: [
        {
          component: 'test-component',
          test: 'test-operation',
          result: 'PASS',
          message: 'Mock verification passed'
        }
      ]
    };
  }

  async cleanup(): Promise<void> {
    // Mock cleanup
  }
}

testFramework.describe('SystemVerificationController', () => {
  let controller: SystemVerificationController;

  function setup() {
    controller = new SystemVerificationController();
  }

  testFramework.test('should initialize controller successfully', async () => {
    setup();
    
    await controller.initialize();
    
    testFramework.expect(controller).toBeInstanceOf(SystemVerificationController);
  });

  testFramework.test('should register verifiers successfully', () => {
    setup();
    
    const mockVerifier = new MockVerifier('test-module');
    controller.registerVerifier(VerificationModule.INFRASTRUCTURE, mockVerifier);
    
    const registeredModules = controller.getRegisteredModules();
    testFramework.expect(registeredModules).toContain(VerificationModule.INFRASTRUCTURE);
  });

  testFramework.test('should check if module is registered', () => {
    setup();
    
    const mockVerifier = new MockVerifier('test-module');
    controller.registerVerifier(VerificationModule.BACKEND, mockVerifier);
    
    testFramework.expect(controller.isModuleRegistered(VerificationModule.BACKEND)).toBeTruthy();
    testFramework.expect(controller.isModuleRegistered(VerificationModule.FRONTEND)).toBeFalsy();
  });

  testFramework.test('should run single module verification successfully', async () => {
    setup();
    
    const mockVerifier = new MockVerifier('infrastructure');
    controller.registerVerifier(VerificationModule.INFRASTRUCTURE, mockVerifier);
    
    const result = await controller.runModuleVerification(VerificationModule.INFRASTRUCTURE);
    
    testFramework.expect(result.status).toBe('PASS');
    testFramework.expect(result.module).toBe('infrastructure');
    testFramework.expect(result.details.length).toBeGreaterThan(0);
  });

  testFramework.test('should handle module verification failure', async () => {
    setup();
    
    const mockVerifier = new MockVerifier('infrastructure', true); // Will fail
    controller.registerVerifier(VerificationModule.INFRASTRUCTURE, mockVerifier);
    
    const result = await controller.runModuleVerification(VerificationModule.INFRASTRUCTURE);
    
    testFramework.expect(result.status).toBe('FAIL');
    testFramework.expect(result.errors).toBeTruthy();
    testFramework.expect(result.errors!.length).toBeGreaterThan(0);
  });

  testFramework.test('should throw error for unregistered module', async () => {
    setup();
    
    try {
      await controller.runModuleVerification(VerificationModule.FRONTEND);
      testFramework.expect(false).toBeTruthy(); // Should not reach here
    } catch (error) {
      testFramework.expect(error).toBeInstanceOf(Error);
      testFramework.expect((error as Error).message).toContain('No verifier registered');
    }
  });

  testFramework.test('should run full verification successfully', async () => {
    setup();
    
    // Register multiple verifiers
    controller.registerVerifier(VerificationModule.INFRASTRUCTURE, new MockVerifier('infrastructure'));
    controller.registerVerifier(VerificationModule.BACKEND, new MockVerifier('backend'));
    controller.registerVerifier(VerificationModule.FRONTEND, new MockVerifier('frontend'));
    
    const results = await controller.runFullVerification();
    
    testFramework.expect(results).toBeInstanceOf(Array);
    testFramework.expect(results.length).toBe(3);
    
    // All should pass
    const allPassed = results.every(r => r.status === 'PASS');
    testFramework.expect(allPassed).toBeTruthy();
  });

  testFramework.test('should handle mixed verification results', async () => {
    setup();
    
    // Register verifiers with mixed results
    controller.registerVerifier(VerificationModule.INFRASTRUCTURE, new MockVerifier('infrastructure', false));
    controller.registerVerifier(VerificationModule.BACKEND, new MockVerifier('backend', true)); // Will fail
    controller.registerVerifier(VerificationModule.FRONTEND, new MockVerifier('frontend', false));
    
    const results = await controller.runFullVerification();
    
    testFramework.expect(results).toBeInstanceOf(Array);
    testFramework.expect(results.length).toBe(3);
    
    // Check mixed results
    const passedResults = results.filter(r => r.status === 'PASS');
    const failedResults = results.filter(r => r.status === 'FAIL');
    
    testFramework.expect(passedResults.length).toBe(2);
    testFramework.expect(failedResults.length).toBe(1);
  });

  testFramework.test('should generate verification summary', () => {
    setup();
    
    const mockResults: VerificationResult[] = [
      {
        module: 'infrastructure',
        status: 'PASS',
        timestamp: new Date(),
        duration: 100,
        details: [
          { component: 'deps', test: 'check', result: 'PASS', message: 'OK' },
          { component: 'env', test: 'validate', result: 'PASS', message: 'OK' }
        ]
      },
      {
        module: 'backend',
        status: 'FAIL',
        timestamp: new Date(),
        duration: 150,
        details: [
          { component: 'server', test: 'start', result: 'FAIL', message: 'Failed' }
        ],
        errors: [new Error('Server error')]
      }
    ];
    
    const summary = controller.getVerificationSummary(mockResults);
    
    testFramework.expect(summary.totalTests).toBe(3);
    testFramework.expect(summary.passed).toBe(2);
    testFramework.expect(summary.failed).toBe(1);
    testFramework.expect(summary.criticalIssues).toBe(1);
  });

  testFramework.test('should generate report successfully', async () => {
    setup();
    await controller.initialize();
    
    const mockResults: VerificationResult[] = [
      {
        module: 'infrastructure',
        status: 'PASS',
        timestamp: new Date(),
        duration: 100,
        details: [
          { component: 'deps', test: 'check', result: 'PASS', message: 'OK' }
        ]
      }
    ];
    
    const report = await controller.generateReport(mockResults);
    
    testFramework.expect(report).toBeTruthy();
    testFramework.expect(report.overallStatus).toBeTruthy();
    testFramework.expect(report.summary).toBeTruthy();
    testFramework.expect(report.moduleResults).toEqual(mockResults);
  });

  testFramework.test('should handle verifier exceptions gracefully', async () => {
    setup();
    
    // Create a verifier that throws an exception
    class ExceptionVerifier implements BaseVerifier {
      readonly moduleName = 'exception-module';
      
      async verify(): Promise<VerificationResult> {
        throw new Error('Verifier exception');
      }
    }
    
    controller.registerVerifier(VerificationModule.INFRASTRUCTURE, new ExceptionVerifier());
    
    const results = await controller.runFullVerification();
    
    testFramework.expect(results).toBeInstanceOf(Array);
    testFramework.expect(results.length).toBe(1);
    testFramework.expect(results[0].status).toBe('FAIL');
    testFramework.expect(results[0].errors).toBeTruthy();
  });

  testFramework.test('should execute verifications in parallel', async () => {
    setup();
    
    const startTime = Date.now();
    
    // Register verifiers with different durations
    controller.registerVerifier(VerificationModule.INFRASTRUCTURE, new MockVerifier('infrastructure', false, 200));
    controller.registerVerifier(VerificationModule.BACKEND, new MockVerifier('backend', false, 300));
    controller.registerVerifier(VerificationModule.FRONTEND, new MockVerifier('frontend', false, 250));
    
    const results = await controller.runFullVerification();
    
    const totalTime = Date.now() - startTime;
    
    testFramework.expect(results.length).toBe(3);
    
    // Should complete in less time than sequential execution (750ms)
    // Allow some overhead for parallel execution
    testFramework.expect(totalTime).toBeLessThan(600);
  });

  testFramework.test('should call cleanup on verifiers', async () => {
    setup();
    
    let cleanupCalled = false;
    
    class CleanupVerifier implements BaseVerifier {
      readonly moduleName = 'cleanup-module';
      
      async verify(): Promise<VerificationResult> {
        return {
          module: this.moduleName,
          status: 'PASS',
          timestamp: new Date(),
          duration: 50,
          details: []
        };
      }
      
      async cleanup(): Promise<void> {
        cleanupCalled = true;
      }
    }
    
    controller.registerVerifier(VerificationModule.INFRASTRUCTURE, new CleanupVerifier());
    
    await controller.runFullVerification();
    
    testFramework.expect(cleanupCalled).toBeTruthy();
  });

  testFramework.test('should handle cleanup errors gracefully', async () => {
    setup();
    
    class FailingCleanupVerifier implements BaseVerifier {
      readonly moduleName = 'failing-cleanup-module';
      
      async verify(): Promise<VerificationResult> {
        return {
          module: this.moduleName,
          status: 'PASS',
          timestamp: new Date(),
          duration: 50,
          details: []
        };
      }
      
      async cleanup(): Promise<void> {
        throw new Error('Cleanup failed');
      }
    }
    
    controller.registerVerifier(VerificationModule.INFRASTRUCTURE, new FailingCleanupVerifier());
    
    // Should not throw error even if cleanup fails
    const results = await controller.runFullVerification();
    
    testFramework.expect(results).toBeInstanceOf(Array);
    testFramework.expect(results.length).toBe(1);
    testFramework.expect(results[0].status).toBe('PASS');
  });

  testFramework.test('should get dashboard data', async () => {
    setup();
    await controller.initialize();
    
    const dashboardData = await controller.getDashboardData();
    
    testFramework.expect(dashboardData).toBeTruthy();
  });

  testFramework.test('should get trend analysis', async () => {
    setup();
    await controller.initialize();
    
    const trendAnalysis = await controller.getTrendAnalysis(7);
    
    testFramework.expect(trendAnalysis).toBeTruthy();
  });

  testFramework.test('should get stored reports', async () => {
    setup();
    await controller.initialize();
    
    const storedReports = await controller.getStoredReports(5);
    
    testFramework.expect(storedReports).toBeTruthy();
  });

  testFramework.test('should cleanup old reports', async () => {
    setup();
    await controller.initialize();
    
    // Should not throw error
    await controller.cleanupOldReports();
    
    testFramework.expect(true).toBeTruthy(); // Test passes if no error thrown
  });
});

// Export test runner function
export async function runControllerTests(): Promise<boolean> {
  console.log('🧪 Running Verification Controller Tests...');
  
  try {
    const results = testFramework.getResults();
    const suiteResult = results.get('SystemVerificationController');
    
    if (suiteResult) {
      return suiteResult.failed === 0;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Verification controller tests failed:', error);
    return false;
  }
}