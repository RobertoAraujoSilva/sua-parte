import { AbstractBaseVerifier } from './base-verifier.js';
import { TestSuiteVerifier } from './interfaces.js';
import { VerificationResult, CypressSetupResult, TestResult, CoverageResult, TestEnvResult } from './types.js';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify( exec );
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

export class TestSuiteVerifierImpl extends AbstractBaseVerifier implements TestSuiteVerifier
{
  public readonly moduleName = 'TestSuite';

  constructor ()
  {
    super();
  }

  async verify (): Promise<VerificationResult>
  {
    const startTime = Date.now();
    const details = [];
    const errors = [];
    const warnings = [];

    try
    {
      this.log( 'Starting test suite verification...' );

      // 1. Validate Cypress setup
      const setupResult = await this.validateCypressSetup();
      details.push( {
        component: 'Cypress Setup',
        test: 'Installation and Configuration',
        result: setupResult.isValid ? 'PASS' : 'FAIL',
        message: setupResult.message,
        data: setupResult
      } );

      if ( !setupResult.isValid )
      {
        errors.push( new Error( `Cypress setup failed: ${ setupResult.message }` ) );

        // Auto-fix: Try to install/configure Cypress
        const fixResult = await this.autoFixCypressSetup( setupResult );
        if ( fixResult.fixed )
        {
          details.push( {
            component: 'Cypress Setup',
            test: 'Auto-Fix Applied',
            result: 'PASS',
            message: `Auto-fixed: ${ fixResult.message }`,
            data: fixResult
          } );
        }
      }

      // 2. Test environment validation
      const envResult = await this.validateTestEnvironment();
      details.push( {
        component: 'Test Environment',
        test: 'Environment Setup',
        result: envResult.isValid ? 'PASS' : 'FAIL',
        message: envResult.message,
        data: envResult
      } );

      if ( !envResult.isValid )
      {
        warnings.push( { message: `Test environment issues: ${ envResult.message }` } );
      }

      // 3. Browser compatibility check
      const browserResult = await this.checkBrowserCompatibility();
      details.push( {
        component: 'Browser Compatibility',
        test: 'Browser Support',
        result: browserResult.isValid ? 'PASS' : 'FAIL',
        message: browserResult.message,
        data: browserResult
      } );

      const status = errors.length > 0 ? 'FAIL' : warnings.length > 0 ? 'WARNING' : 'PASS';

      return {
        module: this.moduleName,
        status,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        details,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch ( error )
    {
      this.log( `Test suite verification failed: ${ error }`, 'error' );
      return {
        module: this.moduleName,
        status: 'FAIL',
        timestamp: new Date(),
        duration: Date.now() - startTime,
        details,
        errors: [ error as Error ]
      };
    }
  }

  async validateCypressSetup (): Promise<CypressSetupResult>
  {
    try
    {
      this.log( 'Validating Cypress setup...' );

      const checks = {
        cypressInstalled: false,
        configExists: false,
        configValid: false,
        testDirectoryExists: false,
        supportFilesExist: false,
        dependencies: false
      };

      const issues = [];
      const fixes = [];

      // Check if Cypress is installed
      try
      {
        await execAsync( 'npx cypress version' );
        checks.cypressInstalled = true;
        this.log( '✓ Cypress is installed' );
      } catch ( error )
      {
        checks.cypressInstalled = false;
        issues.push( 'Cypress not installed' );
        this.log( '✗ Cypress not installed', 'error' );
      }

      // Check if cypress.config.js/mjs exists
      const configPaths = [ 'cypress.config.js', 'cypress.config.mjs', 'cypress.config.ts' ];
      let configPath = null;

      for ( const configFile of configPaths )
      {
        try
        {
          await fs.access( configFile );
          configPath = configFile;
          checks.configExists = true;
          this.log( `✓ Cypress config found: ${ configFile }` );
          break;
        } catch ( error )
        {
          // Continue checking other config files
        }
      }

      if ( !checks.configExists )
      {
        issues.push( 'Cypress configuration file not found' );
        this.log( '✗ Cypress configuration file not found', 'error' );
      }

      // Validate configuration content
      if ( configPath )
      {
        try
        {
          const configContent = await fs.readFile( configPath, 'utf-8' );

          // Check for required configuration properties
          const requiredProps = [ 'baseUrl', 'e2e', 'specPattern' ];
          const hasRequiredProps = requiredProps.every( prop =>
            configContent.includes( prop )
          );

          if ( hasRequiredProps )
          {
            checks.configValid = true;
            this.log( '✓ Cypress configuration is valid' );
          } else
          {
            issues.push( 'Cypress configuration missing required properties' );
            this.log( '✗ Cypress configuration invalid', 'error' );
          }
        } catch ( error )
        {
          issues.push( 'Failed to read Cypress configuration' );
          this.log( `✗ Failed to read Cypress configuration: ${ error }`, 'error' );
        }
      }

      // Check test directory structure
      try
      {
        await fs.access( 'cypress/e2e' );
        checks.testDirectoryExists = true;
        this.log( '✓ Cypress test directory exists' );
      } catch ( error )
      {
        checks.testDirectoryExists = false;
        issues.push( 'Cypress test directory not found' );
        this.log( '✗ Cypress test directory not found', 'error' );
      }

      // Check support files
      const supportFiles = [ 'cypress/support/e2e.ts', 'cypress/support/e2e.js' ];
      for ( const supportFile of supportFiles )
      {
        try
        {
          await fs.access( supportFile );
          checks.supportFilesExist = true;
          this.log( `✓ Support file found: ${ supportFile }` );
          break;
        } catch ( error )
        {
          // Continue checking other support files
        }
      }

      if ( !checks.supportFilesExist )
      {
        issues.push( 'Cypress support files not found' );
        this.log( '✗ Cypress support files not found', 'error' );
      }

      // Check package.json dependencies
      try
      {
        const packageJson = JSON.parse( await fs.readFile( 'package.json', 'utf-8' ) );
        const hasCypress = packageJson.devDependencies?.cypress || packageJson.dependencies?.cypress;

        if ( hasCypress )
        {
          checks.dependencies = true;
          this.log( '✓ Cypress dependency found in package.json' );
        } else
        {
          issues.push( 'Cypress not found in package.json dependencies' );
          this.log( '✗ Cypress not found in package.json', 'error' );
        }
      } catch ( error )
      {
        issues.push( 'Failed to read package.json' );
        this.log( `✗ Failed to read package.json: ${ error }`, 'error' );
      }

      const isValid = Object.values( checks ).every( check => check === true );

      return {
        isValid,
        message: isValid ? 'Cypress setup is valid' : `Issues found: ${ issues.join( ', ' ) }`,
        checks,
        issues,
        fixes,
        configPath,
        version: checks.cypressInstalled ? await this.getCypressVersion() : null
      };

    } catch ( error )
    {
      this.log( `Failed to validate Cypress setup: ${ error }`, 'error' );
      return {
        isValid: false,
        message: `Validation failed: ${ error.message }`,
        checks: {},
        issues: [ error.message ],
        fixes: [],
        configPath: null,
        version: null
      };
    }
  }

  async validateTestEnvironment (): Promise<TestEnvResult>
  {
    try
    {
      this.log( 'Validating test environment...' );

      const checks = {
        environmentVariables: false,
        testData: false,
        baseUrlAccessible: false,
        testCredentials: false
      };

      const issues = [];
      const warnings = [];

      // Check environment variables
      const requiredEnvVars = [
        'CYPRESS_INSTRUCTOR_EMAIL',
        'CYPRESS_INSTRUCTOR_PASSWORD',
        'CYPRESS_STUDENT_EMAIL',
        'CYPRESS_STUDENT_PASSWORD'
      ];

      const missingEnvVars = requiredEnvVars.filter( envVar => !process.env[ envVar ] );

      if ( missingEnvVars.length === 0 )
      {
        checks.environmentVariables = true;
        this.log( '✓ All required environment variables are set' );
      } else
      {
        issues.push( `Missing environment variables: ${ missingEnvVars.join( ', ' ) }` );
        this.log( `✗ Missing environment variables: ${ missingEnvVars.join( ', ' ) }`, 'error' );
      }

      // Check if base URL is accessible
      try
      {
        const configContent = await fs.readFile( 'cypress.config.mjs', 'utf-8' );
        const baseUrlMatch = configContent.match( /baseUrl:\s*['"`]([^'"`]+)['"`]/ );

        if ( baseUrlMatch )
        {
          const baseUrl = baseUrlMatch[ 1 ];

          // Try to access the base URL
          try
          {
            const response = await fetch( baseUrl );
            if ( response.ok || response.status < 500 )
            {
              checks.baseUrlAccessible = true;
              this.log( `✓ Base URL accessible: ${ baseUrl }` );
            } else
            {
              warnings.push( `Base URL returned status ${ response.status }: ${ baseUrl }` );
              this.log( `⚠ Base URL returned status ${ response.status }: ${ baseUrl }`, 'warn' );
            }
          } catch ( fetchError )
          {
            warnings.push( `Base URL not accessible: ${ baseUrl }` );
            this.log( `⚠ Base URL not accessible: ${ baseUrl } - ${ fetchError }`, 'warn' );
          }
        }
      } catch ( error )
      {
        warnings.push( 'Could not determine base URL from configuration' );
        this.log( `⚠ Could not determine base URL: ${ error }`, 'warn' );
      }

      // Check test data and fixtures
      try
      {
        await fs.access( 'cypress/fixtures' );
        checks.testData = true;
        this.log( '✓ Test fixtures directory exists' );
      } catch ( error )
      {
        warnings.push( 'Test fixtures directory not found' );
        this.log( '⚠ Test fixtures directory not found', 'warn' );
      }

      // Validate test credentials (if environment allows)
      if ( checks.environmentVariables )
      {
        checks.testCredentials = true;
        this.log( '✓ Test credentials are configured' );
      }

      const isValid = checks.environmentVariables && checks.testCredentials;
      const hasWarnings = warnings.length > 0;

      return {
        isValid,
        message: isValid
          ? ( hasWarnings ? `Environment valid with warnings: ${ warnings.join( ', ' ) }` : 'Test environment is properly configured' )
          : `Environment issues: ${ issues.join( ', ' ) }`,
        checks,
        issues,
        warnings,
        environmentVariables: requiredEnvVars.reduce( ( acc, envVar ) =>
        {
          acc[ envVar ] = !!process.env[ envVar ];
          return acc;
        }, {} as Record<string, boolean> )
      };

    } catch ( error )
    {
      this.log( `Failed to validate test environment: ${ error }`, 'error' );
      return {
        isValid: false,
        message: `Environment validation failed: ${ error.message }`,
        checks: {},
        issues: [ error.message ],
        warnings: [],
        environmentVariables: {}
      };
    }
  }

  async checkBrowserCompatibility (): Promise<{ isValid: boolean; message: string; browsers: any[] }>
  {
    try
    {
      this.log( 'Checking browser compatibility...' );

      const browsers = [];
      const issues = [];

      // Check if browsers are available
      try
      {
        const { stdout } = await execAsync( 'npx cypress info' );
        const browserSection = stdout.split( 'Browsers found on your system are:' )[ 1 ];

        if ( browserSection )
        {
          const browserLines = browserSection.split( '\n' ).filter( line => line.trim() );

          for ( const line of browserLines )
          {
            if ( line.includes( '- ' ) )
            {
              const browserInfo = line.trim().replace( '- ', '' );
              browsers.push( browserInfo );
            }
          }
        }

        if ( browsers.length > 0 )
        {
          this.log( `✓ Found ${ browsers.length } compatible browsers` );
        } else
        {
          issues.push( 'No compatible browsers found' );
          this.log( '✗ No compatible browsers found', 'error' );
        }

      } catch ( error )
      {
        issues.push( 'Failed to check browser compatibility' );
        this.log( `✗ Failed to check browsers: ${ error }`, 'error' );
      }

      const isValid = browsers.length > 0;

      return {
        isValid,
        message: isValid
          ? `Found ${ browsers.length } compatible browsers`
          : 'No compatible browsers available',
        browsers
      };

    } catch ( error )
    {
      this.log( `Browser compatibility check failed: ${ error }`, 'error' );
      return {
        isValid: false,
        message: `Browser check failed: ${ error.message }`,
        browsers: []
      };
    }
  }

  private async autoFixCypressSetup ( setupResult: CypressSetupResult ): Promise<{ fixed: boolean; message: string; actions: string[] }>
  {
    const actions = [];
    let fixed = false;

    try
    {
      // Auto-fix: Install Cypress if not installed
      if ( !setupResult.checks.cypressInstalled )
      {
        try
        {
          this.log( 'Auto-fixing: Installing Cypress...' );
          await execAsync( 'npm install cypress --save-dev' );
          actions.push( 'Installed Cypress via npm' );
          fixed = true;
        } catch ( error )
        {
          this.log( `Failed to auto-install Cypress: ${ error }`, 'error' );
          actions.push( 'Failed to install Cypress' );
        }
      }

      // Auto-fix: Create basic cypress.config.js if missing
      if ( !setupResult.checks.configExists )
      {
        try
        {
          this.log( 'Auto-fixing: Creating basic Cypress configuration...' );
          const basicConfig = `import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts'
  }
})`;

          await fs.writeFile( 'cypress.config.js', basicConfig );
          actions.push( 'Created basic cypress.config.js' );
          fixed = true;
        } catch ( error )
        {
          this.log( `Failed to create Cypress config: ${ error }`, 'error' );
          actions.push( 'Failed to create Cypress configuration' );
        }
      }

      // Auto-fix: Create test directory structure
      if ( !setupResult.checks.testDirectoryExists )
      {
        try
        {
          this.log( 'Auto-fixing: Creating test directory structure...' );
          await fs.mkdir( 'cypress/e2e', { recursive: true } );
          actions.push( 'Created cypress/e2e directory' );
          fixed = true;
        } catch ( error )
        {
          this.log( `Failed to create test directory: ${ error }`, 'error' );
          actions.push( 'Failed to create test directory' );
        }
      }

      // Auto-fix: Create support files
      if ( !setupResult.checks.supportFilesExist )
      {
        try
        {
          this.log( 'Auto-fixing: Creating support files...' );
          await fs.mkdir( 'cypress/support', { recursive: true } );

          const supportContent = `// cypress/support/e2e.ts
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')`;

          await fs.writeFile( 'cypress/support/e2e.ts', supportContent );

          const commandsContent = `// cypress/support/commands.ts
/// <reference types="cypress" />

// Custom commands can be added here
// Example:
// Cypress.Commands.add('login', (email, password) => { ... })`;

          await fs.writeFile( 'cypress/support/commands.ts', commandsContent );

          actions.push( 'Created support files' );
          fixed = true;
        } catch ( error )
        {
          this.log( `Failed to create support files: ${ error }`, 'error' );
          actions.push( 'Failed to create support files' );
        }
      }

      return {
        fixed,
        message: fixed ? `Applied ${ actions.length } fixes` : 'No fixes could be applied',
        actions
      };

    } catch ( error )
    {
      this.log( `Auto-fix failed: ${ error }`, 'error' );
      return {
        fixed: false,
        message: `Auto-fix failed: ${ error.message }`,
        actions
      };
    }
  }

