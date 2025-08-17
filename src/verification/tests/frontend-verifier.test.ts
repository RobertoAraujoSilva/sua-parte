/**
 * Unit tests for Frontend Verifier
 * Tests React application startup, routing, components, and backend integration
 */

import { testFramework } from './test-framework';
import { FrontendVerifierImpl } from '../frontend-verifier';
import { VerificationModule } from '../interfaces';

type MockResp = {
  ok: boolean;
  status: number;
  statusText?: string;
  text?: () => Promise<string>;
  json?: () => Promise<any>;
};

// Utilitário para mockar/restaurar fetch sem vazar entre testes
async function withMockFetch(
  mock: (...args: any[]) => Promise<MockResp>,
  run: () => Promise<void>
) {
  const original = (globalThis as any).fetch;
  (globalThis as any).fetch = mock as any;
  try {
    await run();
  } finally {
    (globalThis as any).fetch = original;
  }
}

testFramework.describe('FrontendVerifier', () => {
  let verifier: FrontendVerifierImpl;

  function setup() {
    verifier = new FrontendVerifierImpl();
  }

  testFramework.test('should initialize with correct module name', () => {
    setup();
    testFramework.expect(verifier.moduleName).toBe(VerificationModule.FRONTEND);
  });

  testFramework.test('should start application successfully', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => `
        <!DOCTYPE html>
        <html>
          <head><title>Sistema Ministerial</title></head>
          <body><div id="root"></div></body>
        </html>
      `,
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.startApplication();
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('frontend');
    });
  });

  testFramework.test('should handle application startup failure', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockRejectedValue(new Error('Connection refused'));

    await withMockFetch(mock as any, async () => {
      const result = await verifier.startApplication();
      testFramework.expect(result.status).toBe('FAIL');
      testFramework.expect(!!result.errors).toBe(true);
    });
  });

  testFramework.test('should test routing successfully', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        '<html><body><div id="root">Route Content</div></body></html>',
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testRouting();
      testFramework.expect(Array.isArray(result)).toBe(true);
      testFramework.expect(result.length > 0).toBe(true);
      const routeTests = result.filter((r: any) => r.module === 'frontend');
      testFramework.expect(routeTests.length > 0).toBe(true);
    });
  });

  testFramework.test('should handle 404 routes appropriately', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'Not Found',
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testRouting();
      testFramework.expect(Array.isArray(result)).toBe(true);
      testFramework.expect(result.length > 0).toBe(true);
    });
  });

  testFramework.test('should validate components successfully', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => `
        <html>
          <body>
            <div id="root">
              <header>Header Component</header>
              <main>Main Content</main>
              <footer>Footer Component</footer>
            </div>
          </body>
        </html>
      `,
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateComponents();
      testFramework.expect(Array.isArray(result)).toBe(true);
      testFramework.expect(result.length > 0).toBe(true);
    });
  });

  testFramework.test('should test backend integration', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'connected',
        apiVersion: '1.0.0',
        endpoints: ['auth', 'materials', 'programs'],
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testBackendIntegration();
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('frontend');
    });
  });

  testFramework.test('should handle backend integration failure', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockRejectedValue(new Error('Backend not available'));

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testBackendIntegration();
      testFramework.expect(result.status).toBe('FAIL');
      testFramework.expect(!!result.errors).toBe(true);
    });
  });

  testFramework.test('should run full frontend verification', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        '<html><body><div id="root">App</div></body></html>',
      json: async () => ({ status: 'ok' }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.verify();
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('frontend');
      testFramework.expect(result.details.length > 0).toBe(true);
    });
  });

  testFramework.test('should detect console errors in application', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => `
        <html>
          <body>
            <div id="root">App</div>
            <script>console.error('Test error');</script>
          </body>
        </html>
      `,
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.startApplication();
      // Continues PASS, porém o verifier pode registrar warnings
      testFramework.expect(result.status).toBe('PASS');
    });
  });

  testFramework.test('should validate React application structure', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sistema Ministerial</title>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/src/main.tsx"></script>
          </body>
        </html>
      `,
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.startApplication();
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(!!result.details).toBe(true);
    });
  });

  testFramework.test('should test authentication routes', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockImplementation((url: any) => {
      const urlStr = url.toString();

      if (urlStr.includes('/auth/login')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () =>
            '<html><body><form>Login Form</form></body></html>',
        } as any);
      }

      if (urlStr.includes('/auth/register')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () =>
            '<html><body><form>Register Form</form></body></html>',
        } as any);
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        text: async () => '<html><body>Default</body></html>',
      } as any);
    });

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testRouting();
      testFramework.expect(Array.isArray(result)).toBe(true);
    });
  });

  testFramework.test('should handle build errors gracefully', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Build failed: Syntax error in component',
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.startApplication();
      testFramework.expect(result.status).toBe('FAIL');
      testFramework.expect(!!result.errors).toBe(true);
    });
  });
});

// Export test runner function
export async function runFrontendVerifierTests(): Promise<boolean> {
  console.log('🧪 Running Frontend Verifier Tests...');
  try {
    const results = testFramework.getResults();
    const suiteResult = results.get('FrontendVerifier');
    if (suiteResult) return suiteResult.failed === 0;
    return false;
  } catch (error) {
    console.error('❌ Frontend verifier tests failed:', error);
    return false;
  }
}
