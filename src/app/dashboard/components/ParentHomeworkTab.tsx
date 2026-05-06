'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
interface ParentHomeworkTabProps {
  homework: any[]
  homeworkSubmissions: any
  setSelectedHomework: (hw: any) => void
  setShowHomeworkModal: (show: boolean) => void
}

export function ParentHomeworkTab({
  homework,
  homeworkSubmissions,
  setSelectedHomework,
  setShowHomeworkModal
}: ParentHomeworkTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
      {homework.map((hw) => {
        const submission = homeworkSubmissions[hw.id]
        const isOverdue = new Date(hw.dueDate) < new Date()
        const isSubmitted = !!submission

        return (
          <Card key={hw.id} className="border-l-4 border-emerald-500 bg-white/5 hover:bg-white/10 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{hw.title}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {hw.subject} • {hw.teacherName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isSubmitted && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                      Beküldve
                    </Badge>
                  )}
                  {isOverdue && !isSubmitted && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white">
                      Lejárt
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Határidő: {new Date(hw.dueDate).toLocaleDateString('hu-HU')}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedHomework({...hw, submission})
                      setShowHomeworkModal(true)
                    }}
                    className="border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400"
                  >
                    
                    Megtekintés
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {homework.length === 0 && (
        <Card className="border-none shadow-sm">
          <CardContent className="text-center py-8 text-gray-500">
            <p>Jelenleg nincsenek házi feladatok.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}