  private async getCypressVersion (): Promise<string | null>
  {
    try
    {
      const { stdout } = await execAsync( 'npx cypress version' );
      const versionMatch = stdout.match( /Cypress package version: (\d+\.\d+\.\d+)/ );
      return versionMatch ? versionMatch[ 1 ] : null;
    } catch ( error )
    {
      return null;
    }
  }

  async runAllTests (): Promise<TestResult[]>
  {
    try
    {
      this.log( 'Running all Cypress tests...' );

      const testResults: TestResult[] = [];

      // Get list of test files
      const testFiles = await this.getTestFiles();

      if ( testFiles.length === 0 )
      {
        this.log( 'No test files found', 'warn' );
        return [];
      }

      this.log( `Found ${ testFiles.length } test files to execute` );

      // Run tests individually to get detailed results
      for ( const testFile of testFiles )
      {
        const result = await this.runSingleTest( testFile );
        testResults.push( result );
      }

      // Also try running all tests together for overall metrics
      const overallResult = await this.runAllTestsTogether();
      if ( overallResult )
      {
        testResults.push( overallResult );
      }

      return testResults;

    } catch ( error )
    {
      this.log( `Failed to run tests: ${ error }`, 'error' );
      return [ {
        module: this.moduleName,
        status: 'FAIL' as const,
        timestamp: new Date(),
        duration: 0,
        details: [ {
          component: 'Test Execution',
          test: 'Run All Tests',
          result: 'FAIL' as const,
          message: `Test execution failed: ${ error.message }`,
          data: { error: error.message }
        } ],
        errors: [ error as Error ],
        testFile: 'all',
        passed: false
      } ];
    }
  }

