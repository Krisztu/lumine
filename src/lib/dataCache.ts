import { collection, getDocs, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore'
import { db } from './firebase'

interface CacheEntry<T> {
  data: T
  timestamp: number
  subscribers: Set<(data: T) => void>
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private unsubscribers = new Map<string, Unsubscribe>()
  private readonly CACHE_DURATION = 5 * 60 * 1000

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    useRealtime = false
  ): Promise<T> {
    const cached = this.cache.get(key)
    const now = Date.now()

    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    if (useRealtime && !this.unsubscribers.has(key)) {
      this.setupRealtimeListener(key, fetcher)
    }

    const data = await fetcher()
    this.set(key, data)
    return data
  }

  set<T>(key: string, data: T): void {
    const existing = this.cache.get(key)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      subscribers: existing?.subscribers || new Set()
    }
    this.cache.set(key, entry)
    
    entry.subscribers.forEach(callback => callback(data))
  }

  subscribe<T>(key: string, callback: (data: T) => void): () => void {
    const entry = this.cache.get(key)
    if (entry) {
      entry.subscribers.add(callback)
      callback(entry.data)
    }

    return () => {
      const entry = this.cache.get(key)
      if (entry) {
        entry.subscribers.delete(callback)
      }
    }
  }

  private setupRealtimeListener(key: string, fetcher: () => Promise<any>): void {
  }

  invalidate(key: string): void {
    this.cache.delete(key)
    const unsub = this.unsubscribers.get(key)
    if (unsub) {
      unsub()
      this.unsubscribers.delete(key)
    }
  }

  clear(): void {
    this.cache.clear()
    this.unsubscribers.forEach(unsub => unsub())
    this.unsubscribers.clear()
  }
}

export const dataCache = new DataCache()

export async function getCachedUsers(role?: string) {
  const key = role ? `users_${role}` : 'users_all'
  return dataCache.get(key, async () => {
    const q = role 
      ? query(collection(db, 'users'), where('role', '==', role))
      : collection(db, 'users')
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
}

export async function getCachedLessons(classId?: string) {
  const key = classId ? `lessons_${classId}` : 'lessons_all'
  return dataCache.get(key, async () => {
    const q = classId
      ? query(collection(db, 'lessons'), where('class', '==', classId))
      : collection(db, 'lessons')
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
}

export async function getCachedGrades(studentId?: string) {
  const key = studentId ? `grades_${studentId}` : 'grades_all'
  return dataCache.get(key, async () => {
    const q = studentId
      ? query(collection(db, 'grades'), where('studentId', '==', studentId))
      : collection(db, 'grades')
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
}

export async function getCachedHomework(classId?: string) {
  const key = classId ? `homework_${classId}` : 'homework_all'
  return dataCache.get(key, async () => {
    const q = classId
      ? query(collection(db, 'homework'), where('class', '==', classId))
      : collection(db, 'homework')
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
}

export function invalidateUsers() {
  dataCache.invalidate('users_all')
  dataCache.invalidate('users_student')
  dataCache.invalidate('users_teacher')
  dataCache.invalidate('users_admin')
}

export function invalidateLessons(classId?: string) {
  if (classId) {
    dataCache.invalidate(`lessons_${classId}`)
  }
  dataCache.invalidate('lessons_all')
}

export function invalidateGrades(studentId?: string) {
  if (studentId) {
    dataCache.invalidate(`grades_${studentId}`)
  }
  dataCache.invalidate('grades_all')
}

export function invalidateHomework(classId?: string) {
  if (classId) {
    dataCache.invalidate(`homework_${classId}`)
  }
  dataCache.invalidate('homework_all')
}
