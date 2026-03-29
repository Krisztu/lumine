'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
interface TeacherDashboardProps {
  lessons: any[]
  grades: any[]
  currentUser: any
  allUsers: any[]
}

export function TeacherDashboard({ lessons, grades, currentUser, allUsers }: TeacherDashboardProps) {
  const teacherClasses = [...new Set(lessons.map(l => l.Class))].sort()
  const teacherStudents = allUsers.filter(u => 
    (u.role === 'student' || u.role === 'dj') && 
    teacherClasses.includes(u.class)
  )

  const avgGrade = grades.length > 0 
    ? (grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length).toFixed(2)
    : '0.00'

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            
            Osztályaim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600">{teacherClasses.length}</div>
          <p className="text-xs text-gray-500 mt-1">{teacherClasses.join(', ')}</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            
            Diákjaim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{teacherStudents.length}</div>
          <p className="text-xs text-gray-500 mt-1">Összes diák</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            
            Átlag jegy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600">{avgGrade}</div>
          <p className="text-xs text-gray-500 mt-1">{grades.length} jegy</p>
        </CardContent>
      </Card>
    </div>
  )
}
