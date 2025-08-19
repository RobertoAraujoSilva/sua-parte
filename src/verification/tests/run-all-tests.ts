/**
 * Comprehensive test runner for all verification system tests
 * Combines unit tests, integration tests, and performance tests
 */

import { testFramework } from './test-framework';
import { runAllUnitTests, TestCoverageAnalyzer } from './run-unit-tests';
import { runIntegrationTests, runPerformanceRegressionTests } from './integration-tests';

/**
 * Comprehensive test execution with auto-fix capabilities
 */
class ComprehensiveTestRunner
{
  private results: {
    unitTests: boolean;
    integrationTests: boolean;
    performanceTests: boolean;
    overallSuccess: boolean;
  } = {
      unitTests: false,
      integrationTests: false,
      performanceTests: false,
      overallSuccess: false
    };

  private autoFixesApplied: string[] = [];

  /**
   * Run all test suites with comprehensive error handling and auto-fixing
   */
  async runAllTests (): Promise<boolean>
  {
    console.log( '🚀 Starting Comprehensive Verification System Tests' );
    console.log( '==================================================\n' );

    const startTime = Date.now();

    try
    {
      // Apply global auto-fixes
      await this.applyGlobalAutoFixes();

      // Run unit tests
      console.log( '📋 Phase 1: Unit Tests' );
      console.log( '======================' );
      this.results.unitTests = await this.runUnitTestsWithRetry();

      if ( !this.results.unitTests )
      {
        console.log( '⚠️ Unit tests failed, attempting remediation...' );
        await this.remediateUnitTestFailures();

        // Retry unit tests after remediation
        console.log( '🔄 Retrying unit tests after remediation...' );
        this.results.unitTests = await runAllUnitTests();
      }

      // Run integration tests
      console.log( '\n📋 Phase 2: Integration Tests' );
      console.log( '=============================' );
      this.results.integrationTests = await this.runIntegrationTestsWithRetry();

      if ( !this.results.integrationTests )
      {
        console.log( '⚠️ Integration tests failed, attempting remediation...' );
        await this.remediateIntegrationTestFailures();

        // Retry integration tests after remediation
        console.log( '🔄 Retrying integration tests after remediation...' );
        this.results.integrationTests = await runIntegrationTests();
      }

      // Run performance tests
      console.log( '\n📋 Phase 3: Performance Tests' );
      console.log( '=============================' );
      this.results.performanceTests = await this.runPerformanceTestsWithRetry();

      // Calculate overall success
      this.results.overallSuccess = this.results.unitTests &&
        this.results.integrationTests &&
        this.results.performanceTests;

      // Generate comprehensive report
      await this.generateComprehensiveReport();

      const totalDuration = Date.now() - startTime;
      console.log( `\n⏱️ Total test execution time: ${ totalDuration }ms` );

      if ( this.results.overallSuccess )
      {
        console.log( '🎉 All tests passed successfully!' );
      } else
      {
        console.log( '❌ Some tests failed. See detailed report above.' );
      }

      return this.results.overallSuccess;

    } catch ( error )
    {
      console.error( '💥 Comprehensive test execution failed:', error );
      await this.handleCriticalFailure( error as Error );
      return false;
    }
  }

  /**
   * Apply global auto-fixes before running tests
   */
  private async applyGlobalAutoFixes (): Promise<void>
  {
    console.log( '🔧 Applying global auto-fixes...' );

    try
    {
      // Fix Node.js environment issues
      this.fixNodeEnvironment();

      // Fix module resolution issues
      this.fixModuleResolution();

      // Fix global mocks and stubs
      this.setupGlobalMocks();

      // Fix timeout configurations
      this.configureTimeouts();

      if ( this.autoFixesApplied.length > 0 )
      {
        console.log( '✅ Global auto-fixes applied:' );
        this.autoFixesApplied.forEach( fix => console.log( `  - ${ fix }` ) );
      }
      console.log( '' );

    } catch ( error )
    {
      console.warn( '⚠️ Some global auto-fixes failed:', error );
    }
  }

  /**
   * Fix Node.js environment issues
   */
  private fixNodeEnvironment (): void
  {
    try
    {
      // Ensure proper error handling
      process.on( 'unhandledRejection', ( reason, promise ) =>
      {
        console.warn( '⚠️ Unhandled Promise Rejection in tests:', reason );
      } );

      process.on( 'uncaughtException', ( error ) =>
      {
        console.warn( '⚠️ Uncaught Exception in tests:', error );
      } );

      this.autoFixesApplied.push( 'Configured Node.js error handling' );
    } catch ( error )
    {
      console.warn( 'Could not fix Node.js environment:', error );
    }
  }

