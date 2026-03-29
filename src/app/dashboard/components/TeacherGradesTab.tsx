'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Badge } from '@/shared/components/ui/badge'
import { useState, useMemo, useEffect } from 'react'

interface TeacherGradesTabProps {
  grades: any[]
  allUsers: any[]
  currentUser: any
  selectedClass: string
  setSelectedClass: (value: string) => void
  gradeForm: any
  setGradeForm: (value: any) => void
  loadGrades: (user: any) => Promise<void>
  showAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => void
  setShowClassGradeModal: (value: boolean) => void
  lessons?: any[]
}

export function TeacherGradesTab({
  grades,
  allUsers,
  currentUser,
  selectedClass,
  setSelectedClass,
  gradeForm,
  setGradeForm,
  loadGrades,
  showAlert,
  setShowClassGradeModal,
  lessons = []
}: TeacherGradesTabProps) {
  const [newGrade, setNewGrade] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [viewSelectedClass, setViewSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  const teacherClasses = useMemo(() => {
    if (!lessons || lessons.length === 0) return []
    const teacherName = currentUser?.fullName || currentUser?.name
    const teacherLessons = lessons.filter(lesson => 
      lesson.teacherName === teacherName || lesson.Teacher === teacherName
    )
    return [...new Set(teacherLessons.map(lesson => lesson.className || lesson.Class))].filter(Boolean).sort()
  }, [lessons, currentUser])

  // Tanár tantárgyai az adott osztályban
  const teacherSubjects = useMemo(() => {
    if (!lessons || lessons.length === 0 || !selectedClass) return []
    const teacherName = currentUser?.fullName || currentUser?.name
    const teacherLessons = lessons.filter(lesson => 
      (lesson.teacherName === teacherName || lesson.Teacher === teacherName) && 
      (lesson.className === selectedClass || lesson.Class === selectedClass)
    )
    return [...new Set(teacherLessons.map(lesson => lesson.subject || lesson.Subject))].filter(Boolean).sort()
  }, [lessons, currentUser, selectedClass])

  // Automatikusan beállítja az osztályfőnök osztályát alapértelmezettének
  useEffect(() => {
    if (currentUser?.role === 'homeroom_teacher' && currentUser?.class && !selectedClass && teacherClasses.length > 0) {
      // Ha az osztályfőnök osztálya benne van a tanított osztályokban, azt válassza ki alapértelmezettként
      if (teacherClasses.includes(currentUser.class)) {
        setSelectedClass(currentUser.class)
      }
    }
  }, [currentUser, selectedClass, setSelectedClass, teacherClasses])

  const teacherStudents = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return []
    
    // Mind az osztályfőnökök, mind a sima tanárok csak azokat a diákokat látják, akiknek van órájuk velük
    if (selectedClass && lessons.length > 0) {
      const teacherName = currentUser?.fullName || currentUser?.name
      const teacherLessons = lessons.filter(lesson => 
        (lesson.teacherName === teacherName || lesson.Teacher === teacherName) && 
        (lesson.className === selectedClass || lesson.Class === selectedClass)
      )
      
      // Ha van órája ezzel az osztállyal, akkor az osztály összes diákja
      if (teacherLessons.length > 0) {
        return allUsers.filter(user => 
          (user.role === 'student' || user.role === 'dj') &&
          user.class === selectedClass
        )
      }
    }
    
    return []
  }, [allUsers, selectedClass, currentUser, lessons])

  const viewStudents = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return []
    
    // Mind az osztályfőnökök, mind a sima tanárok csak azokat a diákokat látják, akiknek van órájuk velük
    if (viewSelectedClass && lessons.length > 0) {
      const teacherName = currentUser?.fullName || currentUser?.name
      const teacherLessons = lessons.filter(lesson => 
        (lesson.teacherName === teacherName || lesson.Teacher === teacherName) && 
        (lesson.className === viewSelectedClass || lesson.Class === viewSelectedClass)
      )
      
      // Ha van órája ezzel az osztállyal, akkor az osztály összes diákja
      if (teacherLessons.length > 0) {
        return allUsers.filter(user => 
          (user.role === 'student' || user.role === 'dj') &&
          user.class === viewSelectedClass
        )
      }
    }
    
    return []
  }, [allUsers, viewSelectedClass, currentUser, lessons])

  const teacherGrades = useMemo(() => {
    return grades
  }, [grades])



  const handleAddGrade = async () => {
    if (!selectedStudent || !newGrade || !newTitle) {
      showAlert('Töltsd ki az összes kötelező mezőt!', 'warning')
      return
    }

    if (!selectedClass) {
      showAlert('Osztály megadása szükséges!', 'warning')
      return
    }

    // Tantárgy meghatározása - CSAK azokból a tantárgyakból, amelyeket a tanár tanít az adott osztályban
    let subjectToUse = ''
    
    if (selectedSubject) {
      // Ha van kiválasztott tantárgy, ellenőrizzük hogy valóban tanítja-e az adott osztályban
      const teacherName = currentUser?.fullName || currentUser?.name
      const hasLessonInSubject = lessons.some(lesson => 
        (lesson.teacherName === teacherName || lesson.Teacher === teacherName) && 
        (lesson.className === selectedClass || lesson.Class === selectedClass) &&
        (lesson.subject === selectedSubject || lesson.Subject === selectedSubject)
      )
      
      if (hasLessonInSubject) {
        subjectToUse = selectedSubject
      } else {
        showAlert(`Nem tanítod a(z) ${selectedSubject} tantárgyat a(z) ${selectedClass} osztályban!`, 'error')
        return
      }
    } else {
      // Ha nincs kiválasztott tantárgy, próbáljuk meg automatikusan meghatározni
      const teacherName = currentUser?.fullName || currentUser?.name
      const teacherLessonsInClass = lessons.filter(lesson => 
        (lesson.teacherName === teacherName || lesson.Teacher === teacherName) && 
        (lesson.className === selectedClass || lesson.Class === selectedClass)
      )
      
      if (teacherLessonsInClass.length === 1) {
        // Ha csak egy tantárgyat tanít az osztályban, azt használjuk
        subjectToUse = teacherLessonsInClass[0].subject || teacherLessonsInClass[0].Subject
      } else if (teacherLessonsInClass.length > 1) {
        // Ha több tantárgyat tanít, kötelező kiválasztani
        showAlert('Több tantárgyat tanítasz ebben az osztályban. Válaszd ki melyikből adsz jegyet!', 'warning')
        return
      } else {
        // Ha egyáltalán nem tanít az osztályban
        showAlert(`Nem tanítasz a(z) ${selectedClass} osztályban!`, 'error')
        return
      }
    }

    if (!subjectToUse) {
      showAlert('Tantárgy meghatározása sikertelen!', 'error')
      return
    }

    try {
      const response = await fetch('/api/academic/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: selectedStudent,
          studentClass: selectedClass,
          subject: subjectToUse,
          grade: newGrade,
          title: newTitle,
          description: newDescription,
          teacherName: currentUser?.fullName || currentUser?.name
        })
      })

      if (response.ok) {
        showAlert(`Jegy rögzítve: ${selectedStudent} - ${newGrade} (${newTitle})`, 'success')
        setSelectedStudent('')
        setNewGrade('')
        setNewTitle('')
        setNewDescription('')
        setSelectedSubject('')
        await loadGrades(currentUser)
      } else {
        const errorData = await response.json()
        showAlert(errorData.error || 'Hiba a jegy rögzítése során', 'error')
      }
    } catch (error) {
      showAlert('Hiba történt', 'error')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Jegy beírása</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Osztály (jegy adáshoz)</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value)
                setSelectedSubject('') // Töröljük a tantárgy kiválasztást osztályváltáskor
              }}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="">Válassz osztályt</option>
              {teacherClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            {selectedClass && teacherStudents.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Nincs órád ezzel az osztállyal
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Diák</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="">Válassz diákot</option>
              {teacherStudents.map(student => (
                <option key={student.id || student.email} value={student.fullName || student.name}>
                  {student.fullName || student.name} {student.class ? `(${student.class})` : ''}
                </option>
              ))}
            </select>
          </div>

          {teacherSubjects.length > 1 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Tantárgy <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                required
              >
                <option value="">Válassz tantárgyat</option>
                {teacherSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <p className="text-xs text-red-500 mt-1">
                Kötelező kiválasztani! ({teacherSubjects.length} tantárgy közül)
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1">Jegy</label>
              <select
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
              >
                <option value="">Jegy</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Típus</label>
              <select
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
              >
                <option value="">Típus</option>
                <option value="Dolgozat">Dolgozat</option>
                <option value="Felelet">Felelet</option>
                <option value="Házi dolgozat">Házi dolgozat</option>
                <option value="Beadandó">Beadandó</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Megjegyzés</label>
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
              rows={2}
              placeholder="Opcionális megjegyzés"
            />
          </div>

          <Button
            onClick={handleAddGrade}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            size="sm"
          >
            Jegy rögzítése
          </Button>

          <Button
            onClick={() => {
              setShowClassGradeModal(true)
            }}
            className="w-full bg-green-600 hover:bg-green-700 mt-2"
            size="sm"
          >
            Osztály jegyírás
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Diákjaim jegyei
              <select
                value={viewSelectedClass}
                onChange={(e) => setViewSelectedClass(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
              >
                <option value="">Összes osztály</option>
                {teacherClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nincs diák az osztályaidban.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {viewStudents.map(student => {
                  const studentGrades = teacherGrades.filter(grade => grade.studentName === (student.fullName || student.name))
                  
                  // Tantárgyak szerint csoportosítás
                  const gradesBySubject = studentGrades.reduce((acc, grade) => {
                    const subject = grade.subject || 'Egyéb'
                    if (!acc[subject]) acc[subject] = []
                    acc[subject].push(grade)
                    return acc
                  }, {} as Record<string, any[]>)
                  
                  const overallAverage = studentGrades.length > 0 ?
                    (studentGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / studentGrades.length).toFixed(2) : '0.00'

                  return (
                    <div key={student.id || student.email} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{student.fullName || student.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{student.class}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${parseFloat(overallAverage) >= 4 ? 'text-green-600' :
                            parseFloat(overallAverage) >= 3 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {overallAverage}
                          </div>
                          <div className="text-xs text-gray-500">{studentGrades.length} jegy</div>
                        </div>
                      </div>
                      
                      {/* Tantárgyak szerint csoportosított jegyek */}
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {Object.keys(gradesBySubject).length === 0 ? (
                          <div className="text-center text-xs text-gray-500 py-2">Nincs jegy</div>
                        ) : (
                          Object.entries(gradesBySubject).map(([subject, subjectGrades]) => {
                            const subjectAverage = (subjectGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / subjectGrades.length).toFixed(1)
                            return (
                              <div key={subject} className="bg-white dark:bg-gray-800 rounded p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-900 dark:text-white">{subject}</span>
                                  <span className={`text-xs font-bold px-2 py-1 rounded text-white ${
                                    parseFloat(subjectAverage) >= 4 ? 'bg-green-500' :
                                    parseFloat(subjectAverage) >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}>
                                    {subjectAverage}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {subjectGrades.map(grade => {
                                    const canDelete = grade.teacherName === (currentUser?.fullName || currentUser?.name)
                                    return (
                                      <div key={grade.id} className="flex items-center gap-1">
                                        <span className={`px-1.5 py-0.5 rounded text-white font-bold text-xs ${
                                          (grade.grade || 0) >= 4 ? 'bg-green-500' :
                                          (grade.grade || 0) >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}>
                                          {grade.grade}
                                        </span>
                                        <span className="text-xs text-gray-600 dark:text-gray-400" title={`${grade.title} - ${new Date(grade.date).toLocaleDateString('hu-HU')}`}>
                                          {grade.title.length > 8 ? grade.title.substring(0, 8) + '...' : grade.title}
                                        </span>
                                        {canDelete && (
                                          <button
                                            onClick={async () => {
                                              if (confirm('Biztosan törlöd ezt a jegyet?')) {
                                                try {
                                                  const response = await fetch('/api/academic/grades', {
                                                    method: 'DELETE',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ id: grade.id })
                                                  })
                                                  if (response.ok) {
                                                    showAlert('Jegy törölve!', 'success')
                                                    await loadGrades(currentUser)
                                                  } else {
                                                    showAlert('Hiba a jegy törlése során', 'error')
                                                  }
                                                } catch (error) {
                                                  showAlert('Hiba történt', 'error')
                                                }
                                              }
                                            }}
                                            className="text-red-500 hover:text-red-700 text-xs"
                                            title="Jegy törlése"
                                          >
                                            ×
                                          </button>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}