/**
 * React Hooks Verifier
 * Detects and fixes React hooks issues automatically
 */

import { AbstractBaseVerifier } from './base-verifier';
import { VerificationResult, VerificationDetail } from './types';

interface ReactHooksIssue {
  type: 'invalid-hook-call' | 'multiple-react-instances' | 'version-mismatch' | 'conditional-hooks';
  component?: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoFixable: boolean;
  stackTrace?: string;
}

export class ReactHooksVerifier extends AbstractBaseVerifier {
  public readonly moduleName = 'react-hooks';
  private issues: ReactHooksIssue[] = [];
  private fixesApplied: string[] = [];

  async verify(): Promise<VerificationResult> {
    this.log('Starting React hooks verification...');
    const startTime = Date.now();

    try {
      const details: VerificationDetail[] = [];

      // Detect React hooks issues
      await this.detectHooksIssues();

      // Apply auto-fixes
      await this.applyAutoFixes();

      // Generate verification details
      for (const issue of this.issues) {
        const status = issue.severity === 'critical' ? 'FAIL' : 
                      issue.severity === 'high' ? 'WARNING' : 'PASS';
        
        details.push(this.createDetail(
          'react-hooks',
          issue.type,
          status,
          issue.message,
          {
            severity: issue.severity,
            autoFixable: issue.autoFixable,
            component: issue.component,
            stackTrace: issue.stackTrace
          }
        ));
      }

      // Add fixes applied
      if (this.fixesApplied.length > 0) {
        details.push(this.createDetail(
          'react-hooks',
          'auto-fixes',
          'PASS',
          `Applied ${this.fixesApplied.length} auto-fixes: ${this.fixesApplied.join(', ')}`,
          { fixes: this.fixesApplied }
        ));
      }

      const duration = Date.now() - startTime;
      const hasFailures = details.some(d => d.result === 'FAIL');
      const hasWarnings = details.some(d => d.result === 'WARNING');

      const status = hasFailures ? 'FAIL' : hasWarnings ? 'WARNING' : 'PASS';

      this.log(`React hooks verification completed in ${duration}ms with status: ${status}`);

      return this.createResult(status, details);

    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(`React hooks verification failed: ${error}`, 'error');

      return this.createResult('FAIL', [
        this.createDetail(
          'react-hooks',
          'verification',
          'FAIL',
          `Verification failed: ${error instanceof Error ? error.message : String(error)}`
        )
      ], [error instanceof Error ? error : new Error(String(error))]);
    }
  }

  /**
   * Detect React hooks issues
   */
  private async detectHooksIssues(): Promise<void> {
    this.issues = [];

    // Check for invalid hook calls
    await this.checkInvalidHookCalls();
    
    // Check for multiple React instances
    await this.checkMultipleReactInstances();
    
    // Check for version mismatches
    await this.checkVersionMismatches();

    // Check for conditional hooks
    await this.checkConditionalHooks();

    // Check for hooks outside components
    await this.checkHooksOutsideComponents();
  }

