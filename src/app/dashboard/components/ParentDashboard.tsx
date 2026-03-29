'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { getGradesBySubject, calculateAverage, ALL_SUBJECTS } from '@/lib/gradeUtils'
import { ChartModal } from './ChartModal'
import { ParentHomeworkTab } from './ParentHomeworkTab'
import { HomeworkModal } from './HomeworkModal'
import { ScheduleTab } from './ScheduleTab'
import { parentDataCache } from '@/lib/parentDataCache'

interface ParentDashboardProps {
  user: any
  showAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => void
  defaultTab?: string
}

export function ParentDashboard({ user, showAlert, defaultTab = 'overview' }: ParentDashboardProps) {
  const [child, setChild] = useState<any>(null)
  const [childGrades, setChildGrades] = useState<any[]>([])
  const [childAttendance, setChildAttendance] = useState<any[]>([])
  const [monthlyBehavior, setMonthlyBehavior] = useState<any[]>([])
  const [recognitions, setRecognitions] = useState<any[]>([])
  const [parentInfo, setParentInfo] = useState<any>(null)
  const [excuseForm, setExcuseForm] = useState({ absenceIds: [], excuseType: '', description: '' })
  const [selectedAbsences, setSelectedAbsences] = useState<string[]>([])
  const [submittedExcuses, setSubmittedExcuses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [showChartModal, setShowChartModal] = useState(false)
  const [homework, setHomework] = useState<any[]>([])
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<any>({})
  const [selectedHomework, setSelectedHomework] = useState<any>(null)
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  
  // Órarend állapotok
  const [lessons, setLessons] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentWeek, setCurrentWeek] = useState(0)
  const [currentTime] = useState(new Date())

  useEffect(() => {
    loadData()
  }, [user])

  useEffect(() => {
    if (child) {
      loadChildData(child.childId)
    }
  }, [child])

  const loadData = async () => {
    try {
      if (!user?.email) return
      
      const parentRes = await fetch(`/api/users?email=${encodeURIComponent(user.email)}&cache=false`, {
        cache: 'no-store'
      })

      if (parentRes.ok) {
        const parentData = await parentRes.json()
        if (parentData.length > 0) {
          setParentInfo(parentData[0])
          const parentId = parentData[0].id
          
          const childrenRes = await fetch(`/api/parent-child?parentId=${parentId}`, {
            cache: 'no-store'
          })
          if (childrenRes.ok) {
            const childrenData = await childrenRes.json()
            if (childrenData.length > 0) {
              setChild(childrenData[0])
            }
          }
        }
      }
    } catch (error) {
      console.error('Parent data load error:', error)
      showAlert('Hiba az adatok betöltésekor', 'error', 'Adatbetöltés')
    }
  }

  const submitExcuse = async () => {
    if (selectedAbsences.length === 0 || !excuseForm.excuseType) {
      showAlert('Válassz ki legalább egy hiányzást és add meg az igazolás típusát!', 'warning')
      return
    }

    // Ellenőrizzük, hogy már be van-e küldve igazolás ezekre a hiányzásokra
    const alreadySubmitted = selectedAbsences.some(id => submittedExcuses.includes(id))
    if (alreadySubmitted) {
      showAlert('Erre a hiányzásra már beküldtél igazolást!', 'warning')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/excuses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'parent',
          'x-user-id': parentInfo?.id || '',
          'x-user-email': parentInfo?.email || ''
        },
        body: JSON.stringify({
          studentId: child?.childId,
          studentName: child?.childName,
          studentClass: child?.childClass,
          absenceIds: selectedAbsences,
          excuseType: excuseForm.excuseType,
          description: excuseForm.description,
          submittedBy: parentInfo?.fullName || parentInfo?.name || 'Szülő'
        })
      })

      if (response.ok) {
        showAlert('Igazolás sikeresen elküldve!', 'success')
        // Frissítjük a beküldött igazolások listáját
        const newSubmittedExcuses = [...submittedExcuses, ...selectedAbsences]
        setSubmittedExcuses(newSubmittedExcuses)
        // Frissítjük a cache-t is
        if (child?.childId) {
          parentDataCache.setSubmittedExcuses(child.childId, newSubmittedExcuses)
        }
        setSelectedAbsences([])
        setExcuseForm({ absenceIds: [], excuseType: '', description: '' })
      } else {
        const errorData = await response.json()
        if (response.status === 409) {
          showAlert('Erre a hiányzásra már beküldtél igazolást!', 'warning')
        } else {
          showAlert(errorData.error || 'Hiba az igazolás elküldése során', 'error')
        }
      }
    } catch (error) {
      showAlert('Hiba történt', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadChildData = async (childId: string) => {
    if (!childId) return
    
    // Próbáljuk meg betölteni a cache-ből
    const cachedData = parentDataCache.getChildData(childId)
    const cachedExcuses = parentDataCache.getSubmittedExcuses(childId)
    
    if (cachedData && cachedExcuses) {
      setChildGrades(cachedData.grades || [])
      setChildAttendance(cachedData.attendance || [])
      setMonthlyBehavior(cachedData.monthlyBehavior || [])
      setRecognitions(cachedData.recognitions || [])
      setHomework(cachedData.homework || [])
      setHomeworkSubmissions(cachedData.homeworkSubmissions || {})
      setLessons(cachedData.lessons || [])
      setSubmittedExcuses(cachedExcuses)
      return
    }
    
    setLoading(true)
    try {
      const [gradesRes, attendanceRes, monthlyRes, recognitionRes, homeworkRes, excusesRes, lessonsRes] = await Promise.all([
        fetch(`/api/academic/grades?student=${encodeURIComponent(child?.childName)}&cache=false`, { 
          cache: 'no-store',
          headers: {
            'x-user-role': 'parent',
            'x-user-id': parentInfo?.id || '',
            'x-user-email': parentInfo?.email || ''
          }
        }),
        fetch(`/api/academic/attendance?studentId=${encodeURIComponent(childId)}`, { cache: 'no-store' }),
        fetch(`/api/behavior/monthly?studentId=${encodeURIComponent(childId)}`, { cache: 'no-store' }),
        fetch(`/api/behavior?studentId=${encodeURIComponent(childId)}`, { cache: 'no-store' }),
        fetch(`/api/homework?studentId=${encodeURIComponent(childId)}`, { cache: 'no-store' }),
        fetch(`/api/excuses?studentId=${encodeURIComponent(childId)}`, { cache: 'no-store' }),
        fetch(`/api/lessons?class=${encodeURIComponent(child?.childClass || '')}`, { cache: 'no-store' })
      ])

      let gradesData = []
      let attendanceData = []
      let monthlyData = []
      let recognitionData = []
      let homeworkData = { homework: [], submissions: {} }
      let lessonsData = []

      if (gradesRes.ok) {
        gradesData = await gradesRes.json()
        setChildGrades(Array.isArray(gradesData) ? gradesData : [])
      } else {
        setChildGrades([])
      }

      if (attendanceRes.ok) {
        attendanceData = await attendanceRes.json()
        setChildAttendance(Array.isArray(attendanceData) ? attendanceData : [])
      } else {
        setChildAttendance([])
      }

      if (monthlyRes.ok) {
        monthlyData = await monthlyRes.json()
        setMonthlyBehavior(Array.isArray(monthlyData) ? monthlyData : [])
      } else {
        setMonthlyBehavior([])
      }

      if (recognitionRes.ok) {
        recognitionData = await recognitionRes.json()
        setRecognitions(Array.isArray(recognitionData) ? recognitionData : [])
      } else {
        setRecognitions([])
      }

      if (homeworkRes.ok) {
        homeworkData = await homeworkRes.json()
        if (homeworkData.homework && homeworkData.submissions) {
          setHomework(Array.isArray(homeworkData.homework) ? homeworkData.homework : [])
          setHomeworkSubmissions(homeworkData.submissions || {})
        } else {
          setHomework([])
          setHomeworkSubmissions({})
        }
      } else {
        setHomework([])
        setHomeworkSubmissions({})
      }

      if (lessonsRes.ok) {
        lessonsData = await lessonsRes.json()
        // Átalakítjuk a lessons API formátumát a ScheduleTab által elvárt formátumra
        const transformedLessons = lessonsData.map((lesson: any) => ({
          Day: lesson.day,
          StartTime: lesson.startTime,
          Subject: lesson.subject,
          Teacher: lesson.teacherName,
          Class: lesson.className,
          Room: lesson.room || '',
          id: lesson.id
        }))
        setLessons(transformedLessons)
      } else {
        setLessons([])
      }

      // Betöltjük a már beküldött igazolásokat
      if (excusesRes.ok) {
        const excusesData = await excusesRes.json()
        const submittedAbsenceIds = excusesData.flatMap((excuse: any) => excuse.absenceIds || [])
        setSubmittedExcuses(submittedAbsenceIds)
        parentDataCache.setSubmittedExcuses(childId, submittedAbsenceIds)
      } else {
        setSubmittedExcuses([])
        parentDataCache.setSubmittedExcuses(childId, [])
      }

      // Cache-eljük az adatokat
      const transformedLessons = lessonsData.map((lesson: any) => ({
        Day: lesson.day,
        StartTime: lesson.startTime,
        Subject: lesson.subject,
        Teacher: lesson.teacherName,
        Class: lesson.className,
        Room: lesson.room || '',
        id: lesson.id
      }))
      
      const childData = {
        grades: Array.isArray(gradesData) ? gradesData : [],
        attendance: Array.isArray(attendanceData) ? attendanceData : [],
        monthlyBehavior: Array.isArray(monthlyData) ? monthlyData : [],
        recognitions: Array.isArray(recognitionData) ? recognitionData : [],
        homework: homeworkData.homework && Array.isArray(homeworkData.homework) ? homeworkData.homework : [],
        homeworkSubmissions: homeworkData.submissions || {},
        lessons: transformedLessons
      }
      parentDataCache.setChildData(childId, childData)
    } catch (error) {
      console.error('Gyermek adatok betöltési hiba:', error)
      setChildGrades([])
      setChildAttendance([])
      setMonthlyBehavior([])
      setRecognitions([])
      setHomework([])
      setHomeworkSubmissions({})
      setLessons([])
      setSubmittedExcuses([])
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (defaultTab === 'schedule') {
      return (
        <ScheduleTab
          lessons={lessons}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          currentWeek={currentWeek}
          setCurrentWeek={setCurrentWeek}
          currentTime={currentTime}
          attendance={childAttendance}
          homework={homework}
          userRole="parent"
          openAttendanceModal={() => {}}
          setSelectedHomework={setSelectedHomework}
          setShowHomeworkModal={setShowHomeworkModal}
          fillEmptyPeriods={(lessons) => lessons}
          currentUser={{ fullName: child?.childName, name: child?.childName }}
        />
      )
    }

    if (defaultTab === 'homework') {
      return (
        <ParentHomeworkTab
          homework={homework}
          homeworkSubmissions={homeworkSubmissions}
          setSelectedHomework={setSelectedHomework}
          setShowHomeworkModal={setShowHomeworkModal}
        />
      )
    }

    if (defaultTab === 'grades') {
      const gradesBySubject = getGradesBySubject(childGrades)
      const academicAverage = childGrades.length > 0 
        ? (childGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / childGrades.length).toFixed(2)
        : '0.00'

      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          <Card className="lg:col-span-1">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center text-sm sm:text-lg">
                
                Átlagok
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-4">
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {academicAverage}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tantárgyi átlag</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowChartModal(true)}>
                  <h4 className="font-medium mb-3 text-center">Tantárgyak átlagai</h4>
                  <div className="relative h-48">
                    <svg viewBox="0 0 400 120" className="w-full h-full">
                      {Object.entries(
                        childGrades.reduce((acc, grade) => {
                          const subject = grade.subject || 'Egyéb'
                          if (!acc[subject]) acc[subject] = []
                          acc[subject].push(grade)
                          return acc
                        }, {} as Record<string, any[]>)
                      ).slice(0, 10).map(([subject, subjectGrades]: [string, any[]], index: number) => {
                        const average = subjectGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / subjectGrades.length
                        const barHeight = (average / 5) * 80
                        const x = 30 + index * 35
                        const color = average >= 4 ? '#10b981' : average >= 3 ? '#f59e0b' : '#ef4444'
                        return (
                          <g key={subject}>
                            <rect x={x} y={100 - barHeight} width="20" height={barHeight} fill={color} rx="2" />
                            <text x={x + 10} y={115} textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-600 dark:text-gray-400">
                              {subject.slice(0, 4)}
                            </text>
                            <text x={x + 10} y={95 - barHeight} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
                              {average.toFixed(1)}
                            </text>
                          </g>
                        )
                      })}
                      <line x1="25" y1="100" x2="385" y2="100" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
                      {[1, 2, 3, 4, 5].map(grade => (
                        <g key={grade}>
                          <line x1="20" y1={100 - (grade / 5) * 80} x2="25" y2={100 - (grade / 5) * 80} stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
                          <text x="18" y={100 - (grade / 5) * 80 + 3} textAnchor="end" fontSize="8" fill="currentColor" className="text-gray-600 dark:text-gray-400">{grade}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Szűrés tantárgy szerint:</h5>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedSubject(null)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedSubject === null
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                          }`}
                      >
                        Összes
                      </button>
                      {Object.keys(
                        childGrades.reduce((acc, grade) => {
                          const subject = grade.subject || 'Egyéb'
                          acc[subject] = true
                          return acc
                        }, {} as Record<string, boolean>)
                      ).map(subject => (
                        <button
                          key={subject}
                          onClick={() => setSelectedSubject(subject)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedSubject === subject
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                            }`}
                        >
                          {subject.length > 8 ? subject.slice(0, 8) + '...' : subject}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(
                      childGrades.reduce((acc, grade) => {
                        const subject = grade.subject || 'Egyéb'
                        if (!acc[subject]) acc[subject] = []
                        acc[subject].push(grade)
                        return acc
                      }, {} as Record<string, any[]>)
                    ).filter(([subject]) => selectedSubject === null || subject === selectedSubject).map(([subject, subjectGrades]: [string, any[]]) => {
                      const average = subjectGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / subjectGrades.length
                      return (
                        <div key={subject} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm text-gray-900 dark:text-white truncate block">{subject}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{subjectGrades.length} jegy</span>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${average >= 4 ? 'bg-green-500' : average >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${(average / 5) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-lg text-gray-900 dark:text-white min-w-[2.5rem] text-right">{average.toFixed(1)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-lg">Jegyek részletesen</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-6">
                {Object.entries(
                  childGrades.reduce((acc, grade) => {
                    const subject = grade.subject || 'Egyéb'
                    if (!acc[subject]) acc[subject] = []
                    acc[subject].push(grade)
                    return acc
                  }, {} as Record<string, any[]>)
                ).filter(([subject]) => selectedSubject === null || subject === selectedSubject).map(([subject, subjectGrades]: [string, any[]]) => {
                  const average = subjectGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / subjectGrades.length
                  return (
                    <div key={subject} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{subject}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{subjectGrades.length} jegy</span>
                          <span className={`px-3 py-1 rounded-full text-white font-bold text-sm ${average >= 4 ? 'bg-green-500' : average >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                            Átlag: {average.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-3">
                        {subjectGrades.map((grade, index) => (
                          <div key={index} className="group relative flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 ${
                              (grade.grade || 0) >= 4 ? 'bg-green-500 hover:bg-green-600' :
                              (grade.grade || 0) >= 3 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'
                              }`}>
                              {grade.grade || 'N/A'}
                            </div>
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                              <div className="font-medium">{new Date(grade.date || grade.createdAt).toLocaleDateString('hu-HU')}</div>
                              <div className="text-gray-300">{grade.title || 'Jegy'}</div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (defaultTab === 'attendance') {
      const absences = childAttendance.filter((att: any) => !att.present)
      // Szűrjük ki azokat a hiányzásokat, amelyekre már beküldtük az igazolást
      const availableAbsences = absences.filter(att => !att.excused && !submittedExcuses.includes(att.id))
      
      return (
        <div className="space-y-6">
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="mt-2 text-sm text-gray-600">Betöltés...</p>
            </div>
          )}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-sm sm:text-lg">
                
                <span className="text-xs sm:text-base">Igazolás küldése - {child?.childName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableAbsences.length === 0 ? (
                <div className="text-center py-8">
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Nincs igazolandó hiányzás.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Válaszd ki az igazolandó hiányzásokat:</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {availableAbsences.map((att, index) => (
                        <label key={index} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedAbsences.includes(att.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAbsences([...selectedAbsences, att.id])
                              } else {
                                setSelectedAbsences(selectedAbsences.filter(id => id !== att.id))
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">
                            {new Date(att.date).toLocaleDateString('hu-HU')} - {att.subject}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Igazolás típusa:</label>
                <select
                  value={excuseForm.excuseType}
                  onChange={(e) => setExcuseForm({...excuseForm, excuseType: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Válassz típust</option>
                  <option value="betegség">Betegség</option>
                  <option value="orvosi">Orvosi vizsgálat</option>
                  <option value="családi">Családi ok</option>
                  <option value="egyéb">Egyéb</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Indoklás:</label>
                <Textarea
                  value={excuseForm.description}
                  onChange={(e) => setExcuseForm({...excuseForm, description: e.target.value})}
                  placeholder="Rövid indoklás..."
                  rows={3}
                />
              </div>
              
                  <Button onClick={submitExcuse} className="w-full" disabled={loading || selectedAbsences.length === 0}>
                    
                    {loading ? 'Küldés...' : 'Igazolás elküldése'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-sm sm:text-lg">
                
                <span className="text-xs sm:text-base">Összes mulasztás - {child?.childName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="text-xs sm:text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Dátum</TableHead>
                    <TableHead>Tárgy</TableHead>
                    <TableHead>Státusz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absences.map((att, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(att.date).toLocaleDateString('hu-HU')}</TableCell>
                      <TableCell>{att.subject}</TableCell>
                      <TableCell>
                        <Badge variant={att.excused ? "secondary" : "destructive"} className={att.excused ? "bg-green-500 text-white" : ""}>
                          {att.excused ? 'Igazolt' : 'Hiányzó'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (defaultTab === 'behavior') {
      return (
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-sm sm:text-lg">
                
                <span className="text-xs sm:text-base">Dicséret és figyelmeztetés - {child?.childName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recognitions.length > 0 ? (
                <div className="space-y-3">
                  {recognitions.map(rec => (
                    <div key={rec.id} className={`p-3 rounded-lg border-l-4 ${
                      rec.type === 'dicseret' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium text-sm ${
                            rec.type === 'dicseret' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                          }`}>
                            {rec.type === 'dicseret' ? 'Dicséret' : 'Figyelmeztetés'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {rec.level === 'szaktanari' ? 'Szaktanári' : 
                             rec.level === 'osztalyfonoki' ? 'Osztályfőnöki' : 'Igazgatói'}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(rec.createdAt).toLocaleDateString('hu-HU')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{rec.reason}</p>
                      {rec.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Rögzítette: {rec.recordedByName}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Még nem került sor viselkedési bejegyzésre.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    // Default overview - gyermek profil kártya hozzáadása
    return (
      <div className="space-y-6">
        {/* Gyermek profil kártya */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-sm sm:text-lg">
              
              <span className="text-xs sm:text-base">Gyermek profil</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-50 dark:from-emerald-900/20 dark:to-emerald-900/20 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold overflow-hidden border-4 border-white/30 shadow-lg">
                {child?.profileImage ? (
                  <img
                    src={child.profileImage}
                    alt="Gyermek profilképe"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-emerald-600">
                    {(child?.childName || 'G').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{child?.childName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{child?.childClass} • OM: {child?.childStudentId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-sm sm:text-lg">
                
                <span className="text-xs sm:text-base">Legutóbbi jegyek - {child?.childName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="text-xs sm:text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Tárgy</TableHead>
                    <TableHead>Jegy</TableHead>
                    <TableHead>Dátum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childGrades.slice(0, 5).map((grade, index) => (
                    <TableRow key={index}>
                      <TableCell>{grade.subject || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-white ${(grade.grade || 0) >= 4 ? 'bg-green-500' :
                          (grade.grade || 0) >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                          {grade.grade || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(grade.createdAt || grade.date).toLocaleDateString('hu-HU')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-sm sm:text-lg">
                
                <span className="text-xs sm:text-base">Legutóbbi mulasztások - {child?.childName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="text-xs sm:text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Dátum</TableHead>
                    <TableHead>Tárgy</TableHead>
                    <TableHead>Státusz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childAttendance.filter((att: any) => !att.present).slice(0, 5).map((att, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(att.date).toLocaleDateString('hu-HU')}</TableCell>
                      <TableCell>{att.subject}</TableCell>
                      <TableCell>
                        <Badge variant={att.excused ? "secondary" : "destructive"} className={att.excused ? "bg-green-500 text-white" : ""}>
                          {att.excused ? 'Igazolt' : 'Hiányzó'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!child) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-400">Még nincs hozzáadott gyermek.</p>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              Gyermek hozzáadásához lépjen az admin felhasználóhoz, és regisztrálja a diákot.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {renderContent()}
      <ChartModal
        isOpen={showChartModal}
        onClose={() => setShowChartModal(false)}
        grades={childGrades}
      />
      <HomeworkModal
        isOpen={showHomeworkModal}
        onClose={() => setShowHomeworkModal(false)}
        homework={selectedHomework}
        userRole="parent"
      />
    </div>
  )
}