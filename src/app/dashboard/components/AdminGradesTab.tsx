'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { BarChart3 } from 'lucide-react'

interface AdminGradesTabProps {
  grades: any[]
  allUsers: any[]
  availableClasses: any[]
  selectedClass: string
  setSelectedClass: (cls: string) => void
  gradeForm: any
  setGradeForm: (form: any) => void
  loadGrades: (user: any) => Promise<void>
  showAlert: (msg: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => void
}

export function AdminGradesTab({
  grades,
  allUsers,
  availableClasses,
  selectedClass,
  setSelectedClass,
  gradeForm,
  setGradeForm,
  loadGrades,
  showAlert
}: AdminGradesTabProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-lg">Jegyek kezelése</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Osztály szűrő</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
              >
                <option value="">Összes osztály</option>
                {availableClasses.map(cls => (
                  <option key={cls.name} value={cls.name}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Diák szűrő</label>
              <select
                value={gradeForm.student}
                onChange={(e) => setGradeForm({ ...gradeForm, student: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
              >
                <option value="">Összes diák</option>
                {allUsers.filter(user =>
                  (user.role === 'student' || user.role === 'dj') &&
                  (!selectedClass || user.class === selectedClass)
                ).map((student, index) => (
                  <option key={index} value={student.fullName || student.name}>
                    {student.fullName || student.name} ({student.class})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {allUsers.filter(student => {
              const matchesClass = !selectedClass || student.class === selectedClass
              const matchesStudent = !gradeForm.student || (student.fullName || student.name) === gradeForm.student
              return (student.role === 'student' || student.role === 'dj') && matchesClass && matchesStudent
            }).map(student => {
              const studentGrades = grades.filter(grade => grade.studentName === (student.fullName || student.name))
              const average = studentGrades.length > 0 ?
                (studentGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / studentGrades.length).toFixed(2) : '0.00'

              return (
                <div key={student.email} className="glass-card border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{student.fullName || student.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{student.class}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${parseFloat(average) >= 4 ? 'text-green-600' :
                        parseFloat(average) >= 3 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {average}
                      </div>
                      <div className="text-xs text-gray-500">{studentGrades.length} jegy</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {studentGrades.map(grade => (
                      <div key={grade.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <span className="text-sm font-medium">{grade.title}</span>
                          <span className="text-xs text-gray-500 ml-2">{new Date(grade.date).toLocaleDateString('hu-HU')}</span>
                          <span className="text-xs text-gray-500 ml-2">({grade.teacherName})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-white font-bold text-sm ${(grade.grade || 0) >= 4 ? 'bg-green-500' :
                            (grade.grade || 0) >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                            {grade.grade}
                          </span>
                          <button
                            onClick={async () => {
                              if (confirm(`Biztosan törlöd ezt a jegyet?\\n\\n${grade.studentName} - ${grade.title}: ${grade.grade}\\nTanár: ${grade.teacherName}`)) {
                                try {
                                  const response = await fetch(`/api/grades?id=${grade.id}`, {
                                    method: 'DELETE'
                                  })
                                  if (response.ok) {
                                    showAlert('Jegy törölve!', 'success')
                                    loadGrades(null)
                                  } else {
                                    showAlert('Hiba a törlés során', 'error')
                                  }
                                } catch (error) {
                                  showAlert('Hiba történt', 'error')
                                }
                              }
                            }}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