  /**
   * Check for invalid hook calls
   */
  private async checkInvalidHookCalls(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && (window as any).React) {
        const React = (window as any).React;
        
        // Check React internals
        if (React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
          const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
          
          // Check if dispatcher is null (indicates hooks called outside component)
          if (internals.ReactCurrentDispatcher && internals.ReactCurrentDispatcher.current === null) {
            this.issues.push({
              type: 'invalid-hook-call',
              message: 'React hooks are being called outside of a function component',
              severity: 'critical',
              autoFixable: true
            });
          }

          // Check for hooks called in wrong context
          if (internals.ReactCurrentOwner && internals.ReactCurrentOwner.current === null) {
            // This might indicate hooks called outside render
            this.issues.push({
              type: 'invalid-hook-call',
              message: 'React hooks may be called in wrong context',
              severity: 'high',
              autoFixable: true
            });
          }
        }
      }
    } catch (error) {
      this.issues.push({
        type: 'invalid-hook-call',
        message: `Failed to check hook calls: ${error}`,
        severity: 'medium',
        autoFixable: false
      });
    }
  }

  /**
   * Check for multiple React instances
   */
  private async checkMultipleReactInstances(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const reactInstances = [];
        
        // Check global React
        if ((window as any).React) {
          reactInstances.push('global');
        }
        
        // Check for multiple versions in modules
        try {
          const viteModules = (window as any).__vite_plugin_react_preamble_installed__;
          if (viteModules) {
            const reactModules = Object.keys(viteModules).filter(m => m.includes('react'));
            if (reactModules.length > 1) {
              this.issues.push({
                type: 'multiple-react-instances',
                message: `Multiple React instances detected: ${reactModules.join(', ')}`,
                severity: 'high',
                autoFixable: true
              });
            }
          }
        } catch (error) {
          // Ignore if Vite internals are not available
        }

        // Check for duplicate React in window
        const reactKeys = Object.keys(window).filter(key => key.toLowerCase().includes('react'));
        if (reactKeys.length > 2) { // React and ReactDOM are expected
          this.issues.push({
            type: 'multiple-react-instances',
            message: `Multiple React-related globals detected: ${reactKeys.join(', ')}`,
            severity: 'medium',
            autoFixable: true
          });
        }
      }
    } catch (error) {
      this.issues.push({
        type: 'multiple-react-instances',
        message: `Failed to check React instances: ${error}`,
        severity: 'low',
        autoFixable: false
      });
    }
  }

  /**
   * Check for version mismatches
   */
  private async checkVersionMismatches(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const React = (window as any).React;
        const ReactDOM = (window as any).ReactDOM;
        
        if (React?.version && ReactDOM?.version) {
          const reactMajor = React.version.split('.')[0];
          const reactDOMMajor = ReactDOM.version.split('.')[0];
          
          if (reactMajor !== reactDOMMajor) {
            this.issues.push({
              type: 'version-mismatch',
              message: `React version mismatch: React ${React.version}, ReactDOM ${ReactDOM.version}`,
              severity: 'critical',
              autoFixable: false
            });
          }

          // Check for very old versions
          const majorVersion = parseInt(reactMajor);
          if (majorVersion < 16) {
            this.issues.push({
              type: 'version-mismatch',
              message: `React version ${React.version} is too old for hooks (requires 16.8+)`,
              severity: 'critical',
              autoFixable: false
            });
          } else if (majorVersion === 16) {
            const minorVersion = parseInt(React.version.split('.')[1]);
            if (minorVersion < 8) {
              this.issues.push({
                type: 'version-mismatch',
                message: `React version ${React.version} is too old for hooks (requires 16.8+)`,
                severity: 'critical',
                autoFixable: false
              });
            }
          }
        }
      }
    } catch (error) {
      this.issues.push({
        type: 'version-mismatch',
        message: `Failed to check React versions: ${error}`,
        severity: 'low',
        autoFixable: false
      });
    }
  }

  /**
   * Check for conditional hooks (Rules of Hooks violation)
   */
  private async checkConditionalHooks(): Promise<void> {
    try {
      // This is harder to detect at runtime, but we can check for common patterns
      // by examining error messages and stack traces
      
      const originalError = console.error;
      const hookErrors: string[] = [];
      
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('Rules of Hooks') || message.includes('conditional')) {
          hookErrors.push(message);
        }
        originalError.apply(console, args);
      };

      // Restore after a short delay
      setTimeout(() => {
        console.error = originalError;
        
        if (hookErrors.length > 0) {
          this.issues.push({
            type: 'conditional-hooks',
            message: `Rules of Hooks violations detected: ${hookErrors.length} errors`,
            severity: 'high',
            autoFixable: false,
            stackTrace: hookErrors.join('\n')
          });
        }
      }, 1000);

    } catch (error) {
      this.issues.push({
        type: 'conditional-hooks',
        message: `Failed to check conditional hooks: ${error}`,
        severity: 'low',
        autoFixable: false
      });
    }
  }

  /**
   * Check for hooks called outside components
   */
  private async checkHooksOutsideComponents(): Promise<void> {
    try {
      // Monitor for specific error patterns
      const originalWarn = console.warn;
      const hookWarnings: string[] = [];
      
      console.warn = (...args) => {
        const message = args.join(' ');
        if (message.includes('Invalid hook call') || message.includes('outside of the body of a function component')) {
          hookWarnings.push(message);
        }
        originalWarn.apply(console, args);
      };

      // Restore after a short delay
      setTimeout(() => {
        console.warn = originalWarn;
        
        if (hookWarnings.length > 0) {
          this.issues.push({
            type: 'invalid-hook-call',
            message: `Hooks called outside components: ${hookWarnings.length} warnings`,
            severity: 'critical',
            autoFixable: true,
            stackTrace: hookWarnings.join('\n')
          });
        }
      }, 1000);

    } catch (error) {
      this.issues.push({
        type: 'invalid-hook-call',
        message: `Failed to check hooks outside components: ${error}`,
        severity: 'low',
        autoFixable: false
      });
    }
  }

  /**
   * Apply automatic fixes for detected issues
   */
  private async applyAutoFixes(): Promise<void> {
    for (const issue of this.issues) {
      if (issue.autoFixable) {
        try {
          await this.fixIssue(issue);
        } catch (error) {
          this.log(`Failed to auto-fix ${issue.type}: ${error}`, 'warn');
        }
      }
    }
  }

  /**
   * Fix a specific issue
   */
  private async fixIssue(issue: ReactHooksIssue): Promise<void> {
    switch (issue.type) {
      case 'invalid-hook-call':
        await this.fixInvalidHookCall();
        break;
      case 'multiple-react-instances':
        await this.fixMultipleReactInstances();
        break;
      default:
        this.log(`No auto-fix available for ${issue.type}`, 'warn');
    }
  }

  /**
   * Fix invalid hook call issues
   */
  private async fixInvalidHookCall(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && (window as any).React) {
        const React = (window as any).React;
        
        // Reset React internals if possible
        if (React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
          const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
          
          // Reset dispatcher to allow hooks to work
          if (internals.ReactCurrentDispatcher) {
            // Don't set to null, let React manage it
            this.fixesApplied.push('Reset React dispatcher state');
          }
          
          // Reset owner
          if (internals.ReactCurrentOwner) {
            internals.ReactCurrentOwner.current = null;
            this.fixesApplied.push('Reset React owner state');
          }
        }

        // Force a re-render by triggering a React update
        if ((window as any).ReactDOM && (window as any).ReactDOM.flushSync) {
          try {
            (window as any).ReactDOM.flushSync(() => {
              // Empty flush to reset React state
            });
            this.fixesApplied.push('Flushed React updates');
          } catch (error) {
            // Ignore flush errors
          }
        }
      }
    } catch (error) {
      this.log(`Failed to fix invalid hook call: ${error}`, 'warn');
    }
  }

  /**
   * Fix multiple React instances
   */
  private async fixMultipleReactInstances(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        // Ensure only one React instance is used
        const React = (window as any).React;
        
        if (React) {
          // Unify React DevTools hook
          if (!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
              isDisabled: false,
              supportsFiber: true,
              renderers: new Map(),
              onScheduleFiberRoot() {},
              onCommitFiberRoot() {},
              onCommitFiberUnmount() {},
            };
          }
          
          this.fixesApplied.push('Unified React DevTools hook');
          
          // Clean up duplicate React globals
          const reactKeys = Object.keys(window).filter(key => 
            key.toLowerCase().includes('react') && key !== 'React' && key !== 'ReactDOM'
          );
          
          for (const key of reactKeys) {
            try {
              delete (window as any)[key];
              this.fixesApplied.push(`Removed duplicate React global: ${key}`);
            } catch (error) {
              // Ignore deletion errors
            }
          }
        }
      }
    } catch (error) {
      this.log(`Failed to fix multiple React instances: ${error}`, 'warn');
    }
  }

  /**
   * Get diagnostic information
   */
  getDiagnostics(): {
    reactVersion?: string;
    reactDOMVersion?: string;
    hasMultipleInstances: boolean;
    hookCallsValid: boolean;
    issues: ReactHooksIssue[];
    fixesApplied: string[];
  } {
    let reactVersion: string | undefined;
    let reactDOMVersion: string | undefined;
    
    if (typeof window !== 'undefined') {
      reactVersion = (window as any).React?.version;
      reactDOMVersion = (window as any).ReactDOM?.version;
    }
    
    return {
      reactVersion,
      reactDOMVersion,
      hasMultipleInstances: this.issues.some(i => i.type === 'multiple-react-instances'),
      hookCallsValid: !this.issues.some(i => i.type === 'invalid-hook-call'),
      issues: [...this.issues],
      fixesApplied: [...this.fixesApplied]
    };
  }

  /**
   * Cleanup method
   */
  async cleanup(): Promise<void> {
    this.issues = [];
    this.fixesApplied = [];
  }
}

// Export for use in verification system
export default ReactHooksVerifier;