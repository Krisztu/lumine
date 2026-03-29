'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Modal } from '@/shared/components/ui/modal'
import { Plus, Edit, X } from 'lucide-react'
import { User } from '@/shared/types'

import { SUBJECTS } from '@/shared/utils/subjects'

interface AdminScheduleTabProps {
  allUsers: User[]
  availableClasses: { name: string }[]
  currentUser: any
}

export function AdminScheduleTab({ allUsers, availableClasses, currentUser }: AdminScheduleTabProps) {
  const [selectedType, setSelectedType] = useState<'user' | 'class'>('user')
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [selectedDay, setSelectedDay] = useState('Hétfő') // Új state mobil nézethez
  const [schedule, setSchedule] = useState<any[]>([])
  const [scheduleChanges, setScheduleChanges] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogData, setDialogData] = useState<any>({})
  const [newLesson, setNewLesson] = useState({ subject: '', teacher: '', room: '' })

  const timeSlots = ['7:45', '8:45', '9:45', '10:45', '11:45', '12:45', '13:45', '14:45']
  const days = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek']
  
  const teachers = allUsers.filter(u => u.role === 'teacher' || u.role === 'homeroom_teacher')

  const loadSchedule = async () => {
    if (!selectedUser && !selectedClass) return

    setLoading(true)
    try {
      let url = '/api/lessons'
      if (selectedType === 'user' && selectedUser) {
        url += `?userId=${encodeURIComponent(selectedUser)}`
      } else if (selectedType === 'class' && selectedClass) {
        url += `?class=${encodeURIComponent(selectedClass)}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const lessons = await response.json()
        setSchedule(lessons)
      }

      const exactMonday = new Date(selectedDate)
      const currentDayOfWeek = exactMonday.getDay() || 7
      exactMonday.setDate(exactMonday.getDate() - currentDayOfWeek + 1)
      
      const changesPromises = [0, 1, 2, 3, 4].map(i => {
         const d = new Date(exactMonday)
         d.setDate(d.getDate() + i)
         d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
         const dateStr = d.toISOString().split('T')[0]
         return fetch(`/api/admin/schedule-changes?date=${dateStr}&t=${Date.now()}`, { cache: 'no-store' })
           .then(res => res.ok ? res.json() : [])
      })
      
      const changesResults = await Promise.all(changesPromises)
      setScheduleChanges(changesResults.flat())
    } catch (error) {
      console.error('Failed to load schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedule()
  }, [selectedUser, selectedClass, selectedDate, selectedType])

  // Amikor a komponens betöltődik, állítsuk be a mai napot
  useEffect(() => {
    const today = new Date()
    setSelectedDate(today.toISOString().split('T')[0])
  }, [])

  const getDaySchedule = (day: string) => {
    const dayLessons = schedule.filter(lesson => lesson.day === day)
    const dayChanges = scheduleChanges.filter(change => {
      const changeDate = new Date(change.date)
      const currentDate = new Date(selectedDate)
      const changeDayName = changeDate.toLocaleDateString('hu-HU', { weekday: 'long' })
      const dayMap: Record<string, string> = { 'hétfő': 'Hétfő', 'kedd': 'Kedd', 'szerda': 'Szerda', 'csütörtök': 'Csütörtök', 'péntek': 'Péntek' }
      
      const isCorrectDateAndDay = dayMap[changeDayName.toLowerCase()] === day
      if (!isCorrectDateAndDay) return false

      const currentTargetId = selectedType === 'user' ? selectedUser : 'class_' + selectedClass
      return change.teacherId === currentTargetId || (selectedType === 'class' && change.newClass === selectedClass)
    })

    return timeSlots.map(time => {
      const lesson = dayLessons.find(l => l.startTime === time)
      const change = dayChanges.find(c => c.timeSlot === time)

      if (change) {
        if (change.changeType === 'cancelled') {
          return { ...lesson, status: 'cancelled', change }
        } else if (change.changeType === 'substituted') {
          return {
            ...lesson,
            subject: change.newSubject || lesson?.subject,
            teacherName: change.newTeacher || lesson?.teacherName,
            className: change.newClass || lesson?.className,
            room: change.newRoom || lesson?.room,
            status: 'substituted',
            change
          }
        } else if (change.changeType === 'added') {
          return {
            startTime: time,
            subject: change.newSubject,
            teacherName: change.newTeacher,
            className: change.newClass,
            room: change.newRoom,
            status: 'added',
            change
          }
        }
      }

      return lesson || { startTime: time, status: 'free' }
    })
  }

  const getExactDateForDay = (targetDayName: string) => {
    const selected = new Date(selectedDate)
    const currentDayOfWeek = selected.getDay() || 7 // 1=hétfő, 7=vasárnap
    const dayMapReverse: Record<string, number> = { 'Hétfő': 1, 'Kedd': 2, 'Szerda': 3, 'Csütörtök': 4, 'Péntek': 5 }
    const targetDayOfWeek = dayMapReverse[targetDayName]
    const diff = targetDayOfWeek - currentDayOfWeek
    const exactDate = new Date(selected)
    exactDate.setDate(selected.getDate() + diff)
    exactDate.setMinutes(exactDate.getMinutes() - exactDate.getTimezoneOffset())
    return exactDate.toISOString().split('T')[0]
  }

  const openLessonDialog = (day: string, time: string, action: 'add' | 'edit', lesson?: any, targetDate?: string) => {
    setDialogData({ day, time, action, lesson, targetDate })
    if (lesson) {
      setNewLesson({
        subject: lesson.subject || '',
        teacher: lesson.teacherName || '',
        room: lesson.room || ''
      })
    } else {
      setNewLesson({ subject: '', teacher: '', room: '' })
    }
    setIsDialogOpen(true)
  }

  const handleDialogSubmit = async () => {
    const { day, time, action } = dialogData
    
    try {
      if (action === 'add') {
        // Állandó óra hozzáadása a lessons kollekcióba
        const response = await fetch('/api/academic/lessons', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-role': currentUser?.role || 'admin',
            'x-user-id': currentUser?.id || '',
            'x-user-email': currentUser?.email || ''
          },
          body: JSON.stringify({
            day: day,
            startTime: time,
            subject: newLesson.subject,
            teacherName: newLesson.teacher,
            className: selectedClass,
            room: newLesson.room
          })
        })
        
        if (response.ok) {
          loadSchedule()
          setIsDialogOpen(false)
        } else {
          const error = await response.json()
          alert(`Hiba: ${error.error}`)
        }
      } else if (action === 'edit') {
        // Óra módosítása
        handleLessonAction(day, time, 'substitute', {
          subject: newLesson.subject,
          teacher: newLesson.teacher,
          class: dialogData.lesson?.className || selectedClass,
          originalTeacher: dialogData.lesson?.teacherName || '',
          originalClass: dialogData.lesson?.className || selectedClass,
          room: newLesson.room
        }, dialogData.targetDate)
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to save lesson:', error)
    }
  }

  const handleDeleteLesson = async (day: string, time: string, lesson: any) => {
    if (!confirm(`Biztosan törölni szeretnéd a(z) ${lesson.subject} órát minden hétről?`)) {
      return
    }

    try {
      const response = await fetch('/api/academic/lessons', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
          'x-user-id': currentUser?.id || '',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({
          day: day,
          startTime: time,
          subject: lesson.subject,
          teacherName: lesson.teacherName,
          className: lesson.className || selectedClass
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Siker: Törölve`)
        loadSchedule()
      } else {
        const error = await response.json()
        alert(`Hiba: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to delete lesson:', error)
      alert('Hiba történt az óra törlése során')
    }
  }

  const handleLessonAction = async (day: string, timeSlot: string, action: 'cancel' | 'substitute' | 'add', lessonData?: any, targetDate?: string) => {
    try {
      // Csak lemondás és helyettesítés esetén használjuk a schedule-changes API-t
      if (action === 'cancel' || action === 'substitute') {
        const targetUserId = selectedType === 'user' ? selectedUser : null

        const changeData = {
          teacherId: targetUserId || 'class_' + selectedClass,
          date: targetDate || selectedDate,
          timeSlot,
          changeType: action === 'cancel' ? 'cancelled' : 'substituted',
          originalTeacher: lessonData?.originalTeacher || '',
          originalClass: lessonData?.originalClass || selectedClass,
          newSubject: lessonData?.subject || '',
          newTeacher: lessonData?.teacher || '',
          newClass: lessonData?.class || (lessonData?.className || selectedClass),
          newRoom: lessonData?.room || ''
        }

        const response = await fetch('/api/admin/schedule-changes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changeData)
        })

        if (response.ok) {
          loadSchedule()
        }
      }
    } catch (error) {
      console.error('Failed to update schedule:', error)
    }
  }

  const getLessonStatusColor = (status: string) => {
    switch (status) {
      case 'cancelled': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
      case 'substituted': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
      case 'added': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
      case 'free': return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
      default: return 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100'
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            
            Interaktív Órarend Kezelő
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">Válassz felhasználót vagy osztályt az órarend megtekintéséhez és szerkesztéséhez</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Kezelés típusa</label>
              <Select value={selectedType} onValueChange={(value: 'user' | 'class') => setSelectedType(value)}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      
                      Egyéni órarend
                    </div>
                  </SelectItem>
                  <SelectItem value="class">
                    <div className="flex items-center gap-2">
                      
                      Osztály órarend
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedType === 'user' && (
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Felhasználó kiválasztása</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Válassz felhasználót" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.filter(u => u.role === 'teacher' || u.role === 'student' || u.role === 'dj' || u.role === 'homeroom_teacher').map((user, index) => (
                      <SelectItem key={index} value={user.id || user.email}>
                        <div className="flex items-center gap-2">
                          <span>{user.fullName || user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.role === 'teacher' ? 'Tanár' : user.role === 'dj' ? 'DJ' : user.role === 'homeroom_teacher' ? 'Osztályfőnök' : 'Diák'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedType === 'class' && (
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Osztály kiválasztása</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Válassz osztályt" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map(cls => (
                      <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Hét kiválasztása</label>
              <input
                type="week"
                value={(() => {
                  const d = new Date(selectedDate);
                  const date = new Date(d.getTime());
                  date.setHours(0, 0, 0, 0);
                  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
                  const week1 = new Date(date.getFullYear(), 0, 4);
                  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
                  return `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
                })()}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [yearStr, weekStr] = e.target.value.split('-W');
                  const targetYear = parseInt(yearStr, 10);
                  const targetWeek = parseInt(weekStr, 10);
                  const date = new Date(targetYear, 0, 4);
                  const day = date.getDay() || 7;
                  date.setDate(date.getDate() - day + 1 + (targetWeek - 1) * 7);
                  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                  setSelectedDate(date.toISOString().split('T')[0]);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {(selectedUser || selectedClass) && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              
              {new Date(selectedDate).toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kattints az órákra a szerkesztéshez • Üres cellákra kattintva új órát adhatsz hozzá
            </p>
          </CardHeader>
          <CardContent>
            {/* Desktop nézet */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-6 gap-2">
                <div className="font-semibold text-center py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">
                  Időpont
                </div>
                {days.map(day => (
                  <div key={day} className="font-semibold text-center py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-700 dark:text-emerald-300">
                    {day}
                  </div>
                ))}

                {timeSlots.map(time => (
                  <React.Fragment key={time}>
                    <div className="flex items-center justify-center font-medium text-sm bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-gray-700 dark:text-gray-300">
                      {time}
                    </div>
                    {days.map(day => {
                      const lesson = getDaySchedule(day).find(l => l.startTime === time)

                      return (
                        <div key={`${day}-${time}`} className={`p-3 rounded-lg border-2 min-h-[100px] transition-all hover:shadow-md ${getLessonStatusColor(lesson?.status || 'normal')}`}>
                          {lesson?.status === 'free' ? (
                            <div className="flex items-center justify-center h-full">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openLessonDialog(day, time, 'add', undefined, getExactDateForDay(day))}
                                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md p-3 h-10 w-10"
                                >
                                  <Plus className="h-6 w-6" />
                                </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="font-semibold text-sm leading-tight">{lesson?.subject}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{lesson?.teacherName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">{lesson?.room}</div>
                              {lesson?.status && lesson.status !== 'normal' && (
                                <Badge variant="secondary" className="text-xs">
                                  {lesson.status === 'cancelled' ? 'Elmaradt' :
                                    lesson.status === 'substituted' ? 'Helyettesítés' :
                                      lesson.status === 'added' ? 'Új óra' : ''}
                                </Badge>
                              )}
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleLessonAction(day, time, 'cancel', { originalTeacher: lesson.teacherName, originalClass: lesson.className || selectedClass }, getExactDateForDay(day))}
                                    className="p-2 h-9 w-9 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 rounded-md"
                                    title="Óra lemondása (csak ezen a napon)"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteLesson(day, time, lesson)}
                                    className="p-2 h-9 w-9 hover:bg-red-200 hover:text-red-700 dark:hover:bg-red-800/30 rounded-md"
                                    title="Óra teljes törlése (minden hétről)"
                                  >
                                    <X className="h-4 w-4" strokeWidth={3} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openLessonDialog(day, time, 'edit', lesson, getExactDateForDay(day))}
                                    className="p-2 h-9 w-9 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/20 rounded-md"
                                    title="Óra módosítása"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Mobil nézet */}
            <div className="lg:hidden space-y-4">
              {/* Nap kiválasztó */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Nap kiválasztása</label>
                <Select value={selectedDay || days[0]} onValueChange={setSelectedDay}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kiválasztott nap órái */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg py-2 px-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-700 dark:text-emerald-300">
                  {selectedDay || days[0]}
                </h3>
                <div className="space-y-2">
                  {getDaySchedule(selectedDay || days[0]).map((lesson, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border-2 ${getLessonStatusColor(lesson?.status || 'normal')}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{lesson.startTime}</span>
                        {lesson?.status && lesson.status !== 'normal' && lesson.status !== 'free' && (
                          <Badge variant="secondary" className="text-xs">
                            {lesson.status === 'cancelled' ? 'Elmaradt' :
                              lesson.status === 'substituted' ? 'Helyettesítés' :
                                lesson.status === 'added' ? 'Új óra' : ''}
                          </Badge>
                        )}
                      </div>
                      {lesson?.status === 'free' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openLessonDialog(selectedDay || days[0], lesson.startTime, 'add', undefined, getExactDateForDay(selectedDay || days[0]))}
                          className="w-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Óra hozzáadása
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <div className="font-semibold text-base">{lesson?.subject}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{lesson?.teacherName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-500">{lesson?.room}</div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLessonAction(selectedDay || days[0], lesson.startTime, 'cancel', { originalTeacher: lesson.teacherName, originalClass: lesson.className || selectedClass }, getExactDateForDay(selectedDay || days[0]))}
                              className="flex-1 text-xs"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Lemondás
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteLesson(selectedDay || days[0], lesson.startTime, lesson)}
                              className="flex-1 text-xs"
                            >
                              <X className="h-4 w-4 mr-1" strokeWidth={3} />
                              Törlés
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openLessonDialog(selectedDay || days[0], lesson.startTime, 'edit', lesson, getExactDateForDay(selectedDay || days[0]))}
                              className="flex-1 text-xs"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Módosítás
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedUser && !selectedClass && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="py-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              
              <p className="text-lg font-medium mb-2">Válassz felhasználót vagy osztályt</p>
              <p className="text-sm">Az órarend megtekintéséhez és szerkesztéséhez válassz egy felhasználót vagy osztályt a fenti menüből.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        title={dialogData.action === 'add' ? 'Új óra hozzáadása' : 'Óra módosítása'}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Tantárgy</Label>
            <Select value={newLesson.subject} onValueChange={(value) => setNewLesson({...newLesson, subject: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Válassz tantárgyat" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="teacher">Tanár</Label>
            <Select value={newLesson.teacher} onValueChange={(value) => setNewLesson({...newLesson, teacher: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Válassz tanárt" />
              </SelectTrigger>
              <SelectContent>
                {teachers.filter(teacher => {
                  // Helyettesítésnél bármelyik tanár tarthat órát
                  if (dialogData.action === 'edit') return true
                  // Új óra hozzáadásánál szűrünk tantárgy szerint
                  if (!newLesson.subject) return true
                  return (teacher.subject === newLesson.subject) || 
                         (teacher.subjects && teacher.subjects.includes(newLesson.subject))
                }).map(teacher => {
                  const teacherName = teacher.fullName || teacher.name || 'Ismeretlen tanár'
                  return (
                  <SelectItem key={teacher.id || teacher.email} value={teacherName}>
                    {teacherName}
                  </SelectItem>
                )})}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="room">Terem</Label>
            <Input
              id="room"
              value={newLesson.room}
              onChange={(e) => setNewLesson({...newLesson, room: e.target.value})}
              placeholder="Terem száma"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handleDialogSubmit} disabled={!newLesson.subject || !newLesson.teacher}>
              {dialogData.action === 'add' ? 'Hozzáadás' : 'Módosítás'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}