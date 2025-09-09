// 🚀 Configurações de Performance - Sistema Ministerial

export const PERFORMANCE_CONFIG = {
  // Lazy Loading
  LAZY_LOADING: {
    ENABLED: true,
    DELAY: 100, // ms
    THRESHOLD: 0.1, // Intersection Observer threshold
  },

  // Debounce
  DEBOUNCE: {
    SEARCH: 300, // ms
    SCROLL: 100, // ms
    RESIZE: 150, // ms
  },

  // Throttle
  THROTTLE: {
    SCROLL: 16, // ms (60fps)
    RESIZE: 100, // ms
    API_CALLS: 1000, // ms
  },

  // Cache
  CACHE: {
    USER_DATA: 5 * 60 * 1000, // 5 minutos
    SYSTEM_STATS: 2 * 60 * 1000, // 2 minutos
    JW_ORG_DATA: 10 * 60 * 1000, // 10 minutos
  },

  // Bundle Splitting
  BUNDLE_SPLITTING: {
    VENDOR_CHUNK_SIZE: 500 * 1024, // 500KB
    COMPONENT_CHUNK_SIZE: 100 * 1024, // 100KB
  },

  // Image Optimization
  IMAGE_OPTIMIZATION: {
    QUALITY: 85,
    FORMAT: 'webp',
    LAZY_LOADING: true,
    PLACEHOLDER: true,
  },

  // API Optimization
  API_OPTIMIZATION: {
    BATCH_SIZE: 50,
    RETRY_ATTEMPTS: 3,
    TIMEOUT: 10000, // 10s
    CACHE_STRATEGY: 'stale-while-revalidate',
  },

  // Monitoring
  MONITORING: {
    PERFORMANCE_MARKS: true,
    WEB_VITALS: true,
    ERROR_TRACKING: true,
    USER_INTERACTIONS: true,
  },
};

// 🎯 Performance Hooks
export const usePerformanceOptimization = () => {
  const markPerformance = (name: string) => {
    if (PERFORMANCE_CONFIG.MONITORING.PERFORMANCE_MARKS) {
      performance.mark(name);
    }
  };

  const measurePerformance = (name: string, startMark: string, endMark: string) => {
    if (PERFORMANCE_CONFIG.MONITORING.PERFORMANCE_MARKS) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        console.log(`📊 Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }
  };

  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const throttle = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  };

  return {
    markPerformance,
    measurePerformance,
    debounce,
    throttle,
  };
};

// 🌟 Web Vitals Monitoring
export const monitorWebVitals = () => {
  if (typeof window !== 'undefined' && PERFORMANCE_CONFIG.MONITORING.WEB_VITALS) {
    // FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log('📊 FCP:', entry.startTime.toFixed(2), 'ms');
      });
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log('📊 LCP:', entry.startTime.toFixed(2), 'ms');
      });
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // CLS (Cumulative Layout Shift)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('📊 CLS:', clsValue.toFixed(4));
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
};

// 🔧 Bundle Analyzer Helper
export const analyzeBundle = () => {
  if (typeof window !== 'undefined') {
    const resources = performance.getEntriesByType('resource');
    const totalSize = resources.reduce((acc, resource) => {
      if (resource.transferSize) {
        return acc + resource.transferSize;
      }
      return acc;
    }, 0);

    console.log('📦 Bundle Analysis:');
    console.log('Total Resources:', resources.length);
    console.log('Total Size:', (totalSize / 1024 / 1024).toFixed(2), 'MB');
    
    // Top 5 largest resources
    const largestResources = resources
      .filter(r => r.transferSize)
      .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
      .slice(0, 5);

    console.log('Top 5 Largest Resources:');
    largestResources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.name}: ${(resource.transferSize! / 1024).toFixed(2)} KB`);
    });
  }
};
