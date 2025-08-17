import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { createServer } from 'node:net';
import { AbstractBaseVerifier } from './base-verifier';
import { VerificationResult } from './types';
import { ScriptVerifier as IScriptVerifier } from './interfaces';

export interface ScriptTestResult
{
  script: string;
  success: boolean;
  exitCode: number | null;
  duration: number;
  output: string;
  error?: string;
  autoFixed?: boolean;
  fixApplied?: string;
}

export interface ScriptVerificationResult extends VerificationResult
{
  scriptResults: ScriptTestResult[];
  portConflicts: string[];
  dependencyIssues: string[];
  autoFixesApplied: number;
}

export class ScriptVerifierImpl extends AbstractBaseVerifier implements IScriptVerifier
{
  public readonly moduleName = 'scripts';

  private readonly SCRIPT_TIMEOUT = 30_000;  // 30s
  private readonly BUILD_TIMEOUT = 120_000;  // 2min
  private readonly DEV_TIMEOUT = 15_000;   // 15s (só checagem de startup)

  async verify (): Promise<ScriptVerificationResult>
  {
    const startTime = Date.now();

    try
    {
      this.log( 'Starting script verification...' );

      // 9.0 - sanity
      await this.validatePackageJsonFiles();

      // 9.1 - dev
      const devScriptResults = await this.testDevelopmentScripts();

      // 9.2 - build/deploy
      const buildScriptResults = await this.testBuildScripts();

      // 9.3 - env/util
      const envScriptResults = await this.testEnvironmentScripts();

      const allResults = [ ...devScriptResults, ...buildScriptResults, ...envScriptResults ];
      const autoFixesApplied = allResults.filter( r => !!r.autoFixed ).length;

      const success = allResults.every( r => r.success );
      const duration = Date.now() - startTime;

      return {
        module: this.moduleName,
        status: success ? 'PASS' : 'FAIL',
        timestamp: new Date(),
        duration,
        details: allResults.map( r => ( {
          component: 'npm-script',
          test: r.script,
          result: r.success ? 'PASS' : 'FAIL',
          message: r.success
            ? `Script '${ r.script }' executed successfully`
            : `Script '${ r.script }' failed: ${ r.error ?? 'unknown error' }`,
          data: {
            exitCode: r.exitCode,
            duration: r.duration,
            output: r.output.slice( 0, 500 ), // evita logs gigantes
            autoFixed: r.autoFixed,
            fixApplied: r.fixApplied,
          },
        } ) ),
        scriptResults: allResults,
        portConflicts: await this.detectPortConflicts(),
        dependencyIssues: await this.detectDependencyIssues(),
        autoFixesApplied,
      };

    } catch ( err: unknown )
    {
      const duration = Date.now() - startTime;
      const msg = ( err as any )?.message ?? String( err );
      this.log( `Script verification failed: ${ msg }`, 'error' );

      return {
        module: this.moduleName,
        status: 'FAIL',
        timestamp: new Date(),
        duration,
        details: [ {
          component: 'script-verifier',
          test: 'initialization',
          result: 'FAIL',
          message: `Script verifier initialization failed: ${ msg }`,
          data: { error: msg },
        } ],
        scriptResults: [],
        portConflicts: [],
        dependencyIssues: [],
        autoFixesApplied: 0,
      };
    }
  }

  // 9.1 - dev
  async testDevelopmentScripts (): Promise<any[]>
  {
    this.log( 'Testing development scripts...' );

    const devScripts = [
      'dev',
      'dev:frontend',
      'dev:frontend-only',
      'dev:backend',
      'dev:backend-only',
      // 'dev:all' será testado separado (concorrente)
    ];

    const results: ScriptTestResult[] = [];

    for ( const script of devScripts )
    {
      const result = await this.testScript( script, this.DEV_TIMEOUT, true );
      results.push( result );

      if ( !result.success )
      {
        const fixResult = await this.autoFixScript( script, result );
        if ( fixResult.autoFixed ) results[ results.length - 1 ] = fixResult;
      }
    }

    // concorrente (frontend+backend)
    const devAllResult = await this.testConcurrentScript( 'dev:all' );
    results.push( devAllResult );

    return results;
  }

