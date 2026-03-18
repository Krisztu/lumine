// Szülői adatok cache kezelése a gyorsabb betöltéshez
interface CacheEntry {
  data: any
  timestamp: number
  expiry: number
}

class ParentDataCache {
  private cache = new Map<string, CacheEntry>()
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000 // 5 perc

  set(key: string, data: any, customExpiry?: number): void {
    const expiry = customExpiry || this.DEFAULT_EXPIRY
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  // Speciális metódusok szülői adatokhoz
  getChildData(childId: string): any | null {
    return this.get(`child_${childId}`)
  }

  setChildData(childId: string, data: any): void {
    this.set(`child_${childId}`, data, 3 * 60 * 1000) // 3 perc cache gyermek adatokhoz
  }

  getSubmittedExcuses(childId: string): string[] | null {
    return this.get(`excuses_${childId}`)
  }

  setSubmittedExcuses(childId: string, excuseIds: string[]): void {
    this.set(`excuses_${childId}`, excuseIds, 10 * 60 * 1000) // 10 perc cache igazolásokhoz
  }

  invalidateChildData(childId: string): void {
    this.invalidatePattern(`child_${childId}`)
    this.invalidatePattern(`excuses_${childId}`)
  }
}

export const parentDataCache = new ParentDataCache()