  async analyzeTestCoverage (): Promise<CoverageResult>
  {
    try
    {
      this.log( 'Analyzing test coverage and quality...' );

      const analysis = {
        totalTests: 0,
        priorityTestsCovered: 0,
        componentsCovered: [],
        uncoveredComponents: [],
        testQualityMetrics: {},
        recommendations: []
      };

      // Get all test files
      const testFiles = await this.getTestFiles();
      analysis.totalTests = testFiles.length;

      // Analyze priority test coverage
      const priorityTests = [
        'admin-dashboard-integration.cy.ts',
        'authentication-roles.cy.ts',
        'sistema-ministerial-e2e.cy.ts',
        'pdf-upload-functionality.cy.ts'
      ];

      analysis.priorityTestsCovered = priorityTests.filter( test =>
        testFiles.includes( test )
      ).length;

      // Analyze what components/features are covered by tests
      const coverageAnalysis = await this.analyzeComponentCoverage( testFiles );
      analysis.componentsCovered = coverageAnalysis.covered;
      analysis.uncoveredComponents = coverageAnalysis.uncovered;

      // Analyze test quality metrics
      const qualityMetrics = await this.analyzeTestQuality( testFiles );
      analysis.testQualityMetrics = qualityMetrics;

      // Generate recommendations
      analysis.recommendations = await this.generateTestRecommendations( analysis );

      // Calculate overall coverage percentage
      const totalComponents = analysis.componentsCovered.length + analysis.uncoveredComponents.length;
      const coveragePercentage = totalComponents > 0
        ? Math.round( ( analysis.componentsCovered.length / totalComponents ) * 100 )
        : 0;

      this.log( `Test coverage analysis complete: ${ coveragePercentage }% coverage` );

      return {
        module: this.moduleName,
        status: coveragePercentage >= 80 ? 'PASS' : coveragePercentage >= 60 ? 'WARNING' : 'FAIL',
        timestamp: new Date(),
        duration: 0,
        details: [ {
          component: 'Test Coverage',
          test: 'Coverage Analysis',
          result: coveragePercentage >= 80 ? 'PASS' : coveragePercentage >= 60 ? 'WARNING' : 'FAIL',
          message: `${ coveragePercentage }% test coverage with ${ analysis.totalTests } tests`,
          data: analysis
        } ],
        percentage: coveragePercentage,
        uncoveredComponents: analysis.uncoveredComponents
      };

    } catch ( error )
    {
      this.log( `Failed to analyze test coverage: ${ error }`, 'error' );
      return {
        module: this.moduleName,
        status: 'FAIL',
        timestamp: new Date(),
        duration: 0,
        details: [ {
          component: 'Test Coverage',
          test: 'Coverage Analysis',
          result: 'FAIL',
          message: `Coverage analysis failed: ${ error.message }`,
          data: { error: error.message }
        } ],
        errors: [ error as Error ],
        percentage: 0,
        uncoveredComponents: [ 'Analysis failed' ]
      };
    }
  }

