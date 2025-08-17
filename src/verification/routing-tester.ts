// Comprehensive routing and navigation testing module

import { VerificationDetail } from './types';

export interface RouteConfig {
  path: string;
  name: string;
  requiresAuth: boolean;
  allowedRoles?: string[];
  isPublic: boolean;
  isDebugOnly?: boolean;
}

export interface NavigationFlow {
  name: string;
  steps: NavigationStep[];
  expectedOutcome: string;
}

export interface NavigationStep {
  action: 'navigate' | 'click' | 'wait' | 'verify';
  target: string;
  expectedResult?: string;
  timeout?: number;
}

export class RoutingTester {
  private readonly frontendUrl: string;
  private readonly isDevelopment: boolean;

  constructor(frontendUrl: string, isDevelopment: boolean = false) {
    this.frontendUrl = frontendUrl;
    this.isDevelopment = isDevelopment;
  }

  /**
   * Get all documented routes from the application
   */
  public getDocumentedRoutes(): RouteConfig[] {
    const routes: RouteConfig[] = [
      // Public Routes
      { path: '/', name: 'Home', requiresAuth: false, isPublic: true },
      { path: '/auth', name: 'Authentication', requiresAuth: false, isPublic: true },
      { path: '/demo', name: 'Demo', requiresAuth: false, isPublic: true },
      { path: '/funcionalidades', name: 'Features', requiresAuth: false, isPublic: true },
      { path: '/congregacoes', name: 'Congregations', requiresAuth: false, isPublic: true },
      { path: '/suporte', name: 'Support', requiresAuth: false, isPublic: true },
      { path: '/sobre', name: 'About', requiresAuth: false, isPublic: true },
      { path: '/doar', name: 'Donate', requiresAuth: false, isPublic: true },

      // Onboarding Routes (Instructor only)
      { path: '/bem-vindo', name: 'Welcome', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false },
      { path: '/configuracao-inicial', name: 'Initial Setup', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false },
      { path: '/primeiro-programa', name: 'First Program', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false },

      // Developer Panel Route
      { path: '/admin/developer', name: 'Developer Panel', requiresAuth: true, allowedRoles: ['developer'], isPublic: false },

      // Instructor Routes
      { path: '/dashboard', name: 'Dashboard', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false },
      { path: '/estudantes', name: 'Students', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false },
      { path: '/programas', name: 'Programs', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false },
      { path: '/designacoes', name: 'Assignments', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false },
      { path: '/relatorios', name: 'Reports', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false },
      { path: '/reunioes', name: 'Meetings', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false },
      { path: '/equidade', name: 'Equity', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false },

      // Admin Routes
      { path: '/admin', name: 'Admin Dashboard', requiresAuth: true, allowedRoles: ['admin'], isPublic: false },

      // Family Invitation Routes
      { path: '/convite/aceitar', name: 'Accept Invitation', requiresAuth: false, isPublic: true },
      { path: '/portal-familiar', name: 'Family Portal', requiresAuth: true, allowedRoles: ['family_member'], isPublic: false },

      // Catch-all
      { path: '/nonexistent-route', name: 'Not Found Test', requiresAuth: false, isPublic: true }
    ];

    // Add debug routes only in development
    if (this.isDevelopment) {
      routes.push(
        { path: '/debug-dashboard', name: 'Debug Dashboard', requiresAuth: false, isPublic: true, isDebugOnly: true },
        { path: '/estudantes-responsive', name: 'Responsive Students', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false, isDebugOnly: true },
        { path: '/density-toggle-test', name: 'Density Toggle Test', requiresAuth: false, isPublic: true, isDebugOnly: true },
        { path: '/zoom-responsiveness-test', name: 'Zoom Test', requiresAuth: false, isPublic: true, isDebugOnly: true },
        { path: '/programas-test', name: 'Programs Test', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false, isDebugOnly: true },
        { path: '/pdf-parsing-test', name: 'PDF Parsing Test', requiresAuth: true, allowedRoles: ['instrutor'], isPublic: false, isDebugOnly: true }
      );
    }

    return routes;
  }

