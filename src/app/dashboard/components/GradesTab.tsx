'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { BookOpen, Award, AlertTriangle, Star, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'

interface GradesTabProps {
  grades: any[]
  selectedSubject: string | null
  setSelectedSubject: (subject: string | null) => void
  setShowChartModal: (show: boolean) => void
  currentUser?: any
  showAlert?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
}

export function GradesTab({
  grades,
  selectedSubject,
  setSelectedSubject,
  setShowChartModal,
  currentUser,
  showAlert
}: GradesTabProps) {
  const [monthlyBehavior, setMonthlyBehavior] = useState<any[]>([])
  const [recognitions, setRecognitions] = useState<any[]>([])

  useEffect(() => {
    if (currentUser?.id) {
      loadMonthlyBehavior()
      loadRecognitions()
    }
  }, [currentUser?.id])

  const loadMonthlyBehavior = async () => {
    try {
      const response = await fetch(`/api/behavior/monthly?studentId=${currentUser?.id}`)
      if (response.ok) {
        const data = await response.json()
        setMonthlyBehavior(data)
      } else {
        showAlert?.('Havi értékelések betöltése sikertelen', 'error')
      }
    } catch (error) {
      showAlert?.('Havi értékelések betöltése sikertelen', 'error')
    }
  }

  const loadRecognitions = async () => {
    try {
      const response = await fetch(`/api/behavior/recognition?studentId=${currentUser?.id}`)
      if (response.ok) {
        const data = await response.json()
        setRecognitions(data)
      } else {
        showAlert?.('Dicséret/figyelmeztetés betöltése sikertelen', 'error')
      }
    } catch (error) {
      showAlert?.('Dicséret/figyelmeztetés betöltése sikertelen', 'error')
    }
  }

  // Kombinált jegyek: normál jegyek + havi viselkedési értékelések külön tantárgyakként
  const behaviorGrades = monthlyBehavior.flatMap(mb => [
    {
      id: `szorgalom-${mb.id}`,
      subject: 'Szorgalom',
      grade: mb.szorgalom,
      date: mb.createdAt,
      title: `${mb.month}. hónap`,
      teacherName: mb.teacherName,
      type: 'monthly'
    },
    {
      id: `magatartas-${mb.id}`,
      subject: 'Magatartás',
      grade: mb.magatartas,
      date: mb.createdAt,
      title: `${mb.month}. hónap`,
      teacherName: mb.teacherName,
      type: 'monthly'
    }
  ])

  const allGrades = [...grades, ...behaviorGrades]
  
  // Tantárgyi átlag (viselkedési jegyek nélkül)
  const academicGrades = grades
  const academicAverage = academicGrades.length > 0 
    ? (academicGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / academicGrades.length).toFixed(2)
    : '0.00'
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
      <Card className="lg:col-span-1">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center text-sm sm:text-lg">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Átlagok
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {academicAverage}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tantárgyi átlag</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowChartModal(true)}>
              <h4 className="font-medium mb-3 text-center">Tantárgyak átlagai</h4>
              <div className="relative h-48">
                <svg viewBox="0 0 400 120" className="w-full h-full">
                  {Object.entries(
                    allGrades.reduce((acc, grade) => {
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
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      }`}
                  >
                    Összes
                  </button>
                  {Object.keys(
                    allGrades.reduce((acc, grade) => {
                      const subject = grade.subject || 'Egyéb'
                      acc[subject] = true
                      return acc
                    }, {} as Record<string, boolean>)
                  ).map(subject => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedSubject === subject
                        ? 'bg-blue-500 text-white shadow-sm'
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
                  allGrades.reduce((acc, grade) => {
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
          {/* Dicséret/Figyelmeztetés szekció */}
          {recognitions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Dicséret és Figyelmeztetés
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recognitions.map((recognition) => (
                  <div
                    key={recognition.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      recognition.type === 'praise'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {recognition.type === 'praise' ? (
                        <Star className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-medium ${
                            recognition.type === 'praise' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                          }`}>
                            {recognition.type === 'praise' ? 'Dicséret' : 'Figyelmeztetés'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(recognition.createdAt).toLocaleDateString('hu-HU')}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {recognition.reason}
                        </p>
                        {recognition.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {recognition.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Rögzítette: {recognition.teacherName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {Object.entries(
              allGrades.reduce((acc, grade) => {
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
                          grade.type === 'monthly' 
                            ? (grade.subject === 'Szorgalom' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-indigo-500 hover:bg-indigo-600')
                            : ((grade.grade || 0) >= 4 ? 'bg-green-500 hover:bg-green-600' :
                              (grade.grade || 0) >= 3 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600')
                          }`}>
                          {grade.type === 'monthly' && grade.subject === 'Szorgalom' && <Heart className="h-4 w-4" />}
                          {grade.type === 'monthly' && grade.subject === 'Magatartás' && <Star className="h-4 w-4" />}
                          {grade.type !== 'monthly' && (grade.grade || 'N/A')}
                          {grade.type === 'monthly' && (
                            <span className="absolute -bottom-1 -right-1 bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {grade.grade}
                            </span>
                          )}
                        </div>
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                          <div className="font-medium">{new Date(grade.date).toLocaleDateString('hu-HU')}</div>
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