  private async analyzeComponentCoverage ( testFiles: string[] ): Promise<{ covered: string[]; uncovered: string[] }>
  {
    const covered = new Set<string>();
    const expectedComponents = [
      'Authentication System',
      'Admin Dashboard',
      'Student Portal',
      'PDF Upload',
      'Program Generation',
      'Material Management',
      'User Management',
      'Role-based Access Control',
      'Database Operations',
      'API Endpoints',
      'Frontend Routing',
      'Form Validation',
      'File Processing',
      'Notification System',
      'Assignment Generation',
      'Enhanced PDF Parsing'
    ];

    try
    {
      // Analyze each test file to determine what components it covers
      for ( const testFile of testFiles )
      {
        try
        {
          const testContent = await fs.readFile( `cypress/e2e/${ testFile }`, 'utf-8' );

          // Map test files to components based on content and naming
          if ( testFile.includes( 'admin-dashboard' ) || testContent.includes( 'admin' ) || testContent.includes( 'dashboard' ) )
          {
            covered.add( 'Admin Dashboard' );
          }

          if ( testFile.includes( 'authentication' ) || testContent.includes( 'login' ) || testContent.includes( 'auth' ) )
          {
            covered.add( 'Authentication System' );
            covered.add( 'Role-based Access Control' );
          }

          if ( testFile.includes( 'student' ) || testContent.includes( 'student' ) || testContent.includes( 'portal' ) )
          {
            covered.add( 'Student Portal' );
          }

          if ( testFile.includes( 'pdf' ) || testContent.includes( 'pdf' ) || testContent.includes( 'upload' ) )
          {
            covered.add( 'PDF Upload' );
            covered.add( 'File Processing' );
          }

          if ( testFile.includes( 'program' ) || testContent.includes( 'program' ) )
          {
            covered.add( 'Program Generation' );
          }

          if ( testFile.includes( 'assignment' ) || testContent.includes( 'assignment' ) )
          {
            covered.add( 'Assignment Generation' );
          }

          if ( testFile.includes( 'parsing' ) || testContent.includes( 'parsing' ) )
          {
            covered.add( 'Enhanced PDF Parsing' );
          }

          if ( testFile.includes( 'sistema-ministerial-e2e' ) || testFile.includes( 'completo' ) )
          {
            // E2E tests typically cover multiple components
            covered.add( 'Frontend Routing' );
            covered.add( 'API Endpoints' );
            covered.add( 'Form Validation' );
          }

          // Check for API testing
          if ( testContent.includes( 'cy.request' ) || testContent.includes( 'api/' ) )
          {
            covered.add( 'API Endpoints' );
          }

          // Check for routing testing
          if ( testContent.includes( 'cy.visit' ) || testContent.includes( 'cy.url' ) )
          {
            covered.add( 'Frontend Routing' );
          }

          // Check for form testing
          if ( testContent.includes( 'cy.type' ) || testContent.includes( 'form' ) || testContent.includes( 'input' ) )
          {
            covered.add( 'Form Validation' );
          }

        } catch ( error )
        {
          this.log( `Failed to analyze test file ${ testFile }: ${ error }`, 'warn' );
        }
      }

      const coveredArray = Array.from( covered );
      const uncovered = expectedComponents.filter( component => !covered.has( component ) );

      return {
        covered: coveredArray,
        uncovered
      };

    } catch ( error )
    {
      this.log( `Failed to analyze component coverage: ${ error }`, 'error' );
      return {
        covered: [],
        uncovered: expectedComponents
      };
    }
  }