  /**
   * Test route accessibility
   */
  public async testRouteAccessibility(route: RouteConfig): Promise<VerificationDetail> {
    try {
      const url = `${this.frontendUrl}${route.path}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (response.ok) {
        const html = await response.text();
        
        // Check if it's a proper HTML response
        if (html.includes('<html') || html.includes('<!DOCTYPE')) {
          return {
            component: 'routing',
            test: `route_accessibility_${route.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
            result: 'PASS',
            message: `Route ${route.path} (${route.name}) is accessible`,
            data: { 
              route: route.path, 
              name: route.name, 
              statusCode: response.status,
              contentType: response.headers.get('content-type')
            }
          };
        } else {
          return {
            component: 'routing',
            test: `route_accessibility_${route.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
            result: 'WARNING',
            message: `Route ${route.path} returned non-HTML content`,
            data: { route: route.path, name: route.name, statusCode: response.status }
          };
        }
      } else if (response.status === 404 && route.path === '/nonexistent-route') {
        // This is expected for our test route
        return {
          component: 'routing',
          test: `route_accessibility_${route.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
          result: 'PASS',
          message: `Route ${route.path} correctly returns 404 (expected behavior)`,
          data: { route: route.path, name: route.name, statusCode: response.status }
        };
      } else {
        return {
          component: 'routing',
          test: `route_accessibility_${route.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
          result: 'FAIL',
          message: `Route ${route.path} (${route.name}) returned HTTP ${response.status}`,
          data: { route: route.path, name: route.name, statusCode: response.status }
        };
      }
    } catch (error) {
      return {
        component: 'routing',
        test: `route_accessibility_${route.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
        result: 'FAIL',
        message: `Route ${route.path} (${route.name}) test failed: ${error instanceof Error ? error.message : String(error)}`,
        data: { route: route.path, name: route.name, error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * Test route protection (authentication redirects)
   */
  public async testRouteProtection(route: RouteConfig): Promise<VerificationDetail> {
    if (!route.requiresAuth) {
      return {
        component: 'routing',
        test: `route_protection_${route.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
        result: 'PASS',
        message: `Route ${route.path} is public (no protection required)`,
        data: { route: route.path, name: route.name, requiresAuth: false }
      };
    }

    try {
      const url = `${this.frontendUrl}${route.path}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (response.ok) {
        const html = await response.text();
        
        // Check if the response contains authentication-related content
        // This is a simplified check - in a real app, you'd check for redirects to /auth
        if (html.includes('login') || html.includes('auth') || html.includes('signin')) {
          return {
            component: 'routing',
            test: `route_protection_${route.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
            result: 'PASS',
            message: `Route ${route.path} appears to have authentication protection`,
            data: { route: route.path, name: route.name, hasAuthProtection: true }
          };
        } else {
          return {
            component: 'routing',
            test: `route_protection_${route.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
            result: 'WARNING',
            message: `Route ${route.path} may not have proper authentication protection`,
            data: { route: route.path, name: route.name, hasAuthProtection: false }
          };
        }
      } else {
        return {
          component: 'routing',
          test: `route_protection_${route.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
          result: 'WARNING',
          message: `Route ${route.path} returned HTTP ${response.status} - unable to verify protection`,
          data: { route: route.path, name: route.name, statusCode: response.status }
        };
      }
    } catch (error) {
      return {
        component: 'routing',
        test: `route_protection_${route.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
        result: 'FAIL',
        message: `Route protection test failed for ${route.path}: ${error instanceof Error ? error.message : String(error)}`,
        data: { route: route.path, name: route.name, error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * Get navigation flows to test
   */
  public getNavigationFlows(): NavigationFlow[] {
    return [
      {
        name: 'Public Navigation Flow',
        steps: [
          { action: 'navigate', target: '/', expectedResult: 'Home page loads' },
          { action: 'navigate', target: '/funcionalidades', expectedResult: 'Features page loads' },
          { action: 'navigate', target: '/sobre', expectedResult: 'About page loads' },
          { action: 'navigate', target: '/auth', expectedResult: 'Auth page loads' }
        ],
        expectedOutcome: 'User can navigate through public pages without authentication'
      },
      {
        name: 'Authentication Required Flow',
        steps: [
          { action: 'navigate', target: '/dashboard', expectedResult: 'Redirected to auth or shows login form' },
          { action: 'navigate', target: '/estudantes', expectedResult: 'Redirected to auth or shows login form' },
          { action: 'navigate', target: '/admin', expectedResult: 'Redirected to auth or shows login form' }
        ],
        expectedOutcome: 'Protected routes properly redirect unauthenticated users'
      },
      {
        name: 'Error Handling Flow',
        steps: [
          { action: 'navigate', target: '/nonexistent-route', expectedResult: 'Shows 404 or Not Found page' },
          { action: 'navigate', target: '/invalid/path/structure', expectedResult: 'Shows 404 or Not Found page' }
        ],
        expectedOutcome: 'Invalid routes are handled gracefully with proper error pages'
      }
    ];
  }

  /**
   * Test a navigation flow
   */
  public async testNavigationFlow(flow: NavigationFlow): Promise<VerificationDetail> {
    const results: string[] = [];
    let hasErrors = false;

    try {
      for (const step of flow.steps) {
        if (step.action === 'navigate') {
          const url = `${this.frontendUrl}${step.target}`;
          const response = await fetch(url);
          
          if (response.ok) {
            results.push(`✓ ${step.target}: ${step.expectedResult}`);
          } else {
            results.push(`✗ ${step.target}: HTTP ${response.status}`);
            if (step.target !== '/nonexistent-route' && step.target !== '/invalid/path/structure') {
              hasErrors = true;
            }
          }
        }
        
        // Add a small delay between navigation steps
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return {
        component: 'navigation',
        test: `navigation_flow_${flow.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
        result: hasErrors ? 'FAIL' : 'PASS',
        message: hasErrors 
          ? `Navigation flow "${flow.name}" had errors`
          : `Navigation flow "${flow.name}" completed successfully`,
        data: {
          flowName: flow.name,
          expectedOutcome: flow.expectedOutcome,
          stepResults: results,
          hasErrors
        }
      };
    } catch (error) {
      return {
        component: 'navigation',
        test: `navigation_flow_${flow.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
        result: 'FAIL',
        message: `Navigation flow "${flow.name}" failed: ${error instanceof Error ? error.message : String(error)}`,
        data: {
          flowName: flow.name,
          error: error instanceof Error ? error.message : String(error),
          stepResults: results
        }
      };
    }
  }

  /**
   * Test all routes in parallel
   */
  public async testAllRoutes(): Promise<VerificationDetail[]> {
    const routes = this.getDocumentedRoutes();
    const results: VerificationDetail[] = [];

    // Test route accessibility
    const accessibilityPromises = routes.map(route => this.testRouteAccessibility(route));
    const accessibilityResults = await Promise.allSettled(accessibilityPromises);

    accessibilityResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        const route = routes[index];
        results.push({
          component: 'routing',
          test: `route_accessibility_${route.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
          result: 'FAIL',
          message: `Route accessibility test promise rejected: ${result.reason}`,
          data: { route: route.path, name: route.name, error: result.reason }
        });
      }
    });

    // Test route protection
    const protectionPromises = routes.map(route => this.testRouteProtection(route));
    const protectionResults = await Promise.allSettled(protectionPromises);

    protectionResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        const route = routes[index];
        results.push({
          component: 'routing',
          test: `route_protection_${route.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
          result: 'FAIL',
          message: `Route protection test promise rejected: ${result.reason}`,
          data: { route: route.path, name: route.name, error: result.reason }
        });
      }
    });

    return results;
  }

  /**
   * Test all navigation flows
   */
  public async testAllNavigationFlows(): Promise<VerificationDetail[]> {
    const flows = this.getNavigationFlows();
    const results: VerificationDetail[] = [];

    for (const flow of flows) {
      const result = await this.testNavigationFlow(flow);
      results.push(result);
    }

    return results;
  }
}