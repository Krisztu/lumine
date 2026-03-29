'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { memo, useMemo, useCallback } from 'react'
import { usePerformanceMonitor } from '@/lib/performanceMonitor'

interface RadioTabProps {
  musicRequests: any[]
  musicUrl: string
  setMusicUrl: (url: string) => void
  submitMusicRequest: () => Promise<void>
  loadMusicRequests: () => Promise<void>
  userRole: string
  showAlert: (msg: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => void
}

const getYouTubeVideoId = (url: string): string => {
  if (url.includes('music.youtube.com')) {
    return url.split('v=')[1]?.split('&')[0] || url.split('/').pop() || ''
  }
  return url.split('v=')[1]?.split('&')[0] || url.split('/').pop() || ''
}

// Memoized MusicRequest komponens
const MusicRequestItem = memo(({ request, userRole, onDelete }: {
  request: any
  userRole: string
  onDelete: (id: string, title: string) => void
}) => {
  const handleDelete = useCallback(() => {
    onDelete(request.id, request.title || 'Zene kérés')
  }, [request.id, request.title, onDelete])

  return (
    <div className="glass-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 gap-4 sm:gap-6">
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex-shrink-0 relative overflow-hidden">
          {request.thumbnail ? (
            <img 
              src={request.thumbnail} 
              alt={request.title} 
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate mb-1">
            {request.title || 'Zene kérés'}
          </h3>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            {new Date(request.createdAt).toLocaleDateString('hu-HU')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {request.platform && (
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-center">
              {request.platform}
            </span>
          )}
          {(userRole === 'dj' || userRole === 'admin') && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
              className="text-xs w-full sm:w-auto"
            >
              Törlés
            </Button>
          )}
        </div>
      </div>

      {request.platform === 'spotify' && request.url && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <iframe
            src={`https://open.spotify.com/embed/track/${request.url.split('/track/')[1]?.split('?')[0]}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-lg"
          />
        </div>
      )}

      {request.platform === 'youtube' && request.url && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <iframe
            width="100%"
            height="200"
            src={`https://www.youtube.com/embed/${getYouTubeVideoId(request.url)}`}
            frameBorder="0"
            allowFullScreen
            allow="autoplay; encrypted-media"
            loading="lazy"
            className="rounded-lg"
          />
        </div>
      )}
    </div>
  )
})

MusicRequestItem.displayName = 'MusicRequestItem'

export const RadioTab = memo(function RadioTab({
  musicRequests,
  musicUrl,
  setMusicUrl,
  submitMusicRequest,
  loadMusicRequests,
  userRole,
  showAlert
}: RadioTabProps) {
  const { trackApiCall } = usePerformanceMonitor()

  // Memoized sorted requests
  const sortedRequests = useMemo(() => {
    return [...musicRequests].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [musicRequests])

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (!confirm('Biztosan törlöd ezt a zenét?')) return

    try {
      trackApiCall()
      const response = await fetch(`/api/music?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadMusicRequests()
        showAlert(`Zene törölve: ${title}`, 'success')
      } else {
        const error = await response.json()
        showAlert(`Hiba a törlés során: ${error.error || 'Ismeretlen hiba'}`, 'error')
      }
    } catch (error) {
      showAlert('Hiba történt a törlés során', 'error')
    }
  }, [loadMusicRequests, showAlert, trackApiCall])

  const handleSubmit = useCallback(async () => {
    if (!musicUrl.trim()) {
      showAlert('Kérlek adj meg egy URL-t', 'warning')
      return
    }

    trackApiCall()
    await submitMusicRequest()
  }, [musicUrl, submitMusicRequest, showAlert, trackApiCall])

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMusicUrl(e.target.value)
  }, [setMusicUrl])

  return (
    <>
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center text-sm sm:text-lg">
            
            Zene beküldése
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
          <Input
            placeholder="Zene URL (Spotify, YouTube, stb.)"
            value={musicUrl}
            onChange={handleUrlChange}
            className="text-sm"
          />
          <Button onClick={handleSubmit} className="w-full text-sm">
            Zene beküldése
          </Button>
        </CardContent>
      </Card>

      <div className="glass-panel p-8 rounded-lg">
        <div className="space-y-6">
          {sortedRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Még nincsenek zene kérések
            </div>
          ) : (
            sortedRequests.map((request) => (
              <MusicRequestItem
                key={request.id}
                request={request}
                userRole={userRole}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
})