  /**
   * Fix module resolution issues
   */
  private fixModuleResolution (): void
  {
    try
    {
      // Ensure proper module paths
      if ( typeof require !== 'undefined' )
      {
        // Add current directory to module paths
        const Module = require( 'module' );
        const originalResolveFilename = Module._resolveFilename;

        Module._resolveFilename = function ( request: string, parent: any, isMain: boolean )
        {
          try
          {
            return originalResolveFilename.call( this, request, parent, isMain );
          } catch ( error )
          {
            // Try relative path resolution
            if ( request.startsWith( './' ) || request.startsWith( '../' ) )
            {
              const path = require( 'path' );
              const resolvedPath = path.resolve( parent.path, request );
              if ( require( 'fs' ).existsSync( resolvedPath + '.ts' ) ||
                require( 'fs' ).existsSync( resolvedPath + '.js' ) )
              {
                return resolvedPath;
              }
            }
            throw error;
          }
        };

        this.autoFixesApplied.push( 'Enhanced module resolution' );
      }
    } catch ( error )
    {
      console.warn( 'Could not fix module resolution:', error );
    }
  }

  /**
   * Setup global mocks and stubs
   */
  private setupGlobalMocks (): void
  {
    try
    {
      // Setup global fetch mock if not present
      if ( typeof global !== 'undefined' && !global.fetch )
      {
        global.fetch = async ( url: string | Request | URL, init?: RequestInit ) =>
        {
          // Create a proper mock response object
          const mockResponse = {
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Headers(),
            json: async () => ( { status: 'ok', message: 'Mock response' } ),
            text: async () => 'Mock response text',
            blob: async () => new Blob(),
            arrayBuffer: async () => new ArrayBuffer( 0 ),
            formData: async () => new FormData(),
            clone: () => mockResponse, // Return the same mock response object
            body: null,
            bodyUsed: false,
            redirected: false,
            type: 'basic' as ResponseType,
            url: url.toString()
          };

          return mockResponse as unknown as Response;
        };

        this.autoFixesApplied.push( 'Setup global fetch mock' );
      }

      // Setup console mock for testing
      const originalConsole = console;
      ( global as any ).testConsole = {
        log: ( ...args: any[] ) => originalConsole.log( '[TEST]', ...args ),
        error: ( ...args: any[] ) => originalConsole.error( '[TEST ERROR]', ...args ),
        warn: ( ...args: any[] ) => originalConsole.warn( '[TEST WARN]', ...args ),
        info: ( ...args: any[] ) => originalConsole.info( '[TEST INFO]', ...args )
      };

      this.autoFixesApplied.push( 'Setup test console utilities' );

    } catch ( error )
    {
      console.warn( 'Could not setup global mocks:', error );
    }
  }

  /**
   * Configure timeouts for different test types
   */
  private configureTimeouts (): void
  {
    try
    {
      // Set appropriate timeouts
      ( global as any ).TEST_TIMEOUTS = {
        unit: 5000,        // 5 seconds for unit tests
        integration: 30000, // 30 seconds for integration tests
        performance: 60000  // 60 seconds for performance tests
      };

      this.autoFixesApplied.push( 'Configured test timeouts' );
    } catch ( error )
    {
      console.warn( 'Could not configure timeouts:', error );
    }
  }

  /**
   * Run unit tests with retry logic
   */
  private async runUnitTestsWithRetry (): Promise<boolean>
  {
    try
    {
      return await runAllUnitTests();
    } catch ( error )
    {
      console.warn( '⚠️ Unit tests failed on first attempt:', error );
      return false;
    }
  }

  /**
   * Run integration tests with retry logic
   */
  private async runIntegrationTestsWithRetry (): Promise<boolean>
  {
    try
    {
      return await runIntegrationTests();
    } catch ( error )
    {
      console.warn( '⚠️ Integration tests failed on first attempt:', error );
      return false;
    }
  }

  /**
   * Run performance tests with retry logic
   */
  private async runPerformanceTestsWithRetry (): Promise<boolean>
  {
    try
    {
      return await runPerformanceRegressionTests();
    } catch ( error )
    {
      console.warn( '⚠️ Performance tests failed on first attempt:', error );
      return false;
    }
  }

  /**
   * Remediate unit test failures
   */
  private async remediateUnitTestFailures (): Promise<void>
  {
    console.log( '🔧 Applying unit test remediation...' );

    try
    {
      // Clear module cache
      if ( typeof require !== 'undefined' && require.cache )
      {
        Object.keys( require.cache ).forEach( key =>
        {
          if ( key.includes( 'verification' ) )
          {
            delete require.cache[ key ];
          }
        } );
        console.log( '  - Cleared module cache' );
      }

      // Reset global state
      testFramework.restoreAllSpies();
      console.log( '  - Reset test framework state' );

      // Fix common mock issues
      this.setupGlobalMocks();
      console.log( '  - Reconfigured mocks' );

    } catch ( error )
    {
      console.warn( '⚠️ Unit test remediation failed:', error );
    }
  }