  // 9.2 - build/deploy
  private async testBuildScripts (): Promise<ScriptTestResult[]>
  {
    this.log( 'Testing build and deployment scripts...' );

    const buildScripts = [ 'build', 'build:dev', 'preview', 'start' ];
    const results: ScriptTestResult[] = [];

    for ( const script of buildScripts )
    {
      const timeout = script.includes( 'build' ) ? this.BUILD_TIMEOUT : this.SCRIPT_TIMEOUT;
      const result = await this.testScript( script, timeout );
      results.push( result );

      if ( !result.success && script.includes( 'build' ) )
      {
        const fixResult = await this.autoFixBuildScript( script, result );
        if ( fixResult.autoFixed ) results[ results.length - 1 ] = fixResult;
      }
    }

    return results;
  }

  // 9.3 - env/util
  async testEnvironmentScripts (): Promise<any[]>
  {
    this.log( 'Testing environment and utility scripts...' );

    const envScripts = [ 'env:validate', 'env:check', 'env:show' ];
    const results: ScriptTestResult[] = [];

    for ( const script of envScripts )
    {
      const result = await this.testScript( script, this.SCRIPT_TIMEOUT );
      results.push( result );

      if ( !result.success )
      {
        const fixResult = await this.autoFixEnvironmentScript( script, result );
        if ( fixResult.autoFixed ) results[ results.length - 1 ] = fixResult;
      }
    }

    // Convert to EnvScriptResult format for interface compliance
    return results.map( r => this.convertToEnvScriptResult( r ) );
  }

  // Convert ScriptTestResult to EnvScriptResult format
  private convertToEnvScriptResult ( testResult: ScriptTestResult ): any
  {
    return {
      module: this.moduleName,
      status: testResult.success ? 'PASS' : 'FAIL',
      timestamp: new Date(),
      duration: testResult.duration,
      details: [ {
        component: 'env-script',
        test: testResult.script,
        result: testResult.success ? 'PASS' : 'FAIL',
        message: testResult.success
          ? `Environment script '${ testResult.script }' executed successfully`
          : `Environment script '${ testResult.script }' failed: ${ testResult.error ?? 'unknown error' }`,
        data: {
          exitCode: testResult.exitCode,
          output: testResult.output?.slice( 0, 500 ),
          autoFixed: testResult.autoFixed,
          fixApplied: testResult.fixApplied,
        }
      } ],
      scriptName: testResult.script,
      variablesValidated: [] // Could be populated with actual env vars if needed
    };
  }

  // Convert ScriptTestResult to ScriptResult format
  private convertToScriptResult ( testResult: ScriptTestResult ): any
  {
    return {
      module: this.moduleName,
      status: testResult.success ? 'PASS' : 'FAIL',
      timestamp: new Date(),
      duration: testResult.duration,
      details: [ {
        component: 'npm-script',
        test: testResult.script,
        result: testResult.success ? 'PASS' : 'FAIL',
        message: testResult.success
          ? `Script '${ testResult.script }' executed successfully`
          : `Script '${ testResult.script }' failed: ${ testResult.error ?? 'unknown error' }`,
        data: {
          exitCode: testResult.exitCode,
          output: testResult.output?.slice( 0, 500 ),
          autoFixed: testResult.autoFixed,
          fixApplied: testResult.fixApplied,
        }
      } ],
      scriptName: testResult.script,
      exitCode: testResult.exitCode ?? 0,
      output: testResult.output
    };
  }

  // Interface method - build process validation
  async validateBuildProcess (): Promise<any>
  {
    const buildResults = await this.testBuildScripts();
    return {
      success: buildResults.every( r => r.success ),
      results: buildResults,
      timestamp: new Date(),
      duration: buildResults.reduce( ( sum, r ) => sum + r.duration, 0 )
    };
  }