  private async analyzeTestQuality ( testFiles: string[] ): Promise<Record<string, any>>
  {
    const metrics = {
      totalTests: testFiles.length,
      testsByType: {
        e2e: 0,
        integration: 0,
        unit: 0
      },
      testComplexity: {
        simple: 0,
        medium: 0,
        complex: 0
      },
      testMaintenance: {
        wellStructured: 0,
        needsImprovement: 0,
        problematic: 0
      },
      duplicateTests: [],
      unusedUtilities: [],
      performanceIssues: []
    };

    try
    {
      for ( const testFile of testFiles )
      {
        try
        {
          const testContent = await fs.readFile( `cypress/e2e/${ testFile }`, 'utf-8' );

          // Classify test type
          if ( testFile.includes( 'e2e' ) || testContent.includes( 'cy.visit' ) )
          {
            metrics.testsByType.e2e++;
          } else if ( testContent.includes( 'cy.request' ) )
          {
            metrics.testsByType.integration++;
          } else
          {
            metrics.testsByType.unit++;
          }

          // Analyze complexity based on content
          const lines = testContent.split( '\n' ).length;
          const cyCommands = ( testContent.match( /cy\./g ) || [] ).length;

          if ( lines < 50 && cyCommands < 10 )
          {
            metrics.testComplexity.simple++;
          } else if ( lines < 150 && cyCommands < 30 )
          {
            metrics.testComplexity.medium++;
          } else
          {
            metrics.testComplexity.complex++;
          }

          // Analyze maintenance quality
          const hasDescribe = testContent.includes( 'describe(' );
          const hasBeforeEach = testContent.includes( 'beforeEach(' );
          const hasComments = testContent.includes( '//' ) || testContent.includes( '/*' );
          const hasAssertions = testContent.includes( 'should(' ) || testContent.includes( 'expect(' );

          if ( hasDescribe && hasAssertions && ( hasBeforeEach || hasComments ) )
          {
            metrics.testMaintenance.wellStructured++;
          } else if ( hasDescribe && hasAssertions )
          {
            metrics.testMaintenance.needsImprovement++;
          } else
          {
            metrics.testMaintenance.problematic++;
          }

          // Check for potential performance issues
          if ( testContent.includes( 'cy.wait(' ) && !testContent.includes( 'cy.wait(@' ) )
          {
            metrics.performanceIssues.push( `${ testFile }: Uses hard waits instead of aliases` );
          }

          if ( cyCommands > 50 )
          {
            metrics.performanceIssues.push( `${ testFile }: Very long test with ${ cyCommands } commands` );
          }

        } catch ( error )
        {
          this.log( `Failed to analyze test quality for ${ testFile }: ${ error }`, 'warn' );
        }
      }

      // Check for duplicate test patterns (simplified)
      const testNames = new Set();
      for ( const testFile of testFiles )
      {
        const baseName = testFile.replace( /\.(cy|spec)\.(ts|js)$/, '' );
        if ( testNames.has( baseName ) )
        {
          metrics.duplicateTests.push( baseName );
        }
        testNames.add( baseName );
      }

      return metrics;

    } catch ( error )
    {
      this.log( `Failed to analyze test quality: ${ error }`, 'error' );
      return metrics;
    }
  }

