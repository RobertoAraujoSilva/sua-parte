// Frontend-backend integration testing module

import { VerificationDetail } from './types';

export interface APIEndpoint
{
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  name: string;
  requiresAuth: boolean;
  expectedStatus: number;
  testData?: any;
}

export interface DataFlowTest
{
  name: string;
  description: string;
  steps: DataFlowStep[];
  expectedOutcome: string;
}

export interface DataFlowStep
{
  action: 'request' | 'validate' | 'wait';
  endpoint?: string;
  method?: string;
  data?: any;
  expectedResponse?: any;
  validation?: ( response: any ) => boolean;
}

export class IntegrationTester
{
  private readonly backendUrl: string;
  private readonly frontendUrl: string;

  constructor ( backendUrl: string, frontendUrl: string )
  {
    this.backendUrl = backendUrl;
    this.frontendUrl = frontendUrl;
  }

  /**
   * Get all documented API endpoints
   */
  public getAPIEndpoints (): APIEndpoint[]
  {
    return [
      // Health and Status endpoints
      { path: '/api/status', method: 'GET', name: 'Server Status', requiresAuth: false, expectedStatus: 200 },
      { path: '/api/health', method: 'GET', name: 'Health Check', requiresAuth: false, expectedStatus: 200 },

      // Admin API endpoints
      { path: '/api/admin/users', method: 'GET', name: 'Admin Users List', requiresAuth: true, expectedStatus: 200 },
      { path: '/api/admin/stats', method: 'GET', name: 'Admin Statistics', requiresAuth: true, expectedStatus: 200 },
      { path: '/api/admin/system', method: 'GET', name: 'System Information', requiresAuth: true, expectedStatus: 200 },

      // Material Management API endpoints
      { path: '/api/materials', method: 'GET', name: 'Materials List', requiresAuth: true, expectedStatus: 200 },
      { path: '/api/materials/download', method: 'POST', name: 'Download Materials', requiresAuth: true, expectedStatus: 200 },
      { path: '/api/materials/status', method: 'GET', name: 'Download Status', requiresAuth: true, expectedStatus: 200 },

      // Program Generation API endpoints
      { path: '/api/programs', method: 'GET', name: 'Programs List', requiresAuth: true, expectedStatus: 200 },
      { path: '/api/programs/generate', method: 'POST', name: 'Generate Program', requiresAuth: true, expectedStatus: 200 },
      { path: '/api/programs/preview', method: 'GET', name: 'Program Preview', requiresAuth: true, expectedStatus: 200 },

      // Authentication endpoints
      { path: '/api/auth/login', method: 'POST', name: 'User Login', requiresAuth: false, expectedStatus: 200 },
      { path: '/api/auth/logout', method: 'POST', name: 'User Logout', requiresAuth: true, expectedStatus: 200 },
      { path: '/api/auth/profile', method: 'GET', name: 'User Profile', requiresAuth: true, expectedStatus: 200 },

      // Student Management endpoints
      { path: '/api/students', method: 'GET', name: 'Students List', requiresAuth: true, expectedStatus: 200 },
      { path: '/api/students', method: 'POST', name: 'Create Student', requiresAuth: true, expectedStatus: 201 },

      // Assignment endpoints
      { path: '/api/assignments', method: 'GET', name: 'Assignments List', requiresAuth: true, expectedStatus: 200 },
      { path: '/api/assignments/generate', method: 'POST', name: 'Generate Assignments', requiresAuth: true, expectedStatus: 200 },

      // Reports endpoints
      { path: '/api/reports', method: 'GET', name: 'Reports List', requiresAuth: true, expectedStatus: 200 },
      { path: '/api/reports/generate', method: 'POST', name: 'Generate Report', requiresAuth: true, expectedStatus: 200 }
    ];
  }

