'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

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

// nap nevek hu -> display, kell a filterekhez is
const napNevek: Record<string, string> = {
  'hétfő': 'Hétfő',
  'kedd': 'Kedd',
  'szerda': 'Szerda',
  'csütörtök': 'Csütörtök',
  'péntek': 'Péntek',
}

const oraIdok = ['7:45', '8:45', '9:45', '10:45', '11:45', '12:45', '13:45', '14:45']

// kartya hattar szine az allapot alapjan
function getCardStyle(lesson: any, attendRec: any, role: string, most: boolean) {
  if (lesson.status === 'cancelled')
    return 'bg-red-50 dark:bg-red-950/60 border-red-500'
  if (lesson.status === 'substituted' && lesson.isSubstitution && (role === 'teacher' || role === 'class_teacher'))
    return 'bg-yellow-50 dark:bg-yellow-950/60 border-yellow-400'
  if (lesson.status === 'substituted' && !lesson.isSubstitution && (role === 'teacher' || role === 'class_teacher'))
    return 'bg-orange-50 dark:bg-orange-950/60 border-orange-500'
  if (lesson.status === 'substituted')
    return 'bg-amber-50 dark:bg-amber-950/60 border-amber-400'
  if (lesson.status === 'free')
    return 'bg-gray-50 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600'
  if (attendRec && role !== 'student' && role !== 'parent')
    return 'bg-sky-50 dark:bg-sky-950/60 border-sky-500'
  if (most)
    return 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500'
  return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
}

// idopont szoveg szine
function getTimeStyle(attendRec: any, role: string, most: boolean) {
  if (attendRec && role !== 'student' && role !== 'parent') return 'text-sky-600 dark:text-sky-400'
  if (most) return 'text-emerald-600 dark:text-emerald-400'
  return 'text-gray-500 dark:text-gray-400'
}

