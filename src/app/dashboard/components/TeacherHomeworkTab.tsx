'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Badge } from '@/shared/components/ui/badge'
import { FileText, Users, Calendar } from 'lucide-react'
import { useState } from 'react'
import { StudentSubmissionModal } from './StudentSubmissionModal'

interface TeacherHomeworkTabProps {
  homework: any[]
  homeworkForm: any
  setHomeworkForm: (form: any) => void
  selectedClass: string
  setSelectedClass: (cls: string) => void
  lessons: any[]
  currentUser: any
  user: any
  loadHomework: () => Promise<void>
  showAlert: (msg: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => void
  setSelectedHomework: (hw: any) => void
  setShowHomeworkModal: (show: boolean) => void
}

export function TeacherHomeworkTab({
  homework,
  homeworkForm,
  setHomeworkForm,
  selectedClass,
  setSelectedClass,
  lessons,
  currentUser,
  user,
  loadHomework,
  showAlert,
  setSelectedHomework,
  setShowHomeworkModal
}: TeacherHomeworkTabProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  
  // Tanár tantárgyai az adott osztályban
  const teacherSubjects = (() => {
    if (!lessons || lessons.length === 0 || !selectedClass) return []
    const teacherName = currentUser?.fullName || currentUser?.name
    const teacherLessons = lessons.filter(lesson => 
      (lesson.teacherName === teacherName || lesson.Teacher === teacherName) && 
      (lesson.className === selectedClass || lesson.Class === selectedClass)
    )
    return [...new Set(teacherLessons.map(lesson => lesson.subject || lesson.Subject))].filter(Boolean).sort()
  })()
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
      <Card className="lg:col-span-1 border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Házi feladat kiadása</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Osztály</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value)
                setSelectedSubject('') // Töröljük a tantárgy kiválasztást osztályváltáskor
              }}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="">Válassz osztályt</option>
              {(() => {
                const teacherName = currentUser?.fullName || currentUser?.name
                const teacherLessons = lessons.filter(lesson => lesson.Teacher === teacherName)
                const teacherClasses = [...new Set(teacherLessons.map(lesson => lesson.Class))]
                return teacherClasses.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))
              })()}
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
          
          <div>
            <label className="block text-sm font-medium mb-1">Cím</label>
            <Input
              type="text"
              value={homeworkForm.title}
              onChange={(e) => setHomeworkForm({ ...homeworkForm, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
              placeholder="pl. Matematika feladatok"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Leírás</label>
            <Textarea
              value={homeworkForm.description}
              onChange={(e) => setHomeworkForm({ ...homeworkForm, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
              rows={4}
              placeholder="Részletes leírás a feladról..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Határidő</label>
            <input
              type="date"
              value={homeworkForm.dueDate}
              onChange={(e) => setHomeworkForm({ ...homeworkForm, dueDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            />
          </div>
          <Button
            onClick={async () => {
              if (!selectedClass) {
                showAlert('Válassz osztályt!', 'warning')
                return
              }
              if (!homeworkForm.title || !homeworkForm.description || !homeworkForm.dueDate) {
                showAlert('Töltsd ki az összes mezőt!', 'warning')
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
                  showAlert('Több tantárgyat tanítasz ebben az osztályban. Válaszd ki melyikből adsz házi feladatot!', 'warning')
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
                const lessonId = `Általános_00:00_${selectedClass}`
                const teacherId = currentUser?.id || user?.uid || user?.email

                const response = await fetch('/api/academic/homework', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'x-user-role': currentUser?.role || 'teacher',
                    'x-user-id': currentUser?.id || user?.uid || '',
                    'x-user-email': currentUser?.email || user?.email || ''
                  },
                  body: JSON.stringify({
                    title: homeworkForm.title,
                    description: homeworkForm.description,
                    dueDate: homeworkForm.dueDate,
                    teacherId: teacherId,
                    teacherName: currentUser?.fullName || currentUser?.name,
                    subject: subjectToUse,
                    className: selectedClass,
                    lessonId: lessonId,
                    attachments: []
                  })
                })

                if (response.ok) {
                  showAlert('Házi feladat sikeresen kiadva!', 'success')
                  setHomeworkForm({ title: '', description: '', dueDate: '', lessonId: '', attachments: [] })
                  setSelectedSubject('')
                  loadHomework()
                } else {
                  showAlert('Hiba a házi feladat kiadása során', 'error')
                }
              } catch (error) {
                showAlert('Hiba történt', 'error')
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            Házi feladat kiadása
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Kiadott házi feladatok</h3>
        </div>
        
        {homework.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="text-center py-8 text-gray-500">
              <p>Nincs kiadott házi feladat.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {homework.map(hw => {
              const isOverdue = new Date(hw.dueDate) < new Date()
              const submissionCount = hw.submissions?.length || 0
              const evaluatedCount = hw.submissions?.filter((s: any) => s.grade || s.status === 'completed').length || 0
              
              return (
                <Card key={hw.id} className="border-l-4 border-green-500 bg-white/5 hover:bg-white/10 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-900 dark:text-white">{hw.title}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {hw.className} • {hw.subject}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {submissionCount} beadás
                        </Badge>
                        {evaluatedCount > 0 && (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white">
                            {evaluatedCount} értékelve
                          </Badge>
                        )}
                        {isOverdue && (
                          <Badge className="bg-red-500 hover:bg-red-600 text-white">
                            Lejárt
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {hw.submissions && hw.submissions.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Beadások ({hw.submissions.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {hw.submissions.slice(0, 8).map((submission: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedSubmission({ ...submission, homeworkTitle: hw.title })
                                setShowSubmissionModal(true)
                              }}
                              className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                            >
                              {submission.studentName}
                            </button>
                          ))}
                          {hw.submissions.length > 8 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">+{hw.submissions.length - 8}</span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Határidő: {new Date(hw.dueDate).toLocaleDateString('hu-HU')}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedHomework(hw)
                            setShowHomeworkModal(true)
                          }}
                          className="border-gray-300 dark:border-gray-600"
                        >
                          Feladat részletei
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
      
      <StudentSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        submission={selectedSubmission}
        homeworkTitle={selectedSubmission?.homeworkTitle || ''}
        onUpdateSubmissionStatus={async (submissionId, status) => {
          try {
            await fetch('/api/homework-submissions', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ submissionId: submissionId, status })
            })
            await loadHomework()
            showAlert('Státusz frissítve!', 'success')
          } catch (error) {
            showAlert('Hiba történt', 'error')
          }
        }}
      />
    </div>
  )
}
