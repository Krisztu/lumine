import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { optimizedCache } from '@/lib/optimizedDataCache'

const MUSIC_CACHE_KEY = 'music_requests'
const CACHE_DURATION = 2 * 60 * 1000
const RATE_LIMIT_KEY = 'music_rate_limit'
const MAX_REQUESTS_PER_HOUR = 5

export async function POST(request: NextRequest) {
  try {
    const { url, platform, userId, userName, userClass } = await request.json()
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'

    // URL validáció
    if (!url || typeof url !== 'string' || url.length > 500) {
      return NextResponse.json({ error: 'Érvényes URL szükséges (max 500 karakter)' }, { status: 400 })
    }

    const rateLimitKey = `${RATE_LIMIT_KEY}_${userId || clientIP}`
    const currentRequests = await optimizedCache.get(rateLimitKey, async () => 0, true, 3600000)
    
    if (currentRequests >= MAX_REQUESTS_PER_HOUR) {
      return NextResponse.json({ error: 'Túl sok kérés. Próbálja újra 1 óra múlva.' }, { status: 429 })
    }

    // Platform detektálás
    const detectedPlatform = detectPlatform(url)
    
    // Input sanitization
    const sanitizedData = {
      url: url.trim(),
      platform: platform || detectedPlatform,
      userId: (userId || 'anonymous').substring(0, 50),
      userName: (userName || 'Névtelen diák').trim().substring(0, 100),
      userClass: (userClass || 'N/A').trim().substring(0, 10),
      createdAt: new Date().toISOString(),
      title: await extractTitle(url, detectedPlatform),
      thumbnail: await extractThumbnail(url, detectedPlatform)
    }

    const docRef = await db.collection('musicRequests').add(sanitizedData)
    
    // Rate limit frissítése
    optimizedCache.set(rateLimitKey, currentRequests + 1, 3600000)
    
    optimizedCache.invalidate(MUSIC_CACHE_KEY)

    return NextResponse.json({ id: docRef.id, ...sanitizedData })
  } catch (error) {
    console.error('Music POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült beküldeni a zenei kérést' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25')
    const useCache = searchParams.get('cache') !== 'false'
    
    return optimizedCache.get(
      MUSIC_CACHE_KEY,
      async () => {
        const snapshot = await db.collection('musicRequests')
          .orderBy('createdAt', 'desc')
          .limit(Math.min(limit, 50))
          .get()

        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      },
      false,
      useCache ? CACHE_DURATION : 0
    ).then((requests: any) => NextResponse.json(requests))
  } catch (error) {
    console.error('Music GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni a zenei kéréseket' }, { status: 500 })
  }
}

function detectPlatform(url: string): string {
  if (url.includes('spotify.com')) return 'spotify'
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('music.youtube.com')) return 'youtube'
  if (url.includes('soundcloud.com')) return 'soundcloud'
  return 'other'
}

async function extractTitle(url: string, platform: string): Promise<string> {
  try {
    if (platform === 'youtube') {
      const videoId = extractYouTubeId(url)
      return `YouTube Video ${videoId}`
    }
    return 'Zene kérés'
  } catch {
    return 'Zene kérés'
  }
}

async function extractThumbnail(url: string, platform: string): Promise<string | null> {
  try {
    if (platform === 'youtube') {
      const videoId = extractYouTubeId(url)
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    }
    return null
  } catch {
    return null
  }
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  return match ? match[1] : ''
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userRole = request.headers.get('x-user-role')

    if (!id) {
      return NextResponse.json({ error: 'Zenei kérés azonosító szükséges' }, { status: 400 })
    }

    if (userRole !== 'dj' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Nincs jogosultsága zenei kérés törléséhez' }, { status: 403 })
    }

    const docRef = db.collection('musicRequests').doc(id)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Zenei kérés nem található' }, { status: 404 })
    }

    await docRef.delete()

    optimizedCache.invalidate(MUSIC_CACHE_KEY)

    return NextResponse.json({ success: true, message: 'Zenei kérés sikeresen törölve' })
  } catch (error) {
    console.error('Music DELETE Error:', error)
    return NextResponse.json({ error: 'Nem sikerült törölni a zenei kérést' }, { status: 500 })
  }
}