  private async generateTestRecommendations ( analysis: any ): Promise<string[]>
  {
    const recommendations = [];

    try
    {
      // Coverage recommendations
      if ( analysis.priorityTestsCovered < 4 )
      {
        recommendations.push( `Add missing priority tests: ${ 4 - analysis.priorityTestsCovered } tests needed` );
      }

      if ( analysis.uncoveredComponents.length > 0 )
      {
        recommendations.push( `Add tests for uncovered components: ${ analysis.uncoveredComponents.slice( 0, 3 ).join( ', ' ) }${ analysis.uncoveredComponents.length > 3 ? '...' : '' }` );
      }

      // Quality recommendations
      const metrics = analysis.testQualityMetrics;

      if ( metrics.testMaintenance?.problematic > 0 )
      {
        recommendations.push( `Improve ${ metrics.testMaintenance.problematic } poorly structured tests` );
      }

      if ( metrics.performanceIssues?.length > 0 )
      {
        recommendations.push( `Fix ${ metrics.performanceIssues.length } performance issues in tests` );
      }

      if ( metrics.duplicateTests?.length > 0 )
      {
        recommendations.push( `Remove or consolidate ${ metrics.duplicateTests.length } duplicate tests` );
      }

      // Coverage-based recommendations
      const coveragePercentage = analysis.componentsCovered.length /
        ( analysis.componentsCovered.length + analysis.uncoveredComponents.length ) * 100;

      if ( coveragePercentage < 60 )
      {
        recommendations.push( 'Test coverage is below 60% - add more comprehensive tests' );
      } else if ( coveragePercentage < 80 )
      {
        recommendations.push( 'Test coverage is below 80% - consider adding edge case tests' );
      }

      // Test distribution recommendations
      if ( metrics.testsByType?.e2e < 3 )
      {
        recommendations.push( 'Add more end-to-end tests for complete user workflows' );
      }

      if ( metrics.testsByType?.integration < 2 )
      {
        recommendations.push( 'Add integration tests for API endpoints' );
      }

      return recommendations;

    } catch ( error )
    {
      this.log( `Failed to generate recommendations: ${ error }`, 'error' );
      return [ 'Failed to generate recommendations' ];
    }
  }

