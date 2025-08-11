/**
 * Performance monitoring utility for Sistema Ministerial
 * Tracks authentication flow performance and startup times
 */

interface PerformanceMetrics {
  startupTime: number;
  authFlowTime: number;
  profileLoadTime: number;
  timeToInteractive: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private startTimes: Record<string, number> = {};

  constructor() {
    // Mark app startup time
    this.startTimer('startup');
    
    // Monitor page load performance
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.endTimer('startup');
        this.logPerformanceMetrics();
      });
    }
  }

  startTimer(name: string): void {
    this.startTimes[name] = performance.now();
  }

  endTimer(name: string): number {
    const startTime = this.startTimes[name];
    if (!startTime) {
      console.warn(`⚠️ Timer '${name}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    delete this.startTimes[name];

    // Store metrics
    switch (name) {
      case 'startup':
        this.metrics.startupTime = duration;
        break;
      case 'authFlow':
        this.metrics.authFlowTime = duration;
        break;
      case 'profileLoad':
        this.metrics.profileLoadTime = duration;
        break;
      case 'timeToInteractive':
        this.metrics.timeToInteractive = duration;
        break;
    }

    // Log in development only
    if (import.meta.env.DEV) {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  getMemoryUsage(): number | undefined {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return undefined;
  }

  logPerformanceMetrics(): void {
    this.metrics.memoryUsage = this.getMemoryUsage();

    // Only log in development or when explicitly enabled
    const isDev = import.meta.env.DEV;
    const isDebugEnabled = typeof window !== 'undefined' && localStorage.getItem('debug-performance') === 'true';

    if (isDev || isDebugEnabled) {
      console.group('📊 Performance Metrics - Sistema Ministerial');
      console.log('🚀 Startup Time:', `${this.metrics.startupTime?.toFixed(2) || 'N/A'}ms`);
      console.log('🔐 Auth Flow Time:', `${this.metrics.authFlowTime?.toFixed(2) || 'N/A'}ms`);
      console.log('👤 Profile Load Time:', `${this.metrics.profileLoadTime?.toFixed(2) || 'N/A'}ms`);
      console.log('⚡ Time to Interactive:', `${this.metrics.timeToInteractive?.toFixed(2) || 'N/A'}ms`);
      console.log('🧠 Memory Usage:', `${this.metrics.memoryUsage?.toFixed(2) || 'N/A'}MB`);
      console.groupEnd();

      // Performance assessment
      this.assessPerformance();
    }
  }

  private assessPerformance(): void {
    const { startupTime, authFlowTime, memoryUsage } = this.metrics;

    console.group('🎯 Performance Assessment');

    // Startup time assessment
    if (startupTime) {
      if (startupTime < 1500) {
        console.log('✅ Startup Time: Excellent (<1.5s)');
      } else if (startupTime < 2500) {
        console.log('⚠️ Startup Time: Good (1.5-2.5s)');
      } else {
        console.log('❌ Startup Time: Needs Optimization (>2.5s)');
      }
    }

    // Auth flow assessment
    if (authFlowTime) {
      if (authFlowTime < 1000) {
        console.log('✅ Auth Flow: Excellent (<1s)');
      } else if (authFlowTime < 2000) {
        console.log('⚠️ Auth Flow: Good (1-2s)');
      } else {
        console.log('❌ Auth Flow: Needs Optimization (>2s)');
      }
    }

    // Memory usage assessment
    if (memoryUsage) {
      if (memoryUsage < 45) {
        console.log('✅ Memory Usage: Excellent (<45MB)');
      } else if (memoryUsage < 60) {
        console.log('⚠️ Memory Usage: Good (45-60MB)');
      } else {
        console.log('❌ Memory Usage: High (>60MB)');
      }
    }

    console.groupEnd();
  }

  getMetrics(): PerformanceMetrics {
    return {
      startupTime: this.metrics.startupTime || 0,
      authFlowTime: this.metrics.authFlowTime || 0,
      profileLoadTime: this.metrics.profileLoadTime || 0,
      timeToInteractive: this.metrics.timeToInteractive || 0,
      memoryUsage: this.metrics.memoryUsage
    };
  }

  // Static method to create global instance
  static createGlobalInstance(): PerformanceMonitor {
    if (typeof window !== 'undefined') {
      (window as any).__performanceMonitor = new PerformanceMonitor();
      return (window as any).__performanceMonitor;
    }
    return new PerformanceMonitor();
  }
}

// Create global instance for easy access
export const performanceMonitor = PerformanceMonitor.createGlobalInstance();

// Export utility functions
export const startTimer = (name: string) => performanceMonitor.startTimer(name);
export const endTimer = (name: string) => performanceMonitor.endTimer(name);
export const logMetrics = () => performanceMonitor.logPerformanceMetrics();

export default PerformanceMonitor;
