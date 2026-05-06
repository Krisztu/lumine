// Service Worker a cache optimalizáláshoz
const CACHE_NAME = 'lumine-app-v1.2.0'
const STATIC_CACHE = 'lumine-static-v1.2.0'
const API_CACHE = 'lumine-api-v1.2.0'

// Cache-elendő statikus fájlok
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/_next/static/css/app/layout.css',
]

// API cache stratégiák
const API_CACHE_STRATEGIES = {
  '/api/users': { strategy: 'staleWhileRevalidate', maxAge: 5 * 60 * 1000 },
  '/api/music': { strategy: 'networkFirst', maxAge: 2 * 60 * 1000 },
  '/api/academic/grades': { strategy: 'cacheFirst', maxAge: 10 * 60 * 1000 },
  '/api/academic/lessons': { strategy: 'cacheFirst', maxAge: 30 * 60 * 1000 },
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting()
    ])
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Régi cache-ek törlése
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== API_CACHE) {
              return caches.delete(cacheName)
            }
          })
        )
      }),
      self.clients.claim()
    ])
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API kérések kezelése
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Statikus fájlok kezelése
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Képek cache-elése
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request))
    return
  }
})

async function handleApiRequest(request) {
  const url = new URL(request.url)
  const cacheStrategy = getCacheStrategy(url.pathname)
  
  switch (cacheStrategy.strategy) {
    case 'networkFirst':
      return networkFirst(request, API_CACHE, cacheStrategy.maxAge)
    case 'cacheFirst':
      return cacheFirst(request, API_CACHE, cacheStrategy.maxAge)
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request, API_CACHE, cacheStrategy.maxAge)
    default:
      return fetch(request)
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Offline fallback
    return new Response('Offline', { status: 503 })
  }
}

async function handleImageRequest(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Placeholder kép offline esetén
    return new Response('', { status: 404 })
  }
}

async function networkFirst(request, cacheName, maxAge) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      const responseToCache = networkResponse.clone()
      
      // Timestamp hozzáadása
      const headers = new Headers(responseToCache.headers)
      headers.set('sw-cache-timestamp', Date.now().toString())
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      })
      
      cache.put(request, modifiedResponse)
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await getCachedResponse(request, cacheName, maxAge)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

async function cacheFirst(request, cacheName, maxAge) {
  const cachedResponse = await getCachedResponse(request, cacheName, maxAge)
  if (cachedResponse) {
    return cachedResponse
  }
  
  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    const cache = await caches.open(cacheName)
    const responseToCache = networkResponse.clone()
    
    const headers = new Headers(responseToCache.headers)
    headers.set('sw-cache-timestamp', Date.now().toString())
    
    const modifiedResponse = new Response(responseToCache.body, {
      status: responseToCache.status,
      statusText: responseToCache.statusText,
      headers: headers
    })
    
    cache.put(request, modifiedResponse)
  }
  return networkResponse
}

async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  const networkPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const headers = new Headers(networkResponse.headers)
      headers.set('sw-cache-timestamp', Date.now().toString())
      
      const modifiedResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers
      })
      
      cache.put(request, modifiedResponse.clone())
    }
    return networkResponse
  }).catch(() => null)
  
  if (cachedResponse) {
    const timestamp = cachedResponse.headers.get('sw-cache-timestamp')
    const isExpired = timestamp && (Date.now() - parseInt(timestamp)) > maxAge
    
    if (!isExpired) {
      return cachedResponse
    }
  }
  
  return networkPromise || cachedResponse || fetch(request)
}

async function getCachedResponse(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  if (!cachedResponse) {
    return null
  }
  
  const timestamp = cachedResponse.headers.get('sw-cache-timestamp')
  if (timestamp && (Date.now() - parseInt(timestamp)) > maxAge) {
    cache.delete(request)
    return null
  }
  
  return cachedResponse
}

function getCacheStrategy(pathname) {
  for (const [pattern, strategy] of Object.entries(API_CACHE_STRATEGIES)) {
    if (pathname.startsWith(pattern)) {
      return strategy
    }
  }
  return { strategy: 'networkFirst', maxAge: 60 * 1000 }
}