  /**
   * Remediate integration test failures
   */
  private async remediateIntegrationTestFailures (): Promise<void>
  {
    console.log( '🔧 Applying integration test remediation...' );

    try
    {
      // Reset environment variables
      const testEnvVars = {
        'VITE_SUPABASE_URL': 'https://test.supabase.co',
        'VITE_SUPABASE_ANON_KEY': 'test-anon-key',
        'NODE_ENV': 'test'
      };

      Object.entries( testEnvVars ).forEach( ( [ key, value ] ) =>
      {
        if ( !process.env[ key ] )
        {
          process.env[ key ] = value;
        }
      } );
      console.log( '  - Reset environment variables' );

      // Clear any cached connections
      if ( typeof global !== 'undefined' )
      {
        ( global as any ).cachedConnections = {};
        console.log( '  - Cleared cached connections' );
      }

    } catch ( error )
    {
      console.warn( '⚠️ Integration test remediation failed:', error );
    }
  }

  /**
   * Generate comprehensive test report
   */
  private async generateComprehensiveReport (): Promise<void>
  {
    console.log( '\n📊 Comprehensive Test Report' );
    console.log( '============================' );

    // Test results summary
    console.log( '📋 Test Results:' );
    console.log( `  Unit Tests: ${ this.results.unitTests ? '✅ PASS' : '❌ FAIL' }` );
    console.log( `  Integration Tests: ${ this.results.integrationTests ? '✅ PASS' : '❌ FAIL' }` );
    console.log( `  Performance Tests: ${ this.results.performanceTests ? '✅ PASS' : '❌ FAIL' }` );
    console.log( `  Overall: ${ this.results.overallSuccess ? '✅ PASS' : '❌ FAIL' }` );

    // Coverage analysis
    const coverageAnalyzer = new TestCoverageAnalyzer();
    coverageAnalyzer.printCoverageReport();

    // Auto-fixes applied
    if ( this.autoFixesApplied.length > 0 )
    {
      console.log( '\n🔧 Auto-fixes Applied:' );
      this.autoFixesApplied.forEach( fix => console.log( `  - ${ fix }` ) );
    }

    // Recommendations
    console.log( '\n💡 Recommendations:' );

    if ( !this.results.unitTests )
    {
      console.log( '  - Review unit test failures and fix underlying issues' );
      console.log( '  - Check mock configurations and test data setup' );
    }

    if ( !this.results.integrationTests )
    {
      console.log( '  - Verify service availability and configuration' );
      console.log( '  - Check network connectivity and timeouts' );
    }

    if ( !this.results.performanceTests )
    {
      console.log( '  - Optimize slow verification modules' );
      console.log( '  - Consider implementing caching or parallel execution' );
    }

    if ( this.results.overallSuccess )
    {
      console.log( '  - All tests passing! Consider adding more edge case coverage' );
      console.log( '  - Monitor performance trends over time' );
    }
  }

  /**
   * Handle critical test execution failures
   */
  private async handleCriticalFailure ( error: Error ): Promise<void>
  {
    console.log( '\n💥 Critical Test Failure Analysis' );
    console.log( '=================================' );

    console.log( `Error: ${ error.message }` );

    if ( error.stack )
    {
      console.log( 'Stack trace:' );
      console.log( error.stack );
    }

    // Provide specific remediation suggestions
    const errorMessage = error.message.toLowerCase();

    if ( errorMessage.includes( 'module' ) || errorMessage.includes( 'import' ) )
    {
      console.log( '\n🔧 Suggested fixes for module issues:' );
      console.log( '  - Check that all import paths are correct' );
      console.log( '  - Ensure all required modules are installed' );
      console.log( '  - Verify TypeScript configuration' );
    }

    if ( errorMessage.includes( 'timeout' ) || errorMessage.includes( 'async' ) )
    {
      console.log( '\n🔧 Suggested fixes for async/timeout issues:' );
      console.log( '  - Increase timeout values in test configuration' );
      console.log( '  - Check for unresolved promises in test code' );
      console.log( '  - Verify async/await usage is correct' );
    }

    if ( errorMessage.includes( 'fetch' ) || errorMessage.includes( 'network' ) )
    {
      console.log( '\n🔧 Suggested fixes for network issues:' );
      console.log( '  - Check internet connectivity' );
      console.log( '  - Verify service endpoints are accessible' );
      console.log( '  - Consider using offline/mock mode for tests' );
    }
  }

  /**
   * Get test results
   */
  getResults ()
  {
    return { ...this.results };
  }
}

/**
 * Main function to run all tests
 */
async function runComprehensiveTests (): Promise<boolean>
{
  const testRunner = new ComprehensiveTestRunner();
  return await testRunner.runAllTests();
}

// Run tests if this file is executed directly
if ( import.meta.url === `file://${ process.argv[ 1 ] }` )
{
  runComprehensiveTests()
    .then( success =>
    {
      console.log( `\n🏁 Comprehensive tests ${ success ? 'COMPLETED SUCCESSFULLY' : 'FAILED' }` );
      process.exit( success ? 0 : 1 );
    } )
    .catch( error =>
    {
      console.error( '💥 Comprehensive test execution failed:', error );
      process.exit( 1 );
    } );
}

export { runComprehensiveTests, ComprehensiveTestRunner };