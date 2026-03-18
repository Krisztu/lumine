'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { X } from 'lucide-react'

interface ClassGradeModalProps {
  isOpen: boolean
  onClose: () => void
  selectedClass: string
  students: any[]
  currentUser: any
  lessons: any[]
  showAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => void
  loadGrades: (user: any) => Promise<void>
  allUsers: any[]
  teacherClasses: string[]
}

export function ClassGradeModal({
  isOpen,
  onClose,
  selectedClass: initialSelectedClass,
  students,
  currentUser,
  lessons,
  showAlert,
  loadGrades,
  allUsers,
  teacherClasses
}: ClassGradeModalProps) {
  const [selectedClass, setSelectedClass] = useState(initialSelectedClass)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [studentGrades, setStudentGrades] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')

  useEffect(() => {
    setSelectedClass(initialSelectedClass)
  }, [initialSelectedClass])

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

  const classStudents = allUsers.filter(user => 
    (user.role === 'student' || user.role === 'dj') &&
    user.class === selectedClass &&
    lessons.length > 0 &&
    lessons.some(lesson => {
      const teacherName = currentUser?.fullName || currentUser?.name
      return (lesson.teacherName === teacherName || lesson.Teacher === teacherName) && 
             (lesson.className === selectedClass || lesson.Class === selectedClass)
    })
  )

  const handleStudentGradeChange = (studentName: string, grade: string) => {
    setStudentGrades(prev => ({
      ...prev,
      [studentName]: grade
    }))
  }

  const handleSubmit = async () => {
    if (!title) {
      showAlert('Add meg a jegy típusát!', 'warning')
      return
    }

    const studentsWithGrades = classStudents.filter(student => 
      studentGrades[student.fullName || student.name] && 
      studentGrades[student.fullName || student.name] !== ''
    )

    if (studentsWithGrades.length === 0) {
      showAlert('Legalább egy diáknak adj jegyet!', 'warning')
      return
    }

    setIsSubmitting(true)

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
        setIsSubmitting(false)
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
        setIsSubmitting(false)
        return
      } else {
        // Ha egyáltalán nem tanít az osztályban
        showAlert(`Nem tanítasz a(z) ${selectedClass} osztályban!`, 'error')
        setIsSubmitting(false)
        return
      }
    }

    if (!subjectToUse) {
      showAlert('Tantárgy meghatározása sikertelen!', 'error')
      setIsSubmitting(false)
      return
    }

    try {
      const promises = studentsWithGrades.map(student => {
        const studentName = student.fullName || student.name
        const grade = studentGrades[studentName]
        
        return fetch('/api/academic/grades', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-role': currentUser?.role || 'teacher',
            'x-user-id': currentUser?.id || '',
            'x-user-email': currentUser?.email || ''
          },
          body: JSON.stringify({
            studentName,
            studentClass: selectedClass,
            subject: subjectToUse,
            grade,
            title,
            description,
            teacherName: currentUser?.fullName || currentUser?.name
          })
        })
      })

      const results = await Promise.all(promises)
      const failedCount = results.filter(result => !result.ok).length
      
      if (failedCount === 0) {
        showAlert(`Jegyek sikeresen rögzítve ${studentsWithGrades.length} diák számára!`, 'success')
        await loadGrades(currentUser)
        onClose()
        setTitle('')
        setDescription('')
        setStudentGrades({})
        setSelectedSubject('')
      } else {
        showAlert(`${studentsWithGrades.length - failedCount} jegy rögzítve, ${failedCount} sikertelen`, 'warning')
      }
    } catch (error) {
      showAlert('Hiba történt a jegyek rögzítése során', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const gradesCount = Object.values(studentGrades).filter(grade => grade && grade !== '').length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Osztály jegyírás
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Osztály *</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setStudentGrades({})
                  setSelectedSubject('') // Töröljük a tantárgy kiválasztást osztályváltáskor
                }}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Válassz osztályt</option>
                {teacherClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Típus *</label>
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Válassz típust</option>
                <option value="Dolgozat">Dolgozat</option>
                <option value="Felelet">Felelet</option>
                <option value="Házi dolgozat">Házi dolgozat</option>
                <option value="Beadandó">Beadandó</option>
              </select>
            </div>
          </div>

          {teacherSubjects.length > 1 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Tantárgy <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
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

          <div>
            <label className="block text-sm font-medium mb-1">Megjegyzés</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              rows={2}
              placeholder="Opcionális megjegyzés"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Diákok jegyei ({gradesCount}/{classStudents.length} diák)
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-96 overflow-y-auto dark:border-gray-600">
              {!selectedClass ? (
                <p className="text-gray-500 text-sm">Válassz osztályt</p>
              ) : classStudents.length === 0 ? (
                <p className="text-gray-500 text-sm">Nincs diák ebben az osztályban</p>
              ) : (
                <div className="space-y-3">
                  {classStudents.map(student => {
                    const studentName = student.fullName || student.name
                    const currentGrade = studentGrades[studentName] || ''
                    
                    return (
                      <div key={student.id || student.email} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium flex-1">{studentName}</span>
                        <div className="flex gap-1 ml-4">
                          <button
                            type="button"
                            onClick={() => handleStudentGradeChange(studentName, '')}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              currentGrade === ''
                                ? 'bg-gray-400 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                            }`}
                          >
                            -
                          </button>
                          {[1, 2, 3, 4, 5].map(grade => (
                            <button
                              key={grade}
                              type="button"
                              onClick={() => handleStudentGradeChange(studentName, grade.toString())}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                currentGrade === grade.toString()
                                  ? grade >= 4 ? 'bg-green-600 text-white' : grade >= 3 ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                              }`}
                            >
                              {grade}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Mégse
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || gradesCount === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Rögzítés...' : `${gradesCount} jegy rögzítése`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}