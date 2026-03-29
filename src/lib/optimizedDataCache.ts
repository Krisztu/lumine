import { collection, getDocs, query, where, onSnapshot, Unsubscribe, limit, orderBy, startAfter, DocumentSnapshot } from 'firebase/firestore'
import { db } from './firebase'

interface CacheEntry<T> {
  data: T
  timestamp: number
  subscribers: Set<(data: T) => void>
  etag?: string
}

interface PaginationState {
  lastDoc?: DocumentSnapshot
  hasMore: boolean
  loading: boolean
}

class OptimizedDataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private unsubscribers = new Map<string, Unsubscribe>()
  private readonly CACHE_DURATION = 10 * 60 * 1000
  private readonly MAX_CACHE_SIZE = 100
  private readonly BATCH_SIZE = 25
  private paginationStates = new Map<string, PaginationState>()

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    useRealtime = false,
    cacheDuration?: number
  ): Promise<T> {
    const cached = this.cache.get(key)
    const now = Date.now()
    const duration = cacheDuration || this.CACHE_DURATION

    if (cached && now - cached.timestamp < duration && cacheDuration !== 0) {
      return cached.data as T
    }

    if (useRealtime && !this.unsubscribers.has(key)) {
      this.setupRealtimeListener(key, fetcher)
    }

    try {
      const data = await fetcher()
      if (cacheDuration !== 0) {
        this.set(key, data)
      }
      return data
    } catch (error) {
      if (cached) {
        return cached.data as T
      }
      throw error
    }
  }

  // Paginated lekérdezések optimalizálása
  async getPaginated<T>(
    key: string,
    collectionName: string,
    constraints: any[] = [],
    pageSize = this.BATCH_SIZE
  ): Promise<{ data: T[], hasMore: boolean, loadMore: () => Promise<T[]> }> {
    const paginationKey = `${key}_pagination`
    let state = this.paginationStates.get(paginationKey) || {
      hasMore: true,
      loading: false
    }

    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return {
        data: cached.data as T[],
        hasMore: state.hasMore,
        loadMore: () => this.loadMorePaginated(key, collectionName, constraints, pageSize)
      }
    }

    // Első oldal betöltése
    let q = query(collection(db, collectionName), ...constraints, limit(pageSize))
    
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[]
    
    state = {
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize,
      loading: false
    }
    
    this.paginationStates.set(paginationKey, state)
    this.set(key, data)

    return {
      data,
      hasMore: state.hasMore,
      loadMore: () => this.loadMorePaginated(key, collectionName, constraints, pageSize)
    }
  }

  private async loadMorePaginated<T>(
    key: string,
    collectionName: string,
    constraints: any[],
    pageSize: number
  ): Promise<T[]> {
    const paginationKey = `${key}_pagination`
    const state = this.paginationStates.get(paginationKey)
    
    if (!state || !state.hasMore || state.loading) {
      return []
    }

    state.loading = true
    this.paginationStates.set(paginationKey, state)

    try {
      let q = query(
        collection(db, collectionName),
        ...constraints,
        startAfter(state.lastDoc),
        limit(pageSize)
      )

      const snapshot = await getDocs(q)
      const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[]

      const existingData = this.cache.get(key)?.data || []
      const updatedData = [...existingData, ...newData]
      
      this.set(key, updatedData)

      state.lastDoc = snapshot.docs[snapshot.docs.length - 1]
      state.hasMore = snapshot.docs.length === pageSize
      state.loading = false
      this.paginationStates.set(paginationKey, state)

      return newData
    } catch (error) {
      state.loading = false
      this.paginationStates.set(paginationKey, state)
      throw error
    }
  }

  set<T>(key: string, data: T): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestEntries()
    }

    const existing = this.cache.get(key)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      subscribers: existing?.subscribers || new Set()
    }
    this.cache.set(key, entry)
    
    entry.subscribers.forEach(callback => callback(data))
  }

  async batchGet<T>(keys: string[], fetchers: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = []
    const uncachedIndices: number[] = []
    const uncachedFetchers: (() => Promise<T>)[] = []

    keys.forEach((key, index) => {
      const cached = this.cache.get(key)
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        results[index] = cached.data as T
      } else {
        uncachedIndices.push(index)
        uncachedFetchers.push(fetchers[index])
      }
    })

    if (uncachedFetchers.length > 0) {
      const uncachedResults = await Promise.all(uncachedFetchers.map(f => f()))
      
      uncachedIndices.forEach((originalIndex, uncachedIndex) => {
        const data = uncachedResults[uncachedIndex]
        results[originalIndex] = data
        this.set(keys[originalIndex], data)
      })
    }

    return results
  }

  subscribe<T>(key: string, callback: (data: T) => void): () => void {
    const entry = this.cache.get(key)
    if (entry) {
      entry.subscribers.add(callback)
      callback(entry.data as T)
    }

    return () => {
      const entry = this.cache.get(key)
      if (entry) {
        entry.subscribers.delete(callback)
      }
    }
  }

  private setupRealtimeListener<T>(key: string, fetcher: () => Promise<T>): void {
    return
  }

  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries()) as [string, CacheEntry<any>][]
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    const toRemove = Math.floor(entries.length * 0.2)
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i]
      this.invalidate(key)
    }
  }

  invalidate(key: string): void {
    this.cache.delete(key)
    this.paginationStates.delete(`${key}_pagination`)
    const unsub = this.unsubscribers.get(key)
    if (unsub) {
      unsub()
      this.unsubscribers.delete(key)
    }
  }

  clear(): void {
    this.cache.clear()
    this.paginationStates.clear()
    this.unsubscribers.forEach(unsub => unsub())
    this.unsubscribers.clear()
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      activeListeners: this.unsubscribers.size,
      paginationStates: this.paginationStates.size,
      memoryUsage: JSON.stringify(Array.from(this.cache.values())).length
    }
  }
}

