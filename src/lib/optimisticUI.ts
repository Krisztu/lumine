export const optimisticAdd = async <T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  newItem: T,
  apiCall: () => Promise<Response>,
  options: {
    prepend?: boolean
    onSuccess?: () => void
    onError?: (error: any) => void
  } = {}
) => {
  const { prepend = true, onSuccess, onError } = options

  setState(prev => prepend ? [newItem, ...prev] : [...prev, newItem])

  try {
    const response = await apiCall()

    if (!response.ok) {
      throw new Error('API call failed')
    }

    onSuccess?.()
  } catch (error) {
    setState(prev => prev.filter((item: any) => item.id !== (newItem as any).id))
    onError?.(error)
  }
}

export const optimisticDelete = async <T extends { id: string }>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  itemId: string,
  apiCall: () => Promise<Response>,
  options: {
    onSuccess?: () => void
    onError?: (error: any) => void
  } = {}
) => {
  const { onSuccess, onError } = options

  let deletedItem: T | undefined

  setState(prev => {
    deletedItem = prev.find(item => item.id === itemId)
    return prev.filter(item => item.id !== itemId)
  })

  try {
    const response = await apiCall()

    if (!response.ok) {
      throw new Error('Delete failed')
    }

    onSuccess?.()
  } catch (error) {
    if (deletedItem) {
      setState(prev => [...prev, deletedItem as T])
    }
    onError?.(error)
  }
}

export const optimisticUpdate = async <T extends { id: string }>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  itemId: string,
  updates: Partial<T>,
  apiCall: () => Promise<Response>,
  options: {
    onSuccess?: () => void
    onError?: (error: any) => void
  } = {}
) => {
  const { onSuccess, onError } = options

  let originalItem: T | undefined

  setState(prev => {
    return prev.map(item => {
      if (item.id === itemId) {
        originalItem = { ...item }
        return { ...item, ...updates }
      }
      return item
    })
  })

  try {
    const response = await apiCall()

    if (!response.ok) {
      throw new Error('Update failed')
    }

    onSuccess?.()
  } catch (error) {
    if (originalItem) {
      setState(prev => prev.map(item => 
        item.id === itemId ? originalItem as T : item
      ))
    }
    onError?.(error)
  }
}

export const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const createCache = <T>(ttl: number = 300000) => {
  const cache = new Map<string, { data: T; timestamp: number }>()

  return {
    get: (key: string): T | null => {
      const cached = cache.get(key)
      if (!cached) return null

      const now = Date.now()
      if (now - cached.timestamp > ttl) {
        cache.delete(key)
        return null
      }

      return cached.data
    },
    set: (key: string, data: T) => {
      cache.set(key, { data, timestamp: Date.now() })
    },
    clear: (key?: string) => {
      if (key) {
        cache.delete(key)
      } else {
        cache.clear()
      }
    }
  }
}
