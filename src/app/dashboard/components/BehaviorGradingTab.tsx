'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { Modal } from '@/shared/components/ui/modal'
import { UserCheck, Calendar, Award, X } from 'lucide-react'

interface BehaviorGradingTabProps {
  currentUser: any
  allUsers: any[]
  showAlert: (msg: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => void
}

export function BehaviorGradingTab({ currentUser, allUsers, showAlert }: BehaviorGradingTabProps) {
  const [students, setStudents] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [gradeType, setGradeType] = useState<'Magatartás' | 'Szorgalom'>('Magatartás')
  const [studentGrades, setStudentGrades] = useState<{ [key: string]: string }>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [existingGrades, setExistingGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const months = [
    { value: '2025-09', label: '2025 Szeptember' },
    { value: '2025-10', label: '2025 Október' },
    { value: '2025-11', label: '2025 November' },
    { value: '2025-12', label: '2025 December' },
    { value: '2026-01', label: '2026 Január' },
    { value: '2026-02', label: '2026 Február' },
    { value: '2026-03', label: '2026 Március' },
    { value: '2026-04', label: '2026 Április' },
    { value: '2026-05', label: '2026 Május' },
    { value: '2026-06', label: '2026 Június' }
  ]

  const behaviorComments = {
    'Magatartás': {
      5: 'példás',
      4: 'jó', 
      3: 'változó',
      2: 'rossz'
    },
    'Szorgalom': {
      5: 'példás',
      4: 'jó',
      3: 'változó', 
      2: 'hanyag'
    }
  }

  useEffect(() => {
    if (currentUser?.role === 'homeroom_teacher' && allUsers && allUsers.length > 0) {
      // Szűrés az osztályfőnök osztályára
      const classStudents = allUsers.filter(user => 
        (user.role === 'student' || user.role === 'dj') && 
        user.class === currentUser.class
      )
      setStudents(classStudents)
      loadExistingGrades()
    }
  }, [currentUser?.class, allUsers?.length])

  const loadStudents = async () => {
    // Már nem szükséges, az allUsers prop-ból szűrünk
  }

  const loadExistingGrades = async () => {
    if (!currentUser?.class) return
    
    try {
      const response = await fetch(`/api/academic/grades?className=${currentUser.class}&subject=Magatartás&subject=Szorgalom`, {
        headers: {
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email
        }
      })
      if (response.ok) {
        const data = await response.json()
        setExistingGrades(data)
      }
    } catch (error) {
      console.error('Failed to load existing grades:', error)
    }
  }

  const handleStudentGradeChange = (studentId: string, grade: string) => {
    setStudentGrades(prev => ({
      ...prev,
      [studentId]: grade
    }))
  }

  const handleGradeSubmit = async () => {
    if (!selectedMonth) {
      showAlert('Válassz hónapot!', 'warning')
      return
    }

    const studentsWithGrades = students.filter(student => 
      studentGrades[student.id] && studentGrades[student.id] !== ''
    )

    if (studentsWithGrades.length === 0) {
      showAlert('Legalább egy diáknak adj jegyet!', 'warning')
      return
    }

    // Ellenőrizzük, hogy van-e már jegy erre a hónapra
    const conflictingGrades = studentsWithGrades.filter(student => 
      existingGrades.find(g => 
        g.studentId === student.id && 
        g.subject === gradeType && 
        g.type === selectedMonth
      )
    )

    if (conflictingGrades.length > 0) {
      showAlert(`${conflictingGrades.length} diáknak már van ${gradeType} jegye erre a hónapra!`, 'warning')
      return
    }

    setLoading(true)
    try {
      const promises = studentsWithGrades.map(student => {
        const grade = studentGrades[student.id]
        const gradeData = {
          studentId: student.id,
          studentName: student.fullName || student.name,
          studentClass: student.class || currentUser.class,
          subject: gradeType,
          grade: parseInt(grade),
          title: `${gradeType.charAt(0).toUpperCase() + gradeType.slice(1)} - ${selectedMonth.split('-')[1]}. hónap`,
          description: behaviorComments[gradeType][grade as keyof typeof behaviorComments[typeof gradeType]],
          teacherId: currentUser.id,
          teacherName: currentUser.fullName || currentUser.name,
          date: new Date().toISOString(),
          type: selectedMonth,
          comment: behaviorComments[gradeType][grade as keyof typeof behaviorComments[typeof gradeType]],
          className: currentUser.class,
          isBehaviorGrade: true
        }

        return fetch('/api/academic/grades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser.role,
            'x-user-id': currentUser.id,
            'x-user-email': currentUser.email
          },
          body: JSON.stringify(gradeData)
        })
      })

      const results = await Promise.all(promises)
      const failedCount = results.filter(result => !result.ok).length
      
      if (failedCount === 0) {
        showAlert(`${gradeType.charAt(0).toUpperCase() + gradeType.slice(1)} jegyek sikeresen rögzítve ${studentsWithGrades.length} diák számára!`, 'success')
        setSelectedMonth('')
        setStudentGrades({})
        setIsModalOpen(false)
        loadExistingGrades()
      } else {
        showAlert(`${studentsWithGrades.length - failedCount} jegy rögzítve, ${failedCount} sikertelen`, 'warning')
      }
    } catch (error) {
      showAlert('Hiba történt a jegyek rögzítése során', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGrade = async (gradeId: string, studentName: string, subject: string, month: string) => {
    if (!confirm(`Biztosan törölni szeretnéd ${studentName} ${subject} jegyét (${month}. hónap)?`)) {
      return
    }

    try {
      const response = await fetch('/api/academic/grades', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({ id: gradeId })
      })

      if (response.ok) {
        showAlert('Jegy sikeresen törölve!', 'success')
        loadExistingGrades()
      } else {
        const error = await response.json()
        showAlert(error.error || 'Hiba történt a jegy törlése során', 'error')
      }
    } catch (error) {
      showAlert('Hiba történt a jegy törlése során', 'error')
    }
  }

  const getStudentGrades = (studentId: string, type: 'Magatartás' | 'Szorgalom') => {
    return existingGrades.filter(g => g.studentId === studentId && g.subject === type)
  }

  if (currentUser?.role !== 'homeroom_teacher') {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="text-center py-8 text-gray-500">
          <p>Csak osztályfőnökök adhatnak magatartás és szorgalom jegyeket.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-blue-600" />
            Magatartás és Szorgalom Értékelés
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Osztály: {currentUser.class} • Havonta egy-egy jegy adható • Tanulók száma: {students.length}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => {
                setGradeType('Magatartás')
                setIsModalOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Magatartás jegy
            </Button>
            <Button
              onClick={() => {
                setGradeType('Szorgalom')
                setIsModalOpen(true)
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Award className="h-4 w-4 mr-2" />
              Szorgalom jegy
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-700 dark:text-blue-300">Magatartás jegyek</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.map(student => {
                    const grades = getStudentGrades(student.id, 'Magatartás')
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="font-medium text-sm">{student.fullName || student.name}</span>
                        <div className="flex gap-1">
                          {grades.length === 0 ? (
                            <span className="text-xs text-gray-500">Nincs jegy</span>
                          ) : (
                            grades.map((grade, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <Badge className="bg-blue-500 text-white text-xs">
                                  {grade.type?.split('-')[1] || 'N/A'}. hó: {grade.grade}
                                </Badge>
                                <button
                                  onClick={() => handleDeleteGrade(grade.id, student.fullName || student.name, 'Magatartás', grade.type?.split('-')[1] || 'N/A')}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Jegy törlése"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-green-700 dark:text-green-300">Szorgalom jegyek</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.map(student => {
                    const grades = getStudentGrades(student.id, 'Szorgalom')
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="font-medium text-sm">{student.fullName || student.name}</span>
                        <div className="flex gap-1">
                          {grades.length === 0 ? (
                            <span className="text-xs text-gray-500">Nincs jegy</span>
                          ) : (
                            grades.map((grade, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <Badge className="bg-green-500 text-white text-xs">
                                  {grade.type?.split('-')[1] || 'N/A'}. hó: {grade.grade}
                                </Badge>
                                <button
                                  onClick={() => handleDeleteGrade(grade.id, student.fullName || student.name, 'Szorgalom', grade.type?.split('-')[1] || 'N/A')}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Jegy törlése"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setStudentGrades({})
        }}
        title={`${gradeType.charAt(0).toUpperCase() + gradeType.slice(1)} jegyek adása`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Hónap *</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Válassz hónapot" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Diákok jegyei ({Object.values(studentGrades).filter(grade => grade && grade !== '').length}/{students.length} diák)
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-96 overflow-y-auto dark:border-gray-600">
              <div className="space-y-3">
                {students.map(student => {
                  const currentGrade = studentGrades[student.id] || ''
                  const hasExistingGrade = selectedMonth && existingGrades.find(g => 
                    g.studentId === student.id && 
                    g.subject === gradeType && 
                    g.type === selectedMonth
                  )
                  
                  return (
                    <div key={student.id} className={`flex items-center justify-between p-3 rounded-lg ${
                      hasExistingGrade ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <div className="flex-1">
                        <span className="text-sm font-medium">{student.fullName || student.name}</span>
                        {hasExistingGrade && (
                          <p className="text-xs text-red-600 dark:text-red-400">Már van jegy erre a hónapra</p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-4">
                        <button
                          type="button"
                          onClick={() => handleStudentGradeChange(student.id, '')}
                          disabled={!!hasExistingGrade}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            currentGrade === ''
                              ? 'bg-gray-400 text-white'
                              : hasExistingGrade
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                          }`}
                        >
                          -
                        </button>
                        {[2, 3, 4, 5].map(grade => (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => handleStudentGradeChange(student.id, grade.toString())}
                            disabled={!!hasExistingGrade}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              currentGrade === grade.toString()
                                ? grade >= 4 ? 'bg-green-600 text-white' : grade >= 3 ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                                : hasExistingGrade
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                            }`}
                            title={`${grade} - ${behaviorComments[gradeType][grade as keyof typeof behaviorComments[typeof gradeType]]}`}
                          >
                            {grade}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false)
              setStudentGrades({})
            }} disabled={loading}>
              Mégse
            </Button>
            <Button 
              onClick={handleGradeSubmit} 
              disabled={loading || Object.values(studentGrades).filter(grade => grade && grade !== '').length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Rögzítés...' : `${Object.values(studentGrades).filter(grade => grade && grade !== '').length} jegy rögzítése`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}