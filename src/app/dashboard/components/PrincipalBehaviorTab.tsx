'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Textarea } from '@/shared/components/ui/textarea'

interface PrincipalBehaviorTabProps {
  allUsers: Array<{ id: string; fullName: string; name: string; class: string }>
  showAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => void
  onSuccess?: () => void
}

export function PrincipalBehaviorTab({ allUsers, showAlert, onSuccess }: PrincipalBehaviorTabProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'dicseret' as 'dicseret' | 'figyelmeztetés',
    reason: ''
  })

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.reason) {
      showAlert('Töltsd ki az összes mezőt!', 'warning', 'Figyelmeztetés')
      return
    }

    const student = allUsers.find(s => s.id === formData.studentId)
    if (!student) return

    try {
      const response = await fetch('/api/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: formData.studentId,
          studentName: student.fullName || student.name,
          studentClass: student.class,
          type: formData.type,
          level: 'igazgatói',
          description: formData.reason,
          reason: formData.reason
        })
      })

      if (response.ok) {
        showAlert('Viselkedés rögzítve!', 'success', 'Siker')
        setFormData({ studentId: '', type: 'dicseret', reason: '' })
        if (onSuccess) onSuccess()
      } else {
        showAlert('Hiba a rögzítés során', 'error', 'Hiba')
      }
    } catch (error) {
      showAlert('Hiba történt', 'error', 'Hiba')
    }
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle>Igazgatói dicséret/figyelmeztetés</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Diák</label>
          <select
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
          >
            <option value="">Válassz diákot</option>
            {allUsers.filter(u => u.role === 'student' || u.role === 'dj').map(student => (
              <option key={student.id} value={student.id}>
                {student.fullName || student.name} ({student.class})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Típus</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'dicseret' | 'figyelmeztetés' })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
          >
            <option value="dicseret">Dicséret</option>
            <option value="figyelmeztetés">Figyelmeztetés</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Indoklás</label>
          <Textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            rows={3}
            placeholder="Írd le az indoklást..."
          />
        </div>

        <Button
          onClick={handleSubmit}
          className={`w-full ${formData.type === 'dicseret' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {formData.type === 'dicseret' ? '✓' : '⚠'} Rögzítés
        </Button>
      </CardContent>
    </Card>
  )
}