// tantargy szoveg szine
function getSubjectStyle(lesson: any, attendRec: any, role: string, most: boolean) {
  if (lesson.status === 'cancelled') return 'text-red-700 dark:text-red-300'
  if (lesson.status === 'substituted' && lesson.isSubstitution && (role === 'teacher' || role === 'class_teacher'))
    return 'text-yellow-700 dark:text-yellow-300'
  if (lesson.status === 'substituted' && !lesson.isSubstitution && (role === 'teacher' || role === 'class_teacher'))
    return 'text-orange-700 dark:text-orange-300'
  if (lesson.status === 'substituted') return 'text-amber-700 dark:text-amber-300'
  if (lesson.status === 'free') return 'text-gray-400 dark:text-gray-500 italic'
  if (attendRec && role !== 'student' && role !== 'parent') return 'text-sky-800 dark:text-sky-200'
  if (most) return 'text-emerald-800 dark:text-emerald-200'
  return 'text-gray-900 dark:text-white'
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
  currentUser,
}: ScheduleTabProps) {
  const [scheduleChanges, setScheduleChanges] = useState<any[]>([])

  useEffect(() => {
    const betolt = async () => {
      try {
        const res = await fetch(
          `/api/admin/schedule-changes?date=${selectedDate.toISOString().split('T')[0]}&t=${Date.now()}`,
          { cache: 'no-store' }
        )
        if (res.ok) setScheduleChanges(await res.json())
      } catch (err) {
        console.error('Valtozasok betoltese sikertelen:', err)
      }
    }
    betolt()
  }, [selectedDate])

  // azok az orak ahol en helyettesitek
  const getSajtHelyettesitesek = () => {
    if (!currentUser) return []
    const nevem = currentUser.fullName || currentUser.name
    return scheduleChanges.filter(
      ch =>
        ch.changeType === 'substituted' &&
        ch.newTeacher === nevem &&
        new Date(ch.date).toDateString() === selectedDate.toDateString()
    )
  }

  const renderOrak = () => {
    const napNeve = selectedDate.toLocaleDateString('hu-HU', { weekday: 'long' })
    const napLessons = lessons.filter(l => l.Day === napNevek[napNeve.toLowerCase()])

    // csak az adott napra esett valtozasok
    const napChanges = scheduleChanges.filter(ch => {
      const chDate = new Date(ch.date)
      const chNap = chDate.toLocaleDateString('hu-HU', { weekday: 'long' })
      return (
        napNevek[chNap.toLowerCase()] === napNevek[napNeve.toLowerCase()] &&
        chDate.toDateString() === selectedDate.toDateString()
      )
    })

    // idoponthoz rendeljuk az orat es a hozza tartozo valtozast
    const slots = oraIdok.map(time => {
      const lesson = napLessons.find(l => l.StartTime === time)

      const change = napChanges.find(c => {
        if (c.timeSlot !== time) return false
        if (lesson) {
          const matchesClass = c.originalClass === lesson.Class || c.teacherId === `class_${lesson.Class}`
          const matchesTeacher = c.originalTeacher === lesson.Teacher || c.teacherId === currentUser?.id
          return matchesClass || matchesTeacher
        } else {
          if (userRole === 'teacher' || userRole === 'class_teacher') {
            return c.newTeacher === (currentUser?.fullName || currentUser?.name) || c.teacherId === currentUser?.id
          } else {
            return c.newClass === currentUser?.class || c.teacherId === `class_${currentUser?.class}`
          }
        }
      })

      if (change) {
        if (change.changeType === 'cancelled') return { ...lesson, status: 'cancelled', change }
        if (change.changeType === 'substituted')
          return {
            ...lesson,
            Subject: change.newSubject || lesson?.Subject,
            Teacher: change.newTeacher || lesson?.Teacher,
            Class: change.newClass || lesson?.Class,
            Room: change.newRoom || lesson?.Room,
            status: 'substituted',
            change,
          }
        if (change.changeType === 'added')
          return {
            StartTime: time,
            Subject: change.newSubject,
            Teacher: change.newTeacher,
            Class: change.newClass,
            Room: change.newRoom,
            Day: napNevek[napNeve.toLowerCase()],
            status: 'added',
            change,
          }
      }

      return lesson || { StartTime: time, status: 'free' }
    })

    // tanarnal a sajat helyettesiteseit is berakjuk
    if (userRole === 'teacher' && currentUser) {
      getSajtHelyettesitesek().forEach(sub => {
        const idx = slots.findIndex(l => l.StartTime === sub.timeSlot)
        const subSlot = {
          StartTime: sub.timeSlot,
          Subject: sub.newSubject,
          Teacher: sub.newTeacher,
          Class: sub.newClass,
          Room: sub.newRoom,
          Day: napNevek[napNeve.toLowerCase()],
          status: 'substituted',
          change: sub,
          isSubstitution: true,
        }
        if (idx === -1) slots.push(subSlot)
        else if (slots[idx].status === 'free') slots[idx] = subSlot
      })
    }

    const filled = fillEmptyPeriods(slots.filter(l => l.status !== 'free' && l.StartTime))

    return filled.map((lesson, i) => {
      // megnezzuk hogy eppen ez az ora folyik-e
      const most = (() => {
        if (selectedDate.toDateString() !== new Date().toDateString()) return false
        if (!lesson.StartTime) return false
        const [h, m] = lesson.StartTime.split(':').map(Number)
        const start = new Date(currentTime)
        start.setHours(h, m, 0, 0)
        const end = new Date(start)
        end.setMinutes(end.getMinutes() + 45)
        return currentTime >= start && currentTime <= end
      })()

      const lessonId = `${lesson.Day}_${lesson.StartTime}_${lesson.Class}`
      const attendRec = attendance.find(
        r => r.lessonId === lessonId && r.date === selectedDate.toISOString().split('T')[0]
      )

      const klikkelhetoTanar =
        userRole === 'teacher' &&
        lesson.status !== 'free' &&
        lesson.status !== 'cancelled' &&
        (lesson.Teacher === (currentUser?.fullName || currentUser?.name) || lesson.isSubstitution)

      return (
        <div
          key={i}
          className={`rounded-lg p-3 text-sm relative group border-l-4 transition-all ${getCardStyle(lesson, attendRec, userRole, most)} ${
            klikkelhetoTanar && !attendRec ? 'cursor-pointer hover:shadow-md hover:scale-[1.005]' : ''
          } ${attendRec ? 'opacity-80' : ''}`}
          onClick={() => {
            if (!klikkelhetoTanar) return
            const van = attendance.find(
              r => r.lessonId === lessonId && r.date === selectedDate.toISOString().split('T')[0]
            )
            if (!van) openAttendanceModal(lesson)
          }}
          title={attendRec?.topic ? `Téma: ${attendRec.topic}` : ''}
        >
          {/* tema tooltip */}
          {attendRec?.topic && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
              Téma: {attendRec.topic}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}

          {/* allapot badge-ek */}
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            {most && !attendRec && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">MOST</span>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            )}
            {attendRec && userRole !== 'student' && userRole !== 'dj' && userRole !== 'parent' && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold">KÖNYVELT</span>
                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full"></div>
              </div>
            )}
            {lesson.status === 'cancelled' && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-red-600 dark:text-red-400 font-semibold">ELMARADT</span>
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              </div>
            )}
            {lesson.status === 'substituted' && lesson.isSubstitution && (userRole === 'teacher' || userRole === 'class_teacher') && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">HELYETTESÍTEK</span>
                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
              </div>
            )}
            {lesson.status === 'substituted' && !lesson.isSubstitution && (userRole === 'teacher' || userRole === 'class_teacher') && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">HELYETTESÍTENEK</span>
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
              </div>
            )}
            {lesson.status === 'substituted' && userRole !== 'teacher' && userRole !== 'class_teacher' && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">HELYETTESÍTÉS</span>
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className={`text-xs font-bold tracking-wide mb-0.5 ${getTimeStyle(attendRec, userRole, most)}`}>
                {lesson.StartTime}
              </div>
              <div className={`font-semibold ${getSubjectStyle(lesson, attendRec, userRole, most)}`}>
                {lesson.Subject || (lesson.status === 'free' ? 'Szabad óra' : '')}
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
                const hwList = homework.filter(hw => hw.lessonId === lessonId)
                return (
                  hwList.length > 0 && (
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setSelectedHomework(hwList[0])
                        setShowHomeworkModal(true)
                      }}
                      className="px-2 py-0.5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-orange-600 transition-colors"
                      title="Házi feladat"
                    >
                      HF
                    </button>
                  )
                )
              })()}
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center text-sm sm:text-lg">Órarend</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="mb-3 sm:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-4 gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentWeek(currentWeek - 1)}
              className="px-2 py-1 sm:px-4 sm:py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Előző hét</span>
              <span className="sm:hidden">←</span>
            </button>
            <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
              {['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'].map((day, index) => {
                const d = new Date()
                d.setDate(d.getDate() - d.getDay() + 1 + index + currentWeek * 7)
                const selected = selectedDate.toDateString() === d.toDateString()
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(d)}
                    className={`px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm font-medium whitespace-nowrap ${
                      selected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-xs sm:text-sm">
                      {day.slice(0, 2)}
                      <span className="hidden sm:inline">{day.slice(2)}</span>
                    </div>
                    <div className="text-xs">{d.getDate()}</div>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setCurrentWeek(currentWeek + 1)}
              className="px-2 py-1 sm:px-4 sm:py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors text-xs sm:text-sm"
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
          <div className="space-y-1 sm:space-y-2 relative">{renderOrak()}</div>
        </div>
      </CardContent>
    </Card>
  )
}
