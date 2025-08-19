/**
 * Unit tests for Backend Verifier
 * Tests server startup, API endpoints, services, and cron jobs
 */

import { testFramework } from './test-framework';
import { BackendVerifierImpl } from '../backend-verifier';
import { VerificationModule } from '../interfaces';

type MockJson = () => Promise<any>;
type MockResp = { ok: boolean; status: number; statusText?: string; json?: MockJson };

// Utilitário: aplica mock em fetch durante o teste e restaura ao final
async function withMockFetch (
  mock: ( ...args: any[] ) => Promise<MockResp>,
  run: () => Promise<void>
)
{
  const original = ( globalThis as any ).fetch;
  ( globalThis as any ).fetch = mock as any;
  try
  {
    await run();
  } finally
  {
    ( globalThis as any ).fetch = original;
  }
}

testFramework.describe( 'BackendVerifier', () =>
{
  let verifier: BackendVerifierImpl;

  function setup ()
  {
    verifier = new BackendVerifierImpl();
  }

  testFramework.test( 'should initialize with correct module name', () =>
  {
    setup();
    testFramework.expect( verifier.moduleName ).toBe( VerificationModule.BACKEND );
  } );

  testFramework.test( 'should start server successfully', async () =>
  {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue( {
      ok: true,
      status: 200,
      json: async () => ( { status: 'ok', message: 'Server is running' } ),
    } as any );

    await withMockFetch( mock as any, async () =>
    {
      const result = await verifier.startServer();
      testFramework.expect( result.status ).toBe( 'PASS' );
      testFramework.expect( result.module ).toBe( 'backend' );
    } );
  } );

  testFramework.test( 'should handle server startup failure', async () =>
  {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockRejectedValue( new Error( 'Connection refused' ) );

    await withMockFetch( mock as any, async () =>
    {
      const result = await verifier.startServer();
      testFramework.expect( result.status ).toBe( 'FAIL' );
      testFramework.expect( !!result.errors ).toBe( true );
    } );
  } );

  testFramework.test( 'should test API endpoints successfully', async () =>
  {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue( {
      ok: true,
      status: 200,
      json: async () => ( { data: 'test' } ),
    } as any );

    await withMockFetch( mock as any, async () =>
    {
      const result = await verifier.testAPIEndpoints();
      testFramework.expect( Array.isArray( result ) ).toBe( true );
      testFramework.expect( result.length > 0 ).toBe( true );
      const allPassed = result.every( ( apiResult: any ) => apiResult.status === 'PASS' );
      testFramework.expect( allPassed ).toBe( true );
    } );
  } );

  testFramework.test( 'should handle API endpoint failures', async () =>
  {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue( {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ( { error: 'Not Found' } ),
    } as any );

    await withMockFetch( mock as any, async () =>
    {
      const result = await verifier.testAPIEndpoints();
      testFramework.expect( Array.isArray( result ) ).toBe( true );
      const someFailed = result.some( ( apiResult: any ) => apiResult.status === 'FAIL' );
      testFramework.expect( someFailed ).toBe( true );
    } );
  } );

  testFramework.test( 'should validate services successfully', async () =>
  {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue( {
      ok: true,
      status: 200,
      json: async () => ( {
        services: {
          jwDownloader: { status: 'running' },
          programGenerator: { status: 'running' },
          materialManager: { status: 'running' },
        },
      } ),
    } as any );

    await withMockFetch( mock as any, async () =>
    {
      const result = await verifier.validateServices();
      testFramework.expect( Array.isArray( result ) ).toBe( true );
      testFramework.expect( result.length > 0 ).toBe( true );
    } );
  } );

  testFramework.test( 'should test cron jobs configuration', async () =>
  {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue( {
      ok: true,
      status: 200,
      json: async () => ( {
        cronJobs: [
          { name: 'material-download', schedule: '0 2 * * *', status: 'active' },
          { name: 'cleanup-temp', schedule: '0 0 * * 0', status: 'active' },
        ],
      } ),
    } as any );

    await withMockFetch( mock as any, async () =>
    {
      const result = await verifier.testCronJobs();
      testFramework.expect( result.status ).toBe( 'PASS' );
      testFramework.expect( result.module ).toBe( 'backend' );
    } );
  } );

  testFramework.test( 'should run full backend verification', async () =>
  {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue( {
      ok: true,
      status: 200,
      json: async () => ( { status: 'ok' } ),
    } as any );

    await withMockFetch( mock as any, async () =>
    {
      const result = await verifier.verify();
      testFramework.expect( result.status ).toBe( 'PASS' );
      testFramework.expect( result.module ).toBe( 'backend' );
      testFramework.expect( result.details.length > 0 ).toBe( true );
    } );
  } );

  testFramework.test( 'should handle network timeouts', async () =>
  {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockImplementation(
      () =>
        new Promise<Response>( ( _, reject ) =>
        {
          setTimeout( () => reject( new Error( 'Request timeout' ) ), 100 );
        } )
    );

    await withMockFetch( mock as any, async () =>
    {
      const result = await verifier.startServer();
      testFramework.expect( result.status ).toBe( 'FAIL' );
      testFramework.expect( !!result.errors ).toBe( true );
    } );
  } );

  testFramework.test( 'should validate API response format', async () =>
  {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue( {
      ok: true,
      status: 200,
      json: async () =>
      {
        throw new Error( 'Invalid JSON' );
      },
    } as any );

    await withMockFetch( mock as any, async () =>
    {
      const result = await verifier.testAPIEndpoints();
      testFramework.expect( Array.isArray( result ) ).toBe( true );
    } );
  } );

  testFramework.test( 'should check server health endpoint', async () =>
  {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue( {
      ok: true,
      status: 200,
      json: async () => ( {
        status: 'healthy',
        uptime: 12345,
        memory: { used: 100, total: 1000 },
        cpu: { usage: 25 },
      } ),
    } as any );

    await withMockFetch( mock as any, async () =>
    {
      const result = await verifier.startServer();
      testFramework.expect( result.status ).toBe( 'PASS' );
      testFramework.expect( !!result.details ).toBe( true );
    } );
  } );

  testFramework.test( 'should handle authentication errors in API tests', async () =>
  {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue( {
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ( { error: 'Unauthorized' } ),
    } as any );

    await withMockFetch( mock as any, async () =>
    {
      const result = await verifier.testAPIEndpoints();
      testFramework.expect( Array.isArray( result ) ).toBe( true );

      const authErrors = result.filter(
        ( r: any ) =>
          Array.isArray( r.details ) &&
          r.details.some(
            ( d: any ) =>
              typeof d.message === 'string' &&
              ( d.message.includes( '401' ) || d.message.toLowerCase().includes( 'unauthorized' ) )
          )
      );
      testFramework.expect( authErrors.length > 0 ).toBe( true );
    } );
  } );
} );

// Export test runner function
export async function runBackendVerifierTests (): Promise<boolean>
{
  console.log( '🧪 Running Backend Verifier Tests...' );

  try
  {
    const results = testFramework.getResults();
    const suiteResult = results.get( 'BackendVerifier' );
    if ( suiteResult ) return suiteResult.failed === 0;
    return false;
  } catch ( error )
  {
    console.error( '❌ Backend verifier tests failed:', error );
    return false;
  }
}
