'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Calendar } from 'lucide-react'

interface ScheduleTabProps {
  lessons: any[]
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  currentWeek: number
  setCurrentWeek: (week: number) => void
  currentTime: Date
  attendance: any[]
  homework: any[]
  userRole: string
  openAttendanceModal: (lesson: any) => void
  setSelectedHomework: (hw: any) => void
  setShowHomeworkModal: (show: boolean) => void
  fillEmptyPeriods: (lessons: any[]) => any[]
  currentUser?: any
}

export function ScheduleTab({
  lessons,
  selectedDate,
  setSelectedDate,
  currentWeek,
  setCurrentWeek,
  currentTime,
  attendance,
  homework,
  userRole,
  openAttendanceModal,
  setSelectedHomework,
  setShowHomeworkModal,
  fillEmptyPeriods,
  currentUser
}: ScheduleTabProps) {
  const [scheduleChanges, setScheduleChanges] = useState<any[]>([])

  useEffect(() => {
    const loadScheduleChanges = async () => {
      try {
        const response = await fetch(`/api/admin/schedule-changes?date=${selectedDate.toISOString().split('T')[0]}`)
        if (response.ok) {
          const changes = await response.json()
          setScheduleChanges(changes)
        }
      } catch (error) {
        console.error('Failed to load schedule changes:', error)
      }
    }
    loadScheduleChanges()
  }, [selectedDate])

  const getSubstitutionLessons = () => {
    if (!currentUser) return []
    const currentTeacherName = currentUser.fullName || currentUser.name
    return scheduleChanges.filter(change => 
      change.changeType === 'substituted' && 
      change.newTeacher === currentTeacherName &&
      new Date(change.date).toDateString() === selectedDate.toDateString()
    )
  }
  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center text-sm sm:text-lg">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Órarend
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="mb-3 sm:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-4 gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentWeek(currentWeek - 1)}
              className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Előző hét</span>
              <span className="sm:hidden">←</span>
            </button>
            <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
              {['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'].map((day, index) => {
                const dayDate = new Date()
                dayDate.setDate(dayDate.getDate() - dayDate.getDay() + 1 + index + (currentWeek * 7))
                const isSelected = selectedDate.toDateString() === dayDate.toDateString()
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dayDate)}
                    className={`px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm font-medium whitespace-nowrap ${isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    <div className="text-xs sm:text-sm">{day.slice(0, 2)}<span className="hidden sm:inline">{day.slice(2)}</span></div>
                    <div className="text-xs">{dayDate.getDate()}</div>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setCurrentWeek(currentWeek + 1)}
              className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Következő hét</span>
              <span className="sm:hidden">→</span>
            </button>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-4">
          <h3 className="font-semibold text-center mb-2 sm:mb-3 text-gray-900 dark:text-white text-xs sm:text-base">
            {selectedDate.toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <div className="space-y-1 sm:space-y-2 relative">
            {(() => {
              const selectedDay = selectedDate.toLocaleDateString('hu-HU', { weekday: 'long' })
              const dayMap = { 'hétfő': 'Hétfő', 'kedd': 'Kedd', 'szerda': 'Szerda', 'csütörtök': 'Csütörtök', 'péntek': 'Péntek' }
              const dayLessons = lessons.filter(lesson => lesson.Day === dayMap[selectedDay.toLowerCase()])
              
              // Helyettesítések betöltése
              const dayChanges = scheduleChanges.filter(change => {
                const changeDate = new Date(change.date)
                const currentDate = new Date(selectedDate)
                const changeDayName = changeDate.toLocaleDateString('hu-HU', { weekday: 'long' })
                const changeDayMap: Record<string, string> = { 'hétfő': 'Hétfő', 'kedd': 'Kedd', 'szerda': 'Szerda', 'csütörtök': 'Csütörtök', 'péntek': 'Péntek' }
                return changeDayMap[changeDayName.toLowerCase()] === dayMap[selectedDay.toLowerCase()] && 
                       changeDate.toDateString() === currentDate.toDateString()
              })
              
              // Órák rendezése időrend szerint
              const timeSlots = ['7:45', '8:45', '9:45', '10:45', '11:45', '12:45', '13:45', '14:45']
              
              // Helyettesítések alkalmazása
              const lessonsWithChanges = timeSlots.map(time => {
                const lesson = dayLessons.find(l => l.StartTime === time)
                const change = dayChanges.find(c => c.timeSlot === time)
                
                if (change) {
                  if (change.changeType === 'cancelled') {
                    return { ...lesson, status: 'cancelled', change }
                  } else if (change.changeType === 'substituted') {
                    return {
                      ...lesson,
                      Subject: change.newSubject || lesson?.Subject,
                      Teacher: change.newTeacher || lesson?.Teacher,
                      Class: change.newClass || lesson?.Class,
                      Room: change.newRoom || lesson?.Room,
                      status: 'substituted',
                      change
                    }
                  } else if (change.changeType === 'added') {
                    return {
                      StartTime: time,
                      Subject: change.newSubject,
                      Teacher: change.newTeacher,
                      Class: change.newClass,
                      Room: change.newRoom,
                      Day: dayMap[selectedDay.toLowerCase()],
                      status: 'added',
                      change
                    }
                  }
                }
                
                return lesson || { StartTime: time, status: 'free' }
              })
              
              // Helyettesítő tanár óráinak hozzáadása
              if (userRole === 'teacher' && currentUser) {
                const substitutionLessons = getSubstitutionLessons()
                substitutionLessons.forEach(sub => {
                  const existingIndex = lessonsWithChanges.findIndex(l => l.StartTime === sub.timeSlot)
                  if (existingIndex === -1) {
                    // Csak akkor adjuk hozzá, ha még nincs ilyen időpontban óra
                    lessonsWithChanges.push({
                      StartTime: sub.timeSlot,
                      Subject: sub.newSubject,
                      Teacher: sub.newTeacher,
                      Class: sub.newClass,
                      Room: sub.newRoom,
                      Day: dayMap[selectedDay.toLowerCase()],
                      status: 'substituted',
                      change: sub,
                      isSubstitution: true
                    })
                  } else if (lessonsWithChanges[existingIndex].status === 'free') {
                    // Ha üres időpont volt, cseréljuk le helyettesítésre
                    lessonsWithChanges[existingIndex] = {
                      StartTime: sub.timeSlot,
                      Subject: sub.newSubject,
                      Teacher: sub.newTeacher,
                      Class: sub.newClass,
                      Room: sub.newRoom,
                      Day: dayMap[selectedDay.toLowerCase()],
                      status: 'substituted',
                      change: sub,
                      isSubstitution: true
                    }
                  }
                })
              }
              
              const validLessons = lessonsWithChanges.filter(lesson => lesson.status !== 'free' && lesson.StartTime)
              
              const filledLessons = fillEmptyPeriods(validLessons)

              return filledLessons.map((lesson, index) => {
                const isCurrentLesson = (() => {
                  const now = currentTime
                  const today = new Date()
                  const isToday = selectedDate.toDateString() === today.toDateString()
                  if (!isToday) return false
                  if (!lesson.StartTime) return false
                  const [hours, minutes] = lesson.StartTime.split(':').map(Number)
                  const lessonStart = new Date(now)
                  lessonStart.setHours(hours, minutes, 0, 0)
                  const lessonEnd = new Date(lessonStart)
                  lessonEnd.setMinutes(lessonEnd.getMinutes() + 45)
                  return now >= lessonStart && now <= lessonEnd
                })()

                const lessonId = `${lesson.Day}_${lesson.StartTime}_${lesson.Class}`
                const attendanceRecord = attendance.find(record =>
                  record.lessonId === lessonId &&
                  record.date === selectedDate.toISOString().split('T')[0]
                )

                return (
                  <div
                    key={index}
                    className={`rounded p-3 text-sm relative group ${lesson.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900 border-l-4 border-red-500' :
                      lesson.status === 'substituted' && lesson.isSubstitution && (userRole === 'teacher' || userRole === 'class_teacher') ? 'bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500' :
                      lesson.status === 'substituted' && !lesson.isSubstitution && (userRole === 'teacher' || userRole === 'class_teacher') ? 'bg-orange-100 dark:bg-orange-900 border-l-4 border-orange-500' :
                      lesson.status === 'substituted' ? 'bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500' :
                        lesson.status === 'free' ? 'bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-300' :
                          isCurrentLesson ? 'bg-green-100 dark:bg-green-900 border-l-4 border-green-500' :
                            (userRole === 'teacher' || userRole === 'class_teacher') && attendanceRecord ? 'bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400' :
                            'bg-white dark:bg-gray-700'
                      } ${userRole === 'teacher' && lesson.status !== 'free' && lesson.status !== 'cancelled' && 
                        (lesson.Teacher === (currentUser?.fullName || currentUser?.name) || lesson.isSubstitution) && !attendanceRecord ? 
                        'cursor-pointer hover:shadow-md transition-shadow' : ''
                      } ${(userRole === 'teacher' || userRole === 'class_teacher') && attendanceRecord ? 'opacity-75' : ''}`}
                    onClick={() => {
                      if (userRole === 'teacher' && lesson.status !== 'free' && lesson.status !== 'cancelled' && 
                          (lesson.Teacher === (currentUser?.fullName || currentUser?.name) || lesson.isSubstitution)) {
                        // Ellenőrizzük, hogy már van-e rögzített jelenlét
                        const lessonId = `${lesson.Day}_${lesson.StartTime}_${lesson.Class}`
                        const existingAttendance = attendance.find(record =>
                          record.lessonId === lessonId &&
                          record.date === selectedDate.toISOString().split('T')[0]
                        )
                        
                        if (existingAttendance) {
                          // Ha már van rögzített jelenlét, ne nyissa meg a modal-t
                          return
                        }
                        
                        openAttendanceModal(lesson)
                      }
                    }}
                    title={attendanceRecord?.topic ? `Téma: ${attendanceRecord.topic}` : ''}
                  >
                    {attendanceRecord?.topic && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                        Téma: {attendanceRecord.topic}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                    {isCurrentLesson && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                    {(userRole === 'teacher' || userRole === 'class_teacher') && attendanceRecord && (
                      <div className="absolute top-6 right-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" title="Jelenlét rögzítve"></div>
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-blue-600 dark:text-blue-400">{lesson.StartTime}</div>
                        <div className={`font-semibold ${lesson.status === 'cancelled' ? 'text-red-700 dark:text-red-300' :
                          lesson.status === 'substituted' && lesson.isSubstitution && (userRole === 'teacher' || userRole === 'class_teacher') ? 'text-yellow-700 dark:text-yellow-300' :
                          lesson.status === 'substituted' && !lesson.isSubstitution && (userRole === 'teacher' || userRole === 'class_teacher') ? 'text-orange-700 dark:text-orange-300' :
                          lesson.status === 'substituted' ? 'text-yellow-700 dark:text-yellow-300' :
                            lesson.status === 'free' ? 'text-gray-500 dark:text-gray-400 italic' :
                              'text-gray-900 dark:text-white'
                          }`}>
                          {lesson.Subject}
                          {lesson.status === 'cancelled' && ' (ELMARADT)'}
                          {lesson.status === 'substituted' && lesson.isSubstitution && (userRole === 'teacher' || userRole === 'class_teacher') && ' (HELYETTESÍTEK)'}
                          {lesson.status === 'substituted' && !lesson.isSubstitution && (userRole === 'teacher' || userRole === 'class_teacher') && ' (HELYETTESÍTENEK)'}
                          {lesson.status === 'substituted' && userRole !== 'teacher' && userRole !== 'class_teacher' && ' (HELYETTESÍTÉS)'}
                        </div>
                        {lesson.status !== 'free' && (
                          <>
                            <div className="text-gray-600 dark:text-gray-300 text-xs">
                              {userRole === 'teacher' ? lesson.Class : lesson.Teacher}
                              {lesson.status === 'substituted' && lesson.isSubstitution && (userRole === 'teacher' || userRole === 'class_teacher') && (
                                <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-medium">(helyettesítek)</span>
                              )}
                              {lesson.status === 'substituted' && !lesson.isSubstitution && (userRole === 'teacher' || userRole === 'class_teacher') && (
                                <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">(helyettesítenek)</span>
                              )}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">{lesson.Room}</div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const lessonId = `${lesson.Day}_${lesson.StartTime}_${lesson.Class}`
                          const lessonHomework = homework.filter(hw => hw.lessonId === lessonId)
                          return lessonHomework.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedHomework(lessonHomework[0])
                                setShowHomeworkModal(true)
                              }}
                              className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-orange-600 transition-colors"
                              title="Házi feladat"
                            >
                              📝
                            </button>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
