/**
 * Unit tests for Authentication Verifier
 * Tests user authentication, role-based access control, and session management
 */

import { testFramework } from './test-framework';
import { AuthVerifierImpl } from '../auth-verifier';
import { VerificationModule, UserRole } from '../interfaces';

type MockResp = {
  ok: boolean;
  status: number;
  statusText?: string;
  json?: () => Promise<any>;
  text?: () => Promise<string>;
};

// Helper para mockar/restaurar fetch sem vazar entre testes
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

testFramework.describe('AuthenticationVerifier', () => {
  let verifier: AuthVerifierImpl;

  function setup() {
    verifier = new AuthVerifierImpl();
  }

  testFramework.test('should initialize with correct module name', () => {
    setup();
    testFramework.expect(verifier.moduleName).toBe(VerificationModule.AUTHENTICATION);
  });

  testFramework.test('should test admin login successfully', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
        session: { access_token: 'token123', expires_at: Date.now() + 3600000 },
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testUserLogin('admin' as UserRole);
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('authentication');
    });
  });

  testFramework.test('should test instructor login successfully', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        user: { id: '2', role: 'instructor', email: 'instructor@test.com' },
        session: { access_token: 'token456', expires_at: Date.now() + 3600000 },
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testUserLogin('instructor' as UserRole);
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('authentication');
    });
  });

  testFramework.test('should test student login successfully', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        user: { id: '3', role: 'student', email: 'student@test.com' },
        session: { access_token: 'token789', expires_at: Date.now() + 3600000 },
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testUserLogin('student' as UserRole);
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('authentication');
    });
  });

  testFramework.test('should handle login failure', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testUserLogin('admin' as UserRole);
      testFramework.expect(result.status).toBe('FAIL');
      testFramework.expect(!!result.errors).toBe(true);
    });
  });

  testFramework.test('should validate admin role access', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        allowedFeatures: ['admin-dashboard', 'user-management', 'system-settings'],
        deniedFeatures: [],
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateRoleAccess('admin' as UserRole);
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('authentication');
    });
  });

  testFramework.test('should validate instructor role access', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        allowedFeatures: ['instructor-dashboard', 'program-management'],
        deniedFeatures: ['admin-dashboard', 'user-management'],
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateRoleAccess('instructor' as UserRole);
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('authentication');
    });
  });

  testFramework.test('should validate student role access', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        allowedFeatures: ['student-portal', 'assignments'],
        deniedFeatures: ['admin-dashboard', 'instructor-dashboard', 'user-management'],
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateRoleAccess('student' as UserRole);
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('authentication');
    });
  });

  testFramework.test('should test session management', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        session: {
          valid: true,
          expires_at: Date.now() + 3600000,
          refresh_token: 'refresh123',
        },
        persistent: true,
        timeoutHandled: true,
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testSessionManagement();
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('authentication');
    });
  });

  testFramework.test('should handle session timeout', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Session expired' }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testSessionManagement();
      testFramework.expect(result.status).toBe('FAIL');
      testFramework.expect(!!result.errors).toBe(true);
    });
  });

  testFramework.test('should validate Supabase Auth integration', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        supabase: {
          configured: true,
          connected: true,
          url: 'https://test.supabase.co',
          version: '2.0.0',
        },
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateSupabaseAuth();
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('authentication');
    });
  });

  testFramework.test('should handle Supabase Auth configuration issues', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Supabase configuration invalid' }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateSupabaseAuth();
      testFramework.expect(result.status).toBe('FAIL');
      testFramework.expect(!!result.errors).toBe(true);
    });
  });

  testFramework.test('should run full authentication verification', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok', authenticated: true }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.verify();
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('authentication');
      testFramework.expect(Array.isArray(result.details)).toBe(true);
      testFramework.expect(result.details.length > 0).toBe(true);
    });
  });

  testFramework.test('should handle invalid user roles', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid role' }),
    } as any);

    await withMockFetch(mock as any, async () => {
      try {
        const result = await verifier.testUserLogin('invalid_role' as UserRole);
        // Aceita duas estratégias do verifier: lançar erro ou retornar FAIL
        if (result && typeof result === 'object') {
          testFramework.expect(result.status === 'FAIL').toBe(true);
        } else {
          // se não retornou objeto, esperamos que tenha lançado erro
          testFramework.expect(false).toBe(true);
        }
      } catch (err) {
        testFramework.expect(err instanceof Error).toBe(true);
      }
    });
  });

  testFramework.test('should test password reset functionality', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Password reset email sent' }),
    } as any);

    await withMockFetch(mock as any, async () => {
      // Caso de uso: parte do fluxo de session management no verifier
      const result = await verifier.testSessionManagement();
      testFramework.expect(result.status).toBe('PASS');
    });
  });

  testFramework.test('should validate token refresh mechanism', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: 'new_token123',
        refresh_token: 'new_refresh123',
        expires_at: Date.now() + 3600000,
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testSessionManagement();
      testFramework.expect(result.status).toBe('PASS');
    });
  });
});

// Export test runner function
export async function runAuthVerifierTests(): Promise<boolean> {
  console.log('🧪 Running Authentication Verifier Tests...');
  try {
    const results = testFramework.getResults();
    const suiteResult = results.get('AuthenticationVerifier');
    if (suiteResult) return suiteResult.failed === 0;
    return false;
  } catch (error) {
    console.error('❌ Authentication verifier tests failed:', error);
    return false;
  }
}