  private async getTestFiles (): Promise<string[]>
  {
    try
    {
      const testDir = 'cypress/e2e';
      const files = await fs.readdir( testDir );

      // Filter for test files and prioritize the main ones mentioned in requirements
      const priorityTests = [
        'admin-dashboard-integration.cy.ts',
        'authentication-roles.cy.ts',
        'sistema-ministerial-e2e.cy.ts',
        'pdf-upload-functionality.cy.ts'
      ];

      const allTestFiles = files.filter( file =>
        file.endsWith( '.cy.ts' ) || file.endsWith( '.cy.js' )
      );

      // Return priority tests first, then others
      const orderedTests = [
        ...priorityTests.filter( test => allTestFiles.includes( test ) ),
        ...allTestFiles.filter( test => !priorityTests.includes( test ) )
      ];

      return orderedTests;

    } catch ( error )
    {
      this.log( `Failed to get test files: ${ error }`, 'error' );
      return [];
    }
  }

  private async runSingleTest ( testFile: string ): Promise<TestResult>
  {
    const startTime = Date.now();

    try
    {
      this.log( `Running test: ${ testFile }` );

      // Run the specific test file
      const { stdout, stderr } = await execAsync( `npx cypress run --spec "cypress/e2e/${ testFile }" --reporter json`, {
        timeout: 300000 // 5 minutes timeout
      } );

      const duration = Date.now() - startTime;

      // Parse Cypress JSON output
      let testData;
      try
      {
        // Cypress outputs JSON to stdout when using --reporter json
        const jsonOutput = stdout.split( '\n' ).find( line =>
        {
          try
          {
            JSON.parse( line );
            return true;
          } catch {
            return false;
          }
        } );

        if ( jsonOutput )
        {
          testData = JSON.parse( jsonOutput );
        }
      } catch ( parseError )
      {
        this.log( `Failed to parse test output for ${ testFile }`, 'warn' );
      }

      // Determine if test passed based on exit code and output
      const passed = !stderr.includes( 'failed' ) && !stdout.includes( 'failing' );

      this.log( `Test ${ testFile } ${ passed ? 'PASSED' : 'FAILED' } in ${ duration }ms` );

      return {
        module: this.moduleName,
        status: passed ? 'PASS' : 'FAIL',
        timestamp: new Date(),
        duration,
        details: [ {
          component: 'Cypress Test',
          test: testFile,
          result: passed ? 'PASS' : 'FAIL',
          message: passed ? `Test passed in ${ duration }ms` : `Test failed - check logs for details`,
          data: {
            testFile,
            duration,
            output: stdout.substring( 0, 1000 ), // Truncate output
            cypressData: testData
          }
        } ],
        errors: passed ? undefined : [ new Error( `Test ${ testFile } failed` ) ],
        testFile,
        passed
      };

    } catch ( error )
    {
      const duration = Date.now() - startTime;
      this.log( `Test ${ testFile } failed with error: ${ error.message }`, 'error' );

      // Apply auto-fixes for common issues
      const autoFixResult = await this.autoFixTestIssues( testFile, error );

      return {
        module: this.moduleName,
        status: 'FAIL',
        timestamp: new Date(),
        duration,
        details: [ {
          component: 'Cypress Test',
          test: testFile,
          result: 'FAIL',
          message: `Test execution failed: ${ error.message }`,
          data: {
            testFile,
            duration,
            error: error.message,
            autoFix: autoFixResult
          }
        } ],
        errors: [ error as Error ],
        testFile,
        passed: false
      };
    }
  }

