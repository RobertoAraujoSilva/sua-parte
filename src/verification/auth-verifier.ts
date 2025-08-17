/**
 * Authentication Verification Module
 * Comprehensive testing of authentication system with multi-role support
 * Extends existing supabaseHealthCheck and authTimeoutDiagnostics utilities
 */

import { AbstractBaseVerifier } from './base-verifier';
import { VerificationResult, AuthenticationResult, UserRole } from './types';
import { performHealthCheck, testAuthOperations } from '@/utils/supabaseHealthCheck';
import { runAuthTimeoutDiagnostics } from '@/utils/authTimeoutDiagnostics';
import { supabase } from '@/integrations/supabase/client';
import { RBACTester, RBACTestConfig } from './rbac-tester';
import { SessionTester, SessionTestConfig } from './session-tester';

export interface RoleTestCredentials
{
  email: string;
  password: string;
  expectedRole: UserRole;
  expectedDashboard: string;
}

export interface AuthVerificationConfig
{
  testCredentials: {
    admin: RoleTestCredentials;
    instructor: RoleTestCredentials;
    student: RoleTestCredentials;
  };
  timeouts: {
    login: number;
    dashboard: number;
    session: number;
  };
  rbacConfig: RBACTestConfig;
  sessionConfig: SessionTestConfig;
}

export class AuthVerifier extends AbstractBaseVerifier
{
  public readonly moduleName = 'authentication';
  private config: AuthVerificationConfig;
  private rbacTester: RBACTester;
  private sessionTester: SessionTester;

  constructor ( config: AuthVerificationConfig )
  {
    super();
    this.config = config;
    this.rbacTester = new RBACTester( config.rbacConfig );
    this.sessionTester = new SessionTester( config.sessionConfig );
  }

  async verify (): Promise<VerificationResult>
  {
    this.log( 'Starting authentication verification...' );
    const startTime = Date.now();

    try
    {
      const results: AuthenticationResult[] = [];

      // Step 1: Basic health check using existing utility
      this.log( 'Running basic Supabase health check...' );
      const healthCheck = await this.runHealthCheck();
      results.push( healthCheck );

      // Step 2: Timeout diagnostics using existing utility
      this.log( 'Running authentication timeout diagnostics...' );
      const timeoutDiagnostics = await this.runTimeoutDiagnostics();
      results.push( timeoutDiagnostics );

      // Step 3: Multi-role authentication testing
      this.log( 'Testing multi-role authentication...' );
      const roleTests = await this.testMultiRoleAuthentication();
      results.push( ...roleTests );

      // Step 4: Dashboard access validation
      this.log( 'Validating dashboard access for each role...' );
      const dashboardTests = await this.testDashboardAccess();
      results.push( ...dashboardTests );

      // Step 5: Role-based access control testing
      this.log( 'Testing role-based access control...' );
      const rbacTests = await this.rbacTester.testRoleBasedAccessControl();
      results.push( ...rbacTests );

      // Step 6: Session management and security testing
      this.log( 'Testing session management and security...' );
      const sessionTests = await this.sessionTester.testSessionManagement();
      results.push( ...sessionTests );

      const duration = Date.now() - startTime;
      const hasFailures = results.some( r => !r.success );

      return {
        module: 'Authentication',
        status: hasFailures ? 'FAIL' : 'PASS',
        timestamp: new Date(),
        duration,
        details: results.map( r => ( {
          component: r.component,
          test: r.test,
          result: r.success ? 'PASS' : 'FAIL',
          message: r.message,
          data: r.data
        } ) ),
        errors: results.filter( r => !r.success ).map( r => new Error( r.message ) ),
        warnings: results.filter( r => r.warnings ).flatMap( r =>
          ( r.warnings || [] ).map( warning => ( {
            message: warning,
            component: r.component
          } ) )
        )
      };

    } catch ( error )
    {
      const duration = Date.now() - startTime;
      this.log( `Authentication verification failed: ${ error instanceof Error ? error.message : 'Unknown error' }`, 'error' );

      return {
        module: 'Authentication',
        status: 'FAIL',
        timestamp: new Date(),
        duration,
        details: [ {
          component: 'Authentication',
          test: 'Overall Verification',
          result: 'FAIL',
          message: `Verification failed: ${ error instanceof Error ? error.message : 'Unknown error' }`
        } ],
        errors: [ error instanceof Error ? error : new Error( 'Unknown error' ) ]
      };
    }
  }

