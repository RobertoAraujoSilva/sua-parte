// Base verifier abstract class for common functionality

import { BaseVerifier } from './interfaces';
import { VerificationResult, VerificationDetail, VerificationStatus, VerificationWarning } from './types';

export abstract class AbstractBaseVerifier implements BaseVerifier {
  public abstract readonly moduleName: string;

  /**
   * Main verification method that must be implemented by subclasses
   */
  public abstract verify(): Promise<VerificationResult>;

  /**
   * Optional cleanup method
   */
  public async cleanup(): Promise<void> {
    // Default implementation - can be overridden by subclasses
  }

  /**
   * Helper method to create a verification result
   */
  protected createResult(
    status: VerificationStatus,
    details: VerificationDetail[],
    errors?: Error[],
    warnings?: VerificationWarning[]
  ): VerificationResult {
    return {
      module: this.moduleName,
      status,
      timestamp: new Date(),
      duration: 0, // Will be set by the controller
      details,
      errors,
      warnings
    };
  }

  /**
   * Helper method to create a verification detail
   */
  protected createDetail(
    component: string,
    test: string,
    result: VerificationStatus,
    message: string,
    data?: any
  ): VerificationDetail {
    return {
      component,
      test,
      result,
      message,
      data
    };
  }

  /**
   * Helper method to run a test with error handling
   */
  protected async runTest<T>(
    testName: string,
    testFunction: () => Promise<T>,
    component: string = this.moduleName
  ): Promise<{ result: VerificationDetail; data?: T }> {
    try {
      const startTime = Date.now();
      const data = await testFunction();
      const duration = Date.now() - startTime;

      return {
        result: this.createDetail(
          component,
          testName,
          'PASS',
          `Test passed in ${duration}ms`,
          { duration, ...data }
        ),
        data
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        result: this.createDetail(
          component,
          testName,
          'FAIL',
          `Test failed: ${errorMessage}`,
          { error: errorMessage }
        )
      };
    }
  }

  /**
   * Helper method to run multiple tests in parallel
   */
  protected async runParallelTests<T>(
    tests: Array<{
      name: string;
      test: () => Promise<T>;
      component?: string;
    }>
  ): Promise<VerificationDetail[]> {
    const testPromises = tests.map(({ name, test, component }) =>
      this.runTest(name, test, component)
    );

    const results = await Promise.allSettled(testPromises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value.result;
      } else {
        const testName = tests[index].name;
        const component = tests[index].component || this.moduleName;
        
        return this.createDetail(
          component,
          testName,
          'FAIL',
          `Test promise rejected: ${result.reason}`,
          { error: result.reason }
        );
      }
    });
  }

  /**
   * Helper method to validate required conditions
   */
  protected validateCondition(
    condition: boolean,
    component: string,
    test: string,
    successMessage: string,
    failureMessage: string,
    data?: any
  ): VerificationDetail {
    return this.createDetail(
      component,
      test,
      condition ? 'PASS' : 'FAIL',
      condition ? successMessage : failureMessage,
      data
    );
  }

  /**
   * Helper method to create a warning detail
   */
  protected createWarning(
    component: string,
    test: string,
    message: string,
    data?: any
  ): VerificationDetail {
    return this.createDetail(component, test, 'WARNING', message, data);
  }

  /**
   * Helper method to measure execution time
   */
  protected async measureTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await operation();
    const duration = Date.now() - startTime;
    
    return { result, duration };
  }

  /**
   * Helper method to retry operations with exponential backoff
   */
  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Check if a file exists (browser-compatible version)
   */
  protected async fileExists(filePath: string): Promise<boolean> {
    // In browser environment, we'll use fetch to check if file exists
    try {
      const response = await fetch(filePath, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Helper method to check if a directory exists (browser-compatible version)
   */
  protected async directoryExists(dirPath: string): Promise<boolean> {
    // In browser environment, directory checking is limited
    // This is a placeholder that always returns true for now
    // Individual verifiers should implement their own directory checking logic
    return true;
  }

  /**
   * Helper method to log verification progress
   */
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.moduleName.toUpperCase()}]`;
    
    switch (level) {
      case 'info':
        console.log(`${prefix} ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️  ${message}`);
        break;
      case 'error':
        console.error(`${prefix} ❌ ${message}`);
        break;
    }
  }
}