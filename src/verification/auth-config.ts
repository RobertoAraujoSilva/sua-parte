/**
 * Authentication Verification Configuration
 * Default configuration for authentication testing
 */

import { AuthVerificationConfig } from './auth-verifier';

export const defaultAuthConfig: AuthVerificationConfig = {
  testCredentials: {
    admin: {
      email: process.env.VITE_TEST_ADMIN_EMAIL || 'admin@test.com',
      password: process.env.VITE_TEST_ADMIN_PASSWORD || 'testpassword123',
      expectedRole: 'admin',
      expectedDashboard: '/admin'
    },
    instructor: {
      email: process.env.VITE_TEST_INSTRUCTOR_EMAIL || 'instructor@test.com',
      password: process.env.VITE_TEST_INSTRUCTOR_PASSWORD || 'testpassword123',
      expectedRole: 'instructor',
      expectedDashboard: '/dashboard'
    },
    student: {
      email: process.env.VITE_TEST_STUDENT_EMAIL || 'student@test.com',
      password: process.env.VITE_TEST_STUDENT_PASSWORD || 'testpassword123',
      expectedRole: 'student',
      expectedDashboard: '/student'
    }
  },
  timeouts: {
    login: 10000, // 10 seconds
    dashboard: 8000, // 8 seconds
    session: 5000 // 5 seconds
  },
  rbacConfig: {
    adminFeatures: [
      'manage_users',
      'view_all_profiles',
      'modify_system_settings',
      'access_admin_dashboard',
      'manage_programs',
      'manage_assignments'
    ],
    instructorFeatures: [
      'view_programs',
      'create_assignments',
      'manage_own_assignments',
      'view_student_progress',
      'access_instructor_dashboard'
    ],
    studentFeatures: [
      'view_own_assignments',
      'view_programs',
      'update_own_profile',
      'access_student_portal'
    ],
    restrictedEndpoints: {
      adminOnly: [
        '/api/admin/users',
        '/api/admin/settings',
        '/api/admin/system'
      ],
      instructorOnly: [
        '/api/instructor/assignments',
        '/api/instructor/programs'
      ],
      studentOnly: [
        '/api/student/assignments',
        '/api/student/profile'
      ]
    }
  },
  sessionConfig: {
    timeouts: {
      sessionCheck: 5000,
      refreshToken: 8000,
      persistence: 3000
    },
    testDuration: {
      shortSession: 30000, // 30 seconds
      longSession: 300000 // 5 minutes
    }
  }
};

/**
 * Create authentication configuration from environment variables
 */
export function createAuthConfigFromEnv(): AuthVerificationConfig {
  return {
    ...defaultAuthConfig,
    testCredentials: {
      admin: {
        email: process.env.VITE_TEST_ADMIN_EMAIL || defaultAuthConfig.testCredentials.admin.email,
        password: process.env.VITE_TEST_ADMIN_PASSWORD || defaultAuthConfig.testCredentials.admin.password,
        expectedRole: 'admin',
        expectedDashboard: '/admin'
      },
      instructor: {
        email: process.env.VITE_TEST_INSTRUCTOR_EMAIL || defaultAuthConfig.testCredentials.instructor.email,
        password: process.env.VITE_TEST_INSTRUCTOR_PASSWORD || defaultAuthConfig.testCredentials.instructor.password,
        expectedRole: 'instructor',
        expectedDashboard: '/dashboard'
      },
      student: {
        email: process.env.VITE_TEST_STUDENT_EMAIL || defaultAuthConfig.testCredentials.student.email,
        password: process.env.VITE_TEST_STUDENT_PASSWORD || defaultAuthConfig.testCredentials.student.password,
        expectedRole: 'student',
        expectedDashboard: '/student'
      }
    }
  };
}

/**
 * Validate authentication configuration
 */
export function validateAuthConfig(config: AuthVerificationConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate test credentials
  Object.entries(config.testCredentials).forEach(([role, creds]) => {
    if (!creds.email || !creds.email.includes('@')) {
      errors.push(`Invalid email for ${role}: ${creds.email}`);
    }
    if (!creds.password || creds.password.length < 6) {
      errors.push(`Invalid password for ${role}: password too short`);
    }
    if (!creds.expectedRole) {
      errors.push(`Missing expected role for ${role}`);
    }
    if (!creds.expectedDashboard) {
      errors.push(`Missing expected dashboard for ${role}`);
    }
  });

  // Validate timeouts
  Object.entries(config.timeouts).forEach(([key, timeout]) => {
    if (timeout <= 0 || timeout > 60000) {
      errors.push(`Invalid timeout for ${key}: ${timeout}ms (should be 1-60000ms)`);
    }
  });

  // Validate RBAC config
  if (!config.rbacConfig.adminFeatures || config.rbacConfig.adminFeatures.length === 0) {
    errors.push('Admin features list is empty');
  }
  if (!config.rbacConfig.instructorFeatures || config.rbacConfig.instructorFeatures.length === 0) {
    errors.push('Instructor features list is empty');
  }
  if (!config.rbacConfig.studentFeatures || config.rbacConfig.studentFeatures.length === 0) {
    errors.push('Student features list is empty');
  }

  // Validate session config
  Object.entries(config.sessionConfig.timeouts).forEach(([key, timeout]) => {
    if (timeout <= 0 || timeout > 30000) {
      errors.push(`Invalid session timeout for ${key}: ${timeout}ms (should be 1-30000ms)`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}