  /**
   * Run basic health check using existing utility
   */
  private async runHealthCheck (): Promise<AuthenticationResult>
  {
    try
    {
      const healthResult = await performHealthCheck();
      const authOpsResult = await testAuthOperations();

      return {
        component: 'Supabase Health',
        test: 'Basic Health Check',
        success: healthResult.isHealthy,
        message: healthResult.isHealthy
          ? `Health check passed in ${ healthResult.latency }ms`
          : `Health check failed: ${ healthResult.errors.join( ', ' ) }`,
        data: {
          healthCheck: healthResult,
          authOperations: authOpsResult,
          latency: healthResult.latency
        },
        warnings: healthResult.errors.length > 0 ? healthResult.errors : undefined
      };
    } catch ( error )
    {
      return {
        component: 'Supabase Health',
        test: 'Basic Health Check',
        success: false,
        message: `Health check failed: ${ error instanceof Error ? error.message : 'Unknown error' }`,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Run timeout diagnostics using existing utility
   */
  private async runTimeoutDiagnostics (): Promise<AuthenticationResult>
  {
    try
    {
      const diagnosticsResult = await runAuthTimeoutDiagnostics();

      return {
        component: 'Authentication Timeouts',
        test: 'Timeout Diagnostics',
        success: diagnosticsResult.overall.success,
        message: diagnosticsResult.overall.success
          ? `Timeout diagnostics passed in ${ diagnosticsResult.overall.totalDuration }ms`
          : `Timeout issues detected: ${ diagnosticsResult.overall.criticalIssues.join( ', ' ) }`,
        data: {
          diagnostics: diagnosticsResult,
          networkLatency: diagnosticsResult.networkAnalysis.latency,
          recommendedTimeouts: diagnosticsResult.networkAnalysis.recommendedTimeouts
        },
        warnings: diagnosticsResult.overall.criticalIssues.length > 0
          ? diagnosticsResult.overall.criticalIssues
          : undefined
      };
    } catch ( error )
    {
      return {
        component: 'Authentication Timeouts',
        test: 'Timeout Diagnostics',
        success: false,
        message: `Timeout diagnostics failed: ${ error instanceof Error ? error.message : 'Unknown error' }`,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Test authentication for all user roles
   */
  private async testMultiRoleAuthentication (): Promise<AuthenticationResult[]>
  {
    const results: AuthenticationResult[] = [];
    const roles: ( keyof typeof this.config.testCredentials )[] = [ 'admin', 'instructor', 'student' ];

    for ( const role of roles )
    {
      const credentials = this.config.testCredentials[ role ];
      this.log( `Testing ${ role } authentication...` );

      try
      {
        const loginResult = await this.testRoleLogin( role, credentials );
        results.push( loginResult );

        // If login successful, test role validation
        if ( loginResult.success )
        {
          const roleValidation = await this.validateUserRole( credentials.expectedRole );
          results.push( roleValidation );
        }

      } catch ( error )
      {
        results.push( {
          component: `${ role.charAt( 0 ).toUpperCase() + role.slice( 1 ) } Authentication`,
          test: 'Role Login',
          success: false,
          message: `${ role } authentication failed: ${ error instanceof Error ? error.message : 'Unknown error' }`,
          data: { role, error: error instanceof Error ? error.message : 'Unknown error' }
        } );
      }
    }

    return results;
  }

  /**
   * Test login for specific role
   */
  private async testRoleLogin ( role: string, credentials: RoleTestCredentials ): Promise<AuthenticationResult>
  {
    const startTime = Date.now();

    try
    {
      // First, ensure we're logged out
      await supabase.auth.signOut();

      // Attempt login with timeout
      const loginPromise = supabase.auth.signInWithPassword( {
        email: credentials.email,
        password: credentials.password
      } );

      const timeoutPromise = new Promise<never>( ( _, reject ) =>
      {
        setTimeout( () => reject( new Error( 'Login timeout' ) ), this.config.timeouts.login );
      } );

      const { data, error } = await Promise.race( [ loginPromise, timeoutPromise ] );
      const duration = Date.now() - startTime;

      if ( error )
      {
        return {
          component: `${ role.charAt( 0 ).toUpperCase() + role.slice( 1 ) } Authentication`,
          test: 'Role Login',
          success: false,
          message: `Login failed: ${ error.message }`,
          data: { role, duration, error: error.message }
        };
      }

      if ( !data.user )
      {
        return {
          component: `${ role.charAt( 0 ).toUpperCase() + role.slice( 1 ) } Authentication`,
          test: 'Role Login',
          success: false,
          message: 'Login succeeded but no user data returned',
          data: { role, duration }
        };
      }

      return {
        component: `${ role.charAt( 0 ).toUpperCase() + role.slice( 1 ) } Authentication`,
        test: 'Role Login',
        success: true,
        message: `Login successful in ${ duration }ms`,
        data: {
          role,
          duration,
          userId: data.user.id,
          email: data.user.email
        }
      };

    } catch ( error )
    {
      const duration = Date.now() - startTime;
      return {
        component: `${ role.charAt( 0 ).toUpperCase() + role.slice( 1 ) } Authentication`,
        test: 'Role Login',
        success: false,
        message: `Login failed: ${ error instanceof Error ? error.message : 'Unknown error' }`,
        data: { role, duration, error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Validate user role after login
   */
  private async validateUserRole ( expectedRole: UserRole ): Promise<AuthenticationResult>
  {
    try
    {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if ( userError || !user )
      {
        return {
          component: 'Role Validation',
          test: 'User Role Check',
          success: false,
          message: 'Could not retrieve user for role validation',
          data: { expectedRole, error: userError?.message }
        };
      }

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from( 'profiles' )
        .select( 'cargo, role' )
        .eq( 'id', user.id )
        .single();

      if ( profileError )
      {
        return {
          component: 'Role Validation',
          test: 'User Role Check',
          success: false,
          message: `Could not retrieve user profile: ${ profileError.message }`,
          data: { expectedRole, userId: user.id, error: profileError.message }
        };
      }

      // Validate role matches expected
      const actualRole = profile?.role || profile?.cargo;
      const roleMatches = actualRole === expectedRole;

      return {
        component: 'Role Validation',
        test: 'User Role Check',
        success: roleMatches,
        message: roleMatches
          ? `Role validation successful: ${ actualRole }`
          : `Role mismatch: expected ${ expectedRole }, got ${ actualRole }`,
        data: {
          expectedRole,
          actualRole,
          userId: user.id,
          profile
        }
      };

    } catch ( error )
    {
      return {
        component: 'Role Validation',
        test: 'User Role Check',
        success: false,
        message: `Role validation failed: ${ error instanceof Error ? error.message : 'Unknown error' }`,
        data: { expectedRole, error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Test dashboard access for each role
   */
  private async testDashboardAccess (): Promise<AuthenticationResult[]>
  {
    const results: AuthenticationResult[] = [];
    const roles: ( keyof typeof this.config.testCredentials )[] = [ 'admin', 'instructor', 'student' ];

    for ( const role of roles )
    {
      const credentials = this.config.testCredentials[ role ];
      this.log( `Testing ${ role } dashboard access...` );

      try
      {
        // Login first
        await supabase.auth.signOut();
        const { error: loginError } = await supabase.auth.signInWithPassword( {
          email: credentials.email,
          password: credentials.password
        } );

        if ( loginError )
        {
          results.push( {
            component: `${ role.charAt( 0 ).toUpperCase() + role.slice( 1 ) } Dashboard`,
            test: 'Dashboard Access',
            success: false,
            message: `Cannot test dashboard access - login failed: ${ loginError.message }`,
            data: { role, expectedDashboard: credentials.expectedDashboard }
          } );
          continue;
        }

        // Test dashboard access by checking if user can access role-specific data
        const dashboardTest = await this.testRoleDashboardAccess( role, credentials.expectedDashboard );
        results.push( dashboardTest );

      } catch ( error )
      {
        results.push( {
          component: `${ role.charAt( 0 ).toUpperCase() + role.slice( 1 ) } Dashboard`,
          test: 'Dashboard Access',
          success: false,
          message: `Dashboard access test failed: ${ error instanceof Error ? error.message : 'Unknown error' }`,
          data: { role, expectedDashboard: credentials.expectedDashboard }
        } );
      }
    }

    return results;
  }

  /**
   * Test specific role dashboard access
   */
  private async testRoleDashboardAccess ( role: string, expectedDashboard: string ): Promise<AuthenticationResult>
  {
    try
    {
      let accessTest: { success: boolean; message: string; data?: any };

      switch ( role )
      {
        case 'admin':
          accessTest = await this.testAdminDashboardAccess();
          break;
        case 'instructor':
          accessTest = await this.testInstructorDashboardAccess();
          break;
        case 'student':
          accessTest = await this.testStudentPortalAccess();
          break;
        default:
          accessTest = {
            success: false,
            message: `Unknown role: ${ role }`
          };
      }

      return {
        component: `${ role.charAt( 0 ).toUpperCase() + role.slice( 1 ) } Dashboard`,
        test: 'Dashboard Access',
        success: accessTest.success,
        message: accessTest.message,
        data: {
          role,
          expectedDashboard,
          ...accessTest.data
        }
      };

    } catch ( error )
    {
      return {
        component: `${ role.charAt( 0 ).toUpperCase() + role.slice( 1 ) } Dashboard`,
        test: 'Dashboard Access',
        success: false,
        message: `Dashboard access failed: ${ error instanceof Error ? error.message : 'Unknown error' }`,
        data: { role, expectedDashboard }
      };
    }
  }

  /**
   * Test admin dashboard access
   */
  private async testAdminDashboardAccess (): Promise<{ success: boolean; message: string; data?: any }>
  {
    try
    {
      // Test admin-specific operations
      const tests = [];

      // Test 1: Can access all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from( 'profiles' )
        .select( 'id, nome, cargo' )
        .limit( 5 );

      tests.push( {
        test: 'Access All Profiles',
        success: !profilesError,
        error: profilesError?.message
      } );

      // Test 2: Can access admin-only tables (if any)
      // This would depend on your specific schema

      const allTestsPassed = tests.every( t => t.success );
      const failedTests = tests.filter( t => !t.success );

      return {
        success: allTestsPassed,
        message: allTestsPassed
          ? 'Admin dashboard access validated successfully'
          : `Admin dashboard access failed: ${ failedTests.map( t => t.error ).join( ', ' ) }`,
        data: { tests, profileCount: profiles?.length || 0 }
      };

    } catch ( error )
    {
      return {
        success: false,
        message: `Admin dashboard test failed: ${ error instanceof Error ? error.message : 'Unknown error' }`,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Test instructor dashboard access
   */
  private async testInstructorDashboardAccess (): Promise<{ success: boolean; message: string; data?: any }>
  {
    try
    {
      // Test instructor-specific operations
      const tests = [];

      // Test 1: Can access own profile
      const { data: { user } } = await supabase.auth.getUser();
      if ( user )
      {
        const { data: profile, error: profileError } = await supabase
          .from( 'profiles' )
          .select( 'id, nome, cargo' )
          .eq( 'id', user.id )
          .single();

        tests.push( {
          test: 'Access Own Profile',
          success: !profileError,
          error: profileError?.message
        } );
      }

      // Test 2: Can access programs/materials (instructor permissions)
      const { data: programs, error: programsError } = await supabase
        .from( 'programas' )
        .select( 'id, data_programa' )
        .limit( 5 );

      tests.push( {
        test: 'Access Programs',
        success: !programsError,
        error: programsError?.message
      } );

      const allTestsPassed = tests.every( t => t.success );
      const failedTests = tests.filter( t => !t.success );

      return {
        success: allTestsPassed,
        message: allTestsPassed
          ? 'Instructor dashboard access validated successfully'
          : `Instructor dashboard access failed: ${ failedTests.map( t => t.error ).join( ', ' ) }`,
        data: { tests, programCount: programs?.length || 0 }
      };

    } catch ( error )
    {
      return {
        success: false,
        message: `Instructor dashboard test failed: ${ error instanceof Error ? error.message : 'Unknown error' }`,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Test student portal access
   */
  private async testStudentPortalAccess (): Promise<{ success: boolean; message: string; data?: any }>
  {
    try
    {
      // Test student-specific operations
      const tests = [];

      // Test 1: Can access own profile (limited)
      const { data: { user } } = await supabase.auth.getUser();
      if ( user )
      {
        const { data: profile, error: profileError } = await supabase
          .from( 'profiles' )
          .select( 'id, nome' )
          .eq( 'id', user.id )
          .single();

        tests.push( {
          test: 'Access Own Profile',
          success: !profileError,
          error: profileError?.message
        } );
      }

      // Test 2: Can access student assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from( 'designacoes' )
        .select( 'id, tipo_designacao' )
        .limit( 5 );

      tests.push( {
        test: 'Access Assignments',
        success: !assignmentsError,
        error: assignmentsError?.message
      } );

      const allTestsPassed = tests.every( t => t.success );
      const failedTests = tests.filter( t => !t.success );

      return {
        success: allTestsPassed,
        message: allTestsPassed
          ? 'Student portal access validated successfully'
          : `Student portal access failed: ${ failedTests.map( t => t.error ).join( ', ' ) }`,
        data: { tests, assignmentCount: assignments?.length || 0 }
      };

    } catch ( error )
    {
      return {
        success: false,
        message: `Student portal test failed: ${ error instanceof Error ? error.message : 'Unknown error' }`,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}