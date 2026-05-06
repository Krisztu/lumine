'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
interface AttendanceTabProps {
  attendance: any[]
  expandedDates: Record<string, boolean>
  setExpandedDates: (dates: Record<string, boolean>) => void
  setSelectedLesson: (lesson: any) => void
  setAttendanceForm: (form: any) => void
  setShowAttendanceModal: (show: boolean) => void
}

export function AttendanceTab({
  attendance,
  expandedDates,
  setExpandedDates,
  setSelectedLesson,
  setAttendanceForm,
  setShowAttendanceModal
}: AttendanceTabProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-lg">Mulasztások kezelése</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Kattints egy órára az órarendben a mulasztások rögzítéséhez.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(() => {
            const attendanceByDate = attendance.reduce((acc, record) => {
              const date = record.date
              if (!acc[date]) acc[date] = []
              acc[date].push(record)
              return acc
            }, {} as Record<string, any[]>)

            return (Object.entries(attendanceByDate) as [string, any[]][])
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, records]) => {
                const isExpanded = expandedDates[date] || false

                return (
                  <div key={date} className="border border-white/10 rounded-lg glass-panel">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => setExpandedDates({ ...expandedDates, [date]: !isExpanded })}
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {new Date(date).toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {records.length} óra rögzítve
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500 text-white">
                          {records.length}
                        </Badge>
                        <span className="text-gray-400">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-white/10 p-4 space-y-3">
                        {records.map(record => (
                          <div key={record.id} className="border border-white/10 rounded-lg p-3 glass-panel">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">{record.subject} - {record.className}</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {record.startTime}
                                </p>
                                {record.topic && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Téma: {record.topic}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-900 dark:text-white">
                                  Jelen: {record.students.filter((s: any) => s.present).length}/{record.students.length}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Hiányzó: {record.students.filter((s: any) => !s.present).length}
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLesson(record)
                                    setAttendanceForm({
                                      topic: record.topic || '',
                                      students: record.students.map((s: any) => ({ ...s }))
                                    })
                                    setShowAttendanceModal(true)
                                  }}
                                  className="mt-2"
                                >
                                  ✏️ Szerkesztés
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {record.students.map((student: any) => (
                                <div key={student.studentId} className={`text-xs p-2 rounded ${student.present ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                  student.excused ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                  }`}>
                                  {student.studentName}
                                  {!student.present && (
                                    <span className="block text-xs">
                                      {student.excused ? '(Igazolt)' : '(Hiányzó)'}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
          })()}

          {attendance.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Még nem rögzítettél mulasztásokat.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
