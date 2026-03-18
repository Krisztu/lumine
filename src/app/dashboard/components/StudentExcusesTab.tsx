'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface StudentExcusesTabProps {
  attendance: any[]
  excuses: any[]
  selectedAbsences: any[]
  setSelectedAbsences: (absences: any[]) => void
  excuseForm: any
  setExcuseForm: (form: any) => void
  currentUser: any
  user: any
  loadExcuses: () => Promise<void>
  showAlert: (msg: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => void
  isTeacher?: boolean
}

export function StudentExcusesTab({
  attendance,
  excuses,
  selectedAbsences,
  setSelectedAbsences,
  excuseForm,
  setExcuseForm,
  currentUser,
  user,
  loadExcuses,
  showAlert
}: StudentExcusesTabProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-lg">Igazolás beküldése</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">Válaszd ki a hiányzásokat, amelyeket igazolni szeretnél, és küldd be az osztályfőnöködnek jóváhagyásra.</p>
          </div>
          {(() => {
            const unexcusedAbsences = attendance.filter(record => !record.excused)
            if (unexcusedAbsences.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500">
                  <p>Nincsenek igazolatlan hiányzásaid.</p>
                </div>
              )
            }
            return (
              <div className="space-y-3">
                {unexcusedAbsences.map(record => (
                  <div key={record.id} className="border border-white/10 rounded-lg p-3 glass-panel">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAbsences.some(a => a.id === record.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAbsences([...selectedAbsences, record])
                          } else {
                            setSelectedAbsences(selectedAbsences.filter(a => a.id !== record.id))
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{record.subject}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(record.date).toLocaleDateString('hu-HU')} - {record.startTime}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )
          })()}
          {selectedAbsences.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Igazolás típusa</label>
                <select
                  value={excuseForm.excuseType}
                  onChange={(e) => setExcuseForm({ ...excuseForm, excuseType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Válassz...</option>
                  <option value="Orvosi igazolás">Orvosi igazolás</option>
                  <option value="Szülői igazolás">Szülői igazolás</option>
                  <option value="Egyéb">Egyéb</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Indoklás</label>
                <Textarea
                  value={excuseForm.description}
                  onChange={(e) => setExcuseForm({ ...excuseForm, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                  placeholder="Írd le az indoklást..."
                />
              </div>
              <Button
                onClick={async () => {
                  if (!excuseForm.excuseType) {
                    showAlert('Válaszd ki az igazolás típusát!', 'warning')
                    return
                  }
                  try {
                    const response = await fetch('/api/excuses', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        studentId: currentUser?.id || user?.uid,
                        studentName: currentUser?.fullName || currentUser?.name,
                        studentClass: currentUser?.class,
                        absenceIds: selectedAbsences.map(a => a.id),
                        excuseType: excuseForm.excuseType,
                        description: excuseForm.description,
                        submittedBy: currentUser?.fullName || currentUser?.name
                      })
                    })
                    if (response.ok) {
                      showAlert('Igazolás sikeresen beküldve!', 'success')
                      setSelectedAbsences([])
                      setExcuseForm({ absenceIds: [], excuseType: '', description: '' })
                      loadExcuses()
                    }
                  } catch (error) {
                    showAlert('Hiba történt', 'error')
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Igazolás beküldése ({selectedAbsences.length} hiányzás)
              </Button>
            </div>
          )}
          <div className="border-t pt-4 mt-6">
            <h4 className="font-semibold mb-3">Beküldött igazolások</h4>
            {excuses.length === 0 ? (
              <p className="text-sm text-gray-500">Még nem küldted be igazolást.</p>
            ) : (
              <div className="space-y-2">
                {excuses.map(excuse => (
                  <div key={excuse.id} className={`p-3 rounded-lg border ${excuse.status === 'approved' ? 'bg-green-500/10 border-green-500/30' :
                    excuse.status === 'rejected' ? 'bg-red-500/10 border-red-500/30' :
                      'bg-yellow-500/10 border-yellow-500/30'
                    }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{excuse.excuseType}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {excuse.absenceIds?.length || 0} hiányzás - {new Date(excuse.submittedAt).toLocaleDateString('hu-HU')}
                        </div>
                      </div>
                      <Badge className={excuse.status === 'approved' ? 'bg-green-500' : excuse.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}>
                        {excuse.status === 'approved' ? 'Elfogadva' : excuse.status === 'rejected' ? 'Elutasítva' : 'Függőben'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
