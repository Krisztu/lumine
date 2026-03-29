'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useState, useEffect } from 'react'

interface ClassOverviewTabProps {
  allUsers: Array<{ 
    id: string; 
    fullName: string; 
    name: string; 
    class: string; 
    role: string;
    phone?: string;
    address?: string;
    email?: string;
  }>
  currentUser?: any
  grades?: any[]
}

export function ClassOverviewTab({ allUsers, currentUser, grades = [] }: ClassOverviewTabProps) {
  const [studentGrades, setStudentGrades] = useState<any[]>([])
  
  // Csak az átadott felhasználókat jelenítjük meg (már szűrve vannak)
  const classStudents = allUsers.filter(u => u.role === 'student' || u.role === 'dj')
  const classTeachers = allUsers.filter(u => u.role === 'teacher' || u.role === 'homeroom_teacher')
  
  useEffect(() => {
    if (currentUser && currentUser.role === 'homeroom_teacher') {
      loadStudentGrades()
    }
  }, [currentUser])
  
  const loadStudentGrades = async () => {
    try {
      const teacherName = currentUser.fullName || currentUser.name
      const response = await fetch(`/api/grades?teacherName=${encodeURIComponent(teacherName)}`)
      if (response.ok) {
        const gradesData = await response.json()
        setStudentGrades(gradesData)
      }
    } catch (error) {
      console.error('Jegyek betöltése sikertelen:', error)
    }
  }
  
  const getStudentGrades = (studentName: string) => {
    return studentGrades.filter(grade => grade.studentName === studentName)
  }

  if (allUsers.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="text-center py-8 text-gray-500">
          <p>Nincsenek adatok</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Diákok ({classStudents.length})</p>
        <div className="space-y-3">
          {classStudents.map((student, index) => (
            <div key={student.id || student.email || `student-${index}`} className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {student.fullName || student.name}
                </span>
                <div className="flex gap-1">
                  {student.role === 'dj' && <Badge className="bg-yellow-500 text-xs">DJ</Badge>}
                </div>
              </div>
              {currentUser?.role === 'homeroom_teacher' && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Jegyeim:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getStudentGrades(student.fullName || student.name).length > 0 ? (
                      getStudentGrades(student.fullName || student.name).map((grade, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs mb-1">
                          <span className={`px-2 py-1 rounded text-white font-bold ${
                            grade.grade >= 4 ? 'bg-green-500' : 
                            grade.grade >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {grade.grade}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            {grade.subject}
                          </span>
                          <span className="text-gray-500 text-xs">
                            ({grade.title})
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">Nincs jegy</span>
                    )}
                  </div>
                </div>
              )}
              {student.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  
                  <span>{student.phone}</span>
                </div>
              )}
              {student.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  
                  <span>{student.address}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
