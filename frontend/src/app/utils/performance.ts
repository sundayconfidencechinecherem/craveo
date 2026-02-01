/**
 * Performance monitoring utilities
 */

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.setupObservers();
    }
  }

  private setupObservers() {
    // LCP Observer
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // FID Observer
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries() as FirstInputEntry[];
      entries.forEach((entry) => {
        this.metrics.fid = entry.processingStart - entry.startTime;
      });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // CLS Observer
    const clsObserver = new PerformanceObserver((entryList) => {
      let clsValue = 0;
      entryList.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cls = clsValue;
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    this.observers.push(lcpObserver, fidObserver, clsObserver);
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    // Get TTFB from navigation timing
    if (performance.getEntriesByType('navigation').length > 0) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
    }

    // Get FCP from paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      this.metrics.fcp = fcpEntry.startTime;
    }

    return { ...this.metrics };
  }

  public reportToAnalytics() {
    const metrics = this.getMetrics();
    
    // Send to your analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metrics', metrics);
    }

   
    if (process.env.NODE_ENV === 'development') {
      //console.log('📊 Performance Metrics:', metrics);
    }
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

/**
 * Measure function execution time
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): (...args: Parameters<T>) => ReturnType<T> {
  return function (...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      //console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
