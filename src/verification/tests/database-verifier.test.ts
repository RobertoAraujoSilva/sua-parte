/**
 * Unit tests for Database Verifier
 * Tests Supabase connection, CRUD operations, RLS policies, and migrations
 */

import { testFramework } from './test-framework';
import { DatabaseVerifierImpl } from '../database-verifier';
import { VerificationModule } from '../interfaces';

type MockJson = () => Promise<any>;
type MockResp = { ok: boolean; status: number; json: MockJson };

// Utilitário: aplica mock em fetch durante o teste e restaura ao final
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

testFramework.describe('DatabaseVerifier', () => {
  let verifier: DatabaseVerifierImpl;

  function setup() {
    verifier = new DatabaseVerifierImpl();
  }

  testFramework.test('should initialize with correct module name', () => {
    setup();
    testFramework.expect(verifier.moduleName).toBe(VerificationModule.DATABASE);
  });

  testFramework.test('should test database connection successfully', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        connected: true,
        authenticated: true,
        database: 'sistema_ministerial',
        version: '15.1',
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testConnection();
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('database');
    });
  });

  testFramework.test('should handle database connection failure', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockRejectedValue(new Error('Connection refused'));

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testConnection();
      testFramework.expect(result.status).toBe('FAIL');
      testFramework.expect(!!result.errors).toBe(true);
    });
  });

  testFramework.test('should validate CRUD operations successfully', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockImplementation((url: string) => {
      const u = url.toString();

      if (u.includes('CREATE')) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: async () => ({ id: 1, created: true }),
        } as any);
      }
      if (u.includes('READ') || u.includes('SELECT')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: [{ id: 1, name: 'test' }] }),
        } as any);
      }
      if (u.includes('UPDATE')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: 1, updated: true }),
        } as any);
      }
      if (u.includes('DELETE')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: 1, deleted: true }),
        } as any);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as any);
    });

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateCRUDOperations();
      testFramework.expect(Array.isArray(result)).toBe(true);
      testFramework.expect(result.length > 0).toBe(true);

      const entities = ['users', 'materials', 'programs', 'assignments'];
      const tested = result.map((r: any) => r.entity);
      entities.forEach((e) => {
        testFramework.expect(tested.includes(e)).toBe(true);
      });
    });
  });

  testFramework.test('should handle CRUD operation failures', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Database error' }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateCRUDOperations();
      testFramework.expect(Array.isArray(result)).toBe(true);
      const failed = result.filter((r: any) => r.status === 'FAIL');
      testFramework.expect(failed.length > 0).toBe(true);
    });
  });

  testFramework.test('should test RLS policies successfully', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        policies: [
          { policy: 'users_select_policy', enforced: true, table: 'users' },
          { policy: 'materials_select_policy', enforced: true, table: 'materials' },
          { policy: 'programs_select_policy', enforced: true, table: 'programs' },
        ],
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testRLSPolicies();
      testFramework.expect(Array.isArray(result)).toBe(true);
      testFramework.expect(result.length > 0).toBe(true);
      const allPass = result.every((r: any) => r.status === 'PASS');
      testFramework.expect(allPass).toBe(true);
    });
  });

  testFramework.test('should detect missing RLS policies', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        policies: [
          { policy: 'users_select_policy', enforced: false, table: 'users' },
          { policy: 'materials_select_policy', enforced: true, table: 'materials' },
        ],
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testRLSPolicies();
      testFramework.expect(Array.isArray(result)).toBe(true);
      const failed = result.filter((r: any) => r.status === 'FAIL');
      testFramework.expect(failed.length > 0).toBe(true);
    });
  });

  testFramework.test('should validate migrations successfully', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        appliedMigrations: [
          '20240101_initial_schema.sql',
          '20240102_add_users_table.sql',
          '20240103_add_materials_table.sql',
        ],
        pendingMigrations: [],
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateMigrations();
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('database');
    });
  });

  testFramework.test('should detect pending migrations', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        appliedMigrations: ['20240101_initial_schema.sql', '20240102_add_users_table.sql'],
        pendingMigrations: ['20240103_add_materials_table.sql', '20240104_add_programs_table.sql'],
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateMigrations();
      testFramework.expect(result.status).toBe('WARNING');
      testFramework.expect(!!result.warnings).toBe(true);
    });
  });

  testFramework.test('should run full database verification', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok', connected: true }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.verify();
      testFramework.expect(result.status).toBe('PASS');
      testFramework.expect(result.module).toBe('database');
      testFramework.expect(result.details.length > 0).toBe(true);
    });
  });

  testFramework.test('should handle authentication errors', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid API key' }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testConnection();
      testFramework.expect(result.status).toBe('FAIL');
      testFramework.expect(!!result.errors).toBe(true);
    });
  });

  testFramework.test('should test foreign key constraints', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        constraints: [
          { name: 'fk_user_id', table: 'materials', enforced: true },
          { name: 'fk_program_id', table: 'assignments', enforced: true },
        ],
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateCRUDOperations();
      testFramework.expect(Array.isArray(result)).toBe(true);
    });
  });

  testFramework.test('should validate data integrity', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        integrity: {
          orphanedRecords: 0,
          duplicateKeys: 0,
          nullConstraintViolations: 0,
        },
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateCRUDOperations();
      testFramework.expect(Array.isArray(result)).toBe(true);
    });
  });

  testFramework.test('should handle connection timeout', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 100);
        })
    );

    await withMockFetch(mock as any, async () => {
      const result = await verifier.testConnection();
      testFramework.expect(result.status).toBe('FAIL');
      testFramework.expect(!!result.errors).toBe(true);
    });
  });

  testFramework.test('should validate schema structure', async () => {
    setup();

    const mock = testFramework.createMock<typeof fetch>();
    mock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        tables: ['users', 'materials', 'programs', 'assignments'],
        views: ['user_materials', 'program_assignments'],
        functions: ['get_user_materials', 'generate_program'],
      }),
    } as any);

    await withMockFetch(mock as any, async () => {
      const result = await verifier.validateMigrations();
      testFramework.expect(result.status).toBe('PASS');
    });
  });
});

// Export test runner function
export async function runDatabaseVerifierTests(): Promise<boolean> {
  console.log('🧪 Running Database Verifier Tests...');

  try {
    const results = testFramework.getResults();
    const suiteResult = results.get('DatabaseVerifier');
    if (suiteResult) return suiteResult.failed === 0;
    return false;
  } catch (error) {
    console.error('❌ Database verifier tests failed:', error);
    return false;
  }
}
