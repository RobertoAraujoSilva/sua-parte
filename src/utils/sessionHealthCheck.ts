/**
 * Session Health Check Utility
 * Comprehensive health check for authentication and database connectivity
 */

import { supabase } from '@/integrations/supabase/client';

export interface HealthCheckResult {
  overall: 'healthy' | 'warning' | 'critical';
  checks: {
    session: HealthCheck;
    database: HealthCheck;
    profile: HealthCheck;
    tables: HealthCheck;
  };
  recommendations: string[];
  timestamp: Date;
}

interface HealthCheck {
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  duration?: number;
}

/**
 * Performs a comprehensive health check of the authentication system
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  console.log('🏥 Starting comprehensive health check...');
  const startTime = Date.now();
  
  const result: HealthCheckResult = {
    overall: 'healthy',
    checks: {
      session: { status: 'fail', message: 'Not checked' },
      database: { status: 'fail', message: 'Not checked' },
      profile: { status: 'fail', message: 'Not checked' },
      tables: { status: 'fail', message: 'Not checked' }
    },
    recommendations: [],
    timestamp: new Date()
  };

  // Check 1: Session Health
  try {
    const sessionStart = Date.now();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const sessionDuration = Date.now() - sessionStart;
    
    if (sessionError) {
      result.checks.session = {
        status: 'fail',
        message: `Session error: ${sessionError.message}`,
        details: sessionError,
        duration: sessionDuration
      };
      result.recommendations.push('Clear authentication storage and re-login');
    } else if (!session) {
      result.checks.session = {
        status: 'warning',
        message: 'No active session found',
        duration: sessionDuration
      };
      result.recommendations.push('User needs to login');
    } else {
      // Check session expiry
      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      if (timeUntilExpiry < 300000) { // Less than 5 minutes
        result.checks.session = {
          status: 'warning',
          message: `Session expires soon (${Math.round(timeUntilExpiry / 60000)} minutes)`,
          details: { expiresAt, timeUntilExpiry },
          duration: sessionDuration
        };
        result.recommendations.push('Session will expire soon, consider refreshing');
      } else {
        result.checks.session = {
          status: 'pass',
          message: 'Session is healthy',
          details: { expiresAt, userId: session.user.id },
          duration: sessionDuration
        };
      }
    }
  } catch (error: any) {
    result.checks.session = {
      status: 'fail',
      message: `Session check failed: ${error.message}`,
      details: error
    };
    result.recommendations.push('Clear authentication storage and re-login');
  }

  // Check 2: Database Connectivity
  try {
    const dbStart = Date.now();
    const { data, error } = await Promise.race([
      supabase.from('profiles').select('count').limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
    ]) as any;
    
    const dbDuration = Date.now() - dbStart;
    
    if (error) {
      if (error.code === 'PGRST205') {
        result.checks.database = {
          status: 'warning',
          message: 'Database connected but profiles table not found',
          details: error,
          duration: dbDuration
        };
        result.recommendations.push('Run database setup to create missing tables');
      } else {
        result.checks.database = {
          status: 'fail',
          message: `Database error: ${error.message}`,
          details: error,
          duration: dbDuration
        };
        result.recommendations.push('Check database connection and permissions');
      }
    } else {
      result.checks.database = {
        status: 'pass',
        message: 'Database connectivity is healthy',
        duration: dbDuration
      };
    }
  } catch (error: any) {
    result.checks.database = {
      status: 'fail',
      message: `Database check failed: ${error.message}`,
      details: error
    };
    result.recommendations.push('Check database connection and permissions');
  }

  // Check 3: Profile Loading (if session exists)
  if (result.checks.session.status === 'pass') {
    try {
      const profileStart = Date.now();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        const { data: profile, error: profileError } = await Promise.race([
          supabase.from('profiles').select('*').eq('id', session.user.id).single(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Profile loading timeout')), 8000))
        ]) as any;
        
        const profileDuration = Date.now() - profileStart;
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            result.checks.profile = {
              status: 'warning',
              message: 'Profile not found in database',
              details: profileError,
              duration: profileDuration
            };
            result.recommendations.push('Create user profile or run admin profile fix');
          } else {
            result.checks.profile = {
              status: 'fail',
              message: `Profile error: ${profileError.message}`,
              details: profileError,
              duration: profileDuration
            };
            result.recommendations.push('Check profile table and permissions');
          }
        } else {
          result.checks.profile = {
            status: 'pass',
            message: 'Profile loaded successfully',
            details: { profileId: profile?.id, role: profile?.role },
            duration: profileDuration
          };
        }
      }
    } catch (error: any) {
      result.checks.profile = {
        status: 'fail',
        message: `Profile check failed: ${error.message}`,
        details: error
      };
      result.recommendations.push('Profile loading is hanging - possible auth corruption');
    }
  }

  // Check 4: Essential Tables
  try {
    const tablesStart = Date.now();
    const essentialTables = ['profiles', 'global_programming'];
    const tableChecks = await Promise.all(
      essentialTables.map(async (table) => {
        try {
          const { error } = await supabase.from(table).select('count').limit(1);
          return { table, exists: !error, error };
        } catch (err) {
          return { table, exists: false, error: err };
        }
      })
    );
    
    const tablesDuration = Date.now() - tablesStart;
    const missingTables = tableChecks.filter(check => !check.exists);
    
    if (missingTables.length === 0) {
      result.checks.tables = {
        status: 'pass',
        message: 'All essential tables exist',
        details: tableChecks,
        duration: tablesDuration
      };
    } else {
      result.checks.tables = {
        status: 'warning',
        message: `Missing tables: ${missingTables.map(t => t.table).join(', ')}`,
        details: tableChecks,
        duration: tablesDuration
      };
      result.recommendations.push('Run database setup to create missing tables');
    }
  } catch (error: any) {
    result.checks.tables = {
      status: 'fail',
      message: `Table check failed: ${error.message}`,
      details: error
    };
    result.recommendations.push('Check database schema and permissions');
  }

  // Determine overall health
  const failedChecks = Object.values(result.checks).filter(check => check.status === 'fail').length;
  const warningChecks = Object.values(result.checks).filter(check => check.status === 'warning').length;
  
  if (failedChecks > 0) {
    result.overall = 'critical';
  } else if (warningChecks > 0) {
    result.overall = 'warning';
  } else {
    result.overall = 'healthy';
  }

  const totalDuration = Date.now() - startTime;
  console.log(`🏥 Health check completed in ${totalDuration}ms - Overall: ${result.overall}`);
  
  return result;
}

/**
 * Quick health check for immediate feedback
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    const { data: { session }, error } = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Quick check timeout')), 3000))
    ]) as any;
    
    return !error && !!session;
  } catch {
    return false;
  }
}

// Expose health check functions on window for manual testing
if (typeof window !== 'undefined') {
  (window as any).healthCheck = {
    full: performHealthCheck,
    quick: quickHealthCheck
  };
  console.log('🏥 Health check tools available: window.healthCheck');
}
