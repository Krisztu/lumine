'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Phone, MapPin, Users, BookOpen, BarChart3 } from 'lucide-react'
import { ClassOverviewTab } from './ClassOverviewTab'

interface HomeRoomTeacherDashboardProps {
  lessons: any[]
  grades: any[]
  currentUser: any
  allUsers: any[]
}

// Segédfüggvény: megkeresi azokat a tanárokat, akik tanítják az adott osztályt
function getTeachersForClass(className: string, allUsers: any[], lessons: any[]) {
  if (!className || !lessons || lessons.length === 0) return []
  
  // Megkeressük azokat a tanárokat, akiknek van órájuk ezzel az osztállyal
  const teacherLessons = lessons.filter(lesson => {
    const lessonClass = lesson.className || lesson.Class
    return lessonClass === className
  })
  
  // Csoportosítjuk tanár név szerint
  const teacherSubjects = teacherLessons.reduce((acc, lesson) => {
    const teacherName = lesson.teacherName || lesson.Teacher
    const subject = lesson.subject || lesson.Subject
    if (teacherName && subject) {
      if (!acc[teacherName]) acc[teacherName] = new Set()
      acc[teacherName].add(subject)
    }
    return acc
  }, {} as Record<string, Set<string>>)
  
  // Megkeressük a tanár objektumokat és hozzáadjuk a tantárgyakat
  return allUsers
    .filter(user => 
      (user.role === 'teacher' || user.role === 'homeroom_teacher') &&
      teacherSubjects[user.fullName || user.name]
    )
    .map(teacher => ({
      ...teacher,
      classSubjects: Array.from(teacherSubjects[teacher.fullName || teacher.name] || []).join(', ')
    }))
}

export function HomeRoomTeacherDashboard({ lessons, grades, currentUser, allUsers }: HomeRoomTeacherDashboardProps) {
  const teacherClass = currentUser?.class
  const classStudents = allUsers.filter(u => 
    (u.role === 'student' || u.role === 'dj') && 
    u.class === teacherClass
  )

  const avgGrade = grades.length > 0 
    ? (grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length).toFixed(2)
    : '0.00'

  return (
    <div className="space-y-6">
      {/* Statisztikák */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Osztályom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{teacherClass || 'N/A'}</div>
            <p className="text-xs text-gray-500 mt-1">Osztályfőnök</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Diákjaim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{classStudents.length}</div>
            <p className="text-xs text-gray-500 mt-1">Összes diák</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Átlag jegy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{avgGrade}</div>
            <p className="text-xs text-gray-500 mt-1">{grades.length} jegy</p>
          </CardContent>
        </Card>
      </div>

      {/* Osztály áttekintés */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Osztályom részletei</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassOverviewTab 
            allUsers={classStudents}
            currentUser={currentUser}
            grades={grades}
          />
        </CardContent>
      </Card>
    </div>
  )
}