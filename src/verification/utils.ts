// Utility functions for the verification system

import { VerificationResult, VerificationStatus, OverallStatus } from './types';

/**
 * Check if a port is available (browser-compatible version)
 */
export async function isPortAvailable ( port: number ): Promise<boolean>
{
  // In browser environment, we can't directly check port availability
  // This will attempt to connect to the port via HTTP
  try
  {
    const response = await fetch( `http://localhost:${ port }`, {
      method: 'HEAD',
      mode: 'no-cors'
    } );
    return true; // If we can connect, port is in use
  } catch {
    return false; // If connection fails, port might be available
  }
}

/**
 * Check if a URL is accessible
 */
export async function isUrlAccessible ( url: string, timeout: number = 5000 ): Promise<boolean>
{
  try
  {
    const controller = new AbortController();
    const timeoutId = setTimeout( () => controller.abort(), timeout );

    const response = await fetch( url, {
      signal: controller.signal,
      method: 'HEAD'
    } );

    clearTimeout( timeoutId );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Execute a shell command and return the result (browser-compatible version)
 */
export async function executeCommand (
  command: string,
  options: { timeout?: number; cwd?: string } = {}
): Promise<{ success: boolean; output: string; error?: string }>
{
  // In browser environment, we can't execute shell commands directly
  // This is a placeholder that returns a mock result
  // Individual verifiers should implement their own command execution logic
  return {
    success: false,
    output: '',
    error: 'Command execution not available in browser environment'
  };
}

/**
 * Wait for a condition to be true with timeout
 */
export async function waitForCondition (
  condition: () => Promise<boolean> | boolean,
  timeout: number = 10000,
  interval: number = 500
): Promise<boolean>
{
  const startTime = Date.now();

  while ( Date.now() - startTime < timeout )
  {
    try
    {
      const result = await condition();
      if ( result )
      {
        return true;
      }
    } catch {
      // Ignore errors and continue waiting
    }

    await new Promise( resolve => setTimeout( resolve, interval ) );
  }

  return false;
}

/**
 * Parse package.json file (browser-compatible version)
 */
export async function parsePackageJson ( filePath: string ): Promise<any>
{
  try
  {
    const response = await fetch( filePath );
    if ( !response.ok )
    {
      throw new Error( `Failed to fetch ${ filePath }: ${ response.statusText }` );
    }
    const content = await response.text();
    return JSON.parse( content );
  } catch ( error )
  {
    throw new Error( `Failed to parse package.json at ${ filePath }: ${ error }` );
  }
}

/**
 * Check if a package is installed (browser-compatible version)
 */
export async function isPackageInstalled ( packageName: string, cwd?: string ): Promise<boolean>
{
  // In browser environment, we can't directly check the file system
  // This is a placeholder that always returns false
  // Individual verifiers should implement their own package checking logic
  return false;
}

/**
 * Get Node.js version (browser-compatible version)
 */
export function getNodeVersion (): string
{
  // In browser environment, we can't access process.version
  return 'unknown (browser environment)';
}

/**
 * Get npm version (browser-compatible version)
 */
export async function getNpmVersion (): Promise<string>
{
  // In browser environment, we can't execute npm commands
  return 'unknown (browser environment)';
}

/**
 * Check if environment variable is set (browser-compatible version)
 */
export function isEnvVarSet ( varName: string ): boolean
{
  // In browser environment, we can only access Vite environment variables
  if ( typeof import.meta !== 'undefined' && import.meta.env )
  {
    return import.meta.env[ varName ] !== undefined && import.meta.env[ varName ] !== '';
  }
  return false;
}

/**
 * Get environment variable value (browser-compatible version)
 */
export function getEnvVar ( varName: string, defaultValue?: string ): string | undefined
{
  // In browser environment, we can only access Vite environment variables
  if ( typeof import.meta !== 'undefined' && import.meta.env )
  {
    return import.meta.env[ varName ] || defaultValue;
  }
  return defaultValue;
}

/**
 * Validate environment variables
 */
export function validateEnvVars ( requiredVars: string[] ): { valid: boolean; missing: string[] }
{
  const missing = requiredVars.filter( varName => !isEnvVarSet( varName ) );
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Calculate overall status from verification results
 */
export function calculateOverallStatus ( results: VerificationResult[] ): OverallStatus
{
  const hasCriticalFailures = results.some( result =>
    result.status === 'FAIL' && result.errors && result.errors.length > 0
  );

  if ( hasCriticalFailures )
  {
    return 'CRITICAL_FAILURES';
  }

  const hasIssues = results.some( result =>
    result.status === 'FAIL' || result.status === 'WARNING'
  );

  if ( hasIssues )
  {
    return 'ISSUES_FOUND';
  }

  return 'HEALTHY';
}

/**
 * Format duration in human-readable format
 */
export function formatDuration ( milliseconds: number ): string
{
  if ( milliseconds < 1000 )
  {
    return `${ milliseconds }ms`;
  }

  const seconds = Math.floor( milliseconds / 1000 );
  if ( seconds < 60 )
  {
    return `${ seconds }s`;
  }

  const minutes = Math.floor( seconds / 60 );
  const remainingSeconds = seconds % 60;
  return `${ minutes }m ${ remainingSeconds }s`;
}

/**
 * Generate unique ID for verification runs
 */
export function generateVerificationId (): string
{
  const timestamp = Date.now();
  const random = Math.random().toString( 36 ).substring( 2, 8 );
  return `verification-${ timestamp }-${ random }`;
}

/**
 * Sanitize file path for cross-platform compatibility (browser-compatible version)
 */
export function sanitizePath ( filePath: string ): string
{
  // Simple path normalization for browser environment
  return filePath.replace( /\\/g, '/' ).replace( /\/+/g, '/' );
}

/**
 * Create directory if it doesn't exist (browser-compatible version)
 */
export async function ensureDirectory ( dirPath: string ): Promise<void>
{
  // In browser environment, we can't create directories
  // This is a no-op placeholder
  console.log( `Directory creation not available in browser environment: ${ dirPath }` );
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>> ( target: T, source: Partial<T> ): T
{
  const result = { ...target };

  for ( const key in source )
  {
    const sourceValue = source[ key ];
    if ( sourceValue && typeof sourceValue === 'object' && !Array.isArray( sourceValue ) )
    {
      const targetValue = result[ key ];
      if ( targetValue && typeof targetValue === 'object' && !Array.isArray( targetValue ) )
      {
        result[ key ] = deepMerge( targetValue, sourceValue );
      } else
      {
        result[ key ] = deepMerge( {} as T[ Extract<keyof T, string> ], sourceValue );
      }
    } else if ( sourceValue !== undefined )
    {
      result[ key ] = sourceValue as T[ Extract<keyof T, string> ];
    }
  }

  return result;
}