export const optimizedCache = new OptimizedDataCache()

export async function getCachedUsers(role?: string, useCache = false) {
  const key = role ? `users_${role}` : 'users_all'
  
  if (!useCache) {
    optimizedCache.invalidate(key)
  }

  return optimizedCache.get(key, async () => {
    const constraints = role ? [where('role', '==', role)] : []
    const result = await optimizedCache.getPaginated(key, 'users', constraints)
    return result.data
  }, false, useCache ? undefined : 0)
}

export async function getCachedLessons(userId?: string, useCache = true) {
  const key = userId ? `lessons_${userId}` : 'lessons_all'
  
  if (!useCache) {
    optimizedCache.invalidate(key)
  }

  return optimizedCache.get(key, async () => {
    const constraints = userId ? [where('userId', '==', userId)] : []
    const result = await optimizedCache.getPaginated(key, 'lessons', constraints)
    return result.data
  })
}

export async function getCachedGrades(studentId?: string, useCache = true) {
  const key = studentId ? `grades_${studentId}` : 'grades_all'
  
  if (!useCache) {
    optimizedCache.invalidate(key)
  }

  return optimizedCache.get(key, async () => {
    const constraints = studentId 
      ? [where('studentId', '==', studentId), orderBy('date', 'desc')] 
      : [orderBy('date', 'desc')]
    const result = await optimizedCache.getPaginated(key, 'grades', constraints)
    return result.data
  })
}

export async function getCachedHomework(classId?: string, useCache = true) {
  const key = classId ? `homework_${classId}` : 'homework_all'
  
  if (!useCache) {
    optimizedCache.invalidate(key)
  }

  return optimizedCache.get(key, async () => {
    const constraints = classId 
      ? [where('className', '==', classId), orderBy('dueDate', 'desc')] 
      : [orderBy('dueDate', 'desc')]
    const result = await optimizedCache.getPaginated(key, 'homework', constraints)
    return result.data
  })
}

export function invalidateUserRelatedData(userId?: string) {
  if (userId) {
    optimizedCache.invalidate(`users_${userId}`)
    optimizedCache.invalidate(`lessons_${userId}`)
    optimizedCache.invalidate(`grades_${userId}`)
  }
  optimizedCache.invalidate('users_all')
}

export function invalidateClassRelatedData(classId?: string) {
  if (classId) {
    optimizedCache.invalidate(`homework_${classId}`)
    optimizedCache.invalidate(`lessons_${classId}`)
  }
}