  // Interface method - workflow validation
  async validateWorkflows (): Promise<any>
  {
    // For now, return a simple success result
    // This could be expanded to test CI/CD workflows
    return {
      success: true,
      workflows: [],
      timestamp: new Date(),
      message: 'Workflow validation not implemented yet'
    };
  }

  /**
   * Executa um único script npm.
   * killAfterStartup: finaliza quando detectar "server started" (modo dev).
   */
  private async testScript (
    scriptName: string,
    timeout: number = this.SCRIPT_TIMEOUT,
    killAfterStartup = false,
  ): Promise<ScriptTestResult>
  {
    const startTime = Date.now();

    return new Promise( ( resolve ) =>
    {
      let output = '';
      let errorOutput = '';
      let resolved = false;

      const child = spawn( 'npm', [ 'run', scriptName ], {
        cwd: process.cwd(),
        stdio: [ 'pipe', 'pipe', 'pipe' ],
        shell: true,
      } );

      const finish = ( res: ScriptTestResult ) =>
      {
        if ( resolved ) return;
        resolved = true;
        clearTimeout( timer );
        try { child.kill( 'SIGTERM' ); } catch { /* noop */ }
        resolve( res );
      };

      child.stdout?.on( 'data', ( data ) =>
      {
        const chunk = data.toString();
        output += chunk;

        // Para dev scripts, encerra assim que detectar "start"
        if ( killAfterStartup && this.isDevServerStarted( output ) )
        {
          finish( {
            script: scriptName,
            success: true,
            exitCode: 0,
            duration: Date.now() - startTime,
            output,
            autoFixed: false,
          } );
        }
      } );

      child.stderr?.on( 'data', ( data ) =>
      {
        errorOutput += data.toString();
      } );

      child.on( 'close', ( code ) =>
      {
        finish( {
          script: scriptName,
          success: code === 0,
          exitCode: code,
          duration: Date.now() - startTime,
          output,
          error: errorOutput || undefined,
          autoFixed: false,
        } );
      } );

      child.on( 'error', ( error: any ) =>
      {
        finish( {
          script: scriptName,
          success: false,
          exitCode: null,
          duration: Date.now() - startTime,
          output,
          error: error?.message ?? String( error ),
          autoFixed: false,
        } );
      } );

      const timer = setTimeout( () =>
      {
        finish( {
          script: scriptName,
          success: false,
          exitCode: null,
          duration: Date.now() - startTime,
          output,
          error: `Script timeout after ${ timeout }ms`,
          autoFixed: false,
        } );
      }, timeout );
    } );
  }

  /**
   * Executa script concorrente (ex.: dev:all) e encerra quando ambos subirem.
   */
  private async testConcurrentScript ( scriptName: string ): Promise<ScriptTestResult>
  {
    const startTime = Date.now();

    return new Promise( ( resolve ) =>
    {
      let output = '';
      let errorOutput = '';
      let resolved = false;

      const child = spawn( 'npm', [ 'run', scriptName ], {
        cwd: process.cwd(),
        stdio: [ 'pipe', 'pipe', 'pipe' ],
        shell: true,
      } );

      const finish = ( res: ScriptTestResult ) =>
      {
        if ( resolved ) return;
        resolved = true;
        clearTimeout( timer );
        try { child.kill( 'SIGTERM' ); } catch { /* noop */ }
        resolve( res );
      };

      child.stdout?.on( 'data', ( data ) =>
      {
        output += data.toString();

        if ( this.areBothServersStarted( output ) )
        {
          finish( {
            script: scriptName,
            success: true,
            exitCode: 0,
            duration: Date.now() - startTime,
            output,
            autoFixed: false,
          } );
        }
      } );

      child.stderr?.on( 'data', ( data ) =>
      {
        errorOutput += data.toString();
      } );

      child.on( 'close', ( code ) =>
      {
        finish( {
          script: scriptName,
          success: code === 0,
          exitCode: code,
          duration: Date.now() - startTime,
          output,
          error: errorOutput || undefined,
          autoFixed: false,
        } );
      } );

      child.on( 'error', ( error: any ) =>
      {
        finish( {
          script: scriptName,
          success: false,
          exitCode: null,
          duration: Date.now() - startTime,
          output,
          error: error?.message ?? String( error ),
          autoFixed: false,
        } );
      } );

      const timer = setTimeout( () =>
      {
        finish( {
          script: scriptName,
          success: false,
          exitCode: null,
          duration: Date.now() - startTime,
          output,
          error: `Concurrent script timeout after ${ this.DEV_TIMEOUT * 2 }ms`,
          autoFixed: false,
        } );
      }, this.DEV_TIMEOUT * 2 );
    } );
  }

