'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
interface HomeworkTabProps {
  homework: any[]
  homeworkSubmissions: any
  setSelectedHomework: (hw: any) => void
  setShowHomeworkModal: (show: boolean) => void
  setShowSubmissionModal: (show: boolean) => void
}

export function HomeworkTab({
  homework,
  homeworkSubmissions,
  setSelectedHomework,
  setShowHomeworkModal,
  setShowSubmissionModal
}: HomeworkTabProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-6">
      {homework.map((hw) => {
        const submission = homeworkSubmissions[hw.id]
        const isOverdue = new Date(hw.dueDate) < new Date()
        const isSubmitted = !!submission

        return (
          <Card key={hw.id} className="border-l-4 border-emerald-500 bg-white/5 hover:bg-white/10 transition-colors">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white break-words">{hw.title}</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {hw.subject} • {hw.teacherName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isSubmitted && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                      Beküldve
                    </Badge>
                  )}
                  {isOverdue && !isSubmitted && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                      Lejárt
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Határidő: {new Date(hw.dueDate).toLocaleDateString('hu-HU')}
                </span>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {isSubmitted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedHomework({...hw, submission})
                        setShowHomeworkModal(true)
                      }}
                      className="border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 text-xs sm:text-sm w-full sm:w-auto"
                    >
                      Beadásom
                    </Button>
                  )}
                  {!isSubmitted && !isOverdue && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedHomework(hw)
                        setShowSubmissionModal(true)
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm w-full sm:w-auto"
                    >
                      Beküldés
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {homework.length === 0 && (
        <Card className="border-none shadow-sm">
          <CardContent className="text-center py-6 sm:py-8 text-gray-500 text-sm">
            <p>Jelenleg nincsenek házi feladatok.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
