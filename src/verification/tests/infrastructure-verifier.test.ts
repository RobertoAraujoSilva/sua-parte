/**
 * Unit tests for Infrastructure Verifier
 * Tests dependency checking, environment validation, and directory structure verification
 */

import { testFramework } from './test-framework';
import { InfrastructureVerifierImpl } from '../infrastructure-verifier';
import { VerificationModule } from '../interfaces';
import * as fs from 'fs';
import * as path from 'path';

testFramework.describe('InfrastructureVerifier', () => {
  let verifier: InfrastructureVerifierImpl;

  // Setup before each test
  function setup() {
    verifier = new InfrastructureVerifierImpl();
  }

  testFramework.test('should initialize with correct module name', () => {
    setup();
    testFramework.expect(verifier.moduleName).toBe(VerificationModule.INFRASTRUCTURE);
  });

  testFramework.test('should check dependencies successfully', async () => {
    setup();
    
    // Mock package.json existence
    const existsSyncSpy = testFramework.spy(fs, 'existsSync');
    existsSyncSpy.mockReturnValue(true);

    const readFileSyncSpy = testFramework.spy(fs, 'readFileSync');
    readFileSyncSpy.mockReturnValue(JSON.stringify({
      dependencies: {
        'react': '^18.0.0',
        '@supabase/supabase-js': '^2.0.0'
      },
      devDependencies: {
        'typescript': '^5.0.0',
        'vite': '^5.0.0'
      }
    }));

    const result = await verifier.checkDependencies();
    
    testFramework.expect(result.status).toBe('PASS');
    testFramework.expect(result.module).toBe('infrastructure');
    testFramework.expect(result.details).toHaveLength(2); // frontend and backend package.json
    
    // Cleanup
    existsSyncSpy.restore();
    readFileSyncSpy.restore();
  });

  testFramework.test('should detect missing package.json files', async () => {
    setup();
    
    const existsSyncSpy = testFramework.spy(fs, 'existsSync');
    existsSyncSpy.mockReturnValue(false);

    const result = await verifier.checkDependencies();
    
    testFramework.expect(result.status).toBe('FAIL');
    testFramework.expect(result.errors).toBeTruthy();
    testFramework.expect(result.errors!.length).toBe(1);
    
    existsSyncSpy.restore();
  });

  testFramework.test('should validate environment variables', async () => {
    setup();
    
    // Mock environment variables
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key',
      NODE_ENV: 'test'
    };

    const result = await verifier.validateEnvironment();
    
    testFramework.expect(result.status).toBe('PASS');
    testFramework.expect(result.module).toBe('infrastructure');
    
    // Restore environment
    process.env = originalEnv;
  });

  testFramework.test('should detect missing environment variables', async () => {
    setup();
    
    const originalEnv = process.env;
    process.env = {}; // Empty environment

    const result = await verifier.validateEnvironment();
    
    testFramework.expect(result.status).toBe('FAIL');
    testFramework.expect(result.errors).toBeTruthy();
    
    // Restore environment
    process.env = originalEnv;
  });

  testFramework.test('should verify directory structure', async () => {
    setup();
    
    const existsSyncSpy = testFramework.spy(fs, 'existsSync');
    existsSyncSpy.mockReturnValue(true);

    const statSyncSpy = testFramework.spy(fs, 'statSync');
    statSyncSpy.mockReturnValue({
      isDirectory: () => true
    } as any);

    const result = await verifier.verifyDirectoryStructure();
    
    testFramework.expect(result.status).toBe('PASS');
    testFramework.expect(result.module).toBe('infrastructure');
    
    existsSyncSpy.restore();
    statSyncSpy.restore();
  });

  testFramework.test('should detect missing directories', async () => {
    setup();
    
    const existsSyncSpy = testFramework.spy(fs, 'existsSync');
    existsSyncSpy.mockReturnValue(false);

    const result = await verifier.verifyDirectoryStructure();
    
    testFramework.expect(result.status).toBe('FAIL');
    testFramework.expect(result.errors).toBeTruthy();
    
    existsSyncSpy.restore();
  });

  testFramework.test('should run full verification', async () => {
    setup();
    
    // Mock all dependencies
    const existsSyncSpy = testFramework.spy(fs, 'existsSync');
    existsSyncSpy.mockReturnValue(true);

    const readFileSyncSpy = testFramework.spy(fs, 'readFileSync');
    readFileSyncSpy.mockReturnValue(JSON.stringify({
      dependencies: { 'react': '^18.0.0' }
    }));

    const statSyncSpy = testFramework.spy(fs, 'statSync');
    statSyncSpy.mockReturnValue({
      isDirectory: () => true
    } as any);

    // Set up environment
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key'
    };

    const result = await verifier.verify();
    
    testFramework.expect(result.status).toBe('PASS');
    testFramework.expect(result.module).toBe('infrastructure');
    testFramework.expect(result.details.length).toBeGreaterThan(0);
    
    // Cleanup
    existsSyncSpy.restore();
    readFileSyncSpy.restore();
    statSyncSpy.restore();
    process.env = originalEnv;
  });

  testFramework.test('should handle verification errors gracefully', async () => {
    setup();
    
    // Mock fs to throw error
    const existsSyncSpy = testFramework.spy(fs, 'existsSync');
    existsSyncSpy.mockImplementation(() => {
      throw new Error('File system error');
    });

    const result = await verifier.verify();
    
    testFramework.expect(result.status).toBe('FAIL');
    testFramework.expect(result.errors).toBeTruthy();
    testFramework.expect(result.errors!.length).toBeGreaterThan(0);
    
    existsSyncSpy.restore();
  });

  testFramework.test('should validate package.json content', async () => {
    setup();
    
    const existsSyncSpy = testFramework.spy(fs, 'existsSync');
    existsSyncSpy.mockReturnValue(true);

    const readFileSyncSpy = testFramework.spy(fs, 'readFileSync');
    readFileSyncSpy.mockReturnValue('invalid json');

    const result = await verifier.checkDependencies();
    
    testFramework.expect(result.status).toBe('FAIL');
    testFramework.expect(result.errors).toBeTruthy();
    
    existsSyncSpy.restore();
    readFileSyncSpy.restore();
  });

  testFramework.test('should check Node.js version compatibility', async () => {
    setup();
    
    // Mock process.version
    const originalVersion = process.version;
    Object.defineProperty(process, 'version', {
      value: 'v18.0.0',
      configurable: true
    });

    const existsSyncSpy = testFramework.spy(fs, 'existsSync');
    existsSyncSpy.mockReturnValue(true);

    const readFileSyncSpy = testFramework.spy(fs, 'readFileSync');
    readFileSyncSpy.mockReturnValue(JSON.stringify({
      engines: {
        node: '>=18.0.0'
      }
    }));

    const result = await verifier.checkDependencies();
    
    testFramework.expect(result.status).toBe('PASS');
    
    // Restore
    Object.defineProperty(process, 'version', {
      value: originalVersion,
      configurable: true
    });
    existsSyncSpy.restore();
    readFileSyncSpy.restore();
  });
});

// Export test runner function
export async function runInfrastructureVerifierTests(): Promise<boolean> {
  console.log('🧪 Running Infrastructure Verifier Tests...');
  
  try {
    // Run all tests in this file
    // The tests are already registered with the framework
    
    const results = testFramework.getResults();
    const suiteResult = results.get('InfrastructureVerifier');
    
    if (suiteResult) {
      return suiteResult.failed === 0;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Infrastructure verifier tests failed:', error);
    return false;
  }
}