  private isDevServerStarted ( output: string ): boolean
  {
    const startupIndicators = [
      'Local:',
      'ready in',
      'server started',
      'listening on',
      'Server running on',
      'Development server running',
    ];
    const out = output.toLowerCase();
    return startupIndicators.some( ind => out.includes( ind.toLowerCase() ) );
  }

  private areBothServersStarted ( output: string ): boolean
  {
    const out = output.toLowerCase();
    const frontendStarted =
      this.isDevServerStarted( out ) &&
      ( out.includes( '5173' ) || out.includes( '8080' ) || out.includes( 'vite' ) );

    const backendStarted =
      out.includes( '3000' ) ||
      out.includes( '3001' ) ||
      out.includes( 'backend' ) ||
      out.includes( 'server.js' );

    return frontendStarted && backendStarted;
  }

  // ---------- Auto-fixes ----------

  private async autoFixScript ( scriptName: string, result: ScriptTestResult ): Promise<ScriptTestResult>
  {
    this.log( `Attempting to auto-fix script: ${ scriptName }` );

    const fixes: string[] = [];

    if ( result.error?.includes( 'missing script' ) )
    {
      const fixed = await this.addMissingScript( scriptName );
      if ( fixed ) fixes.push( `Added missing script definition for ${ scriptName }` );
    }

    if ( result.error?.includes( 'EADDRINUSE' ) || result.error?.toLowerCase().includes( 'port' ) )
    {
      const fixed = await this.resolvePortConflict( scriptName );
      if ( fixed ) fixes.push( `Resolved port conflict for ${ scriptName }` );
    }

    if ( result.error?.includes( 'Cannot find module' ) || result.error?.includes( 'not found' ) )
    {
      const fixed = await this.fixDependencyIssues( result.error );
      if ( fixed ) fixes.push( `Fixed dependency issues for ${ scriptName }` );
    }

    if ( fixes.length > 0 )
    {
      const retestResult = await this.testScript( scriptName, this.SCRIPT_TIMEOUT );
      return { ...retestResult, autoFixed: true, fixApplied: fixes.join( '; ' ) };
    }

    return result;
  }

  private async autoFixBuildScript ( scriptName: string, result: ScriptTestResult ): Promise<ScriptTestResult>
  {
    this.log( `Attempting to auto-fix build script: ${ scriptName }` );

    const fixes: string[] = [];

    if ( result.error?.toLowerCase().includes( 'vite' ) || result.error?.toLowerCase().includes( 'build' ) )
    {
      const fixed = await this.fixBuildDependencies();
      if ( fixed ) fixes.push( 'Fixed build dependencies' );
    }

    if ( result.error?.toLowerCase().includes( 'dist' ) || result.error?.toLowerCase().includes( 'output' ) )
    {
      const fixed = await this.fixOutputPaths();
      if ( fixed ) fixes.push( 'Fixed output paths' );
    }

    if ( fixes.length > 0 )
    {
      const retestResult = await this.testScript( scriptName, this.BUILD_TIMEOUT );
      return { ...retestResult, autoFixed: true, fixApplied: fixes.join( '; ' ) };
    }

    return result;
  }

