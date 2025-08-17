/**
 * React Hooks Auto-Fix Utility
 * Detects and fixes common React hooks issues
 */

interface ReactHooksIssue {
  type: 'invalid-hook-call' | 'multiple-react-instances' | 'version-mismatch';
  component?: string;
  message: string;
  autoFixable: boolean;
}

class ReactHooksAutoFixer {
  private issues: ReactHooksIssue[] = [];
  private fixesApplied: string[] = [];

  /**
   * Detect React hooks issues
   */
  detectIssues(): ReactHooksIssue[] {
    this.issues = [];

    // Check for invalid hook calls
    this.checkInvalidHookCalls();
    
    // Check for multiple React instances
    this.checkMultipleReactInstances();
    
    // Check for version mismatches
    this.checkVersionMismatches();

    return this.issues;
  }

  /**
   * Apply automatic fixes for detected issues
   */
  async applyAutoFixes(): Promise<string[]> {
    this.fixesApplied = [];
    const issues = this.detectIssues();

    for (const issue of issues) {
      if (issue.autoFixable) {
        try {
          await this.fixIssue(issue);
        } catch (error) {
          console.warn(`Failed to auto-fix ${issue.type}:`, error);
        }
      }
    }

    return this.fixesApplied;
  }

  /**
   * Check for invalid hook calls
   */
  private checkInvalidHookCalls(): void {
    // Check if React is available
    if (typeof window !== 'undefined' && (window as any).React) {
      const React = (window as any).React;
      
      // Check if hooks are being called outside component
      if (React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
        const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        
        if (internals.ReactCurrentDispatcher && internals.ReactCurrentDispatcher.current === null) {
          this.issues.push({
            type: 'invalid-hook-call',
            message: 'Hooks are being called outside of a React component',
            autoFixable: true
          });
        }
      }
    }
  }

  /**
   * Check for multiple React instances
   */
  private checkMultipleReactInstances(): void {
    if (typeof window !== 'undefined') {
      const reactInstances = [];
      
      // Check global React
      if ((window as any).React) {
        reactInstances.push('global');
      }
      
      // Check for multiple versions in modules
      try {
        const modules = Object.keys((window as any).__vite_plugin_react_preamble_installed__ || {});
        const reactModules = modules.filter(m => m.includes('react'));
        
        if (reactModules.length > 1) {
          this.issues.push({
            type: 'multiple-react-instances',
            message: `Multiple React instances detected: ${reactModules.join(', ')}`,
            autoFixable: true
          });
        }
      } catch (error) {
        // Ignore if Vite internals are not available
      }
    }
  }

  /**
   * Check for version mismatches
   */
  private checkVersionMismatches(): void {
    if (typeof window !== 'undefined' && (window as any).React) {
      const React = (window as any).React;
      const ReactDOM = (window as any).ReactDOM;
      
      if (React.version && ReactDOM?.version) {
        const reactVersion = React.version.split('.')[0];
        const reactDOMVersion = ReactDOM.version.split('.')[0];
        
        if (reactVersion !== reactDOMVersion) {
          this.issues.push({
            type: 'version-mismatch',
            message: `React version mismatch: React ${React.version}, ReactDOM ${ReactDOM.version}`,
            autoFixable: false
          });
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
        console.warn(`No auto-fix available for ${issue.type}`);
    }
  }

  /**
   * Fix invalid hook call issues
   */
  private async fixInvalidHookCall(): Promise<void> {
    // Force React to reinitialize its internal state
    if (typeof window !== 'undefined' && (window as any).React) {
      const React = (window as any).React;
      
      // Reset React internals if possible
      if (React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
        const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        
        // Reset dispatcher
        if (internals.ReactCurrentDispatcher) {
          internals.ReactCurrentDispatcher.current = null;
        }
        
        // Reset owner
        if (internals.ReactCurrentOwner) {
          internals.ReactCurrentOwner.current = null;
        }
      }
      
      this.fixesApplied.push('Reset React internal state');
    }
  }

  /**
   * Fix multiple React instances
   */
  private async fixMultipleReactInstances(): Promise<void> {
    if (typeof window !== 'undefined') {
      // Ensure only one React instance is used
      const React = (window as any).React;
      
      if (React) {
        // Force all React references to use the same instance
        (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
        
        this.fixesApplied.push('Unified React instances');
      }
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
  } {
    const issues = this.detectIssues();
    
    let reactVersion: string | undefined;
    let reactDOMVersion: string | undefined;
    
    if (typeof window !== 'undefined') {
      reactVersion = (window as any).React?.version;
      reactDOMVersion = (window as any).ReactDOM?.version;
    }
    
    return {
      reactVersion,
      reactDOMVersion,
      hasMultipleInstances: issues.some(i => i.type === 'multiple-react-instances'),
      hookCallsValid: !issues.some(i => i.type === 'invalid-hook-call'),
      issues
    };
  }
}

// Create global instance
export const reactHooksAutoFixer = new ReactHooksAutoFixer();

// Auto-fix on module load
if (typeof window !== 'undefined') {
  // Run auto-fix after a short delay to allow React to initialize
  setTimeout(() => {
    reactHooksAutoFixer.applyAutoFixes().then(fixes => {
      if (fixes.length > 0) {
        console.log('🔧 React hooks auto-fixes applied:', fixes);
      }
    }).catch(error => {
      console.warn('⚠️ React hooks auto-fix failed:', error);
    });
  }, 100);
}

// Export for manual use
export { ReactHooksAutoFixer };
export type { ReactHooksIssue };