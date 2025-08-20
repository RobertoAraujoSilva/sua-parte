import { useEffect } from 'react';

interface PerformanceMetrics {
    fcp?: number;
    lcp?: number;
    cls?: number;
    fid?: number;
    ttfb?: number;
}

export const PerformanceMonitor = () => {
    useEffect(() => {
        if (typeof window === 'undefined' || !('performance' in window)) return;

        const metrics: PerformanceMetrics = {};

        // Measure First Contentful Paint (FCP)
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    metrics.fcp = entry.startTime;
                    console.log(`🎨 FCP: ${entry.startTime.toFixed(2)}ms`);
                }
                if (entry.entryType === 'largest-contentful-paint') {
                    metrics.lcp = entry.startTime;
                    console.log(`🖼️ LCP: ${entry.startTime.toFixed(2)}ms`);
                }
                if (entry.entryType === 'layout-shift') {
                    const layoutShiftEntry = entry as PerformanceEntry & {
                        value: number;
                        hadRecentInput: boolean;
                    };
                    if (!layoutShiftEntry.hadRecentInput) {
                        metrics.cls = (metrics.cls || 0) + layoutShiftEntry.value;
                        console.log(`📐 CLS: ${metrics.cls?.toFixed(4)}`);
                    }
                }
                if (entry.entryType === 'first-input') {
                    const firstInputEntry = entry as PerformanceEntry & {
                        processingStart: number;
                    };
                    metrics.fid = firstInputEntry.processingStart - firstInputEntry.startTime;
                    console.log(`👆 FID: ${metrics.fid?.toFixed(2)}ms`);
                }
            }
        });

        // Observe performance entries
        try {
            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });
        } catch (e) {
            console.warn('Performance Observer not supported');
        }

        // Measure Time to First Byte (TTFB)
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
            metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
            console.log(`🚀 TTFB: ${metrics.ttfb.toFixed(2)}ms`);
        }

        // Log bundle size information
        if (performance.getEntriesByType) {
            const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
            const jsResources = resources.filter(r => r.name.includes('.js'));
            const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
            console.log(`📦 Total JS Size: ${(totalJSSize / 1024).toFixed(2)} KB`);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return null;
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
    useEffect(() => {
        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            console.log(`⏱️ Component lifecycle: ${(endTime - startTime).toFixed(2)}ms`);
        };
    }, []);
};