  private async autoFixEnvironmentScript ( scriptName: string, result: ScriptTestResult ): Promise<ScriptTestResult>
  {
    this.log( `Attempting to auto-fix environment script: ${ scriptName }` );

    const fixes: string[] = [];

    if ( result.error?.includes( '.env' ) || result.error?.toLowerCase().includes( 'environment' ) )
    {
      const fixed = await this.createMissingEnvFile();
      if ( fixed ) fixes.push( 'Created missing .env file' );
    }

    if ( result.error?.toLowerCase().includes( 'undefined' ) || result.error?.toLowerCase().includes( 'required' ) )
    {
      const fixed = await this.addMissingEnvVars();
      if ( fixed ) fixes.push( 'Added missing environment variables' );
    }

    if ( fixes.length > 0 )
    {
      const retestResult = await this.testScript( scriptName, this.SCRIPT_TIMEOUT );
      return { ...retestResult, autoFixed: true, fixApplied: fixes.join( '; ' ) };
    }

    return result;
  }

  // ---------- Utilidades ----------

  private async validatePackageJsonFiles (): Promise<void>
  {
    const paths = [ 'package.json', 'backend/package.json' ];
    for ( const p of paths )
    {
      try
      {
        await fs.access( p );
        this.log( `✓ Found ${ p }` );
      } catch {
        throw new Error( `Missing required package.json file: ${ p }` );
      }
    }
  }

  private async detectPortConflicts (): Promise<string[]>
  {
    const conflicts: string[] = [];
    const ports = [ 3000, 3001, 5173, 8080 ];

    for ( const port of ports )
    {
      if ( await this.isPortInUse( port ) ) conflicts.push( `Port ${ port } is already in use` );
    }

    return conflicts;
  }

  private async detectDependencyIssues (): Promise<string[]>
  {
    const issues: string[] = [];
    try
    {
      await fs.access( 'node_modules' );
    } catch {
      issues.push( 'Missing node_modules in project root — run npm install' );
    }
    try
    {
      await fs.access( 'backend/node_modules' );
    } catch {
      issues.push( 'Missing node_modules in backend — run npm install in ./backend' );
    }
    return issues;
  }

  private async addMissingScript ( _scriptName: string ): Promise<boolean>
  {
    this.log( `Would add missing script: ${ _scriptName }` );
    return false; // placeholder
  }

  private async resolvePortConflict ( _scriptName: string ): Promise<boolean>
  {
    this.log( `Would resolve port conflict for: ${ _scriptName }` );
    return false; // placeholder
  }

  private async fixDependencyIssues ( _error: string ): Promise<boolean>
  {
    this.log( `Would fix dependency issues: ${ _error }` );
    return false; // placeholder
  }

  private async fixBuildDependencies (): Promise<boolean>
  {
    this.log( 'Would fix build dependencies' );
    return false; // placeholder
  }

  private async fixOutputPaths (): Promise<boolean>
  {
    this.log( 'Would fix output paths' );
    return false; // placeholder
  }

  private async createMissingEnvFile (): Promise<boolean>
  {
    try
    {
      const envExample = await fs.readFile( '.env.example', 'utf-8' );
      await fs.writeFile( '.env', envExample );
      this.log( 'Created .env file from .env.example' );
      return true;
    } catch ( err: any )
    {
      this.log( `Failed to create .env file: ${ err?.message ?? String( err ) }`, 'error' );
      return false;
    }
  }

  private async addMissingEnvVars (): Promise<boolean>
  {
    this.log( 'Would add missing environment variables' );
    return false; // placeholder
  }

  private async isPortInUse ( port: number ): Promise<boolean>
  {
    return new Promise( ( resolve ) =>
    {
      const server = createServer();

      server.once( 'error', () =>
      {
        resolve( true ); // erro ao abrir = já em uso
      } );

      server.listen( port, () =>
      {
        server.close( () => resolve( false ) ); // abriu = livre
      } );
    } );
  }
}
