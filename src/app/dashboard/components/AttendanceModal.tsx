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
  selectedDate?: Date
}

export function AttendanceModal({
  isOpen,
  onClose,
  lesson,
  students,
  onSave,
  showAlert,
  selectedDate
}: AttendanceModalProps) {
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: 'present' | 'absent' }>({})
  const [topic, setTopic] = useState('')

  const subject = lesson?.Subject || lesson?.subject || ''
  const className = lesson?.Class || lesson?.className || ''
  const startTime = lesson?.StartTime || lesson?.startTime || ''

  // Csak azok a diákok, akiknek részt kellene venni az órán (ugyanaz az osztály)
  const relevantStudents = useMemo(() => 
    students.filter(student => 
      (student.role === 'student' || student.role === 'dj') && 
      student.class === className
    ), [students, className]
  )

  useEffect(() => {
    if (isOpen && lesson && relevantStudents.length > 0) {
      const initialAttendance: { [key: string]: 'present' | 'absent' } = {}
      const existingStudents = lesson.students || []
      
      relevantStudents.forEach(student => {
        const existingRecord = existingStudents.find((s: any) => s.studentId === student.id || s.studentName === (student.fullName || student.name))
        if (existingRecord) {
          initialAttendance[student.id] = existingRecord.present ? 'present' : 'absent'
        } else {
          initialAttendance[student.id] = 'present'
        }
      })
      setAttendanceData(initialAttendance)
      setTopic(lesson.topic || '')
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

      const dateToUse = lesson.date ? new Date(lesson.date) : (selectedDate || new Date())
      const dayStr = lesson.Day || lesson.day || 'Hétfő' // default ha nem található
      await onSave({
        id: lesson.id,
        lessonId: lesson.lessonId || `${dayStr}_${startTime}_${className}`,
        date: dateToUse.toISOString().split('T')[0],
        startTime: startTime,
        subject: subject,
        className: className,
        students: studentsData,
        topic
      })
      onClose()
    } catch (error: any) {
      // Csak akkor mutatunk generikus hibát, ha nem volt már specifikus alert
      if (error?.message !== 'already_booked') {
        showAlert('Hiba történt a mentés során', 'error')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-[#050505]/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-xs sm:max-w-2xl mx-2 sm:mx-4 max-h-[90vh] overflow-hidden flex flex-col bg-[#0f0f0f] border-zinc-800/50 shadow-2xl">
        <CardHeader className="p-4 sm:p-6 border-b border-zinc-800/50">
          <CardTitle className="text-base sm:text-lg text-white font-medium tracking-tight">
            {subject} <span className="text-zinc-500 mx-2">•</span> {className} <span className="text-zinc-500 mx-2">•</span> {startTime}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">Óra témája</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="pl. Függvények"
              className="text-sm sm:text-base bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-emerald-500 focus-visible:ring-offset-0 focus-visible:border-emerald-500"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-zinc-300">
                Diákok jelenléte
              </label>
              <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{className} osztály - {relevantStudents.length} fő</span>
            </div>
            
            {relevantStudents.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm bg-zinc-900/30 rounded-lg border border-zinc-800/50 content-center">
                Nincsenek diákok ebben az osztályban.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto border border-zinc-800/50 rounded-lg p-2 bg-black/20 custom-scrollbar">
                {relevantStudents.map(student => (
                  <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 hover:bg-zinc-800/50 rounded-md border border-transparent hover:border-zinc-800/50 transition-colors gap-2">
                    <span className="font-medium inline-block text-sm sm:text-base break-words text-zinc-200">{student.fullName || student.name}</span>
                    <div className="flex gap-2 w-full sm:w-auto bg-zinc-900/80 p-1 rounded-md">
                      <button
                        type="button"
                        onClick={() => setAttendanceData({
                          ...attendanceData,
                          [student.id]: 'present'
                        })}
                        className={`flex-1 sm:flex-none px-4 py-1.5 rounded text-xs sm:text-sm font-medium transition-all duration-200 ${
                          attendanceData[student.id] === 'present'
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.1)]'
                            : 'bg-transparent text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-zinc-800'
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
                        className={`flex-1 sm:flex-none px-4 py-1.5 rounded text-xs sm:text-sm font-medium transition-all duration-200 ${
                          attendanceData[student.id] === 'absent'
                            ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(248,113,113,0.1)]'
                            : 'bg-transparent text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-zinc-800'
                        }`}
                      >
                        Hiányzó
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-900/20 text-sm sm:text-base font-medium h-11">
              Mentés
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1 text-sm sm:text-base bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white h-11">
              Mégse
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}