  private async runAllTestsTogether (): Promise<TestResult | null>
  {
    const startTime = Date.now();

    try
    {
      this.log( 'Running all tests together for overall metrics...' );

      // Run all tests with summary reporting
      const { stdout, stderr } = await execAsync( 'npx cypress run --reporter spec', {
        timeout: 600000 // 10 minutes timeout for all tests
      } );

      const duration = Date.now() - startTime;

      // Parse the summary from Cypress output
      const summaryMatch = stdout.match( /(\d+) passing.*?(\d+) failing/ );
      const passing = summaryMatch ? parseInt( summaryMatch[ 1 ] ) : 0;
      const failing = summaryMatch ? parseInt( summaryMatch[ 2 ] ) : 0;

      const overallPassed = failing === 0;

      this.log( `All tests completed: ${ passing } passing, ${ failing } failing in ${ duration }ms` );

      return {
        module: this.moduleName,
        status: overallPassed ? 'PASS' : 'FAIL',
        timestamp: new Date(),
        duration,
        details: [ {
          component: 'Cypress Test Suite',
          test: 'All Tests Summary',
          result: overallPassed ? 'PASS' : 'FAIL',
          message: `${ passing } passing, ${ failing } failing tests in ${ duration }ms`,
          data: {
            passing,
            failing,
            duration,
            totalTests: passing + failing
          }
        } ],
        errors: overallPassed ? undefined : [ new Error( `${ failing } tests failed` ) ],
        testFile: 'all-tests-summary',
        passed: overallPassed
      };

    } catch ( error )
    {
      const duration = Date.now() - startTime;
      this.log( `Failed to run all tests together: ${ error.message }`, 'error' );

      return {
        module: this.moduleName,
        status: 'FAIL',
        timestamp: new Date(),
        duration,
        details: [ {
          component: 'Cypress Test Suite',
          test: 'All Tests Execution',
          result: 'FAIL',
          message: `Failed to execute test suite: ${ error.message }`,
          data: {
            duration,
            error: error.message
          }
        } ],
        errors: [ error as Error ],
        testFile: 'all-tests-execution',
        passed: false
      };
    }
  }

  private async autoFixTestIssues ( testFile: string, error: Error ): Promise<{ fixed: boolean; message: string; actions: string[] }>
  {
    const actions: string[] = [];
    let fixed = false;

    try
    {
      const errorMessage = error.message.toLowerCase();

      // Auto-fix: Timeout issues
      if ( errorMessage.includes( 'timeout' ) || errorMessage.includes( 'timed out' ) )
      {
        this.log( `Auto-fixing: Timeout issue in ${ testFile }`, 'info' );

        // Could implement timeout adjustments in cypress.config.mjs
        actions.push( 'Detected timeout issue - consider increasing timeout values' );

        // For now, just log the recommendation
        this.log( 'Recommendation: Increase timeout values in cypress.config.mjs', 'warn' );
      }

      // Auto-fix: Element not found issues
      if ( errorMessage.includes( 'element not found' ) || errorMessage.includes( 'not exist' ) )
      {
        this.log( `Auto-fixing: Element not found in ${ testFile }`, 'info' );
        actions.push( 'Detected element not found - selectors may need updating' );

        // Could implement selector updates here
        this.log( 'Recommendation: Update element selectors in test file', 'warn' );
      }

      // Auto-fix: Network/connection issues
      if ( errorMessage.includes( 'network' ) || errorMessage.includes( 'connection' ) || errorMessage.includes( 'econnrefused' ) )
      {
        this.log( `Auto-fixing: Network issue in ${ testFile }`, 'info' );
        actions.push( 'Detected network issue - check if application is running' );

        this.log( 'Recommendation: Ensure frontend and backend are running before tests', 'warn' );
      }

      // Auto-fix: Authentication issues
      if ( errorMessage.includes( 'auth' ) || errorMessage.includes( 'login' ) || errorMessage.includes( 'unauthorized' ) )
      {
        this.log( `Auto-fixing: Authentication issue in ${ testFile }`, 'info' );
        actions.push( 'Detected authentication issue - check test credentials' );

        this.log( 'Recommendation: Verify test user credentials and environment variables', 'warn' );
      }

      return {
        fixed,
        message: actions.length > 0 ? `Applied ${ actions.length } auto-fix recommendations` : 'No auto-fixes available',
        actions
      };

    } catch ( autoFixError )
    {
      this.log( `Auto-fix failed: ${ autoFixError }`, 'error' );
      return {
        fixed: false,
        message: `Auto-fix failed: ${ autoFixError.message }`,
        actions
      };
    }
  }
}