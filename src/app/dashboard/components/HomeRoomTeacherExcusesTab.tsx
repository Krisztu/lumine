'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

interface HomeRoomTeacherExcusesTabProps {
  excuses: any[]
  currentUser: any
  showAlert: (msg: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => void
  loadExcuses: () => Promise<void>
}

export function HomeRoomTeacherExcusesTab({
  excuses,
  currentUser,
  showAlert,
  loadExcuses
}: HomeRoomTeacherExcusesTabProps) {
  const pendingExcuses = excuses.filter(e => e.status === 'pending')

  const handleApprove = async (excuseId: string) => {
    try {
      const response = await fetch('/api/communication/excuses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: excuseId, 
          status: 'approved', 
          reviewedBy: currentUser?.fullName || currentUser?.name 
        })
      })
      if (response.ok) {
        showAlert('Igazolás elfogadva!', 'success')
        loadExcuses()
      }
    } catch (error) {
      showAlert('Hiba történt', 'error')
    }
  }

  const handleReject = async (excuseId: string) => {
    try {
      const response = await fetch('/api/communication/excuses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: excuseId, 
          status: 'rejected', 
          reviewedBy: currentUser?.fullName || currentUser?.name 
        })
      })
      if (response.ok) {
        showAlert('Igazolás elutasítva!', 'success')
        loadExcuses()
      }
    } catch (error) {
      showAlert('Hiba történt', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Függőben lévő igazolások</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingExcuses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nincsenek függőben lévő igazolások.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingExcuses.map(excuse => (
                <div key={excuse.id} className="p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{excuse.studentName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{excuse.excuseType}</div>
                      <div className="text-xs text-gray-500 mt-1">{excuse.absenceIds?.length || 0} hiányzás</div>
                    </div>
                    <Badge className="bg-yellow-500">Függőben</Badge>
                  </div>
                  {excuse.description && (
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 p-2 bg-white/5 rounded">
                      {excuse.description}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(excuse.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Elfogadás
                    </Button>
                    <Button
                      onClick={() => handleReject(excuse.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Elutasítás
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Összes igazolás</CardTitle>
        </CardHeader>
        <CardContent>
          {excuses.length === 0 ? (
            <p className="text-sm text-gray-500">Nincsenek igazolások.</p>
          ) : (
            <div className="space-y-2">
              {excuses.map(excuse => (
                <div key={excuse.id} className={`p-3 rounded-lg border ${excuse.status === 'approved' ? 'bg-green-500/10 border-green-500/30' :
                  excuse.status === 'rejected' ? 'bg-red-500/10 border-red-500/30' :
                    'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{excuse.studentName}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{excuse.excuseType}</div>
                    </div>
                    <Badge className={excuse.status === 'approved' ? 'bg-green-500' : excuse.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}>
                      {excuse.status === 'approved' ? 'Elfogadva' : excuse.status === 'rejected' ? 'Elutasítva' : 'Függőben'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
