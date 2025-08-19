// Main entry point for the verification system
export * from './interfaces';
export * from './controller';
export * from './types';
export * from './base-verifier';
export * from './utils';
export * from './cli';

// Export report storage and management
export * from './report-storage';
export * from './report-generator';
export * from './report-cli';

// Export verifier implementations
export * from './infrastructure-verifier';
export * from './backend-verifier';
export * from './frontend-verifier';
export * from './download-verifier';
export * from './database-verifier';
export * from './script-verifier';
export * from './test-suite-verifier';
export * from './auth-verifier';

// Export helper modules
export * from './routing-tester';
export * from './integration-tester';

// Setup function to initialize all verifiers
import { SystemVerificationController } from './controller';
import { VerificationModule } from './interfaces';
import { InfrastructureVerifierImpl } from './infrastructure-verifier';
import { BackendVerifierImpl } from './backend-verifier';
import { FrontendVerifierImpl } from './frontend-verifier';
import { DownloadVerifier } from './download-verifier';
import { DatabaseVerifierImpl } from './database-verifier';
import { ScriptVerifierImpl } from './script-verifier';
import { TestSuiteVerifierImpl } from './test-suite-verifier';
import { AuthVerifier } from './auth-verifier';

/**
 * Initialize the verification system with all available verifiers
 */
export function initializeVerificationSystem(): SystemVerificationController {
  const controller = new SystemVerificationController();

  // Register all available verifiers
  controller.registerVerifier(VerificationModule.INFRASTRUCTURE, new InfrastructureVerifierImpl());
  controller.registerVerifier(VerificationModule.BACKEND, new BackendVerifierImpl());
  controller.registerVerifier(VerificationModule.FRONTEND, new FrontendVerifierImpl());

  // Register Authentication verifier with default configuration (overridable via env)
  controller.registerVerifier(VerificationModule.AUTHENTICATION, new AuthVerifier({
    testCredentials: {
      admin: {
        email: process.env.VERIFY_ADMIN_EMAIL || 'admin@test.com',
        password: process.env.VERIFY_ADMIN_PASSWORD || 'test123',
        expectedRole: 'admin',
        expectedDashboard: '/admin'
      },
      instructor: {
        email: process.env.VERIFY_INSTRUCTOR_EMAIL || 'instructor@test.com',
        password: process.env.VERIFY_INSTRUCTOR_PASSWORD || 'test123',
        expectedRole: 'instructor',
        expectedDashboard: '/instructor'
      },
      student: {
        email: process.env.VERIFY_STUDENT_EMAIL || 'student@test.com',
        password: process.env.VERIFY_STUDENT_PASSWORD || 'test123',
        expectedRole: 'student',
        expectedDashboard: '/student'
      }
    },
    timeouts: { login: 5000, dashboard: 3000, session: 10000 },
    rbacConfig: {
      adminFeatures: ['admin-dashboard', 'user-management', 'system-settings'],
      instructorFeatures: ['instructor-dashboard', 'program-management', 'student-assignments'],
      studentFeatures: ['student-portal', 'assignments', 'materials'],
      restrictedEndpoints: {
        adminOnly: ['/api/admin', '/api/users', '/api/system'],
        instructorOnly: ['/api/instructor', '/api/programs'],
        studentOnly: ['/api/student', '/api/assignments']
      }
    },
    sessionConfig: {
      timeouts: { sessionCheck: 5000, refreshToken: 10000, persistence: 15000 },
      testDuration: { shortSession: 30000, longSession: 300000 }
    }
  }));
  controller.registerVerifier(VerificationModule.DOWNLOAD_SYSTEM, new DownloadVerifier());
  controller.registerVerifier(VerificationModule.DATABASE, new DatabaseVerifierImpl());
  controller.registerVerifier(VerificationModule.SCRIPTS, new ScriptVerifierImpl());
  controller.registerVerifier(VerificationModule.TEST_SUITE, new TestSuiteVerifierImpl());

  return controller;
}

// Export a pre-configured instance
export const verificationSystem = initializeVerificationSystem();