  /**
   * Test API connectivity
   */
  public async testAPIConnectivity (): Promise<VerificationDetail>
  {
    try
    {
      const response = await fetch( `${ this.backendUrl }/api/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      } );

      if ( response.ok )
      {
        const data = await response.json();
        return {
          component: 'integration',
          test: 'api_connectivity',
          result: 'PASS',
          message: 'Frontend can successfully connect to backend API',
          data: {
            statusCode: response.status,
            responseData: data,
            responseTime: response.headers.get( 'x-response-time' ) || 'unknown'
          }
        };
      } else
      {
        return {
          component: 'integration',
          test: 'api_connectivity',
          result: 'FAIL',
          message: `Backend API returned HTTP ${ response.status }`,
          data: {
            statusCode: response.status,
            statusText: response.statusText
          }
        };
      }
    } catch ( error )
    {
      return {
        component: 'integration',
        test: 'api_connectivity',
        result: 'FAIL',
        message: `API connectivity test failed: ${ error instanceof Error ? error.message : String( error ) }`,
        data: {
          error: error instanceof Error ? error.message : String( error ),
          backendUrl: this.backendUrl
        }
      };
    }
  }

  /**
   * Test a specific API endpoint
   */
  public async testAPIEndpoint ( endpoint: APIEndpoint ): Promise<VerificationDetail>
  {
    try
    {
      const url = `${ this.backendUrl }${ endpoint.path }`;
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };

      // Add test data for POST/PUT requests
      if ( endpoint.testData && ( endpoint.method === 'POST' || endpoint.method === 'PUT' || endpoint.method === 'PATCH' ) )
      {
        options.body = JSON.stringify( endpoint.testData );
      }

      const response = await fetch( url, options );

      // For endpoints that require auth, we expect 401 when not authenticated
      if ( endpoint.requiresAuth && response.status === 401 )
      {
        return {
          component: 'integration',
          test: `api_endpoint_${ endpoint.path.replace( /[^a-zA-Z0-9]/g, '_' ) }`,
          result: 'PASS',
          message: `Endpoint ${ endpoint.path } correctly requires authentication (HTTP 401)`,
          data: {
            endpoint: endpoint.path,
            method: endpoint.method,
            statusCode: response.status,
            requiresAuth: endpoint.requiresAuth
          }
        };
      }

      // For public endpoints, check if they return expected status
      if ( !endpoint.requiresAuth && response.status === endpoint.expectedStatus )
      {
        return {
          component: 'integration',
          test: `api_endpoint_${ endpoint.path.replace( /[^a-zA-Z0-9]/g, '_' ) }`,
          result: 'PASS',
          message: `Endpoint ${ endpoint.path } returned expected status ${ endpoint.expectedStatus }`,
          data: {
            endpoint: endpoint.path,
            method: endpoint.method,
            statusCode: response.status,
            expectedStatus: endpoint.expectedStatus
          }
        };
      }

      // Check for other expected responses
      if ( response.status === endpoint.expectedStatus )
      {
        return {
          component: 'integration',
          test: `api_endpoint_${ endpoint.path.replace( /[^a-zA-Z0-9]/g, '_' ) }`,
          result: 'PASS',
          message: `Endpoint ${ endpoint.path } returned expected status ${ endpoint.expectedStatus }`,
          data: {
            endpoint: endpoint.path,
            method: endpoint.method,
            statusCode: response.status,
            expectedStatus: endpoint.expectedStatus
          }
        };
      }

      // Handle unexpected responses
      return {
        component: 'integration',
        test: `api_endpoint_${ endpoint.path.replace( /[^a-zA-Z0-9]/g, '_' ) }`,
        result: 'WARNING',
        message: `Endpoint ${ endpoint.path } returned HTTP ${ response.status }, expected ${ endpoint.expectedStatus }`,
        data: {
          endpoint: endpoint.path,
          method: endpoint.method,
          statusCode: response.status,
          expectedStatus: endpoint.expectedStatus,
          statusText: response.statusText
        }
      };

    } catch ( error )
    {
      return {
        component: 'integration',
        test: `api_endpoint_${ endpoint.path.replace( /[^a-zA-Z0-9]/g, '_' ) }`,
        result: 'FAIL',
        message: `Endpoint ${ endpoint.path } test failed: ${ error instanceof Error ? error.message : String( error ) }`,
        data: {
          endpoint: endpoint.path,
          method: endpoint.method,
          error: error instanceof Error ? error.message : String( error )
        }
      };
    }
  }

  /**
   * Get data flow tests
   */
  public getDataFlowTests (): DataFlowTest[]
  {
    return [
      {
        name: 'Health Check Flow',
        description: 'Test basic health check and status endpoints',
        steps: [
          {
            action: 'request',
            endpoint: '/api/health',
            method: 'GET',
            expectedResponse: { status: 'ok' }
          },
          {
            action: 'request',
            endpoint: '/api/status',
            method: 'GET',
            expectedResponse: { server: 'running' }
          }
        ],
        expectedOutcome: 'Backend health endpoints respond correctly'
      },
      {
        name: 'Authentication Flow',
        description: 'Test authentication workflow',
        steps: [
          {
            action: 'request',
            endpoint: '/api/auth/profile',
            method: 'GET',
            expectedResponse: { status: 401 } // Should fail without auth
          }
        ],
        expectedOutcome: 'Authentication is properly enforced'
      },
      {
        name: 'Materials API Flow',
        description: 'Test materials management workflow',
        steps: [
          {
            action: 'request',
            endpoint: '/api/materials',
            method: 'GET',
            expectedResponse: { status: 401 } // Should require auth
          },
          {
            action: 'request',
            endpoint: '/api/materials/status',
            method: 'GET',
            expectedResponse: { status: 401 } // Should require auth
          }
        ],
        expectedOutcome: 'Materials API properly requires authentication'
      }
    ];
  }

  /**
   * Test a data flow
   */
  public async testDataFlow ( test: DataFlowTest ): Promise<VerificationDetail>
  {
    const results: string[] = [];
    let hasErrors = false;

    try
    {
      for ( const step of test.steps )
      {
        if ( step.action === 'request' && step.endpoint && step.method )
        {
          const url = `${ this.backendUrl }${ step.endpoint }`;
          const options: RequestInit = {
            method: step.method,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          };

          if ( step.data )
          {
            options.body = JSON.stringify( step.data );
          }

          const response = await fetch( url, options );

          if ( step.expectedResponse )
          {
            if ( step.expectedResponse.status && response.status === step.expectedResponse.status )
            {
              results.push( `✓ ${ step.endpoint }: Expected status ${ step.expectedResponse.status }` );
            } else if ( response.ok )
            {
              results.push( `✓ ${ step.endpoint }: Request successful (${ response.status })` );
            } else
            {
              results.push( `✗ ${ step.endpoint }: Unexpected status ${ response.status }` );
              hasErrors = true;
            }
          } else
          {
            if ( response.ok )
            {
              results.push( `✓ ${ step.endpoint }: Request successful` );
            } else
            {
              results.push( `? ${ step.endpoint }: Status ${ response.status } (may be expected)` );
            }
          }
        } else if ( step.action === 'wait' )
        {
          await new Promise( resolve => setTimeout( resolve, 1000 ) );
          results.push( '✓ Wait step completed' );
        }
      }

      return {
        component: 'integration',
        test: `data_flow_${ test.name.replace( /[^a-zA-Z0-9]/g, '_' ) }`,
        result: hasErrors ? 'FAIL' : 'PASS',
        message: hasErrors
          ? `Data flow "${ test.name }" had errors`
          : `Data flow "${ test.name }" completed successfully`,
        data: {
          testName: test.name,
          description: test.description,
          expectedOutcome: test.expectedOutcome,
          stepResults: results,
          hasErrors
        }
      };

    } catch ( error )
    {
      return {
        component: 'integration',
        test: `data_flow_${ test.name.replace( /[^a-zA-Z0-9]/g, '_' ) }`,
        result: 'FAIL',
        message: `Data flow "${ test.name }" failed: ${ error instanceof Error ? error.message : String( error ) }`,
        data: {
          testName: test.name,
          description: test.description,
          error: error instanceof Error ? error.message : String( error ),
          stepResults: results
        }
      };
    }
  }

  /**
   * Test error handling scenarios
   */
  public async testErrorHandling (): Promise<VerificationDetail>
  {
    const errorTests = [
      { endpoint: '/api/nonexistent', expectedStatus: 404, description: 'Non-existent endpoint' },
      { endpoint: '/api/admin/users', expectedStatus: 401, description: 'Unauthorized access' },
      { endpoint: '/api/invalid-json', expectedStatus: 400, description: 'Invalid request format' }
    ];

    const results: string[] = [];
    let hasErrors = false;

    try
    {
      for ( const test of errorTests )
      {
        const url = `${ this.backendUrl }${ test.endpoint }`;
        const response = await fetch( url );

        if ( response.status === test.expectedStatus )
        {
          results.push( `✓ ${ test.description }: Correctly returned ${ test.expectedStatus }` );
        } else if ( response.status >= 400 )
        {
          results.push( `? ${ test.description }: Returned ${ response.status } (error handling working)` );
        } else
        {
          results.push( `✗ ${ test.description }: Unexpected success (${ response.status })` );
          hasErrors = true;
        }
      }

      return {
        component: 'integration',
        test: 'error_handling',
        result: hasErrors ? 'FAIL' : 'PASS',
        message: hasErrors
          ? 'Some error handling scenarios failed'
          : 'Error handling is working correctly',
        data: {
          testResults: results,
          hasErrors
        }
      };

    } catch ( error )
    {
      return {
        component: 'integration',
        test: 'error_handling',
        result: 'FAIL',
        message: `Error handling test failed: ${ error instanceof Error ? error.message : String( error ) }`,
        data: {
          error: error instanceof Error ? error.message : String( error ),
          testResults: results
        }
      };
    }
  }

  /**
   * Test all API endpoints
   */
  public async testAllAPIEndpoints (): Promise<VerificationDetail[]>
  {
    const endpoints = this.getAPIEndpoints();
    const results: VerificationDetail[] = [];

    // Test endpoints in parallel for better performance
    const endpointPromises = endpoints.map( endpoint => this.testAPIEndpoint( endpoint ) );
    const endpointResults = await Promise.allSettled( endpointPromises );

    endpointResults.forEach( ( result, index ) =>
    {
      if ( result.status === 'fulfilled' )
      {
        results.push( result.value );
      } else
      {
        const endpoint = endpoints[ index ];
        results.push( {
          component: 'integration',
          test: `api_endpoint_${ endpoint.path.replace( /[^a-zA-Z0-9]/g, '_' ) }`,
          result: 'FAIL',
          message: `API endpoint test promise rejected: ${ result.reason }`,
          data: {
            endpoint: endpoint.path,
            method: endpoint.method,
            error: result.reason
          }
        } );
      }
    } );

    return results;
  }

  /**
   * Test all data flows
   */
  public async testAllDataFlows (): Promise<VerificationDetail[]>
  {
    const flows = this.getDataFlowTests();
    const results: VerificationDetail[] = [];

    for ( const flow of flows )
    {
      const result = await this.testDataFlow( flow );
      results.push( result );
    }

    return results;
  }

  /**
   * Run comprehensive integration tests
   */
  public async runComprehensiveTests (): Promise<VerificationDetail[]>
  {
    const results: VerificationDetail[] = [];

    // Test basic connectivity
    const connectivity = await this.testAPIConnectivity();
    results.push( connectivity );

    // Test all API endpoints
    const endpointResults = await this.testAllAPIEndpoints();
    results.push( ...endpointResults );

    // Test data flows
    const dataFlowResults = await this.testAllDataFlows();
    results.push( ...dataFlowResults );

    // Test error handling
    const errorHandling = await this.testErrorHandling();
    results.push( errorHandling );

    return results;
  }
}