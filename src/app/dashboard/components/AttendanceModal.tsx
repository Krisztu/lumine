'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useState, useEffect, useMemo } from 'react'

interface AttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  lesson: any
  students: any[]
  onSave: (data: any) => Promise<void>
  showAlert: (msg: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => void
}

export function AttendanceModal({
  isOpen,
  onClose,
  lesson,
  students,
  onSave,
  showAlert
}: AttendanceModalProps) {
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: 'present' | 'absent' }>({})
  const [topic, setTopic] = useState('')

  // Csak azok a diákok, akiknek részt kellene venni az órán (ugyanaz az osztály)
  const relevantStudents = useMemo(() => 
    students.filter(student => 
      (student.role === 'student' || student.role === 'dj') && 
      student.class === lesson?.Class
    ), [students, lesson?.Class]
  )

  useEffect(() => {
    if (isOpen && lesson && relevantStudents.length > 0) {
      // Alapértelmezetten mindenki jelen van
      const initialAttendance: { [key: string]: 'present' | 'absent' } = {}
      relevantStudents.forEach(student => {
        initialAttendance[student.id] = 'present'
      })
      setAttendanceData(initialAttendance)
      setTopic('')
    }
  }, [isOpen, lesson, relevantStudents])

  if (!isOpen || !lesson) return null

  const handleSave = async () => {
    try {
      const studentsData = relevantStudents.map(student => ({
        studentId: student.id,
        studentName: student.fullName || student.name,
        present: attendanceData[student.id] === 'present',
        excused: false // Alapértelmezetten nem igazolt
      }))

      await onSave({
        lessonId: `${lesson.Day}_${lesson.StartTime}_${lesson.Class}`,
        date: new Date().toISOString().split('T')[0],
        startTime: lesson.StartTime,
        subject: lesson.Subject,
        className: lesson.Class,
        students: studentsData,
        topic
      })
      showAlert('Jelenlét rögzítve!', 'success')
      onClose()
    } catch (error) {
      showAlert('Hiba történt', 'error')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-xs sm:max-w-2xl mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">{lesson.Subject} - {lesson.Class} - {lesson.StartTime}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
          <div>
            <label className="block text-sm font-medium mb-2">Óra témája</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="pl. Függvények"
              className="text-sm sm:text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Diákok jelenléte ({lesson.Class} osztály - {relevantStudents.length} fő)
            </label>
            
            {relevantStudents.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                Nincsenek diákok ebben az osztályban.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 sm:max-h-96 overflow-y-auto border rounded-lg p-2 sm:p-3">
                {relevantStudents.map(student => (
                  <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border gap-2">
                    <span className="font-medium text-sm sm:text-base break-words">{student.fullName || student.name}</span>
                    <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setAttendanceData({
                          ...attendanceData,
                          [student.id]: 'present'
                        })}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                          attendanceData[student.id] === 'present'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        Jelen
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendanceData({
                          ...attendanceData,
                          [student.id]: 'absent'
                        })}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                          attendanceData[student.id] === 'absent'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        Hiányzás
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
              Mentés
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1 text-sm sm:text-base">
              Mégse
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}