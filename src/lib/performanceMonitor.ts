interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  apiCalls: number
  cacheHits: number
  cacheMisses: number
  memoryUsage: number
  networkRequests: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    memoryUsage: 0,
    networkRequests: 0
  }

  private startTime = Date.now()
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
      this.trackPageLoad()
    }
  }

  private initializeObservers() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      // Navigation timing
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.metrics.loadTime = navEntry.loadEventEnd - navEntry.fetchStart
          }
        })
      })
      navObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navObserver)

      // Resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name.includes('/api/')) {
            this.metrics.apiCalls++
            this.metrics.networkRequests++
          }
        })
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.renderTime = lastEntry.startTime
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)
    } catch (error) {
      console.warn('Performance monitoring setup failed:', error)
    }
  }

  private trackPageLoad() {
    if (typeof window === 'undefined') return
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.updateMemoryUsage()
        this.logMetrics()
      }, 1000)
    })
  }

  trackCacheHit() {
    this.metrics.cacheHits++
  }

  trackCacheMiss() {
    this.metrics.cacheMisses++
  }

  trackApiCall() {
    this.metrics.apiCalls++
  }

  private updateMemoryUsage() {
    if (typeof window === 'undefined' || !('performance' in window)) return
    
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
    }
  }

  getMetrics(): PerformanceMetrics {
    this.updateMemoryUsage()
    return { ...this.metrics }
  }

  getCacheEfficiency(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses
    return total > 0 ? (this.metrics.cacheHits / total) * 100 : 0
  }

  private logMetrics() {
    return
  }

  async trackFirebaseUsage() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
    
    const usage = {
      reads: this.metrics.apiCalls * 0.8,
      writes: this.metrics.apiCalls * 0.2,
      timestamp: Date.now()
    }

    try {
      const dailyUsage = JSON.parse(localStorage.getItem('firebase-usage') || '[]')
      dailyUsage.push(usage)
      
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
      const filteredUsage = dailyUsage.filter((u: any) => u.timestamp > oneDayAgo)
      
      localStorage.setItem('firebase-usage', JSON.stringify(filteredUsage))

      const totalReads = filteredUsage.reduce((sum: number, u: any) => sum + u.reads, 0)
      const totalWrites = filteredUsage.reduce((sum: number, u: any) => sum + u.writes, 0)

      if (totalReads > 40000) {
        console.warn('Firebase read quota warning:', totalReads)
      }
      if (totalWrites > 16000) {
        console.warn('Firebase write quota warning:', totalWrites)
      }
    } catch (error) {
      console.warn('Firebase usage tracking failed:', error)
    }
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect())
  }
}

let performanceMonitorInstance: PerformanceMonitor | null = null

if (typeof window !== 'undefined') {
  performanceMonitorInstance = new PerformanceMonitor()
}

export const performanceMonitor = performanceMonitorInstance

// React hook a teljesítmény követéshez
export function usePerformanceMonitor() {
  const trackCacheHit = () => performanceMonitor?.trackCacheHit()
  const trackCacheMiss = () => performanceMonitor?.trackCacheMiss()
  const trackApiCall = () => performanceMonitor?.trackApiCall()
  const getMetrics = () => performanceMonitor?.getMetrics() || {
    loadTime: 0,
    renderTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    memoryUsage: 0,
    networkRequests: 0
  }
  const getCacheEfficiency = () => performanceMonitor?.getCacheEfficiency() || 0

  return {
    trackCacheHit,
    trackCacheMiss,
    trackApiCall,
    getMetrics,
    getCacheEfficiency
  }
}