'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Textarea } from '@/shared/components/ui/textarea'

interface MonthlyBehaviorFormProps {
  students: Array<{ id: string; fullName: string; name: string; class: string }>
  onSubmit: (data: any) => Promise<void>
  onSuccess?: () => void
}

export function MonthlyBehaviorForm({ students, onSubmit, onSuccess }: MonthlyBehaviorFormProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    month: new Date().toISOString().slice(0, 7),
    diligence: '',
    behavior: ''
  })

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.diligence || !formData.behavior) {
      alert('Töltsd ki az összes mezőt!')
      return
    }

    const student = students.find(s => s.id === formData.studentId)
    if (!student) return

    try {
      await onSubmit({
        studentId: formData.studentId,
        studentName: student.fullName || student.name,
        studentClass: student.class,
        month: formData.month,
        diligence: formData.diligence,
        behavior: formData.behavior
      })

      setFormData({
        studentId: '',
        month: new Date().toISOString().slice(0, 7),
        diligence: '',
        behavior: ''
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Hiba:', error)
    }
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Havi szorgalom és magatartás</CardTitle>
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
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.fullName || student.name} ({student.class})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hónap</label>
          <input
            type="month"
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Szorgalom</label>
          <Textarea
            value={formData.diligence}
            onChange={(e) => setFormData({ ...formData, diligence: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            rows={3}
            placeholder="Szorgalom értékelése..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Magatartás</label>
          <Textarea
            value={formData.behavior}
            onChange={(e) => setFormData({ ...formData, behavior: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            rows={3}
            placeholder="Magatartás értékelése..."
          />
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Rögzítés
        </Button>
      </CardContent>
    </Card>
  )
}
